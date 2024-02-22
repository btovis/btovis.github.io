import Panel from '../Panel';
import DataFilterer from '../data/DataFilterer';
import SetElement from '../data/setutils/SetElement';
import { Query } from '../query/Query';
import SetQueryElement from '../query/SetQueryElement';
import InputOption from './InputOption';

export default class Selector extends InputOption {
    private choices: string[];
    public selected: Set<string> = new Set();
    /**
     *
     * @param panel The associated panel
     * @param name Name of the Selector option
     * @param choices DO NOT HAVE DUPLICATES HERE.
     * @param allSelected If this is true (default is true), everything will be selected
     * @param defaults If allSelected is false, the default selected items will be this.
     * @param template This is the template Selector to "copy" selected options from.
     */
    public constructor(
        panel: Panel,
        name: string,
        choices: string[],
        allSelected: boolean = true,
        defaults?: string[],
        template: Selector = undefined
    ) {
        super(panel, name);
        this.choices = choices;

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
                            <label className='form-check-label'>{item}</label>
                        </div>
                    );
                })}
            </div>
        ];
    }

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

    public query(): Query {
        return null;
    }
}
