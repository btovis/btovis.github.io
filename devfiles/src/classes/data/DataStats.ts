import { EndangermentStatus, getSpeciesEndangerment } from '../../utils/speciesVulnerability';
import RangeMeta from '../queryMeta/RangeMeta';
import SetMeta from '../queryMeta/SetMeta';
import SpeciesMeta from '../queryMeta/SpeciesMeta';
import { Attribute, Data } from './Data';
import SetElement from './setutils/SetElement';

// currently, recalculates for all data whenever updated
export default class DataStats {
    private data: Data;
    private timeRange: [] | [low: string, up: string, colI: number] = [];

    // count was removed. Was it wanted?
    // Scientific name to species tuple of values
    // SetElement("Barbastella barbastellus"): [SetElement("Barbar"), SetElement("Barbastelle"),SetElement("bat"),UNKNOWN][]
    private species: Map<
        SetElement,
        [
            species: SetElement,
            englishName: SetElement,
            group: SetElement,
            status: EndangermentStatus
        ]
    > = new Map();

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
        }
        if (min != 'z') {
            this.timeRange[0] = min;
            this.timeRange[1] = max;
            this.timeRange[2] = dateCol;
        } else {
            this.timeRange.length = 0;
        }
        // species count array
        //This is placed outside the loop above to facilitate merging later
        //Purge species list to force a complete refresh
        this.species.clear();
        const uniqueSpecies =
            this.data.sets[this.data.getIndexForColumn(Attribute.speciesLatinName)].size();
        const latinNameCol = this.data.getIndexForColumn(Attribute.speciesLatinName);
        const speciesCol = this.data.getIndexForColumn(Attribute.species);
        const speciesEnglishCol = this.data.getIndexForColumn(Attribute.speciesEnglishName);
        const groupCol = this.data.getIndexForColumn(Attribute.speciesGroup);
        const db = this.data.readDatabase(),
            l = db.length;
        let rowIndex = 0;
        while (this.species.size < uniqueSpecies && rowIndex < l) {
            const latinName = db[rowIndex][latinNameCol];
            if (!this.species.has(latinName as SetElement)) {
                this.species.set(latinName as SetElement, [
                    db[rowIndex][speciesCol] as SetElement,
                    db[rowIndex][speciesEnglishCol] as SetElement,
                    db[rowIndex][groupCol] as SetElement,
                    getSpeciesEndangerment((latinName as SetElement).value)
                ]);
            }
            rowIndex++;
        }
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
