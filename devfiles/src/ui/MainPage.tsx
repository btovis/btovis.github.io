import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';
import '../App.css';
import PageManager from '../classes/PageManager.js';
import PanelComp from './PanelComp.js';

function MainPage(params: { pageManager: PageManager }) {
    return [
        <>
            <h1>Vite + React</h1>
        </>
    ].concat(
        params.pageManager.panels.map((_, index) => {
            return (
                <>
                    <PanelComp panelIdx={index} pageManager={params.pageManager} />
                </>
            );
        })
    );
}

export default MainPage;
