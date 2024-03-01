import Panel from '../Panel';
import Plot from 'react-plotly.js';
import Sidebar from '../Sidebar';
import MutuallyExclusiveSelector from '../options/MutuallyExclusiveSelector';
import ExportFileType from './ExportFileType';
import { ContinuousMonthGrouping, DayGrouping, Grouping, YGrouping } from './Grouping';
import Widget from './Widget';
import InputOption from '../options/InputOption';
import ColorOption from '../options/ColorOption.js';
import { getTouchRippleUtilityClass } from '@mui/material';

// Covers bar chart, line chart, stacked line chart.
export default abstract class TimeChart extends Widget {
    xAxisSelector: MutuallyExclusiveSelector;
    yAxisSelector: MutuallyExclusiveSelector;
    // This is declared here only because it isn't working when it's declared only in LineChart class
    public colorOptions: Array<ColorOption> = [];

    // Subclasses implement these methods for specific chart types.
    public abstract chartSpecificLayout(numTraces: number): Array<{ [key: string]: any }>;
    public abstract chartType(): string;
    public abstract timeRangeGroupings();
    public abstract generateChartSpecificOptions(numTraces: number): void;
    public abstract bindOptions(): void;

    // Initialize grouping
    public grouping: Grouping;

    public constructor(panel: Panel) {
        super(panel);
        this.initOptions();
    }

    // Initialize & Update the 'grouping' field of Timechart
    public updateGrouping(): void {
        // Get the selected groupings for x and y.
        const yGrouping = this.yAxisSelector.selected;
        const [groupingCls] = this.timeRangeGroupings().filter(
            (grouping: typeof Grouping) => grouping.name === this.xAxisSelector.selected
        );
        // Change Value for 'grouping'
        this.grouping = new groupingCls(this.panel.dataFilterer, yGrouping);
    }
    // Initial fill-out of options field to be called in constructor
    public initOptions(): void {
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
            this.updateGrouping();
            this.updateTraceOptions();
            this.refresh();
        });
        this.yAxisSelector.extendedCallbacks.push(() => {
            this.updateGrouping();
            this.updateTraceOptions();
            this.refresh();
        });

        // Initialize value for grouping
        this.updateGrouping();
        // Generate Trace Options (currently only color)
        this.generateChartSpecificOptions(this.grouping.numTraces());
        // bind ColorOptions
        this.bindOptions();
    }

    public generateSidebar(): Sidebar {
        return new Sidebar(this.options);
    }
    public render(): JSX.Element {
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
        const { traces, layout } = this.grouping.getChart(
            this.chartSpecificLayout(this.grouping.numTraces()),
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