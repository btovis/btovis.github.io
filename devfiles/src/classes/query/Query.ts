import SetElement from '../data/setutils/SetElement';

// Query: [columnIndex, QueryTypes.xxx, ...]
export enum QueryType {
    Range = 0,
    SetElem = 1,
    Set = 2
}

export type RangeQuery = [colI: number, QueryType.Range, low: number, high: number];
export type SetElemQuery = [
    colI: number,
    QueryType.SetElem,
    e: SetElement,
    oneOrTrueForAccept0orFalseForReject: number | boolean
];
export type SetQuery = [
    colI: number,
    QueryType.Set,
    twoForInvertOneOrTrueForAccept0orFalseForReject: number | boolean
];

export type Query = RangeQuery | SetElemQuery | SetQuery;
