/*
 * Copyright (c) 2018 James Tanner
 */

const util = require('util');

const validateInteger = require('../helpers/validateInteger');

/**
 * Stores the properties for individual traits.
 * @type {WeakMap<Trait, number>}
 */
const values = new WeakMap();

/**
 * Class representing a specific trait for a character.
 * TODO Include rules reference.
 * @see Trait.constructor
 */
class Trait {

    /**
     * Create a new trait
     * @param options - Parameters to construct the trait.
     * @param {string} options.name - The name to give the trait. See {@link Trait#name}.
     * @param {number} [options.dots=0] - The number of dots to put in the trait initially. See {@link Trait#dots}.
     * @throws Error if name is not a non-empty string.
     * @throws Error if dots is not an integer between 0 and 10.
     */
    constructor({name, dots = 0}){
        // Validate the inputs
        if (!name || typeof name !== 'string') throw new Error("Parameter 'name' must be a non-empty string.");

        // Store the properties.
        /**
         * The name for the trait as it would be on a character sheet.
         * Must be a non-empty string.
         * @type {string}
         */
        this.name = name;

        /**
         * The number of dots in the trait.
         * Must be an integer between 1 and 10.
         * @type {number}
         */
        this.dots = dots;

        // Freeze the object to prevent uncontrolled changes.
        Object.freeze(this);
    }

    /**
     * @returns {number}
     */
    get dots() {
        return values.get(this);
    }

    /**
     * @param {number} dots
     * @throws Error if value is not an integer between 0 and 10.
     */
    set dots(dots) {
        if (!validateInteger(dots, 0, 10)) throw new Error("Parameter 'dots' must be an integer between 0 and 10.");
        values.set(this, dots);
    }

    toString() {
        return `${this.name}: ${this.dots}`;
    }

    /**
     * Converts this roll to a generic object.
     * Note: The new object will not have the {@link Roll._normalDice} and {@link Roll._bonusDice} properties.
     * @return {object}
     */
    toJSON() {
        // noinspection JSUnusedLocalSymbols
        let {...properties} = this;
        return properties;
    }

    /**
     * Overrides the default util.inspect behavior to use {@link Roll.toJSON} instead.
     */
    [util.inspect.custom]() {
        return this.toJSON();
    }
}

module.exports = Trait;
