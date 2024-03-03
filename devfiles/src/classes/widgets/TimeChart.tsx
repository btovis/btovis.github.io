import Panel from '../Panel';
import Plot from 'react-plotly.js';
import Sidebar from '../Sidebar';
import Modal from 'react-bootstrap/Modal';
import MutuallyExclusiveSelector from '../options/MutuallyExclusiveSelector';
import { Grouping, YGrouping } from './Grouping';
import Widget from './Widget';
import ColorOption from '../options/ColorOption.js';

// Covers bar chart, line chart, stacked line chart.
export default abstract class TimeChart extends Widget {
    xAxisSelector: MutuallyExclusiveSelector;
    yAxisSelector: MutuallyExclusiveSelector;
    // This is declared here only because it isn't working when it's declared only in LineChart class
    public colorOption: ColorOption;

    static readonly buttonsToRemove = [
        'zoom2d',
        'pan2d',
        'select2d',
        'lasso2d',
        'zoomIn2d',
        'zoomOut2d',
        'autoScale2d',
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
        'sendDataToCloud',
        'hoverClosestGl2d',
        'hoverClosestPie',
        'toggleHover',
        'resetViews',
        'toggleSpikelines',
        'resetViewMapbox'
    ];

    // Subclasses implement these methods for specific chart types.
    public abstract chartSpecificLayout(numTraces: number): Array<{ [key: string]: unknown }>;
    public abstract chartType(): string;
    public abstract timeRangeGroupings();
    public abstract generateChartSpecificOptions(numTraces: number): void;
    public abstract bindOptions(): void;

    // Initialize grouping
    public grouping: Grouping;

    private fullscreenModalShown: boolean = false;

    public constructor(panel: Panel) {
        super(panel);
        this.initOptions();
    }

    // Initialize & Update the 'grouping' field of Timechart
    public updateGrouping(): void {
        // Get the selected groupings for x and y.
        const yGrouping = this.yAxisSelector.selected;
        const [groupingCls] = this.timeRangeGroupings().filter(
            (grouping: typeof Grouping) => grouping.name === this.xAxisSelector.selected
        );
        // Change Value for 'grouping'
        this.grouping = new groupingCls(this.panel.dataFilterer, yGrouping);
    }
    public async initOptions(): Promise<void> {
        // The filtering is slow so this is made async to reduce user wait time.
        const filter = this.panel.dataFilterer;
        const groupings = this.timeRangeGroupings()
            .filter((grouping) => {
                // Manually filter groupings of x axis to prevent too many x values.
                const groupingInstance = new grouping(filter, YGrouping.Species);
                const [data, length] = filter.getData();
                const xValues = new Set();
                for (let i = 0; i < length; i++) {
                    const row = data[i];
                    const x = groupingInstance.selectX(row);
                    xValues.add(x);
                    if (xValues.size > Grouping.maxXValues) {
                        return false;
                    }
                }
                return true;
            })
            .map((grouping: typeof Grouping) => grouping.name);
        // Mutex selector for time (or property) grouping along the x axis.
        this.xAxisSelector = new MutuallyExclusiveSelector(
            this.panel,
            `Time Grouping for ${this.chartType()} Widget`,
            groupings
        );
        // Mutex selector for grouping along the y axis (species, species group, etc).
        this.yAxisSelector = new MutuallyExclusiveSelector(
            this.panel,
            `Count Grouping for ${this.chartType()} Widget`,
            Object.values(YGrouping)
        );

        // Refresh widgets when options are changed. Also update Trace related Options and reflect on sidebar.
        this.xAxisSelector.useSearchBar = false;
        this.yAxisSelector.useSearchBar = false;
        // Refresh widgets when options are change.
        this.xAxisSelector.extendedCallbacks.push(() => this.optionsCallback());
        this.yAxisSelector.extendedCallbacks.push(() => this.optionsCallback());

        // Initialize value for grouping
        this.updateGrouping();
        // Generate Trace Options (currently only color)
        this.generateChartSpecificOptions(this.grouping.numTraces());
        // bind ColorOptions
        this.bindOptions();
    }

    protected optionsCallback() {
        this.updateGrouping();
        this.updateTraceOptions();
        this.refresh();
    }

    public generateSidebar(): Sidebar {
        return new Sidebar(this.options);
    }

    public renderFullscreen(): JSX.Element {
        const scale = 0.9;
        const { innerWidth: innerWidth, innerHeight: innerHeight } = window;
        return (
            <Modal
                className='widget-fullscreen-modal'
                onHide={() => this.hideFullscreen()}
                show={true}
                fullscreen={true}
            >
                <Modal.Header closeButton></Modal.Header>
                <Modal.Body>
                    {this.render(Math.floor(innerWidth * scale), Math.floor(innerHeight * scale))}
                </Modal.Body>
            </Modal>
        );
    }

    public render(width: number = 500, height: number = 300): JSX.Element {
        const plotLayout = {
            width: width,
            height: height,
            font: {
                size: 16
            }
        };
        // Add specific layout to each chart.
        const { traces, layout } = this.grouping.getChart(
            this.chartSpecificLayout(this.grouping.numTraces()),
            plotLayout
        );
        const plotConfig = {
            modeBarButtonsToRemove: TimeChart.buttonsToRemove,
            editable: true,
            staticplot: true,
            displaylogo: false
        };
        let fullscreenDisplay = <></>;
        if (this.fullscreenModalShown) {
            // Avoid re-rendering the fullscreen modal when it's already shown.
            this.fullscreenModalShown = false;
            fullscreenDisplay = this.renderFullscreen();
            this.fullscreenModalShown = true;
        }
        return (
            <div>
                {fullscreenDisplay}
                <Plot data={traces} layout={layout} config={plotConfig} />
            </div>
        );
    }
    public delete(): void {}
    public showFullscreen() {
        this.fullscreenModalShown = true;
        this.refresh();
    }

    private hideFullscreen() {
        this.fullscreenModalShown = false;
        this.refresh();
    }
}
