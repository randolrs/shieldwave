// Demand test intake endpoint.
// We intentionally do NOT return quotes — showing fabricated prices to
// prospective customers would be deceptive. This endpoint just
// acknowledges the intake so the frontend can route to the waitlist.
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};

  // Structured log for lead tracking
  console.log('[INTAKE_SUBMITTED]', JSON.stringify({
    timestamp: new Date().toISOString(),
    email: body.email || '',
    businessName: body.businessName || '',
    state: body.state || '',
    services: body.services || [],
    annualRevenue: body.annualRevenue || '',
    employeeCount: body.employeeCount || '',
    chemicalsUsed: body.chemicalsUsed,
    worksAtHeight: body.worksAtHeight,
    claimsCount: body.claimsHistory?.count || 0,
  }));

  const customerId = crypto.randomUUID();

  return res.status(200).json({
    success: true,
    customerId,
  });
}
