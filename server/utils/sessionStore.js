import { Session } from '../db.js';
import crypto from 'crypto';

/** @typedef {import('../db.js').OutreachSession} OutreachSession */
/** @typedef {import('../db.js').SessionEvent} SessionEvent */

/**
 * Creates a new pipeline execution session.
 * @param {string} seedDomain - The target domain
 * @returns {Promise<OutreachSession>}
 */
export async function createSession(seedDomain) {
  const sessionId = `vcr_${crypto.randomBytes(6).toString('hex')}`;
  const session = new Session({
    sessionId,
    seedDomain,
    status: 'running',
    stages: {
      stage0: { status: 'pending', startedAt: null, completedAt: null, output: null },
      stage1: { status: 'pending', startedAt: null, completedAt: null, output: null },
      stage2: { status: 'pending', startedAt: null, completedAt: null, output: null },
      stage3: { status: 'pending', startedAt: null, completedAt: null, output: null },
      stage4: { status: 'pending', startedAt: null, completedAt: null, output: null }
    }
  });
  return await session.save();
}

/**
 * Retrieves a session by its unique ID.
 * @param {string} sessionId
 * @returns {Promise<OutreachSession|null>}
 */
export async function getSession(sessionId) {
  return await Session.findOne({ sessionId });
}

/**
 * Updates an existing session by merging patch fields.
 * @param {string} sessionId
 * @param {Partial<OutreachSession>} patch
 * @returns {Promise<OutreachSession>}
 */
export async function updateSession(sessionId, patch) {
  // If patch contains nested updates (like stages), let's ensure we do a flat map key mapping 
  // or construct dot-notation updates to avoid wiping out other keys in subdocuments.
  const updateQuery = {};
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'stages') {
      for (const [stageKey, stageVal] of Object.entries(value)) {
        for (const [propKey, propVal] of Object.entries(stageVal)) {
          updateQuery[`stages.${stageKey}.${propKey}`] = propVal;
        }
      }
    } else if (key === 'summary') {
      for (const [sumKey, sumVal] of Object.entries(value)) {
        updateQuery[`summary.${sumKey}`] = sumVal;
      }
    } else {
      updateQuery[key] = value;
    }
  }

  return await Session.findOneAndUpdate(
    { sessionId },
    { $set: updateQuery },
    { new: true }
  );
}

/**
 * Lists all sessions, ordered from most recent to oldest.
 * @returns {Promise<OutreachSession[]>}
 */
export async function listSessions() {
  return await Session.find().sort({ createdAt: -1 });
}

/**
 * Appends a log event to a session's history log.
 * @param {string} sessionId
 * @param {Omit<SessionEvent, 'ts'>} event
 * @returns {Promise<OutreachSession>}
 */
export async function appendEvent(sessionId, event) {
  return await Session.findOneAndUpdate(
    { sessionId },
    { $push: { events: { ...event, ts: new Date() } } },
    { new: true }
  );
}
