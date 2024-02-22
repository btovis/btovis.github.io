import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';

/**
 * This class was made to show how to render an InputOption, but this isn't a
 * normal InputOption. It doesn't create a filter as all it does is rename the
 * panel.
 */
export default class PanelNameInput extends InputOption {
    private text: string;

    public render(): JSX.Element[] {
        console.log('Rendering PanelNameInput: ' + this.text);
        return [
            <div>
                <span>Panel Name: </span>
                <input
                    defaultValue={this.text}
                    onBlur={(e) => this.callback(e.target.value)}
                    onKeyUp={(e) => {
                        if (e.key == 'Enter') {
                            this.callback(e.currentTarget.value);
                            e.currentTarget.blur();
                        }
                    }}
                />
                <hr></hr>
            </div>
        ];
    }

    public constructor(panel: Panel, name: string, text) {
        super(panel, name);
        this.text = text;
    }

    public callback(newValue: any): void {
        this.text = newValue;

        //Refresh to show new panel name
        this.panel.refreshComponent();
        //Refresh sidebar for new panel name too
        this.panel.pageManager.refreshPanelOptions();
    }
    public query(): Query {
        throw new Error('Method not implemented.');
    }
    public value(): string {
        return this.text;
    }
}
