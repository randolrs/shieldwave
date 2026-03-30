import { Router } from 'express';
import express from 'express';
import { handleWebhook } from '../services/stripeService.js';
import { updatePolicyStatus } from '../db/supabase.js';

const router = Router();

// Stripe requires the raw body (Buffer) for signature verification.
// Override the global express.json() parser for this route.
router.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      const signature = req.headers['stripe-signature'];

      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature header' });
      }

      // Verify signature and parse the event
      let event;
      try {
        event = handleWebhook(req.body, signature);
      } catch (err) {
        console.error('[Webhook] Signature verification failed:', err.message);
        return res.status(400).json({ error: 'Invalid signature' });
      }

      // Handle known event types
      switch (event.type) {
        case 'setup_intent.succeeded': {
          const setupIntent = event.data.object;
          console.info(
            '[Webhook] SetupIntent succeeded:',
            setupIntent.id,
            'customer:',
            setupIntent.customer,
          );
          // The payment method is now saved on the Stripe customer.
          // It will be used when the user binds a policy via POST /api/bind.
          break;
        }

        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          console.info(
            '[Webhook] PaymentIntent succeeded:',
            paymentIntent.id,
            'amount:',
            paymentIntent.amount,
          );
          // If this payment is tied to a policy, update its status.
          const policyId =
            paymentIntent.metadata?.policyId ?? null;
          if (policyId) {
            try {
              await updatePolicyStatus(policyId, 'active');
              console.info('[Webhook] Policy activated:', policyId);
            } catch (err) {
              console.error(
                '[Webhook] Failed to update policy status:',
                err.message,
              );
            }
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const failedIntent = event.data.object;
          console.warn(
            '[Webhook] PaymentIntent failed:',
            failedIntent.id,
            'reason:',
            failedIntent.last_payment_error?.message,
          );
          const failedPolicyId =
            failedIntent.metadata?.policyId ?? null;
          if (failedPolicyId) {
            try {
              await updatePolicyStatus(failedPolicyId, 'payment_failed');
            } catch (err) {
              console.error(
                '[Webhook] Failed to update policy status on payment failure:',
                err.message,
              );
            }
          }
          break;
        }

        default:
          console.info('[Webhook] Unhandled event type:', event.type);
      }

      // Always return 200 to acknowledge receipt
      return res.status(200).json({ received: true });
    } catch (err) {
      next(err);
    }
  },
);

export { router as webhookRoutes };
