import { Dispatch, SetStateAction } from 'react';
import Panel from './Panel';
import GlobalSettings from './GlobalSettings';
import Sidebar from './Sidebar';
import { Data } from './data/Data';

export default class PageManager {
    public data: Data;
    public globalSettings: GlobalSettings;
    public panels: Panel[];
    public updateCallback?: Dispatch<SetStateAction<PageManager>>;

    public constructor() {
        this.panels = [new Panel(this)];
        this.data = new Data();
    }

    public get_data(): Data {
        return this.data;
    }

    public update_sidebar(): void {}

    public update_panels(): void {}
}
