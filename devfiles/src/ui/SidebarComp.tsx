import { useState } from 'react';
import '../App.css';
import PageManager from '../classes/PageManager.js';

function SidebarComp(params: { pageManager: PageManager }) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [r, dud] = useState(0);
    const refresh = () => dud(r + 1);
    return <>LPANE</>;
}

export default SidebarComp;
