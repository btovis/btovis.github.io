export default class RangeMeta {
    // -Infinity, +Infinity, undefined when no data loaded or data doesn't have time
    public value: [low: number | Date, up: number | Date, colI: number | undefined];
    public constructor(arr) {
        this.value = arr;
    }
}