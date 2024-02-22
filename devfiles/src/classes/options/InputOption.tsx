import Panel from '../Panel';
import { Query } from '../query/Query';
import { v4 as uuidv4 } from 'uuid';

export default abstract class InputOption {
    public readonly uuid: number;
    public readonly name: string;
    protected readonly panel: Panel;
    public constructor(panel: Panel, name: string) {
        this.uuid = uuidv4();
        this.panel = panel;
        this.name = name;
    }
    public abstract query(): Query;
    public abstract render(): JSX.Element[];
    public abstract callback(newValue: any);
}
