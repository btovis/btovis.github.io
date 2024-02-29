import { useEffect, useState, useRef } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import { Container, Button, Link } from 'react-floating-action-button';
import '../App.css';
import React from 'react';
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
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

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
                                        <div className='mb-2'>
                                            <Dropdown drop='end'>
                                                <Dropdown.Toggle
                                                    variant='success'
                                                    id='dropdown-basic'
                                                >
                                                    Add
                                                </Dropdown.Toggle>

                                                <Dropdown.Menu>
                                                    <Dropdown.Item href='#/action-1'>
                                                        Barchart
                                                    </Dropdown.Item>
                                                    <Dropdown.Item href='#/action-2'>
                                                        Table
                                                    </Dropdown.Item>
                                                    <Dropdown.Item href='#/action-1'>
                                                        Line Graph
                                                    </Dropdown.Item>
                                                    <Dropdown.Item href='#/action-2'>
                                                        Stacked Line Graph
                                                    </Dropdown.Item>
                                                    <Dropdown.Item href='#/action-1'>
                                                        Map
                                                    </Dropdown.Item>
                                                    <Dropdown.Item href='#/action-2'>
                                                        Debug Widget
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>

                                        <Container>
                                            <Link
                                                href='#'
                                                tooltip='Create note link'
                                                icon='far fa-sticky-note'
                                            />
                                            <Link
                                                href='#'
                                                tooltip='Add user link'
                                                icon='fas fa-user-plus'
                                            />
                                            className="fab-item btn btn-link btn-lg text-white"
                                            <Button
                                                tooltip='The big plus button!'
                                                icon='fas fa-plus'
                                                rotate={true}
                                                onClick={() => alert('FAB Rocks!')}
                                            />
                                        </Container>
                                    </div>
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
