/*
 * Copyright (c) 2018 James Tanner
 */

const util = require('util');

const Die = require('./Die');
const validateInteger = require('../helpers/validateInteger');

/**
 * Stored values for a Roll instance
 * @typedef {object} RollValues
 * @property {number} pool
 * @property {number} difficulty
 * @property {number} threshold
 * @property {boolean} specialty
 * @property {Die[]} dice
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
        let dice = Array.from({length: pool}, () => {return new Die()});
        let successes = 0 - threshold;
        let failures = 0;
        for (let die of dice){
            let result = die.result;
            // If using a specialty, 10s add bonus dice.
            if (result === 10 && specialty) {
                successes++;
                dice.push(new Die({isBonus: true}));
            }
            // Anything equal to or greater than the difficulty adds a success.
            else if (result >= difficulty)successes++;
            // Ones add failures, except for bonus dice.
            else if (result === 1 && !die.isBonus) failures++;
        }
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

    /**
     * Default serializer
     * @return {object}
     */
    toJSON() {
        let {dice, ...properties} = values.get(this);
        properties.dice = dice.slice();
        return properties;
    }

    [util.inspect.custom](){
        return this.toJSON();
    }
}

module.exports = Roll;
