import Query from '../query/Query';
import InputOption from './InputOption';

export default class TextInput extends InputOption {
    private text: string;
    public render(): JSX.Element[] {
        return [<p>Text Input</p>];
    }
    public callback(newValue: any): void {
        this.text = newValue;
    }
    public query(): Query {
        throw new Error('Method not implemented.');
    }
    public value(): string {
        return this.text;
    }
}
