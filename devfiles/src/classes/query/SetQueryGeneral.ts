import { QueryType } from './Query';

export default class SetQuery {
    colI: any;
    public constructor(columnIndex) {
        this.colI = columnIndex;
    }
    // 0 or false for disable all, 1 or true for enable all, 2 for invert selection
    public query(mode: boolean | number) {
        return [this.colI, QueryType.Set, mode];
    }
}
