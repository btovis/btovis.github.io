import Widget from './Widget.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Plot from 'react-plotly.js';
import { Attribute } from '../data/Data.js';
import Panel from '../Panel.js';

export default class MapWidget extends Widget {
    // If this is really not useful here in future, change this to an abstract method in Timechart and update Panel.ts refresh method.
    public updateTraceOptions(): void {}

    public static readonly mapToken =
        'pk.eyJ1Ijoic2F0b3J1enp6IiwiYSI6ImNsc3VmdnltNzE4YzIybHFraWQ3N2k3aWIifQ.TxLQjJE3y5p9cZSzkyeWUQ';

    public render(): JSX.Element {
        //fake data to implement map scaling

        const { plotData, plotLayout, plotConfig } = MapWidget.generatePlotlySettings(this.panel);
        return <Plot data={plotData} layout={plotLayout} config={plotConfig} />;
    }

    /**
     * Static for use outside map widget. Also easier to test without the DOM
     * @param panel
     */
    public static generatePlotlySettings(panel: Panel) {
        const coords: Set<string> = new Set();
        const min = [+Infinity, +Infinity];
        const max = [-Infinity, -Infinity];

        const latCol = panel.dataFilterer.getColumnIndex(Attribute.latitude);
        const lonCol = panel.dataFilterer.getColumnIndex(Attribute.longitude);
        for (let i = 0; i < panel.dataFilterer.getData()[1]; i++) {
            const row = panel.dataFilterer.getData()[0][i];
            coords.add(row[latCol].toString() + '\0' + row[lonCol].toString());
            min[0] = Math.min(min[0], row[latCol]);
            min[1] = Math.min(min[1], row[lonCol]);
            max[0] = Math.max(max[0], row[latCol]);
            max[1] = Math.max(max[1], row[lonCol]);
        }

        //map zoom settings
        const latBound = max[0] - min[0];
        const lonBound = max[0] - min[0];
        const maxBound = Math.max(latBound, lonBound) * 600;
        const zoom = 11.5 - Math.log(maxBound);

        //plot data for plotly
        const plotData = [
            {
                type: 'scattermapbox',
                lat: [...coords].map((c) => parseFloat(c.split('\0')[0])),
                lon: [...coords].map((c) => parseFloat(c.split('\0')[1])),
                mode: 'markers',
                marker: {
                    size: 7,
                    color: 'red'
                },
                text: ['Germany', 'Germany']
            }
        ];

        //plot layout for plotly
        const plotLayout = {
            width: 290,
            height: 210,
            autosize: false,
            hovermode: 'closest',
            mapbox: {
                center: {
                    lat: min[0] + (max[0] - min[0]) / 2,
                    lon: min[1] + (max[1] - min[1]) / 2
                },
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
            mapboxAccessToken: MapWidget.mapToken,
            modeBarButtonsToRemove: [
                'zoom2d',
                'pan2d',
                'select2d',
                'lasso2d',
                'zoomIn2d',
                'zoomOut2d',
                'autoScale2d',
                'resetScale2d',
                'hoverClosestCartesian',
                'hoverCompareCartesian',
                'zoom3d',
                'pan3d',
                'resetCameraDefault3d',
                'resetCameraLastSave3d',
                'hoverClosest3d',
                'orbitRotation',
                'tableRotation',
                'zoomInGeo',
                'zoomOutGeo',
                'resetGeo',
                'hoverClosestGeo',
                'toImage',
                'sendDataToCloud',
                'hoverClosestGl2d',
                'hoverClosestPie',
                'toggleHover',
                'resetViews',
                'toggleSpikelines',
                'resetViewMapbox'
            ]
        };

        return { plotData, plotLayout, plotConfig, min, max };
    }

    public generateSidebar(): Sidebar {
        return new Sidebar([]);
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
