import { Filter, PredicateType } from './Filter.ts';

// if l == h, accept all
// if l is Infinity and h is -Infinity, rejects all
// if l <= h, (such as l: "03:00", h = "18:00") then accepts if l <= a and a < h
// if l >= h, (such as l: "22:00", h = "03:00") then accepts if l <= a or a < h
// Remember to use -Infinity or Infinity if using max range
export default class SwappableRangeFilter implements Filter {
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
        if (l == h || (l == -Infinity && h == +Infinity)) {
            this.pred[0] = PredicateType.Transparent;
            this.pred[1] = undefined;
        } else if (l == Infinity || h == -Infinity) {
            this.pred[0] = PredicateType.Opaque;
            this.pred[1] = undefined;
        } else if (h > l) {
            this.pred[0] = PredicateType.CheckEveryItem;
            if (h == Infinity) {
                this.pred[1] = (a) => a >= l;
            } else if (l == -Infinity) {
                this.pred[1] = (a) => a < h;
            } else {
                this.pred[1] = (a) => a >= l && a < h;
            }
        } else {
            this.pred[0] = PredicateType.CheckEveryItem;
            if (l == Infinity) {
                this.pred[1] = (a) => a < h;
            } else if (h == -Infinity) {
                this.pred[1] = (a) => a >= l;
            } else this.pred[1] = (a) => a >= l || a < h;
        }
    }

    public updateSetReference(sr) {
        sr;
    }

    public getPredicate(): [PredicateType, undefined | ((a) => boolean)] | unknown[] {
        return this.pred;
    }
}
