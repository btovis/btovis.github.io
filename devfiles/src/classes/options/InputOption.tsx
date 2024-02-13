import Query from '../query/Query';

export default abstract class InputOption {
    public readonly name: string;
    public constructor(name: string) {
        this.name = name;
    }
    public abstract query(): Query;
    public abstract render(): JSX.Element[];
    public abstract callback(newValue: any);
}
