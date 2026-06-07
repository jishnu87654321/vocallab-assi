import config from '../config.js';
import { saveState } from '../utils/checkpoint.js';
import logger from '../utils/logger.js';

/**
 * Stage 0: Initializer
 * Bootstraps the pipeline, verifies environment sanity, and prepares execution logs.
 * @param {string} sessionId
 * @param {string} seedDomain
 * @param {Function} emitEvent - Callback to emit SSE events
 * @returns {Promise<Object>}
 */
export async function initEngine(sessionId, seedDomain, emitEvent) {
  const stageIndex = 0;
  
  emitEvent('stage_start', {
    stage: stageIndex,
    label: `Bootstrapping campaign for ${seedDomain}...`
  });

  logger.init(`Starting ReachFlow pipeline run for domain: ${seedDomain}`);

  // Validate all required API keys are present (not empty/placeholder)
  const missingKeys = [];
  const requiredKeys = ['OCEAN_API_KEY', 'PROSPEO_API_KEY', 'BREVO_API_KEY'];
  for (const k of requiredKeys) {
    if (!config[k] || config[k] === 'placeholder') {
      missingKeys.push(k);
    }
  }

  if (missingKeys.length > 0) {
    const errorMsg = `Configuration missing keys: ${missingKeys.join(', ')}`;
    emitEvent('error', { stage: stageIndex, message: errorMsg });
    throw new Error(errorMsg);
  }

  const output = {
    sessionId,
    seedDomain,
    state: 'READY',
    metadata: {
      version: '1.0.0',
      brand: 'ReachFlow',
      website: 'reachflow.fit'
    },
    quotas: {
      burst: 500,
      ttl: 3600
    }
  };

  // Brief initialization delay
  await new Promise(r => setTimeout(r, 400));

  await saveState(sessionId, stageIndex, 'completed', output);

  emitEvent('stage_complete', {
    stage: stageIndex,
    count: 1
  });

  return output;
}

export default initEngine;
