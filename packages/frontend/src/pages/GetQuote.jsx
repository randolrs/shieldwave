import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitQuote } from '../lib/api';
import GlowInput from '../components/GlowInput';

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
      case 1: return form.businessName && form.address && form.city && form.state.length === 2 && /^\d{5}$/.test(form.zip);
      case 2: return form.contactFirstName && form.contactLastName && form.email.includes('@') && form.phone.replace(/\D/g, '').length >= 10;
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
    setLoading(true);
    setError(null);
    try {
      const cleaned = {
        ...form,
        businessName: form.businessName.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
        zip: form.zip.trim().replace(/\D/g, ''),
        contactFirstName: form.contactFirstName.trim(),
        contactLastName: form.contactLastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      };
      const result = await submitQuote(cleaned);
      navigate('/quotes', { state: { ...result, intake: cleaned } });
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin mb-6" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Shopping carriers for the best rates…</h2>
          <p className="text-slate-500">Comparing quotes from multiple insurers in real time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto w-full">
        <a href="/" className="font-display font-bold text-lg text-slate-900">
          shield<span className="text-brand-600">wave</span>
        </a>
        <span className="text-sm text-slate-400 font-medium">
          Step {step} of {TOTAL_STEPS}
        </span>
      </nav>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1">
        <div
          className="bg-brand-600 h-1 transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8 md:p-10">

            {/* Step 1: Business Info */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">What's your business name?</h2>
                <p className="text-slate-500 mb-8 text-sm">We'll use this to look up your info and pre-fill your application.</p>
                <div className="space-y-4">
                  <GlowInput
                    placeholder="Business name"
                    value={form.businessName}
                    onChange={(e) => update('businessName', e.target.value)}
                    autoFocus
                  />
                  <GlowInput
                    placeholder="Street address"
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                  />
                  <div className="grid grid-cols-6 gap-3">
                    <GlowInput
                      className="col-span-3"
                      placeholder="City"
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                    />
                    <GlowInput
                      className="col-span-1"
                      placeholder="ST"
                      maxLength={2}
                      value={form.state}
                      onChange={(e) => update('state', e.target.value.toUpperCase())}
                    />
                    <GlowInput
                      className="col-span-2"
                      placeholder="ZIP"
                      maxLength={5}
                      inputMode="numeric"
                      value={form.zip}
                      onChange={(e) => update('zip', e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your contact information</h2>
                <p className="text-slate-500 mb-8 text-sm">So we can send you quotes and your COI.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <GlowInput
                      placeholder="First name"
                      value={form.contactFirstName}
                      onChange={(e) => update('contactFirstName', e.target.value)}
                      autoFocus
                    />
                    <GlowInput
                      placeholder="Last name"
                      value={form.contactLastName}
                      onChange={(e) => update('contactLastName', e.target.value)}
                    />
                  </div>
                  <GlowInput
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                  />
                  <GlowInput
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
                <h2 className="text-2xl font-bold text-slate-900 mb-2">What services do you offer?</h2>
                <p className="text-slate-500 mb-8 text-sm">Select all that apply.</p>
                <div className="flex flex-wrap gap-2.5">
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
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Do you use bleach or other chemicals?
                </h2>
                <p className="text-slate-500 mb-8 text-sm">This helps us recommend the right pollution liability coverage.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('chemicalsUsed', true)}
                    className={`chip flex-1 py-4 text-base ${form.chemicalsUsed === true ? 'chip-selected' : ''}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => update('chemicalsUsed', false)}
                    className={`chip flex-1 py-4 text-base ${form.chemicalsUsed === false ? 'chip-selected' : ''}`}
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Employees */}
            {step === 5 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  How many people work in your business?
                </h2>
                <p className="text-slate-500 mb-8 text-sm">Including yourself. This determines if you need workers comp.</p>
                <div className="grid grid-cols-2 gap-3">
                  {EMPLOYEE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update('employeeCount', opt.value)}
                      className={`chip py-4 text-base ${form.employeeCount === opt.value ? 'chip-selected' : ''}`}
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
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Estimated annual revenue</h2>
                <p className="text-slate-500 mb-8 text-sm">Used to calculate your general liability premium.</p>
                <div className="space-y-2.5">
                  {REVENUE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update('annualRevenue', opt.value)}
                      className={`chip w-full py-4 text-base text-left px-5 ${form.annualRevenue === opt.value ? 'chip-selected' : ''}`}
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
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Do you work above 2 stories?
                </h2>
                <p className="text-slate-500 mb-8 text-sm">Height work affects which carriers can cover you.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => update('worksAtHeight', true)}
                    className={`chip flex-1 py-4 text-base ${form.worksAtHeight === true ? 'chip-selected' : ''}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => update('worksAtHeight', false)}
                    className={`chip flex-1 py-4 text-base ${form.worksAtHeight === false ? 'chip-selected' : ''}`}
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            {/* Step 8: Claims */}
            {step === 8 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Any claims or lawsuits in the last 3 years?
                </h2>
                <p className="text-slate-500 mb-8 text-sm">Be honest — it helps us find the right carrier for your situation.</p>
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setForm((prev) => ({
                      ...prev,
                      claimsHistory: { ...prev.claimsHistory, hasClaims: true },
                    }))}
                    className={`chip flex-1 py-4 text-base ${form.claimsHistory.hasClaims === true ? 'chip-selected' : ''}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setForm((prev) => ({
                      ...prev,
                      claimsHistory: { hasClaims: false, count: 0 },
                    }))}
                    className={`chip flex-1 py-4 text-base ${form.claimsHistory.hasClaims === false ? 'chip-selected' : ''}`}
                  >
                    No
                  </button>
                </div>
                {form.claimsHistory.hasClaims && (
                  <div>
                    <label className="text-slate-500 text-sm mb-2 block">How many?</label>
                    <GlowInput
                      className="w-32"
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
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => step > 1 && setStep(step - 1)}
                className={`btn-ghost ${step === 1 ? 'invisible' : ''}`}
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canAdvance()}
                className={`btn-primary ${!canAdvance() ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {step === TOTAL_STEPS ? 'Get My Quotes' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
