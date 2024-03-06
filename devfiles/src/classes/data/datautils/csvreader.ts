/*
CSV Reader WITH A DIFFERENCE:
- the CSV can have \r\n or \n line endings (can be mixed)
- will validate the CSV and raise an exception if invalid
- security analysis: i to always increase, O(n^2) scanning (through findIndex) is avoided

The difference is that this CSV reader adds to the beginning of each row a value passed in as a parameter.
(Which is the identifier for the file, hence the columnNames array returned has the first element _FILE)
*/

import SetElement from '../setutils/SetElement';

function replaceAllInStringOld(str: string, a: string, b: string) {
    return str.split(a).join(b);
}

function replaceAllInStringNew(str: string, a: string, b: string) {
    // @ts-expect-error: Use new feature if possible
    return str.replaceAll(a, b);
}

// @ts-expect-error: Use new feature if possible
const stringReplacer = ''.replaceAll ? replaceAllInStringNew : replaceAllInStringOld;

/* eslint no-var: off */
function parseCSV(
    input: string,
    firstElement: SetElement
): { columnNames: string[]; content: (string | SetElement)[][] } {
    const l = input.length;

    const columnNames = ['_FILE'];

    // An iteration starts from cell beginning and handles up to and including the comma and the newline
    // (but not both, because that would be an empty cell)

    // Why separate the following loop, reading the first row, from the main loop?
    // The case needing optimizations the most is unquoted cell decoding.
    // By knowing column count in advance, we can predict to look for "," or "\n"
    // hence divide the time required to read a row by maybe 2

    // This first loop works until breaking on encountering \n to mark the end of the header row,
    // setting i to the next character.

    // These variables are used for reading the header only, and help avoid a worst case of O(n^2)
    let nearestNewLine = input.indexOf('\n');
    let nearestComma = input.indexOf(',');

    consume_header: for (var i = 0; i < l; ) {
        switch (input[i]) {
            case '"':
                // Escaped cell
                var nextSep = input.indexOf('"', i + 1); // Scan for end of cell
                while (input[nextSep + 1] == '"' && nextSep != -1) {
                    // Escaped (doubled) quote
                    nextSep = input.indexOf('"', nextSep + 2);
                }
                if (nextSep == -1) {
                    // something like: ...,"ab""c which is unterminated
                    throw "CSV quoted cell in header doesn't have a matching single quote";
                }
                columnNames.push(stringReplacer(input.slice(i + 1, nextSep), '""', '"'));
                // here, nextSep+1 is comma or newline
                switch (input[nextSep + 1]) {
                    case ',':
                        i = nextSep + 2;
                        break;
                    case '\n':
                        i = nextSep + 2;
                        break consume_header;
                    case '\r':
                        // Assume that the next one is \n
                        i = nextSep + 3;
                        break consume_header;
                    case undefined:
                        // End of file - single row
                        i = nextSep + 2;
                        break consume_header;
                    default:
                        throw 'CSV quoted cell in header invalid due to being unquoted early';
                }
                break;
            case '\n':
            case '\r':
                // Treat empty lines and empty cells differently
                i++; // Prepare for the next iteration early
                if (columnNames.length > 1) {
                    // Empty cell at the end of line
                    columnNames.push('');
                    break consume_header;
                } /* else { // Any empty line in file, ignore } */
                break;
            default:
                // Unescaped cell, no predictive parsing for if comma or newline
                // Alternative: instead of keeping these variables, can use a for loop seeking either
                if (nearestComma < i && nearestComma != -1) {
                    nearestComma = input.indexOf(',', i);
                }
                if (nearestNewLine < i) {
                    nearestNewLine = input.indexOf('\n', i + 1);
                }
                // both found: take the closer one
                // only newline found: one-column CSV, need to end header
                // only comma found: header-only CSV
                // neither found: header-only CSV

                // Therefore, error if no newline
                // Then check if comma. If so, compare. Otherwise use newline.

                if (nearestNewLine < 0) {
                    // header-only CSV
                    nearestNewLine = l;
                }

                if (nearestComma < nearestNewLine && nearestComma != -1) {
                    columnNames.push(input.slice(i, nearestComma));
                    i = nearestComma + 1;
                } else {
                    var continueFrom = nearestNewLine + 1;
                    if (input[nearestNewLine - 1] == '\r') {
                        nearestNewLine--;
                    }
                    columnNames.push(input.slice(i, nearestNewLine));
                    i = continueFrom;
                    break consume_header;
                }
        }
    }

    // Set up comma or newline predictor: all rows have the same number of columns,
    // so expect comma except when reading the last column
    const naturalColumnCount = columnNames.length - 1; // -1 due to '_FILE' being the 0th element in the columns array
    //const expectNewlineWhenReadingCell = naturalColumnCount - 2;

    // Add a first element to each array
    const artificialColumnCount = naturalColumnCount + 1;
    const expectNewlineWhenReadingCell = naturalColumnCount - 1;

    const arr = [];
    var currentRow = new Array(artificialColumnCount);
    var lastFilledCellInRow = 0; // would be -1 without the first, artificial element
    currentRow[0] = firstElement;
    while (i < l) {
        switch (input[i]) {
            case '"':
                // Escaped cell
                var nextSep = input.indexOf('"', i + 1); // Scan for end of cell
                while (input[nextSep + 1] == '"' && nextSep != -1) {
                    // Escaped (doubled) quote
                    nextSep = input.indexOf('"', nextSep + 2);
                }
                if (nextSep == -1) {
                    // something like: ...,"ab""c which is unterminated
                    throw "CSV quoted cell doesn't have a matching single quote";
                }
                currentRow[++lastFilledCellInRow] = stringReplacer(
                    input.slice(i + 1, nextSep),
                    '""',
                    '"'
                );
                // here, nextSep+1 is comma or newline
                switch (input[nextSep + 1]) {
                    case ',':
                        i = nextSep + 2;
                        break;
                    case '\n':
                        i = nextSep + 2;
                        arr.push(currentRow);
                        if (lastFilledCellInRow != naturalColumnCount) {
                            throw 'CSV column count mismatch';
                        }
                        currentRow = new Array(artificialColumnCount);
                        currentRow[(lastFilledCellInRow = 0)] = firstElement;
                        break;
                    case '\r':
                        i = nextSep + 3;
                        arr.push(currentRow);
                        if (lastFilledCellInRow != naturalColumnCount) {
                            throw 'CSV column count mismatch';
                        }
                        currentRow = new Array(artificialColumnCount);
                        currentRow[(lastFilledCellInRow = 0)] = firstElement;
                        break;
                    case undefined:
                        // End of file
                        i = nextSep + 2;
                        arr.push(currentRow);
                        if (lastFilledCellInRow != naturalColumnCount) {
                            throw 'CSV column count mismatch';
                        }
                        // Not needed: currentRow = new Array(artificialColumnCount);
                        lastFilledCellInRow = 0;
                        break;
                    default:
                        throw 'CSV quoted cell invalid due to being unquoted early';
                }
                break;
            case '\n':
            case '\r':
                // Treat empty lines and empty cells differently
                if (lastFilledCellInRow != 0) {
                    // Empty cell at the end of line
                    currentRow[++lastFilledCellInRow] = '';
                    arr.push(currentRow);
                    if (lastFilledCellInRow != naturalColumnCount) {
                        throw 'CSV column count mismatch';
                    }
                    currentRow = new Array(artificialColumnCount);
                    currentRow[(lastFilledCellInRow = 0)] = firstElement;
                } /* else { // Any empty line in file, ignore } */
                i++;
                break;
            default:
                // Unescaped cell, predictive parsing for if comma or newline
                if (lastFilledCellInRow == expectNewlineWhenReadingCell) {
                    // Expect newline
                    let newLine = input.indexOf('\n', i + 1);
                    if (newLine == -1) {
                        // This branch can be removed if the file ends in a newline
                        newLine = l;
                    }
                    var continueFrom = newLine + 1;
                    if (input[newLine - 1] == '\r') {
                        newLine--;
                    }
                    if (
                        (currentRow[++lastFilledCellInRow] = input.slice(i, newLine)).includes(
                            ','
                        ) ||
                        lastFilledCellInRow != naturalColumnCount
                    ) {
                        throw 'CSV column count mismatch';
                    }
                    arr.push(currentRow);
                    currentRow = new Array(artificialColumnCount);
                    currentRow[(lastFilledCellInRow = 0)] = firstElement;
                    i = continueFrom;
                } else {
                    // Expect comma
                    const comma = input.indexOf(',', i);
                    if (comma == -1) {
                        throw 'CSV column count mismatch';
                    }
                    currentRow[++lastFilledCellInRow] = input.slice(i, comma);
                    i = comma + 1;
                }
        }
    }

    // Flush the last line
    if (lastFilledCellInRow != 0) {
        if (lastFilledCellInRow != naturalColumnCount) {
            throw 'CSV column count mismatch';
        }
        arr.push(currentRow);
    }

    return { columnNames, content: arr };
}

const utf8decoder = new TextDecoder();

function parseCSVFromByteArray(input: Uint8Array, firstElement: SetElement) {
    return parseCSV(utf8decoder.decode(input), firstElement);
}

export { parseCSV, parseCSVFromByteArray, stringReplacer };
