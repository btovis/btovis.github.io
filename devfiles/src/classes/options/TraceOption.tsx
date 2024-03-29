import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';

export default abstract class TraceOption extends InputOption {
    // States that TraceOptions hold
    // Number of Traces
    public numTraces: number;
    public text: string[] = [];
    // Attribute each trace holds, careful the any type
    public traceValList: Array<any>;
    public traceTypeName: string;

    public constructor(
        panel: Panel,
        traceNames: string[],
        name: string,
        numTraces: number,
        traceTypeName: string,
        template?: TraceOption
    ) {
        super(panel, name);
        this.numTraces = numTraces;
        this.text = traceNames;
        this.accordionOpen = false;
        this.traceTypeName = traceTypeName;
        if (template != undefined) {
            this.traceValList = template.traceValList;
        }
    }

    // update number of traces: lazy update doesn't directly affect size of ValList if numTraces decrease
    public updateNumTraces(numTraces: number): void {
        this.numTraces = numTraces;
        if (numTraces > this.traceValList.length) {
            for (let i = this.traceValList.length; i < numTraces; i++) {
                // Use the first values to fill out missing ones that appears longer than default
                this.traceValList.push(this.traceValList[i % this.traceValList.length]);
            }
        }
        if (this.refreshComponent !== undefined) {
            this.refreshComponent();
        }
    }

    // Returns the JSXElement for sidebar for each trace
    public abstract getTraceComponent(traceValue: any, index: number): JSX.Element;

    public render(): JSX.Element {
        return this.generateAccordion(
            <div className='ColorOptions'>
                {this.traceValList
                    .slice(0, this.numTraces)
                    .map((color, index) => this.getTraceComponent(color, index))}
            </div>
        );
    }

    // Callback only refresh render
    public callback(newValue): void {
        this.refreshComponent();
        this.panel.refreshWidgets();
        this.extendedCallbacks.forEach((f) => f(newValue));
    }
    public query(): Query {
        throw new Error('Method not implemented.');
    }
    public value(): any[] {
        return this.traceValList.slice(0, this.numTraces);
    }
}
