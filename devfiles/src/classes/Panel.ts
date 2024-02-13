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
        this.widgets = [new BarChart(manager.getData(), testConfig)];
    }

    public displaySidebar(): void {}
    public generateSidebar(): Sidebar {
        this.sidebar = new Sidebar();
        return this.sidebar;
    }

    public render(): void {}

    public addWidget(): void {}

    public renderWidgets(): void {}

    public getWidgets(): Widget[] {
        return this.widgets;
    }
}
