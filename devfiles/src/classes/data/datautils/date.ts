// High frequency was seen to use 30/01/2024
// Bird data was seen to use 20240130

// Note: this code does't allow YY instead of YYYY
// and D instead of DD or M instead of MM

enum DateType {
    DDMMYYYY,
    MMDDYYYY,
    YYYYMMDD
}

enum DateSeparator {
    NONE = '',
    SLASH = '/',
    DOT = '.',
    HYPHEN = '-'
}

// in our database, for "actual date", use 2024-01-30 etc.
// assumes: these are int, positive, and in correct ranges
function stringDate(y: string, m: string, d: string) {
    return y + '-' + m + '-' + d;
}

// Only call if there's date column in data
// processes dataArray, returns data
export function processDates(
    dataArr,
    startI,
    columnI
): [DateType | undefined, DateSeparator | undefined, (a) => string] {
    // pick a random cell
    if (startI == dataArr.length) return [undefined, undefined, (a) => a];
    const random = startI + Math.floor((dataArr.length - startI) / 2);
    const example: string = dataArr[random][columnI];
    let separators = '',
        sep: DateSeparator,
        type: DateType;
    if (example.includes('-')) {
        separators += '-';
    }
    if (example.includes('/')) {
        separators += '/';
    }
    if (example.includes('.')) {
        separators += '.';
    }
    if (separators.length > 1) {
        return [undefined, undefined, (a) => a];
    }
    if (separators.length) {
        sep = separators as DateSeparator;
    } else {
        sep = DateSeparator.NONE;
    }

    // DDMM or MMDD?
    let scanNeeded = false;
    let processBeforeScan; // e.g. 0124 or 01.24 -> ["01","24"]

    if (sep == DateSeparator.NONE) {
        // search for years.
        const currentYear = new Date().getFullYear();
        let BTOPipelineAvailable = 2021;
        const years = new Array(currentYear - BTOPipelineAvailable + 1);
        for (; BTOPipelineAvailable <= currentYear; BTOPipelineAvailable++) {
            years[BTOPipelineAvailable - 2021] = [
                BTOPipelineAvailable,
                example.includes('' + BTOPipelineAvailable)
            ];
        }
        const potentialYears: [number, boolean][] = years.filter((a) => a[1]);
        if (potentialYears.length > 2 || potentialYears.length == 0)
            return [undefined, undefined, (a) => a];
        // we could look at all other dates in data
        // DDMMYYY or MMDDYYYY
        // the second case allows potentialYears.length == 2
        if (potentialYears.length == 2) {
            // assert MMDDYYYY
            type = DateType.MMDDYYYY;
        } else {
            const potentialYear = '' + potentialYears[0][0];
            // assert year at beginning or at end
            if (example.startsWith(potentialYear)) {
                type = DateType.YYYYMMDD;
            } else if (example.endsWith(potentialYear)) {
                //SCAN and decide if DDMM or MMDD
                scanNeeded = true;
                processBeforeScan = (s) => [s.slice(0, 2), s.slice(2, 4)];
            } else {
                // Here reject DD/MM/YY as this isn't used
                return [undefined, undefined, (a) => a];
            }
        }
    } else {
        // decide which order
        const date = example.split(sep);
        if (date.length != 3) {
            return [undefined, undefined, (a) => a];
        }
        if (
            date[0].length == 4 &&
            (date[1].length == 1 || date[1].length == 2) &&
            (date[2].length == 1 || date[2].length == 2)
        ) {
            type = DateType.YYYYMMDD;
        } else if (
            date[2].length == 4 &&
            (date[1].length == 1 || date[1].length == 2) &&
            (date[0].length == 1 || date[0].length == 2)
        ) {
            //SCAN and decide if DDMM or MMDD
            scanNeeded = true;
            processBeforeScan = (s) => [s.slice(0, 2), s.slice(3, 5)];
        } else {
            return [undefined, undefined, (a) => a];
        }
    }

    if (scanNeeded) {
        let i = startI;
        for (; i < dataArr.length; i++) {
            const y = processBeforeScan(dataArr[i][columnI]);
            if (y[0] > '12' || y[1] > '12') {
                if (y[0] > '12') {
                    type = DateType.DDMMYYYY;
                    break;
                } else {
                    type = DateType.MMDDYYYY;
                    break;
                }
            }
        }
        if (i == dataArr.length) {
            // assert DD MM YYYY for highfreq, YYYYMMDD for birds
            switch (sep) {
                case DateSeparator.NONE:
                    type = DateType.YYYYMMDD;
                    break;
                case DateSeparator.SLASH:
                    type = DateType.DDMMYYYY;
                    break;
                default:
                    return [undefined, undefined, (a) => a];
            }
        }
    }

    let processor: (s) => string;
    if (sep == DateSeparator.NONE) {
        switch (type) {
            case DateType.DDMMYYYY:
                processor = (s) => stringDate(s.slice(4), s.slice(2, 4), s.slice(0, 2));
                break;
            case DateType.MMDDYYYY:
                processor = (s) => stringDate(s.slice(4), s.slice(0, 2), s.slice(2, 4));
                break;
            case DateType.YYYYMMDD:
                processor = (s) => stringDate(s.slice(0, 4), s.slice(4, 6), s.slice(6));
                break;
        }
    } else {
        switch (type) {
            case DateType.DDMMYYYY:
                processor = (s) => stringDate(s.slice(6), s.slice(3, 5), s.slice(0, 2));
                break;
            case DateType.MMDDYYYY:
                processor = (s) => stringDate(s.slice(6), s.slice(0, 2), s.slice(3, 5));
                break;
            case DateType.YYYYMMDD:
                processor = (s) => stringDate(s.slice(0, 4), s.slice(5, 7), s.slice(8));
                break;
        }
    }

    return [type, sep, processor];
}

enum TimeSeparator {
    NONE = '', // bird pipeline
    COLON = ':' // high frequency pipeline
}

enum TimePrecision {
    TWO = 2, // HHMM
    THREE = 3 // HHMMSS both pipelines
}

// Only call if there's TIME column in data
// processes dataArray, returns data
export function processTimes(
    dataArr,
    startI,
    columnI
): [TimeSeparator | undefined, TimePrecision | undefined, (a) => string] {
    // pick a random cell
    if (startI == dataArr.length) return [undefined, undefined, (a) => a];
    const random = startI + Math.floor((dataArr.length - startI) / 2);
    const example: string = dataArr[random][columnI];
    let sep: TimeSeparator, prec: TimePrecision | number;
    if (example.includes(':')) {
        sep = TimeSeparator.COLON;
        prec = example.split(':').length;
        switch (prec) {
            case 2:
                break;
            case 3:
                break;
            default: // 4 or more:
                // nothing after seconds is supported currently
                return [undefined, undefined, (a) => a];
        }
        return [sep, prec, (a) => a];
    } else {
        sep = TimeSeparator.NONE;
        let processor: (s) => string;
        switch (example.length) {
            case 4:
                processor = (s) => s.slice(0, 2) + ':' + s.slice(2);
                break;
            case 6:
                processor = (s) => s.slice(0, 2) + ':' + s.slice(2, 4) + ':' + s.slice(4);
                break;
            default:
                return [undefined, undefined, (a) => a];
        }
        return [sep, prec, processor];
    }
}
