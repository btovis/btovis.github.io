import ReferenceSet from './ReferenceSet';

// To disallow two files of the same name
// If no conflicts, return itself.
// If no extension, add .csv
export default function normaliseIdentifier(ident: string, fileSet: ReferenceSet) {
    if (!ident.toLowerCase().endsWith('.csv')) {
        ident += '.csv';
    }
    while (fileSet.hasRaw(ident)) {
        // Add an underscore before .CSV
        const indexOfDot = ident.lastIndexOf('.');
        ident = ident.slice(0, indexOfDot) + '_' + ident.slice(indexOfDot);
    }
    return ident;
}
