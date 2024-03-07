import PageManager from './PageManager';
import Sidebar from './Sidebar';
import Geographic from './options/Geographic';
import NumericInput from './options/NumericInput';
import Selector from './options/Selector';
import PanelNameInput from './options/PanelNameInput';
import DateRange from './options/DateRange';
import BarChart from './widgets/BarChart';
import Widget from './widgets/Widget';
import DataFilterer from './data/DataFilterer';
import { v4 as uuidv4 } from 'uuid';
import InputOption from './options/InputOption';
import { Attribute } from './data/Data';
import SpeciesSelector from './options/SpeciesSelector';
import TimeOfDayRange from './options/TimeOfDayRange';
import { Query } from './query/Query';
import TimeChart from './widgets/TimeChart.tsx';
import LineChart from './widgets/LineChart.tsx';
import TableWidget from './widgets/TableWidget.tsx';
import MapWidget from './widgets/MapWidget.tsx';
import { YGrouping } from './widgets/Grouping.ts';

export default class Panel {
    //TODO: Consider protecting with private
    //Mutator methods below do more than touch this list
    public widgets: Widget[] = [];

    public refreshComponent: () => void = () => {};
    public pageManager: PageManager;

    private readonly nameInput: PanelNameInput;
    private fileSelector: Selector;
    private geographic: Geographic;
    private dateRange: DateRange;
    private timeOfDay: TimeOfDayRange;
    private minimumProbability: NumericInput;
    private speciesSelector: SpeciesSelector;
    private warningsSelector: Selector;
    private calltypeSelector: Selector;
    private projectSelector: Selector;
    private classifierSelector: Selector;
    private batchnameSelector: Selector;
    private useridSelector: Selector;

    public dataFilterer: DataFilterer;
    public readonly uuid: number;
    public minHeight: number;
    public needsManualRefresh = false;
    public lifetimeWidgetCount: Map<string, number> = new Map();

    public constructor(pageManager: PageManager, isDefaultPanel: boolean = false) {
        this.uuid = uuidv4();
        this.pageManager = pageManager;
        this.dataFilterer = new DataFilterer(pageManager.getData());

        let newName = isDefaultPanel
            ? 'Default Panel'
            : 'Panel ' + (this.pageManager.getLifetimePanelsCreated() + 1);

        this.nameInput = new PanelNameInput(this, 'Panel Name', newName, () =>
            this.manualRefresh()
        );

        //This boolean only needs to be passed at the start. Later iterations will
        //take the current values from the current option
        this.updateInputOptions(isDefaultPanel);
        this.minHeight = 400; // panel body minimum height

        //Initialise widgets only after filters were initiated with default options
        if (isDefaultPanel) {
            //Default Filters are handled in updateInputOptions
            newName = 'Default Panel';
            this.addWidget(new BarChart(this, 'Month', YGrouping.VulnerabilityStatus));
            this.addWidget(new LineChart(this, 'Date', YGrouping.SpeciesGroup));
            this.addWidget(new TableWidget(this));
            this.addWidget(new MapWidget(this));
        }
    }

    public getName(): string {
        return this.nameInput.value();
    }

    private updateInputOptions(isDefaultPanel: boolean = false): void {
        this.fileSelector = new Selector(
            this,
            'Active Files',
            0, //Column Index 0 is file name
            true,
            [],
            this.fileSelector,
            true
        );
        this.geographic = new Geographic(this, 'Location', this.geographic, true);
        this.dateRange = new DateRange(this, 'Date Range', this.dateRange, true);
        this.timeOfDay = new TimeOfDayRange(this, 'Time of Day', this.timeOfDay, true);
        this.minimumProbability = new NumericInput(
            this,
            'Minimum Probability',
            0,
            1,
            0.01,
            isDefaultPanel ? 0.5 : 0,
            this.minimumProbability,
            true
        );

        this.speciesSelector = new SpeciesSelector(
            this,
            'Species',
            isDefaultPanel,
            this.speciesSelector,
            true
        );
        if (isDefaultPanel) this.recalculateFilters(this.speciesSelector, this.minimumProbability);

        this.warningsSelector = new Selector(
            this,
            'Warnings',
            this.dataFilterer.getColumnIndex(Attribute.warnings),
            true,
            [],
            this.warningsSelector,
            true
        );
        this.calltypeSelector = new Selector(
            this,
            'Call Type',
            this.dataFilterer.getColumnIndex(Attribute.callType),
            true,
            [],
            this.calltypeSelector,
            true
        );
        this.projectSelector = new Selector(
            this,
            'Project',
            this.dataFilterer.getColumnIndex(Attribute.projectName),
            true,
            [],
            this.projectSelector,
            true
        );
        this.classifierSelector = new Selector(
            this,
            'Classifier',
            this.dataFilterer.getColumnIndex(Attribute.classifierName),
            true,
            [],
            this.classifierSelector,
            true
        );
        this.batchnameSelector = new Selector(
            this,
            'Batch',
            this.dataFilterer.getColumnIndex(Attribute.batchName),
            true,
            [],
            this.batchnameSelector,
            true
        );
        this.useridSelector = new Selector(
            this,
            'UserID',
            this.dataFilterer.getColumnIndex(Attribute.userID),
            true,
            [],
            this.useridSelector,
            true
        );
    }

    /**
     * Called by InputOption callbacks in order to ask the panel to
     * apply new filters.
     *
     * Does not refresh the panel's sidebar or the panel's react component.
     */
    public recalculateFilters(...changedOption: InputOption[]): void {
        const queryArr: Query[] = [];

        for (const option of changedOption) {
            //Remove null guard once all the filters are implemented
            //we can just call changedOption.query.
            const query = option.query();
            if (query == null) continue;
            if ('compound' in query) queryArr.push(...(query.queries as Query[]));
            else queryArr.push(query as Query);
        }

        const later = !this.nameInput.refreshAutomatically;
        queryArr.forEach((q, i, arr) =>
            this.dataFilterer.processQuery(q, i != arr.length - 1 || later)
        );

        //For the row/filtered count
        if (!later) this.nameInput.refreshComponent();
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
        this.pageManager.refreshPanelOptions();

        //Refresh after internal class state is updated
        this.refreshComponent();
        this.refreshWidgets(false);
    }

    public manualRefresh() {
        // this.updateInputOptions();
        // this.pageManager.refreshPanelOptions();
        this.dataFilterer.recalculateFilteredData();
        this.refreshComponent();
        this.refreshWidgets(false);
        this.nameInput.refreshComponent();
    }

    // Refresh Widgets, Trace Related Options, and Sidebar
    public refreshWidgets(delayable: boolean = true): void {
        if (delayable && !this.nameInput.refreshAutomatically) {
            this.needsManualRefresh = true;
            this.refreshComponent();
            return;
        }
        this.needsManualRefresh = false;
        this.widgets.forEach((w) => {
            if (w instanceof TimeChart) w.updateGrouping();
        });
        this.widgets.forEach((w) => w.updateTraceOptions());
        this.widgets.forEach((w) => w.refresh());
    }
    // Refresh Widget's rendering only
    public refreshWidgetsRender(): void {
        this.widgets.forEach((w) => w.refresh());
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
            this.geographic, //Positional filter
            this.dateRange,
            this.timeOfDay,
            this.minimumProbability,
            this.speciesSelector,
            this.warningsSelector,
            this.calltypeSelector,
            this.projectSelector,
            this.classifierSelector,
            this.batchnameSelector,
            this.useridSelector
        ]);

        return new Sidebar(baseSidebar.options);
    }

    public render(): void {}

    public addWidget(widget: Widget): void {
        this.widgets.push(widget);
        this.lifetimeWidgetCount.set(
            widget.getWidgetName(),
            this.lifetimeWidgetCount.has(widget.getWidgetName())
                ? this.lifetimeWidgetCount.get(widget.getWidgetName()) + 1
                : 1
        );
    }

    public removeWidget(widgetIdx: number) {
        this.pageManager.selectedWidget = -1;
        this.pageManager.setSidebarTab('panelTab');
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

    public getLifetimeWidgetsCreated(widgetClassName: string): number {
        return this.lifetimeWidgetCount.has(widgetClassName)
            ? this.lifetimeWidgetCount.get(widgetClassName)
            : 0;
    }
}
