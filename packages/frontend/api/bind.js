export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    policy: {
      id: crypto.randomUUID(),
      carrierName: 'Coterie',
      carrierPolicyId: `POL-${Date.now()}`,
      status: 'active',
    },
    coiUrl: null,
    message: 'Demo mode — connect carrier APIs to bind real policies.',
  });
}
