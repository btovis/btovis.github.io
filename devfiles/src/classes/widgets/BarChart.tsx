import ColorOption from '../options/ColorOption.js';
import {
    BatchNameGrouping,
    DayGrouping,
    FilenameGrouping,
    Grouping,
    HourGrouping,
    MonthGrouping,
    ProjectNameGrouping,
    YearGrouping
} from './Grouping.js';
import TimeChart from './TimeChart.js';

export default class BarChart extends TimeChart {
    // Generate Specific Layout for BarChart from specific options
    public chartSpecificLayout(numTraces: number): Array<{ [key: string]: unknown }> {
        const traceConfigs: Array<{ [key: string]: unknown }> = [];
        // Modify the JS object for every trace
        for (let i = 0; i < numTraces; i++) {
            const singleTraceConfig: { [key: string]: unknown } = {};
            singleTraceConfig.type = 'bar';

            const markerConfig: { [key: string]: any } = {};
            markerConfig.color = this.colorOption.value()[i];

            singleTraceConfig.marker = markerConfig;
            traceConfigs.push(singleTraceConfig);
        }
        return traceConfigs;
    }

    // bind Chart specific options to Timechart Options
    public bindOptions(): void {
        this.options = [this.xAxisSelector, this.yAxisSelector, this.colorOption];
    }

    public generateChartSpecificOptions(numTraces: number): void {
        if (this.colorOption == undefined) {
            const traceNames = this.grouping.getPartialTraces().map((x) => x.name);
            this.colorOption = new ColorOption(
                this.panel,
                traceNames,
                'Bar Colours',
                numTraces,
                'Bar'
            );
            this.colorOption.extendedCallbacks.push(() => this.refresh());
        }
    }

    // Update Trace Options for BarChart
    public updateTraceOptions(): void {
        // Calculate number of traces and call child method to generate, then bind to options in-line
        this.updateChartSpecificOptions(this.grouping.numTraces());
        // Get Trace Names to supply to sidebar option
        const traceNames = this.grouping.getPartialTraces().map((x) => x.name);
        this.colorOption.updateTraceNames(traceNames);
        this.bindOptions();
        this.refresh();
        this.options.forEach((op) => op.refreshComponent());
    }

    public updateChartSpecificOptions(numTraces: number) {
        this.colorOption.updateNumTraces(numTraces);
    }

    public chartType(): string {
        return 'Bar Chart';
    }

    public timeRangeGroupings(): (typeof Grouping)[] {
        return [
            HourGrouping,
            DayGrouping,
            MonthGrouping,
            YearGrouping,
            ProjectNameGrouping,
            BatchNameGrouping,
            FilenameGrouping
        ];
    }
}
