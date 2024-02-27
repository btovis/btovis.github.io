import { Query, QueryType } from './Query';

export default class SetQueryArrayReject {
    colI: any;
    public constructor(columnIndex) {
        this.colI = columnIndex;
    }
    public query(stringArrayOfReject: string[]): Query {
        return [this.colI, QueryType.SetAsArrayForReject, stringArrayOfReject];
    }
}
