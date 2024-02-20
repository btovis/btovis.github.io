import SetElement from './SetElement';

export default class ReferenceSet {
    // We do need Set<SetElement>, this is used when filtering species
    // but we also need Set<real thing>, this allows us to add species fast

    // To add, check raws.
    // to filter, use refs.
    // Do not modify these except through methods
    public refs: Set<SetElement> = new Set([]);
    public raws: Map<string, SetElement> = new Map([]);

    // see if element exists. if so, get it. otherwise, make new, add it, get it.
    /* eslint no-var: off */
    public addRawOrGet(ident: string): SetElement {
        var e = this.raws.get(ident);
        if (e !== undefined) {
            return e;
        }
        e = new SetElement(ident);
        this.raws.set(ident, e);
        this.refs.add(e);
        return e;
    }

    // add new element
    public addRef(e: SetElement) {
        this.raws.set(e.value, e);
        this.refs.add(e);
    }

    // Used when there's difference between reusing the same value and making a new value
    // e.g. to disallow two files of the same name and to try to have a new file
    public hasRaw(ident: string): boolean {
        return this.raws.has(ident);
    }

    // No "hasRef": please call it directly refs

    // Returns: successful or not
    public changeValue(ident: string, identNew: string): boolean {
        var e = this.raws.get(ident);
        if (e === undefined) {
            return false;
        }
        e.value = identNew;
        this.raws.delete(ident);
        this.raws.set(identNew, e);
        return true;
    }

    // Entries must also be deleted from the database,
    // hence returns the SetElement
    public remove(ident: string): SetElement | null {
        var e = this.raws.get(ident);
        if (e === undefined) {
            return null;
        }
        this.raws.delete(ident);
        this.refs.delete(e);
        return e;
    }

    // Entries might also have to be deleted from the database
    public removeRef(e: SetElement) {
        const i = e.value;
        this.raws.delete(i);
        this.refs.delete(e);
    }

    public size() {
        return this.refs.size;
    }

    public static fromSet(s: Set<SetElement>) {
        const n = new ReferenceSet();
        for (const e of s) {
            n.addRef(e);
        }
        return n;
    }
}
