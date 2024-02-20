import { useEffect, useState, useRef } from 'react';
import '../App.css';
import PageManager from '../classes/PageManager.js';
import LineChart from '../classes/widgets/LineChart.js';
import WidgetConfig from '../classes/widgets/WidgetConfig.js';
import WidgetComp from './WidgetComp.js';
import MapWidget from '../classes/widgets/MapWidget.js';
import DebugWidget from '../classes/widgets/DebugWidget.js';
import StackedLineChart from '../classes/widgets/StackedLineChart.tsx';
import TableWidget from '../classes/widgets/TableWidget.tsx';
import BarChart from '../classes/widgets/BarChart.tsx';
function PanelComp(params: { panelIdx: number; pageManager: PageManager }) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [snapRight, setSnapRight] = useState(1);
    const [highlighted, setHighlighted] = useState(false);
    const [hidden, setHidden] = useState(false);
    const refresh = () => setSnapRight(Math.abs(snapRight) + 1);

    const panel = params.pageManager.panels[params.panelIdx];
    panel.refresh = refresh;
    const widgets = panel.getWidgets().map((w, idx) => {
        return (
            <WidgetComp
                key={idx}
                panelIdx={params.panelIdx}
                widgetIdx={idx}
                pageManager={params.pageManager}
                widgetClass={w}
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
            <div className='body'>
                <div ref={widgetRowRef} className='widget-row'>
                    {widgets}
                </div>
                <div className='add-widget-btns'>
                    <button
                        className='widget-btn'
                        onClick={() => {
                            panel.addWidget(
                                new BarChart(
                                    params.pageManager.panels[params.panelIdx].dataFilterer,
                                    new WidgetConfig()
                                )
                            );
                            //If negative, scroll rightwards
                            setSnapRight(-Math.abs(snapRight) - 1);
                        }}
                    >
                        Add Barchart
                    </button>
                    <button
                        className='widget-btn'
                        onClick={() => {
                            panel.addWidget(
                                new TableWidget(
                                    params.pageManager.panels[params.panelIdx],
                                    new WidgetConfig()
                                )
                            );
                            //If negative, scroll rightwards
                            setSnapRight(-Math.abs(snapRight) - 1);
                        }}
                    >
                        Add Table
                    </button>
                    <button
                        className='widget-btn'
                        onClick={() => {
                            panel.addWidget(
                                new MapWidget(
                                    params.pageManager.panels[params.panelIdx].dataFilterer,
                                    new WidgetConfig()
                                )
                            );
                            //If negative, scroll rightwards
                            setSnapRight(-Math.abs(snapRight) - 1);
                        }}
                    >
                        Add Map
                    </button>
                    <button
                        className='widget-btn'
                        onClick={() => {
                            panel.addWidget(
                                new LineChart(
                                    params.pageManager.panels[params.panelIdx].dataFilterer,
                                    new WidgetConfig()
                                )
                            );
                            //If negative, scroll rightwards
                            setSnapRight(-Math.abs(snapRight) - 1);
                        }}
                    >
                        Add Linechart
                    </button>
                    <button
                        className='widget-btn'
                        onClick={() => {
                            panel.addWidget(
                                new StackedLineChart(
                                    params.pageManager.panels[params.panelIdx].dataFilterer,
                                    new WidgetConfig()
                                )
                            );
                            //If negative, scroll rightwards
                            setSnapRight(-Math.abs(snapRight) - 1);
                        }}
                    >
                        Add Stacked Linechart
                    </button>
                    <button
                        className='widget-btn'
                        onClick={() => {
                            panel.addWidget(
                                new DebugWidget(
                                    params.pageManager.panels[params.panelIdx].dataFilterer,
                                    new WidgetConfig()
                                )
                            );
                            //If negative, scroll rightwards
                            setSnapRight(-Math.abs(snapRight) - 1);
                        }}
                    >
                        Add Debug Widget
                    </button>
                </div>
            </div>
            {!hidden && (
                <div className='body'>
                    <div ref={widgetRowRef} className='widget-row'>
                        {widgets}
                    </div>
                    <div className='add-widget-btns'>
                        <button
                            className='widget-btn'
                            onClick={() => {
                                panel.addWidget(
                                    new BarChart(
                                        params.pageManager.panels[params.panelIdx].dataFilterer,
                                        new WidgetConfig()
                                    )
                                );
                                //If negative, scroll rightwards
                                setSnapRight(-Math.abs(snapRight) - 1);
                            }}
                        >
                            Add Barchart
                        </button>
                        <button
                            className='widget-btn'
                            onClick={() => {
                                panel.addWidget(
                                    new TableWidget(
                                        params.pageManager.panels[params.panelIdx],
                                        new WidgetConfig()
                                    )
                                );
                                //If negative, scroll rightwards
                                setSnapRight(-Math.abs(snapRight) - 1);
                            }}
                        >
                            Add Table
                        </button>
                        <button
                            className='widget-btn'
                            onClick={() => {
                                panel.addWidget(
                                    new MapWidget(
                                        params.pageManager.panels[params.panelIdx].dataFilterer,
                                        new WidgetConfig()
                                    )
                                );
                                //If negative, scroll rightwards
                                setSnapRight(-Math.abs(snapRight) - 1);
                            }}
                        >
                            Add Map
                        </button>
                        <button
                            className='widget-btn'
                            onClick={() => {
                                panel.addWidget(
                                    new LineChart(
                                        params.pageManager.panels[params.panelIdx].dataFilterer,
                                        new WidgetConfig()
                                    )
                                );
                                //If negative, scroll rightwards
                                setSnapRight(-Math.abs(snapRight) - 1);
                            }}
                        >
                            Add Linechart
                        </button>
                        <button
                            className='widget-btn'
                            onClick={() => {
                                panel.addWidget(
                                    new StackedLineChart(
                                        params.pageManager.panels[params.panelIdx].dataFilterer,
                                        new WidgetConfig()
                                    )
                                );
                                //If negative, scroll rightwards
                                setSnapRight(-Math.abs(snapRight) - 1);
                            }}
                        >
                            Add Stacked Linechart
                        </button>
                        <button
                            className='widget-btn'
                            onClick={() => {
                                panel.addWidget(
                                    new DebugWidget(
                                        params.pageManager.panels[params.panelIdx].dataFilterer,
                                        new WidgetConfig()
                                    )
                                );
                                //If negative, scroll rightwards
                                setSnapRight(-Math.abs(snapRight) - 1);
                            }}
                        >
                            Add Debug Widget
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PanelComp;
