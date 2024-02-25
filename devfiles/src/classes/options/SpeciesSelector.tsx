import { Accordion } from 'react-bootstrap';
import Panel from '../Panel';
import { Query } from '../query/Query';
import SetQueryArray from '../query/SetQueryArray';
import InputOption from './InputOption';
import { v4 as uuidv4 } from 'uuid';
import SpeciesMeta from '../queryMeta/SpeciesMeta';
import SetElement from '../data/setutils/SetElement';
import { Attribute } from '../data/Data';

export default class SpeciesSelector extends InputOption {
    //Internal state unique to every option class.
    //Use this to store current selections
    protected searchState: string = '';
    public selected: Set<SetElement> = new Set<SetElement>(); //Set of latin names

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
    public constructor(
        panel: Panel,
        name: string,
        allSelected: boolean = true,
        defaults?: string[],
        template: SpeciesSelector = undefined
    ) {
        super(panel, name);
        this.speciesMeta = this.panel.dataFilterer.getDataStats().getSpeciesMeta();
        this.choices().forEach((elem) => this.selected.add(elem));
        //if (template === undefined) {
        //    if (allSelected) this.selected = new Set(this.choices);
        //    else if (defaults) this.selected = new Set(defaults);
        // } else {
        //     //If a template Selector is available, copy its currently selected settings.
        //     //If the template has everything selected, just set everything to be selected.
        //     if (template.isEverythingSelected()) this.selected = new Set(this.choices);
        //     else this.selected = template.selected;
        // }
    }

    public isEverythingSelected(): boolean {
        return this.selected.size == this.choices().size;
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
        return (
            <Accordion defaultActiveKey='0'>
                <Accordion.Item eventKey='0'>
                    <Accordion.Header>
                        <span>
                            <strong>{this.name}</strong>
                        </span>
                        <input
                            style={{ marginLeft: '10px' }}
                            key={uuidv4()}
                            onChange={(event) =>
                                this.callback({
                                    checked: event.currentTarget.checked,
                                    item: this.choices()
                                })
                            }
                            checked={this.isEverythingSelected()}
                            className='form-check-input'
                            type='checkbox'
                        />
                    </Accordion.Header>
                    <Accordion.Body>
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
                                {[...this.choices()].map((item) => {
                                    return <option key={uuidv4()} value={item.value} />;
                                })}
                            </datalist>
                        </div>
                        <div className='form-check'>
                            {[...this.choices()].map((item, itemIdx) => {
                                return (
                                    <div
                                        key={uuidv4()}
                                        hidden={
                                            this.searchState.length > 0 &&
                                            !item.value
                                                .toLowerCase()
                                                .startsWith(this.searchState.toLowerCase())
                                        }
                                    >
                                        <input
                                            key={uuidv4()}
                                            onChange={(event) =>
                                                this.callback({
                                                    checked: event.currentTarget.checked,
                                                    item: new Set<SetElement>([item])
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
                                            {item.value}
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

    private choices(): Set<SetElement> {
        return this.panel.pageManager.data.sets[
            this.panel.dataFilterer.getColumnIndex(Attribute.speciesLatinName)
        ].refs;
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
        if (newValue.checked) newValue.item.forEach((elem) => this.selected.add(elem));
        else newValue.item.forEach((elem) => this.selected.delete(elem));

        //Ask the panel to re-calculate its filters
        this.panel.recalculateFilters(this);

        //Refresh to update the associated widget/panel (Selectors are used for Tables
        // as well as filters)
        //Potential to optimise here
        this.panel.refreshComponent();
        this.panel.refreshWidgets();
        //Refresh this inputoption
        this.refreshComponent();
    }

    /**
     * Optimisation potential: possibly costly string unboxing
     * @returns Query object to be applied by the panel in recalculateFilters(this)
     */
    public query(): Query {
        return new SetQueryArray(
            this.panel.dataFilterer.getColumnIndex(Attribute.speciesLatinName)
        ).query([...this.selected].map((setElem) => setElem.value as string));
    }
}
