/*
 * Copyright (c) 2018 James Tanner
 */

const Chance = require('chance');
const chance = new Chance();

/**
 * Stored values for a Roll instance
 * @typedef {object} RollValues
 * @property {number} pool
 * @property {number} difficulty
 * @property {number} threshold
 * @property {boolean} specialty
 * @property {number[]} dice
 * @property {number} result
 */

/**
 * Stores values for the roll instance so they cannot be accessed and altered outside the Roll class.
 * @type {WeakMap<Roll, RollValues>}
 */
let values = new WeakMap();

class Roll {

    /**
     * Create a new Roll
     * TODO Add record of traits used.
     * @param {number} pool - Integer between 1 and 10 for dice pool value (See Rules: Actions > Dice Pool)
     * @param {number} [difficulty=6] - Integer between 2 and 9 for difficulty value (See Rules: Actions > Difficulty)
     * @param {number} [threshold=0] - Zero or positive integer for threshold value (See Rules: Actions > Threshold)
     * @param {boolean} [specialty=false] - Whether or not a specialty applies (See Rules: Actions > Specialty)
     */
    constructor({pool, difficulty = 6, threshold = 0, specialty = false}) {
        // Validate the inputs
        if (!validateInteger(pool, 1, 10)) throw new Error("Roll.pool must be an integer between 0 and 10");
        if (!validateInteger(difficulty, 2, 9)) throw new Error("Roll.difficulty must be an integer between 2 and 9");
        if (!validateInteger(threshold)) throw new Error("Roll.threshold must be a positive integer or zero");
        if (typeof specialty !== 'boolean') throw new Error("Roll.specialty must be a boolean value");

        // Roll the dice.
        let dice = chance.n(chance.natural, pool, {min: 1, max: 10});
        let successes = 0 - threshold;
        let failures = 0;
        dice.forEach(die => {
           if (die >= difficulty) successes++;
           else if (die === 1) failures++;
        });
        let result = successes - failures;
        if ((successes || !failures) && result < 0) result = 0;

        // Lock and store the properties.
        let properties = {pool, difficulty, threshold, specialty, dice, result};
        Object.seal(properties);
        values.set(this, properties);
    }

    get pool() {
        return values.get(this).pool;
    }

    get difficulty() {
        return values.get(this).difficulty;
    }

    get threshold() {
        return values.get(this).threshold;
    }

    get dice() {
        return values.get(this).dice;
    }

    get result() {
        return values.get(this).result;
    }

    get succeeded() {
        return this.result > 0;
    }

    get failed() {
        return this.result === 0;
    }

    get botched() {
        return this.result < 0;
    }

    /**
     * Roll again with the same parameters.
     * @returns {Roll} - A new roll instance
     */
    reroll() {
        return new Roll(values.get(this));
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Default serializer
     * @return {object}
     */
    toJSON(){
        let {dice, ...properties} = values.get(this);
        properties.dice = dice.slice();
        return properties;
    }
}

module.exports = Roll;

function validateInteger(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
    return Number.isInteger(value) && value >= min && value <= max;
}
