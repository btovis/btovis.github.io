import { useState } from 'react';
import '../App.css';
import PageManager from '../classes/PageManager.js';
import PanelOptionsComp from './PanelOptionsComp.js';

function SidebarComp(params: { pageManager: PageManager }) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [r, dud] = useState(0);
    const refresh = () => dud(r + 1);
    params.pageManager.refreshPanelOptions = refresh;

    return <PanelOptionsComp pageManager={params.pageManager} />;
}

export default SidebarComp;
