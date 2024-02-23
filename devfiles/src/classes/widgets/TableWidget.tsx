import Widget from './Widget.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Selector from '../options/Selector.js';
import WidgetConfig from './WidgetConfig.js';
import Panel from '../Panel.js';
import { Attribute, Data } from '../data/Data.js';
import SetElement from '../data/setutils/SetElement.js';
import PageManager from '../PageManager.js';

/**
 * This will take in a set of input columns, then
 * group by duplicate frequency into a table.
 *
 * Sort by top frequency
 */
export default class TableWidget extends Widget {
    //A SORTED array of table keys:frequencies. It is like that for ease of sorting.
    private tableEntries: [string, number][] = [];
    private columns: [column: string, columnIndex: number][] = [];

    private selectorOption: Selector;

    /**
     * Initiatise all options here in private variables. These options will persist
     * state for the widget.
     * @param panel
     * @param config
     */
    public constructor(panel: Panel, config: WidgetConfig) {
        super(panel, config);
        this.selectorOption = new Selector(
            panel,
            'Table Columns',
            panel.dataFilterer.getColumns(),
            false,
            [Attribute.species, Attribute.warnings]
        );
        this.options = [this.selectorOption];
    }

    public generateSidebar(): Sidebar {
        //Re-calculate table entries when this is called based on the options
        //Contains a numerical index of selected columns
        this.columns = [];
        this.selectorOption.selected.forEach((colName) => {
            try {
                this.columns.push([colName, this.panel.dataFilterer.getColumnIndex(colName)]);
            } catch (e) {
                /* Data doesn't have that - skip */
            }
        });

        const data = this.panel.dataFilterer.getData()[0];
        const dataLength = this.panel.dataFilterer.getData()[1];
        const indices = this.columns.map((c) => c[1]);
        //Collect and group the relevant rows.
        this.tableEntries = TableWidget.processAsArray(data, dataLength, indices);

        return new Sidebar(this.options);
    }

    protected static processAsArray(
        data: (string | number | SetElement)[][],
        dataLength: number,
        indices: number[]
    ): [string, number][] {
        // Write rows as strings
        // Order the strings
        // Collect same strings, they're consecutive
        // Sort by frequency

        const arr = [],
            indicesLength = indices.length;

        // Rows as strings

        // variable "row" reused inside loop
        const row = new Array(indicesLength);
        loop: for (let i = 0; i < dataLength; i++) {
            const dataRow = data[i];
            for (let x = 0; x < indicesLength; x++) {
                const val = dataRow[indices[x]];
                if (val instanceof SetElement) row[x] = val.value;
                else row[x] = val;
                if (!row[x]) continue loop; // issue #91: skip or not
            }
            arr.push(row.join('\0'));
        }

        const arrLength = arr.length;

        // needed for the loop later
        if (arrLength == 0) return [];

        // Order the strings
        arr.sort((a, b) => (a == b ? 0 : a < b ? -1 : 1));

        // Collect same strings, they're consecutive
        //Potential optimisation to build the DOM straight in here
        const newArr = [];
        let old: string = arr[0],
            oldCount: number = 1;
        for (let i = 1; i < arrLength; i++) {
            if (arr[i] == old) {
                oldCount++;
            } else {
                newArr.push([old, oldCount]);
                old = arr[i];
                oldCount = 1;
            }
        }
        newArr.push([old, oldCount]);
        arr.length = 0;
        newArr.sort((a, b) => b[1] - a[1]);

        return newArr;
    }

    public render(): JSX.Element {
        //If nothing is selected, render an empty table
        if (this.selectorOption.selected.size == 0) {
            return (
                <table className='table'>
                    <thead>
                        <tr>
                            <td>No Columns Selected</td>
                        </tr>
                    </thead>
                </table>
            );
        }

        //Build the DOM objects from the sorted list
        const tableRows = [];
        for (let i = 0; i < Math.min(this.tableEntries.length, 100); i++) {
            const key = this.tableEntries[i][0];
            const freq = this.tableEntries[i][1];
            const row = (
                <tr>
                    {key.split('\0').map((colVal) => (
                        <td>{colVal}</td>
                    ))}
                    <td>{freq}</td>
                </tr>
            );
            tableRows.push(row);
        }

        //Return the actual sorted table
        return (
            <table className='table'>
                <thead>
                    <tr>
                        {this.columns.map((col) => (
                            <td>{col[0]}</td>
                        ))}
                        <td>#</td>
                    </tr>
                </thead>
                <tbody>{tableRows}</tbody>
            </table>
        );
    }
    public delete(): void {
        //Nothing to do?
    }
    public clone(): Widget {
        throw new Error('Method not implemented.');
    }
    public export(fileType: ExportFileType): void {
        throw new Error('Method not implemented.');
    }
}
