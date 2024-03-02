import Panel from '../Panel';
import { v4 as uuidv4 } from 'uuid';
import TraceOption from './TraceOption';

export default class ColorOption extends TraceOption {
    public constructor(panel: Panel, name: string, numTraces: number, template?: ColorOption) {
        super(panel, name, numTraces, template);
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
            // Put duplicates if default palette is not long enough.
            if (numTraces > 40) {
                for (let i = 40; i < numTraces; i++) {
                    this.traceValList.push(this.traceValList[i % 40]);
                }
            }
        } else this.traceValList = template.traceValList;
    }

    // ColorOptions implementation of getTraceComponent
    public getTraceComponent(traceValue: any, index: number): JSX.Element {
        const textField = <input type='text' value={traceValue} readOnly={true} />;
        const colorField = (
            <input
                type='color'
                value={traceValue}
                onBlur={(e) => {
                    this.callback(e.target.value);
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
}
