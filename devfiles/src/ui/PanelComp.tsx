import '../App.css';
import PageManager from '../classes/PageManager.js';

function PanelComp(params: { panelIdx: number; pageManager: PageManager }) {
    const panel = params.pageManager.panels[params.panelIdx];
    return (
        <>
            PANEL
            {/* {
            params.pageManager.panels.forEach((_,index) => {
                return <><PanelComp panelIdx={index} pageManager={params.pageManager} /></>
            })
        } */}
        </>
    );
}

export default PanelComp;
