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
}
