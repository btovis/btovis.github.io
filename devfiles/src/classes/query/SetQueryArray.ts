import { Query, QueryType } from './Query';

export default class SetQueryArray {
    colI: any;
    public constructor(columnIndex) {
        this.colI = columnIndex;
    }
    public query(stringArrayOfAccept: string[]): Query {
        return [this.colI, QueryType.SetAsArray, stringArrayOfAccept];
    }
}
