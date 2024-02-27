import SetElement from '../data/setutils/SetElement';

// Query: [columnIndex, QueryTypes.xxx, ...]
export enum QueryType {
    Range = 0,
    SwappableRange = 5,
    SetElem = 1,
    Set = 2,
    SetAsArray = 3,
    SetAsArrayForReject = 4
}

export type RangeQueryT = [
    colI: number,
    QueryType.Range,
    low: number | string,
    high: number | string
];
export type SwappableRangeQueryT = [
    colI: number,
    QueryType.SwappableRange,
    low: number | string,
    high: number | string
];
export type SetElemQueryT = [
    colI: number,
    QueryType.SetElem,
    e: SetElement,
    oneOrTrueForAccept0orFalseForReject: number | boolean
];
export type SetQueryT = [
    colI: number,
    QueryType.Set,
    twoForInvertOneOrTrueForAccept0orFalseForReject: number | boolean
];

export type SetAsArrayT = [colI: number, QueryType.SetAsArray, array: string[]];
export type SetAsArrayForRejectT = [colI: number, QueryType.SetAsArrayForReject, array: string[]];

export type Query =
    | RangeQueryT
    | SwappableRangeQueryT
    | SetElemQueryT
    | SetQueryT
    | SetAsArrayT
    | SetAsArrayForRejectT;
