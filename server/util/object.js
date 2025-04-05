function deepMerge(objA, objB) {
    if (typeof objA !== "object" || typeof objB !== "object") throw new TypeError("Cannot merge non-objects.");

    if (Array.isArray(objA) && Array.isArray(objB)) {
        return [...objA, ...objB];
    } else if (Array.isArray(objA) || Array.isArray(objB)) {
        throw new TypeError("Cannot merge array with non-array.");
    } else {
        const nObj = {};
        const processedKeys = [];

        for (const prop in objA) {
            if (prop in objB) {
                // Merge properties that exist in both objects, or override with property in B
                if (typeof objA[prop] === "object") nObj[prop] = deepMerge(objA[prop], objB[prop]);
                else nObj[prop] = objB[prop];
            } else {
                // Add properties in A that do not exist in B
                nObj[prop] = objA[prop];
            }

            processedKeys.push(prop);
        }

        // Add properties from B that do not exist in A
        for (const prop in objB) {
            if (processedKeys.includes(prop)) continue;
            nObj[prop] = objB[prop];
        }

        return nObj;
    }
}

module.exports = deepMerge;