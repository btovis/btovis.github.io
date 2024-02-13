import Row from '../data/Row';

export default abstract class Query {
    abstract getFilter(): (row: Row) => boolean;

    abstract compose(query: Query): Query;
}
