import PageManager from './PageManager';
import Sidebar from './Sidebar';
import Geographic from './options/Geographic';
import NumericInput from './options/NumericInput';
import Selector from './options/Selector';
import TextInput from './options/TextInput';
import TimeRange from './options/TimeRange';
import BarChart from './widgets/BarChart';
import Widget from './widgets/Widget';
import WidgetConfig from './widgets/WidgetConfig';

export default class Panel {
    //TODO: Consider protecting with private
    //Mutator methods below do more than touch this list
    //Someone's editing widgetcomp now
    public widgets: Widget[];

    //Panels need their own sidebar, as they hold filters.
    //InputOption sidebars DO NOT contain filters, only widget-specific
    //options.
    private baseSidebar: Sidebar;
    private nameInput: TextInput;

    public constructor(manager: PageManager) {
        this.nameInput = new TextInput('Panel Name');
        this.nameInput.callback('Default Panel');
        const testConfig = new WidgetConfig();
        this.widgets = [new BarChart(manager.getData(), testConfig)];
        this.baseSidebar = new Sidebar([
            this.nameInput, //Panel name. Identity filter
            new Geographic('Region'), //Positional filter
            new TimeRange('Time Range'), //Time range for timestamp filtering
            new Selector('Species'), //Species. TODO: May need special option
            new NumericInput('Minimum Probability'),
            new Selector('Warnings'),
            new Selector('Call Type'),
            new Selector('Project'),
            new Selector('Classifier Name'),
            new Selector('Batch Name'),
            new Selector('User ID')
        ]);
    }

    public getName(): string {
        return this.nameInput.value();
    }

    /*
     * This is handled by the React Component
     * /
    //public displaySidebar(): void {}

    /*
     * Iterates each widget and adds all its options together
     */
    public generateSidebar(): Sidebar {
        const options = []; //TODO HANDLE WIDGET OPTIONS WHEN READY.
        // const options = this.widgets
        //     .map((widget) => widget.generateSidebar().options)
        //     .reduce((acc, a) => acc.concat(a), []);

        return new Sidebar(this.baseSidebar.options.concat(options));
    }

    public render(): void {}

    public addWidget(widget: Widget): void {
        this.widgets.push(widget);
    }

    public removeWidget(widgetIdx: number) {
        this.widgets[widgetIdx].delete(); //Call child method
        this.widgets.splice(widgetIdx, 1); //mutable delete
    }

    /*
     * This logic should be handled in Widgets, and invoked by WidgetComp.
     * An additional method in panels doesn't quite do much
     */
    //public renderWidgets(): void {}

    public getWidgets(): Widget[] {
        return this.widgets;
    }

    public getWidget(widgetIdx: number): Widget {
        if (widgetIdx < 0 || widgetIdx >= this.widgets.length)
            throw new Error('Invalid widget id ' + widgetIdx + ' for getWidget');
        return this.widgets[widgetIdx];
    }
}
