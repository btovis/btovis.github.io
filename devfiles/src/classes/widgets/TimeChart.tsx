import Panel from '../Panel';
import Plot from 'react-plotly.js';
import Sidebar from '../Sidebar';
import MutuallyExclusiveSelector from '../options/MutuallyExclusiveSelector';
import ExportFileType from './ExportFileType';
import { ContinuousMonthGrouping, DayGrouping, YGrouping } from './Grouping';
import Widget from './Widget';
import WidgetConfig from './WidgetConfig';

export default abstract class TimeChart extends Widget {
    yAxisSelector: MutuallyExclusiveSelector;
    public constructor(panel: Panel, config: WidgetConfig) {
        super(panel, config);
        this.generateOptions();
    }
    public generateOptions(): void {
        this.yAxisSelector = new MutuallyExclusiveSelector(
            this.panel,
            `Y Axis for ${this.chartType()} Widget`,
            Object.keys(YGrouping)
        );
        this.options = [this.yAxisSelector];
    }
    public generateSidebar(): Sidebar {
        return new Sidebar(this.options);
    }
    public abstract chartSpecificLayout(): object;
    public abstract chartType(): string;
    public render(): JSX.Element {
        const yGrouping = this.yAxisSelector.selected;
        const grouping = new DayGrouping(this.panel.dataFilterer, YGrouping[yGrouping]);
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
