import { QueryType } from './Query';

export default class RangeQuery {
    colI: any;
    public constructor(columnIndex) {
        this.colI = columnIndex;
    }
    // Note: if the user didn't specifically choose a range, use -Infinity and +Infinite and not the max and min in dataset
    // this will allow keeping rows that perhaps don't have a date
    // for this, check if the slider is touching the border of line or the textinput has value same as its limit, then pass infinity if so
    public query(low: number | Date, up: number | Date) {
        return [this.colI, QueryType.Range, low, up];
    }
}
