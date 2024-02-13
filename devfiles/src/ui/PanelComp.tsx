import '../App.css';
import PageManager from '../classes/PageManager.js';
import WidgetComp from './WidgetComp.js';

function PanelComp(params: { panelIdx: number; pageManager: PageManager }) {
    const panel = params.pageManager.panels[params.panelIdx];
    return [<>PANEL</>].concat(
        panel.getWidgets().map((_, index) => {
            return (
                <>
                    <WidgetComp
                        panelIdx={params.panelIdx}
                        widgetIdx={index}
                        pageManager={params.pageManager}
                    />
                </>
            );
        })
    );
}

export default PanelComp;
