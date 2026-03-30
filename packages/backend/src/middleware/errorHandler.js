import { config } from '../config/env.js';

export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${status} - ${message}`, err.stack);

  res.status(status).json({
    error: message,
    ...(config.nodeEnv !== 'production' && { stack: err.stack }),
  });
}
