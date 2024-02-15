import { Data } from './Data';
import { Filter, PredicateType } from '../filters/Filter';
import SetElement from './setutils/SetElement';
import SetFilter from '../filters/SetFilter';
import ReferenceSet from './setutils/ReferenceSet';

// call filterUpdate on filterupdate. this will call recalculateFilteredData
// if original file changed, call recalculateFilteredData

// TODO: propagate data changes to filters!!!!
// make it easy to update sets
// to call replacefilter method, make a builder for setfilter and one for rangefilter

// TODOs:
// There are minor optimizations remaining with no significant impact
// on filtering speed.
// 1) Sets need a differential filter update: add species or remove species
// instead of reconstructing the filter set again and again every time species filter changed
// 2) recalculateFilteredData doesn't need to calculate filterColumns every time
// instead, this should be stored in a sorted array (a new class) and updated on filter update and
export default class DataFilterer {
    private d: Data;
    private filtersClasses: Filter[] = []; // Only updated when the user changes filtering setting
    private filterPredsForData = []; // Only updated when the user changes filtering setting (hence, indirectly) or when data is updated
    private filteredData; // Only updated when filterPredsForData is updated
    private filteredDataArrLen; // keeps len of output array. to reuse memory

    // User has requested an impossible filter so terminate early
    private opaqueFilters = new Set<number>([]);

    public constructor(data: Data) {
        this.d = data;
        // Preallocate to max size
        this.filteredData = new Array(data.sortedDatabase.length);
        this.filteredDataArrLen = 0;
    }

    // currently, this function assumes it won't be called with same args consecutively
    // in which case it doesn't need to do work. Should this be handled?
    // columnIndex 0 is file
    // columnIndex can't be larger than the number of total columns
    // filterClass needs to be correct type, won't be checked here
    public replaceFilter(columnIndex, filterClass: Filter) {
        if (columnIndex >= this.d.sets.length) {
            throw 'column out of bounds';
        }
        this.filtersClasses[columnIndex] = filterClass;
        const [status, pred] = filterClass.getPredicate();
        if (status == PredicateType.Opaque) {
            this.opaqueFilters.add(columnIndex);
            this.filteredDataArrLen = 0;
            this.filterPredsForData[columnIndex] = undefined;
            return; // Does this work well with recalculateFilteredData?
        }
        this.opaqueFilters.delete(columnIndex);
        this.filterPredsForData[columnIndex] = pred;
        this.recalculateFilteredData();
    }

    // The caller ensures that filters[columnIndex] is a set and not a range
    public updateSetFilter(columnIndex, e: SetElement, filterAwayFromNowOn: boolean) {
        if (columnIndex >= this.d.sets.length) {
            throw 'column out of bounds';
        }
        let c: SetFilter = this.filtersClasses[columnIndex] as SetFilter;
        if (!c) {
            c = this.filtersClasses[columnIndex] = new SetFilter(
                new ReferenceSet(),
                this.d.sets[columnIndex]
            );
        }
        if (filterAwayFromNowOn) {
            c.filterAway(e);
        } else {
            c.accept(e);
            this.opaqueFilters.delete(columnIndex);
        }
        this.filterPredsForData[columnIndex] = this.filtersClasses[columnIndex].getPredicate();
        this.recalculateFilteredData();
    }

    public recalculateFilteredData() {
        if (this.opaqueFilters.size) {
            this.filteredDataArrLen = 0;
            return;
        }
        const d = this.d.sortedDatabase,
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
        for (const r of d) {
            for (fi = 0; fi < fLen; fi++) {
                if (!filterPreds[fi](r[filterColumns[fi]])) {
                    continue;
                }
                fData[l++] = r;
            }
        }
        this.filteredDataArrLen = l;
    }

    public getData(): [dataArr: Array<any>, dataArrLen: number] {
        return [this.filteredData, this.filteredDataArrLen];
    }
}
