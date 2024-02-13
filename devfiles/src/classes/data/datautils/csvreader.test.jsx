import { parseCSV } from './csvreader';

if (!assert) {
    var assert = (x) => {
        if (!x) {
            console.error('Error found!');
        }
    };
}

/* eslint no-undef: off */
test('valid CSV files', () => {
    /*console.log*/ expect(parseCSV('a,b,c\ne,f,g'));
    /*console.log*/ expect(parseCSV('a,b,c\ne,f,g\n'));
    /*console.log*/ expect(parseCSV('a,b,c\n\ne,f,g\n\n'));
    /*console.log*/ expect(parseCSV('a,b,c\r\ne,f,g\r\n'));
    /*console.log*/ expect(parseCSV('a,b,c\r\ne,,g\r\n'));
    /*console.log*/ expect(parseCSV('a,b,c\r\n,,g\r\n'));
    /*console.log*/ expect(parseCSV('a,b,c\r\n,,\r\n'));
    /*console.log*/ expect(parseCSV('\n\n\r\n"a,b",b,c\r\nx,"y,t",z\r\n'));
    /*console.log*/ expect(parseCSV('"a,b",b,c\r\nx,"y\n,,t",z\r\n'));
    /*console.log*/ expect(parseCSV('a\ne'));
    /*console.log*/ expect(parseCSV(`a"a"\ne`));
    /*console.log*/ expect(parseCSV(`"a","b"\ne,f`));
    /*console.log*/ expect(parseCSV(`"a",a"b"\ne,f`));
    /*console.log*/ expect(parseCSV(`,,,\na,b,c,d`));
    /*console.log*/ expect(parseCSV(`,"a\n"`));
    /*console.log*/ expect(parseCSV(`a,"a\n"\nx,"y\n"`));
    /*console.log*/ expect(parseCSV(`a,"a,\nb"`));
    /*console.log*/ expect(parseCSV(`a,"a\n,b"`));
    /*console.log*/ expect(parseCSV(`a,"a,b"`));
    /*console.log*/ expect(parseCSV(`a,b,c,d`));
    /*expect(linkElement).toBeInTheDocument();*/
});

/* eslint no-undef: off */
test('invalid CSV files', () => {
    expect(() => parseCSV('a,b\nc,d,e,e,f')).toThrow();
    expect(() => parseCSV('a,b\nc')).toThrow();
    expect(() => parseCSV('a,b\nc,d,e')).toThrow();
    expect(() => parseCSV('a,b\nc,d,e,')).toThrow();
    expect(() => parseCSV('a,b\nc,d,e,\n')).toThrow();
    expect(() => parseCSV('a,b\nc,d,\ne,\n')).toThrow();
    expect(() => parseCSV('a,b\nc,d,\ne,"a"a\n')).toThrow();
});
