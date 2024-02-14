import { Dispatch, SetStateAction } from 'react';
import Panel from './Panel';
import GlobalSettings from './GlobalSettings';
import { Data } from './data/Data';

export default class PageManager {
    public data: Data;
    public globalSettings: GlobalSettings;
    public selectedPanel: number;
    public panels: Panel[];
    public updateCallback?: Dispatch<SetStateAction<PageManager>>;
    public sidebarRefresh?: () => void;
    public unselectPanel?: () => void;

    public constructor() {
        this.panels = [new Panel(this)];
        this.data = new Data();
    }

    public getData(): Data {
        return this.data;
    }

    public updateSidebar(): void {}

    public updatePanels(): void {}
}
