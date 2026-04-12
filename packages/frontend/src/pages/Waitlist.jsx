import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { track, setPersonProperties, getDistinctId } from '../lib/analytics';

const REVENUE_LABELS = {
  'under50k': 'Under $50K',
  '50k-100k': '$50K – $100K',
  '100k-250k': '$100K – $250K',
  '250k-500k': '$250K – $500K',
  '500k+': '$500K+',
};

const EMPLOYEE_LABELS = {
  solo: 'Just me',
  '2-5': '2–5 people',
  '6-10': '6–10 people',
  '10+': '10+ people',
};

export default function Waitlist() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!data?.intake) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No submission found</h2>
          <button onClick={() => navigate('/get-quote')} className="btn-primary">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const { intake } = data;

  const handleConfirm = async () => {
    setSubmitting(true);

    const payload = {
      email: intake.email || '',
      name: intake.contactFirstName
        ? `${intake.contactFirstName} ${intake.contactLastName}`
        : '',
      businessName: intake.businessName || '',
      state: intake.state || '',
      annualRevenue: intake.annualRevenue || '',
      employeeCount: intake.employeeCount || '',
      services: intake.services || [],
      distinctId: getDistinctId(),
    };

    setPersonProperties({
      annual_revenue: payload.annualRevenue,
      employee_count: payload.employeeCount,
      business_name: payload.businessName,
      state: payload.state,
      services: payload.services,
    });

    track('waitlist_joined', {
      state: payload.state,
      annual_revenue: payload.annualRevenue,
      employee_count: payload.employeeCount,
      services: payload.services,
    });

    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Non-blocking — still show confirmation
    }
    setConfirmed(true);
    setSubmitting(false);
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
            We'll reach out to <strong className="text-slate-700">{intake.email}</strong> the
            moment your coverage is ready.
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

  const revenueLabel = REVENUE_LABELS[intake.annualRevenue] || intake.annualRevenue;
  const employeeLabel = EMPLOYEE_LABELS[intake.employeeCount] || intake.employeeCount;

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
            Launching soon in {intake.state || 'your state'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Thanks, {intake.contactFirstName || 'there'} — we've got your info
          </h1>
          <p className="text-slate-500 leading-relaxed">
            We're still finalizing carrier partnerships in your area. Join the priority list and
            we'll send you a real quote the moment coverage goes live.
          </p>
        </div>

        {/* Intake Summary */}
        <div className="card mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Your submission</h3>
          <dl className="space-y-3 text-sm">
            {intake.businessName && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Business</dt>
                <dd className="text-slate-900 font-medium text-right">{intake.businessName}</dd>
              </div>
            )}
            {intake.state && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Location</dt>
                <dd className="text-slate-900 font-medium text-right">
                  {intake.city ? `${intake.city}, ` : ''}{intake.state}
                </dd>
              </div>
            )}
            {intake.services?.length > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Services</dt>
                <dd className="text-slate-900 font-medium text-right">
                  {intake.services.join(', ')}
                </dd>
              </div>
            )}
            {employeeLabel && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Team size</dt>
                <dd className="text-slate-900 font-medium text-right">{employeeLabel}</dd>
              </div>
            )}
            {revenueLabel && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Annual revenue</dt>
                <dd className="text-slate-900 font-medium text-right">{revenueLabel}</dd>
              </div>
            )}
          </dl>
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
                <p className="text-slate-900 text-sm font-medium">We finalize carriers in your state</p>
                <p className="text-slate-500 text-xs">Completing partnership agreements with our underwriters.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-brand-700 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-slate-900 text-sm font-medium">You get your real quote</p>
                <p className="text-slate-500 text-xs">We email you actual carrier pricing — no fake numbers.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-brand-700 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-slate-900 text-sm font-medium">Bind & get your COI</p>
                <p className="text-slate-500 text-xs">One-click binding once you've reviewed the real quote.</p>
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
          No commitment. We'll email you when coverage is live in your area.
        </p>
      </div>
    </div>
  );
}
