// import Panel from '../Panel';
// import { Query } from '../query/Query';
// import InputOption from './InputOption';
// import Select from 'react-dropdown-select';

// export default class DropMenuSelector extends InputOption {
//     // internal state
//     // to deal with enums, options must be passed in with correct order.
//     private options: Array<object> = [];
//     // index recorded as currentOption
//     private currentOption: number;
//     /**
//      * @param panel the associated panel
//      * @param name Name of Selector Option
//      * @param optionList List of strings in the order wanted, will map one-by-one with its index.
//      */
//     constructor(panel: Panel, name: string, optionList: Array<string>) {
//         super(panel, name);
//         optionList.forEach((option, index) => {
//             this.options.push({ value: index + 1, label: option });
//         });
//     }

//     public render(): JSX.Element {
//         return <Select options={this.options} onChange={(values) => this.callback(values)} />;
//     }

//     public callback(newValue: any) {
//         this.currentOption = newValue[0].value - 1;

//         //Refresh to show new panel name
//         this.panel.refreshComponent();
//         this.panel.refreshWidgets();
//         //Refresh sidebar for new panel name too
//         this.refreshComponent();
//     }
//     public query(): Query {
//         throw new Error('Method not implemented.');
//     }
//     public value(): number {
//         return this.currentOption;
//     }
// }
