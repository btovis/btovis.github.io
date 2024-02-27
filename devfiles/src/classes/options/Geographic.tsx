import { Accordion } from 'react-bootstrap';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import Panel from '../Panel';
import Plot from 'react-plotly.js';
import MapWidget from '../widgets/MapWidget';
import { Attribute } from '../data/Data';
import PageManager from '../PageManager';
import SetQueryArrayReject from '../query/SetQueryArrayReject';
import RangeQuery from '../query/RangeQuery';

export default class Geographic extends InputOption {
    private accordionOpen = false;

    private revision = 0;
    private minLat = -Infinity;
    private maxLat = Infinity;
    private minLon = -Infinity;
    private maxLon = Infinity;

    public constructor(panel: Panel, name: string, template: Geographic = undefined) {
        super(panel, name);

        if (template !== undefined) {
            this.minLat = template.minLat;
            this.minLon = template.minLon;
            this.maxLat = template.maxLat;
            this.maxLon = template.maxLon;
            this.accordionOpen = template.accordionOpen;
        }
    }

    public render(): JSX.Element {
        const { plotData, plotLayout, plotConfig } = Geographic.generatePlotlySettings(
            this.panel,
            this.minLat,
            this.maxLat,
            this.minLon,
            this.maxLon
        );

        return (
            <Accordion
                onSelect={(eventKey) => {
                    this.accordionOpen = typeof eventKey === 'string';
                }}
                defaultActiveKey={this.accordionOpen ? '0' : []}
            >
                <Accordion.Item eventKey='0'>
                    <Accordion.Header>
                        <span>
                            <strong>{this.name}</strong>
                        </span>
                    </Accordion.Header>
                    <Accordion.Body>
                        <div id='panel-map-filter' style={{}}>
                            {/* A hack fixes a weird bug:
                                https://github.com/plotly/plotly.js/issues/3642#issuecomment-476130399
                                Without the hack, the map will not center properly initially.
                                (document.querySelector('#panel-map-filter [data-title="Zoom out"]') as any))
                                can be used to select the zoomout button and invoke a click.

                                Probably not worth it.
                            */}
                            <Plot
                                onSelected={(event) => {
                                    this.revision++;
                                    this.callback(event.range.mapbox);
                                }}
                                revision={this.revision}
                                data={plotData}
                                layout={plotLayout}
                                config={plotConfig}
                            />
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        );
    }

    /**
     * Not the same as the MapWidget one, as it operates on global data,
     * NOT filtered data
     */
    public static generatePlotlySettings(
        panel: Panel,
        minLat: number,
        maxLat: number,
        minLon: number,
        maxLon: number
    ) {
        const coords: Set<string> = new Set();
        const min = [+Infinity, +Infinity];
        const max = [-Infinity, -Infinity];

        const latCol = panel.dataFilterer.getColumnIndex(Attribute.latitude);
        const lonCol = panel.dataFilterer.getColumnIndex(Attribute.longitude);
        for (let i = 0; i < PageManager.get().data.readDatabase().length; i++) {
            const row = PageManager.get().data.readDatabase()[i];
            coords.add(row[latCol].toString() + '\0' + row[lonCol].toString());
            min[0] = Math.min(min[0], row[latCol] as number);
            min[1] = Math.min(min[1], row[lonCol] as number);
            max[0] = Math.max(max[0], row[latCol] as number);
            max[1] = Math.max(max[1], row[lonCol] as number);
        }

        //map zoom settings
        const latBound = max[0] - min[0];
        const lonBound = max[0] - min[0];
        const maxBound = Math.max(latBound, lonBound) * 600;
        const zoom = 11.5 - Math.log(maxBound);

        const lat = [...coords].map((c) => parseFloat(c.split('\0')[0]));
        const lon = [...coords].map((c) => parseFloat(c.split('\0')[1]));
        const col = lat.map((l, ind) => {
            const lo = lon[ind];
            if (Geographic.isInBound(l, minLat, maxLat) && Geographic.isInBound(lo, minLon, maxLon))
                return 'green';
            else return 'red';
        });
        //plot data for plotly
        const plotData = [
            {
                type: 'scattermapbox',
                lat: lat,
                lon: lon,
                mode: 'markers',
                marker: {
                    size: 7,
                    color: col
                }
            }
        ];

        //plot layout for plotly
        const plotLayout = {
            width: 210,
            height: 210,
            dragmode: 'select',
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
            modeBarButtonsToRemove: ['toImage', 'lasso2d'] //Block lasso as I can't support points now
        };

        return { plotData, plotLayout, plotConfig, coords };
    }

    private static isInBound(val: number, low: number, high: number): boolean {
        if (low < high) return val >= low && val <= high;

        return val >= high && val <= low;
    }

    /**
     * this.panel.recalculateFilters(this) will tell panel to execute the
     * filter
     *
     * @param newValue In this case, this is the rectangle box drawn by the user
     */
    public callback(newValue: [number, number][]): void {
        //Iterate and collect the points
        this.minLon = newValue[1][0];
        this.maxLon = newValue[0][0];
        this.minLat = newValue[1][1];
        this.maxLat = newValue[0][1];

        //Ask the panel to re-calculate its filters
        this.panel.recalculateFilters(this);

        //Refresh to update the associated widget/panel
        //Potential to optimise here
        this.panel.refreshComponent();
        this.panel.refreshWidgets();
        //Refresh this inputoption
        this.refreshComponent();
    }

    /**
     * @returns Query object to be applied by the panel in recalculateFilters(this)
     */
    public query(): { compound: boolean; queries: Query[] } {
        return {
            compound: true,
            queries: [
                new RangeQuery(this.panel.dataFilterer.getColumnIndex(Attribute.latitude)).query(
                    this.minLat,
                    this.maxLat
                ),
                new RangeQuery(this.panel.dataFilterer.getColumnIndex(Attribute.longitude)).query(
                    this.minLon,
                    this.maxLon
                )
            ]
        };
    }
}
