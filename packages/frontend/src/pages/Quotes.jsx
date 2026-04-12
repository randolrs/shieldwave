import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { track } from '../lib/analytics';

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
    <div className="card flex flex-col hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="font-semibold text-slate-900 text-lg">{quote.carrierName}</span>
          <span className="ml-3 text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
            {LINE_LABELS[quote.lineOfBusiness] || quote.lineOfBusiness}
          </span>
        </div>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-bold text-slate-900">
          {formatCurrency(quote.premiumMonthly)}
        </span>
        <span className="text-slate-400 text-sm">/mo</span>
      </div>
      <p className="text-slate-400 text-sm mb-6">
        {formatCurrency(quote.premiumAnnual)} / year
      </p>
      <div className="space-y-2.5 mb-6 flex-1">
        {limits.perOccurrence && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Per occurrence</span>
            <span className="text-slate-900 font-medium">{formatCurrency(limits.perOccurrence)}</span>
          </div>
        )}
        {limits.aggregate && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Aggregate</span>
            <span className="text-slate-900 font-medium">{formatCurrency(limits.aggregate)}</span>
          </div>
        )}
        {quote.deductible > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Deductible</span>
            <span className="text-slate-900 font-medium">{formatCurrency(quote.deductible)}</span>
          </div>
        )}
      </div>
      <div className="border-t border-slate-100 pt-4 mb-6">
        <ul className="space-y-1.5 text-sm text-slate-600">
          <li className="flex items-center gap-2"><span className="text-brand-600">✓</span> Third-party property damage</li>
          <li className="flex items-center gap-2"><span className="text-brand-600">✓</span> Bodily injury liability</li>
          <li className="flex items-center gap-2"><span className="text-brand-600">✓</span> Completed operations</li>
          {quote.lineOfBusiness === 'BOP' && <li className="flex items-center gap-2"><span className="text-brand-600">✓</span> Equipment & business property</li>}
        </ul>
      </div>
      <button onClick={() => onSelect(quote)} className="btn-primary w-full">
        Select This Plan
      </button>
    </div>
  );
}

function RecommendationCard({ rec }) {
  return (
    <div className="card border-brand-100 bg-brand-50/30">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
          <span className="text-brand-600 text-sm">i</span>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">{rec.title}</h4>
          <p className="text-slate-500 text-sm mt-1">{rec.description}</p>
          {rec.timeline && (
            <span className="inline-block mt-2 text-xs font-medium text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full">
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No quotes to display</h2>
          <button onClick={() => navigate('/get-quote')} className="btn-primary">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const { quotes = [], recommendations = [], requiresManualReview, customerId, intake } = data;

  useEffect(() => {
    track('quotes_viewed', {
      quote_count: quotes.length,
      requires_manual_review: !!requiresManualReview,
      state: intake?.state,
      min_premium_annual: quotes.length
        ? Math.min(...quotes.map((q) => q.premiumAnnual || 0))
        : null,
    });
  }, []);

  const handleSelect = (quote) => {
    track('plan_selected', {
      carrier_name: quote.carrierName,
      line_of_business: quote.lineOfBusiness,
      premium_annual: quote.premiumAnnual,
      premium_monthly: quote.premiumMonthly,
      state: intake?.state,
    });
    navigate('/waitlist', { state: { quote, intake } });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <a href="/" className="font-display font-bold text-lg text-slate-900">
          shield<span className="text-brand-600">wave</span>
        </a>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {requiresManualReview ? (
          <div className="max-w-xl mx-auto text-center py-12">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-brand-600 text-2xl">🔍</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Finding specialty coverage for you
            </h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Your risk profile needs specialty review from our wholesale partners.
              We'll email you as soon as quotes are ready.
            </p>
            <div className="card inline-block">
              <p className="text-slate-500 text-sm">Expected turnaround</p>
              <p className="text-2xl font-bold text-brand-600 mt-1">24–48 hours</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Your quotes</h1>
              <p className="text-slate-500">
                {quotes.length} option{quotes.length !== 1 ? 's' : ''} found. Sorted by best value.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {quotes.map((q) => (
                <QuoteCard key={q.id || q.carrierQuoteId} quote={q} onSelect={handleSelect} />
              ))}
            </div>

            {recommendations.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-5">Coverage recommendations</h2>
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
