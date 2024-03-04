import SetElement from '../data/setutils/SetElement';

// Query: [columnIndex, QueryTypes.xxx, ...]
export enum QueryType {
    Range = 0,
    SetAsArrayForReject = 1,
    SwappableRange = 2
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

export type SetAsArrayForRejectT = [
    colI: number,
    QueryType.SetAsArrayForReject,
    array: Set<string | SetElement>,
    isSetElement: boolean
];

export type Query = RangeQueryT | SwappableRangeQueryT | SetAsArrayForRejectT;
