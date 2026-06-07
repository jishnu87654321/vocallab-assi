import express from 'express';
import { createSession, getSession, updateSession, appendEvent, listSessions } from '../utils/sessionStore.js';
import { initEngine } from '../stages/stage0_init.js';
import { findLookalikes } from '../stages/stage1_lookalike.js';
import { findProspects } from '../stages/stage2_prospects.js';
import { resolveEmails } from '../stages/stage3_emails.js';
import { sendOutreach } from '../stages/stage4_outreach.js';
import logger from '../utils/logger.js';

const router = express.Router();

// SSE active connections registry (sessionId -> Set of Express Response objects)
const activeConnections = new Map();

/**
 * Pushes an event to all active SSE streams connected for a sessionId.
 * @param {string} sessionId
 * @param {Object} event
 */
function broadcastSSE(sessionId, event) {
  const clients = activeConnections.get(sessionId);
  if (clients && clients.size > 0) {
    const payload = `data: ${JSON.stringify({ ...event, ts: event.ts || new Date() })}\n\n`;
    for (const client of clients) {
      client.write(payload);
    }
  }
}

/**
 * Orchestrates stage execution, database persistence, and SSE event streaming.
 * @param {string} sessionId
 * @param {string} seedDomain
 */
async function executePipelineBackground(sessionId, seedDomain) {
  const emitEvent = async (type, payload = {}) => {
    const event = { type, ...payload };
    // 1. Persist to MongoDB
    await appendEvent(sessionId, event);
    // 2. Broadcast to connected clients
    broadcastSSE(sessionId, event);
  };

  try {
    // Stage 0: Init
    const initData = await initEngine(sessionId, seedDomain, emitEvent);
    
    // Stage 1: Lookalikes
    const domains = await findLookalikes(sessionId, seedDomain, emitEvent);
    
    // Stage 2: Prospects
    const prospects = await findProspects(sessionId, domains, emitEvent);
    
    // Stage 3: Emails
    const contacts = await resolveEmails(sessionId, prospects, emitEvent);
    
  } catch (err) {
    logger.error(`Pipeline execution crashed for session ${sessionId}: ${err.message}`);
    
    // Graceful Failure rule: never leave in running status on crash.
    await updateSession(sessionId, {
      status: 'failed',
      completedAt: new Date()
    });

    await appendEvent(sessionId, {
      type: 'error',
      message: err.message
    });

    broadcastSSE(sessionId, {
      type: 'error',
      message: err.message
    });
  }
}

/**
 * Orchestrates outreach campaign dispatch (Stage 4).
 * @param {string} sessionId
 * @param {Array} contacts
 */
async function executeOutreachBackground(sessionId, contacts) {
  const emitEvent = async (type, payload = {}) => {
    const event = { type, ...payload };
    await appendEvent(sessionId, event);
    broadcastSSE(sessionId, event);
  };

  try {
    await updateSession(sessionId, { status: 'running' });
    await sendOutreach(sessionId, contacts, emitEvent);
  } catch (err) {
    logger.error(`Outreach dispatch crashed for session ${sessionId}: ${err.message}`);
    
    await updateSession(sessionId, {
      status: 'failed',
      completedAt: new Date()
    });

    await appendEvent(sessionId, {
      type: 'error',
      message: err.message
    });

    broadcastSSE(sessionId, {
      type: 'error',
      message: err.message
    });
  }
}

// POST /api/pipeline/run
router.post('/run', async (req, res) => {
  try {
    const { domain, confirm, sessionId } = req.body;

    // Handle outreach validation / cancel / confirmation
    if (confirm === true) {
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required for confirmation' });
      }
      
      const session = await getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.status === 'running') {
        return res.status(200).json({
          sessionId,
          status: 'running',
          message: 'Outreach campaign is already running.'
        });
      }

      if (session.status !== 'awaiting_confirm') {
        return res.status(400).json({ error: `Session is in state "${session.status}", cannot confirm` });
      }

      const contacts = session.stages.stage3.output || [];
      if (contacts.length === 0) {
        return res.status(400).json({ error: 'No contacts found to dispatch emails' });
      }

      // Start Stage 4 in background
      executeOutreachBackground(sessionId, contacts);
      
      return res.status(200).json({
        sessionId,
        status: 'running',
        message: 'Outreach campaign initiated.'
      });
    }

    if (confirm === false) {
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required to cancel' });
      }
      
      const session = await getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Mark cancelled
      const updated = await updateSession(sessionId, {
        status: 'cancelled',
        completedAt: new Date()
      });

      const cancelEvent = { type: 'warning', message: 'Pipeline run cancelled by user.' };
      await appendEvent(sessionId, cancelEvent);
      broadcastSSE(sessionId, cancelEvent);

      return res.status(200).json({ cancelled: true });
    }

    // Otherwise, initialize a new pipeline run
    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({ error: 'domain must be a non-empty string' });
    }

    // Domain validation: strip protocol/www, reject if no TLD
    let cleanDomain = domain.trim().toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .replace(/\/$/, '');

    if (!cleanDomain.includes('.') || cleanDomain.startsWith('.') || cleanDomain.endsWith('.')) {
      return res.status(400).json({ error: 'Invalid domain name. Must include a valid TLD (e.g., domain.com)' });
    }

    // Create session
    const session = await createSession(cleanDomain);
    
    // Kick off stages 0-3 in the background
    executePipelineBackground(session.sessionId, cleanDomain);

    // Return session ID immediately for the client to connect via SSE
    return res.status(201).json({
      sessionId: session.sessionId,
      status: 'running',
      seedDomain: cleanDomain
    });

  } catch (err) {
    logger.error(`POST /run error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/pipeline/stream/:sessionId
router.get('/stream/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  const session = await getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Replay existing events in session log immediately
  if (session.events && session.events.length > 0) {
    for (const event of session.events) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  }

  // Register client response stream for real-time broadcasts
  if (!activeConnections.has(sessionId)) {
    activeConnections.set(sessionId, new Set());
  }
  activeConnections.get(sessionId).add(res);

  // Connection close cleanup
  req.on('close', () => {
    const clients = activeConnections.get(sessionId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        activeConnections.delete(sessionId);
      }
    }
  });
});

export default router;
