/*import FileIdentifierManager from "./setutils/FileIdentifierManager";
import { integrate, processTypes } from "./datautils/table_integrate";
import { parseCSVFromByteArray } from "./datautils/csvreader";
import SetElement from "./setutils/SetElement";*/
import { Data } from './Data';

export default class DataFilteredAccess {
    private d: Data;
    public constructor(da: Data) {
        this.d = da;
    }
}
