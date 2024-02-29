import {
    ContinuousMonthGrouping,
    DayGrouping,
    Grouping,
    YGrouping,
    YearGrouping
} from './Grouping.js';
import TimeChart from './TimeChart.js';
import ColorOption from '../options/ColorOption.js';
import InputOption from '../options/InputOption.js';
import Panel from '../Panel.js';
import WidgetConfig from './WidgetConfig.js';

export default class LineChart extends TimeChart {
    public chartSpecificLayout(numTraces: number): object {
        const traceConfigs: Array<{ [key: string]: any }> = [];
        for (let i = 0; i < numTraces; i++) {
            const singleTraceConfig: { [key: string]: any } = {};
            singleTraceConfig.type = 'scatter';

            const lineConfig: { [key: string]: any } = {};
            lineConfig.color = this.colorOptions[i].value();
            singleTraceConfig.line = lineConfig;
            traceConfigs.push(singleTraceConfig);
        }
        return traceConfigs;
    }
    public updateTraceOptions(): void {
        console.log('reached');
        // Use the grouping to find number of traces
        const [groupingCls] = this.timeRangeGroupings().filter(
            (grouping: typeof Grouping) => grouping.name === this.xAxisSelector.selected
        );
        const grouping = new groupingCls(this.panel.dataFilterer, this.yAxisSelector.selected);
        // Calculate number of traces and call child method to generate, then bind to options in-line
        this.options = [
            this.xAxisSelector,
            this.yAxisSelector,
            ...this.generateChartSpecificOptions(grouping.numTraces())
        ];
        console.log(this.options);
        this.refresh();
    }

    public chartType(): string {
        return 'Line Chart';
    }
    public timeRangeGroupings(): (typeof Grouping)[] {
        return [DayGrouping, ContinuousMonthGrouping, YearGrouping];
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
