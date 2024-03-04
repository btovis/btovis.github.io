import Widget from './Widget.js';
import Sidebar from '../Sidebar.js';
import Selector from '../options/Selector.js';
import Panel from '../Panel.js';
import { Attribute } from '../data/Data.js';
import SetElement from '../data/setutils/SetElement.js';
import { v4 as uuidv4 } from 'uuid';
import MutuallyExclusiveSelector from '../options/MutuallyExclusiveSelector.js';
import { hasEmpty, rowComparator, unpack } from '../../utils/DataUtils.js';
import { Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';

/**
 * This will take in a set of input columns, then
 * group by duplicate frequency into a table.
 *
 * Sort by top frequency
 */
export default class TableWidget extends Widget {
    //A SORTED array of row indices to numbers
    private tableEntries: [number, number][] = [];
    private columns: [column: string, columnIndex: number][] = [];
    private searchState = '';
    private bouncySearchState = '';
    private pageState = 0;
    private readonly searchMax = 5000;

    //Hold uuids from DataFilterer
    private seenDataState: number;
    private seenFilterState: number;

    //Options
    private selectorOption: Selector;
    private cullEmpty: MutuallyExclusiveSelector;

    private fullscreenModalShown: boolean = false;

    /**
     * Initiatise all options here in private variables. These options will persist
     * state for the widget.
     * @param panel
     */
    public constructor(panel: Panel) {
        super(panel);
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

    public renderFullscreen(): JSX.Element {
        const rowHeight = document.getElementById(
            this.uuid.toString() + '-header-row'
        ).offsetHeight;
        const controlHeight = document.getElementById(
            this.uuid.toString() + '-control'
        ).offsetHeight;
        console.log(rowHeight);
        const rowsToDisplay = (window.innerHeight - 5 * rowHeight - controlHeight) / rowHeight;
        return (
            <Modal
                className='widget-fullscreen-modal'
                onHide={() => this.hideFullscreen()}
                show={true}
                fullscreen={true}
            >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>{this.render(rowsToDisplay)}</Modal.Body>
            </Modal>
        );
    }

    public showFullscreen() {
        this.fullscreenModalShown = true;
        this.refresh();
    }

    private hideFullscreen() {
        this.fullscreenModalShown = false;
        this.refresh();
    }

    public render(rowCountPerPage: number = 8): JSX.Element {
        let fullscreenDisplay = <></>;
        if (this.fullscreenModalShown) {
            // Avoid re-rendering the fullscreen modal when it's already shown.
            this.fullscreenModalShown = false;
            fullscreenDisplay = this.renderFullscreen();
            this.fullscreenModalShown = true;
        }
        //If nothing is selected, render an empty table
        if (this.selectorOption.excluded.size === this.selectorOption.choices.size) {
            return (
                <div>
                    {fullscreenDisplay}
                    <table className='table'>
                        <thead>
                            <tr>
                                <td>No Columns Selected</td>
                            </tr>
                        </thead>
                    </table>
                </div>
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
        }

        //Search bar
        const searchBar = (
            <span>
                <span>Find Row:</span>
                <input
                    style={{ width: '50%', marginLeft: '5px', display: 'inline' }}
                    className='form-control'
                    type='text'
                    defaultValue={this.searchState}
                    list={
                        this.tableEntries.length < this.searchMax
                            ? this.uuid.toString() + '-search'
                            : undefined
                    }
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
                />
                <datalist id={this.uuid.toString() + '-search'}>
                    {this.tableEntries
                        .filter(() => this.tableEntries.length <= this.searchMax)
                        .map(([rowIdx]) => {
                            const key = this.keyFromRow(rowIdx);
                            return <option key={key + '-option'} value={key} />;
                        })}
                </datalist>
            </span>
        );

        //Return the actual sorted table
        return (
            <div>
                {fullscreenDisplay}
                {/* Control div */}
                <div
                    id={this.uuid.toString() + '-control'}
                    style={{ width: '100%', float: 'left', marginTop: '5px', display: 'inline' }}
                >
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
                              Math.ceil(this.tableEntries.length / rowCountPerPage)
                            : '-/-'}
                    </span>
                    {/* PgRight Button */}
                    <button
                        className='btn btn-primary lr-button'
                        disabled={
                            this.searchState.trim() !== '' ||
                            (this.pageState + 1) * rowCountPerPage >= this.tableEntries.length
                        }
                        onClick={() => {
                            if ((this.pageState + 1) * rowCountPerPage >= this.tableEntries.length)
                                return;
                            this.pageState += 1;
                            this.refresh();
                        }}
                    >
                        ▷
                    </button>
                    {/* Search Bar */}
                    {this.tableEntries.length >= this.searchMax ? (
                        <OverlayTrigger
                            placement='top'
                            delay={{ show: 250, hide: 400 }}
                            overlay={(props) => (
                                <Tooltip {...props}>
                                    There are too many rows. Search is limited to the top{' '}
                                    {this.searchMax} most frequent rows and autocomplete is off
                                </Tooltip>
                            )}
                        >
                            {searchBar}
                        </OverlayTrigger>
                    ) : (
                        searchBar
                    )}
                </div>
                {/* Actual table */}
                <table className='table'>
                    <thead>
                        <tr id={this.uuid.toString() + '-header-row'}>
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
                            ? this.tableEntries
                                  .filter(
                                      (_rowFreq, idx) =>
                                          Math.floor(idx / rowCountPerPage) === this.pageState
                                  )
                                  .map(([key, freq]) => {
                                      return (
                                          <tr key={this.keyFromRow(key)}>
                                              {this.columns.map(([, cIdx]) => (
                                                  <td key={uuidv4()}>
                                                      {unpack(
                                                          this.panel.dataFilterer.getData()[0][key][
                                                              cIdx
                                                          ]
                                                      )}
                                                  </td>
                                              ))}
                                              <td>{freq}</td>
                                          </tr>
                                      );
                                  })
                            : this.tableEntries
                                  .filter(
                                      ([key], idx) =>
                                          idx <= this.searchMax &&
                                          this.keyFromRow(key)
                                              .toLowerCase()
                                              .includes(this.searchState.toLowerCase())
                                  )
                                  .map(([key, freq]) => {
                                      return (
                                          <tr
                                              key={this.columns
                                                  .map(([, cIdx]) =>
                                                      unpack(
                                                          this.panel.dataFilterer.getData()[0][key][
                                                              cIdx
                                                          ]
                                                      )
                                                  )
                                                  .join('/')}
                                          >
                                              {this.columns.map(([, cIdx]) => (
                                                  <td key={uuidv4()}>
                                                      {unpack(
                                                          this.panel.dataFilterer.getData()[0][key][
                                                              cIdx
                                                          ]
                                                      )}
                                                  </td>
                                              ))}
                                              <td>{freq}</td>
                                          </tr>
                                      );
                                  })}
                    </tbody>
                </table>
            </div>
        );
    }

    private keyFromRow(rowIdx: number) {
        return this.columns
            .map(([, cIdx]) => unpack(this.panel.dataFilterer.getData()[0][rowIdx][cIdx]))
            .join('/');
    }

    /**
     * When given some filtered data from panel.dataFilterer, this will
     * calculate the unique rows (of indices) along with their frequencies
     * @param data panel.dataFilterer.getData()[0]
     * @param dataLength panel.dataFilterer.getData()[1]
     * @param indices Column indices of the columns that you want to include
     * @param cullEmpty Whether or not to ignore rows that contain [none] in the
     * supplied indices
     * @returns An array of [number,number][], where the first index of each
     * array entry is the row index in panel.dataFilterer.getData, and the
     * second index is the frequency that the row appears in
     */
    public static processAsArray(
        data: (string | number | SetElement)[][],
        dataLength: number,
        indices: number[],
        cullEmpty: boolean
    ): [number, number][] {
        // Sort the rows according to the input indices
        // Iterate the rows in one pass and count identical rows,
        // as they will be grouped together
        // Sort by frequency at the end

        // don't bother with calculations
        if (dataLength === 0) return [];

        //[0,1,2...,dataLength]
        const sortedArray = [...Array(dataLength).keys()];

        // Order the array by the selected columns
        sortedArray.sort((id1, id2) => rowComparator(data, indices, id1, id2));

        // Collect same data rows, they're consecutive
        const groupedArray = [];
        let old: number = sortedArray[0],
            oldCount: number = 1;
        for (let i = 1; i < sortedArray.length; i++) {
            if (rowComparator(data, indices, sortedArray[i], old) === 0) {
                oldCount++;
            } else {
                //If the row contains blanks, cull it if necessary
                if (!cullEmpty || !hasEmpty(data[old], indices)) groupedArray.push([old, oldCount]);
                old = sortedArray[i];
                oldCount = 1;
            }
        }
        //Remember to check again here
        if (!cullEmpty || !hasEmpty(data[old], indices)) groupedArray.push([old, oldCount]);

        groupedArray.sort((a, b) => b[1] - a[1]);

        return groupedArray;
    }

    public delete(): void {
        //Nothing to do?
    }
    public updateTraceOptions(): void {}
}
