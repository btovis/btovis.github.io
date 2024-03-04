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

/*try {
    fs.writeFileSync(args[1], outStr);
} catch (e) {
    console.error('Could not write to ' + args[1] + ': ' + e);
}*/

let str = `
This file contains legal notices of software being used by this application.
node-stack-trace: this uses the MIT license:
Copyright (c) 2011 Felix Geisendörfer (felix@debuggable.com)
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
`;

const columnNames =
    'Package,Repository,Publisher,Email,License,License Filename,License text'.split(',');

for (const r of outArr) {
    for (let i = 0; i < columnNames.length; i++) {
        str += columnNames[i] + ': ' + r[i] + '\n';
    }
    str += '\n\n';
}

try {
    fs.writeFileSync(args[1], str);
} catch (e) {
    console.error('Could not write to ' + args[1] + ': ' + e);
}
