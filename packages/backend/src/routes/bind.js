import { Router } from 'express';
import { z } from 'zod';
import * as coterieClient from '../services/coterieClient.js';
import { cacheCOI } from '../services/coiService.js';
import { sendCOIEmail } from '../services/emailService.js';
import {
  supabase,
  createPolicy,
  updateQuoteStatus,
} from '../db/supabase.js';

const router = Router();

// ─── Validation ─────────────────────────────────────────────────────

const bindSchema = z.object({
  quoteId: z.string().uuid('Invalid quote ID'),
  customerId: z.string().uuid('Invalid customer ID'),
  paymentMethodId: z.string().min(1, 'Payment method ID is required'),
});

// ─── POST / — Bind a quote into a live policy ──────────────────────

router.post('/', async (req, res, next) => {
  try {
    const parseResult = bindSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { quoteId, customerId, paymentMethodId } = parseResult.data;

    // Look up the quote from the database
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .eq('customer_id', customerId)
      .single();

    if (quoteError || !quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    if (quote.status === 'bound') {
      return res.status(409).json({ error: 'Quote has already been bound' });
    }

    // Look up the customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Call the carrier's bind endpoint
    // Coterie handles its own payment processing — we pass the Stripe
    // payment method token to their bind endpoint.
    const carrierPolicy = await coterieClient.bindPolicy(
      quote.carrier_quote_id,
      { paymentMethodToken: paymentMethodId },
    );

    const carrierPolicyId =
      carrierPolicy.id ?? carrierPolicy.policyId ?? null;
    const carrierCoiUrl = carrierPolicy.coiUrl ?? null;

    // Mark the quote as bound
    await updateQuoteStatus(quoteId, 'bound');

    // Create the policy record in our database
    const policy = await createPolicy({
      customer_id: customerId,
      quote_id: quoteId,
      carrier: quote.carrier,
      policy_type: quote.policy_type,
      carrier_policy_id: carrierPolicyId,
      premium: quote.premium,
      limits: quote.limits,
      effective_date: quote.effective_date,
      status: 'active',
      raw_response: carrierPolicy,
    });

    // Cache the COI in S3 and send the delivery email
    let coiUrl = null;

    if (carrierCoiUrl) {
      try {
        coiUrl = await cacheCOI(policy.id, carrierCoiUrl);
      } catch (err) {
        console.error('[Bind] Failed to cache COI:', err.message);
        // Non-fatal — policy is still bound. COI can be fetched later.
      }
    }

    // If we don't have a COI URL from the carrier, try fetching it directly
    if (!coiUrl && carrierPolicyId) {
      try {
        const coiResponse = await coterieClient.getCOI(carrierPolicyId);
        const fetchedCoiUrl = coiResponse.url ?? coiResponse.coiUrl ?? null;
        if (fetchedCoiUrl) {
          coiUrl = await cacheCOI(policy.id, fetchedCoiUrl);
        }
      } catch (err) {
        console.error('[Bind] Failed to fetch COI from carrier:', err.message);
      }
    }

    // Send COI email (fire-and-forget)
    if (coiUrl) {
      sendCOIEmail(
        customer.email,
        customer.business_name,
        coiUrl,
      ).catch((err) =>
        console.error('[Bind] Failed to send COI email:', err.message),
      );
    }

    return res.status(200).json({
      policy,
      coiUrl,
    });
  } catch (err) {
    next(err);
  }
});

export { router as bindRoutes };
