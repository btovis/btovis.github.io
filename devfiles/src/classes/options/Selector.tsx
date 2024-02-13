import Query from '../query/Query';
import InputOption from './InputOption';

export default class Selector extends InputOption {
    public render(): JSX.Element[] {
        throw new Error('Method not implemented.');
    }
    public callback(newValue: any): void {
        throw new Error('Method not implemented.');
    }
    public query(): Query {
        throw new Error('Method not implemented.');
    }
}
