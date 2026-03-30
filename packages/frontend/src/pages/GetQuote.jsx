import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitQuote } from '../lib/api';

const SERVICES = [
  'Pressure Washing', 'Soft Washing', 'Roof Cleaning', 'Concrete Cleaning',
  'Fleet Washing', 'Window Cleaning', 'Gutter Cleaning', 'House Washing',
];

const EMPLOYEE_OPTIONS = [
  { value: 'solo', label: 'Just me' },
  { value: '2-5', label: '2–5 people' },
  { value: '6-10', label: '6–10 people' },
  { value: '10+', label: '10+ people' },
];

const REVENUE_OPTIONS = [
  { value: 'under50k', label: 'Under $50K' },
  { value: '50k-100k', label: '$50K – $100K' },
  { value: '100k-250k', label: '$100K – $250K' },
  { value: '250k-500k', label: '$250K – $500K' },
  { value: '500k+', label: '$500K+' },
];

const TOTAL_STEPS = 8;

export default function GetQuote() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    businessName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    contactFirstName: '',
    contactLastName: '',
    email: '',
    phone: '',
    services: [],
    chemicalsUsed: null,
    employeeCount: '',
    annualRevenue: '',
    worksAtHeight: null,
    claimsHistory: { hasClaims: null, count: 0 },
  });

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const canAdvance = () => {
    switch (step) {
      case 1: return form.businessName && form.address && form.city && form.state && form.zip;
      case 2: return form.contactFirstName && form.contactLastName && form.email && form.phone;
      case 3: return form.services.length > 0;
      case 4: return form.chemicalsUsed !== null;
      case 5: return form.employeeCount !== '';
      case 6: return form.annualRevenue !== '';
      case 7: return form.worksAtHeight !== null;
      case 8: return form.claimsHistory.hasClaims !== null;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    // Submit
    setLoading(true);
    setError(null);
    try {
      const result = await submitQuote(form);
      navigate('/quotes', { state: result });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleService = (svc) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(svc)
        ? prev.services.filter((s) => s !== svc)
        : [...prev.services, svc],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-navy-700 border-t-volt rounded-full animate-spin mb-6" />
          <h2 className="font-display text-2xl font-bold mb-2">Shopping carriers for the best rates…</h2>
          <p className="text-navy-400">Comparing quotes from multiple insurers in real time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto w-full">
        <a href="/" className="font-display font-bold text-xl">
          SHIELD<span className="text-volt">WAVE</span>
        </a>
        <span className="font-mono text-sm text-navy-500">
          {step} / {TOTAL_STEPS}
        </span>
      </nav>

      {/* Progress Bar */}
      <div className="w-full bg-navy-900 h-1">
        <div
          className="bg-volt h-1 transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Step 1: Business Info */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">What's your business name?</h2>
              <p className="text-navy-400 mb-8">We'll use this to look up your info and pre-fill your application.</p>
              <div className="space-y-4">
                <input
                  className="input-field"
                  placeholder="Business name"
                  value={form.businessName}
                  onChange={(e) => update('businessName', e.target.value)}
                  autoFocus
                />
                <input
                  className="input-field"
                  placeholder="Street address"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                />
                <div className="grid grid-cols-6 gap-4">
                  <input
                    className="input-field col-span-3"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                  />
                  <input
                    className="input-field col-span-1"
                    placeholder="State"
                    maxLength={2}
                    value={form.state}
                    onChange={(e) => update('state', e.target.value.toUpperCase())}
                  />
                  <input
                    className="input-field col-span-2"
                    placeholder="ZIP"
                    maxLength={5}
                    value={form.zip}
                    onChange={(e) => update('zip', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">Your contact information</h2>
              <p className="text-navy-400 mb-8">So we can send you quotes and your COI.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="input-field"
                    placeholder="First name"
                    value={form.contactFirstName}
                    onChange={(e) => update('contactFirstName', e.target.value)}
                    autoFocus
                  />
                  <input
                    className="input-field"
                    placeholder="Last name"
                    value={form.contactLastName}
                    onChange={(e) => update('contactLastName', e.target.value)}
                  />
                </div>
                <input
                  className="input-field"
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
                <input
                  className="input-field"
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">What services do you offer?</h2>
              <p className="text-navy-400 mb-8">Select all that apply.</p>
              <div className="flex flex-wrap gap-3">
                {SERVICES.map((svc) => (
                  <button
                    key={svc}
                    onClick={() => toggleService(svc)}
                    className={`chip ${form.services.includes(svc) ? 'chip-selected' : ''}`}
                  >
                    {svc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Chemicals */}
          {step === 4 && (
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">
                Do you use sodium hypochlorite (bleach) or other chemicals?
              </h2>
              <p className="text-navy-400 mb-8">This helps us recommend the right pollution liability coverage.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => update('chemicalsUsed', true)}
                  className={`chip flex-1 py-4 text-lg ${form.chemicalsUsed === true ? 'chip-selected' : ''}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => update('chemicalsUsed', false)}
                  className={`chip flex-1 py-4 text-lg ${form.chemicalsUsed === false ? 'chip-selected' : ''}`}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Employees */}
          {step === 5 && (
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">
                How many people work in your business, including you?
              </h2>
              <p className="text-navy-400 mb-8">This determines if you need workers compensation.</p>
              <div className="grid grid-cols-2 gap-4">
                {EMPLOYEE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update('employeeCount', opt.value)}
                    className={`chip py-4 text-lg ${form.employeeCount === opt.value ? 'chip-selected' : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Revenue */}
          {step === 6 && (
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">Estimated annual revenue</h2>
              <p className="text-navy-400 mb-8">Used to calculate your general liability premium.</p>
              <div className="space-y-3">
                {REVENUE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update('annualRevenue', opt.value)}
                    className={`chip w-full py-4 text-lg text-left px-6 ${form.annualRevenue === opt.value ? 'chip-selected' : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Height */}
          {step === 7 && (
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">
                Do you work above 2 stories?
              </h2>
              <p className="text-navy-400 mb-8">Height work affects which carriers can cover you.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => update('worksAtHeight', true)}
                  className={`chip flex-1 py-4 text-lg ${form.worksAtHeight === true ? 'chip-selected' : ''}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => update('worksAtHeight', false)}
                  className={`chip flex-1 py-4 text-lg ${form.worksAtHeight === false ? 'chip-selected' : ''}`}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* Step 8: Claims */}
          {step === 8 && (
            <div>
              <h2 className="font-display text-3xl font-bold mb-2">
                Any insurance claims or lawsuits in the last 3 years?
              </h2>
              <p className="text-navy-400 mb-8">Be honest — it helps us find the right carrier for your situation.</p>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setForm((prev) => ({
                    ...prev,
                    claimsHistory: { ...prev.claimsHistory, hasClaims: true },
                  }))}
                  className={`chip flex-1 py-4 text-lg ${form.claimsHistory.hasClaims === true ? 'chip-selected' : ''}`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setForm((prev) => ({
                    ...prev,
                    claimsHistory: { hasClaims: false, count: 0 },
                  }))}
                  className={`chip flex-1 py-4 text-lg ${form.claimsHistory.hasClaims === false ? 'chip-selected' : ''}`}
                >
                  No
                </button>
              </div>
              {form.claimsHistory.hasClaims && (
                <div>
                  <label className="text-navy-400 text-sm mb-2 block">How many?</label>
                  <input
                    className="input-field w-32"
                    type="number"
                    min={1}
                    max={20}
                    value={form.claimsHistory.count || ''}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      claimsHistory: { ...prev.claimsHistory, count: parseInt(e.target.value) || 0 },
                    }))}
                  />
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 bg-red-900/30 border border-red-700 px-4 py-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              className={`text-navy-400 font-display font-medium ${step === 1 ? 'invisible' : 'hover:text-white'}`}
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canAdvance()}
              className={`btn-primary ${!canAdvance() ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              {step === TOTAL_STEPS ? 'Get My Quotes' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
