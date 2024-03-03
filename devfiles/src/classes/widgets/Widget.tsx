import InputOption from '../options/InputOption.js';
import Panel from '../Panel.js';
import Sidebar from '../Sidebar.js';
import { v4 as uuidv4 } from 'uuid';

export default abstract class Widget {
    public name: string;
    protected panel: Panel;
    protected options: InputOption[];
    public uuid = uuidv4();
    public refresh: () => void = () => {};
    // to be implemented in specific widgets
    public abstract updateTraceOptions(): void;

    public constructor(panel: Panel) {
        this.panel = panel;
        this.options = [];
        this.name = 'Widget ' + (panel.getLifetimeWidgetsCreated() + 1);
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

    public abstract renderFullscreen(): JSX.Element;

    public abstract delete(): void;
}
