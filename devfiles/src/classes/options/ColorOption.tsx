import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';

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
        this.refreshComponent();
        this.panel.refreshWidgetsRender();
    }
    public query(): Query {
        throw new Error('Method not implemented.');
    }
    public value(): string {
        return this.selectedColor;
    }
}
