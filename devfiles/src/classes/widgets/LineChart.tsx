import Widget from './Widget.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Plot from 'react-plotly.js';
<<<<<<< HEAD
import { DayGrouping, YGrouping } from './Grouping.js';
import InputOption from '../options/InputOption.tsx';
=======
>>>>>>> 0b58cce (add dropdown menu for enums)
import ColorOption from '../options/ColorOption.tsx';
import Panel from '../Panel.ts';
import NumericInput from '../options/NumericInput.tsx';
import DropMenuSelector from '../options/DropMenuSelector.tsx';
import { LineChartGrouping } from './XFieldGrouping.ts';

export default class LineChart extends Widget {
    // to be implemented in the following
    //const data = this.panel.dataFilterer.getData();
    //data process to a list of traces

    // a few fields that affects rendering of the widgets, widget options & config
    private numTraces = 2; // to be implemented to fit number of traces in data
    private colorsOptions: Array<ColorOption> = [];
    private yTick: NumericInput; // Numeric Input is not yet implemented
    private groupLevel: DropMenuSelector;

    private generateOptions(): void {
        //generate color options
        for (let i = 0; i < this.numTraces; i++) {
            this.colorsOptions.push(
                new ColorOption(this.panel, 'color of trace ' + i.toString(), '#00FFFF')
                //new PanelNameInput(this.panel, "Panel Color", "00FFFF")
            );
        }
        //generate x-axis group level
        const enumStrings = Object.keys(LineChartGrouping).filter((v) => isNaN(Number(v)));
        this.groupLevel = new DropMenuSelector(this.panel, 'group lebel', enumStrings);

        //add everything to options
        this.options = this.colorsOptions;
        this.options.push(this.groupLevel);
    }

    // constructor
    public constructor(panel: Panel, config: WidgetConfig) {
        super(panel, config);
        this.generateOptions();
    }

    public generateSidebar(): Sidebar {
        return new Sidebar(this.options);
    }
    public render(): JSX.Element {
        const grouping = new DayGrouping(this.panel.dataFilterer, YGrouping.SpeciesGroup);
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
        const { traces, layout } = grouping.getChart(
            {
                type: 'scatter'
            },
            plotLayout
        );
        const plotConfig = {
            //staticPlot: true,
            modeBarButtonsToRemove: ['zoomIn2d', 'zoomOut2d']
        };
<<<<<<< HEAD
        return <Plot data={traces} layout={layout} config={plotConfig} />;
=======

        //debug statement, delete anytime
        console.log(this.groupLevel.value());
        return <Plot data={plotData} layout={plotLayout} config={plotConfig} />;
>>>>>>> 0b58cce (add dropdown menu for enums)
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
