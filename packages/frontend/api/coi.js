export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { policyId, holderName, holderAddress } = req.body || {};

  return res.status(200).json({
    coiUrl: null,
    certificateHolderId: crypto.randomUUID(),
    holderName,
    holderAddress,
    status: 'pending',
    message: 'Certificate holder added. Updated COI will be emailed shortly.',
  });
}
