import { Accordion } from 'react-bootstrap';
import Panel from '../Panel';
import { Query } from '../query/Query';
import SetQueryArray from '../query/SetQueryArray';
import InputOption from './InputOption';
import { v4 as uuidv4 } from 'uuid';

export default class Selector extends InputOption {
    //Internal state unique to every option class.
    //Use this to store current selections
    protected choices: string[];
    protected searchState: string = '';
    public selected: Set<string> = new Set();
    public readonly columnIndex;
    private accordionOpen = true;

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
        template: Selector = undefined,
        defaultOpen: boolean = true
    ) {
        super(panel, name);
        //If a column index is provided, set choices to the unique column values
        if (typeof choices === 'number') {
            this.columnIndex = choices;
            this.choices = [...panel.pageManager.data.sets[this.columnIndex].raws.keys()];
        } //if not, this is a list of strings.
        else this.choices = choices;

        if (template === undefined) {
            if (allSelected) this.selected = new Set(this.choices);
            else if (defaults) this.selected = new Set(defaults);

            this.accordionOpen = defaultOpen;
        } else {
            //If a template Selector is available, copy its currently selected settings.
            //If the template has everything selected, just set everything to be selected.
            if (template.isEverythingSelected()) this.selected = new Set(this.choices);
            else this.selected = template.selected;

            this.accordionOpen = template.accordionOpen;
        }
    }

    public isEverythingSelected(): boolean {
        return this.choices.length == this.selected.size;
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
        if (this.choices.length > 5) {
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
                        {this.choices.map((item) => {
                            return <option key={uuidv4()} value={item} />;
                        })}
                    </datalist>
                </div>
            );
        }
        return (
            <Accordion
                onSelect={(eventKey) => {
                    this.accordionOpen = typeof eventKey === 'string';
                }}
                //defaultActiveKey={this.accordionOpen ? '0' : []}
            >
                <Accordion.Item eventKey='0'>
                    <Accordion.Header>
                        <span>
                            <strong>{this.name}</strong>
                        </span>
                        <input
                            style={{ marginLeft: '10px' }}
                            key={uuidv4()}
                            onChange={(event) =>
                                this.callback(event.currentTarget.checked ? this.choices : [])
                            }
                            checked={this.selected.size == this.choices.length}
                            className='form-check-input'
                            type='checkbox'
                        />
                    </Accordion.Header>
                    <Accordion.Body>
                        {searchBar}
                        <div className='form-check'>
                            {this.choices.map((item, itemIdx) => {
                                return (
                                    <div
                                        key={uuidv4()}
                                        hidden={
                                            this.searchState.length > 0 &&
                                            !item
                                                .toLowerCase()
                                                .startsWith(this.searchState.toLowerCase())
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
                                            checked={this.selected.has(item)}
                                            className='form-check-input'
                                            type='checkbox'
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
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        );
    }

    /**
     * this.panel.recalculateFilters(this) will tell panel to execute the
     * filter
     *
     * @param newValue In this case, contains the "checked" status of
     * a tickbox and the string value of the item that was ticked
     */
    public callback(newValue: any): void {
        //If this is a boolean, that means this is a single change
        if (typeof newValue.checked === 'boolean') {
            if (newValue.checked) this.selected.add(newValue.item);
            else this.selected.delete(newValue.item);
        } //If not, its an array and we can apply it entirely.
        else {
            this.selected = new Set<string>(newValue as string[]);
        }
        //Ask the panel to re-calculate its filters ONLY if the
        //column index is defined. Some selectors do not use
        //columns (i.e. tablewidget)
        if (this.columnIndex !== undefined) this.panel.recalculateFilters(this);
        //Refresh to update the associated widget/panel (Selectors are used for Tables
        // as well as filters)
        //Potential to optimise here
        this.panel.refreshComponent();
        this.panel.refreshWidgets();
        //Refresh this inputoption
        this.refreshComponent();
    }

    /**
     * DO NOT RUN THIS IF SELECTOR WAS NOT INITIALISED WITH A COLUMN INDEX.
     * @returns Query object to be applied by the panel in recalculateFilters(this)
     */
    public query(): Query {
        return new SetQueryArray(this.columnIndex).query([...this.selected]);
    }
}
