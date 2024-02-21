import SetElement from '../data/setutils/SetElement';

export default class SpeciesMeta {
    // Note: don't modify this, but use toSorted() (for example, alphabetical toSorted(x => x[0].value) or population toSorted(x => x[1])), etc. to make a new array
    // Please don't assume any order on this
    // Reread from value when got a signal that CSV added or CSV removed
    public value: [species: SetElement, count: number][][]; // [[SetElement("Anglican skybird"), 100], [SetElement("Anglican skybird"), 150]]
    public constructor(s) {
        this.value = s;
    }
}
