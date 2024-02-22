import PageManager from './PageManager';
import Sidebar from './Sidebar';
import Geographic from './options/Geographic';
import NumericInput from './options/NumericInput';
import Selector from './options/Selector';
import PanelNameInput from './options/PanelNameInput';
import TimeRange from './options/TimeRange';
import BarChart from './widgets/BarChart';
import Widget from './widgets/Widget';
import WidgetConfig from './widgets/WidgetConfig';
import DataFilterer from './data/DataFilterer';
import { v4 as uuidv4 } from 'uuid';

export default class Panel {
    //TODO: Consider protecting with private
    //Mutator methods below do more than touch this list
    //Someone's editing widgetcomp now
    public widgets: Widget[];

    private baseSidebar: Sidebar;

    public refresh: () => void = () => {};
    public pageManager: PageManager;

    private nameInput: PanelNameInput;

    public dataFilterer: DataFilterer;
    public readonly uuid: number;

    public constructor(pageManager: PageManager) {
        this.uuid = uuidv4();
        this.pageManager = pageManager;
        this.nameInput = new PanelNameInput(
            this,
            'Panel Name',
            'Panel ' + ((this.pageManager.panels?.length || 0) + 1)
        );
        this.dataFilterer = new DataFilterer(pageManager.getData());
        const testConfig = new WidgetConfig();
        this.widgets = [new BarChart(this, testConfig)];
        this.baseSidebar = new Sidebar([
            this.nameInput, //Panel name. Identity filter
            new Geographic(this, 'Region'), //Positional filter
            new TimeRange(this, 'Time Range'), //Time range for timestamp filtering
            new Selector(this, 'Species', []), //Species. TODO: May need special option
            new NumericInput(this, 'Minimum Probability'),
            new Selector(this, 'Warnings', []),
            new Selector(this, 'Call Type', []),
            new Selector(this, 'Project', []),
            new Selector(this, 'Classifier Name', []),
            new Selector(this, 'Batch Name', []),
            new Selector(this, 'User ID', [])
        ]);
    }

    public getName(): string {
        return this.nameInput.value();
    }

    /*
     * This is handled by the React Component
     * /
    //public displaySidebar(): void {}

    /**
     * Iterates each widget and adds all its options together
     */
    public generateSidebar(): Sidebar {
        //Panels need their own sidebar, as they hold filters.
        //InputOption sidebars DO NOT contain filters, only widget-specific
        //options.

        const options = this.widgets
            .map((widget) => widget.generateSidebar().options)
            .reduce((acc, a) => acc.concat(a), []);

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
