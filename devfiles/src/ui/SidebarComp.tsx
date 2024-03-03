import { useState } from 'react';
import '../App.css';
import PageManager from '../classes/PageManager.js';
import PanelOptionsComp from './OptionsComp/PanelOptionsComp.js';
import GlobalOptionsComp from './OptionsComp/GlobalOptionsComp.js';
import { Tab, Tabs } from 'react-bootstrap';
import WidgetOptionsComp from './OptionsComp/WidgetOptionsComp.js';

function SidebarComp(params: { renderFileProcess: (FileList) => void; pageManager: PageManager }) {
    //Tab state
    const [key, setKey] = useState('globalTab');
    const [a, dud] = useState(0);

    //Force a re-render even if the sidebar tab is the same
    params.pageManager.setSidebarTab = (s) => {
        if (s !== key) setKey(s);
        else dud(a + 1);
    };

    //Don't give PanelOptionsComp sidebarContainer, as the children need to handle
    //their own margins
    return (
        <Tabs activeKey={key} onSelect={(k) => setKey(k)} id='sidebar-tab-handler' justify>
            <Tab
                className='sidebarTab'
                eventKey='widgetTab'
                title='Widget Options'
                disabled={
                    params.pageManager.selectedPanel < 0 || params.pageManager.selectedWidget < 0
                }
            >
                <WidgetOptionsComp pageManager={params.pageManager} />
            </Tab>
            <Tab
                className='sidebarTab'
                eventKey='panelTab'
                title='Panel Filters'
                disabled={params.pageManager.selectedPanel < 0}
            >
                <PanelOptionsComp pageManager={params.pageManager} />
            </Tab>
            <Tab className='sidebarTab' eventKey='globalTab' title='Global'>
                <GlobalOptionsComp
                    renderFileProcess={params.renderFileProcess}
                    pageManager={params.pageManager}
                />
            </Tab>
        </Tabs>
    );
}

export default SidebarComp;
