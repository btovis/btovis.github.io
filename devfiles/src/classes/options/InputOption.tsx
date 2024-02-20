import Panel from '../Panel';
import Query from '../query/Query';

export default abstract class InputOption {
    public readonly name: string;
    public constructor(panel: Panel, name: string) {
        if (panel)
            // @ts-expect-error: how to allow for both panel and global? currently pass null
            this.panel = panel;
        this.name = name;
    }
    public abstract query(): Query;
    public abstract render(): JSX.Element[];
    public abstract callback(newValue: any);
}
