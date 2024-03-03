import { Accordion } from 'react-bootstrap';
import Panel from '../Panel';
import { Query } from '../query/Query';
import { v4 as uuidv4 } from 'uuid';

export default abstract class InputOption {
    //Needs to be individually defined in each option's callback function.
    protected accordionOpen: boolean = false;
    public extendedCallbacks: ((any) => void)[] = [];
    public readonly uuid: number;
    public readonly name: string;
    protected readonly panel: Panel;
    public refreshComponent: () => void;
    public constructor(panel: Panel, name: string) {
        this.uuid = uuidv4();
        this.panel = panel;
        this.name = name;
    }
    public abstract query(): Query | { compound: boolean; queries: Query[] };
    public abstract render(): JSX.Element;
    public abstract callback(newValue);
    public generateAccordion(body: JSX.Element, updateOnExit: boolean = true): JSX.Element {
        return (
            <Accordion
                onSelect={(eventKey) => {
                    this.accordionOpen = typeof eventKey === 'string';
                }}
                defaultActiveKey={this.accordionOpen ? '0' : []}
                key={this.uuid}
            >
                <Accordion.Item eventKey='0'>
                    <Accordion.Header key={this.uuid.toString() + '-header'}>
                        <span
                            style={{
                                color: this.checkDefault() ? '' : 'chocolate',
                                fontSize: 'larger'
                            }}
                            id={this.uuid.toString() + 'title'}
                        >
                            {this.name}
                        </span>
                    </Accordion.Header>
                    <Accordion.Body
                        onBlur={() => {
                            if (updateOnExit) this.panel.refreshWidgets();
                        }}
                    >
                        {body}
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        );
    }
    protected checkDefault(): boolean {
        // Check whether the current value is the default value.
        return true;
    }
}
