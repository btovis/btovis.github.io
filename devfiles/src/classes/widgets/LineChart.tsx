import Widget from './Widget.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Plot from 'react-plotly.js';
import { DayGrouping, YGrouping } from './Grouping.js';
import InputOption from '../options/InputOption.tsx';
import ColorOption from '../options/ColorOption.tsx';
import PanelNameInput from '../options/PanelNameInput.tsx';

export default class LineChart extends Widget {
    // to be implemented in the following com
    //const data = this.panel.dataFilterer.getData();
    //data process to a list of traces

    // a few fields that affects rendering of the widgets, aka widget options & config
    private numTraces = 2; // to be implemented to fit number of species
    private colors: Array<InputOption> = [];

    private generateColorOptions(): void {
        for (let i = 0; i < this.numTraces; i++) {
            this.colors.push(
                new ColorOption(this.panel, 'color of trace ' + i.toString(), '#00FFFF')
                //new PanelNameInput(this.panel, "Panel Color", "00FFFF")
            );
        }
    }

    // constructor
    public constructor(panel: Panel, config: WidgetConfig) {
        super(panel, config);
        this.generateColorOptions();
    }

    public generateSidebar(): Sidebar {
        this.options = this.colors;
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
