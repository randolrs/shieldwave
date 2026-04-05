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
          <label className="text-slate-600 text-sm font-medium block mb-1.5">Card number</label>
          <GlowInput placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-slate-600 text-sm font-medium block mb-1.5">Expiry</label>
            <GlowInput placeholder="12/28" defaultValue="12/28" />
          </div>
          <div>
            <label className="text-slate-600 text-sm font-medium block mb-1.5">CVC</label>
            <GlowInput placeholder="123" defaultValue="123" />
          </div>
        </div>
      </div>
      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-500 text-xs">
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

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
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
          // Would load real Stripe here
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No quote selected</h2>
          <button onClick={() => navigate('/get-quote')} className="btn-primary">Start Over</button>
        </div>
      </div>
    );
  }

  const { quote, customerId } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto">
        <a href="/" className="font-display font-bold text-lg text-slate-900">
          shield<span className="text-brand-600">wave</span>
        </a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Summary */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Policy summary</h2>
            <div className="card space-y-4">
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Carrier</p>
                <p className="font-semibold text-slate-900 text-lg mt-0.5">{quote.carrierName}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Coverage</p>
                <p className="font-medium text-slate-900 mt-0.5">{quote.lineOfBusiness === 'GL' ? 'General Liability' : 'Business Owners Policy'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Premium</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{formatCurrency(quote.premiumAnnual)}<span className="text-sm text-slate-400 font-normal">/yr</span></p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Limits</p>
                <p className="text-slate-900 mt-0.5">{formatCurrency(quote.coverageLimits?.perOccurrence || 1000000)} / {formatCurrency(quote.coverageLimits?.aggregate || 2000000)}</p>
              </div>
              {quote.deductible > 0 && (
                <div>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Deductible</p>
                  <p className="text-slate-900 mt-0.5">{formatCurrency(quote.deductible)}</p>
                </div>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-4 leading-relaxed">
              Payment is processed directly by the carrier. ShieldWave never holds your premium dollars.
            </p>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-3">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Payment</h2>
            <div className="card">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin" />
                </div>
              ) : useDemo ? (
                <DemoPaymentForm quote={quote} customerId={customerId} />
              ) : (
                <p className="text-slate-500 text-center py-12">Unable to initialize payment. Please try again.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
