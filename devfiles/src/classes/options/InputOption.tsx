import Panel from '../Panel';
import Query from '../query/Query';

export default abstract class InputOption {
    public readonly name: string;
    protected readonly panel: Panel;
    public constructor(panel: Panel, name: string) {
        this.name = name;
        this.panel = panel;
    }
    public abstract query(): Query;
    public abstract render(): JSX.Element[];
    public abstract callback(newValue: any);
}
