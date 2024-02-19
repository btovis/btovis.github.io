import DataFilterer from '../data/DataFilterer.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import WidgetConfig from './WidgetConfig.js';

export default abstract class Widget {
    protected data: DataFilterer;
    protected config: WidgetConfig;

    public constructor(data: DataFilterer, config: WidgetConfig) {
        this.data = data;
        this.config = config;
    }

    public displaySidebar() {}

    /**
     * Generates the Sidebar object
     */
    public abstract generateSidebar(): Sidebar;

    /**
     * Computes the JSX.Element object to be displayed by the
     * Widget component in ui
     */
    public abstract render(): JSX.Element;

    public abstract delete(): void;

    public abstract clone(): Widget;

    public abstract export(fileType: ExportFileType): void;
}
