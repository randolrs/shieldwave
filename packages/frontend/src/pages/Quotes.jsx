import { useLocation, useNavigate } from 'react-router-dom';

const LINE_LABELS = {
  GL: 'General Liability',
  BOP: 'Business Owners Policy',
  WC: 'Workers Compensation',
  AUTO: 'Commercial Auto',
  UMBRELLA: 'Umbrella / Excess',
  POLLUTION: 'Pollution Liability',
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

function QuoteCard({ quote, onSelect }) {
  const limits = quote.coverageLimits || {};
  return (
    <div className="card flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="font-display font-bold text-lg">{quote.carrierName}</span>
          <span className="ml-3 text-xs font-mono text-navy-400 bg-navy-800 px-2 py-0.5">
            {LINE_LABELS[quote.lineOfBusiness] || quote.lineOfBusiness}
          </span>
        </div>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="font-display text-3xl font-bold text-volt">
          {formatCurrency(quote.premiumMonthly)}
        </span>
        <span className="text-navy-400 text-sm">/mo</span>
      </div>
      <p className="text-navy-500 text-sm mb-5">
        {formatCurrency(quote.premiumAnnual)} / year
      </p>
      <div className="space-y-2 mb-6 flex-1">
        {limits.perOccurrence && (
          <div className="flex justify-between text-sm">
            <span className="text-navy-400">Per occurrence</span>
            <span>{formatCurrency(limits.perOccurrence)}</span>
          </div>
        )}
        {limits.aggregate && (
          <div className="flex justify-between text-sm">
            <span className="text-navy-400">Aggregate</span>
            <span>{formatCurrency(limits.aggregate)}</span>
          </div>
        )}
        {quote.deductible > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-navy-400">Deductible</span>
            <span>{formatCurrency(quote.deductible)}</span>
          </div>
        )}
      </div>
      <ul className="space-y-1.5 mb-6 text-sm text-navy-300">
        <li>✓ Third-party property damage</li>
        <li>✓ Bodily injury liability</li>
        <li>✓ Completed operations</li>
        {quote.lineOfBusiness === 'BOP' && <li>✓ Equipment & business property</li>}
      </ul>
      <button onClick={() => onSelect(quote)} className="btn-primary w-full">
        Select This Plan
      </button>
    </div>
  );
}

function RecommendationCard({ rec }) {
  return (
    <div className="card border-volt/30">
      <div className="flex items-start gap-3">
        <span className="text-volt text-lg mt-0.5">⚡</span>
        <div>
          <h4 className="font-display font-bold">{rec.title}</h4>
          <p className="text-navy-400 text-sm mt-1">{rec.description}</p>
          {rec.timeline && (
            <span className="inline-block mt-2 text-xs font-mono text-volt bg-volt/10 px-2 py-0.5">
              {rec.timeline}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Quotes() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-4">No quotes to display</h2>
          <button onClick={() => navigate('/get-quote')} className="btn-primary">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const { quotes = [], recommendations = [], requiresManualReview, customerId } = data;

  const handleSelect = (quote) => {
    navigate('/checkout', { state: { quote, customerId } });
  };

  return (
    <div className="min-h-screen bg-navy-950">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <a href="/" className="font-display font-bold text-xl">
          SHIELD<span className="text-volt">WAVE</span>
        </a>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {requiresManualReview ? (
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-5xl mb-6">🔍</div>
            <h1 className="font-display text-3xl font-bold mb-4">
              We're Finding Specialty Coverage for You
            </h1>
            <p className="text-navy-400 mb-8 leading-relaxed">
              Your risk profile needs specialty review from our wholesale partners.
              We'll have options for you within 24–48 hours. We'll email you as soon
              as quotes are ready.
            </p>
            <div className="card inline-block">
              <p className="text-navy-400 text-sm">Expected turnaround</p>
              <p className="font-display text-2xl font-bold text-volt">24–48 hours</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Your Quotes</h1>
              <p className="text-navy-400">
                {quotes.length} option{quotes.length !== 1 ? 's' : ''} found. Sorted by best value.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {quotes.map((q) => (
                <QuoteCard key={q.id || q.carrierQuoteId} quote={q} onSelect={handleSelect} />
              ))}
            </div>

            {recommendations.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">Coverage Recommendations</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {recommendations.map((rec, i) => (
                    <RecommendationCard key={i} rec={rec} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
