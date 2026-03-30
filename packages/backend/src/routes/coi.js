import { Router } from 'express';
import { z } from 'zod';
import { generateCertificateHolder } from '../services/coiService.js';
import {
  supabase,
  createCertificateHolder,
} from '../db/supabase.js';

const router = Router();

// ─── Validation ─────────────────────────────────────────────────────

const certificateHolderSchema = z.object({
  policyId: z.string().uuid('Invalid policy ID'),
  holderName: z.string().min(1, 'Holder name is required').max(300),
  holderAddress: z.string().min(1, 'Holder address is required').max(500),
});

// ─── POST / — Generate a certificate holder COI ────────────────────

router.post('/', async (req, res, next) => {
  try {
    const parseResult = certificateHolderSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { policyId, holderName, holderAddress } = parseResult.data;

    // Verify the policy exists
    const { data: policy, error: policyError } = await supabase
      .from('policies')
      .select('id, status, carrier_policy_id')
      .eq('id', policyId)
      .single();

    if (policyError || !policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    if (policy.status !== 'active') {
      return res.status(400).json({
        error: 'Certificate holders can only be added to active policies',
      });
    }

    // Generate the certificate holder COI via the carrier / COI service
    const { coiUrl, status } = await generateCertificateHolder(
      policyId,
      holderName,
      holderAddress,
    );

    // Save the certificate holder record in the database
    const certificateHolder = await createCertificateHolder({
      policy_id: policyId,
      holder_name: holderName,
      holder_address: holderAddress,
      coi_url: coiUrl,
      status,
      generated_at: new Date().toISOString(),
    });

    return res.status(201).json({
      coiUrl,
      certificateHolderId: certificateHolder.id,
    });
  } catch (err) {
    next(err);
  }
});

export { router as coiRoutes };
