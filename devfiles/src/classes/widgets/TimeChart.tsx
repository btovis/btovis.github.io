import Panel from '../Panel';
import Plot from 'react-plotly.js';
import Sidebar from '../Sidebar';
import MutuallyExclusiveSelector from '../options/MutuallyExclusiveSelector';
import ExportFileType from './ExportFileType';
import { ContinuousMonthGrouping, DayGrouping, Grouping, YGrouping } from './Grouping';
import Widget from './Widget';
import WidgetConfig from './WidgetConfig';

// Covers bar chart, line chart, stacked line chart.
export default abstract class TimeChart extends Widget {
    xAxisSelector: MutuallyExclusiveSelector;
    yAxisSelector: MutuallyExclusiveSelector;

    // Subclasses implement these methods for specific chart types.
    public abstract chartSpecificLayout(): object;
    public abstract chartType(): string;
    public abstract timeRangeGroupings();

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

        this.options = [this.xAxisSelector, this.yAxisSelector];
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
        const { traces, layout } = grouping.getChart(this.chartSpecificLayout(), plotLayout);
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
