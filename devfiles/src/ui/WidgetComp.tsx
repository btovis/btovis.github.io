import { useEffect, useState } from 'react';
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

    useEffect(() => {
        //Some widget things are actually stored in PanelComp (like title)
        //As such, refresh the panel as needed.
        panel.refreshComponent();
    });
    return params.widgetClass.render();
}

const WidgetMemo = React.memo(WidgetComp);

export default WidgetMemo;
