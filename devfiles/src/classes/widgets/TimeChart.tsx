import Panel from '../Panel';
import Plot from 'react-plotly.js';
import Sidebar from '../Sidebar';
import MutuallyExclusiveSelector from '../options/MutuallyExclusiveSelector';
import ExportFileType from './ExportFileType';
import {
    ContinuousMonthGrouping,
    DayGrouping,
    Grouping,
    YGrouping,
    YearGrouping
} from './Grouping';
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

    public constructor(panel: Panel, config: WidgetConfig) {
        super(panel, config);
        this.generateOptions();
    }
    public generateOptions(): void {
        const filter = this.panel.dataFilterer;
        const groupings = this.timeRangeGroupings()
            .filter((grouping) => {
                // Manually filter groupings of x axis to prevent too many x values.
                const groupingInstance = new grouping(filter, YGrouping.Species);
                const [data, length] = filter.getData();
                const xValues = new Set();
                for (let i = 0; i < length; i++) {
                    const row = data[i];
                    const x = groupingInstance.selectX(row);
                    xValues.add(x);
                    if (xValues.size > Grouping.maxXValues) {
                        return false;
                    }
                }
                return true;
            })
            .map((grouping: typeof Grouping) => grouping.name);
        // Mutex selector for time (or property) grouping along the x axis.
        this.xAxisSelector = new MutuallyExclusiveSelector(
            this.panel,
            `Time Grouping for ${this.chartType()} Widget`,
            groupings
        );
        // Mutex selector for grouping along the y axis (species, species group, etc).
        this.yAxisSelector = new MutuallyExclusiveSelector(
            this.panel,
            `Count Grouping for ${this.chartType()} Widget`,
            Object.values(YGrouping)
        );

        this.xAxisSelector.useSearchBar = false;
        this.yAxisSelector.useSearchBar = false;
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
