import { Data } from './Data';
import { Filter, PredicateType } from '../filters/Filter';
import SetFilter from '../filters/SetFilter';
import ReferenceSet from './setutils/ReferenceSet';
import { Attribute } from './Data';
import { Query, QueryType } from '../query/Query';
import RangeFilter from '../filters/RangeFilter';
import SwappableRangeFilter from '../filters/SwappableRangeFilter';
import { v4 as uuidv4 } from 'uuid';
import SetElement from './setutils/SetElement';

// call filterUpdate, this will call recalculateFilteredData
// if original file changed, call dataUpdated, this will call recalculateFilteredData

// There are two minor optimizations remaining with no visible impact on filtering speed.
// 1) recalculateFilteredData doesn't need to calculate filterColumns every time
// instead, this should be stored in a sorted array (a new class) and updated on filter update and
// 2) Replace all opaques with checkeveryitem. opaques don't need being optimized for
export default class DataFilterer {
    private data: Data;
    private filtersClasses: Filter[] = []; // Only updated when the user changes filtering setting
    private filterPredsForData = []; // Only updated when the user changes filtering setting (hence, indirectly) or when data is updated
    private filteredData; // Only updated when filterPredsForData is updated
    private filteredDataArrLen; // keeps len of output array. to reuse memory, the same array for filteredData

    //Meant for widgets to understand why render was called for optimisation purposes.
    private filterState = uuidv4(); //Changes when filters change
    private dataState = uuidv4(); //Changes when a file is added/removed
    public getFilterState() {
        return this.filterState;
    }
    public getDataState() {
        return this.dataState;
    }

    // Opaque: User has requested an impossible filter (e.g. no species) so terminate early
    private opaqueFilters = new Set<number>([]);
    // If Opaque filter, in this array, and predicate undefined
    // if transparent, predicate undefined
    // otherwise, predicate defined

    public constructor(data: Data) {
        this.data = data;
        // Preallocate to max size
        const db = data.readDatabase();
        this.filteredData = new Array(db.length);
        for (let i = 0; i < db.length; i++) this.filteredData[i] = db[i];

        this.filteredDataArrLen = db.length;
    }

    // currently, this function assumes it won't be called with same args consecutively
    // in which case it doesn't need to do work. Should this be handled?
    // columnIndex 0 is file
    // columnIndex can't be larger than the number of total columns
    // filterClass needs to be correct type, won't be checked here
    public replaceFilter(columnIndex, filterClass: Filter) {
        this.filterState = uuidv4(); //Filters changed
        this.filtersClasses[columnIndex] = filterClass;
        const [status, pred] = filterClass.getPredicate();
        this.filterPredsForData[columnIndex] = pred;
        if (status == PredicateType.Opaque) {
            this.opaqueFilters.add(columnIndex);
            this.filteredDataArrLen = 0;
            return;
        }
        this.opaqueFilters.delete(columnIndex);
        this.recalculateFilteredData();
    }

    public dataUpdated() {
        if (this.data.readDatabase().length != this.filteredData.length) {
            this.filteredData = new Array(this.data.readDatabase().length);
        }
        for (let i = 0; i < this.filtersClasses.length; i++) {
            if (this.filtersClasses[i]) {
                this.filtersClasses[i].updateSetReference(this.data.sets[i]);
                const [status, pred] = this.filtersClasses[i].getPredicate();
                this.filterPredsForData[i] = pred;
                if (status == PredicateType.Opaque) {
                    this.opaqueFilters.add(i);
                } else {
                    this.opaqueFilters.delete(i);
                }
            }
        }
        this.dataState = uuidv4(); //update data state
        this.recalculateFilteredData();
    }

    public recalculateFilteredData() {
        if (this.opaqueFilters.size) {
            this.filteredDataArrLen = 0;
            return;
        }
        const d = this.data.readDatabase(),
            filterColumns = [],
            filterPreds = [];
        const fData = this.filteredData;
        let l: number, fi; /* new table index, filter count, filter iterator */
        // use l for this loop as well
        for (l = 0; l < this.filterPredsForData.length; l++) {
            if (this.filterPredsForData[l]) {
                filterColumns.push(l);
                filterPreds.push(this.filterPredsForData[l]);
            }
        }
        const fLen = filterColumns.length;
        l = 0;
        row: for (const r of d) {
            for (fi = 0; fi < fLen; fi++) {
                if (!filterPreds[fi](r[filterColumns[fi]])) {
                    continue row;
                }
            }
            fData[l++] = r;
        }
        this.filteredDataArrLen = l;
    }

    // recalculates data
    public processQuery(q: Query) {
        switch (q[1]) {
            case QueryType.Range:
                this.replaceFilter(q[0], new RangeFilter(q[2], q[3]));
                break;
            case QueryType.SwappableRange:
                this.replaceFilter(q[0], new SwappableRangeFilter(q[2], q[3]));
                break;
            case QueryType.SetAsArrayForReject:
                {
                    if (q[3]) {
                        this.replaceFilter(
                            q[0],
                            new SetFilter(
                                ReferenceSet.fromSet(q[2] as Set<SetElement>),
                                this.data.sets[q[0]]
                            )
                        );
                    } else {
                        const excludes = new ReferenceSet();
                        for (const e of q[2]) {
                            const ref = this.data.sets[q[0]].getRef(e as string);
                            if (!ref) continue;
                            excludes.addRef(ref);
                        }
                        this.replaceFilter(q[0], new SetFilter(excludes, this.data.sets[q[0]]));
                    }
                }
                return;
        }
        this.recalculateFilteredData();
    }

    // This gives you an array of full size, but one shouldn't access it beyond the first dataArrLen elements.
    // So please use for (var i = 0; i < dataArrLen ; i++ ) { ...}
    // and don't use map, forEach.
    // You may want to say const [data, length] = filterer.getData(); const dataSubset = data.slice(0, length); but this can be slow.
    public getData(): [dataArr: Array<any>, dataArrLen: number] {
        return [this.filteredData, this.filteredDataArrLen];
    }

    // Please don't modify this either
    public getColumns(): string[] {
        return this.data.columnList;
    }

    // throws if it fails
    public getColumnIndex(a: Attribute | string): number {
        return this.data.getIndexForColumn(a);
    }

    public getDataStats() {
        return this.data.dataStats;
    }
}
