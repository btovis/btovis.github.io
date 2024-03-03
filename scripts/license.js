/* eslint-env node */
import * as fs from 'node:fs';
// Take in a json output, output a csv

const args = process.argv.slice(2);

if (args.length != 2) {
    console.log(args.length);
    console.error('Usage: ' + JSON.stringify(process.argv) + ' <in> <out>');
    throw '';
}

let data;
try {
    data = fs.readFileSync(args[0], 'utf8');
} catch (err) {
    console.error('could not read file ' + args[0] + ' ' + err);
}
try {
    data = JSON.parse(data);
} catch (err) {
    console.error(args[0] + ' could not be parsed as a json' + err);
}

const outArr = [];
for (let [k, v] of Object.entries(data)) {
    outArr.push([
        k,
        v.repository || '',
        v.publisher || '',
        v.email || '',
        v.licenses || '',
        (v.licenseFile || '').split('/').at(-1),
        fs.readFileSync(v.licenseFile, 'utf8') // could be moved away
    ]);
}

let outStr = 'Package,Repository,Publisher,Email,License,License Filename,License text';
for (const row of outArr) {
    outStr += '\n';
    let serializedRow = '';
    for (const cell of row) {
        serializedRow += ',';
        if (
            cell.includes('"') ||
            cell.includes('\n') ||
            cell.includes('\r') ||
            cell.includes(',')
        ) {
            serializedRow += '"';
            serializedRow += cell.replaceAll('"', '""');
            serializedRow += '"';
        } else {
            serializedRow += cell;
        }
    }
    outStr += serializedRow.slice(1);
}
outStr += '\n';

try {
    fs.writeFileSync(args[1], outStr);
} catch (e) {
    console.error('Could not write to ' + args[1] + ': ' + e);
}
