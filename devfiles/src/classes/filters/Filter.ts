import ReferenceSet from '../data/setutils/ReferenceSet';

// (Can call constructor every time)
// When data is updated, call updateSetReference (since it keeps internal ref of the whole set,
// even if the ref hasn't changed, reconsiders it)
// When filter is updated, (see individual filters' API), call update function
// then call getPredicateForData

// just after calling constructor, no need to call updateSetReference.

abstract class Filter {
    // + Constructor: call with set and options
    public abstract updateSetReference(set: ReferenceSet);
    public abstract getPredicate(): [PredicateType, undefined | ((a) => boolean)] | unknown[];
}

enum PredicateType {
    Transparent, // all data items succeed
    Opaque, // all data items fail
    CheckEveryItem
}

export { Filter, PredicateType };
