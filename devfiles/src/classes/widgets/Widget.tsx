import DataFilterer from '../data/DataFilterer.js';
import InputOption from '../options/InputOption.js';
import Panel from '../Panel.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import WidgetConfig from './WidgetConfig.js';

export default abstract class Widget {
    protected panel: Panel;
    protected options: InputOption[];
    protected config: WidgetConfig;

    public constructor(panel: Panel, config: WidgetConfig) {
        this.panel = panel;
        this.config = config;
        this.options = [];
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
