import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

const LINE_LABELS = {
  GL: 'General Liability',
  BOP: 'Business Owners Policy',
  WC: 'Workers Compensation',
  AUTO: 'Commercial Auto',
  UMBRELLA: 'Umbrella / Excess',
  POLLUTION: 'Pollution Liability',
};

export default function Waitlist() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No quote selected</h2>
          <button onClick={() => navigate('/get-quote')} className="btn-primary">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const { quote, intake } = data;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: intake?.email || '',
          name: intake?.contactFirstName
            ? `${intake.contactFirstName} ${intake.contactLastName}`
            : '',
          businessName: intake?.businessName || '',
          state: intake?.state || '',
          selectedPlan: quote?.lineOfBusiness || '',
          selectedCarrier: quote?.carrierName || '',
          premiumAnnual: quote?.premiumAnnual || 0,
          annualRevenue: intake?.annualRevenue || '',
          employeeCount: intake?.employeeCount || '',
        }),
      });
    } catch {
      // Non-blocking — still show confirmation
    }
    setConfirmed(true);
    setSubmitting(false);

    // Conversion tracking hook — fire your pixel here
    // e.g. window.gtag('event', 'conversion', { ... })
    // e.g. window.fbq('track', 'Lead', { ... })
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="flex items-center justify-between px-6 py-5 max-w-3xl mx-auto">
          <a href="/" className="font-display font-bold text-lg text-slate-900">
            shield<span className="text-brand-600">wave</span>
          </a>
        </nav>

        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">You're on the list!</h1>
          <p className="text-slate-500 text-lg mb-4 leading-relaxed">
            We'll notify you at <strong className="text-slate-700">{intake?.email}</strong> the moment
            coverage is available in your area.
          </p>
          <p className="text-slate-400 text-sm mb-10">
            Priority list members get first access and locked-in introductory rates.
          </p>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between px-6 py-5 max-w-3xl mx-auto">
        <a href="/" className="font-display font-bold text-lg text-slate-900">
          shield<span className="text-brand-600">wave</span>
        </a>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        {/* Status Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            Launching soon in your area
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            We're finalizing carrier partnerships in {intake?.state || 'your state'}
          </h1>
          <p className="text-slate-500 leading-relaxed">
            Your quote is ready — we just need to finish onboarding carriers in your area.
            Join the priority list and we'll lock in your rate.
          </p>
        </div>

        {/* Selected Quote Summary */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="font-semibold text-slate-900">{quote.carrierName}</span>
              <span className="ml-2 text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                {LINE_LABELS[quote.lineOfBusiness] || quote.lineOfBusiness}
              </span>
            </div>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
              Selected
            </span>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(quote.premiumAnnual)}
            </span>
            <span className="text-slate-400 text-sm">/year</span>
          </div>
          <p className="text-slate-400 text-sm">
            {formatCurrency(quote.premiumMonthly)}/mo &middot; {formatCurrency(quote.coverageLimits?.perOccurrence || 1000000)} per occurrence
          </p>
        </div>

        {/* What Happens Next */}
        <div className="card mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">What happens next</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-brand-700 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-slate-900 text-sm font-medium">We finalize your carrier</p>
                <p className="text-slate-500 text-xs">Completing partnership agreements in your state.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-brand-700 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-slate-900 text-sm font-medium">You get notified</p>
                <p className="text-slate-500 text-xs">Email when your coverage is ready to bind.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-brand-700 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-slate-900 text-sm font-medium">Bind & get your COI</p>
                <p className="text-slate-500 text-xs">One-click binding at the rate you see above.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className={`btn-primary w-full text-lg py-4 ${submitting ? 'opacity-50 cursor-wait' : ''}`}
        >
          {submitting ? 'Joining…' : 'Join the Priority List'}
        </button>
        <p className="text-slate-400 text-xs text-center mt-3">
          No commitment. We'll email you when coverage is live.
        </p>
      </div>
    </div>
  );
}
