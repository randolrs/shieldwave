import Stripe from 'stripe';
import { config } from '../config/env.js';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-06-20',
});

/**
 * Creates a Stripe SetupIntent to collect a payment method token.
 *
 * We NEVER hold premium dollars. The payment method token collected here
 * is passed to the carrier's payment gateway (e.g. Coterie handles its
 * own payment processing via their bind endpoint).
 *
 * @param {string} customerEmail - Email of the customer
 * @param {Record<string, string>} metadata - Additional metadata to attach
 * @returns {{ clientSecret: string, setupIntentId: string }}
 */
export async function createSetupIntent(customerEmail, metadata = {}) {
  // Find or create a Stripe Customer so we can reuse the payment method later
  const customers = await stripe.customers.list({
    email: customerEmail,
    limit: 1,
  });

  let stripeCustomer;
  if (customers.data.length > 0) {
    stripeCustomer = customers.data[0];
  } else {
    stripeCustomer = await stripe.customers.create({
      email: customerEmail,
      metadata: { source: 'shieldwave' },
    });
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: stripeCustomer.id,
    payment_method_types: ['card'],
    metadata: {
      ...metadata,
      customerEmail,
      source: 'shieldwave',
    },
  });

  return {
    clientSecret: setupIntent.client_secret,
    setupIntentId: setupIntent.id,
  };
}

/**
 * Creates a PaymentIntent for a one-time premium payment.
 *
 * Used when a carrier requires upfront payment through our platform
 * rather than handling billing on their own.
 *
 * @param {number} amount - Amount in cents
 * @param {string} currency - ISO currency code (default 'usd')
 * @param {string} paymentMethodId - Stripe PaymentMethod ID
 * @param {Record<string, string>} metadata - Additional metadata
 * @returns {{ clientSecret: string, paymentIntentId: string, status: string }}
 */
export async function createPaymentIntent(
  amount,
  currency = 'usd',
  paymentMethodId,
  metadata = {},
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    payment_method: paymentMethodId,
    confirm: true,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: 'never',
    },
    metadata: {
      ...metadata,
      source: 'shieldwave',
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    status: paymentIntent.status,
  };
}

/**
 * Verifies the Stripe webhook signature and parses the event payload.
 *
 * @param {Buffer} payload - Raw request body (must be a Buffer, not parsed JSON)
 * @param {string} signature - Value of the stripe-signature header
 * @returns {Stripe.Event} The verified and parsed event
 * @throws {Stripe.errors.StripeSignatureVerificationError} If signature is invalid
 */
export function handleWebhook(payload, signature) {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe.webhookSecret,
  );

  return event;
}
