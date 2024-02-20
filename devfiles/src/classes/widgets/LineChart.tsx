import Widget from './Widget.js';
import WidgetConfig from './WidgetConfig.js';
import { Data } from '../data/Data.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import React from 'react';
import Plot from 'react-plotly.js'

export default class LineChart extends Widget {
    public generateSidebar(): Sidebar {
        throw new Error('Method not implemented.');
    }
    public render(): JSX.Element {
        const trace1 =  {
            type: 'scatter', x: [1, 2, 3], y: [2, 5, 3],
            fill: 'tozeroy',
            stackgroup: 'one',
            line: {
                color: this.config.traceColor[0]
            }
        }
        const trace2 = {
            type: 'scatter', x: [1, 2, 3], y: [1, 1, 2],
            fiill: 'tozeroy',
            stackgroup: 'one',
            line: {
                color: this.config.traceColor[1]
            }
        }
        const plotData = [trace1, trace2];
        const plotLayout={
            width: 290,
            height: 240,
            title: {
                text: 'Line Chart',
                y: 0.85
            },
            margin: {
                l:30,
                r:30,
                b:50,
                t:65
            }

        };
        const plotConfig={
            //staticPlot: true,
            modeBarButtonsToRemove: [
                'zoomIn2d', 'zoomOut2d'
            ]
        }
        return (
            <Plot data={plotData} layout={plotLayout} config={plotConfig}/>
        );
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
