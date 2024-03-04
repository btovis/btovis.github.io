import { ContinuousMonthGrouping, DayGrouping, Grouping, YearGrouping } from './Grouping.js';
import TimeChart from './TimeChart.js';
import ColorOption from '../options/ColorOption.js';
import Selector from '../options/Selector.js';
import Panel from '../Panel.js';
import BinarySelector from '../options/BinarySelector.js';

export default class LineChart extends TimeChart {
    stackedSelector: Selector;
    public constructor(panel: Panel) {
        super(panel);
        // Bug in the way TypeScript calls constructor, so we need to call this here.
        this.initOptions();
    }
    public chartSpecificLayout(numTraces: number): Array<{ [key: string]: unknown }> {
        const traceConfigs: Array<{ [key: string]: unknown }> = [];
        const stacked = this.stackedSelector && this.stackedSelector.isEverythingSelected();
        for (let i = 0; i < numTraces; i++) {
            const singleTraceConfig: { [key: string]: unknown } = {};
            singleTraceConfig.type = 'scatter';
            if (stacked) {
                singleTraceConfig.stackgroup = 'one';
                singleTraceConfig.fill = 'tonexty';
            }

            const lineConfig: { [key: string]: any } = {};
            lineConfig.color = this.colorOption.value()[i];

            singleTraceConfig.line = lineConfig;
            traceConfigs.push(singleTraceConfig);
        }
        return traceConfigs;
    }
    public async initOptions(): Promise<void> {
        // Selector for determining whether the chart is stacked or not.
        this.stackedSelector = new BinarySelector(
            this.panel,
            'Stack Line Chart',
            'Stack Lines',
            false
        );
        this.stackedSelector.extendedCallbacks.push(() => this.optionsCallback());
        super.initOptions();
    }

    // bind Chart specific options to Timechart Options
    public bindOptions(): void {
        this.options = [this.xAxisSelector, this.yAxisSelector, this.stackedSelector];
    }

    // Update Trace Options for Linechart
    public updateTraceOptions(): void {
        // Calculate number of traces and call child method to generate, then bind to options in-line
        this.updateChartSpecificOptions(this.grouping.numTraces());
        this.bindOptions();
        this.refresh();
        this.panel.pageManager.refreshPanelOptions();
    }

    // Change internal states of object: widget specific options.
    public generateChartSpecificOptions(numTraces: number): void {
        if (this.colorOption == undefined) {
            this.colorOption = new ColorOption(this.panel, 'Line Colors', numTraces, 'Line');
            this.colorOption.extendedCallbacks.push(() => this.refresh());
        }
    }

    public updateChartSpecificOptions(numTraces: number) {
        this.colorOption.updateNumTraces(numTraces);
    }

    public chartType(): string {
        return 'Line Chart';
    }
    public timeRangeGroupings(): (typeof Grouping)[] {
        return [DayGrouping, ContinuousMonthGrouping, YearGrouping];
    }
}
