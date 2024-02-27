import Widget from './Widget.js';
import WidgetConfig from './WidgetConfig.js';
import { Data } from '../data/Data.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import React from 'react';
import Plot from 'react-plotly.js';
import { ContinuousMonthGrouping } from './Grouping.js';

export default class StackedLineChart extends Widget {
    public generateSidebar(): Sidebar {
        return new Sidebar([]);
    }
    public render(): JSX.Element {
        const grouping = new ContinuousMonthGrouping(this.panel.dataFilterer);
        const plotLayout = {
            width: 400,
            height: 210,
            title: {
                text: 'Stacked Line Chart'
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
                type: 'scatter',
                stackgroup: 'one',
                fill: 'tonexty'
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
