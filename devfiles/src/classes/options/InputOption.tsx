import Panel from '../Panel';
import { Query } from '../query/Query';
import { v4 as uuidv4 } from 'uuid';

export default abstract class InputOption {
    //Needs to be individually defined in each option's callback function.
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
}
