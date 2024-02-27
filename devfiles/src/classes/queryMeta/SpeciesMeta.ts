import { EndangermentStatus } from '../../utils/speciesVulnerability';
import SetElement from '../data/setutils/SetElement';

export default class SpeciesMeta {
    //No writing to this
    private readonly species: Map<
        SetElement,
        [
            species: SetElement,
            englishName: SetElement,
            group: SetElement,
            status: EndangermentStatus
        ]
    >;

    //A map of group SetElements to a list of latinNames
    public readonly groupByGroup: Map<SetElement, SetElement[]>;

    public constructor(
        species: Map<
            SetElement,
            [
                species: SetElement,
                englishName: SetElement,
                group: SetElement,
                status: EndangermentStatus
            ]
        >
    ) {
        this.species = species;
        this.groupByGroup = new Map();
        [...this.species.keys()].forEach((latinName) => {
            const group = this.speciesGroup(latinName);
            if (!this.groupByGroup.has(group)) this.groupByGroup.set(group, [latinName]);
            else this.groupByGroup.get(group).push(latinName);
        });
    }

    public englishName(latinName: SetElement): SetElement {
        return this.species.get(latinName)[1];
    }
    public speciesName(latinName: SetElement): SetElement {
        return this.species.get(latinName)[0];
    }
    public speciesGroup(latinName: SetElement): SetElement {
        return this.species.get(latinName)[2];
    }
    public endStatus(latinName: SetElement): EndangermentStatus {
        return this.species.get(latinName)[3];
    }
}
