import Panel from '../Panel';
import Plot from 'react-plotly.js';
import Sidebar from '../Sidebar';
import MutuallyExclusiveSelector from '../options/MutuallyExclusiveSelector';
import ExportFileType from './ExportFileType';
import { ContinuousMonthGrouping, DayGrouping, Grouping, YGrouping } from './Grouping';
import Widget from './Widget';
import WidgetConfig from './WidgetConfig';
import InputOption from '../options/InputOption';
import ColorOption from '../options/ColorOption.js';
import { getTouchRippleUtilityClass } from '@mui/material';

// Covers bar chart, line chart, stacked line chart.
export default abstract class TimeChart extends Widget {
    xAxisSelector: MutuallyExclusiveSelector;
    yAxisSelector: MutuallyExclusiveSelector;
    // This is declared here only because it isn't working when it's declared only in LineChart class
    public colorOptions: Array<ColorOption>;

    // Subclasses implement these methods for specific chart types.
    public abstract chartSpecificLayout(numTraces: number): object;
    public abstract chartType(): string;
    public abstract timeRangeGroupings();
    public abstract generateChartSpecificOptions(numTraces: number): Array<InputOption>;

    //public abstract updateTraceOptions(): void;
    // private grouping = new DayGrouping(this.panel.dataFilterer, YGrouping.SpeciesGroup);

    // private buildOptions(): void {
    //     //generate x-axis group level
    //     const enumStrings = Object.keys(LineChartGrouping).filter((v) => isNaN(Number(v)));

    //     // a few fields that affects rendering config
    //     const numTraces = this.grouping.numTraces();
    //     const colorsOptions: Array<ColorOption> = [];
    //     const yTick: NumericInput = new NumericInput(this.panel, 'ytick', 0, 10, 1); // Numeric Input is not yet implemented
    //     const groupLevel: DropMenuSelector = new DropMenuSelector(
    //         this.panel,
    //         'group lebel',
    //         enumStrings
    //     );

    //     //generate color options
    //     for (let i = 0; i < numTraces; i++) {
    //         colorsOptions.push(
    //             new ColorOption(this.panel, 'color of trace ' + i.toString(), '#00FFFF')
    //             //new PanelNameInput(this.panel, "Panel Color", "00FFFF")
    //         );
    //     }

    //     //add everything to options
    //     this.options = colorsOptions;
    //     this.options.push(groupLevel);
    // }

    // // constructor
    // public constructor(panel: Panel, config: WidgetConfig) {
    //     super(panel, config);
    //     this.buildOptions();
    // }

    // public generateSidebar(): Sidebar {
    //     return new Sidebar(this.options);
    // }

    // private generateTraceConfig(): Array<{ [key: string]: any }> {
    //     const traceConfigs: Array<{ [key: string]: any }> = [];
    //     for (let i = 0; i < this.grouping.numTraces(); i++) {
    //         const singleTraceConfig: { [key: string]: any } = {};
    //         singleTraceConfig.type = 'scatter';

    //         const lineConfig: { [key: string]: any } = {};
    //         lineConfig.color = this.options[i].value();
    //         singleTraceConfig.line = lineConfig;
    //         traceConfigs.push(singleTraceConfig);
    //     }
    //     return traceConfigs;
    // }

    // public render(): JSX.Element {
    //     const plotLayout = {
    //         width: 400,
    //         height: 210,
    //         title: {
    //             text: 'Line Chart'
    //         },
    //         margin: {
    //             l: 30,
    //             r: 30,
    //             b: 50,
    //             t: 65
    //         }
    //     };
    //     const { traces, layout } = this.grouping.getChart(this.generateTraceConfig(), plotLayout);
    //     const plotConfig = {
    //         //staticPlot: true,
    //         modeBarButtonsToRemove: ['zoomIn2d', 'zoomOut2d']
    //     };
    //     return <Plot data={traces} layout={layout} config={plotConfig} />;

    public constructor(panel: Panel, config: WidgetConfig) {
        super(panel, config);
        this.generateOptions();
    }
    public generateOptions(): void {
        // Mutex selector for time (or property) grouping along the x axis.
        this.xAxisSelector = new MutuallyExclusiveSelector(
            this.panel,
            `Time Grouping for ${this.chartType()} Widget`,
            this.timeRangeGroupings().map((grouping: typeof Grouping) => grouping.name)
        );
        // Mutex selector for grouping along the y axis (species, species group, etc).
        this.yAxisSelector = new MutuallyExclusiveSelector(
            this.panel,
            `Count Grouping for ${this.chartType()} Widget`,
            Object.values(YGrouping)
        );

        // Refresh widgets when options are change.
        this.xAxisSelector.extendedCallbacks.push(() => {
            this.refresh();
        });
        this.yAxisSelector.extendedCallbacks.push(() => {
            this.refresh();
        });

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
        //this.options = [this.xAxisSelector, this.yAxisSelector];
        this.refresh();
    }
    public generateSidebar(): Sidebar {
        return new Sidebar(this.options);
    }
    public render(): JSX.Element {
        // Get the selected groupings for x and y.
        const yGrouping = this.yAxisSelector.selected;
        const [groupingCls] = this.timeRangeGroupings().filter(
            (grouping: typeof Grouping) => grouping.name === this.xAxisSelector.selected
        );
        // Use the grouping to render the chart data.
        const grouping = new groupingCls(this.panel.dataFilterer, yGrouping);
        const plotLayout = {
            width: 400,
            height: 210,
            margin: {
                l: 30,
                r: 30,
                b: 50,
                t: 65
            }
        };
        // Add specific layout to each chart.
        const { traces, layout } = grouping.getChart(
            this.chartSpecificLayout(grouping.numTraces()),
            plotLayout
        );
        const plotConfig = {
            modeBarButtonsToRemove: ['zoomIn2d', 'zoomOut2d']
        };
        return <Plot data={traces} layout={layout} config={plotConfig} />;
    }
    public delete(): void {}
    public clone(): Widget {
        throw new Error('Method not implemented.');
    }
    public export(fileType: ExportFileType): void {
        throw new Error('Method not implemented.');
    }
}
