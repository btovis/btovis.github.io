import { Filter, PredicateType } from './Filter.ts';
import ReferenceSet from '../data/setutils/ReferenceSet.ts';
import SetElement from '../data/setutils/SetElement.ts';

import { setDifference } from '../data/setutils/setDifference.ts';

// Note: SetFilter receives SetManager not JS Set from UI!
// PageManager should store SetElements along with texts!
export default class SetFilter implements Filter {
    private excluded: ReferenceSet;
    private entire: ReferenceSet;

    private pred: [PredicateType, undefined | ((a) => boolean)] | any[] = new Array(2);
    private mode: number; // 0: transparent 1: opaque, 2: "reject some" mode 3: "accept some" mode
    private allowSet: Set<any>; /* Used in "accept some" mode, ie, mode = 3 */
    // filter in rejection mode. e.g. if, out of 300 species, reject 3... up to 150
    // more efficient to consider what to reject than to what to accept
    // whereas in "accept some" mode, check if equal to A, or B, or C, ... otherwise fails

    // currently, a little inefficient but, even when allowSet is being used, keep e up to date

    public constructor(filterAwayThisSet: ReferenceSet, allVals: ReferenceSet) {
        this.excluded = filterAwayThisSet;
        this.entire = allVals;
        this.recalculateAll();
    }

    public updateSetReference(sr) {
        this.entire = sr;
        this.recalculateAll();
    }

    private recalculateAll() {
        const excludedSet = this.excluded.refs,
            excludedLength = excludedSet.size,
            entireLength = this.entire.size();
        if (excludedLength == 0) {
            this.mode = 0;
            this.pred[0] = PredicateType.Transparent;
            this.pred[1] = undefined;
        } else if (excludedLength == entireLength) {
            this.mode = 1;
            this.pred[0] = PredicateType.Opaque;
            this.pred[1] = undefined;
        } else if (excludedLength <= entireLength / 2) {
            this.mode = 2;
            this.pred[0] = PredicateType.CheckEveryItem;
            this.pred[1] = (c) => !excludedSet.has(c);
        } else {
            const allow = (this.allowSet = setDifference(this.entire.refs, excludedSet));
            this.mode = 3;
            this.pred[0] = PredicateType.CheckEveryItem;
            this.pred[1] = (c) => allow.has(c);
        }
    }

    public filterAway(e: SetElement) {
        const excludedSet = this.excluded;
        const excludedReadOnlySet = this.excluded.refs;

        excludedSet.addRef(e);

        // 0: transparent 1: opaque, 2: "reject some" mode 3: "accept some" mode
        switch (this.mode) {
            case 0:
                // Switch from "transparent" to "reject some" /*or "opaque"*/
                this.mode = 2;
                this.pred[0] = PredicateType.CheckEveryItem;
                this.pred[1] = (c) => !excludedReadOnlySet.has(c);
                return;
            case 1:
                return;
            case 2:
                // stay in reject some if exclude set still small, otherwise calculate allow set, switch to accept some set
                if (excludedSet.size() > this.entire.size() / 2) {
                    // switch to accept some
                    this.mode = 3;
                    const entireLength = (this.allowSet = setDifference(
                        this.entire.refs,
                        excludedReadOnlySet
                    ));
                    this.pred[1] = (c) => entireLength.has(c);
                }
                return;
            case 3:
                // stay in accept some (could check here to move to opaque)
                this.allowSet.delete(e);
                return;
        }
    }

    public accept(e: SetElement) {
        const excludedSet = this.excluded;
        // readonly:
        const excludedReadOnlySet = this.excluded.refs;

        excludedSet.removeRef(e);

        // 0: transparent 1: opaque, 2: "reject some" mode 3: "accept some" mode
        switch (this.mode) {
            case 0:
                return;
            case 1: {
                // Switch from opaque to "accept some" /*or transparent*/
                const entireLength = (this.allowSet = new Set([e])); //setDifference(this.a.refs, eSR));
                this.mode = 3;
                this.pred[0] = PredicateType.CheckEveryItem;
                this.pred[1] = (c) => entireLength.has(c);
                return;
            }
            case 2:
                // stay in reject some unless can transition to transparent
                if (excludedReadOnlySet.size == 0) {
                    // switch to transparent
                    this.mode = 0;
                    this.allowSet = undefined;
                    this.pred[0] = PredicateType.Transparent;
                    this.pred[1] = undefined;
                }
                return;
            case 3:
                // stay in accept some if exclude set still large, otherwise discard allow set and switch back to exclude some
                if (excludedReadOnlySet.size <= this.entire.size() / 2) {
                    // switch to reject some
                    this.mode = 2;
                    this.allowSet = undefined;
                    this.pred[1] = (c) => !excludedReadOnlySet.has(c);
                } else {
                    this.allowSet.add(e);
                }
                return;
        }
    }

    // sets the "excludes set"
    // as opposed to filterAway and accept, takes entire list
    public setExcludesSet(e: ReferenceSet) {
        this.excluded = e;
        this.recalculateAll();
    }

    // inverts the "excludes set"
    public invertExcludesSet() {
        this.excluded = ReferenceSet.fromSet(setDifference(this.entire.refs, this.excluded.refs));
        this.recalculateAll();
    }

    public getPredicate(): [PredicateType, undefined | ((a) => boolean)] | any[] {
        return this.pred;
    }
}
