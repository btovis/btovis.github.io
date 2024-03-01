import { useEffect, useState, useRef } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import * as Icon from 'react-bootstrap-icons';
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
    const onResize = (event, { node, size, handle }) => {
        setPanelHeight(Math.max(panel.minHeight, size.height));
    };

    const iconSize = 48;

    const panel = params.pageManager.panels[params.panelIdx];
    const [panelHeight, setPanelHeight] = useState(panel.minHeight);
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

    function selectThisPanel() {
        //If there is a previous selected panel, render unselection
        if (params.pageManager.unselectPanel) params.pageManager.unselectPanel();

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

    function addwidget(widget) {
        panel.addWidget(new widget(params.pageManager.panels[params.panelIdx], new WidgetConfig()));
        //If negative, scroll rightwards
        setSnapRight(-Math.abs(snapRight) - 1);
    }

    return (
        <div className={highlighted ? 'panel panelactive' : 'panel'}>
            <Accordion defaultActiveKey='0'>
                <Accordion.Item eventKey='0' onClick={() => selectThisPanel()}>
                    <Accordion.Header className=''>
                        <div className='title'>{panel.getName()}</div>
                    </Accordion.Header>

                    <Accordion.Body>
                        <Resizable
                            ref={widgetRowRef}
                            onResize={onResize}
                            width={0}
                            height={panelHeight}
                        >
                            <span>
                                <div className='panel-body' style={{ height: panelHeight + 'px' }}>
                                    <div className='widget-row'>
                                        {widgets}
                                        <div className='add-widget-row'>
                                            <div className='show-widget-icons'>
                                                <Icon.PlusCircle
                                                    size={iconSize}
                                                    className='show-widget-icons'
                                                />
                                                <div className='tool-tip'>Add widget</div>
                                            </div>

                                            <div className='widget-icon-row'>
                                                <div
                                                    className='widget-icon'
                                                    onClick={() => {
                                                        addwidget(BarChart);
                                                    }}
                                                >
                                                    <Icon.BarChart
                                                        size={iconSize}
                                                        className='widget-icon'
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
                                                        size={iconSize}
                                                        className='widget-icon'
                                                    />
                                                    <div className='tool-tip'>Linechart</div>
                                                </div>

                                                <div
                                                    className='widget-icon'
                                                    onClick={() => {
                                                        addwidget(StackedLineChart);
                                                    }}
                                                >
                                                    <Icon.GraphUp
                                                        size={iconSize}
                                                        className='widget-icon'
                                                    />
                                                    <div className='tool-tip'>
                                                        Stacked linechart
                                                    </div>
                                                </div>

                                                <div
                                                    className='widget-icon'
                                                    onClick={() => {
                                                        addwidget(TableWidget);
                                                    }}
                                                >
                                                    <Icon.Table
                                                        size={iconSize}
                                                        className='widget-icon'
                                                    />
                                                    <div className='tool-tip'>Table</div>
                                                </div>

                                                <div
                                                    className='widget-icon'
                                                    onClick={() => {
                                                        addwidget(Map);
                                                    }}
                                                >
                                                    <Icon.GeoAlt
                                                        size={iconSize}
                                                        className='widget-icon'
                                                    />
                                                    <div className='tool-tip'>Map</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='add-widget-btns'>
                                        <button className='widget-btn' onClick={() => {}}>
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
