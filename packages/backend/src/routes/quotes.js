import { Router } from 'express';
import { z } from 'zod';
import { mapIntakeToCarrierFields } from '../services/fieldMapper.js';
import { routeToCarriers } from '../services/carrierRouter.js';
import {
  getCustomerByEmail,
  createCustomer,
  updateCustomer,
  createQuote,
} from '../db/supabase.js';
import { sendManualReviewNotification } from '../services/emailService.js';

const router = Router();

// ─── Zod schema matching the 8 intake questions ─────────────────────

const intakeSchema = z.object({
  // Q1: Business name
  businessName: z.string().min(1, 'Business name is required').max(200),

  // Q2: Business address
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be a 2-letter code'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),

  // Q3: Contact information
  contactFirstName: z.string().min(1, 'First name is required'),
  contactLastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),

  // Q4: Services offered
  services: z
    .array(
      z.enum([
        'Pressure Washing',
        'Soft Washing',
        'Roof Cleaning',
        'Concrete Cleaning',
        'Fleet Washing',
        'Window Cleaning',
        'Gutter Cleaning',
        'House Washing',
      ]),
    )
    .min(1, 'At least one service is required'),

  // Q5: Chemical usage
  chemicalsUsed: z.boolean(),

  // Q6: Employee count
  employeeCount: z.enum(['solo', '2-5', '6-10', '10+']),

  // Q7: Annual revenue
  annualRevenue: z.enum(['under50k', '50k-100k', '100k-250k', '250k-500k', '500k+']),

  // Q8: Height work & claims
  worksAtHeight: z.boolean(),
  claimsHistory: z.object({
    hasClaims: z.boolean(),
    count: z.number().int().min(0).default(0),
  }),
});

// ─── POST / — Request quotes ────────────────────────────────────────

router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const parseResult = intakeSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const intake = parseResult.data;

    // Map intake answers to carrier-standard fields
    const carrierFields = mapIntakeToCarrierFields(intake);

    // Find or create customer in the database
    let customer = await getCustomerByEmail(intake.email);

    if (customer) {
      customer = await updateCustomer(customer.id, {
        business_name: intake.businessName,
        first_name: intake.contactFirstName,
        last_name: intake.contactLastName,
        phone: intake.phone,
        address: intake.address,
        city: intake.city,
        state: intake.state,
        zip: intake.zip,
        services: intake.services,
        employee_count: intake.employeeCount,
        annual_revenue: intake.annualRevenue,
        chemicals_used: intake.chemicalsUsed,
        works_at_height: intake.worksAtHeight,
        claims_history: intake.claimsHistory,
        updated_at: new Date().toISOString(),
      });
    } else {
      customer = await createCustomer({
        email: intake.email,
        business_name: intake.businessName,
        first_name: intake.contactFirstName,
        last_name: intake.contactLastName,
        phone: intake.phone,
        address: intake.address,
        city: intake.city,
        state: intake.state,
        zip: intake.zip,
        services: intake.services,
        employee_count: intake.employeeCount,
        annual_revenue: intake.annualRevenue,
        chemicals_used: intake.chemicalsUsed,
        works_at_height: intake.worksAtHeight,
        claims_history: intake.claimsHistory,
      });
    }

    // Route to carriers and collect quotes
    const {
      quotes,
      recommendations,
      requiresManualReview,
      manualReviewReason,
    } = await routeToCarriers(carrierFields);

    // Persist each quote to the database
    const savedQuotes = await Promise.all(
      quotes.map((q) =>
        createQuote({
          customer_id: customer.id,
          carrier: q.carrier,
          policy_type: q.policyType,
          tier: q.tier,
          carrier_quote_id: q.quoteId,
          premium: q.premium,
          limits: q.limits,
          effective_date: q.effectiveDate,
          status: 'quoted',
          raw_response: q.raw,
        }),
      ),
    );

    // If manual review is needed, notify the customer
    if (requiresManualReview) {
      // Fire-and-forget — don't block the response on email delivery
      sendManualReviewNotification(intake.email, intake.businessName).catch(
        (err) =>
          console.error(
            '[Quotes] Failed to send manual review email:',
            err.message,
          ),
      );
    }

    return res.status(200).json({
      quotes: savedQuotes,
      recommendations,
      requiresManualReview,
      manualReviewReason: manualReviewReason ?? null,
      customerId: customer.id,
    });
  } catch (err) {
    next(err);
  }
});

export { router as quotesRoutes };
