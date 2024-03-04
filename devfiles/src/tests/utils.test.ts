import { Data } from '../classes/data/Data';
import fs from 'fs';
import { Buffer } from 'buffer';
import { describe, it, expect } from 'vitest';

const testDataFilename = 'devfiles/src/tests/testdata.csv';
const testDataFilename2 = 'devfiles/src/tests/testdata2.csv';
const testDataFilename3 = 'devfiles/src/tests/testdata3.csv';
const testDataFilename4 = 'devfiles/src/tests/testdata4.csv';
const testDataFilename5 = 'devfiles/src/tests/testdata5.csv';

async function loadData(filename = testDataFilename) {
    const data = new Data();
    const byteArray = await readBytes(filename);

    expect(data.readDatabase()).toStrictEqual([]);
    data.addCSV(filename, byteArray, false);
    return data;
}

async function readBytes(filename) {
    const fd = await fs.promises.open(filename, 'r');
    const bufferSize = 1024;
    const buffer = Buffer.alloc(bufferSize);
    let byteArray = new Uint8Array(0);

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const { bytesRead } = await fd.read(buffer, 0, bufferSize, null);
        const chunk = buffer.slice(0, bytesRead);
        byteArray = new Uint8Array([...byteArray, ...chunk]);
        if (bytesRead === 0) break;
    }
    return byteArray;
}

describe('readBytes', () => {
    it('should read the bytes', async () => {
        const byteArray = await readBytes(testDataFilename);
        expect(byteArray).not.toBeNull();
    });
});

describe('loadData', () => {
    it('should load the data', async () => {
        const data = await loadData(testDataFilename);
        expect(data).not.toBeNull();
    });
});

export {
    loadData,
    readBytes,
    testDataFilename,
    testDataFilename2,
    testDataFilename3,
    testDataFilename4,
    testDataFilename5
};
