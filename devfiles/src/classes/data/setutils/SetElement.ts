// To do: a.fileIdentifier == b.fileIdentifier
// ie fast filtering
// also, fast change
export default class SetElement {
    public value;
    public constructor(input: string) {
        this.value = input;
    }

    // No methods, please change and read directly.
    // If used from ReferenceSet, please change through that

    // Allows us to change it without going over each row
    /*public change(input: string) {
        this.value = input;
    }
    public getValue() {
        return this.value;
    }*/
}
