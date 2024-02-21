import SetElement from '../data/setutils/SetElement';
import { QueryType } from './Query';

export default class SetQueryElement {
    colI: any;
    e: SetElement;
    public constructor(columnIndex) {
        this.colI = columnIndex;
    }
    public query(enable: boolean) {
        return [this.colI, QueryType.SetElem, enable];
    }
}
