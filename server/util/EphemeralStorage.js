/**
 * @typedef {Object} StorageEntry
 * @prop {number} addedAt The Unix Timestamp of the time when this entry was added to storage.
 * @prop {number} expire The time (in milliseconds) that this entry is valid for since {@link StorageEntry.addedAt}.
 * @prop {unknown} value The value stored by this entry.
 */

const deepMerge = require("./object");

/**
 * @typedef {Object} _ESOAutoPrune
 * @prop {number} interval The interval, in milliseconds, for the prune to occur.
 */

/**
 * @typedef {_ESOAutoPrune | false} ESOAutoPrune
 */

/**
 * @typedef {Object} EphemeralStorageOptions
 * @prop {ESOAutoPrune} autoPrune Controls whether the system should prune expired entries on a given interval.
 * @prop {boolean} pruneDeadOnAccess Whether the system should prune expired entries on every access to any property
 * @prop {boolean} refreshOnAccess Whether the system should refresh the expiration date on an entry when accessing it.
 * @prop {number} ttl The default Time-To-Live for any new entry, if not overriden.
 */

/**
 * @type {EphemeralStorageOptions}
 */
const DEFAULTS = { 
    autoPrune: {
        interval: 1000
    },
    pruneDeadOnAccess: false,
    refreshOnAccess: true,
    ttl: 1000
};

/**
 * Ephemeral Storage is a storage class that regularly prunes entries based on their expiration intervals
 */
class EphemeralStorage {
    /**
     * @param {Partial<EphemeralStorageOptions>} options 
     */
    constructor(options = DEFAULTS) {
        /** @type {EphemeralStorageOptions} */
        this._options = deepMerge(DEFAULTS, options);
        if (this._options.autoPrune) this._pruneTimer = setInterval(this._prune.bind(this), this._options.autoPrune.interval);

        /** @type {Map<string, StorageEntry>} */
        this.storage = new Map();
    }

    /**
     * Removes expired entries from the storage. Called by either the autoprunning timer, or entry accessors.
     */
    _prune() {
        // console.log("ES AUTOPRUNE")
        for (const [k, v] of this.storage) {
            if (v.addedAt + v.expire <= Date.now()) {
                // console.log(`PRUNNED:`, k, v)
                this.storage.delete(k);
            }
        }
    }

    /**
     * Determines whether a given key has an entry associated with it in storage.
     * @param {string} key The key for the query.
     * @returns {boolean}
     */
    has(key) {
        if (this._options.refreshOnAccess) this.refresh(key);
        if (this._options.pruneDeadOnAccess) this._prune();
        return this.storage.has(key);
    }

    /**
     * Fetches the value assossicated with the given key from storage, or undefined if it doesn't exist.
     *
     * @param {string} key The key for the query.
     * @returns {unknown}
     */
    get(key) {
        if (!this.storage.has(key)) return undefined;

        if (this._options.refreshOnAccess) this.refresh(key);
        if (this._options.pruneDeadOnAccess) this._prune();
        return this.storage.get(key).value;
    }

    /**
     * Stores a given value, optionally with a Time To Live, in milliseconds.
     * 
     * @param {string} key The entry key to be assossiated with the value.
     * @param {unknown} value The value to store.
     * @param {number=} ttl The Time To Live for this value in storage.
     * @returns {boolean} `true`, if the key didn't already exist, `false` otherwise.
     */
    add(key, value, ttl = this._options.ttl) {
        if (this._options.pruneDeadOnAccess) this._prune();
        if (this.storage.has(key)) return false;

        this.storage.set(key, {
            addedAt: Date.now(),
            expire: ttl,
            value: value
        });
        return true;
    }

    /**
     * Modifies a given stored value associated with a given key.
     * If no entry exists with the given key, a new entry will be created.
     * 
     * @param {string} key The key associated with the target entry.
     * @param {unknown} value The new value to store on the entry.
     */
    set(key, value) {
        if (this.storage.has(key)) {
            this.storage.get(key).value = value;
            if (this._options.refreshOnAccess) this.refresh(key);
        } else {
            this.add(key, value);
        }

        if (this._options.pruneDeadOnAccess) this._prune();
    }

    /**
     * 
     * @param {string} key The key associated with the target entry.
     * @param {number=} ttl The new Time To Live for the entry. If omitted, the original TTL will be preserved.
     * @returns {boolean} `true`, if the entry existed, `false` otherwise.
     */
    refresh(key, ttl = undefined) {
        if (this._options.pruneDeadOnAccess) this._prune();
        if (!this.storage.has(key)) return false;

        const entry = this.storage.get(key);
        entry.addedAt = Date.now();
        if (ttl) entry.ttl = ttl;
        
        return true;
    }
}

module.exports = EphemeralStorage;