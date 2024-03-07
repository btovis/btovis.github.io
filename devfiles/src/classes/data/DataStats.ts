import { EndangermentStatus, getSpeciesEndangerment } from '../../utils/speciesVulnerability';
import PositionMeta from '../queryMeta/PositionMeta';
import RangeMeta from '../queryMeta/RangeMeta';
import SetMeta from '../queryMeta/SetMeta';
import SpeciesMeta from '../queryMeta/SpeciesMeta';
import { Attribute, Data } from './Data';
import SetElement from './setutils/SetElement';

// currently, recalculates for all data whenever updated
export default class DataStats {
    private data: Data;
    private actualTimeRange: [] | [low: string, up: string, colI: number] = [];
    private surveyTimeRange: [] | [low: string, up: string, colI: number] = [];

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

    private positionMeta: PositionMeta;
    private speciesMeta: SpeciesMeta;

    public constructor(d: Data) {
        this.data = d;
        if (!d) throw 'Stats uninitialized'; // can be removed
    }

    public refresh() {
        if (this.data.isEmpty()) return;
        //Required Columns, throw otherwise
        const actualDateCol = this.data.getIndexForColumn(Attribute.actualDate);
        const surveyDateCol = this.data.getIndexForColumn(Attribute.surveyDate);
        const latCol = this.data.getIndexForColumn(Attribute.latitude);
        const lonCol = this.data.getIndexForColumn(Attribute.longitude);

        //TimeMeta Initialisers
        let acMin = 'z';
        let surMin = 'z';
        let acMax = '0';
        let surMax = '0';
        //PositionMeta Initialisers
        const uniquePositions = new Set<string>();
        const globalMin = [Infinity, Infinity];
        const globalMax = [-Infinity, -Infinity];

        //Iterate every row. Process stuff here
        const db = this.data.readDatabase();
        const l = db.length;
        for (let i = 0; i < l; i++) {
            const row = db[i];
            //TimeMeta processing
            const d = row[actualDateCol] as string;
            if (d.startsWith('20')) {
                if (d < acMin) acMin = d;
                if (d > acMax) acMax = d;
            }
            const d2 = row[surveyDateCol] as string;
            if (d2.startsWith('20')) {
                if (d2 < surMin) surMin = d2;
                if (d2 > surMax) surMax = d2;
            }

            //PositionMeta processing
            uniquePositions.add(row[latCol].toString() + '\0' + row[lonCol].toString());
            if (isFinite(row[latCol] as number)) {
                globalMin[0] = Math.min(globalMin[0], row[latCol] as number);
                globalMax[0] = Math.max(globalMax[0], row[latCol] as number);
            }
            if (isFinite(row[lonCol] as number)) {
                globalMin[1] = Math.min(globalMin[1], row[lonCol] as number);
                globalMax[1] = Math.max(globalMax[1], row[lonCol] as number);
            }
        }

        //TimeMeta Post-Processing
        if (acMin != 'z') {
            this.actualTimeRange[0] = acMin;
            this.actualTimeRange[1] = acMax;
            this.actualTimeRange[2] = actualDateCol;
        } else {
            this.actualTimeRange.length = 0;
        }

        if (surMin != 'z') {
            this.surveyTimeRange[0] = surMin;
            this.surveyTimeRange[1] = surMax;
            this.surveyTimeRange[2] = surveyDateCol;
        } else {
            this.surveyTimeRange.length = 0;
        }
        //PositionMeta Post-Processing
        this.positionMeta = new PositionMeta(uniquePositions, globalMin, globalMax);

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

        this.speciesMeta = new SpeciesMeta(this.species);
    }

    // You shouldn't need to call this more than once but no harm otherwise
    public getSpeciesMeta() {
        return this.speciesMeta;
    }

    public getFilesMeta() {
        return new SetMeta(this.data.sets[0]);
    }

    // You shouldn't need to call this more than once but no harm otherwise
    public getActualTimeMeta() {
        return new RangeMeta(this.actualTimeRange);
    }

    public getSurveyTimeMeta() {
        return new RangeMeta(this.surveyTimeRange);
    }

    public getPositionMeta() {
        return this.positionMeta;
    }
}
