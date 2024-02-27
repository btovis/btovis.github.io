import { Dispatch, SetStateAction } from 'react';
import Panel from './Panel';
import GlobalSettings from './GlobalSettings';
import { Data } from './data/Data';

export default class PageManager {
    private static instance: PageManager;
    public static get(): PageManager {
        if (PageManager.instance == null) PageManager.instance = new PageManager();
        return PageManager.instance;
    }

    public data: Data;
    public globalSettings: GlobalSettings;
    public selectedPanel: number = -1;
    public panels: Panel[];
    public refreshEverything?: () => void;
    public refreshPanelOptions?: () => void;
    public setSidebarTab?: (tab: string) => void;
    public unselectPanel?: () => void;

    private constructor() {
        console.log('Pagemanager was initialised.');
        this.data = new Data();
        this.panels = [];
    }

    public getData(): Data {
        return this.data;
    }

    public addCSV(CSVName: string, CSVFile: Uint8Array, finaliseLater: boolean) {
        this.data.addCSV(CSVName, CSVFile, finaliseLater);
        if (!finaliseLater) this.panels.forEach((p) => p.refresh());
    }

    public finaliseAddingCSVs() {
        this.data.finaliseAdding();
        this.panels.forEach((p) => p.refresh());
    }

    public removeCSV(CSVName: string) {
        this.data.removeCSV(CSVName);
        this.panels.forEach((p) => p.refresh());
    }

    public addPanel(panel: Panel) {
        this.panels.push(panel);
        return this.panels.length - 1;
    }

    public deletePanel(panelIdx: number) {
        this.panels.splice(panelIdx, 1);
    }

    public getSelectedPanel() {
        return this.panels[this.selectedPanel];
    }

    public getPanel(panelIdx: number) {
        return this.panels[panelIdx];
    }

    //Unsure what these 2 do. If you seek to refresh the UI,
    // use refreshPanelOptions for panel options in the sidebar,
    // and getSelectedPanel().refresh() for the selected panel
    //public updateSidebar(): void {}

    //public updatePanels(): void {}
}
