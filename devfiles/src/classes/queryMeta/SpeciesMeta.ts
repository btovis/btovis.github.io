import { EndangermentStatus } from '../../utils/speciesVulnerability';
import SetElement from '../data/setutils/SetElement';

export default class SpeciesMeta {
    //No writing to this
    public readonly species: Map<
        SetElement,
        [
            species: SetElement,
            englishName: SetElement,
            group: SetElement,
            status: EndangermentStatus
        ]
    >;
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
