export default class RangeMeta {
    // if length 0, then invalid, ie, no such column
    // if length 3, valid
    public value: [] | [low: string, up: string, colI: number];
    public constructor(arr) {
        this.value = arr;
    }
}
