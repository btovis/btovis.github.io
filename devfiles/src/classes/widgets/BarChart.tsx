import InputOption from '../options/InputOption.js';
import ColorOption from '../options/ColorOption.js';
import {
    BatchNameGrouping,
    ContinuousMonthGrouping,
    DayGrouping,
    FilenameGrouping,
    Grouping,
    HourGrouping,
    MonthGrouping,
    ProjectNameGrouping,
    YGrouping,
    YearGrouping
} from './Grouping.js';
import TimeChart from './TimeChart.js';

export default class BarChart extends TimeChart {
    // Generate Specific Layout for BarChart from specific options
    public chartSpecificLayout(numTraces: number): Array<{ [key: string]: any }> {
        const traceConfigs: Array<{ [key: string]: any }> = [];
        // Modify the JS object for every trace
        for (let i = 0; i < numTraces; i++) {
            const singleTraceConfig: { [key: string]: any } = {};
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
            this.colorOption = new ColorOption(this.panel, 'color option', numTraces);
            this.colorOption.extendedCallbacks.push(() => this.refresh());
        }
    }

    // Update Trace Options for BarChart
    public updateTraceOptions(): void {
        // Calculate number of traces and call child method to generate, then bind to options in-line
        this.updateChartSpecificOptions(this.grouping.numTraces());
        this.bindOptions();
        this.refresh();
        this.panel.pageManager.refreshPanelOptions();
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
