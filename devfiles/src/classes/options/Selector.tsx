import Panel from '../Panel';
import DataFilterer from '../data/DataFilterer';
import Query from '../query/Query';
import InputOption from './InputOption';

export default class Selector extends InputOption {
    private columns: string[];
    private selected: Set<string> = new Set();
    public constructor(panel: Panel, name: string, columns: string[], allSelected: boolean = true) {
        super(panel, name);
        this.columns = columns;
        if (allSelected) this.selected = new Set(this.columns);
    }

    public render(): JSX.Element[] {
        return [
            <div>
                <p>{this.name}</p>
                {this.columns.map((item, itemIdx) => {
                    return (
                        <div>
                            <input
                                key={itemIdx}
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
        throw new Error('Method not implemented.');
    }
    public query(): Query {
        throw new Error('Method not implemented.');
    }
}
