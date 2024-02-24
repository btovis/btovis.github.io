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
import InputOption from './options/InputOption';
import { Attribute } from './data/Data';

export default class Panel {
    //TODO: Consider protecting with private
    //Mutator methods below do more than touch this list
    //Someone's editing widgetcomp now
    public widgets: Widget[];

    public refreshComponent: () => void = () => {};
    public pageManager: PageManager;

    private readonly nameInput: PanelNameInput;
    private fileSelector: Selector;
    private warningsSelector: Selector;

    public dataFilterer: DataFilterer;
    public readonly uuid: number;

    public constructor(pageManager: PageManager) {
        this.uuid = uuidv4();
        this.pageManager = pageManager;
        this.dataFilterer = new DataFilterer(pageManager.getData());

        //Initialise panel filter inputoptions
        this.nameInput = new PanelNameInput(
            this,
            'Panel Name',
            'Panel ' + ((this.pageManager.panels?.length || 0) + 1)
        );
        this.updateInputOptions();

        const testConfig = new WidgetConfig();
        this.widgets = [new BarChart(this, testConfig)];
    }

    public getName(): string {
        return this.nameInput.value();
    }

    private updateInputOptions(): void {
        console.log('file selector', 0);
        this.fileSelector = new Selector(
            this,
            'Active Files',
            0, //Column Index 0 is file name
            true,
            [],
            this.fileSelector
        );
        console.log('warnings selector', Attribute.warnings);
        this.warningsSelector = new Selector(
            this,
            'Warnings',
            this.dataFilterer.getColumnIndex(Attribute.warnings),
            true,
            [],
            this.warningsSelector
        );
    }

    /**
     * Called by InputOption callbacks in order to ask the panel to
     * apply new filters.
     *
     * Does not refresh the panel's sidebar or the panel's react component.
     */
    public recalculateFilters(changedOption: InputOption): void {
        let query = null;
        //Remove instanceof and null guard once all the filters are implemented
        //we can just call changedOption.query.
        if (changedOption instanceof Selector) query = changedOption.query();

        if (query === null) return;
        this.dataFilterer.processQuery(query);
    }

    /**
     * This is called by PageManager when a csv is added or removed in
     * order to update the filter inputoption's states
     */
    public refresh(): void {
        //Update dataFilterers
        this.dataFilterer.dataUpdated();

        //Update options to reflect new filters
        this.updateInputOptions();

        //Refresh after internal class state is updated
        this.refreshComponent();
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
        const baseSidebar = new Sidebar([
            this.nameInput, //Panel name. Identity filter
            this.fileSelector,
            new Geographic(this, 'Region'), //Positional filter
            new TimeRange(
                this,
                'Time Range',
                new Date('2022-11-14T03:03:03'),
                new Date('2024-02-01T06:06:00')
            ), //Time range for timestamp filtering
            new Selector(this, 'Species', []), //Species. TODO: May need special option
            new NumericInput(this, 'Minimum Probability'),
            this.warningsSelector,
            new Selector(this, 'Call Type', []),
            new Selector(this, 'Project', []),
            new Selector(this, 'Classifier Name', []),
            new Selector(this, 'Batch Name', []),
            new Selector(this, 'User ID', [])
        ]);

        //InputOption sidebars DO NOT contain filters, only widget-specific
        //options.
        const options = this.widgets
            .map((widget) => widget.generateSidebar().options)
            .reduce((acc, a) => acc.concat(a), []);

        return new Sidebar(baseSidebar.options.concat(options));
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
