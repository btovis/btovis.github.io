import Panel from '../Panel';
import Selector from './Selector';

export default class BinarySelector extends Selector {
    private defaultChoice: boolean;
    public constructor(
        panel: Panel,
        name: string,
        choice: string,
        selected: boolean = false,
        template: Selector = undefined
    ) {
        super(panel, name, [choice], false, selected ? [choice] : [], template);
        this.defaultChoice = selected;
        this.hideSelectAll = true;
    }

    protected checkDefault(): boolean {
        return this.isEverythingSelected() == this.defaultChoice;
    }
}
