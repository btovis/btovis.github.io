import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import Accordion from 'react-bootstrap/Accordion';
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';
import { useMemo, useState } from 'react';

export default class ColorOption extends InputOption {
    // States that ColorOption hold
    public numTraces: number;
    public traceValList: Array<string>;
    public accordionOpen: boolean;

    public constructor(panel: Panel, name: string, numTraces: number, template?: ColorOption) {
        super(panel, name);
        this.numTraces = numTraces;
        this.accordionOpen = false;
        if (template == undefined) {
            this.traceValList = [
                '#039cad',
                '#ce4458',
                '#d69c46',
                '#5d7def',
                '#70ce29',
                '#fc7a2f',
                '#2c48ba',
                '#ce2b43',
                '#ea4ba2',
                '#5dbc29',
                '#f26f52',
                '#b7852d',
                '#ea1932',
                '#0ed80a',
                '#46c60f',
                '#dd5db2',
                '#222e96',
                '#ba0088',
                '#fcf016',
                '#930524',
                '#d30684',
                '#36d1ac',
                '#f2dc15',
                '#14706e',
                '#092268',
                '#1ab4ba',
                '#aed33d',
                '#adef51',
                '#471687',
                '#270799',
                '#bc6ef4',
                '#87c627',
                '#f72ec1',
                '#0345a3',
                '#20137c',
                '#e35ee5',
                '#990f3f',
                '#8af74f',
                '#a441ea',
                '#b210cc'
            ];
        } else this.traceValList = template.traceValList;
    }

    // ColorOptions implementation of getTraceComponent
    public getTraceComponent(traceValue: any, index: number) {
        const textField = <input type='text' value={traceValue} readOnly={true} />;
        const colorField = (
            <input
                type='color'
                value={traceValue}
                onBlur={(e) => {
                    this.callback(e.target.value);
                    this.refreshComponent();
                }}
                onChange={(e) => (this.traceValList[index] = e.target.value)}
            />
        );

        return (
            <div className='colorPicker' key={uuidv4()}>
                <span>Color of Trace {index}: </span>
                {colorField}
                {textField}
            </div>
        );
    }

    public updateNumTraces(numTraces: number): void {
        this.numTraces = numTraces;
        this.refreshComponent();
    }

    public render(): JSX.Element {
        return (
            <Accordion
                onSelect={(eventKey) => {
                    this.accordionOpen = typeof eventKey === 'string';
                }}
                defaultActiveKey={this.accordionOpen ? '0' : []}
            >
                <Accordion.Item eventKey='0'>
                    <Accordion.Header>
                        <span>
                            <strong id={this.uuid.toString() + 'title'}>{this.name}</strong>
                        </span>
                    </Accordion.Header>
                    <Accordion.Body>
                        <div className='ColorOptions'>
                            {this.traceValList
                                .slice(0, this.numTraces)
                                .map((color, index) => this.getTraceComponent(color, index))}
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        );
    }

    public callback(newValue): void {
        console.log('called');
        this.extendedCallbacks.forEach((f) => f(newValue));
    }
    public query(): Query {
        throw new Error('Method not implemented.');
    }
    public value(): any[] {
        return this.traceValList.slice(0, this.numTraces);
    }
}
