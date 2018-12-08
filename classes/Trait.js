
const validateInteger = require('../helpers/validateInteger');

/**
 * Stores the properties for individual traits.
 * @type {WeakMap<Trait, number>}
 */
const values = new WeakMap();

class Trait {

    /**
     * Create a new trait
     * @param options
     * @param {string} options.name - name for the trait
     * @param {number} [options.dots=0] - integer between 0 and 10 for the number of dots to put in the trait initially
     * @throws Error if name is not a non-empty string.
     * @throws Error if dots is not an integer between 0 and 10.
     */
    constructor({name, dots = 0}){
        // Validate the inputs
        if (!name || typeof name !== 'string') throw new Error("Trait.name must be a non-empty string.");

        // Store the properties.
        /**
         * Name of the trait.
         * @type {string}
         */
        this.name = name;

        /**
         * The number of dots in the trait.
         * @type {number}
         */
        this.dots = dots;

        // Freeze the object to prevent uncontrolled changes.
        Object.freeze(this);
    }

    /**
     * The number of dots in this trait.
     * @returns {number}
     */
    get dots() {
        return values.get(this);
    }

    /**
     * Set number of dots in this trait.
     * @param {number} value
     * @throws Error if value is not an integer between 0 and 10.
     */
    set dots(value) {
        if (!validateInteger(value, 0, 10)) throw new Error("Trait.value must be an integer between 0 and 10.");
        values.set(this, value);
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
