import Widget from './Widget.js';
import WidgetConfig from './WidgetConfig.js';
import { Data, Attribute } from '../data/Data.js';
import Row from '../data/Row.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Plot from 'react-plotly.js';

export default class BarChart extends Widget {
    public generateSidebar(): Sidebar {
        return new Sidebar([]);
    }
    public render(): JSX.Element {
        const grouping = 'month';
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        const timeColIdx = this.panel.dataFilterer.getColumnIndex(Attribute.time);
        const dateColIdx = this.panel.dataFilterer.getColumnIndex(Attribute.actualDate);
        const [data, length]: [any[][], number] = this.panel.dataFilterer.getData();
        const dataSubset: any[][] = data.slice(0, length);
        const groupIndices = Array(12)
            .fill(0)
            .map(() => []);
        for (let i = 0; i < dataSubset.length; i++) {
            const time = dataSubset[i][timeColIdx];
            const date = dataSubset[i][dateColIdx];
            const datetime = new Date(date + ' ' + time);
            const group = datetime.getMonth();
            groupIndices[group].push(i);
        }
        const speciesMeta = this.panel.dataFilterer.getDataStats().getSpeciesMeta();
        const traces = speciesMeta.speciesList().map((species, idx) => {
            const speciesColIdx = this.panel.dataFilterer.getColumnIndex(
                Attribute.speciesLatinName
            );
            const counts = groupIndices.map((indices) =>
                indices.reduce((a, b) => (a + (dataSubset[b][speciesColIdx] == species) ? 1 : 0), 0)
            );
            return {
                type: 'bar',
                x: months,
                y: counts,
                marker: {
                    color: Array(12).fill(this.config.traceColor[idx])
                },
                name: speciesMeta.formattedName(species)
            };
        });
        const plotData = traces;
        const plotLayout = {
            width: 400,
            height: 210,
            title: {
                text: 'Bar Chart',
                y: 0.85
            },
            margin: {
                l: 30,
                r: 30,
                b: 50,
                t: 65
            }
        };
        const plotConfig = {
            //staticPlot: true,
            modeBarButtonsToRemove: ['zoomIn2d', 'zoomOut2d']
        };
        return <Plot data={plotData} layout={plotLayout} config={plotConfig} />;
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
