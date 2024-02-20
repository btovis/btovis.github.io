import Widget from './Widget.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Selector from '../options/Selector.js';
import WidgetConfig from './WidgetConfig.js';
import Panel from '../Panel.js';
import { Attribute, Data } from '../data/Data.js';
import SetElement from '../data/setutils/SetElement.js';

/**
 * This will take in a set of input columns, then
 * group by duplicate frequency into a table.
 *
 * Sort by top frequency
 */
export default class TableWidget extends Widget {
    //A SORTED array of table frequencies:keys. It is like that for ease of sorting.
    private tableEntries: [number, string][] = [];

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
        const selectedIndices = new Set<number>();
        this.selectorOption.selected.forEach((colName) =>
            selectedIndices.add(this.panel.dataFilterer.getColumnIndex(colName))
        );

        //Collect and group the relevant rows.
        const rowMap = TableWidget.groupByFrequency(
            this.panel.dataFilterer.getData()[0],
            this.panel.dataFilterer.getData()[1],
            selectedIndices
        );

        //Sort the rows by count. Potential for optimisation here if needed, this is insertion sort
        this.tableEntries = TableWidget.sortByFrequency(rowMap);

        return new Sidebar(this.options);
    }

    //These are static to facilitate testing.
    protected static sortByFrequency(rowMap: Map<string, number>) {
        const entries: [number, string][] = [];
        const iterator = rowMap.entries();
        while (entries.length < rowMap.size) {
            const entry = iterator.next();
            if (entry.done === true) break;
            const key: string = entry.value[0];
            const freq: number = entry.value[1];
            let inserted = false;
            for (let i = 0; i < entries.length; i++) {
                if (entries[i][0] < freq) {
                    entries.splice(i, 0, [freq, key]);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) entries.push([freq, key]);
        }
        return entries;
    }

    //These are static to facilitate testing.
    protected static groupByFrequency(
        dataRows: any,
        dataLength: number,
        selectedIndices: Set<number>
    ) {
        const rowMap: Map<string, number> = new Map();
        for (let i = 0; i < dataLength; i++) {
            const row = dataRows[i];
            const keyList = [];
            selectedIndices.forEach((j) => {
                if (row[j] instanceof SetElement) keyList.push(row[j].value);
                else keyList.push(row[j]);
            });
            if (keyList.includes('')) continue;
            const key = keyList.join(',');

            const count = rowMap.has(key) ? rowMap.get(key) : 0;
            rowMap.set(key, count + 1);
        }
        return rowMap;
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
        for (let i = 0; i < this.tableEntries.length; i++) {
            const key = this.tableEntries[i][1];
            const freq = this.tableEntries[i][0];
            const row = (
                <tr>
                    {key.split(',').map((colVal) => (
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
                        {Array.from(this.selectorOption.selected).map((colName) => (
                            <td>{colName}</td>
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
