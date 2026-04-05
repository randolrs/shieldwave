import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addCertificateHolder } from '../lib/api';
import GlowInput, { GlowTextarea } from '../components/GlowInput';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  const [showHolderForm, setShowHolderForm] = useState(false);
  const [holderName, setHolderName] = useState('');
  const [holderAddress, setHolderAddress] = useState('');
  const [holderSubmitting, setHolderSubmitting] = useState(false);
  const [holderSuccess, setHolderSuccess] = useState(false);
  const [holderError, setHolderError] = useState(null);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No policy data found</h2>
          <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
        </div>
      </div>
    );
  }

  const { policy, coiUrl } = data;

  const handleAddHolder = async (e) => {
    e.preventDefault();
    setHolderSubmitting(true);
    setHolderError(null);
    try {
      await addCertificateHolder(policy.id, holderName, holderAddress);
      setHolderSuccess(true);
      setHolderName('');
      setHolderAddress('');
    } catch (err) {
      setHolderError(err.message);
    } finally {
      setHolderSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between px-6 py-5 max-w-3xl mx-auto">
        <a href="/" className="font-display font-bold text-lg text-slate-900">
          shield<span className="text-brand-600">wave</span>
        </a>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12 text-center">
        {/* Success State */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">You're insured!</h1>
        <p className="text-slate-500 text-lg mb-8">
          Your policy is active. Your Certificate of Insurance is ready.
        </p>

        {/* Policy Details */}
        <div className="card text-left mb-8 space-y-3">
          {policy?.carrierName && (
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Carrier</span>
              <span className="font-semibold text-slate-900">{policy.carrierName}</span>
            </div>
          )}
          {policy?.carrierPolicyId && (
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Policy number</span>
              <span className="font-mono text-sm text-slate-700">{policy.carrierPolicyId}</span>
            </div>
          )}
          {policy?.premium && (
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Annual premium</span>
              <span className="font-semibold text-slate-900">{formatCurrency(policy.premium)}</span>
            </div>
          )}
          {policy?.effectiveDate && (
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Effective date</span>
              <span className="text-slate-700">{new Date(policy.effectiveDate).toLocaleDateString()}</span>
            </div>
          )}
          {policy?.expiryDate && (
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Expiry date</span>
              <span className="text-slate-700">{new Date(policy.expiryDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* COI Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          {coiUrl && (
            <a href={coiUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Download COI
            </a>
          )}
          <button onClick={() => setShowHolderForm(true)} className="btn-secondary">
            Add Certificate Holder
          </button>
        </div>

        {/* Certificate Holder Form */}
        {showHolderForm && (
          <div className="card text-left">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Add certificate holder</h3>
            <p className="text-slate-500 text-sm mb-6">
              Need to prove insurance to a client or GC? Add them as a certificate holder and we'll generate an updated COI.
            </p>
            {holderSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-700 text-sm">
                Certificate holder added. Updated COI will be emailed to you shortly.
              </div>
            ) : (
              <form onSubmit={handleAddHolder} className="space-y-4">
                <GlowInput
                  placeholder="Certificate holder name (e.g. ABC Property Management)"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  required
                />
                <GlowTextarea
                  placeholder="Certificate holder address"
                  value={holderAddress}
                  onChange={(e) => setHolderAddress(e.target.value)}
                  required
                  style={{ minHeight: '80px' }}
                />
                {holderError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                    {holderError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={holderSubmitting}
                  className={`btn-primary w-full ${holderSubmitting ? 'opacity-50' : ''}`}
                >
                  {holderSubmitting ? 'Generating…' : 'Generate Updated COI'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
