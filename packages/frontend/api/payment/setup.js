export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    clientSecret: 'demo_not_configured',
    message: 'Stripe is not configured. Set STRIPE_SECRET_KEY to enable payments.',
  });
}
