import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import { routes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers
app.use(helmet());

// CORS – allow the frontend origin
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);

// Request logging
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Body parsing — skip JSON parsing for the Stripe webhook route because
// it needs the raw body (Buffer) for signature verification.
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhooks/stripe') {
    return next();
  }
  express.json()(req, res, next);
});

// Routes
app.use(routes);

// Global error handler (must be registered after routes)
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(
    `[ShieldWave] Server running on port ${config.port} (${config.nodeEnv})`,
  );
});

export default app;
