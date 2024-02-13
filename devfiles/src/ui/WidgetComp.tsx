import PageManager from '../classes/PageManager.js';

function WidgetComp(params: { panelIdx: number; widgetIdx: number; pageManager: PageManager }) {
    const widget = params.pageManager.panels[params.panelIdx].getWidgets()[params.widgetIdx];

    return <div className='widget'>{widget.constructor.name}</div>;
}

export default WidgetComp;
