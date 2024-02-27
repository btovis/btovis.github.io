import SetElement from '../data/setutils/SetElement';

// Query: [columnIndex, QueryTypes.xxx, ...]
export enum QueryType {
    Range = 0,
    SetElem = 1,
    Set = 2,
    SetAsArray = 3,
    SetAsArrayForReject = 4
}

export type RangeQuery = [
    colI: number,
    QueryType.Range,
    low: number | string,
    high: number | string
];
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

export type SetAsArray = [colI: number, QueryType.SetAsArray, array: string[]];
export type SetAsArrayForReject = [colI: number, QueryType.SetAsArrayForReject, array: string[]];

export type Query = RangeQuery | SetElemQuery | SetQuery | SetAsArray | SetAsArrayForReject;
