import RangeMeta from '../queryMeta/RangeMeta';
import SetMeta from '../queryMeta/SetMeta';
import SpeciesMeta from '../queryMeta/SpeciesMeta';
import { Attribute, Data } from './Data';
import SetElement from './setutils/SetElement';

// currently, recalculates for all data whenever updated
export default class DataStats {
    private data: Data;

    private species: [species: SetElement, count: number][][] = []; // [[SetElement("Anglican skybird"), 100], [SetElement("Anglican skybird"), 150]]
    private timeRange: undefined | [string, string, colI: number] = undefined;

    public constructor(d: Data) {
        this.data = d;
        if (!d) throw 'Stats uninitialized'; // can be removed
    }

    public refresh() {
        // date range ('ACTUAL DATE')
        const dateCol = this.data.getIndexForColumn(Attribute.actualDate);
        let min = 'z';
        let max = '0';
        if (dateCol) {
            const db = this.data.readDatabase(),
                l = db.length;
            for (let i = 0; i < l; i++) {
                const d = db[i][dateCol] as string;
                if (!d.startsWith('20')) continue;
                if (d < min) min = d;
                if (d > max) max = d;
            }
            this.timeRange[0] = min;
            this.timeRange[1] = max;
        }
        if (min != 'z') {
            this.timeRange[0] = min;
            this.timeRange[1] = max;
            this.timeRange[2] = dateCol;
        } else {
            this.timeRange = undefined;
        }
        // species count array

        //const this.data.getIndexForColumn(Attribute.actualDate);
    }

    // You shouldn't need to call this more than once but no harm otherwise
    public getSpeciesMeta() {
        return new SpeciesMeta(this.species);
    }

    public getFilesMeta() {
        return new SetMeta(this.data.sets[0]);
    }

    // You shouldn't need to call this more than once but no harm otherwise
    public getTimeMeta() {
        return new RangeMeta(this.timeRange);
    }
}
