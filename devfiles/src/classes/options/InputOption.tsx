import Panel from '../Panel';
import Query from '../query/Query';

export default abstract class InputOption {
    public readonly name: string;
    public constructor(name: string) {
        this.name = name;
    }
    public abstract query(): Query;
    public abstract render(): JSX.Element[];
    public abstract callback(newValue: any);
    public static fromPanel(panel: Panel): InputOption {
        throw new Error('Not implemented, please call fromPanel on a subclass of InputOption');
    }
}
