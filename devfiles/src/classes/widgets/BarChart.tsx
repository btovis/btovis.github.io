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
    public chartSpecificLayout(numTraces: number): object {
        const traceConfigs: Array<{ [key: string]: any }> = [];
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
    public generateChartSpecificOptions(numTraces: number): Array<InputOption> {
        this.colorOptions = [];
        // Add ColorOptions
        for (let i = 0; i < numTraces; i++) {
            const colorOption = new ColorOption(
                this.panel,
                'color of trace ' + i.toString(),
                '#00FFFF'
            );
            this.colorOptions.push(colorOption);
        }
        return this.colorOptions;
    }
}
