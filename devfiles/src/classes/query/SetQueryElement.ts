import SetElement from '../data/setutils/SetElement';
import { QueryType, SetElemQueryT } from './Query';

export default class SetQueryElement {
    colI: any;
    e: SetElement;
    public constructor(columnIndex, e) {
        this.colI = columnIndex;
        this.e = e;
    }
    public query(enable: boolean): SetElemQueryT {
        return [this.colI, QueryType.SetElem, this.e, enable];
    }
}
