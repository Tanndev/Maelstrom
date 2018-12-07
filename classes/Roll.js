/*
 * Copyright (c) 2018 James Tanner
 */

const Chance = require('chance');
const util = require('util');

const validateInteger = require('../helpers/validateInteger');

// Initialize Chance
const chance = new Chance();

class Roll {

    /**
     * Create a new Roll
     * TODO Add record of traits used.
     * @param {Roll|object} options
     * @param {number} options.pool - integer between 1 and 10 for dice pool value (See Rules: Actions > Dice Pool)
     * @param {number} [options.difficulty=6] - integer between 2 and 10 for difficulty value (See Rules: Actions > Difficulty)
     * @param {number} [options.threshold=0] - zero or positive integer for threshold value (See Rules: Actions > Threshold)
     * @param {boolean} [options.specialty=false] - whether or not a specialty applies (See Rules: Actions > Specialty)
     */
    constructor(options) {
        let {pool, difficulty = 6, threshold = 0, specialty = false} = options;

        // Validate the inputs
        if (!validateInteger(pool, 1, 10)) throw new Error("Roll.pool must be an integer between 1 and 10.");
        if (!validateInteger(difficulty, 2, 10)) throw new Error("Roll.difficulty must be an integer between 2 and 10.");
        if (!validateInteger(threshold)) throw new Error("Roll.threshold must be a positive integer or zero.");
        if (typeof specialty !== 'boolean') throw new Error("Roll.specialty must be a boolean value.");

        // Roll the dice.
        let normalDice = chance.n(chance.natural, pool, {min: 1, max: 10});
        let bonusDice = [];
        let successes = 0;
        let failures = 0;
        for (let die of normalDice) {
            // If using a specialty, 10s add bonus dice.
            if (die === 10 && specialty) bonusDice.push(chance.natural({min: 1, max: 10}));

            // Anything equal to or greater than the difficulty adds a success and ones add a failure.
            if (die >= difficulty) successes++;
            else if (die === 1) failures++;
        }
        for (let die of bonusDice) {
            // Bonus dice can add more bonus dice on 10s, just like normal dice.
            if (die === 10) bonusDice.push(chance.natural({min: 1, max: 10}));

            // Bonus dice can also add successes, if they meet the difficulty. But do not add failures.
            if (die >= difficulty) successes++;
        }
        let result = successes - threshold - failures;
        if (result < 0 && failures === 0) result = 0;

        // Store the properties.
        /**
         * The final result of the roll.
         * Values greater than zero indicate that number of successes.
         * Value of zero indicates a simple failure.
         * Values of less than zero indicate a botch.
         * @type {number}
         */
        this.result = result;

        /**
         * Original number of dice rolled.
         * @type {number}
         */
        this.pool = pool;

        /**
         * Difficulty number required for a success.
         * @type {number}
         */
        this.difficulty = difficulty;

        /**
         * Number of successes immediately removed before calculating results.
         * @type {number}
         */
        this.threshold = threshold;

        /**
         * Whether or not the roll used a speciality.
         * Rolls using a specialty get bonus dice for rolling tens.
         * @type {boolean}
         */
        this.specialty = specialty;

        /**
         * Values of the normal dice rolled.
         *
         * This property should not normally be accessed directly.
         * Instead, use {@link Roll.dice} or {@link Roll.diceString}
         *
         * @type {ReadonlyArray<number>}
         */
        this._normalDice = Object.freeze(normalDice);

        /**
         * Values of any bonus dice rolled.
         *
         * This property should not normally be accessed directly.
         * Instead, use {@link Roll.dice} or {@link Roll.diceString}
         *
         * @type {ReadonlyArray<number>}
         */
        this._bonusDice = Object.freeze(bonusDice);

        // Freeze the object so it can't be modified.
        Object.freeze(this);
    }

    /**
     * The union of {@link Roll._normalDice} and {@link Roll._bonusDice}.
     * This returns a new array, making it safe to sort as desired.
     * @returns {number[]}
     */
    get dice() {
        return this._normalDice.concat(this._bonusDice);
    }

    /**
     * The union of {@link Roll._normalDice} and {@link Roll._bonusDice}, as a string.
     * @returns {string}
     */
    get diceString() {
        if (this._bonusDice.length > 0) return `${this._normalDice.join(', ')} + ${this._bonusDice.join(', ')}`;
        else return this._normalDice.join(', ');
    }

    /**
     * Returns true if this roll succeeded at all, regardless of the number of successes. Otherwise, returns false.
     * @returns {boolean}
     */
    get succeeded() {
        return this.result > 0;
    }

    /**
     * Returns true if the roll failed, but did not botch. Otherwise, returns false.
     * @returns {boolean}
     */
    get failed() {
        return this.result === 0;
    }

    /**
     * Returns true if the roll botched. Otherwise, returns false.
     * @returns {boolean}
     */
    get botched() {
        return this.result < 0;
    }

    /**
     * Roll again with the same parameters.
     * @returns {Roll} - A new roll instance
     */
    reroll() {
        return new Roll(this);
    }

    toString() {
        let resultString;
        if (this.succeeded) resultString = `Success x${this.result}`;
        else if (this.failed) resultString = "Failure";
        else if (this.botched) resultString = "Botch";

        let challengeString = `Difficulty: ${this.difficulty}, Pool: ${this.pool}`;

        return `${resultString} (${challengeString}) [${this.diceString}]`
    }

    /**
     * Converts this roll to a generic object.
     * Note: The new object will not have the {@link Roll._normalDice} and {@link Roll._bonusDice} properties.
     * @return {object}
     */
    toJSON() {
        // noinspection JSUnusedLocalSymbols
        let {_normalDice, _bonusDice, ...properties} = this;
        properties.dice = this.dice;
        return properties;
    }

    /**
     * Overrides the default util.inspect behavior to use {@link Roll.toJSON} instead.
     */
    [util.inspect.custom]() {
        return this.toJSON();
    }
}

module.exports = Roll;
