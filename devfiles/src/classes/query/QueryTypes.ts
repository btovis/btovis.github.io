// Query: [columnIndex, QueryTypes.xxx, ...]
export enum QueryTypes {
    Range = 0,
    SetElem = 1, // second element 1 for enable element, 0 for disable element
    Set = 2 // second element 1 for enable set, 0 for disable set, 2 for invert set
}
