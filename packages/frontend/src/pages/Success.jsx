import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addCertificateHolder } from '../lib/api';

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
      <div className="min-h-screen bg-navy-950 flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-4">No policy data found</h2>
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
    <div className="min-h-screen bg-navy-950">
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <a href="/" className="font-display font-bold text-xl">
          SHIELD<span className="text-volt">WAVE</span>
        </a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        {/* Success State */}
        <div className="bg-volt/10 border border-volt/30 inline-flex items-center justify-center w-20 h-20 mb-8">
          <span className="text-volt text-4xl">✓</span>
        </div>
        <h1 className="font-display text-4xl font-bold mb-3">You're Insured!</h1>
        <p className="text-navy-400 text-lg mb-8">
          Your policy is now active. Your Certificate of Insurance is ready.
        </p>

        {/* Policy Details */}
        <div className="card text-left mb-8 space-y-3">
          {policy?.carrierName && (
            <div className="flex justify-between">
              <span className="text-navy-400">Carrier</span>
              <span className="font-display font-bold">{policy.carrierName}</span>
            </div>
          )}
          {policy?.carrierPolicyId && (
            <div className="flex justify-between">
              <span className="text-navy-400">Policy Number</span>
              <span className="font-mono">{policy.carrierPolicyId}</span>
            </div>
          )}
          {policy?.premium && (
            <div className="flex justify-between">
              <span className="text-navy-400">Annual Premium</span>
              <span className="font-bold text-volt">{formatCurrency(policy.premium)}</span>
            </div>
          )}
          {policy?.effectiveDate && (
            <div className="flex justify-between">
              <span className="text-navy-400">Effective Date</span>
              <span>{new Date(policy.effectiveDate).toLocaleDateString()}</span>
            </div>
          )}
          {policy?.expiryDate && (
            <div className="flex justify-between">
              <span className="text-navy-400">Expiry Date</span>
              <span>{new Date(policy.expiryDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* COI Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {coiUrl && (
            <a href={coiUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Download COI (PDF)
            </a>
          )}
          <button onClick={() => setShowHolderForm(true)} className="btn-secondary">
            Add Certificate Holder
          </button>
        </div>

        {/* Certificate Holder Form */}
        {showHolderForm && (
          <div className="card text-left">
            <h3 className="font-display text-xl font-bold mb-4">Add Certificate Holder</h3>
            <p className="text-navy-400 text-sm mb-6">
              Need to prove insurance to a client or GC? Add them as a certificate holder and we'll generate an updated COI.
            </p>
            {holderSuccess ? (
              <div className="bg-volt/10 border border-volt/30 px-4 py-3 text-volt text-sm mb-4">
                Certificate holder added. Updated COI will be emailed to you shortly.
              </div>
            ) : (
              <form onSubmit={handleAddHolder} className="space-y-4">
                <input
                  className="input-field"
                  placeholder="Certificate holder name (e.g. ABC Property Management)"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  required
                />
                <textarea
                  className="input-field min-h-[80px]"
                  placeholder="Certificate holder address"
                  value={holderAddress}
                  onChange={(e) => setHolderAddress(e.target.value)}
                  required
                />
                {holderError && (
                  <div className="bg-red-900/30 border border-red-700 px-4 py-3 text-red-300 text-sm">
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
