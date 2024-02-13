import PageManager from './PageManager';
import Sidebar from './Sidebar';
import BarChart from './widgets/BarChart';
import Widget from './widgets/Widget';
import WidgetConfig from './widgets/WidgetConfig';

export default class Panel {
    public widgets: Widget[];

    public constructor(manager: PageManager) {
        const testConfig = new WidgetConfig();
        this.widgets = [new BarChart(manager.getData(), testConfig)];
    }

    public displaySidebar(): void {}

    /*
     * Iterates each widget and adds all its options together
     */
    public generateSidebar(): Sidebar {
        const options = this.widgets
            .map((widget) => widget.generateSidebar().options)
            .reduce((acc, a) => acc.concat(a), []);

        return new Sidebar(options);
    }

    public render(): void {}

    public addWidget(): void {}

    public renderWidgets(): void {}

    public getWidgets(): Widget[] {
        return this.widgets;
    }
}
