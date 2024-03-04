import { Filter, PredicateType } from './Filter.ts';

// accepts if l <= a <= h
// Remember to use -Infinity or Infinity if using max range
export default class RangeFilter implements Filter {
    private l: number;
    private h: number;
    private pred: [PredicateType, undefined | ((a) => boolean)] | unknown[] = new Array(2);
    // Remember to use -Infinity or Infinity if using max range
    public constructor(low, high) {
        this.l = low;
        this.h = high;
        this.updatePred(low, high);
    }

    private updatePred(l, h) {
        if (l == -Infinity && h == +Infinity) {
            this.pred[0] = PredicateType.Transparent;
            this.pred[1] = undefined;
        } else if (l > h) {
            this.pred[0] = PredicateType.Opaque;
            this.pred[1] = undefined;
        } else if (l == -Infinity) {
            this.pred[0] = PredicateType.CheckEveryItem;
            this.pred[1] = (a) => a <= h;
        } else if (h == +Infinity) {
            this.pred[0] = PredicateType.CheckEveryItem;
            this.pred[1] = (a) => a >= l;
        } else {
            this.pred[0] = PredicateType.CheckEveryItem;
            this.pred[1] = (a) => a >= l && a <= h;
        }
    }

    public updateSetReference(sr) {
        sr;
    }

    public getPredicate(): [PredicateType, undefined | ((a) => boolean)] | unknown[] {
        return this.pred;
    }
}
