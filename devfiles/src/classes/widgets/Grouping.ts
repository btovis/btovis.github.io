import SetElement from '../data/setutils/SetElement';
import { Attribute, Data } from '../data/Data';
import Row from '../data/Row';
import ReferenceSet from '../data/setutils/ReferenceSet';
import { Filter } from '../filters/Filter';
import DataFilterer from '../data/DataFilterer';

abstract class Grouping {
    filter: DataFilterer;
    referenceSet: ReferenceSet;
    xValues: Set<SetElement>;
    xValuesArray: SetElement[];
    speciesColumnIdx: number;
    constructor(filter: DataFilterer) {
        this.filter = filter;
        this.referenceSet = new ReferenceSet();
        this.speciesColumnIdx = filter.getColumnIndex(Attribute.speciesLatinName);
        this.xValues = new Set();
        this.xValuesArray = [];
    }
    // Select the value to be used for the x-axis.
    public abstract selectX(row: Row): SetElement;
    public selectByColumnIndex(row: Row, columnIdx: number): SetElement {
        if (row[columnIdx] instanceof SetElement) {
            return row[columnIdx];
        }
        // Create a new set element and add the value to the reference set.
        return this.referenceSet.addRawOrGet(row[columnIdx]);
    }
    // Select the value to be used for the y-axis.
    public selectY(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.speciesColumnIdx);
    }
    // Select pairs of x-y values that will be aggregated and plotted.
    public generatePairs(): [SetElement, SetElement][] {
        const [data, length] = this.filter.getData();
        const out = new Array(length);
        for (let i = 0; i < length; i++) {
            const row = data[i];
            const x = this.selectX(row);
            this.xValues.add(x);
            out[i] = [x, this.selectY(row)];
        }
        this.xValuesArray = Array.from(this.xValues);
        return out;
    }
    // Aggregate the pairs of x-y values.
    public aggregatePairs() {
        const pairs = this.generatePairs();
        // use y as the first key and x as the second
        const aggregated = new Map<SetElement, Map<SetElement, number>>();
        for (const [x, y] of pairs) {
            const map = aggregated.get(y);
            if (map === undefined) {
                aggregated.set(y, new Map<SetElement, number>([[x, 1]]));
            } else {
                const mapVal = map.get(x);
                if (mapVal !== undefined) {
                    map.set(x, mapVal + 1);
                } else {
                    map.set(x, 1);
                }
            }
        }
        return aggregated;
    }
    // Convert x values to integers to display on chart.
    // Must be called after all pairs have been generated.
    public xIndexMap() {
        // If the array is very long it's faster to map to string then sort then map back
        const sortedXValues = this.xValuesArray.sort((a, b) =>
            a.value < b.value ? -1 : a.value == b.value ? 0 : 1
        );
        const xValueMap = new Map<SetElement, number>();
        for (let i = 0; i < sortedXValues.length; i++) {
            xValueMap.set(sortedXValues[i], i);
        }
        return xValueMap;
    }
    // Generate a trace that includes the core data but excludes the additional config.
    public getPartialTraces() {
        const plottingData = this.aggregatePairs();
        const xIndexMap = this.xIndexMap();
        return Array.from(plottingData.entries()).map(([group, xValueMap]) => {
            const x = new Array(xIndexMap.size);
            for (let i = 0; i < x.length; i++) x[i] = i;
            const y = new Array(xIndexMap.size).fill(0);
            for (const [xValue, yValue] of xValueMap.entries()) {
                y[xIndexMap.get(xValue)] = yValue;
            }
            return {
                x: x,
                y: y,
                name: group.value
            };
        });
    }
    public getChart(
        additionalTracesConfig: { [key: string]: any },
        additionalLayoutConfig: { [key: string]: any }
    ): { traces: any[]; layout: any } {
        const partialTraces = this.getPartialTraces();
        const xIndexMap = this.xIndexMap();
        const labelAlias = Object.fromEntries(
            Array.from(xIndexMap.entries()).map(([x, i]) => [i, x.value])
        );
        return {
            traces: partialTraces.map((trace) => {
                return {
                    ...trace,
                    ...additionalTracesConfig
                };
            }),
            layout: {
                xaxis: {
                    title: 'xaxistitle',
                    labelalias: labelAlias,
                    nticks: xIndexMap.size,
                    tickmode: 'auto'
                },
                yaxis: {
                    title: 'yaxistitle'
                },
                ...additionalLayoutConfig
            }
        };
    }
}

class BatchNameGrouping extends Grouping {
    columnIdx: number;
    constructor(filter: DataFilterer) {
        super(filter);
        this.columnIdx = filter.getColumnIndex(Attribute.batchName);
    }
    public selectX(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.columnIdx);
    }
}

class ProjectNameGrouping extends Grouping {
    columnIdx: number;
    constructor(filter: DataFilterer) {
        super(filter);
        this.columnIdx = filter.getColumnIndex(Attribute.projectName);
    }
    public selectX(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.columnIdx);
    }
}

class FilenameGrouping extends Grouping {
    columnIdx: number;
    constructor(filter: DataFilterer) {
        super(filter);
        this.columnIdx = filter.getColumnIndex(Attribute.originalFileName);
    }
    public selectX(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.columnIdx);
    }
}

abstract class TimeGrouping extends Grouping {
    timeColumnIdx: number;
    dateColumnIdx: number;
    constructor(filter: DataFilterer) {
        super(filter);
        this.timeColumnIdx = filter.getColumnIndex(Attribute.time);
        this.dateColumnIdx = filter.getColumnIndex(Attribute.actualDate);
    }
    public selectX(row: Row): SetElement {
        return this.referenceSet.addRawOrGet(
            this.timeToValue(new Date(row[this.dateColumnIdx] + ' ' + row[this.timeColumnIdx]))
        );
    }
    public abstract timeToValue(datetime: Date): string;
}

class HourGrouping extends TimeGrouping {
    public timeToValue(datetime: Date): string {
        return this.formatHour(datetime.getHours());
    }
    private formatHour(hour: number): string {
        return `${hour.toString().padStart(2, '0')}:00`;
    }

    public xIndexMap() {
        const hours = this.xValuesArray.map((x) => parseInt(x.value.split(':')[0]));
        const minHour = Math.min(...hours);
        const maxHour = Math.max(...hours);
        const valueMap = new Map<SetElement, number>();
        for (let i = minHour; i <= maxHour; i++) {
            valueMap.set(this.referenceSet.addRawOrGet(this.formatHour(i)), i - minHour);
        }
        return valueMap;
    }
}

class DayGrouping extends TimeGrouping {
    public timeToValue(datetime: Date): string {
        return this.formatDate(datetime.getDate(), datetime.getMonth() + 1, datetime.getFullYear());
    }
    private formatDate(day: number, month: number, year: number): string {
        return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
    }

    public xIndexMap() {
        const dates = this.xValuesArray.map((x) => {
            const [day, month, year] = x.value.split('-').map((s) => parseInt(s));
            return new Date(year, month - 1, day);
        });
        const timestamps = dates.map((date) => date.getTime());
        const minTimestamp = Math.min(...timestamps);
        const maxTimestamp = Math.max(...timestamps);
        const valueMap = new Map<SetElement, number>();
        for (let i = minTimestamp; i <= maxTimestamp; i += 24 * 60 * 60 * 1000) {
            const date = new Date(i);
            const formattedDate = this.formatDate(
                date.getDate(),
                date.getMonth() + 1,
                date.getFullYear()
            );
            valueMap.set(
                this.referenceSet.addRawOrGet(formattedDate),
                (i - minTimestamp) / (24 * 60 * 60 * 1000)
            );
        }
        return valueMap;
    }
}

class ContinuousMonthGrouping extends TimeGrouping {
    static months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ];
    public timeToValue(datetime: Date): string {
        return this.formatDate(datetime.getMonth(), datetime.getFullYear());
    }
    private formatDate(month: number, year: number): string {
        return `${ContinuousMonthGrouping.months[month]}-${year}`;
    }
    public xIndexMap() {
        const combinations = this.xValuesArray.map((x) => {
            const [month, strYear] = x.value.split('-');
            return ContinuousMonthGrouping.months.indexOf(month) + parseInt(strYear) * 12;
        });
        const minCombination = Math.min(...combinations);
        const maxCombination = Math.max(...combinations);
        const valueMap = new Map<SetElement, number>();
        for (let i = minCombination; i <= maxCombination; i++) {
            const [month, year] = [i % 12, Math.floor(i / 12)];
            const formattedDate = this.formatDate(month, year);
            valueMap.set(this.referenceSet.addRawOrGet(formattedDate), i - minCombination);
        }
        return valueMap;
    }
}

class MonthGrouping extends TimeGrouping {
    static months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];
    public timeToValue(datetime: Date): string {
        return MonthGrouping.months[datetime.getMonth()];
    }
    public xIndexMap() {
        const monthIndices = this.xValuesArray.map((x) => MonthGrouping.months.indexOf(x.value));
        const minMonth = Math.min(...monthIndices);
        const maxMonth = Math.max(...monthIndices);
        const valueMap = new Map<SetElement, number>();
        for (let i = minMonth; i <= maxMonth; i++) {
            valueMap.set(this.referenceSet.addRawOrGet(MonthGrouping.months[i]), i - minMonth);
        }
        return valueMap;
    }
}

class YearGrouping extends TimeGrouping {
    public timeToValue(datetime: Date): string {
        return datetime.getFullYear().toString();
    }
    public xIndexMap() {
        const years = this.xValuesArray.map((x) => parseInt(x.value));
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        const valueMap = new Map<SetElement, number>();
        for (let i = minYear; i <= maxYear; i++) {
            valueMap.set(this.referenceSet.addRawOrGet(i.toString()), i - minYear);
        }
        return valueMap;
    }
}

export {
    Grouping,
    BatchNameGrouping,
    FilenameGrouping,
    ProjectNameGrouping,
    TimeGrouping,
    HourGrouping,
    DayGrouping,
    ContinuousMonthGrouping,
    MonthGrouping,
    YearGrouping
};
