import Widget from './Widget.js';
import WidgetConfig from './WidgetConfig.js';
import { Data } from '../data/Data.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';

export default class DebugWidget extends Widget {
    public generateSidebar(): Sidebar {
        throw new Error('Method not implemented.');
    }
    public render(): JSX.Element {
        console.log('DebugWidget instantiated. Row count:' + this.data.getData()[1]);
        return (
            <>
                <p>Row count: {this.data.getData()[1]}</p>
            </>
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
