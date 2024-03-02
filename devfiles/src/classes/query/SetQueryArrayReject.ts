import { QueryType, SetAsArrayForRejectT } from './Query';

export default class SetQueryArrayReject {
    colI: number;
    public constructor(columnIndex) {
        this.colI = columnIndex;
    }
    public query(stringArrayOfReject: string[]): SetAsArrayForRejectT {
        return [this.colI, QueryType.SetAsArrayForReject, stringArrayOfReject];
    }
}
