// import Panel from '../Panel';
// import { Query } from '../query/Query';
// import InputOption from './InputOption';
// import Accordion from 'react-bootstrap/Accordion';
// import { AccordionHeader, AccordionItem } from 'react-bootstrap';
//
// export default class ColorOption extends InputOption {
//     // States that ColorOption hold
//     public selectedColor: Array<string>;
//     public numTraces: number;
//     public palette: Array<string>;
//     public accordionOpen: boolean;
//
//     public constructor(panel: Panel, name: string, numTraces: number, template: ColorOption) {
//         super(panel, name);
//         this.numTraces = numTraces;
//         this.accordionOpen = false;
//
//         if(template == undefined){
//             this.palette = [
//                 '#039cad',
//                 '#ce4458',
//                 '#d69c46',
//                 '#5d7def',
//                 '#70ce29',
//                 '#fc7a2f',
//                 '#2c48ba',
//                 '#ce2b43',
//                 '#ea4ba2',
//                 '#5dbc29',
//                 '#f26f52',
//                 '#b7852d',
//                 '#ea1932',
//                 '#0ed80a',
//                 '#46c60f',
//                 '#dd5db2',
//                 '#222e96',
//                 '#ba0088',
//                 '#fcf016',
//                 '#930524',
//                 '#d30684',
//                 '#36d1ac',
//                 '#f2dc15',
//                 '#14706e',
//                 '#092268',
//                 '#1ab4ba',
//                 '#aed33d',
//                 '#adef51',
//                 '#471687',
//                 '#270799',
//                 '#bc6ef4',
//                 '#87c627',
//                 '#f72ec1',
//                 '#0345a3',
//                 '#20137c',
//                 '#e35ee5',
//                 '#990f3f',
//                 '#8af74f',
//                 '#a441ea',
//                 '#b210cc'
//             ];
//         } else this.palette = template.palette;
//     }
//
//     // ColorOptions implementation of getTraceComponent
//     public getTraceComponent(traceValue: any, index: number){
//         return(<div className="colorPicker">
//             <input
//                 type="text"
//                 value={traceValue}
//                 onChange={(e) => {
//                     this.callback({ value: e.target.value, idx: index });
//                 }}
//             />
//             <input
//                 type="color"
//                 value={traceValue}
//                 onChange={(e) => {
//                     this.callback({ value: e.target.value, idx: index });
//                 }}
//             />
//         </div>);
//     }
//
//     public render(): JSX.Element {
//         return (
//             <Accordion
//                 onSelect={(eventKey) => {
//                     this.accordionOpen = typeof eventKey === 'string';
//                 }}
//                 defaultActiveKey={this.accordionOpen ? '0' : []}
//             >
//                 <Accordion.Item eventKey='0'>
//                     <Accordion.Header>
//                         <span>
//                             <strong id={this.uuid.toString() + 'title'}>{this.name}</strong>
//                         </span>
//                     </Accordion.Header>
//                     <Accordion.Body>
//                         // Have a color option rendered for every color in palette within numTraces
//                         <div className='ColorOptions'>
//                             {this.palette.slice(0, this.numTraces).map(this.getTraceComponent)}
//                         </div>
//                     </Accordion.Body>
//                 </Accordion.Item>
//             </Accordion>
//         );
//     }
//
//     public callback(newValue: any): void {
//         // Update palette
//         this.palette[newValue.idx] = newValue.value;
//         // Update Selected Color
//         this.selectedColor = newValue;
//         // Refresh the sidebar component of this option
//         this.refreshComponent();
//         // Refresh the relavent Graph Widget
//         this.extendedCallbacks.forEach((f) => f(newValue));
//     }
//     public query(): Query {
//         throw new Error('Method not implemented.');
//     }
//     public value(): string {
//         return this.selectedColor;
//     }
// }
