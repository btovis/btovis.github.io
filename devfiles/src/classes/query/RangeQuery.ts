import { QueryTypes } from './QueryTypes';

export default class RangeQuery {
    colI: any;
    public constructor(columnIndex) {
        this.colI = columnIndex;
    }
    // Note: if the user didn't specifically choose a range, use -Infinity and +Infinite and not the max and min in dataset
    // this will allow keeping rows that perhaps don't have a date
    public query(low: number | Date, up: number | Date) {
        return [this.colI, QueryTypes.Range, low, up];
    }
}
