import SetManager from './SetManager';

// Ensures at most one file per filename
// Allows renaming files and reusing identifiers for fast scans
export default class FileIdentifierManager extends SetManager {
    // To disallow two files of the same name
    // If no conflicts, return itself.
    // If no extension, add .csv
    public normaliseIdentifier(ident: string) {
        if (!ident.toLowerCase().endsWith('.csv')) {
            ident += '.csv';
        }
        while (this.hasValue(ident)) {
            // Add an underscore before .CSV
            const indexOfDot = ident.lastIndexOf('.');
            ident = ident.slice(0, indexOfDot) + '_' + ident.slice(indexOfDot);
        }
        return ident;
    }
}
