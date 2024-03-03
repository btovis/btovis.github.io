import { Filter, PredicateType } from './Filter.ts';
import ReferenceSet from '../data/setutils/ReferenceSet.ts';

import { setDifference } from '../data/setutils/setDifference.ts';

// Note: SetFilter receives SetManager not JS Set from UI!
// PageManager should store SetElements along with texts!
export default class SetFilter implements Filter {
    private excluded: ReferenceSet;
    private entire: ReferenceSet;

    private pred: [PredicateType, undefined | ((a) => boolean)] | unknown[] = new Array(2);
    private mode: number; // 0: transparent 1: opaque, 2: "reject some" mode 3: "accept some" mode
    private allowSet: Set<unknown>; /* Used in "accept some" mode, ie, mode = 3 */
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

    // sets the "excludes set"
    // as opposed to filterAway and accept, takes entire list
    public setExcludesSet(e: ReferenceSet) {
        this.excluded = e;
        this.recalculateAll();
    }

    public getPredicate(): [PredicateType, undefined | ((a) => boolean)] | unknown[] {
        return this.pred;
    }
}
