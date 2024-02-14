import { useState } from 'react';
import PageManager from '../classes/PageManager.js';

function WidgetComp(params: { panelIdx: number; widgetIdx: number; pageManager: PageManager }) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [r, dud] = useState(0);
    const refresh = () => dud(r + 1);

    const widget = params.pageManager.panels[params.panelIdx].getWidget(params.widgetIdx);

    return <div className='widget'>{widget.constructor.name}</div>;
}

export default WidgetComp;
