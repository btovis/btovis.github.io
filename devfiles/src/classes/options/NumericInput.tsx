import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import Form from 'react-bootstrap/Form';
import RangeQuery from '../query/RangeQuery';
import { Attribute } from '../data/Data';

export default class NumericInput extends InputOption {
    private value: number;
    private min: number;
    private max: number;
    private step: number;

    public constructor(panel: Panel, name: string, min: number, max: number, step: number) {
        super(panel, name);
        this.value = 0;
        this.min = min;
        this.max = max;
        this.step = step;
    }

    public getValue(): number {
        return this.value;
    }

    public render(): JSX.Element {
        return (
            <div className='sidebar-padding'>
                <Form.Label>
                    <strong>{this.name}</strong>
                </Form.Label>
                <Form.Range
                    value={this.value}
                    min={this.min}
                    max={this.max}
                    step={this.step}
                    onChange={(event) => {
                        this.callback(event.target.valueAsNumber);
                    }}
                />
                <p>Selected Value: {this.value}</p>
            </div>
        );
    }
    public callback(newValue: number): void {
        this.value = newValue;
        this.panel.recalculateFilters(this);
        this.panel.refreshComponent();
        this.panel.refreshWidgets();
        //Refresh this inputoption
        this.refreshComponent();
    }

    public query(): Query {
        return new RangeQuery(this.panel.dataFilterer.getColumnIndex(Attribute.probability)).query(
            this.value,
            this.max
        );
    }
}
