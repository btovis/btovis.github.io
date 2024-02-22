import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';

export default class NumericInput extends InputOption {
    private value: number;

    public constructor(panel: Panel, name: string) {
        super(panel, name);
        this.value = 0;
    }

    public getValue(): number {
        return this.value;
    }

    public render(): JSX.Element[] {
        return [
            <div className='numeric-input'>
                <p>{this.name}</p>
                <input
                    onChange={(event) => this.callback(event.target.valueAsNumber)}
                    type='number'
                    min='0'
                    max='100'
                />
            </div>
        ];
    }
    public callback(newValue: number): void {
        this.value = newValue;
    }
    public query(): Query {
        throw new Error('Method not implemented.');
    }
}
