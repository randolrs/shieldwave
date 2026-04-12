import { PostHog } from 'posthog-node';

const POSTHOG_KEY =
  process.env.POSTHOG_KEY ||
  process.env.VITE_POSTHOG_KEY ||
  'phc_vk1Z7aobzwGucaHIdvHPdI8RIat6JXkdAw6m2CJYshi';

const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://us.i.posthog.com';

let client = null;
function getPostHog() {
  if (!client && POSTHOG_KEY) {
    client = new PostHog(POSTHOG_KEY, {
      host: POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const email = body.email || '';
  const distinctId = body.distinctId || email || 'anonymous';

  // Structured log for demand test tracking
  console.log('[WAITLIST_LEAD]', JSON.stringify({
    timestamp: new Date().toISOString(),
    email,
    name: body.name || '',
    businessName: body.businessName || '',
    state: body.state || '',
    selectedPlan: body.selectedPlan || '',
    selectedCarrier: body.selectedCarrier || '',
    premiumAnnual: body.premiumAnnual || 0,
    annualRevenue: body.annualRevenue || '',
    employeeCount: body.employeeCount || '',
  }));

  // Server-side PostHog capture — guarantees conversion lands
  // even if ad blockers kill the client event. Uses same distinct_id
  // as the client so events merge on the same person timeline.
  const posthog = getPostHog();
  if (posthog) {
    try {
      if (email) {
        posthog.identify({
          distinctId,
          properties: {
            email,
            name: body.name,
            business_name: body.businessName,
            state: body.state,
            selected_carrier: body.selectedCarrier,
            selected_plan: body.selectedPlan,
            quoted_premium_annual: body.premiumAnnual,
            annual_revenue: body.annualRevenue,
            employee_count: body.employeeCount,
          },
        });
      }
      posthog.capture({
        distinctId,
        event: 'waitlist_joined_server',
        properties: {
          carrier_name: body.selectedCarrier,
          line_of_business: body.selectedPlan,
          premium_annual: body.premiumAnnual,
          state: body.state,
          annual_revenue: body.annualRevenue,
          employee_count: body.employeeCount,
          $set: {
            email,
            business_name: body.businessName,
          },
        },
      });
      await posthog.shutdown();
    } catch (err) {
      console.error('[POSTHOG_ERROR]', err.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Added to priority list',
  });
}
