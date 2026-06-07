import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import config from './config.js';
import connectDB, { Session } from './db.js';
import pipelineRouter from './routes/pipeline.js';
import sessionsRouter from './routes/sessions.js';
import healthRouter from './routes/health.js';
import logger from './utils/logger.js';

const app = express();

// Allowed origins: local dev + production domain (both www and apex)
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://www.reachflow.fit',
  'https://www.reachflow.fit',
  'http://reachflow.fit',
  'https://reachflow.fit',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy: origin "${origin}" is not allowed.`));
  },
  credentials: true
}));

app.use(express.json());

// Mount routes
app.use('/api/pipeline', pipelineRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/health', healthRouter);

// Express error middleware
app.use((err, req, res, next) => {
  logger.error(`Route Exception: ${err.message}`);
  res.status(500).json({ error: err.message });
});

// Starts the server and registers crash interceptors
const startServer = async () => {
  await connectDB();
  
  app.listen(config.PORT, () => {
    logger.init(`VocaReach Server listening on port ${config.PORT}`);
    logger.init(`CORS enabled for: ${ALLOWED_ORIGINS.join(', ')}`);
  });
};

/**
 * Intercepts uncaught errors to serialize active pipelines into failed states.
 * Fulfills the "Graceful Failure" rule: "Never leave a session in running status on crash."
 * @param {Error} error
 */
async function handleCrash(error) {
  logger.error(`FATAL EXCEPTION: ${error.stack || error.message}`);
  
  try {
    if (mongoose.connection.readyState === 1) { // Connected
      // Find all sessions currently in 'running' state
      const activeRuns = await Session.find({ status: 'running' });
      
      for (const run of activeRuns) {
        logger.warn(`Serializing active session ${run.sessionId} to failure state before exit...`);
        run.status = 'failed';
        run.completedAt = new Date();
        run.events.push({
          type: 'error',
          message: `Execution terminated: ${error.message || 'Fatal backend crash.'}`,
          ts: new Date()
        });
        await run.save();
        logger.save(`Graceful crash recovery complete for session: ${run.sessionId}`);
      }
    }
  } catch (dbErr) {
    console.error('[CRASH HANDLER] Failed to serialize states:', dbErr.message);
  }

  process.exit(1);
}

process.on('uncaughtException', handleCrash);
process.on('unhandledRejection', handleCrash);

if (!process.env.VERCEL) {
  startServer();
} else {
  // In serverless environments (like Vercel), connect to the database immediately
  connectDB().catch(err => console.error('[DB] Serverless connection error:', err.message));
}

export default app;
