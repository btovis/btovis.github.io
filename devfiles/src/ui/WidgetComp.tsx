import { useState } from 'react';
import CloseButton from 'react-bootstrap/CloseButton';
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

    const panel = params.pageManager.panels[params.panelIdx];
    const widget = panel.getWidget(params.widgetIdx);
    widget.refresh = () => dud(r + 1);

    return (
        <div className='widget'>
            <CloseButton
                className='close-widget'
                onClick={() => {
                    panel.removeWidget(params.widgetIdx);
                    panel.refresh();
                }}
            />
            {params.widgetClass.render()}
        </div>
    );
}

export default WidgetComp;
