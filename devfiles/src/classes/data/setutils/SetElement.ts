// To do: a.fileIdentifier == b.fileIdentifier
// ie fast filtering

// also, fast change
export default class SetElement {
    public value;
    //DO NOT CALL. This is used exclusively by referenceset.
    //There is no cross-file protected keyword that works, so I'm gonna deprecate
    //Consider moving this into ReferenceSet to allow the protected keyword to work
    /**
     * @deprecated The method should not be called outside ReferenceSet
     * @param input
     */
    public constructor(input: string) {
        this.value = input;
    }
}
