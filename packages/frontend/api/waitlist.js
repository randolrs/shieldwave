export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Log lead for demand test tracking
  // In production, this would persist to Supabase or a CRM
  console.log('[WAITLIST_LEAD]', JSON.stringify({
    timestamp: new Date().toISOString(),
    email: body.email || '',
    name: body.name || '',
    businessName: body.businessName || '',
    state: body.state || '',
    selectedPlan: body.selectedPlan || '',
    selectedCarrier: body.selectedCarrier || '',
    premiumAnnual: body.premiumAnnual || 0,
    annualRevenue: body.annualRevenue || '',
    employeeCount: body.employeeCount || '',
  }));

  return res.status(200).json({
    success: true,
    message: 'Added to priority list',
  });
}
