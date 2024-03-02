import { QueryType, SetAsArrayT } from './Query';

export default class SetQueryArray {
    colI: number;
    public constructor(columnIndex) {
        this.colI = columnIndex;
    }
    public query(stringArrayOfAccept: string[]): SetAsArrayT {
        return [this.colI, QueryType.SetAsArray, stringArrayOfAccept];
    }
}
