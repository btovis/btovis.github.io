import Panel from '../Panel';
import { Query } from '../query/Query';
import SetQueryArray from '../query/SetQueryArray';
import InputOption from './InputOption';

export default class Selector extends InputOption {
    //Internal state unique to every option class.
    //Use this to store current selections
    private choices: string[];
    public selected: Set<string> = new Set();
    public readonly columnIndex;

    /**     *
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
            this.choices = [...panel.pageManager.data.sets[this.columnIndex].raws.keys()];
        } //if not, this is a list of strings.
        else this.choices = choices;

        if (template === undefined) {
            if (allSelected) this.selected = new Set(this.choices);
            else if (defaults) this.selected = new Set(defaults);
        } else {
            //If a template Selector is available, copy its currently selected settings.
            //If the template has everything selected, just set everything to be selected.
            if (template.isEverythingSelected()) this.selected = new Set(this.choices);
            else this.selected = template.selected;
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
     */
    public render(): JSX.Element[] {
        return [
            <div>
                <p>{this.name}</p>
                {this.choices.map((item, itemIdx) => {
                    return (
                        <div>
                            <input
                                key={this.panel.uuid + 11 * itemIdx}
                                onChange={(event) =>
                                    this.callback({
                                        checked: event.currentTarget.checked,
                                        item: item
                                    })
                                }
                                defaultChecked={this.selected.has(item)}
                                className='form-check-input'
                                type='checkbox'
                                value=''
                            />
                            <label className='form-check-label'>{item || '<empty>'}</label>
                        </div>
                    );
                })}
            </div>
        ];
    }

    /**
     * this.panel.recalculateFilters(this) will tell panel to execute the
     * filter
     *
     * @param newValue In this case, contains the "checked" status of
     * a tickbox and the string value of the item that was ticked
     */
    public callback(newValue: any): void {
        if (newValue.checked) this.selected.add(newValue.item);
        else this.selected.delete(newValue.item);
        //Ask the panel to re-calculate its filters
        this.panel.recalculateFilters(this);
        //Refresh to update the associated widget
        //Potential to optimise here
        this.panel.refreshComponent();
        //Refresh sidebar to change the state of this inputoption
        this.panel.pageManager.refreshPanelOptions();
    }

    /**
     * DO NOT RUN THIS IF SELECTOR WAS NOT INITIALISED WITH A COLUMN INDEX.
     * @returns Query object to be applied by the panel in recalculateFilters(this)
     */
    public query(): Query {
        return new SetQueryArray(this.columnIndex).query([...this.selected]);
    }
}
