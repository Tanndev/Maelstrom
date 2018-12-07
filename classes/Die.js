/*
 * Copyright (c) 2018 James Tanner
 */

const Chance = require('chance');
const util = require('util');

const validateInteger = require('../helpers/validateInteger');

// Initialize Chance
const chance = new Chance();

/**
 * Stores values for the roll instance so they cannot be accessed and altered outside the Die class.
 * @type {WeakMap<Die, object>}
 */
let values = new WeakMap();

class Die {
    /**
     *
     * @param sides
     * @param isBonus
     * @param result
     */
    constructor({sides = 10, isBonus = false, result = null} = {}) {
        // Validate the sides.
        if (!validateInteger(sides, 2, 100)) throw new Error("Die.sides must be an integer between 2 and 100");

        // Validate bonus
        if (typeof isBonus !== 'boolean') throw new Error("Die.isBonus must be a boolean value");

        // Roll a new value for result, if it's null.
        if (result === null) result = chance.natural({min: 1, max: sides});

        // Validate result.
        if (!validateInteger(result, 1, sides)) throw new Error("Die.result must be an integer between 1 and Die.sides");

        // Lock and store the properties.
        let properties = {sides, isBonus, result};
        Object.seal(properties);
        values.set(this, properties);
    }

    /**
     * Number of sides of the die.
     * @returns {number}
     */
    get sides() {
        return values.get(this).sides;
    }

    /**
     * Whether or not this is a bonus die.
     * @returns {boolean}
     */
    get isBonus() {
        return values.get(this).isBonus;
    }

    /**
     * The result of the die.
     * @returns {number}
     */
    get result() {
        return values.get(this).result;
    }

    /**
     * Returns the die as a pure object.
     * @returns {{result: Die.result, sides: Die.sides, isBonus: Die.isBonus}}
     */
    toJSON() {
        let {result, sides, isBonus} = this;
        return {result, sides, isBonus};
    }

    [util.inspect.custom]() {
        return this.toJSON();
    }
}

module.exports = Die;
