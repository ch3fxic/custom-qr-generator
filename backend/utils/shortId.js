const { customAlphabet } = require('nanoid');

// Create a custom alphabet without ambiguous characters
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8);

/**
 * Generate a short unique ID for URLs
 * @returns {string} Short ID (8 characters)
 */
const generateShortId = () => {
  return nanoid();
};

/**
 * Validate if a string is a valid short ID format
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
const isValidShortId = (id) => {
  return /^[0-9A-Za-z]{8}$/.test(id);
};

module.exports = {
  generateShortId,
  isValidShortId
};
