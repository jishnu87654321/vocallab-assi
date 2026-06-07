import crypto from 'crypto';

/**
 * Deduplicator tracks unique nodes by keeping a set of SHA-256 hashed entity IDs.
 * Fits the pure function contract where all logic is encapsulated and self-contained.
 */
export class Deduplicator {
  constructor() {
    this.seenHashes = new Set();
  }

  /**
   * Computes a SHA-256 hash of an entity identifier.
   * @param {string} id - The raw ID (e.g., domain, LinkedIn URL)
   * @returns {string} Hashed string
   */
  hash(id) {
    return crypto.createHash('sha256').update(String(id).trim().toLowerCase()).digest('hex');
  }

  /**
   * Checks if an identifier is unique and adds it to the set if it is.
   * @param {string} id - The raw ID
   * @returns {boolean} True if the ID is unique (first time seen), false if it is a duplicate
   */
  add(id) {
    if (!id) return false;
    const hashed = this.hash(id);
    if (this.seenHashes.has(hashed)) {
      return false;
    }
    this.seenHashes.add(hashed);
    return true;
  }

  /**
   * Checks if the identifier has been seen before without adding it.
   * @param {string} id - The raw ID
   * @returns {boolean} True if it is unique (has not been seen), false if it was already seen
   */
  isUnique(id) {
    if (!id) return false;
    const hashed = this.hash(id);
    return !this.seenHashes.has(hashed);
  }
}

export default Deduplicator;
