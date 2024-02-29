export default function generateHash(...inp: number[]) {
    //(prime*a)+b is a hash of (a,b)
    let agg = 0;
    inp.forEach((i) => (agg = 23629 * agg + i));
    return agg;
}
