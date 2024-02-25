function setDifferenceNew(a: Set<any>, b: Set<any>) {
    // @ts-expect-error: Use new feature if possible
    return a.difference(b);
}

function setDifferenceOld(a: Set<any>, b: Set<any>) {
    const s2 = new Set();
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
