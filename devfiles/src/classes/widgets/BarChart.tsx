import Widget from './Widget.js';
import WidgetConfig from './WidgetConfig.js';
import { Data, Attribute } from '../data/Data.js';
import Row from '../data/Row.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Plot from 'react-plotly.js';
import SetElement from '../data/setutils/SetElement.js';

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
        const dateColIdx = this.panel.dataFilterer.getColumnIndex(Attribute.actualDate);
        const [data, length]: [any[][], number] = this.panel.dataFilterer.getData();
        const speciesMeta = this.panel.dataFilterer.getDataStats().getSpeciesMeta();
        const speciesColIdx = this.panel.dataFilterer.getColumnIndex(Attribute.speciesLatinName);

        // this maps species to a map of months to counts
        // in other words to an array of counts
        // so it is something like [species:[month:count]]
        const map = new Map<SetElement, number[]>();
        const speciesList = speciesMeta.speciesList(),
            speciesListLen = speciesList.length;
        speciesList.forEach((species) => map.set(species, new Array(12).fill(0)));
        for (let i = 0; i < length; i++) {
            const row = data[i];
            const date = row[dateColIdx];
            const month = date.slice(5, 7) - 1; // (5-7 means take mm from yyyy-mm-...)
            const speciesForRow = row[speciesColIdx];
            const arr = map.get(speciesForRow);
            ++arr[month];
        }

        const traces = new Array(speciesListLen),
            iterator = map.entries();
        for (let idx = 0; idx < speciesListLen; idx++) {
            const [species, counts] = iterator.next().value;
            traces[idx] = {
                type: 'bar',
                x: months,
                y: counts,
                marker: {
                    color: Array(12).fill(this.config.traceColor[idx])
                },
                name: speciesMeta.formattedName(species)
            };
        }
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
