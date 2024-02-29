import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import Form from 'react-bootstrap/Form';
import RangeQuery from '../query/RangeQuery';
import { Attribute } from '../data/Data';
import { Accordion } from 'react-bootstrap';

export default class NumericInput extends InputOption {
    private value: number;
    private bouncyValue: number;
    private min: number;
    private max: number;
    private step: number;
    private accordionOpen = false;

    public constructor(
        panel: Panel,
        name: string,
        min: number,
        max: number,
        step: number,
        template?: NumericInput
    ) {
        super(panel, name);
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
        return (
            <Accordion
                onSelect={(eventKey) => {
                    this.accordionOpen = typeof eventKey === 'string';
                    this.refreshComponent();
                }}
                defaultActiveKey={this.accordionOpen ? '0' : []}
            >
                <Accordion.Item eventKey='0'>
                    <Accordion.Header>
                        <span>
                            <strong>{this.name}</strong>
                        </span>
                    </Accordion.Header>
                    <Accordion.Body>
                        <div className='sidebar-padding'>
                            <Form.Range
                                defaultValue={this.value}
                                min={this.min}
                                max={this.max}
                                step={this.step}
                                onChange={(event) => {
                                    this.bouncyValue = event.target.valueAsNumber;
                                    const oldVal = this.bouncyValue;
                                    setTimeout(() => {
                                        if (this.bouncyValue === oldVal)
                                            this.callback(this.bouncyValue);
                                    }, 300);
                                    this.refreshComponent();
                                }}
                            />
                            <div style={{ display: 'inline' }}>
                                <span>Selected Value:</span>
                                <input
                                    style={{ width: '30%', marginLeft: '5px', display: 'inline' }}
                                    className='form-control'
                                    type='number'
                                    min={this.min}
                                    max={this.max}
                                    step={this.step}
                                    defaultValue={this.value}
                                    onChange={(event) => {
                                        this.bouncyValue = event.target.valueAsNumber;
                                        const oldVal = this.bouncyValue;
                                        this.refreshComponent();
                                        setTimeout(() => {
                                            if (this.bouncyValue === oldVal)
                                                this.callback(this.bouncyValue);
                                        }, 300);
                                    }}
                                    onScroll={(event) => {
                                        event.preventDefault();
                                    }}
                                />
                            </div>
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        );
    }

    public callback(newValue: number): void {
        this.value = newValue;
        // this.panel.refreshComponent();
        this.panel.recalculateFilters(this);
        this.panel.refreshWidgets();
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
