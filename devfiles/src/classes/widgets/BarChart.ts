import Widget from './Widget.js'
import WidgetConfig from './WidgetConfig.js'
import Data from '../data/Data.js'
import Sidebar from '../Sidebar.js'
import ExportFileType from './ExportFileType.js'

export default class BarChart extends Widget {
    public generate_sidebar(): Sidebar {
        throw new Error('Method not implemented.');
    }
    public render(): JSX.Element {
        throw new Error('Method not implemented.');
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
