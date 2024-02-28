import Widget from './Widget.js';
import WidgetConfig from './WidgetConfig.js';
import { Data, Attribute } from '../data/Data.js';
import Row from '../data/Row.js';
import { MonthGrouping, YGrouping } from './Grouping.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Plot from 'react-plotly.js';

export default class BarChart extends Widget {
    public generateSidebar(): Sidebar {
        return new Sidebar([]);
    }
    public render(): JSX.Element {
        const grouping = new MonthGrouping(this.panel.dataFilterer, YGrouping.Species);
        const plotLayout = {
            width: 400,
            height: 210,
            title: {
                text: 'Bar Chart',
                y: 0.85
            },
            margin: {
                l: 30,
                r: 30,
                b: 50,
                t: 65
            }
        };
        const { traces, layout } = grouping.getChart(
            {
                type: 'bar'
            },
            plotLayout
        );
        const plotConfig = {
            //staticPlot: true,
            modeBarButtonsToRemove: ['zoomIn2d', 'zoomOut2d']
        };
        return <Plot data={traces} layout={layout} config={plotConfig} />;
    }
    public delete(): void {
        //throw new Error('Method not implemented.');
    }
    public clone(): Widget {
        throw new Error('Method not implemented.');
    }
    public export(fileType: ExportFileType): void {
        throw new Error('Method not implemented.');
    }
}
