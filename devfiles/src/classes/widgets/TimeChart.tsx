import Panel from '../Panel';
import Plot from 'react-plotly.js';
import Sidebar from '../Sidebar';
import MutuallyExclusiveSelector from '../options/MutuallyExclusiveSelector';
import ExportFileType from './ExportFileType';
import { ContinuousMonthGrouping, DayGrouping, Grouping, YGrouping } from './Grouping';
import Widget from './Widget';
import WidgetConfig from './WidgetConfig';

export default abstract class TimeChart extends Widget {
    xAxisSelector: MutuallyExclusiveSelector;
    yAxisSelector: MutuallyExclusiveSelector;
    public constructor(panel: Panel, config: WidgetConfig) {
        super(panel, config);
        this.generateOptions();
    }
    public generateOptions(): void {
        this.xAxisSelector = new MutuallyExclusiveSelector(
            this.panel,
            `Time Grouping for ${this.chartType()} Widget`,
            this.timeRangeGroupings().map((grouping: typeof Grouping) => grouping.name)
        );
        this.xAxisSelector.extendedCallbacks.push(() => {
            this.refresh();
        });
        this.yAxisSelector = new MutuallyExclusiveSelector(
            this.panel,
            `Count Grouping for ${this.chartType()} Widget`,
            Object.values(YGrouping)
        );
        this.yAxisSelector.extendedCallbacks.push(() => {
            this.refresh();
        });
        this.options = [this.xAxisSelector, this.yAxisSelector];
    }
    public generateSidebar(): Sidebar {
        return new Sidebar(this.options);
    }
    public abstract chartSpecificLayout(): object;
    public abstract chartType(): string;
    public abstract timeRangeGroupings();
    public render(): JSX.Element {
        const yGrouping = this.yAxisSelector.selected;
        const [groupingCls] = this.timeRangeGroupings().filter(
            (grouping: typeof Grouping) => grouping.name === this.xAxisSelector.selected
        );
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
        const { traces, layout } = grouping.getChart(this.chartSpecificLayout(), plotLayout);
        const plotConfig = {
            //staticPlot: true,
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
