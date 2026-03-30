import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  coterie: {
    baseUrl: process.env.COTERIE_API_BASE_URL || 'https://api.coterieinsurance.com/v1',
    publishableKey: process.env.COTERIE_PUBLISHABLE_KEY || '',
    secretKey: process.env.COTERIE_SECRET_KEY || '',
    producerCode: process.env.COTERIE_PRODUCER_CODE || '',
  },

  boldPenguin: {
    baseUrl: process.env.BOLD_PENGUIN_API_BASE_URL || '',
    apiKey: process.env.BOLD_PENGUIN_API_KEY || '',
    agentId: process.env.BOLD_PENGUIN_AGENT_ID || '',
  },

  pieInsurance: {
    baseUrl: process.env.PIEINSURANCE_API_BASE_URL || '',
    apiKey: process.env.PIEINSURANCE_API_KEY || '',
    partnerId: process.env.PIEINSURANCE_PARTNER_ID || '',
  },

  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'coi@shieldwave.com',
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-west-2',
    s3Bucket: process.env.AWS_S3_BUCKET || 'shieldwave-cois',
  },

  google: {
    placesApiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  },

  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },

  posthog: {
    apiKey: process.env.POSTHOG_API_KEY || '',
    host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  },

  redis: {
    url: process.env.UPSTASH_REDIS_URL || '',
    token: process.env.UPSTASH_REDIS_TOKEN || '',
  },

  producer: {
    npn: process.env.PRODUCER_NPN || '',
    agencyName: process.env.AGENCY_NAME || '',
    licenseNumber: process.env.AGENCY_LICENSE_NUMBER || '',
    fein: process.env.AGENCY_FEIN || '',
  },

  aggregator: {
    name: process.env.AGGREGATOR_NAME || '',
    agentCode: process.env.AGGREGATOR_AGENT_CODE || '',
  },
};
