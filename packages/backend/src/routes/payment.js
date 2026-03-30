import { Router } from 'express';
import { z } from 'zod';
import { createSetupIntent } from '../services/stripeService.js';
import { supabase } from '../db/supabase.js';

const router = Router();

// ─── Validation ─────────────────────────────────────────────────────

const setupIntentSchema = z.object({
  email: z.string().email('Invalid email address'),
  customerId: z.string().uuid('Invalid customer ID'),
});

// ─── POST / — Create a Stripe SetupIntent ───────────────────────────

router.post('/', async (req, res, next) => {
  try {
    const parseResult = setupIntentSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { email, customerId } = parseResult.data;

    // Verify the customer exists
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, email')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Ensure the provided email matches the customer record
    if (customer.email !== email) {
      return res.status(400).json({
        error: 'Email does not match customer record',
      });
    }

    const { clientSecret, setupIntentId } = await createSetupIntent(email, {
      customerId,
    });

    return res.status(200).json({
      clientSecret,
      setupIntentId,
    });
  } catch (err) {
    next(err);
  }
});

export { router as paymentRoutes };
