import { ContinuousMonthGrouping, DayGrouping, Grouping, YearGrouping } from './Grouping.js';
import TimeChart from './TimeChart.js';
import ColorOption from '../options/ColorOption.js';
import Selector from '../options/Selector.js';
import Panel from '../Panel.js';

export default class LineChart extends TimeChart {
    stackedSelector: Selector;
    public constructor(panel: Panel) {
        super(panel);
        // Bug in the way TypeScript calls constructor, so we need to call this here.
        this.initOptions();
    }
    public chartSpecificLayout(numTraces: number): Array<{ [key: string]: any }> {
        const traceConfigs: Array<{ [key: string]: any }> = [];
        const stacked = this.stackedSelector && this.stackedSelector.isEverythingSelected();
        for (let i = 0; i < numTraces; i++) {
            const singleTraceConfig: { [key: string]: any } = {};
            singleTraceConfig.type = 'scatter';
            if (stacked) {
                singleTraceConfig.stackgroup = 'one';
                singleTraceConfig.fill = 'tonexty';
            }

            const lineConfig: { [key: string]: any } = {};
            lineConfig.color = this.colorOptions[i].value();
            singleTraceConfig.line = lineConfig;
            traceConfigs.push(singleTraceConfig);
        }
        return traceConfigs;
    }
    public async initOptions(): Promise<void> {
        // Selector for determining whether the chart is stacked or not.
        this.stackedSelector = new Selector(
            this.panel,
            'Stack Line Chart',
            ['Stack Lines'],
            false,
            []
        );
        this.stackedSelector.hideSelectAll = true;
        this.stackedSelector.extendedCallbacks.push(() => this.optionsCallback());
        super.initOptions();
    }

    // bind Chart specific options to Timechart Options
    public bindOptions(): void {
        this.options = [
            this.xAxisSelector,
            this.yAxisSelector,
            this.stackedSelector,
            ...this.colorOptions
        ];
    }

    // Update Trace Options for Linechart
    public updateTraceOptions(): void {
        // Calculate number of traces and call child method to generate, then bind to options in-line
        this.generateChartSpecificOptions(this.grouping.numTraces());
        this.bindOptions();
        this.refresh();
        this.panel.pageManager.refreshPanelOptions();
    }

    // Change internal states of object: widget specific options.
    public generateChartSpecificOptions(numTraces: number): void {
        // Default Palette
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
        // Adjust number of ColorOptions, keep still useful ones.
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

    public chartType(): string {
        return 'Line Chart';
    }
    public timeRangeGroupings(): (typeof Grouping)[] {
        return [DayGrouping, ContinuousMonthGrouping, YearGrouping];
    }
}
