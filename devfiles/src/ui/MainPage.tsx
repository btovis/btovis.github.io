import '../App.css';
import PageManager from '../classes/PageManager.js';
import PanelComp from './PanelComp.js';

function MainPage(params: { pageManager: PageManager }) {
    return params.pageManager.panels.map((_, idx) => {
        return <PanelComp key={idx} panelIdx={idx} pageManager={params.pageManager} />;
    });
}

export default MainPage;
