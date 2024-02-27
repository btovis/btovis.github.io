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
                                    this.callback(event.target.valueAsNumber);
                                }}
                            />
                            <p>Selected Value: {this.value}</p>
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
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
            Infinity
        );
    }
}
