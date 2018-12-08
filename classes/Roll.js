/*
 * Copyright (c) 2018 James Tanner
 */

const Chance = require('chance');
const util = require('util');

const Trait = require('./Trait');
const validateInteger = require('../helpers/validateInteger');

// Initialize Chance
const chance = new Chance();

/**
 * Class representing the result of rolling one or more dice.
 */
class Roll {
    /**
     * Create a new {@link Roll} based on one or two {@link Trait} instances.
     * The new roll will be labeled with the name(s) of the trait(s) used.
     *
     * @param {Trait} attribute - The first trait for the roll, usually an attribute.
     * @param {Trait} [ability] - The second trait for the roll, usually an ability.
     * @param [options] - Optional parameters for the roll, to be passed to {@link Roll.constructor}.
     * @param {number} [options.difficulty] - See {@link Roll#difficulty}.
     * @param {number} [options.threshold] - See {@link Roll#threshold}.
     * @param {boolean} [options.specialty] - See {@link Roll#specialty}.
     * @return {Roll} A new roll based on the dots in the provided traits.
     * @throws Error if the attribute isn't a Trait instance.
     * @throws Error if the ability isn't null, undefined, or a Trait instance.
     * @throws Error if {@link Roll.constructor} would throw an error.
     */
    static traits(attribute, ability = null, {difficulty, threshold, specialty} = {}){
        // Validate the inputs
        if (!attribute || !(attribute instanceof Trait)) throw new Error("Parameter 'attribute' must be a Trait.");
        if (ability && !(ability instanceof Trait)) throw new Error("Parameter 'ability' must be a Trait if provided.");
        let pool = ability ? attribute.dots + ability.dots : attribute.dots;
        let label = ability ? `${attribute.name} + ${ability.name}` : attribute.name;
        return new Roll(pool, {label, difficulty, threshold, specialty});
    }

    /**
     * Create a new roll and randomly generate a result.
     *
     * @param {number} pool - Number of dice to roll. See {@link Roll#pool}.
     * @param [options] - Parameters to use creating the roll.
     * @param {string} [options.label=Default] - A label for the roll. See {@link Roll#label}.
     * @param {number} [options.difficulty=6] - The difficulty of the roll. See {@link Roll#difficulty}.
     * @param {number} [options.threshold=0] - The threshold for the roll. See {@link Roll#threshold}.
     * @param {boolean} [options.specialty=false] - Whether or not to use specialty rules. See {@link Roll#specialty}.
     * @throws Error if pool is not an integer between 1 and 10.
     * @throws Error if label is not a non-empty string.
     * @throws Error if difficulty is not an integer between 2 and 10.
     * @throws Error if threshold is not a positive integer or zero.
     * @throws Error if specialty is not a boolean.
     */
    constructor(pool, {label = "Custom Roll", difficulty = 6, threshold = 0, specialty = false} = {}) {
        // Validate the inputs
        if (!validateInteger(pool, 1, 10)) throw new Error("Parameter 'pool' must be an integer between 1 and 10.");
        if (!validateInteger(difficulty, 2, 10)) throw new Error("Parameter 'difficulty' must be an integer between 2 and 10.");
        if (!validateInteger(threshold)) throw new Error("Parameter 'threshold' must be a positive integer or zero.");
        if (!label || typeof label !== 'string') throw new Error("Parameter 'label' must be a non-empty string.");
        if (typeof specialty !== 'boolean') throw new Error("Parameter 'specialty' must be a boolean value.");

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
         * The original number of dice in the pool.
         * Note: this may be less than the actual number of dice rolled due to bonus dice generated by a specialty.
         * (See Rules: Actions > Dice Pool)
         * @type {number}
         */
        this.pool = pool;

        /**
         * Label for the roll.
         * @type {string}
         */
        this.label = label;

        /**
         * The original number of dice in the pool.
         * Note: this may be less than the actual number of dice rolled due to bonus dice generated by a specialty.
         * (See Rules: Actions > Dice Pool)
         * @type {number}
         */
        this.pool = pool;

        /**
         * The number required for a die to be a success.
         * (See Rules: Actions > Difficulty)
         * @type {number}
         */
        this.difficulty = difficulty;

        /**
         * The number of successes to remove before calculating the result.
         * (See Rules: Actions > Threshold)
         * @type {number}
         */
        this.threshold = threshold;

        /**
         * Whether or not a specialty applies.
         * Rolls using a specialty get bonus dice for rolling tens.
         * (See Rules: Actions > Specialty)
         * @type {boolean}
         */
        this.specialty = specialty;

        /**
         * Values of the normal dice rolled.
         *
         * This property should not normally be accessed directly.
         * Instead, use {@link Roll#dice} or {@link Roll#diceString}
         *
         * @type {ReadonlyArray<number>}
         */
        this._normalDice = Object.freeze(normalDice);

        /**
         * Values of any bonus dice rolled.
         *
         * This property should not normally be accessed directly.
         * Instead, use {@link Roll#dice} or {@link Roll#diceString}
         *
         * @type {ReadonlyArray<number>}
         */
        this._bonusDice = Object.freeze(bonusDice);

        // Freeze the object so it can't be modified.
        Object.freeze(this);
    }

    /**
     * The union of {@link Roll#_normalDice} and {@link Roll#_bonusDice}.
     * This returns a new array, making it safe to sort as desired.
     * @returns {number[]}
     */
    get dice() {
        return this._normalDice.concat(this._bonusDice);
    }

    /**
     * The union of {@link Roll#_normalDice} and {@link Roll#_bonusDice}, as a string.
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
        let {pool, ...properties} = this;
        return new Roll(pool, {...properties});
    }

    toString() {
        let resultString;
        if (this.succeeded) resultString = `Success x${this.result}`;
        else if (this.failed) resultString = "Failure";
        else if (this.botched) resultString = "Botch";

        let challengeString = `Difficulty: ${this.difficulty}, Pool: ${this.pool}, Threshold: ${this.threshold}`;

        return `${this.label}: ${resultString} (${challengeString}) [${this.diceString}]`
    }

    /**
     * Converts this roll to a generic object.
     * Note: The new object will not have the {@link Roll#_normalDice} and {@link Roll#_bonusDice} properties.
     * @return {object}
     */
    toJSON() {
        // noinspection JSUnusedLocalSymbols
        let {_normalDice, _bonusDice, ...properties} = this;
        properties.dice = this.dice;
        return properties;
    }

    /**
     * Overrides the default util.inspect behavior to use {@link Roll#toJSON} instead.
     */
    [util.inspect.custom]() {
        return this.toJSON();
    }
}

module.exports = Roll;
