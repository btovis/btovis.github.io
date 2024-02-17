import { Dispatch, SetStateAction } from 'react';
import Panel from './Panel';
import GlobalSettings from './GlobalSettings';
import { Data } from './data/Data';

export default class PageManager {
    public data: Data;
    public globalSettings: GlobalSettings;
    public selectedPanel: number = -1;
    public panels: Panel[];
    public refreshEverything?: () => void;
    public refreshPanelOptions?: () => void;
    public setSidebarTab?: (tab: string) => void;
    public unselectPanel?: () => void;

    public constructor() {
        this.data = new Data();
        this.panels = [new Panel(this)];
    }

    public getData(): Data {
        return this.data;
    }

    public addCSV(CSVName: string, CSVFile: Uint8Array) {
        this.data.addCSV(CSVName, CSVFile);
        this.panels.forEach((p) => p.dataFilterer.dataUpdated());
    }

    public addPanel(panel: Panel) {
        this.panels.push(panel);
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
