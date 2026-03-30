import { Router } from 'express';
import { healthRoutes } from './health.js';
import { quotesRoutes } from './quotes.js';
import { bindRoutes } from './bind.js';
import { coiRoutes } from './coi.js';
import { paymentRoutes } from './payment.js';
import { webhookRoutes } from './webhooks.js';

const router = Router();

router.use('/api/health', healthRoutes);
router.use('/api/quotes', quotesRoutes);
router.use('/api/bind', bindRoutes);
router.use('/api/coi', coiRoutes);
router.use('/api/payment/setup', paymentRoutes);
router.use('/api/webhooks/stripe', webhookRoutes);

export { router as routes };
