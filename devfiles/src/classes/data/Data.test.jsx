import { test, expect } from 'vitest';
import { Data } from './Data';
import fs from 'fs';
import { Buffer } from 'buffer';

test('load CSV and data added', async () => {
    const data = new Data();
    const filename = 'devfiles/src/tests/testdata.csv';

    const fd = await fs.promises.open(filename, 'r');
    const buffer = Buffer.alloc(1);

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const { bytesRead } = await fd.read(buffer, 0, 1, null);
        if (bytesRead === 0) break;
    }

    expect(data.readDatabase()).toStrictEqual([]);
    data.addCSV(filename, buffer);
    expect(data.readDatabase()).toStrictEqual([]);
    await fd.close();
});
