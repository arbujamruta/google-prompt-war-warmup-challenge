/**
 * Utility functions for FinBuddy
 * Extracted for Code Quality and Unit Testing purposes.
 */

/**
 * Calculates compound interest amount
 * @param {number} p - Principal amount
 * @param {number} r - Annual interest rate (0-100)
 * @param {number} t - Time in years
 * @returns {number} Final amount
 */
function calculateCompoundInterestAmount(p, r, t) {
    if (p < 0 || r < 0 || t < 0) return 0;
    return p * Math.pow(1 + (r / 100), t);
}

/**
 * Calculates learning progress percentage
 * @param {number} learned - Number of topics learned
 * @param {number} total - Total number of topics
 * @returns {number} Percentage from 0 to 100
 */
function calculateProgress(learned, total) {
    if (total <= 0) return 0;
    if (learned < 0) return 0;
    if (learned > total) return 100;
    return (learned / total) * 100;
}

// Export for Node.js Testing (Jest), do nothing in browser environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        calculateCompoundInterestAmount, 
        calculateProgress 
    };
}
