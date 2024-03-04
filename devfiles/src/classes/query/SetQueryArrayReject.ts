import SetElement from '../data/setutils/SetElement';
import { QueryType, SetAsArrayForRejectT } from './Query';

export default class SetQueryArrayReject {
    colI: number;
    public constructor(columnIndex) {
        this.colI = columnIndex;
    }
    public query(
        stringArrayOfReject: Set<string | SetElement>,
        isSetElement
    ): SetAsArrayForRejectT {
        return [this.colI, QueryType.SetAsArrayForReject, stringArrayOfReject, isSetElement];
    }
}
