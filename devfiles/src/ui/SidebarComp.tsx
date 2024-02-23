import { MutableRefObject, useState } from 'react';
import '../App.css';
import PageManager from '../classes/PageManager.js';
import PanelOptionsComp from './OptionsComp/PanelOptionsComp.js';
import GlobalOptionsComp from './OptionsComp/GlobalOptionsComp.js';
import { Tab, Tabs } from 'react-bootstrap';

function SidebarComp(params: { renderFileProcess: (FileList) => void; pageManager: PageManager }) {
    //Tab state
    const [key, setKey] = useState('globalTab');

    params.pageManager.setSidebarTab = setKey;
    //Don't give PanelOptionsComp sidebarContainer, as the children need to handle
    //their own margins
    return (
        <Tabs activeKey={key} onSelect={(k) => setKey(k)} id='sidebar-tab-handler' justify>
            <Tab
                eventKey='panelTab'
                title='Panel Filters'
                disabled={params.pageManager.selectedPanel < 0}
            >
                <PanelOptionsComp pageManager={params.pageManager} />
            </Tab>
            <Tab className='sidebarContainer' eventKey='globalTab' title='Global'>
                <GlobalOptionsComp
                    renderFileProcess={params.renderFileProcess}
                    pageManager={params.pageManager}
                />
            </Tab>
        </Tabs>
    );
}

export default SidebarComp;
