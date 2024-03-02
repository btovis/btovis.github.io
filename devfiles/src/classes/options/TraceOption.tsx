import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import Accordion from 'react-bootstrap/Accordion';

export default abstract class TraceOption extends InputOption {
    // States that ColorOption hold
    public numTraces: number;
    public traceValList: Array<string>;
    public accordionOpen: boolean;

    public constructor(panel: Panel, name: string, numTraces: number, template?: TraceOption) {
        super(panel, name);
        this.numTraces = numTraces;
        this.accordionOpen = false;
    }

    // ColorOptions implementation of getTraceComponent
    public abstract getTraceComponent(traceValue: any, index: number): JSX.Element;

    public updateNumTraces(numTraces: number): void {
        this.numTraces = numTraces;
        this.refreshComponent();
    }

    public render(): JSX.Element {
        return (
            <Accordion
                onSelect={(eventKey) => {
                    this.accordionOpen = typeof eventKey === 'string';
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
                        <div className='ColorOptions'>
                            {this.traceValList
                                .slice(0, this.numTraces)
                                .map((color, index) => this.getTraceComponent(color, index))}
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        );
    }

    public callback(newValue): void {
        console.log('called');
        this.extendedCallbacks.forEach((f) => f(newValue));
    }
    public query(): Query {
        throw new Error('Method not implemented.');
    }
    public value(): any[] {
        return this.traceValList.slice(0, this.numTraces);
    }
}
