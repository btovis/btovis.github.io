import SetElement from '../data/setutils/SetElement';
import { Attribute, Data } from '../data/Data';
import Row from '../data/Row';
import ReferenceSet from '../data/setutils/ReferenceSet';
import { Filter } from '../filters/Filter';
import DataFilterer from '../data/DataFilterer';
import SpeciesMeta from '../queryMeta/SpeciesMeta';

enum YGrouping {
    Animal = 'Animal',
    Species = 'Species',
    SpeciesGroup = 'Species Group',
    VulnerabilityStatus = 'Vulnerability Status'
}

abstract class Grouping {
    static name: string;
    filter: DataFilterer;
    referenceSet: ReferenceSet;
    xValues: Set<SetElement>;
    xValuesArray: SetElement[];
    yColumnIdx: number;
    yGrouping: YGrouping;
    speciesMeta: SpeciesMeta;
    static maxXValues: number = 1000;
    constructor(filter: DataFilterer, yGrouping: YGrouping) {
        this.filter = filter;
        this.referenceSet = new ReferenceSet();
        // Unique x values.
        this.xValues = new Set();

        // Use an attribute to select the y values.
        let attribute: Attribute;
        switch (yGrouping) {
            case YGrouping.Species:
            case YGrouping.VulnerabilityStatus:
                attribute = Attribute.speciesLatinName;
                break;
            case YGrouping.Animal:
                attribute = Attribute.speciesEnglishName;
                break;
            case YGrouping.SpeciesGroup:
                attribute = Attribute.speciesGroup;
                break;
        }
        // Store the column used when grouping.
        this.yColumnIdx = filter.getColumnIndex(attribute);
        this.yGrouping = yGrouping;
        this.speciesMeta = filter.getDataStats().getSpeciesMeta();
        this.xValuesArray = [];
    }
    // Namings for displaying data.
    public abstract selectX(row: Row): SetElement;
    public abstract getXLabel(): string;
    public getXRate(): string {
        return `${this.getXLabel()}ly`;
    }
    public getYName(): string {
        return this.yGrouping;
    }
    public getYLabel(): string {
        return `Counts/${this.getYName()}`;
    }
    public selectByColumnIndex(row: Row, columnIdx: number): SetElement {
        if (row[columnIdx] instanceof SetElement) {
            return row[columnIdx];
        }
        // Create a new set element and add the value to the reference set.
        return this.referenceSet.addRawOrGet(row[columnIdx]);
    }
    // Select the value to be used for the y-axis.
    public selectY(row: Row): SetElement {
        switch (this.yGrouping) {
            case YGrouping.VulnerabilityStatus: {
                const species = row[this.yColumnIdx];
                const status = this.speciesMeta.endStatus(species);
                return this.referenceSet.addRawOrGet(status);
            }
            default:
                return this.selectByColumnIndex(row, this.yColumnIdx);
        }
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
        // Use y as the first key and x as the second.
        // Stores counts of x values for each y value.
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
        const sortedXValues = this.xValuesArray.sort((a, b) => a.value.localeCompare(b.value));
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
                name: group.value,
                showlegend: true,
                hoverinfo: 'y+name'
            };
        });
    }
    // Get number of traces
    public numTraces() {
        return this.aggregatePairs().size;
    }
    // Returns chart data and layout for plotly
    public getChart(
        additionalTracesConfig: Array<{ [key: string]: any }>,
        additionalLayoutConfig: { [key: string]: any }
    ): { traces: any[]; layout: any } {
        const partialTraces = this.getPartialTraces();
        const xIndexMap = this.xIndexMap();
        // Map from index to label.
        const labelAlias = Object.fromEntries(
            Array.from(xIndexMap.entries()).map(([x, i]) => [i, x.value])
        );
        return {
            traces: partialTraces.map((trace, index) => {
                return {
                    ...trace,
                    ...additionalTracesConfig[index]
                };
            }),
            layout: {
                xaxis: {
                    title: this.getXLabel(),
                    labelalias: labelAlias,
                    nticks: Math.min(xIndexMap.size, 10),
                    tickmode: 'auto'
                },
                yaxis: {
                    title: this.getYLabel()
                },
                legend: {
                    visible: true
                },
                title: `${this.getXRate()} ${this.getYName()} Counts`,
                ...additionalLayoutConfig
            }
        };
    }
}

class BatchNameGrouping extends Grouping {
    columnIdx: number;
    static name = 'Batch Name';
    constructor(filter: DataFilterer, yGrouping: YGrouping) {
        super(filter, yGrouping);
        this.columnIdx = filter.getColumnIndex(Attribute.batchName);
    }
    public selectX(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.columnIdx);
    }
    public getXLabel(): string {
        return BatchNameGrouping.name;
    }
    public getXRate(): string {
        return 'Batch';
    }
}

class ProjectNameGrouping extends Grouping {
    columnIdx: number;
    static name = 'Project Name';
    constructor(filter: DataFilterer, yGrouping: YGrouping) {
        super(filter, yGrouping);
        this.columnIdx = filter.getColumnIndex(Attribute.projectName);
    }
    public selectX(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.columnIdx);
    }
    public getXLabel(): string {
        return ProjectNameGrouping.name;
    }
    public getXRate(): string {
        return 'Project';
    }
}

class FilenameGrouping extends Grouping {
    static name = 'Filename';
    columnIdx: number;
    constructor(filter: DataFilterer, yGrouping: YGrouping) {
        super(filter, yGrouping);
        this.columnIdx = filter.getColumnIndex(Attribute.csvName);
    }
    public selectX(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.columnIdx);
    }
    public getXLabel(): string {
        return FilenameGrouping.name;
    }
    public getXRate(): string {
        return 'File';
    }
}

abstract class TimeGrouping extends Grouping {
    timeColumnIdx: number;
    dateColumnIdx: number;
    constructor(filter: DataFilterer, yGrouping: YGrouping) {
        super(filter, yGrouping);
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
    static name = 'Hour';
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
    public getXLabel(): string {
        return HourGrouping.name;
    }
}

class DayGrouping extends TimeGrouping {
    static name = 'Date';
    public timeToValue(datetime: Date): string {
        return this.formatDate(datetime.getDate(), datetime.getMonth() + 1, datetime.getFullYear());
    }
    private formatDate(day: number, month: number, year: number): string {
        return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year.toString().slice(-2)}`;
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
    public getXLabel(): string {
        return DayGrouping.name;
    }
    public getXRate(): string {
        return 'Daily';
    }
}

class ContinuousMonthGrouping extends TimeGrouping {
    static name = 'Month';
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
    public getXLabel(): string {
        return ContinuousMonthGrouping.name;
    }
}

class MonthGrouping extends TimeGrouping {
    static name = 'Month';
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
    public getXLabel(): string {
        return MonthGrouping.name;
    }
}

class YearGrouping extends TimeGrouping {
    static name = 'Year';
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
    public getXLabel(): string {
        return YearGrouping.name;
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
    YearGrouping,
    YGrouping
};
