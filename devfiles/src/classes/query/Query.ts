import Row from "../data/Row";

export default abstract class Query {
    abstract get_filter(): (row: Row) => boolean
    
    abstract compose(query: Query): Query
}
