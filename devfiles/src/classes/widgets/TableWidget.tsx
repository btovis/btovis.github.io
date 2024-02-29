import Widget from './Widget.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Selector from '../options/Selector.js';
import WidgetConfig from './WidgetConfig.js';
import Panel from '../Panel.js';
import { Attribute, Data } from '../data/Data.js';
import SetElement from '../data/setutils/SetElement.js';
import { v4 as uuidv4 } from 'uuid';
import MutuallyExclusiveSelector from '../options/MutuallyExclusiveSelector.js';

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
    private tableRows: JSX.Element[] = []; //pre-computed table rows
    private searchState = '';
    private bouncySearchState = '';
    private pageState = 0;
    private pageSize = 10;

    //Hold uuids from DataFilterer
    private seenDataState: number;
    private seenFilterState: number;

    //Options
    private selectorOption: Selector;
    private cullEmpty: MutuallyExclusiveSelector;

    /**
     * Initiatise all options here in private variables. These options will persist
     * state for the widget.
     * @param panel
     * @param config
     */
    public constructor(panel: Panel, config: WidgetConfig) {
        super(panel, config);
        this.seenDataState = panel.dataFilterer.getDataState();
        this.seenFilterState = panel.dataFilterer.getFilterState();

        this.selectorOption = new Selector(
            panel,
            'Table Columns',
            panel.dataFilterer.getColumns(),
            false,
            [Attribute.speciesEnglishName, Attribute.warnings]
        );
        //This refreshes the widget everytime the selector is called.
        this.selectorOption.extendedCallbacks.push(() => this.onSelectorChange());

        this.cullEmpty = new MutuallyExclusiveSelector(
            panel,
            'Cull Empty Cells',
            ['True', 'False'],
            'False'
        );
        this.cullEmpty.extendedCallbacks.push(() => {
            this.seenFilterState = 0; //Invalidate this, as a "filter" changed
            this.refresh();
        });

        this.options = [this.cullEmpty, this.selectorOption];
        this.onSelectorChange();
    }

    onSelectorChange(): void {
        //Re-calculate table entries when this is called based on the options
        //Contains a numerical index of selected columns
        this.columns = [];
        [...this.selectorOption.choices]
            .filter((choice) => !this.selectorOption.excluded.has(choice))
            .forEach((colName) => {
                try {
                    this.columns.push([colName, this.panel.dataFilterer.getColumnIndex(colName)]);
                } catch (e) {
                    /* Data doesn't have that - skip */
                }
            });

        this.columns.sort((a, b) => a[1] - b[1]);

        //Force recomputation by invalidating seen states.
        //Re-group is needed no matter what
        this.seenDataState = 1;
        this.seenFilterState = 1;

        this.refresh(); //calls render
    }

    public generateSidebar(): Sidebar {
        return new Sidebar(this.options);
    }

    public render(): JSX.Element {
        //If nothing is selected, render an empty table
        if (this.selectorOption.excluded.size === this.selectorOption.choices.size) {
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

        //Collect and group the relevant rows ONLY if the data from the
        //panel has changed. Don't run this if it's just a table
        // search
        if (
            this.seenDataState !== this.panel.dataFilterer.getDataState() ||
            this.seenFilterState !== this.panel.dataFilterer.getFilterState()
        ) {
            this.pageState = 0;
            this.seenDataState = this.panel.dataFilterer.getDataState();
            this.seenFilterState = this.panel.dataFilterer.getFilterState();
            const data = this.panel.dataFilterer.getData()[0];
            const dataLength = this.panel.dataFilterer.getData()[1];
            const indices = this.columns.map((c) => c[1]);
            this.tableEntries = TableWidget.processAsArray(
                data,
                dataLength,
                indices,
                this.cullEmpty.selected === 'True'
            );

            //Build the DOM objects from the sorted list
            this.tableRows = [];
            for (let i = 0; i < this.tableEntries.length; i++) {
                const key = this.tableEntries[i][0];
                const freq = this.tableEntries[i][1];
                const row = (
                    <tr key={key.split('\0').join('/') + ':' + freq}>
                        {key.split('\0').map((colVal) => (
                            <td key={uuidv4()}>{colVal}</td>
                        ))}
                        <td>{freq}</td>
                    </tr>
                );
                this.tableRows.push(row);
            }
        }

        //Return the actual sorted table
        return (
            <div>
                {/* Control div */}
                <div style={{ width: '100%', float: 'left', margin: '5px', display: 'inline' }}>
                    <br />
                    {/* PgLeft Button */}
                    <button
                        className='btn btn-primary lr-button'
                        disabled={this.searchState.trim() !== '' || this.pageState <= 0}
                        onClick={() => {
                            if (this.pageState === 0) return;
                            this.pageState -= 1;
                            this.refresh();
                        }}
                    >
                        ◁
                    </button>
                    {/* Current page */}
                    <span>
                        {this.searchState.trim() === ''
                            ? this.pageState +
                              1 +
                              '/' +
                              (Math.floor(this.tableRows.length / this.pageSize) + 1)
                            : '-/-'}
                    </span>
                    {/* PgRight Button */}
                    <button
                        className='btn btn-primary lr-button'
                        disabled={
                            this.searchState.trim() !== '' ||
                            (this.pageState + 1) * this.pageSize >= this.tableRows.length
                        }
                        onClick={() => {
                            if ((this.pageState + 1) * this.pageSize >= this.tableRows.length)
                                return;
                            this.pageState += 1;
                            this.refresh();
                        }}
                    >
                        ▷
                    </button>
                    {/* Search Bar */}
                    <span>Find Row:</span>
                    <input
                        style={{ width: '50%', marginLeft: '5px', display: 'inline' }}
                        className='form-control'
                        type='text'
                        defaultValue={this.searchState}
                        list={this.uuid.toString() + '-search'}
                        onChange={(event) => {
                            this.bouncySearchState = event.currentTarget.value;
                            const oldState = this.bouncySearchState;
                            setTimeout(() => {
                                if (oldState === this.bouncySearchState) {
                                    this.searchState = this.bouncySearchState;
                                    this.refresh();
                                }
                            }, 300);
                        }}
                        onBlur={(event) => {
                            if (this.searchState === this.bouncySearchState) return;
                            this.searchState = this.bouncySearchState;
                            this.refresh();
                        }}
                        onKeyUp={(e) => {
                            if (this.searchState === this.bouncySearchState) return;
                            if (e.key == 'Enter') {
                                e.currentTarget.blur();
                                this.searchState = this.bouncySearchState;
                                this.refresh();
                            }
                        }}
                    />
                    <datalist id={this.uuid.toString() + '-search'}>
                        {this.tableRows.map((row) => {
                            return <option key={row.key + '-option'} value={row.key} />;
                        })}
                    </datalist>
                </div>
                {/* Actual table */}
                <table className='table'>
                    <thead>
                        <tr>
                            {this.columns.map((col) => (
                                <td key={uuidv4()}>
                                    <strong>{col[0]}</strong>
                                </td>
                            ))}
                            <td>
                                <strong>#</strong>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        {/* If search state is empty, show the paged table.
                            If not, extend the table and just show everything */}
                        {this.searchState.trim() === ''
                            ? this.tableRows.filter((_row, idx) => {
                                  return Math.floor(idx / this.pageSize) === this.pageState;
                              })
                            : this.tableRows.filter((row) =>
                                  row.key.toLowerCase().includes(this.searchState.toLowerCase())
                              )}
                    </tbody>
                </table>
            </div>
        );
    }

    protected static processAsArray(
        data: (string | number | SetElement)[][],
        dataLength: number,
        indices: number[],
        cullEmpty: boolean
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
        nextRow: for (let i = 0; i < dataLength; i++) {
            const dataRow = data[i];
            for (let x = 0; x < indicesLength; x++) {
                const val = dataRow[indices[x]];
                if (val instanceof SetElement) row[x] = val.value;
                else row[x] = val;
                // issue #91: skip or not (Do not skip)
                if (cullEmpty)
                    if (row[x] === '[none]')
                        continue nextRow;
            }
            arr.push(row.join('\0'));
        }

        const arrLength = arr.length;

        // needed for the loop later
        if (arrLength == 0) return [];

        // Order the strings
        arr.sort();

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
