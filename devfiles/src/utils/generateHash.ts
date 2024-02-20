export default function generateHash(a: number, b: number) {
    //(prime*a)+b is a hash of (a,b)
    return 23629 * a + b;
}
