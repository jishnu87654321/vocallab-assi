import axios from 'axios';
import logger from './logger.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Creates an Axios HTTP client preconfigured with automatic logging, rate-limit 429 handling, and server 5xx retries.
 * @param {string} baseURL - API root URL
 * @param {Object} [defaultHeaders] - Default headers to send
 * @returns {import('axios').AxiosInstance}
 */
export function createHttpClient(baseURL, defaultHeaders = {}) {
  const instance = axios.create({
    baseURL,
    headers: defaultHeaders,
    timeout: 15000 // 15 seconds timeout
  });

  // Request logging interceptor
  instance.interceptors.request.use(config => {
    const method = (config.method || 'GET').toUpperCase();
    const fullURL = `${config.baseURL || ''}${config.url || ''}`;
    logger.http(method, fullURL);
    return config;
  }, error => {
    return Promise.reject(error);
  });

  // Response error handling and retry interceptor
  instance.interceptors.response.use(
    response => response,
    async error => {
      const { config, response } = error;
      if (!config) {
        return Promise.reject(error);
      }

      // Initialize tracking variables on config
      config._retryCount = config._retryCount || 0;
      config._hasRateLimitRetried = config._hasRateLimitRetried || false;

      // 1. Rate Limit handling (429) -> Retry exactly ONCE
      if (response && response.status === 429 && !config._hasRateLimitRetried) {
        config._hasRateLimitRetried = true;
        const retryAfter = response.headers['retry-after'];
        let delayMs = 2000; // default 2 seconds

        if (retryAfter) {
          const parsed = parseInt(retryAfter, 10);
          if (!isNaN(parsed)) {
            // Header is typically in seconds. Convert to ms if it is small,
            // otherwise use it directly if it seems to be in ms already.
            delayMs = parsed < 1000 ? parsed * 1000 : parsed;
          }
        }

        logger.warn(`[HTTP] Rate limit (429) hit. Retry-After: ${delayMs}ms. Retrying once...`);
        await sleep(delayMs);
        return instance(config);
      }

      // 2. Server failures (5xx) -> Retry up to 3 times with exponential backoff (1s, 2s, 4s)
      if (response && response.status >= 500 && response.status < 600 && config._retryCount < 3) {
        config._retryCount += 1;
        const delayMs = Math.pow(2, config._retryCount - 1) * 1000; // 1s, 2s, 4s
        logger.warn(`[HTTP] Server error ${response.status} received. Retry attempt ${config._retryCount}/3 in ${delayMs}ms...`);
        await sleep(delayMs);
        return instance(config);
      }

      // 3. Network connection dropouts (no response) -> Retry once after 1s
      if (!response && config._retryCount < 1) {
        config._retryCount += 1;
        logger.warn(`[HTTP] Network connection error. Retrying once in 1000ms...`);
        await sleep(1000);
        return instance(config);
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

export default createHttpClient;
