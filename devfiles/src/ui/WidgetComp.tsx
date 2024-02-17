import { useState } from 'react';
import PageManager from '../classes/PageManager.js';
import Widget from '../classes/widgets/Widget.js';

function WidgetComp(params: {
    panelIdx: number;
    widgetIdx: number;
    pageManager: PageManager;
    widgetClass: Widget;
}) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [r, dud] = useState(0);
    const refresh = () => dud(r + 1);

    const widget = params.pageManager.panels[params.panelIdx].getWidget(params.widgetIdx);

    return (
        <div className='widget'>
            {widget.constructor.name}
            {params.widgetClass.render()}
        </div>
    );
}

export default WidgetComp;
