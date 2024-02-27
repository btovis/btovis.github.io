import { Query, QueryType } from './Query';

export default class SwappableRangeQuery {
    colI: any;
    public constructor(columnIndex) {
        this.colI = columnIndex;
    }
    public query(low: number | string, up: number | string): Query {
        return [this.colI, QueryType.SwappableRange, low, up];
    }
}
