// To do: a.fileIdentifier == b.fileIdentifier
// ie fast filtering
export default class SetElement {
    private value;
    public constructor(input: string) {
        this.value = input;
    }
    // Allows us to change it without going over each row
    public change(input: string) {
        this.value = input;
    }
    public getValue() {
        return this.value;
    }
}
