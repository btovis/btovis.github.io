import { useState } from 'react';
import '../App.css';
import PageManager from '../classes/PageManager.js';
import PanelOptionsComp from './OptionsComp/PanelOptionsComp.js';
import GlobalOptionsComp from './OptionsComp/GlobalOptionsComp.js';
import { Tab, Tabs } from 'react-bootstrap';

function SidebarComp(params: { pageManager: PageManager }) {
    //Tab state
    const [key, setKey] = useState('globalTab');

    params.pageManager.setSidebarTab = setKey;

    return (
        <Tabs activeKey={key} onSelect={(k) => setKey(k)} id='sidebar-tab-handler' justify>
            <Tab
                eventKey='panelTab'
                title='Panel Settings'
                disabled={params.pageManager.selectedPanel < 0}
            >
                <PanelOptionsComp pageManager={params.pageManager} />
            </Tab>
            <Tab eventKey='globalTab' title='Global'>
                <GlobalOptionsComp pageManager={params.pageManager} />
            </Tab>
        </Tabs>
    );
}

export default SidebarComp;
