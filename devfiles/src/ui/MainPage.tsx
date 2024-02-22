import '../App.css';
import PageManager from '../classes/PageManager.js';
import Panel from '../classes/Panel.js';
import PanelComp from './PanelComp.js';
import { v4 as uuidv4 } from 'uuid';

function MainPage(params: { pageManager: PageManager }) {
    return params.pageManager.panels
        .map((panel, idx) => {
            return <PanelComp key={panel.uuid} panelIdx={idx} pageManager={params.pageManager} />;
        })
        .concat(
            <button
                key={uuidv4()}
                onClick={() => {
                    params.pageManager.addPanel(new Panel(params.pageManager));
                    params.pageManager.refreshEverything();
                }}
            >
                Placeholder Add Panel Button
            </button>
        );
}

export default MainPage;
