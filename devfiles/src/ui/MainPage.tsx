import '../App.css';
import PageManager from '../classes/PageManager.js';
import PanelComp from './PanelComp.js';

function MainPage(params: { pageManager: PageManager }) {
    return [
        <>
            <h1>Vite + React</h1>
        </>
    ].concat(
        params.pageManager.panels.map((_, idx) => {
            return <PanelComp panelIdx={idx} pageManager={params.pageManager} />;
        })
    );
}

export default MainPage;
