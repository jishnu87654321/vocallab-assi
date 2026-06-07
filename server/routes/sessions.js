import express from 'express';
import { listSessions, getSession } from '../utils/sessionStore.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /api/sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await listSessions();
    return res.status(200).json(sessions);
  } catch (err) {
    logger.error(`GET /sessions error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/sessions/:sessionId
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    return res.status(200).json(session);
  } catch (err) {
    logger.error(`GET /sessions/:id error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
