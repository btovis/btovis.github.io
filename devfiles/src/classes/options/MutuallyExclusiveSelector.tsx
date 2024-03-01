import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import Selector from './Selector';

export default class MutuallyExclusiveSelector extends Selector {
    public selected: string;
    public constructor(
        panel: Panel,
        name: string,
        choices: string[] | number,
        default_?: string,
        template: Selector = undefined
    ) {
        if (default_ === undefined) {
            default_ = choices[0];
        }
        super(panel, name, choices, false, [default_], template);
        this.selected = default_;
    }
    protected inputType(): string {
        return 'radio';
    }
    public callback(newValue: any): void {
        this.selected = newValue.item;
        super.callback(newValue);
    }
}
