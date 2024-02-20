import Widget from './Widget.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Selector from '../options/Selector.js';
import DataFilterer from '../data/DataFilterer.js';
import WidgetConfig from './WidgetConfig.js';
import Panel from '../Panel.js';
import { Data } from '../data/Data.js';

/**
 * This will take in a set of input columns, then deduplicate rows
 * (while counting the number of duplicates) into a table.
 *
 * Sort by top count
 */
export default class TableWidget extends Widget {
    private limit: number = 0;
    private tableEntries: Map<string, number> = new Map();

    //We might need panel in everything
    public constructor(panel: Panel, config: WidgetConfig) {
        super(panel.dataFilterer, config);
        this.options = [new Selector(panel, 'Table Columns', panel.dataFilterer.getColumns())];
    }

    public generateSidebar(): Sidebar {
        console.log(this.data.getData());
        //Re-calculate table entries when this is called based on the options
        //Hardcode and assume columns to be 6,10
        for (let i = 0; i < this.data.getData()[1]; i++) {
            const row = this.data.getData()[0][i];
            const key = row[6] + ',' + row[10];
            let count = this.tableEntries.get(key);
            if (count == null) count = 0;
            this.tableEntries[key] = count + 1;
        }
        return new Sidebar(this.options);
    }
    public render(): JSX.Element {
        return (
            <table>
                <thead>
                    <tr>
                        {
                            //this.options[0]
                        }
                        <td>Count</td>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        );
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
