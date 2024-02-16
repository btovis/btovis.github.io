import { Filter, PredicateType } from './Filter.ts';
import ReferenceSet from '../data/setutils/ReferenceSet.ts';
import SetElement from '../data/setutils/SetElement.ts';

function setDifferenceNew(a: Set<any>, b: Set<any>) {
    // @ts-expect-error: Use new feature if possible
    return a.difference(b);
}

function setDifferenceOld(a: Set<any>, b: Set<any>) {
    const s2 = new Set();
    for (const x of a) {
        if (!b.has(x)) {
            s2.add(x);
        }
    }
    return s2;
}

// @ts-expect-error: Use new feature if possible
const setDifference = new Set().difference ? setDifferenceNew : setDifferenceOld;

// Note: SetFilter receives SetManager not JS Set from UI!
// PageManager should store SetElements along with texts!
export default class SetFilter implements Filter {
    private e: ReferenceSet;
    private a: ReferenceSet;

    private pred: [PredicateType, undefined | ((a) => boolean)] | any[] = new Array(2);
    private mode: number; // 0: transparent 1: opaque, 2: "reject some" mode 3: "accept some" mode
    private allowSet: Set<any>; /* Used in "accept some" mode, ie, mode = 3 */
    // filter in rejection mode. e.g. if, out of 300 species, reject 3... up to 150
    // more efficient to consider what to reject than to what to accept
    // whereas in "accept some" mode, check if equal to A, or B, or C, ... otherwise fails

    // currently, a little inefficient but, even when allowSet is being used, keep e up to date

    public constructor(filterAwayThisSet: ReferenceSet, allVals: ReferenceSet) {
        this.e = filterAwayThisSet;
        this.a = allVals;
        this.recalculateAll();
    }

    public updateSetReference(sr) {
        this.a = sr;
        this.recalculateAll();
    }

    // e: exclude, a: all
    private recalculateAll() {
        // naming: le is length "exclude", la is length "all", "eS" is exclude set
        const eS = this.e.refs,
            le = eS.size,
            la = this.a.size();
        if (le == 0) {
            this.mode = 0;
            this.pred[0] = PredicateType.Transparent;
            this.pred[1] = undefined;
        } else if (le == la) {
            this.mode = 1;
            this.pred[0] = PredicateType.Opaque;
            this.pred[1] = undefined;
        } else if (le <= la / 2) {
            this.mode = 2;
            this.pred[0] = PredicateType.CheckEveryItem;
            this.pred[1] = (c) => !eS.has(c);
        } else {
            const allow = (this.allowSet = setDifference(this.a.refs, eS));
            this.mode = 3;
            this.pred[0] = PredicateType.CheckEveryItem;
            this.pred[1] = (c) => allow.has(c);
        }
    }

    // Note: the functions below do not transition to opaque or transparent and this is not a bug

    public filterAway(e: SetElement) {
        const eS = this.e;
        // readonly:
        const eSR = this.e.refs;

        eS.addRef(e);

        // 0: transparent 1: opaque, 2: "reject some" mode 3: "accept some" mode
        switch (this.mode) {
            case 0:
                // Switch from "transparent" to "reject some" /*or "opaque"*/
                this.mode = 2;
                this.pred[0] = PredicateType.CheckEveryItem;
                this.pred[1] = (c) => !eSR.has(c);
                return;
            case 1:
                return;
            case 2:
                // stay in reject some if exclude set still small, otherwise calculate allow set, switch to accept some set
                if (eS.size() > this.a.size() / 2) {
                    // switch to accept some
                    this.mode = 3;
                    const al = (this.allowSet = setDifference(this.a.refs, eSR));
                    this.pred[1] = (c) => al.has(c);
                }
                return;
            case 3:
                // stay in accept some
                this.allowSet.delete(e);
                return;
        }
    }

    public accept(e: SetElement) {
        const eS = this.e;
        // readonly:
        const eSR = this.e.refs;

        eS.removeRef(e);

        // 0: transparent 1: opaque, 2: "reject some" mode 3: "accept some" mode
        switch (this.mode) {
            case 0:
                return;
            case 1: {
                // Switch from opaque to "accept some" /*or transparent*/
                const al = (this.allowSet = setDifference(this.a.refs, eSR));
                this.mode = 3;
                this.pred[0] = PredicateType.CheckEveryItem;
                this.pred[1] = (c) => al.has(c);
                return;
            }
            case 2:
                // stay in reject some
                return;
            case 3:
                // stay in accept some if exclude set still large, otherwise discard allow set and switch back to exclude some
                if (eS.size() <= this.a.size() / 2) {
                    // switch to reject some
                    this.mode = 2;
                    this.allowSet = undefined;
                    this.pred[1] = (c) => !eSR.has(c);
                } else {
                    this.allowSet.add(e);
                }
                return;
        }
    }

    // sets the "excludes set"
    // as opposed to filterAway and accept, takes entire list
    public setExcludesSet(e: ReferenceSet) {
        this.e = e;
        this.recalculateAll();
    }

    public getPredicate(): [PredicateType, undefined | ((a) => boolean)] | any[] {
        return this.pred;
    }
}