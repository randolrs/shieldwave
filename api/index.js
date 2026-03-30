import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '../packages/backend/src/config/env.js';
import { routes } from '../packages/backend/src/routes/index.js';
import { errorHandler } from '../packages/backend/src/middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl || '*',
    credentials: true,
  }),
);

app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhooks/stripe') {
    return next();
  }
  express.json()(req, res, next);
});

app.use(routes);
app.use(errorHandler);

export default app;
