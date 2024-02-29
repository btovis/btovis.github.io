import Widget from './Widget.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Plot from 'react-plotly.js';
import { DayGrouping, YGrouping } from './Grouping.js';
import InputOption from '../options/InputOption.tsx';
import ColorOption from '../options/ColorOption.tsx';
import Panel from '../Panel.ts';
import NumericInput from '../options/NumericInput.tsx';
import DropMenuSelector from '../options/DropMenuSelector.tsx';
import { LineChartGrouping } from './XFieldGrouping.ts';
import WidgetConfig from './WidgetConfig.ts';

export default class LineChart extends Widget {
    private grouping = new DayGrouping(this.panel.dataFilterer, YGrouping.SpeciesGroup);

    private buildOptions(): void {
        //generate x-axis group level
        const enumStrings = Object.keys(LineChartGrouping).filter((v) => isNaN(Number(v)));

        // a few fields that affects rendering config
        const numTraces = this.grouping.numTraces();
        const colorsOptions: Array<ColorOption> = [];
        const yTick: NumericInput = new NumericInput(this.panel, 'ytick', 0, 10, 1); // Numeric Input is not yet implemented
        const groupLevel: DropMenuSelector = new DropMenuSelector(
            this.panel,
            'group lebel',
            enumStrings
        );

        //generate color options
        for (let i = 0; i < numTraces; i++) {
            colorsOptions.push(
                new ColorOption(this.panel, 'color of trace ' + i.toString(), '#00FFFF')
                //new PanelNameInput(this.panel, "Panel Color", "00FFFF")
            );
        }

        //add everything to options
        this.options = colorsOptions;
        this.options.push(groupLevel);
    }

    // constructor
    public constructor(panel: Panel, config: WidgetConfig) {
        super(panel, config);
        this.buildOptions();
    }

    public generateSidebar(): Sidebar {
        return new Sidebar(this.options);
    }

    private generateTraceConfig(): Array<{ [key: string]: any }> {
        const traceConfigs: Array<{ [key: string]: any }> = [];
        for (let i = 0; i < this.grouping.numTraces(); i++) {
            const singleTraceConfig: { [key: string]: any } = {};
            singleTraceConfig.type = 'scatter';

            const lineConfig: { [key: string]: any } = {};
            lineConfig.color = this.options[i].value();
            singleTraceConfig.line = lineConfig;
            traceConfigs.push(singleTraceConfig);
        }
        return traceConfigs;
    }

    public render(): JSX.Element {
        const plotLayout = {
            width: 400,
            height: 210,
            title: {
                text: 'Line Chart'
            },
            margin: {
                l: 30,
                r: 30,
                b: 50,
                t: 65
            }
        };
        const { traces, layout } = this.grouping.getChart(this.generateTraceConfig(), plotLayout);
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
