import { useEffect, useState, useRef } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import '../App.css';
import PageManager from '../classes/PageManager.js';
import LineChart from '../classes/widgets/LineChart.js';
import WidgetComp from './WidgetComp.js';
import BarChart from '../classes/widgets/BarChart.js';
import MapWidget from '../classes/widgets/MapWidget.js';
import StackedLineChart from '../classes/widgets/StackedLineChart.js';
import TableWidget from '../classes/widgets/TableWidget.js';
import DebugWidget from '../classes/widgets/DebugWidget.js';
import { Resizable } from 'react-resizable';
import { CloseButton } from 'react-bootstrap';
import generateHash from '../utils/generateHash.js';

function PanelComp(params: { panelIdx: number; pageManager: PageManager }) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [snapRight, setSnapRight] = useState(1);
    const [highlighted, setHighlighted] = useState(false);
    const refreshComponent = () => setSnapRight(Math.abs(snapRight) + 1);
    const onResize = (event, { node, size, handle }) => {
        setPanelHeight(Math.max(panel.minHeight, size.height));
    };

    const panel = params.pageManager.panels[params.panelIdx];
    const [panelHeight, setPanelHeight] = useState(panel.minHeight);
    panel.refreshComponent = refreshComponent;

    //THIS WAS MOVED HERE ON PURPOSE.
    //WidgetComp is memo'ed by react. Updating the widget name and
    //the widget's selections tatus should not trigger a re-render of widget comp
    const widgets = panel.getWidgets().map((w, idx) => {
        function selectThisWidget() {
            //Update class state
            params.pageManager.selectedWidget = idx;
            panel.refreshComponent();
            //Force sidebar to refresh by setting the tab
            params.pageManager.setSidebarTab('widgetTab');
        }
        return (
            <div
                key={generateHash(panel.uuid, w.uuid)}
                className={
                    params.pageManager.selectedPanel === params.panelIdx &&
                    params.pageManager.selectedWidget === idx
                        ? 'widgetactive widget'
                        : 'widget'
                }
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
                        panel.removeWidget(idx);
                        panel.refresh();
                    }}
                />
                <p className='widgetTitle'>{w.name}</p>
                <WidgetComp
                    key={w.uuid}
                    panelIdx={params.panelIdx}
                    widgetIdx={idx}
                    pageManager={params.pageManager}
                    widgetClass={w}
                />
            </div>
        );
    });

    const widgetRowRef = useRef(null);

    function selectThisPanel() {
        //If there is a previous selected panel, render unselection
        if (
            params.pageManager.unselectPanel &&
            params.pageManager.selectedPanel !== params.panelIdx
        ) {
            //Ensure previous widget is unselected
            params.pageManager.selectedWidget = -1;
            if (params.pageManager.unselectWidget) params.pageManager.unselectWidget();
            params.pageManager.unselectPanel();
        }

        //Update class state
        params.pageManager.selectedPanel = params.panelIdx;
        params.pageManager.unselectPanel = () => setHighlighted(false);
        setHighlighted(true);

        //Force sidebar to refresh by setting the tab
        params.pageManager.setSidebarTab('panelTab');
        params.pageManager.refreshPanelOptions();
    }

    useEffect(() => {
        //This was the first panel
        if (params.pageManager.selectedPanel === -1) selectThisPanel();

        if (snapRight <= 0 && widgetRowRef.current)
            widgetRowRef.current.scrollLeft = widgetRowRef.current.scrollWidth;
    });
    return (
        <div className={highlighted ? 'panel panelactive' : 'panel'}>
            <Accordion defaultActiveKey='0'>
                <Accordion.Item eventKey='0' onClick={() => selectThisPanel()}>
                    <Accordion.Header className=''>
                        <div className='title'>{panel.getName()}</div>
                    </Accordion.Header>

                    <Accordion.Body className='body'>
                        <Resizable
                            ref={widgetRowRef}
                            onResize={onResize}
                            width={0}
                            height={panelHeight}
                        >
                            <span>
                                <div className='panel-body' style={{ height: panelHeight + 'px' }}>
                                    <div ref={widgetRowRef} className='widget-row'>
                                        {widgets}
                                    </div>
                                    <div className='add-widget-btns'>
                                        <button
                                            className='widget-btn'
                                            onClick={() => {
                                                panel.addWidget(
                                                    new BarChart(
                                                        params.pageManager.panels[params.panelIdx]
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
                                                        params.pageManager.panels[params.panelIdx]
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
                                                        params.pageManager.panels[params.panelIdx]
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
                                                        params.pageManager.panels[params.panelIdx]
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
                                                        params.pageManager.panels[params.panelIdx]
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
                                                        params.pageManager.panels[params.panelIdx]
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
