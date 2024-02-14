import { useState } from 'react';
import { useRef } from 'react';
import '../App.css';
import PageManager from '../classes/PageManager.js';
import LineChart from '../classes/widgets/LineChart.js';
import WidgetConfig from '../classes/widgets/WidgetConfig.js';
import WidgetComp from './WidgetComp.js';

function PanelComp(params: { panelIdx: number; pageManager: PageManager }) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [r, dud] = useState(0);
    const refresh = () => dud(r + 1);

    const panel = params.pageManager.panels[params.panelIdx];

    const widgets = panel.getWidgets().map((_, idx) => {
        return (
            <WidgetComp
                panelIdx={params.panelIdx}
                widgetIdx={idx}
                pageManager={params.pageManager}
            />
        );
    });

    const widgetRowRef = useRef(null);

    return (
        <div className='panel'>
            <div className='title'>Panel {params.panelIdx}</div>
            <div ref={widgetRowRef} className='widget-row'>
                {widgets}
                <button
                    onClick={() => {
                        panel.addWidget(
                            new LineChart(params.pageManager.getData(), new WidgetConfig())
                        );
                        refresh();
                        //widgetRowRef.current.scrollLeft = widgetRowRef.current.scrollWidth;

                        //TODO: make this less shit
                        setTimeout(function () {
                            widgetRowRef.current.scrollLeft = widgetRowRef.current.scrollWidth;
                        }, 1); // wait for refresh to complete before snapping to right edge of widget row
                        // without this it doesn't scroll all the way to the right edge of the div
                    }}
                >
                    Placeholder Add Widget Button
                </button>
            </div>
        </div>
    );
}

export default PanelComp;
