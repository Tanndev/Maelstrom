/**
 * Stores the properties for individual traits.
 * @type {WeakMap<Trait, number>}
 */
const values = new WeakMap();

class Trait {
    constructor({name, value = 0}){
        // TODO Safety check the name.
        this.name = name;

        // Store the value.
        this.value = value;

        // Freeze the object to prevent uncontrolled changes.
        Object.freeze(this);
    }

    get value() {
        return values.get(this);
    }

    set value(value) {
        // TODO Safety check value.
    }
}

module.exports = Trait;
