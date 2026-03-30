import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createSetupIntent, bindPolicy } from '../lib/api';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
);

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

function CheckoutForm({ quote, customerId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: stripeError, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      const result = await bindPolicy(quote.id, customerId, setupIntent.payment_method);
      navigate('/success', { state: result });
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <div className="mt-4 bg-red-900/30 border border-red-700 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className={`btn-primary w-full mt-6 ${processing ? 'opacity-50 cursor-wait' : ''}`}
      >
        {processing ? 'Binding your policy…' : `Bind Policy — ${formatCurrency(quote.premiumAnnual)}/yr`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);

  const data = location.state;

  useEffect(() => {
    if (!data) return;

    createSetupIntent(data.quote?.email || '', data.customerId)
      .then((res) => {
        setClientSecret(res.clientSecret);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-4">No quote selected</h2>
          <button onClick={() => navigate('/get-quote')} className="btn-primary">Start Over</button>
        </div>
      </div>
    );
  }

  const { quote, customerId } = data;

  return (
    <div className="min-h-screen bg-navy-950">
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <a href="/" className="font-display font-bold text-xl">
          SHIELD<span className="text-volt">WAVE</span>
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Summary */}
          <div className="md:col-span-2">
            <h2 className="font-display text-2xl font-bold mb-6">Policy Summary</h2>
            <div className="card space-y-4">
              <div>
                <p className="text-navy-400 text-sm">Carrier</p>
                <p className="font-display font-bold text-lg">{quote.carrierName}</p>
              </div>
              <div>
                <p className="text-navy-400 text-sm">Coverage</p>
                <p className="font-bold">{quote.lineOfBusiness === 'GL' ? 'General Liability' : 'Business Owners Policy'}</p>
              </div>
              <div>
                <p className="text-navy-400 text-sm">Premium</p>
                <p className="font-display text-2xl font-bold text-volt">{formatCurrency(quote.premiumAnnual)}<span className="text-sm text-navy-400">/yr</span></p>
              </div>
              <div>
                <p className="text-navy-400 text-sm">Limits</p>
                <p>{formatCurrency(quote.coverageLimits?.perOccurrence || 1000000)} / {formatCurrency(quote.coverageLimits?.aggregate || 2000000)}</p>
              </div>
              {quote.deductible > 0 && (
                <div>
                  <p className="text-navy-400 text-sm">Deductible</p>
                  <p>{formatCurrency(quote.deductible)}</p>
                </div>
              )}
            </div>
            <p className="text-navy-500 text-xs mt-4">
              Payment is processed directly by the carrier. ShieldWave never holds your premium dollars.
            </p>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-3">
            <h2 className="font-display text-2xl font-bold mb-6">Payment</h2>
            <div className="card">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-navy-700 border-t-volt rounded-full animate-spin" />
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#c8ee44' } } }}>
                  <CheckoutForm quote={quote} customerId={customerId} />
                </Elements>
              ) : (
                <p className="text-navy-400 text-center py-12">Unable to initialize payment. Please try again.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
