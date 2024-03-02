import { QueryType, SwappableRangeQueryT } from './Query';

export default class SwappableRangeQuery {
    colI: number;
    public constructor(columnIndex) {
        this.colI = columnIndex;
    }
    public query(low: number | string, up: number | string): SwappableRangeQueryT {
        return [this.colI, QueryType.SwappableRange, low, up];
    }
}
