function setDifferenceNew<T>(a: Set<T>, b: Set<T>): Set<T> {
    // @ts-expect-error: Use new feature if possible
    return a.difference(b);
}

function setDifferenceOld<T>(a: Set<T>, b: Set<T>): Set<T> {
    const s2: Set<T> = new Set();
    for (const x of a) {
        if (!b.has(x)) {
            s2.add(x);
        }
    }
    return s2;
}

// @ts-expect-error: Use new feature if possible
const setDifference = new Set().difference ? setDifferenceNew : setDifferenceOld;

export { setDifference };
