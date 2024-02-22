import Widget from './Widget.js';
import WidgetConfig from './WidgetConfig.js';
import { Data } from '../data/Data.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import React from 'react';
import Plot from 'react-plotly.js';

export default class MapWidget extends Widget {
    public generateSidebar(): Sidebar {
        return new Sidebar([]);
    }
    public render(): JSX.Element {
        //fake data to implement map scaling
        const data = {
            lat: ['48.89697', '48.95'],
            lon: ['13.44842', '13.45']
        };

        //map zoom settings
        const latBound = Math.max(...data.lat.map(Number)) - Math.min(...data.lat.map(Number));
        const lonBound = Math.max(...data.lon.map(Number)) - Math.min(...data.lon.map(Number));
        const maxBound = Math.max(latBound, lonBound) * 600;
        const zoom = 11.5 - Math.log(maxBound);

        //map center settings
        let avgLat = 0;
        let avgLon = 0;
        data.lat.map(Number).forEach((num) => {
            avgLat += num;
        });
        data.lon.map(Number).forEach((num) => {
            avgLon += num;
        });
        avgLat /= data.lat.length;
        avgLon /= data.lon.length;

        //plot data for plotly
        const plotData = [
            {
                type: 'scattermapbox',
                lat: data.lat,
                lon: data.lon,
                mode: 'markers',
                marker: {
                    size: 14
                },
                text: ['Germany', 'Germany']
            }
        ];

        //plot layout for plotly
        const plotLayout = {
            width: 290,
            height: 210,
            autosize: true,
            hovermode: 'closest',
            mapbox: {
                bearing: 0,
                center: {
                    lat: avgLat,
                    lon: avgLon
                },
                pitch: 0,
                zoom: zoom
            },
            margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 0
            }
        };

        //plot config for plotly includes mapbox token *
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
