import { test, expect } from 'vitest';
import { Data } from './Data';
import fs from 'fs';
import { Buffer } from 'buffer';

const DataTest = test.extend({
    data: async ({ task }, use) => {
        const data = new Data();
        const filename = 'devfiles/src/tests/testdata.csv';

        const fd = await fs.promises.open(filename, 'r');
        const bufferSize = 1024;
        const buffer = Buffer.alloc(bufferSize);
        var byteArray = new Uint8Array(0);

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { bytesRead } = await fd.read(buffer, 0, bufferSize, null);
            const chunk = buffer.slice(0, bytesRead);
            byteArray = new Uint8Array([...byteArray, ...chunk]);
            if (bytesRead === 0) break;
        }

        expect(data.readDatabase()).toStrictEqual([]);
        data.addCSV(filename, byteArray);
        await use(data);
    }
});

DataTest('load CSV and test for data added', async ({ data }) => {
    expect(data.readDatabase()).not.toStrictEqual([]);
});
