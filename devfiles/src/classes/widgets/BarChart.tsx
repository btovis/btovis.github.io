import Widget from './Widget.js';
import WidgetConfig from './WidgetConfig.js';
import { Data } from '../data/Data.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Plot from 'react-plotly.js';

export default class BarChart extends Widget {
    public generateSidebar(): Sidebar {
        throw new Error('Method not implemented.');
    }
    public render(): JSX.Element {
        const trace1 = {
            type: 'bar',
            x: [1, 2, 3],
            y: [2, 5, 3],
            marker: {
                color: Array(3).fill(this.config.traceColor[0])
            }
        };
        const trace2 = {
            type: 'bar',
            x: [1, 2, 3],
            y: [4, 2, 6],
            marker: {
                color: Array(3).fill(this.config.traceColor[1])
            }
        };
        const plotData = [trace1, trace2];
        const plotLayout = {
            width: 290,
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
        const plotConfig = {
            //staticPlot: true,
            modeBarButtonsToRemove: ['zoomIn2d', 'zoomOut2d']
        };
        return <Plot data={plotData} layout={plotLayout} config={plotConfig} />;
    }
    public delete(): void {
        throw new Error('Method not implemented.');
    }
    public clone(): Widget {
        throw new Error('Method not implemented.');
    }
    public export(fileType: ExportFileType): void {
        throw new Error('Method not implemented.');
    }
}
