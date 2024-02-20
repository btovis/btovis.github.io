import Panel from '../Panel';
import DataFilterer from '../data/DataFilterer';
import { Query } from '../query/Query';
import InputOption from './InputOption';

export default class Selector extends InputOption {
    private columns: string[];
    public selected: Set<string> = new Set();

    public constructor(
        panel: Panel,
        name: string,
        columns: string[],
        allSelected: boolean = true,
        defaults?: string[]
    ) {
        super(panel, name);
        this.columns = columns;
        if (allSelected) this.selected = new Set(this.columns);
        else if (defaults) this.selected = new Set(defaults);
    }

    public render(): JSX.Element[] {
        return [
            <div>
                <p>{this.name}</p>
                {this.columns.map((item, itemIdx) => {
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

        //Refresh to show new panel name
        this.panel.refresh();
        //Refresh sidebar for new panel name too
        this.panel.pageManager.refreshPanelOptions();
    }

    public query(): Query {
        throw new Error('Method not implemented.');
    }
}
