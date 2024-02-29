import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import Form from 'react-bootstrap/Form';
import RangeQuery from '../query/RangeQuery';
import { Attribute } from '../data/Data';
import { Accordion } from 'react-bootstrap';

export default class NumericInput extends InputOption {
    private value: number;
    private min: number;
    private max: number;
    private step: number;
    private accordionOpen = false;
    private newValue: number;

    public constructor(
        panel: Panel,
        name: string,
        min: number,
        max: number,
        step: number,
        template?: NumericInput
    ) {
        super(panel, name);
        this.value = 0;
        this.min = min;
        this.max = max;
        this.step = step;
        if (template !== undefined) {
            this.value = template.value;
            this.accordionOpen = template.accordionOpen;
        }
        this.newValue = this.value;
    }

    public getValue(): number {
        return this.value;
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
                                value={this.value}
                                min={this.min}
                                max={this.max}
                                step={this.step}
                                onChange={(event) => {
                                    this.value = event.target.valueAsNumber;
                                    this.newValue = this.value;
                                    this.refreshComponent();
                                }}
                                onMouseUp={(event) => {
                                    this.callback();
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
                                    value={this.newValue}
                                    onChange={(event) => {
                                        this.newValue = event.target.valueAsNumber;
                                        this.refreshComponent();
                                    }}
                                    onBlur={(event) => {
                                        this.callback();
                                    }}
                                    onScroll={(event) => {
                                        event.preventDefault();
                                    }}
                                    onKeyUp={(e) => {
                                        if (e.key == 'Enter') {
                                            this.callback();
                                            e.currentTarget.blur();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        );
    }

    public callback(): void {
        this.value = this.newValue;
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
