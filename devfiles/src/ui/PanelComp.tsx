import { useEffect, useState, useRef } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import '../App.css';
import PageManager from '../classes/PageManager.js';
import LineChart from '../classes/widgets/LineChart.js';
import WidgetConfig from '../classes/widgets/WidgetConfig.js';
import WidgetComp from './WidgetComp.js';
import BarChart from '../classes/widgets/BarChart.js';
import MapWidget from '../classes/widgets/MapWidget.js';
import StackedLineChart from '../classes/widgets/StackedLineChart.js';
import TableWidget from '../classes/widgets/TableWidget.js';
import DebugWidget from '../classes/widgets/DebugWidget.js';
import { Resizable } from 'react-resizable';

function PanelComp(params: { panelIdx: number; pageManager: PageManager }) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [snapRight, setSnapRight] = useState(1);
    const [highlighted, setHighlighted] = useState(false);
    const refreshComponent = () => setSnapRight(Math.abs(snapRight) + 1);
    const [panelHeight, setPanelHeight] = useState(500);
    const onResize = (event, { node, size, handle }) => {
        setPanelHeight(size.height);
    };

    const panel = params.pageManager.panels[params.panelIdx];
    panel.refreshComponent = refreshComponent;
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
        <div className={highlighted ? 'panel panelactive' : 'panel'}>
            <Accordion defaultActiveKey='0'>
                <Accordion.Item
                    eventKey='0'
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
                    <Accordion.Header className=''>
                        <div className='title'>{panel.getName()}</div>
                    </Accordion.Header>

                    <Accordion.Body>
                        <Resizable ref={widgetRowRef} onResize={onResize} height={panelHeight}>
                            <span>
                                <div className='panel-body' style={{ height: panelHeight + 'px' }}>
                                    <div className='widget-row'>{widgets}</div>
                                    <div className='add-widget-btns'>
                                        <button
                                            className='widget-btn'
                                            onClick={() => {
                                                panel.addWidget(
                                                    new BarChart(
                                                        params.pageManager.panels[params.panelIdx],
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
                                                        params.pageManager.panels[params.panelIdx],
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
                                                        params.pageManager.panels[params.panelIdx],
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
                                                        params.pageManager.panels[params.panelIdx],
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
                                                        params.pageManager.panels[params.panelIdx],
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
                            </span>
                        </Resizable>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}

export default PanelComp;
