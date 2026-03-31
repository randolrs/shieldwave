export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const customerId = crypto.randomUUID();

  // Generate demo quotes based on intake data
  const annualPremium = body.annualRevenue === '500k+' ? 2800
    : body.annualRevenue === '250k-500k' ? 2200
    : body.annualRevenue === '100k-250k' ? 1600
    : body.annualRevenue === '50k-100k' ? 1200
    : 850;

  const claimsCount = body.claimsHistory?.count || 0;
  const requiresManualReview = claimsCount > 2;

  if (requiresManualReview) {
    return res.status(200).json({
      quotes: [],
      recommendations: [],
      requiresManualReview: true,
      manualReviewReason: "Your risk profile needs specialty review — we'll have options in 24–48 hours.",
      customerId,
    });
  }

  const quotes = [
    {
      id: crypto.randomUUID(),
      carrierName: 'Coterie',
      carrierQuoteId: `COT-${Date.now()}`,
      lineOfBusiness: 'GL',
      premiumAnnual: annualPremium,
      premiumMonthly: Math.round(annualPremium / 12),
      deductible: 500,
      coverageLimits: { perOccurrence: 1000000, aggregate: 2000000 },
      status: 'quoted',
    },
    {
      id: crypto.randomUUID(),
      carrierName: 'Coterie',
      carrierQuoteId: `COT-${Date.now() + 1}`,
      lineOfBusiness: 'BOP',
      premiumAnnual: Math.round(annualPremium * 1.4),
      premiumMonthly: Math.round((annualPremium * 1.4) / 12),
      deductible: 1000,
      coverageLimits: { perOccurrence: 1000000, aggregate: 2000000, propertyLimit: 100000 },
      status: 'quoted',
    },
  ];

  const recommendations = [];

  if (body.chemicalsUsed) {
    recommendations.push({
      title: 'Pollution Liability',
      description: 'You use chemicals like sodium hypochlorite. Pollution liability covers third-party damage from chemical discharge.',
      timeline: 'Quote available in 24 hours',
    });
  }

  if (body.employeeCount && body.employeeCount !== 'solo') {
    recommendations.push({
      title: 'Workers Compensation',
      description: `With ${body.employeeCount === '2-5' ? '2–5' : body.employeeCount === '6-10' ? '6–10' : '10+'} employees, workers comp is required in most states.`,
      timeline: 'Quote available now',
    });
  }

  if (['100k-250k', '250k-500k', '500k+'].includes(body.annualRevenue)) {
    recommendations.push({
      title: 'Commercial Auto',
      description: 'Your revenue level indicates business vehicle usage. Commercial auto covers your trucks and trailers.',
      timeline: 'Quote available in 24 hours',
    });
  }

  return res.status(200).json({
    quotes,
    recommendations,
    requiresManualReview: false,
    manualReviewReason: null,
    customerId,
  });
}
