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
import { CloseButton } from 'react-bootstrap';
import generateHash from '../utils/generateHash.js';
import TimeChart from '../classes/widgets/TimeChart.js';

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
    });

    useEffect(() => {
        if (snapDown <= 0 && widgetRowRef.current)
            widgetRowRef.current.scrollTop = widgetRowRef.current.scrollHeight;
    }, [snapDown]);

    function addwidget(widget) {
        panel.addWidget(new widget(panel));
        setSnapDown(-Math.abs(snapDown) - 1);
    }

    return (
        <div className={highlighted ? 'panel panelactive' : 'panel'}>
            <Accordion defaultActiveKey='0'>
                <Accordion.Item eventKey='0' onClick={() => selectThisPanel()}>
                    <Accordion.Header className=''>
                        <div className='title'>{panel.getName()}</div>
                    </Accordion.Header>

                    <Accordion.Body className='body'>
                        <Resizable onResize={onResize} width={0} height={panelHeight}>
                            <span>
                                <div className='panel-body' style={{ height: panelHeight + 'px' }}>
                                    <div
                                        className='widget-row'
                                        ref={widgetRowRef}
                                        style={{ height: panelHeight - iconSize + 'px' }}
                                    >
                                        {widgets}
                                    </div>
                                    <div className='add-widget-row'>
                                        <div
                                            className='show-widget-icons'
                                            onClick={() => {
                                                setSnapDown(snapDown - 1);
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
