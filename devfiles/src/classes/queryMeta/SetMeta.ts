import ReferenceSet from '../data/setutils/ReferenceSet';

export default class SetMeta {
    // Note: don't modify this
    // Reread from value when got a signal that CSV added or CSV removed
    public value: ReferenceSet;
    public constructor(s) {
        this.value = s;
    }
}
