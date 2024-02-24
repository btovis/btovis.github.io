export default class RangeMeta {
    // -Infinity, +Infinity, undefined when no data loaded or data doesn't have time
    public value: [low: number | string, up: number | string, colI: number | undefined];
    public constructor(arr) {
        this.value = arr;
    }
}
