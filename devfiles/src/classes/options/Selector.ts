import Query from '../query/Query';
import InputOption from './InputOption';

export default class Selector extends InputOption {
    query(): Query {
        throw new Error('Method not implemented.');
    }
}
