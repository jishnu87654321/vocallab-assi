import { updateSession, appendEvent } from './sessionStore.js';
import logger from './logger.js';

/**
 * Saves execution state for the current stage.
 * Resumes execution or provides preview checkpoint details to the client.
 * @param {string} sessionId - The session identifier
 * @param {number} stage - Stage index (0-4)
 * @param {string} status - 'completed' | 'failed'
 * @param {any} output - Stage outcome payload
 * @returns {Promise<import('../db.js').OutreachSession>}
 */
export async function saveState(sessionId, stage, status, output) {
  const now = new Date();
  
  // Format stage patch
  const stageName = `stage${stage}`;
  const stagePatch = {
    [stageName]: {
      status,
      completedAt: now,
      output
    }
  };

  logger.save(`Checkpoint written to disk for [Stage ${stage}]`);

  // Update session stage outcome
  const updatedSession = await updateSession(sessionId, {
    stages: stagePatch
  });

  return updatedSession;
}
