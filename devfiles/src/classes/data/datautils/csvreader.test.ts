import { parseCSV } from './csvreader';
import { test, expect } from 'vitest';

test('valid CSV files', () => {
    expect(parseCSV('a,b,c\ne,f,g'));
    expect(parseCSV('a,b,c\ne,f,g\n'));
    expect(parseCSV('a,b,c\n\ne,f,g\n\n'));
    expect(parseCSV('a,b,c\r\ne,f,g\r\n'));
    expect(parseCSV('a,b,c\r\ne,,g\r\n'));
    expect(parseCSV('a,b,c\r\n,,g\r\n'));
    expect(parseCSV('a,b,c\r\n,,\r\n'));
    expect(parseCSV('\n\n\r\n"a,b",b,c\r\nx,"y,t",z\r\n'));
    expect(parseCSV('"a,b",b,c\r\nx,"y\n,,t",z\r\n'));
    expect(parseCSV('a\ne'));
    expect(parseCSV(`a"a"\ne`));
    expect(parseCSV(`"a","b"\ne,f`));
    expect(parseCSV(`"a",a"b"\ne,f`));
    expect(parseCSV(`,,,\na,b,c,d`));
    expect(parseCSV(`,"a\n"`));
    expect(parseCSV(`a,"a\n"\nx,"y\n"`));
    expect(parseCSV(`a,"a,\nb"`));
    expect(parseCSV(`a,"a\n,b"`));
    expect(parseCSV(`a,"a,b"`));
    expect(parseCSV(`a,b,c,d`));
});

test('invalid CSV files', () => {
    expect(() => parseCSV('a,b\nc,d,e,e,f')).toThrow();
    expect(() => parseCSV('a,b\nc')).toThrow();
    expect(() => parseCSV('a,b\nc,d,e')).toThrow();
    expect(() => parseCSV('a,b\nc,d,e,')).toThrow();
    expect(() => parseCSV('a,b\nc,d,e,\n')).toThrow();
    expect(() => parseCSV('a,b\nc,d,\ne,\n')).toThrow();
    expect(() => parseCSV('a,b\nc,d,\ne,"a"a\n')).toThrow();
});
