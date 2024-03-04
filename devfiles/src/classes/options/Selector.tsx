import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import { v4 as uuidv4 } from 'uuid';
import SetQueryArrayReject from '../query/SetQueryArrayReject';

export default class Selector extends InputOption {
    //Internal state unique to every option class.
    //Use this to store current selections
    public choices: Set<string>;
    protected searchState: string = '';
    public excluded: Set<string> = new Set();
    public readonly columnIndex;
    public useSearchBar: boolean = true;
    public hideSelectAll: boolean = false;

    /**
     * @param panel The associated panel
     * @param name Name of the Selector option
     * @param choices If this is a number, it will be the column index of the thing
     * to be sorted, and this.choices will populate automatically.
     * @param allSelected If this is true (default is true), everything will be selected
     * @param defaults If allSelected is false, the default selected items will be this.
     * @param template This is the template Selector to "copy" selected options from.
     */
    public constructor(
        panel: Panel,
        name: string,
        choices: string[] | number,
        allSelected: boolean = true,
        defaults?: string[],
        template: Selector = undefined
    ) {
        super(panel, name);
        //If a column index is provided, set choices to the unique column values
        if (typeof choices === 'number') {
            this.columnIndex = choices;
            this.choices = new Set([...panel.pageManager.data.sets[this.columnIndex].raws.keys()]);
        } //if not, this is a list of strings.
        else this.choices = new Set(choices);

        if (template === undefined) {
            //allSelected makes excluded be empty
            if (!allSelected && defaults) {
                const defaultSet = new Set(defaults);
                this.excluded = new Set(
                    [...this.choices].filter((choice) => !defaultSet.has(choice))
                );
            }
        } else {
            //If a template Selector is available, copy its currently excluded settings.
            //If the template has everything selected, template.excluded will be empty
            [...template.excluded]
                .filter((elem) => this.choices.has(elem))
                .forEach((elem) => this.excluded.add(elem));
            this.accordionOpen = template.accordionOpen;
        }
    }

    public isEverythingSelected(): boolean {
        return this.excluded.size === 0;
    }

    /**
     * This is called when PanelOptionComp is re-rendered.
     * Use the state from the private fields to build this
     *
     * Set onChange to run callback() against the input that changed
     *
     * If you want other state like a search bar, you can just
     * change the internal input field and trigger a re-render
     * with this.panel.pageManager.refreshPanelOptions();
     *
     *
     */
    public render(): JSX.Element {
        //If there are more than 5 selections, enable advanced options
        // like search
        let searchBar = <></>;
        if (this.choices.size > 5 && this.useSearchBar) {
            searchBar = (
                <div style={{ paddingBottom: '5px' }}>
                    <input
                        type='text'
                        list={this.uuid.toString() + '-search'}
                        placeholder={'Search ' + this.name}
                        onChange={(event) => {
                            this.searchState = event.target.value;
                            //Optimisation potential: Don't refresh everything for this
                            this.refreshComponent();
                        }}
                    />
                    <datalist id={this.uuid.toString() + '-search'}>
                        {[...this.choices].map((item) => {
                            return <option key={uuidv4()} value={item} />;
                        })}
                    </datalist>
                </div>
            );
        }
        const selectAll = this.hideSelectAll ? (
            []
        ) : (
            <div key={uuidv4()}>
                <p>
                    <input
                        key={uuidv4()}
                        onChange={(event) =>
                            this.callback(event.currentTarget.checked ? [] : this.choices)
                        }
                        onClick={(event) => event.stopPropagation()}
                        checked={this.isEverythingSelected()}
                        className='form-check-input'
                        type='checkbox'
                        id={this.uuid.toString() + 'all'}
                    />
                    <label
                        className='form-check-label selectorLabel select-all-label fw-bold'
                        htmlFor={this.uuid.toString() + 'all'}
                    >
                        Select All
                    </label>
                </p>
            </div>
        );
        return this.generateAccordion(
            <>
                {searchBar}
                {this.inputType() == 'checkbox' ? selectAll : <></>}
                <div className='form-check'>
                    {[...this.choices].map((item) => {
                        return (
                            <div
                                key={uuidv4()}
                                hidden={
                                    this.searchState.length > 0 &&
                                    !item.toLowerCase().startsWith(this.searchState.toLowerCase())
                                }
                            >
                                <input
                                    key={uuidv4()}
                                    onChange={(event) =>
                                        this.callback({
                                            checked: event.currentTarget.checked,
                                            item: item
                                        })
                                    }
                                    id={this.uuid.toString() + item}
                                    checked={!this.excluded.has(item)}
                                    className='form-check-input'
                                    type={this.inputType()}
                                    name={this.uuid.toString() + 'selector'}
                                />
                                <label
                                    className='form-check-label selectorLabel'
                                    htmlFor={this.uuid.toString() + item}
                                >
                                    {item.trim() == '' ? 'None' : item}
                                </label>
                            </div>
                        );
                    })}
                </div>
            </>
        );
    }

    protected checkDefault(): boolean {
        return this.isEverythingSelected();
    }

    protected inputType() {
        return 'checkbox';
    }

    /**
     * this.panel.recalculateFilters(this) will tell panel to execute the
     * filter
     *
     * @param newValue In this case, contains the "checked" status of
     * a tickbox and the string value of the item that was ticked
     */
    public callback(newValue): void {
        //If this is a boolean, that means this is a single change
        if (typeof newValue.checked === 'boolean') {
            if (newValue.checked) this.excluded.delete(newValue.item);
            else this.excluded.add(newValue.item);
        } //If not, its an array and we can apply it entirely.
        else {
            this.excluded = new Set<string>(newValue as string[]);
        }
        //Ask the panel to re-calculate its filters ONLY if the
        //column index is defined. Some selectors do not use
        //columns (i.e. tablewidget)

        if (this.columnIndex !== undefined) {
            //Refreshes the whole panel, along with all its widgets.
            this.panel.recalculateFilters(this);
            this.panel.refreshComponent();
            this.panel.refreshWidgets();
        } else this.extendedCallbacks.forEach((f) => f(newValue));

        //Refresh this inputoption
        this.refreshComponent();
    }

    /**
     * DO NOT RUN THIS IF SELECTOR WAS NOT INITIALISED WITH A COLUMN INDEX.
     * @returns Query object to be applied by the panel in recalculateFilters(this)
     */
    public query(): Query {
        return new SetQueryArrayReject(this.columnIndex).query(this.excluded, false);
    }
}
