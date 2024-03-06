import { useEffect, useState, useRef } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import * as Icon from 'react-bootstrap-icons';
import '../App.css';
import PageManager from '../classes/PageManager.js';
import LineChart from '../classes/widgets/LineChart.js';
import WidgetComp from './WidgetComp.js';
import BarChart from '../classes/widgets/BarChart.js';
import MapWidget from '../classes/widgets/MapWidget.js';
import TableWidget from '../classes/widgets/TableWidget.js';
import { Resizable } from 'react-resizable';
import { CloseButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import generateHash from '../utils/generateHash.js';
import TimeChart from '../classes/widgets/TimeChart.js';
import { exportCSV } from '../classes/data/datautils/exportCSV.js';

function PanelComp(params: { panelIdx: number; pageManager: PageManager }) {
    //State machine mechanism. Have this arbitrary integer for a makeshift refresh
    const [snapDown, setSnapDown] = useState(1);
    const [highlighted, setHighlighted] = useState(false);
    const refreshComponent = () => setSnapDown(Math.abs(snapDown) + 1);
    const onResize = (eveiw_nt, { size }) => {
        setPanelHeight(Math.max(panel.minHeight, size.height));
    };

    const iconSize = 50;

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

        const fullscreenButton = (
            <Icon.ArrowsFullscreen
                className='fullscreen-widget'
                onClick={(event) => {
                    event.stopPropagation();
                    (w as TimeChart).showFullscreen();
                }}
            ></Icon.ArrowsFullscreen>
        );

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
                {fullscreenButton}
                <h3 className='widgetTitle mb-1'>{w.name}</h3>
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
    });

    function addwidget(widget) {
        panel.addWidget(new widget(panel));
        refreshComponent();
        //wait 1 ms before scrolling panel down, to give time for plotly plot
        setTimeout(function () {
            scrollPanelDown();
        }, 1);
    }

    function scrollPanelDown() {
        widgetRowRef.current.scrollTo({
            top: widgetRowRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }

    return (
        <div
            className={
                (highlighted ? 'panel panelactive' : 'panel') +
                (panel.needsManualRefresh ? ' panel-need-refresh' : '')
            }
        >
            <Accordion defaultActiveKey='0'>
                <Accordion.Item eventKey='0' onClick={() => selectThisPanel()}>
                    <Accordion.Header className=''>
                        <h3 className='title'>{panel.getName()}</h3>
                        {panel.needsManualRefresh ? (
                            <OverlayTrigger
                                overlay={(props) => (
                                    <Tooltip {...props}>
                                        Refresh this panel to apply the current filters.
                                    </Tooltip>
                                )}
                            >
                                <button
                                    style={{ marginLeft: '10px' }}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        panel.manualRefresh();
                                    }}
                                    className='btn btn-danger'
                                    type='button'
                                >
                                    Refresh
                                </button>
                            </OverlayTrigger>
                        ) : (
                            <></>
                        )}
                    </Accordion.Header>

                    <Accordion.Body className='body p-0'>
                        <Resizable onResize={onResize} width={0} height={panelHeight}>
                            <span>
                                <div className='panel-body' style={{ height: panelHeight + 'px' }}>
                                    <div
                                        className='widget-row'
                                        ref={widgetRowRef}
                                        style={{ height: panelHeight }}
                                    >
                                        {widgets}
                                    </div>
                                    <div className='add-widget-row'>
                                        <div
                                            className='show-widget-icons'
                                            onClick={() => {
                                                scrollPanelDown();
                                            }}
                                        >
                                            <Icon.PlusCircle
                                                size={iconSize}
                                                className='show-widget-icons'
                                            />
                                        </div>

                                        <div className='widget-icon-row'>
                                            <div
                                                className='widget-icon'
                                                onClick={() => {
                                                    addwidget(BarChart);
                                                }}
                                            >
                                                <Icon.BarChart
                                                    color='#4ea0e4'
                                                    size={iconSize}
                                                    className='widget-icon-inner'
                                                />
                                                <div className='tool-tip'>Barchart</div>
                                            </div>

                                            <div
                                                className='widget-icon'
                                                onClick={() => {
                                                    addwidget(LineChart);
                                                }}
                                            >
                                                <Icon.GraphUp
                                                    color='#4ea0e4'
                                                    size={iconSize}
                                                    className='widget-icon-inner'
                                                />
                                                <div className='tool-tip'>Linechart</div>
                                            </div>

                                            <div
                                                className='widget-icon'
                                                onClick={() => {
                                                    addwidget(TableWidget);
                                                }}
                                            >
                                                <Icon.Table
                                                    color='#4ea0e4'
                                                    size={iconSize}
                                                    className='widget-icon-inner'
                                                />
                                                <div className='tool-tip'>Table</div>
                                            </div>

                                            <div
                                                className='widget-icon'
                                                onClick={() => {
                                                    addwidget(MapWidget);
                                                }}
                                            >
                                                <Icon.GeoAlt
                                                    color='#4ea0e4'
                                                    size={iconSize}
                                                    className='widget-icon-inner'
                                                />
                                                <div className='tool-tip'>Map</div>
                                            </div>
                                            <div
                                                className='widget-icon'
                                                onClick={() => {
                                                    const array = exportCSV(panel.dataFilterer);
                                                    if (array.length > 1000000000)
                                                        window.alert(
                                                            'Resultant file larger than 1 GB. This might not work depending on your browser'
                                                        );
                                                    const blob = new Blob([array], {
                                                        type: 'application/octet-stream'
                                                    });
                                                    const url = URL.createObjectURL(blob);
                                                    const elem =
                                                        document.getElementById('invisibleDiv');
                                                    // @ts-expect-error: how to change ts to allow href?
                                                    elem.href = url;
                                                    // @ts-expect-error: how to change ts to allow download?
                                                    elem.download = panel.getName() + '.csv';
                                                    setTimeout(() => elem.click(), 0);
                                                    setTimeout(
                                                        () => URL.revokeObjectURL(url),
                                                        10000
                                                    );
                                                }}
                                            >
                                                <Icon.Download
                                                    size={iconSize}
                                                    className='widget-icon'
                                                />
                                                <div className='tool-tip'>
                                                    Download Filtered CSV
                                                </div>
                                            </div>
                                        </div>
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
