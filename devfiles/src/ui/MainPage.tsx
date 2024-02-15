import '../App.css';
import PageManager from '../classes/PageManager.js';
import Panel from '../classes/Panel.js';
import PanelComp from './PanelComp.js';

function MainPage(params: { pageManager: PageManager }) {
    return params.pageManager.panels
        .map((_, idx) => {
            return <PanelComp key={idx} panelIdx={idx} pageManager={params.pageManager} />;
        })
        .concat(
            <button
                key={99999999}
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
