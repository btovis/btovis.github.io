import InputOption from '../options/InputOption.js';
import ColorOption from '../options/ColorOption.js';
import {
    BatchNameGrouping,
    ContinuousMonthGrouping,
    DayGrouping,
    FilenameGrouping,
    Grouping,
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
            markerConfig.color = this.colorOptions[i].value();
            singleTraceConfig.marker = markerConfig;
            traceConfigs.push(singleTraceConfig);
        }
        return traceConfigs;
    }

    // bind Chart specific options to Timechart Options
    public bindOptions(): void {
        this.options = [this.xAxisSelector, this.yAxisSelector, ...this.colorOptions];
    }

    public generateChartSpecificOptions(numTraces: number): void {
        // Default Color palette
        const palette = [
            '#039cad',
            '#ce4458',
            '#d69c46',
            '#5d7def',
            '#70ce29',
            '#fc7a2f',
            '#2c48ba',
            '#ce2b43',
            '#ea4ba2',
            '#5dbc29',
            '#f26f52',
            '#b7852d',
            '#ea1932',
            '#0ed80a',
            '#46c60f',
            '#dd5db2',
            '#222e96',
            '#ba0088',
            '#fcf016',
            '#930524',
            '#d30684',
            '#36d1ac',
            '#f2dc15',
            '#14706e',
            '#092268',
            '#1ab4ba',
            '#aed33d',
            '#adef51',
            '#471687',
            '#270799',
            '#bc6ef4',
            '#87c627',
            '#f72ec1',
            '#0345a3',
            '#20137c',
            '#e35ee5',
            '#990f3f',
            '#8af74f',
            '#a441ea',
            '#b210cc'
        ];
        // Change Number of Trace Options according to difference in length
        const currentLen = this.colorOptions.length;
        if (numTraces > this.colorOptions.length) {
            for (let i = 0; i < numTraces - currentLen; i++) {
                const colorOption = new ColorOption(
                    this.panel,
                    'color of trace ' + i.toString(),
                    palette[(i + currentLen) % 40]
                );
                colorOption.extendedCallbacks.push(() => {
                    this.refresh();
                });
                this.colorOptions.push(colorOption);
            }
        } else {
            this.colorOptions = this.colorOptions.slice(0, numTraces);
        }
    }

    // Update Trace Options for BarChart
    public updateTraceOptions(): void {
        // Calculate number of traces and call child method to generate, then bind to options in-line
        this.generateChartSpecificOptions(this.grouping.numTraces());
        this.options = [this.xAxisSelector, this.yAxisSelector, ...this.colorOptions];
        this.refresh();
        this.panel.pageManager.refreshPanelOptions();
    }

    public chartType(): string {
        return 'Bar Chart';
    }
    public timeRangeGroupings(): (typeof Grouping)[] {
        return [
            DayGrouping,
            MonthGrouping,
            YearGrouping,
            ProjectNameGrouping,
            BatchNameGrouping,
            FilenameGrouping
        ];
    }
}
