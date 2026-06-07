import express from 'express';
import config from '../config.js';
import { Session } from '../db.js';
import logger from '../utils/logger.js';

const router = express.Router();
const startTime = Date.now();

// GET /api/health
router.get('/', async (req, res) => {
  try {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const sessionsCount = await Session.countDocuments();

    // Check key presence (check that they are not equal to placeholders)
    const checkKey = (keyName) => {
      const val = config[keyName];
      return !!(val && val !== 'placeholder' && val !== '');
    };

    const statusObj = {
      status: 'ok',
      version: '1.0.0',
      apis: {
        ocean: checkKey('OCEAN_API_KEY'),
        prospeo: checkKey('PROSPEO_API_KEY'),
        eazyreach: checkKey('EAZYREACH_API_KEY'),
        brevo: checkKey('BREVO_API_KEY')
      },
      uptime,
      sessionsCount
    };

    return res.status(200).json(statusObj);
  } catch (err) {
    logger.error(`GET /health error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
