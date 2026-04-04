import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createSetupIntent, bindPolicy } from '../lib/api';
import GlowInput from '../components/GlowInput';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

function DemoPaymentForm({ quote, customerId }) {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate bind delay for demo
    setTimeout(() => {
      navigate('/success', {
        state: {
          policy: {
            id: crypto.randomUUID(),
            carrierName: quote.carrierName,
            carrierPolicyId: `POL-${Date.now()}`,
            premium: quote.premiumAnnual,
            effectiveDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 365 * 86400000).toISOString(),
            status: 'active',
          },
          coiUrl: null,
        },
      });
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="text-navy-400 text-sm block mb-1">Card number</label>
          <GlowInput placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-navy-400 text-sm block mb-1">Expiry</label>
            <GlowInput placeholder="12/28" defaultValue="12/28" />
          </div>
          <div>
            <label className="text-navy-400 text-sm block mb-1">CVC</label>
            <GlowInput placeholder="123" defaultValue="123" />
          </div>
        </div>
      </div>
      <div className="mt-4 bg-navy-800 border border-navy-600 px-4 py-3 text-navy-400 text-xs">
        Demo mode — no real charges. Connect Stripe to enable live payments.
      </div>
      <button
        type="submit"
        disabled={processing}
        className={`btn-primary w-full mt-6 ${processing ? 'opacity-50 cursor-wait' : ''}`}
      >
        {processing ? 'Binding your policy…' : `Bind Policy — ${formatCurrency(quote.premiumAnnual)}/yr`}
      </button>
    </form>
  );
}

let stripePromise = null;

function getStripePromise() {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (key && key.startsWith('pk_')) {
      import('@stripe/stripe-js').then(({ loadStripe }) => {
        stripePromise = loadStripe(key);
      });
    }
  }
  return stripePromise;
}

function StripePaymentForm({ quote, customerId, clientSecret }) {
  const [StripeComponents, setStripeComponents] = useState(null);
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    import('@stripe/react-stripe-js').then((mod) => {
      setStripeComponents(mod);
    });
  }, []);

  if (!StripeComponents) {
    return <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-navy-700 border-t-volt rounded-full animate-spin" />
    </div>;
  }

  const { Elements, PaymentElement, useStripe, useElements } = StripeComponents;

  return (
    <Elements stripe={getStripePromise()} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#c8ee44' } } }}>
      <InnerStripeForm quote={quote} customerId={customerId} />
    </Elements>
  );
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useDemo, setUseDemo] = useState(false);

  const data = location.state;

  useEffect(() => {
    if (!data) return;

    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!stripeKey || !stripeKey.startsWith('pk_')) {
      setUseDemo(true);
      setLoading(false);
      return;
    }

    createSetupIntent(data.quote?.email || '', data.customerId)
      .then((res) => {
        if (res.clientSecret && res.clientSecret !== 'demo_not_configured') {
          setClientSecret(res.clientSecret);
        } else {
          setUseDemo(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setUseDemo(true);
        setLoading(false);
      });
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
              ) : useDemo ? (
                <DemoPaymentForm quote={quote} customerId={customerId} />
              ) : clientSecret ? (
                <StripePaymentForm quote={quote} customerId={customerId} clientSecret={clientSecret} />
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
