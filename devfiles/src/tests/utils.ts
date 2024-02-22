import { Data } from '../classes/data/Data';
import fs from 'fs';
import { Buffer } from 'buffer';

const testDataFilename = 'devfiles/src/tests/testdata.csv';
const testDataFilename2 = 'devfiles/src/tests/testdata2.csv';

async function loadData(filename: string | undefined) {
    if (filename === undefined) {
        filename = testDataFilename;
    }
    const data = new Data();

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

    expect(data.readDatabase()).toStrictEqual([]);
    data.addCSV(filename, byteArray);
    return data;
}

export { loadData, testDataFilename, testDataFilename2 };
