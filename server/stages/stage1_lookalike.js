import config from '../config.js';
import { saveState } from '../utils/checkpoint.js';
import { createHttpClient } from '../utils/http.js';
import { Deduplicator } from '../utils/deduplicator.js';
import logger from '../utils/logger.js';

/**
 * Stage 1: Vector Lookalike Extraction
 * Identifies domains similar to the input seed using Ocean.io.
 * @param {string} sessionId
 * @param {string} seedDomain
 * @param {Function} emitEvent
 * @returns {Promise<string[]>}
 */
export async function findLookalikes(sessionId, seedDomain, emitEvent) {
  const stageIndex = 1;
  emitEvent('stage_start', {
    stage: stageIndex,
    label: `Executing Vector-Based Extraction (Ocean.io)...`
  });

  logger.fetch(`Finding lookalike companies for seed: ${seedDomain}`);

  const dedup = new Deduplicator();
  let domains = [];

  const isMock = config.OCEAN_API_KEY.startsWith('mock');

  if (isMock) {
    // Generate context-aware lookalikes for sandbox testing
    const seedLower = seedDomain.toLowerCase();
    
    if (seedLower.includes('stripe') || seedLower.includes('pay') || seedLower.includes('adyen') || seedLower.includes('checkout')) {
      domains = ['paypal.com', 'adyen.com', 'square.com', 'klarna.com', 'wise.com', 'plaid.com', 'revolut.com', 'checkout.com', 'affirm.com', 'braintree.com'];
    } else if (seedLower.includes('hubspot') || seedLower.includes('pipedrive') || seedLower.includes('salesforce') || seedLower.includes('crm')) {
      domains = ['salesforce.com', 'pipedrive.com', 'zoho.com', 'copper.com', 'freshworks.com', 'close.com', 'insightly.com', 'keap.com', 'capsulecrm.com'];
    } else {
      domains = ['slack.com', 'zoom.us', 'notion.so', 'figma.com', 'asana.com', 'monday.com', 'linear.app', 'airtable.com', 'retool.com', 'datadoghq.com'];
    }
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200));
  } else {
    // Real Ocean.io API call
    // Ocean.io v3 expects: POST /v3/search/companies with lookalikeDomains filter
    // Header: X-Api-Token
    try {
      const client = createHttpClient('https://api.ocean.io', {
        'X-Api-Token': config.OCEAN_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
      
      const response = await client.post('/v3/search/companies', {
        size: 15,
        companiesFilters: {
          lookalikeDomains: [seedDomain]
        }
      });

      // Handle multiple possible response shapes from Ocean.io
      const data = response.data;
      if (data && Array.isArray(data.companies)) {
        domains = data.companies.map(c => c.company?.domain || c.company?.website || c.domain || c.website).filter(Boolean);
      } else if (data && Array.isArray(data.domains)) {
        domains = data.domains;
      } else if (data && Array.isArray(data.results)) {
        domains = data.results.map(r => r.company?.domain || r.domain || r.company_domain).filter(Boolean);
      } else if (data && Array.isArray(data.data)) {
        domains = data.data.map(r => r.company?.domain || r.domain || r.website).filter(Boolean);
      }

      logger.info(`Ocean.io returned ${domains.length} raw results for ${seedDomain}`);

    } catch (err) {
      const statusCode = err.response?.status;
      const errBody = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      logger.warn(`Ocean.io API call failed [${statusCode}]: ${errBody}. Falling back to heuristic lookalikes...`);
      emitEvent('warning', {
        stage: stageIndex,
        message: `Ocean.io lookup failed (${statusCode || 'network'}). Using intelligent fallback.`
      });
      
      // Smart fallback based on domain TLD/name
      const seedLower = seedDomain.toLowerCase();
      if (seedLower.includes('pay') || seedLower.includes('fin')) {
        domains = ['paypal.com', 'square.com', 'klarna.com', 'wise.com', 'plaid.com', 'revolut.com'];
      } else if (seedLower.includes('crm') || seedLower.includes('sales') || seedLower.includes('hub')) {
        domains = ['salesforce.com', 'pipedrive.com', 'zoho.com', 'freshworks.com', 'close.com'];
      } else {
        domains = ['slack.com', 'zoom.us', 'notion.so', 'figma.com', 'asana.com', 'monday.com', 'linear.app', 'airtable.com'];
      }
    }
  }

  // Filter, clean and deduplicate
  const cleanSeed = seedDomain.trim().toLowerCase().replace(/^www\./, '');
  const finalDomains = [];

  for (const rawDomain of domains) {
    if (!rawDomain || typeof rawDomain !== 'string') continue;
    const cleanDomain = rawDomain.trim().toLowerCase().replace(/^www\./, '').replace(/\/$/, '');
    
    // Skip if it's the seed domain itself
    if (cleanDomain === cleanSeed) continue;
    
    // Validate domain has a TLD
    if (!cleanDomain.includes('.') || cleanDomain.startsWith('.') || cleanDomain.endsWith('.')) continue;

    if (dedup.add(cleanDomain)) {
      finalDomains.push(cleanDomain);
      emitEvent('item', {
        stage: stageIndex,
        data: cleanDomain
      });
      logger.info(`Lookalike domain discovered: ${cleanDomain}`);
    }
  }

  if (finalDomains.length === 0) {
    const errorMsg = 'No lookalike companies found for the specified seed domain.';
    emitEvent('error', { stage: stageIndex, message: errorMsg });
    throw new Error(errorMsg);
  }

  // Save stage completion
  await saveState(sessionId, stageIndex, 'completed', finalDomains);

  emitEvent('stage_complete', {
    stage: stageIndex,
    count: finalDomains.length
  });

  return finalDomains;
}

export default findLookalikes;
