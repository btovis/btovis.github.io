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
    private timer: NodeJS.Timeout;
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
                            <strong id={this.uuid.toString() + 'title'}>{this.name}</strong>
                        </span>
                    </Accordion.Header>
                    <Accordion.Body>
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
                                        document.getElementById(
                                            this.uuid + '-textsel'
                                        ) as HTMLInputElement
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
                                            document.getElementById(
                                                this.uuid + '-rangesel'
                                            ) as HTMLInputElement
                                        ).value = event.currentTarget.value;
                                        this.debounce(event.target.valueAsNumber);
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
        //If filter is active then indicate with title colour
        document.getElementById(this.uuid.toString() + 'title').style.color =
            this.value == 0 ? '' : 'chocolate';

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
