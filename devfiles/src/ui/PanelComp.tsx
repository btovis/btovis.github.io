import { useEffect, useState, useRef } from 'react';
import '../App.css';
import PageManager from '../classes/PageManager.js';
import LineChart from '../classes/widgets/LineChart.js';
import WidgetConfig from '../classes/widgets/WidgetConfig.js';
import WidgetComp from './WidgetComp.js';

function PanelComp(params: { panelIdx: number; pageManager: PageManager }) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [snapRight, setSnapRight] = useState(1);
    const [highlighted, setHighlighted] = useState(false);
    const refresh = () => setSnapRight(Math.abs(snapRight) + 1);

    const panel = params.pageManager.panels[params.panelIdx];
    panel.refresh = refresh;
    const widgets = panel.getWidgets().map((_, idx) => {
        return (
            <WidgetComp
                key={idx}
                panelIdx={params.panelIdx}
                widgetIdx={idx}
                pageManager={params.pageManager}
            />
        );
    });

    const widgetRowRef = useRef(null);

    useEffect(() => {
        if (snapRight <= 0 && widgetRowRef.current)
            widgetRowRef.current.scrollLeft = widgetRowRef.current.scrollWidth;
    });
    return (
        <div
            className={highlighted ? 'panelactive panel' : 'panel'}
            onClick={() => {
                //If there is a previous selected panel, render unselection
                if (params.pageManager.unselectPanel) params.pageManager.unselectPanel();

                //Update class state
                params.pageManager.selectedPanel = params.panelIdx;
                params.pageManager.unselectPanel = () => setHighlighted(false);
                setHighlighted(true);

                //Force sidebar to refresh by setting the tab
                params.pageManager.setSidebarTab('panelTab');
                params.pageManager.refreshPanelOptions();
            }}
        >
            <div className='title'>{panel.getName()}</div>
            <div ref={widgetRowRef} className='widget-row'>
                {widgets}
                <button
                    onClick={() => {
                        panel.addWidget(
                            new LineChart(params.pageManager.getData(), new WidgetConfig())
                        );
                        //If negative, scroll rightwards
                        setSnapRight(-Math.abs(snapRight) - 1);
                    }}
                >
                    Placeholder Add Widget Button
                </button>
            </div>
        </div>
    );
}

export default PanelComp;
