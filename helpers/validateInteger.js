/*
 * Copyright (c) 2018 James Tanner
 */

/**
 * Validates that the provided value is an integer in the given range.
 * @param {number} value - value to be tested
 * @param {number} (min = 0) - minimum valid integer (inclusive)
 * @param {number} (max = Number.MAX_SAFE_INTEGER) - maximum valid integer (inclusive)
 * @returns {boolean} true iff the provided value is an integer within the provided range
 */
function validateInteger(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
    return Number.isInteger(value) && value >= min && value <= max;
}

module.exports = validateInteger;
