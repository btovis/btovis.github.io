import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import Form from 'react-bootstrap/Form';
import RangeQuery from '../query/RangeQuery';
import { Attribute } from '../data/Data';

export default class NumericInput extends InputOption {
    private feedbackOnChanged: boolean;

    private value: number;
    private bouncyValue: number;
    private timer: NodeJS.Timeout;
    private min: number;
    private max: number;
    private step: number;

    public constructor(
        panel: Panel,
        name: string,
        min: number,
        max: number,
        step: number,
        template?: NumericInput,
        feedbackOnChanged: boolean = false
    ) {
        super(panel, name);
        this.feedbackOnChanged = feedbackOnChanged;
        this.value = 0; //default
        this.min = min;
        this.max = max;
        this.step = step;
        if (template !== undefined) {
            this.value = template.value;
            this.accordionOpen = template.accordionOpen;
        }
        this.bouncyValue = this.value;
    }

    public render(): JSX.Element {
        return this.generateAccordion(
            <div className='sidebar-padding'>
                <Form.Range
                    id={this.uuid + '-rangesel'}
                    defaultValue={this.value}
                    min={this.min}
                    max={this.max}
                    step={this.step}
                    onChange={(event) => {
                        //Sync display with other input
                        (
                            document.getElementById(this.uuid + '-textsel') as HTMLInputElement
                        ).value = event.currentTarget.value;
                        this.debounce(event.target.valueAsNumber);
                        this.refreshComponent();
                    }}
                />
                <div style={{ display: 'inline' }}>
                    <span>Selected Value:</span>
                    <input
                        id={this.uuid + '-textsel'}
                        style={{ width: '30%', marginLeft: '5px', display: 'inline' }}
                        className='form-control'
                        type='number'
                        min={this.min}
                        max={this.max}
                        step={this.step}
                        defaultValue={this.value}
                        onChange={(event) => {
                            //Sync display with other input
                            (
                                document.getElementById(this.uuid + '-rangesel') as HTMLInputElement
                            ).value = event.currentTarget.value;
                            this.debounce(event.target.valueAsNumber);
                        }}
                        onScroll={(event) => {
                            event.preventDefault();
                        }}
                    />
                </div>
            </div>
        );
    }

    protected checkDefault(): boolean {
        return this.value == 0;
    }

    private debounce(newValue: number) {
        this.bouncyValue = newValue;
        this.refreshComponent();
        if (this.timer !== undefined) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if (this.bouncyValue === newValue) this.callback(this.bouncyValue);
        }, 300);
    }

    public callback(newValue: number): void {
        this.value = newValue;
        this.titleItalics = this.feedbackOnChanged && !this.checkDefault() ? true : false;
        // this.panel.refreshComponent();
        this.panel.recalculateFilters(this);
        //Refresh this inputoption
        this.refreshComponent();
    }

    public query(): Query {
        return new RangeQuery(this.panel.dataFilterer.getColumnIndex(Attribute.probability)).query(
            this.value == 0 ? -Infinity : this.value,
            Infinity
        );
    }
}
