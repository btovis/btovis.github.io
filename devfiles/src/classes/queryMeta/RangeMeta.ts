export default class RangeMeta {
    // if length 0, then invalid, ie, no such column
    // if length 3, valid
    private value: [] | [low: string, up: string, colI: number];
    public constructor(arr) {
        this.value = arr;
    }

    public colI(): number {
        return this.value[2];
    }
    public low(): string {
        return this.value[0];
    }
    public up(): string {
        return this.value[1];
    }
}
