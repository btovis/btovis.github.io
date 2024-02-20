import RangeMeta from '../queryMeta/RangeMeta';
import SpeciesMeta from '../queryMeta/SpeciesMeta';
import { Attribute, Data } from './Data';
import SetElement from './setutils/SetElement';

// currently, recalculates for all data whenever updated
export default class DataStats {
    private data: Data;

    private species: [species: SetElement, count: number][][] = []; // [[SetElement("Anglican skybird"), 100], [SetElement("Anglican skybird"), 150]]
    private timeRange: [Date, Date, colI: number | undefined] = [
        -Infinity as unknown as Date,
        +Infinity as unknown as Date,
        undefined
    ];

    public constructor(d: Data) {
        this.data = d;
        if (!d) throw 'Stats uninitialized'; // can be removed
    }

    public refresh() {
        // date range ('ACTUAL DATE')
        const dateCol = this.data.getIndexForColumn(Attribute.actualDate);
        if (dateCol) {
            let min = +Infinity as unknown as Date;
            let max = -Infinity as unknown as Date;
            const db = this.data.readDatabase(),
                l = db.length;
            for (let i = 0; i < l; i++) {
                const d = db[i][dateCol];
                if (!(d instanceof Date)) continue;
                if ((db[i][dateCol] as unknown as Date) < min)
                    min = db[i][dateCol] as unknown as Date;
                if ((db[i][dateCol] as unknown as Date) > max)
                    max = db[i][dateCol] as unknown as Date;
            }
            this.timeRange[0] = min;
            this.timeRange[1] = max;
        }
        if (!dateCol || !this.timeRange[0] || !this.timeRange[1]) {
            this.timeRange[2] = undefined;
        } else {
            this.timeRange[2] = dateCol;
        }
        // species count array

        //const this.data.getIndexForColumn(Attribute.actualDate);
    }

    // You shouldn't need to call this more than once but no harm otherwise
    public getSpeciesMeta() {
        return new SpeciesMeta(this.species);
    }

    // You shouldn't need to call this more than once but no harm otherwise
    public getTimeMeta() {
        return new RangeMeta(this.timeRange);
    }
}
