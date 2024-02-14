import { useState } from 'react';
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

    const widgetRow = panel.getWidgets().map((_, idx) => {
        return (
            <WidgetComp
                panelIdx={params.panelIdx}
                widgetIdx={idx}
                pageManager={params.pageManager}
            />
        );
    });

    return (
        <div className='panel'>
            <div className='title'>Panel {params.panelIdx}</div>
            <div className='widget-row'>
                {widgetRow}
                <button
                    onClick={() => {
                        panel.addWidget(
                            new LineChart(params.pageManager.getData(), new WidgetConfig())
                        );
                        refresh();
                    }}
                >
                    Placeholder Add Widget Button
                </button>
            </div>
        </div>
    );
}

export default PanelComp;
