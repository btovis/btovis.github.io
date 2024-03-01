import { useState } from 'react';
import CloseButton from 'react-bootstrap/CloseButton';
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
    const [highlighted, setHighlighted] = useState(false);
    function selectThisWidget() {
        //If there is a previous selected panel, render unselection
        if (params.pageManager.unselectWidget) params.pageManager.unselectWidget();

        //Update class state
        params.pageManager.selectedWidget = params.widgetIdx;
        params.pageManager.unselectWidget = () => setHighlighted(false);
        setHighlighted(true);

        //Force sidebar to refresh by setting the tab
        params.pageManager.setSidebarTab('widgetTab');
    }

    console.log('Rendering widget', widget.uuid, 'under panel', panel.uuid);

    return (
        <div
            className={highlighted ? 'widgetactive widget' : 'widget'}
            onClick={(event) => {
                //Ignore this if the actual panel isn't selected
                if (params.pageManager.selectedPanel != params.panelIdx) return;
                event.stopPropagation();
                selectThisWidget();
            }}
        >
            <CloseButton
                className='close-widget'
                onClick={(event) => {
                    event.stopPropagation();
                    panel.removeWidget(params.widgetIdx);
                    panel.refresh();
                }}
            />
            <p className='widgetTitle'>{params.widgetClass.name}</p>
            {params.widgetClass.render()}
        </div>
    );
}

export default React.memo(WidgetComp);
