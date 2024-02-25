import { Filter, PredicateType } from './Filter.ts';
import ReferenceSet from '../data/setutils/ReferenceSet.ts';
import SetElement from '../data/setutils/SetElement.ts';

import { setDifference } from '../data/setutils/setDifference.ts';

// Note: SetFilter receives SetManager not JS Set from UI!
// PageManager should store SetElements along with texts!
export default class SetFilter implements Filter {
    private e: ReferenceSet; // exclude
    private a: ReferenceSet; // all elements
    private prevACopy: Set<SetElement>; // previous "all elements"

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
        this.prevACopy = new Set(allVals.refs);
        this.recalculateAll();
    }

    // Assume new items added, or old items removed, but not both.
    public updateSetReference(sr: ReferenceSet) {
        this.a = sr;
        if (sr.size() < this.prevACopy.size) {
            // See which elements no longer in new set - no longer exclude them
            const diff = setDifference(this.e.refs, sr.refs);
            for (const e of diff) {
                this.e.removeRef(e);
            }
        } else if (sr.size() > this.prevACopy.size) {
            // Some elements are new.
            // Match sidebar: select everything new only if all were selected before
            const allWereSelected = this.e.size() == 0;
            if (!allWereSelected) {
                // add new ones to exclude list
                const diff = setDifference(sr.refs, this.prevACopy);
                for (const e of diff) {
                    this.e.addRef(e);
                }
            }
        }
        this.prevACopy = new Set(sr.refs);
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
                // stay in accept some (could check here to move to opaque)
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
                const al = (this.allowSet = new Set([e])); //setDifference(this.a.refs, eSR));
                this.mode = 3;
                this.pred[0] = PredicateType.CheckEveryItem;
                this.pred[1] = (c) => al.has(c);
                return;
            }
            case 2:
                // stay in reject some unless can transition to transparent
                if (eSR.size == 0) {
                    // switch to transparent
                    this.mode = 0;
                    this.allowSet = undefined;
                    this.pred[0] = PredicateType.Transparent;
                    this.pred[1] = undefined;
                }
                return;
            case 3:
                // stay in accept some if exclude set still large, otherwise discard allow set and switch back to exclude some
                if (eSR.size <= this.a.size() / 2) {
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

    // inverts the "excludes set"
    public invertExcludesSet() {
        this.e = ReferenceSet.fromSet(setDifference(this.a.refs, this.e.refs));
        this.recalculateAll();
    }

    public getPredicate(): [PredicateType, undefined | ((a) => boolean)] | any[] {
        return this.pred;
    }
}
