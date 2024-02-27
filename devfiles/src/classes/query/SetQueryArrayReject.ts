import { Query, QueryType } from './Query';

export default class SetQueryArrayReject {
    colI: any;
    public constructor(columnIndex) {
        this.colI = columnIndex;
    }
    // 0 or false for disable all, 1 or true for enable all, 2 for invert selection
    public query(stringArrayOfReject: string[]): Query {
        return [this.colI, QueryType.SetAsArrayForReject, stringArrayOfReject];
    }
}
