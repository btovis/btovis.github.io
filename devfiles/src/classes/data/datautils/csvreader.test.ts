import { parseCSV } from './csvreader';

let assert;
if (!assert) {
    assert = (x) => {
        if (!x) {
            console.error('Error found!');
        }
    };
}

/* eslint no-undef: off */
test('valid CSV files', () => {
    /*console.log*/ expect(parseCSV('a,b,c\ne,f,g', undefined));
    /*console.log*/ expect(parseCSV('a,b,c\ne,f,g\n', undefined));
    /*console.log*/ expect(parseCSV('a,b,c\n\ne,f,g\n\n', undefined));
    /*console.log*/ expect(parseCSV('a,b,c\r\ne,f,g\r\n', undefined));
    /*console.log*/ expect(parseCSV('a,b,c\r\ne,,g\r\n', undefined));
    /*console.log*/ expect(parseCSV('a,b,c\r\n,,g\r\n', undefined));
    /*console.log*/ expect(parseCSV('a,b,c\r\n,,\r\n', undefined));
    /*console.log*/ expect(parseCSV('\n\n\r\n"a,b",b,c\r\nx,"y,t",z\r\n', undefined));
    /*console.log*/ expect(parseCSV('"a,b",b,c\r\nx,"y\n,,t",z\r\n', undefined));
    /*console.log*/ expect(parseCSV('a\ne', undefined));
    /*console.log*/ expect(parseCSV(`a"a"\ne`, undefined));
    /*console.log*/ expect(parseCSV(`"a","b"\ne,f`, undefined));
    /*console.log*/ expect(parseCSV(`"a",a"b"\ne,f`, undefined));
    /*console.log*/ expect(parseCSV(`,,,\na,b,c,d`, undefined));
    /*console.log*/ expect(parseCSV(`,"a\n"`, undefined));
    /*console.log*/ expect(parseCSV(`a,"a\n"\nx,"y\n"`, undefined));
    /*console.log*/ expect(parseCSV(`a,"a,\nb"`, undefined));
    /*console.log*/ expect(parseCSV(`a,"a\n,b"`, undefined));
    /*console.log*/ expect(parseCSV(`a,"a,b"`, undefined));
    /*console.log*/ expect(parseCSV(`a,b,c,d`, undefined));

    /*expect(linkElement).toBeInTheDocument();*/
});

/* eslint no-undef: off */
test('invalid CSV files', () => {
    expect(() => parseCSV('a,b\nc,d,e,e,f', undefined)).toThrow();
    expect(() => parseCSV('a,b\nc', undefined)).toThrow();
    expect(() => parseCSV('a,b\nc,d,e', undefined)).toThrow();
    expect(() => parseCSV('a,b\nc,d,e,', undefined)).toThrow();
    expect(() => parseCSV('a,b\nc,d,e,\n', undefined)).toThrow();
    expect(() => parseCSV('a,b\nc,d,\ne,\n', undefined)).toThrow();
    expect(() => parseCSV('a,b\nc,d,\ne,"a"a\n', undefined)).toThrow();
});
