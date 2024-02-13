import SetElement from './SetElement';

export default class SetManager {
    private identifiers: Set<SetElement> = new Set([]);

    // To disallow two files of the same name
    public hasValue(ident: string): boolean {
        for (const i of this.identifiers) {
            if (i.getValue() == ident) {
                return true;
            }
        }
        return false;
    }

    // To make a new identifier
    // Prerequisite: checked and not a duplicate
    public add(ident: string): SetElement {
        const i = new SetElement(ident);
        this.identifiers.add(i);
        return i;
    }

    // Returns: successful or not
    public changeValue(ident: string, identNew: string): boolean {
        for (const i of this.identifiers) {
            if (i.getValue() == ident) {
                i.change(identNew);
                return true;
            }
        }
        return false;
    }

    // Entries must also be deleted from the database,
    // hence returns the SetElement
    public delete(ident: string): SetElement | null {
        for (const i of this.identifiers) {
            if (i.getValue() == ident) {
                this.identifiers.delete(i);
                return i;
            }
        }
        return null;
    }
}
