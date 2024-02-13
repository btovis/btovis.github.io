import PageManager from '../classes/PageManager.js';

function WidgetComp(params: { panelIdx: number; widgetIdx: number; pageManager: PageManager }) {
    const widget = params.pageManager.panels[params.panelIdx].getWidgets()[params.widgetIdx];

    return <>{widget.constructor.name}</>;
}

export default WidgetComp;
