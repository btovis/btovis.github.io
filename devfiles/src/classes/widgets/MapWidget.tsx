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
        const [data, length] = this.panel.dataFilterer.getData();
        const dataSubset = data.slice(0, length);
        const latitudeColumnIdx = this.panel.dataFilterer.getColumnIndex('LATITUDE');
        const longitudeColumnIdx = this.panel.dataFilterer.getColumnIndex('LONGITUDE');
        const latitude = dataSubset.map((row) => Number(row[latitudeColumnIdx]));
        const longitude = dataSubset.map((row) => Number(row[longitudeColumnIdx]));

        //map zoom settings
        const latMax = Math.max(...latitude);
        const latMin = Math.min(...latitude);
        const lonMax = Math.max(...longitude);
        const lonMin = Math.min(...longitude);

        const latBound = latMax - latMin + 1e-4;
        const lonBound = lonMax - lonMin + 1e-4;
        const maxBound = Math.max(latBound, lonBound) * 600;
        const zoom = 11.5 - Math.log(maxBound);

        //map center settings
        const avgLat = (latMax + latMin) / 2;
        const avgLon = (lonMax + lonMin) / 2;

        //plot data for plotly
        const plotData = [
            {
                type: 'scattermapbox',
                lat: latitude,
                lon: longitude,
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
