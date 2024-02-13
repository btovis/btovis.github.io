import PageManager from './PageManager';
import Sidebar from './Sidebar';
import BarChart from './widgets/BarChart';
import Widget from './widgets/Widget';
import WidgetConfig from './widgets/WidgetConfig';

export default class Panel {
    public widgets: Widget[];
    public sidebar: Sidebar;

    public constructor(manager: PageManager) {
        const testConfig = new WidgetConfig();
        this.widgets = [new BarChart(manager.get_data(), testConfig)];
    }

    public display_sidebar(): void {}
    public generate_sidebar(): Sidebar {
        this.sidebar = new Sidebar();
        return this.sidebar;
    }

    public render(): void {}

    public add_widget(): void {}

    public render_widgets(): void {}

    public get_widgets(): Widget[] {
        return this.widgets;
    }
}
