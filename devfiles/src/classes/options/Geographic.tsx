import { Query } from '../query/Query';
import InputOption from './InputOption';
import Panel from '../Panel';
import Plot from 'react-plotly.js';
import { Attribute } from '../data/Data';
import RangeQuery from '../query/RangeQuery';
import { v4 as uuidv4 } from 'uuid';
import PositionMeta from '../queryMeta/PositionMeta';

export default class Geographic extends InputOption {
    private globalLatDiameter = 0;
    private globalLonDiameter = 0;

    private minLat = -Infinity;
    private maxLat = Infinity;
    private minLon = -Infinity;
    private maxLon = Infinity;

    public constructor(panel: Panel, name: string, template: Geographic = undefined) {
        super(panel, name);

        //map zoom settings
        this.globalLatDiameter = this.posMeta().globalMax[0] - this.posMeta().globalMin[0];
        this.globalLonDiameter = this.posMeta().globalMax[1] - this.posMeta().globalMin[1];

        if (template !== undefined) {
            this.minLat = template.minLat;
            this.minLon = template.minLon;
            this.maxLat = template.maxLat;
            this.maxLon = template.maxLon;
            this.accordionOpen = template.accordionOpen;
        }
    }

    private posMeta(): PositionMeta {
        return this.panel.dataFilterer.getDataStats().getPositionMeta();
    }

    public render(): JSX.Element {
        const { plotData, plotLayout, plotConfig } = this.generatePlotlySettings();
        return this.generateAccordion(
            <>
                <div style={{ display: 'flex' }}>
                    <input
                        style={{ marginLeft: '10px' }}
                        key={uuidv4()}
                        id={this.uuid + '-select-all'}
                        onChange={(event) => {
                            this.callback(
                                event.currentTarget.checked
                                    ? {
                                          pointCount: this.posMeta().uniquePositions.size,
                                          bounds: [
                                              [0, 0],
                                              [0, 0]
                                          ]
                                      }
                                    : {
                                          pointCount: 0,
                                          bounds: [
                                              [-Infinity, -Infinity],
                                              [-Infinity, -Infinity]
                                          ]
                                      }
                            );
                            this.refreshComponent();
                        }}
                        onClick={(event) => event.stopPropagation()}
                        checked={this.maxLat === Infinity}
                        className='form-check-input'
                        type='checkbox'
                    />
                    <label
                        className='form-check-label selectorLabel select-all-label fw-bold'
                        htmlFor={this.uuid + '-select-all'}
                    >
                        Select All
                    </label>
                </div>
                <div
                    id='panel-map-filter'
                    style={{
                        height: plotLayout.height,
                        width: plotLayout.width,
                        overflowY: 'hidden'
                    }}
                >
                    {/* If the accordion is closed, cheat and do not render */}
                    {this.accordionOpen ? (
                        <Plot
                            onSelected={(event) => {
                                //#168, this variable is just undefined if you click
                                if (event === undefined) return;
                                this.callback({
                                    pointCount: event.points.length,
                                    bounds: event.range.mapbox
                                });
                            }}
                            data={plotData}
                            layout={plotLayout}
                            config={plotConfig}
                        />
                    ) : (
                        <></>
                    )}
                    If you can see this, click the title twice to re-render the map.
                </div>
            </>,
            false
        );
    }

    protected checkDefault(): boolean {
        return this.minLat === -Infinity;
    }

    /**
     * Not the same as the MapWidget one, as it operates on global data,
     * NOT filtered data
     */
    public generatePlotlySettings() {
        const maxBound = Math.max(this.globalLatDiameter, this.globalLonDiameter) * 600;
        const zoom = 11.5 - Math.log(maxBound);

        const lat = [...this.posMeta().uniquePositions].map((c) => parseFloat(c.split('\0')[0]));
        const lon = [...this.posMeta().uniquePositions].map((c) => parseFloat(c.split('\0')[1]));
        const col = lat.map((l, ind) => {
            const lo = lon[ind];
            if (
                Geographic.isInBound(l, this.minLat, this.maxLat) &&
                Geographic.isInBound(lo, this.minLon, this.maxLon)
            )
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
                style: 'open-street-map',
                center: {
                    lat:
                        this.posMeta().globalMin[0] +
                        (this.posMeta().globalMax[0] - this.posMeta().globalMin[0]) / 2,
                    lon:
                        this.posMeta().globalMin[1] +
                        (this.posMeta().globalMax[1] - this.posMeta().globalMin[1]) / 2
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
            modeBarButtonsToRemove: ['toImage', 'lasso2d'], //Block lasso as I can't support points now
            displaylogo: false
        };

        return { plotData, plotLayout, plotConfig };
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
    public callback(newValue: { pointCount: number; bounds: [number, number][] }): void {
        //Iterate and collect the points
        if (newValue.pointCount === this.posMeta().uniquePositions.size) {
            this.minLat = -Infinity;
            this.maxLat = Infinity;
            this.minLon = -Infinity;
            this.maxLon = Infinity;
        } else {
            this.minLon = newValue.bounds[1][0];
            this.maxLon = newValue.bounds[0][0];
            this.minLat = newValue.bounds[1][1];
            this.maxLat = newValue.bounds[0][1];
        }

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
