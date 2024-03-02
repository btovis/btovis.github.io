import { useState } from 'react';
import PageManager from '../classes/PageManager.js';
import Widget from '../classes/widgets/Widget.js';
import React from 'react';

function WidgetComp(params: {
    panelIdx: number;
    widgetIdx: number;
    pageManager: PageManager;
    widgetClass: Widget;
}) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [r, dud] = useState(0);

    const panel = params.pageManager.panels[params.panelIdx];
    const widget = panel.getWidget(params.widgetIdx);
    widget.refresh = () => dud(r + 1);

    return params.widgetClass.render();
}

export default React.memo(WidgetComp);
