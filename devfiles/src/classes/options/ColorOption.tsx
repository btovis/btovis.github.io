import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';

/**
 * This class was made to show how to render an InputOption, but this isn't a
 * normal InputOption. It doesn't create a filter as all it does is rename the
 * panel.
 */

export default class ColorOption extends InputOption {
    public constructor(panel: Panel, name: string, defaultColor: string) {
        super(panel, name);
        this.selectedColor = defaultColor;
    }

    public selectedColor: string;

    public render(): JSX.Element {
        return (
            <div className='colorPicker'>
                <input
                    type='text'
                    value={this.selectedColor}
                    onChange={(e) => {
                        this.callback(e.target.value);
                    }}
                />
                <input
                    type='color'
                    value={this.selectedColor}
                    onChange={(e) => {
                        this.callback(e.target.value);
                    }}
                />
            </div>
        );
    }

    public callback(newValue: any): void {
        this.selectedColor = newValue;

        //Refresh to show new panel name
        this.panel.refreshComponent();
        this.panel.refreshWidgets();
        //Refresh sidebar for new panel name too
        this.refreshComponent();
    }
    public query(): Query {
        throw new Error('Method not implemented.');
    }
    public value(): string {
        return this.selectedColor;
    }
}
