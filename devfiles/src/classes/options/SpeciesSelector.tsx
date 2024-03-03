import { OverlayTrigger, Popover, ToggleButton, Tooltip } from 'react-bootstrap';
import Panel from '../Panel';
import { Query } from '../query/Query';
//import SetQueryArray from '../query/SetQueryArray';
import InputOption from './InputOption';
import { v4 as uuidv4 } from 'uuid';
import SpeciesMeta from '../queryMeta/SpeciesMeta';
import SetElement from '../data/setutils/SetElement';
import { Attribute } from '../data/Data';
import {
    EndangermentStatus,
    endangermentValues,
    getEndangermentInfo
} from '../../utils/speciesVulnerability';
import SetQueryArrayReject from '../query/SetQueryArrayReject';

export default class SpeciesSelector extends InputOption {
    //Internal state unique to every option class.
    //Use this to store current selections
    protected searchState: string = '';
    public unselected: Set<SetElement> = new Set<SetElement>(); //Set of latin names
    public allowedEndangerment = new Set<EndangermentStatus>();
    public allowedGroups = new Set<SetElement>();
    private choices: Set<SetElement>;
    private possibleGroups: Set<SetElement>;
    private debouncerTimer;

    private speciesMeta: SpeciesMeta;

    /**
     * @param panel The associated panel
     * @param name Name of the Selector option
     * @param choices If this is a number, it will be the column index of the thing
     * to be sorted, and this.choices will populate automatically.
     * @param allSelected If this is true (default is true), everything will be selected
     * @param defaults If allSelected is false, the default selected items will be this.
     * @param template This is the template Selector to "copy" selected options from.
     */
    public constructor(panel: Panel, name: string, template: SpeciesSelector = undefined) {
        super(panel, name);
        this.speciesMeta = this.panel.dataFilterer.getDataStats().getSpeciesMeta();

        //Copy values to enforce changes
        //These must be saved to easily compare new rows
        this.choices = new Set([
            ...this.panel.pageManager.data.sets[
                this.panel.dataFilterer.getColumnIndex(Attribute.speciesLatinName)
            ].refs
        ]);
        this.possibleGroups = new Set([
            ...this.panel.pageManager.data.sets[
                this.panel.dataFilterer.getColumnIndex(Attribute.speciesGroup)
            ].refs
        ]);
        //Default all selected:

        if (template === undefined) {
            this.allowedEndangerment = new Set(endangermentValues);
            this.possibleGroups.forEach((group) => this.allowedGroups.add(group));
        } else {
            //If a template Selector is available, copy its currently selected settings.
            //If the template has everything selected, just set everything to be selected.
            if (template.isEverythingSelected()) {
                this.possibleGroups.forEach((group) => this.allowedGroups.add(group));
            } else {
                //Filter for removed groups
                [...template.unselected]
                    .filter((sel) => this.choices.has(sel))
                    .forEach((e) => this.unselected.add(e));
                [...template.allowedGroups]
                    .filter((group) => this.possibleGroups.has(group))
                    .forEach((g) => this.allowedGroups.add(g));
                [...this.possibleGroups]
                    .filter((group) => !template.possibleGroups.has(group))
                    .forEach((elem) => this.allowedGroups.add(elem));
            }

            this.allowedEndangerment = template.allowedEndangerment;
            this.accordionOpen = template.accordionOpen;
        }
    }

    public isEverythingSelected(): boolean {
        return (
            this.unselected.size == 0 &&
            this.allowedGroups.size == this.possibleGroups.size &&
            this.allowedEndangerment.size == endangermentValues.length
        );
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
        return this.generateAccordion(
            <>
                <div style={{ display: 'flex' }}>
                    {/* For checking everything */}
                    <input
                        style={{ marginLeft: '10px' }}
                        key={this.uuid + '-select-all'}
                        id={this.uuid + '-select-all'}
                        onChange={(event) => {
                            //Add all values
                            if (event.currentTarget.checked) {
                                endangermentValues.forEach((s) => this.allowedEndangerment.add(s));
                                this.possibleGroups.forEach((s) => this.allowedGroups.add(s));
                            }
                            this.callback({
                                checked: event.currentTarget.checked,
                                item: this.choices
                            });
                        }}
                        onClick={(event) => event.stopPropagation()}
                        checked={this.isEverythingSelected()}
                        className='form-check-input'
                        type='checkbox'
                    />
                    <label
                        className='form-check-label selectorLabel select-all-label fw-bold'
                        htmlFor={this.uuid + '-select-all'}
                    >
                        Select All
                    </label>
                </div>
                {/* Endangerment Filters */}
                <span className='mb-2 font-italic'>Conservation Status</span>
                {/* For checking all the endangerment filters */}
                <input
                    style={{ marginLeft: '10px' }}
                    key={uuidv4()}
                    onChange={(event) => {
                        if (event.currentTarget.checked)
                            endangermentValues.forEach((s) => this.allowedEndangerment.add(s));
                        else this.allowedEndangerment.clear();
                        //Refresh state
                        this.callback({ checked: false, item: new Set([]) });
                    }}
                    checked={this.allowedEndangerment.size == endangermentValues.length}
                    className='form-check-input'
                    type='checkbox'
                />
                <br />
                {this.endangermentStatusFilters()}
                <hr />
                {/* Group Filters */}
                <span className='mb-2 font-italic'>Species Groups</span>
                {/* For checking all the group filters */}
                <input
                    style={{ marginLeft: '10px' }}
                    key={uuidv4()}
                    onChange={(event) => {
                        if (event.currentTarget.checked)
                            this.possibleGroups.forEach((s) => this.allowedGroups.add(s));
                        else this.allowedGroups.clear();
                        //Refresh state
                        this.callback({ checked: false, item: new Set([]) });
                    }}
                    checked={this.allowedGroups.size == this.possibleGroups.size}
                    className='form-check-input'
                    type='checkbox'
                />
                <br />
                {this.speciesGroupFilters()}
                <hr />
                {/* Search Bar */}
                <div style={{ paddingBottom: '5px' }}>
                    <input
                        type='text'
                        list={this.uuid.toString() + '-search'}
                        placeholder='Search'
                        onChange={(event) => {
                            this.searchState = event.target.value;
                            this.refreshComponent();
                        }}
                    />
                    <datalist id={this.uuid.toString() + '-search'}>
                        {[...this.choices].map((latinName) => {
                            return (
                                <option
                                    key={uuidv4()}
                                    value={
                                        this.speciesMeta.englishName(latinName).value +
                                        '/' +
                                        latinName.value
                                    }
                                />
                            );
                        })}
                    </datalist>
                </div>
                {/* Every species row */}
                <div className='form-check'>
                    {[...this.speciesMeta.groupByGroup.keys()].map((group) => (
                        <div key={uuidv4()}>
                            <hr />
                            <div className='speciesGroupRowDiv' key={uuidv4()}>
                                <strong>{group.value}</strong>
                                <button
                                    className='btn btn-outline-dark btn-sm'
                                    type='button'
                                    onClick={() => {
                                        [...this.speciesMeta.groupByGroup.get(group)].map((s) => {
                                            this.unselected.has(s)
                                                ? this.unselected.delete(s)
                                                : this.unselected.add(s);
                                        });
                                        this.callback({
                                            checked: false,
                                            item: new Set([])
                                        });
                                    }}
                                >
                                    Invert
                                </button>
                            </div>
                            {this.speciesMeta.groupByGroup
                                .get(group)
                                .map((latinName) => this.speciesRow(latinName))}
                        </div>
                    ))}
                </div>
            </>,
            false
        );
    }

    protected checkDefault(): boolean {
        return this.isEverythingSelected();
    }

    /**
     * @returns the toggle button filters for endangerment status at the top
     */
    private endangermentStatusFilters(): JSX.Element[] {
        return endangermentValues.map((status) => {
            return (
                <OverlayTrigger
                    key={uuidv4()}
                    placement='top'
                    delay={{ show: 250, hide: 400 }}
                    overlay={(props) => <Tooltip {...props}>{status}</Tooltip>}
                >
                    <ToggleButton
                        className='mb-2 speciesEndangermentFilterBtn'
                        id={uuidv4()}
                        type='checkbox'
                        variant={getEndangermentInfo(status).className.replace('btn-', 'outline-')}
                        checked={this.allowedEndangerment.has(status)}
                        value='1'
                        onChange={(event) => {
                            if (event.currentTarget.checked) this.allowedEndangerment.add(status);
                            else this.allowedEndangerment.delete(status);

                            //Trigger a callback to re-calculate filters and refresh
                            this.callback({ checked: false, item: new Set([]) });
                        }}
                    >
                        {getEndangermentInfo(status).shortForm}
                    </ToggleButton>
                </OverlayTrigger>
            );
        });
    }

    /**
     * @returns the toggle button filters for species group at the top
     */
    private speciesGroupFilters(): JSX.Element[] {
        return [...this.possibleGroups].map((group) => {
            return (
                <ToggleButton
                    className='mb-2 speciesEndangermentFilterBtn'
                    id={uuidv4()}
                    key={uuidv4()}
                    type='checkbox'
                    variant='outline-info'
                    checked={this.allowedGroups.has(group)}
                    value='1'
                    onChange={(event) => {
                        if (event.currentTarget.checked) this.allowedGroups.add(group);
                        else this.allowedGroups.delete(group);

                        //Trigger a callback to re-calculate filters and refresh
                        this.callback({ checked: false, item: new Set([]) });
                    }}
                >
                    {group.value.trim() === '' ? 'none' : group.value}
                </ToggleButton>
            );
        });
    }

    /**
     * This tooltip displays when you hover over a species row
     */
    private speciesRowTooltip(props: { latinName: SetElement }): JSX.Element {
        return (
            <Popover id={props.latinName.value}>
                <Popover.Header as='h2'>
                    {this.speciesMeta.englishName(props.latinName).value}
                </Popover.Header>
                <Popover.Body>
                    <h6 className='card-subtitle mb-2 font-italic text-muted'>
                        {props.latinName.value}
                    </h6>
                    <h6 className='card-subtitle mb-2'>
                        ID: {this.speciesMeta.speciesName(props.latinName).value}
                    </h6>

                    <ToggleButton
                        style={{ pointerEvents: 'none' }}
                        className='mb-2'
                        id='toggle-check'
                        type='checkbox'
                        variant='outline-info'
                        checked={true}
                        value='1'
                    >
                        {this.speciesMeta.speciesGroup(props.latinName).value}
                    </ToggleButton>
                    <br></br>
                    <button
                        type='button'
                        style={{ pointerEvents: 'none' }}
                        className={
                            'btn ' +
                            getEndangermentInfo(this.speciesMeta.endStatus(props.latinName))
                                .className
                        }
                    >
                        {this.speciesMeta.endStatus(props.latinName)}
                    </button>
                </Popover.Body>
            </Popover>
        );
    }

    /**
     * Represents each species in its row keyed by its scientific name
     */
    private speciesRow(latinName: SetElement): JSX.Element {
        //This tooltip is not the same as the one in MainPage.tsx.
        //This comes from bootstrap
        return (
            <div
                key={uuidv4()}
                hidden={
                    //Hide the row if the endangerment status/group filters filter it off,
                    // or if the search bar contains a search term that isn't this
                    !this.allowedEndangerment.has(this.speciesMeta.endStatus(latinName)) ||
                    !this.allowedGroups.has(this.speciesMeta.speciesGroup(latinName)) ||
                    (this.searchState.length > 0 &&
                        !latinName.value
                            .toLowerCase()
                            .startsWith(this.searchState.toLowerCase().split('/')[1]) &&
                        !this.speciesMeta
                            .englishName(latinName)
                            .value.toLowerCase()
                            .startsWith(this.searchState.toLowerCase().split('/')[0]))
                }
            >
                <input
                    onChange={(event) =>
                        this.callback({
                            checked: event.currentTarget.checked,
                            item: new Set<SetElement>([latinName])
                        })
                    }
                    id={this.uuid.toString() + latinName.value}
                    checked={!this.unselected.has(latinName)}
                    className='form-check-input'
                    type='checkbox'
                />
                <OverlayTrigger
                    placement='right'
                    delay={{ show: 250, hide: 400 }}
                    overlay={this.speciesRowTooltip({ latinName: latinName })}
                >
                    <label
                        className='form-check-label speciesRowLabel'
                        htmlFor={this.uuid.toString() + latinName.value}
                    >
                        <div className='speciesRowLabelText'>
                            {this.speciesMeta.englishName(latinName).value.trim() !== ''
                                ? this.speciesMeta.englishName(latinName).value
                                : 'No ID'}
                        </div>
                        <button
                            type='button'
                            style={{ pointerEvents: 'none' }}
                            className={
                                'btn ' +
                                getEndangermentInfo(this.speciesMeta.endStatus(latinName)).className
                            }
                        >
                            {getEndangermentInfo(this.speciesMeta.endStatus(latinName)).shortForm}
                        </button>
                    </label>
                </OverlayTrigger>
            </div>
        );
    }

    /**
     * this.panel.recalculateFilters(this) will tell panel to execute the
     * filter
     *
     * @param newValue In this case, contains the "checked" status of
     * a tickbox and a SetElement of what was ticked.
     *
     * If an array was passed,
     */
    public callback(newValue: { checked: boolean; item: Set<SetElement> }): void {
        clearTimeout(this.debouncerTimer);
        if (newValue.checked) newValue.item.forEach((elem) => this.unselected.delete(elem));
        else newValue.item.forEach((elem) => this.unselected.add(elem));

        //Ask the panel to re-calculate its filters
        this.panel.recalculateFilters(this);

        //Half a second debounce
        this.debouncerTimer = setTimeout(() => {
            //Refresh to update the associated widget/panel (Selectors are used for Tables
            // as well as filters)
            //Potential to optimise here
            this.panel.refreshComponent();
            this.panel.refreshWidgets();
        }, 500);
        //Refresh this inputoption
        this.refreshComponent();
    }

    /**
     * Optimisation potential: possibly costly string unboxing
     * @returns Query object to be applied by the panel in recalculateFilters(this)
     */
    public query(): Query {
        return new SetQueryArrayReject(
            this.panel.dataFilterer.getColumnIndex(Attribute.speciesLatinName)
        ).query(
            [...this.choices]
                .filter((latinName) => {
                    //Filter group and endangerment
                    return (
                        this.unselected.has(latinName) ||
                        !this.allowedGroups.has(this.speciesMeta.speciesGroup(latinName)) ||
                        !this.allowedEndangerment.has(this.speciesMeta.endStatus(latinName))
                    );
                })
                .map((setElem) => setElem.value as string)
        );
    }
}
