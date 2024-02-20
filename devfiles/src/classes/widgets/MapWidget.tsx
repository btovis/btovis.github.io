import Widget from './Widget.js';
import WidgetConfig from './WidgetConfig.js';
import { Data } from '../data/Data.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import React from 'react';
import Plot from 'react-plotly.js';

export default class MapWidget extends Widget {
    public generateSidebar(): Sidebar {
        throw new Error('Method not implemented.');
    }
    public render(): JSX.Element {
        const plotData = [
            {
                type: 'scattermapbox',
                lat: ['48.89697'],
                lon: ['13.44842'],
                mode: 'markers',
                marker: {
                    size: 14
                },
                text: ['Germany']
            }
        ];

        const plotLayout = {
            width: 290,
            height: 210,
            autosize: true,
            hovermode: 'closest',
            mapbox: {
                bearing: 0,
                center: {
                    lat: 49,
                    lon: 13.5
                },
                pitch: 0,
                zoom: 5
            },
            margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 0
            }
        };

        const plotConfig = {
            mapboxAccessToken:
                'pk.eyJ1Ijoic2F0b3J1enp6IiwiYSI6ImNsc3VmdnltNzE4YzIybHFraWQ3N2k3aWIifQ.TxLQjJE3y5p9cZSzkyeWUQ',
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
