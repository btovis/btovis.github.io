// To do: a.fileIdentifier == b.fileIdentifier
// ie fast filtering

import ReferenceSet from './ReferenceSet';

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
