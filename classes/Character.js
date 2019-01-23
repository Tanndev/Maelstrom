const util = require('util');

const DataStore = require('./DataStore');

/**
 * Stores {@link Character#name} values.
 * @type {WeakMap<Character, string>}
 */
const names = new WeakMap();

/**
 * Stores {@link Character#concept} values.
 * @type {WeakMap<Character, string>}
 */
const concepts = new WeakMap();

/**
 * Stores {@link Character#campaign} values.
 * @type {WeakMap<Character, string>}
 */
const campaigns = new WeakMap();

/**
 * Stores {@link Character#player} values.
 * @type {WeakMap<Character, string>}
 */
const players = new WeakMap();

/**
 * Stores {@link Character#experience} values.
 * @type {WeakMap<object, CharacterExperience>}
 */
const experienceValues = new WeakMap();

class Character {
    constructor(source = {}) {
        // Extract character information
        let {name, concept, campaign, player} = source;
        this.name = name;
        this.concept = concept;
        this.campaign = campaign;
        this.player = player;

        // Extract experience information
        this.experience = source.experience;

        // Extract trait information
        // TODO Parse these to objects
        this.attributes = source.attributes;
        this.abilities = source.abilities;
        this.willpower = source.willpower;
    }

    /**
     * The name of the character.
     * @return {string}
     */
    get name() {
        return names.get(this) || '';
    }

    set name(value) {
        // TODO Validate value.
        names.set(this, value);
    }

    /**
     * The concept of the character.
     * @return {string}
     */
    get concept() {
        return concepts.get(this) || '';
    }

    set concept(value) {
        // TODO Validate value.
        concepts.set(this, value);
    }

    /**
     * The campaign the character is in.
     * TODO Make this some kind of campaign object.
     * @return {string}
     */
    get campaign() {
        return campaigns.get(this) || '';
    }

    set campaign(value) {
        // TODO Validate value.
        campaigns.set(this, value);
    }

    /**
     * The player running the character.
     * TODO Make this some kind of player object.
     * @return {string}
     */
    get player() {
        return players.get(this) || '';
    }

    set player(value) {
        // TODO Validate value.
        players.set(this, value);
    }

    /**
     * The amount of experience points accrued by the character, along with the amount currently available.
     * @return {CharacterExperience}
     */
    get experience() {
        return experienceValues.get(this);
    }

    set experience(value) {
        experienceValues.set(this, new CharacterExperience(value))
    }

    // TODO Add traits

    /**
     * Converts this to a generic object.
     * @return {object}
     */
    toJSON() {
        // noinspection JSUnusedLocalSymbols
        let {name, concept, campaign, player, experience, ...properties} = this;
        return {name, concept, campaign, player,...properties};
    }

    /**
     * Overrides the default util.inspect behavior to use {@link Character#toJSON} instead.
     */
    [util.inspect.custom]() {
        return this.toJSON();
    }
}

const earnedExp = new WeakMap();
const freeExp = new WeakMap();
class CharacterExperience{
    constructor({earned = 0, free = 0} = {}) {
        this.earned = earned;
        this.free = free;
    }

    get earned(){
        earnedExp.get(this);
    }

    set earned(value){
        // TODO Validate value.
        earnedExp.set(this, value);
    }

    get free(){
        freeExp.get(this);
    }

    set free(value){
        // TODO Validate value.
        freeExp.set(this, value);
    }
}

module.exports = Character;
