import SetElement from './setutils/SetElement';

//Rows are not classes. They are a union type array
type Row = (SetElement | string | number)[];

export default Row;
