import SetElement from '../data/setutils/SetElement';
import { Attribute, Data } from '../data/Data';
import Row from '../data/Row';
import ReferenceSet from '../data/setutils/ReferenceSet';
import { Filter } from '../filters/Filter';
import DataFilterer from '../data/DataFilterer';

abstract class Grouping {
    filter: DataFilterer;
    referenceSet: ReferenceSet;
    speciesColumnIdx: number;
    constructor(filter: DataFilterer) {
        this.filter = filter;
        this.referenceSet = new ReferenceSet();
        this.speciesColumnIdx = filter.getColumnIndex(Attribute.speciesLatinName);
    }
    // Select the value to be used for the x-axis.
    public abstract selectX(row: Row): SetElement;
    public selectByColumnIndex(row: Row, columnIdx: number): SetElement {
        if (row[columnIdx] instanceof SetElement) {
            return row[columnIdx];
        }
        // Create a new set element and add the value to the reference set.
        return this.referenceSet.addRawOrGet(row[columnIdx]);
    }
    // Select the value to be used for the y-axis.
    public selectY(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.speciesColumnIdx);
    }
    // Select pairs of x-y values that will be aggregated and plotted.
    public generatePairs(): [SetElement, SetElement][] {
        const [data, length] = this.filter.getData();
        const dataSubset = data.slice(0, length);
        return dataSubset.map((row) => [this.selectX(row), this.selectY(row)]);
    }
    // Aggregate the pairs of x-y values.
    public aggregatePairs() {}
    // Generate a trace that includes the core data but excludes the additional config.
    public getPartialTraces() {}
    public getTraces(data: Data, additionalConfig: { [key: string]: any }) {}
}

class BatchNameGrouping extends Grouping {
    columnIdx: number;
    constructor(filter: DataFilterer) {
        super(filter);
        this.columnIdx = filter.getColumnIndex(Attribute.batchName);
    }
    public selectX(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.columnIdx);
    }
}

class ProjectNameGrouping extends Grouping {
    columnIdx: number;
    constructor(filter: DataFilterer) {
        super(filter);
        this.columnIdx = filter.getColumnIndex(Attribute.projectName);
    }
    public selectX(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.columnIdx);
    }
}

class FilenameGrouping extends Grouping {
    columnIdx: number;
    constructor(filter: DataFilterer) {
        super(filter);
        this.columnIdx = filter.getColumnIndex(Attribute.originalFileName);
    }
    public selectX(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.columnIdx);
    }
}

export { Grouping, BatchNameGrouping, FilenameGrouping, ProjectNameGrouping };
