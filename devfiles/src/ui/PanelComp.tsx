import '../App.css';
import PageManager from '../classes/PageManager.js';
import WidgetComp from './WidgetComp.js';

function PanelComp(params: { panelIdx: number; pageManager: PageManager }) {
    const panel = params.pageManager.panels[params.panelIdx];

    const widgetRow = panel.getWidgets().map((_, idx) => {
        return (
            <WidgetComp
                panelIdx={params.panelIdx}
                widgetIdx={idx}
                pageManager={params.pageManager}
            />
        );
    });

    return (
        <div className='panel'>
            <div className='title'>Panel {params.panelIdx}</div>
            <div className='widget-row'>{widgetRow}</div>
        </div>
    );
}

export default PanelComp;
