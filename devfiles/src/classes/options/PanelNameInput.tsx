import { OverlayTrigger, Tooltip } from 'react-bootstrap';
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
    public refreshAutomatically: boolean = true;
    private refresher: () => void;

    //Row counts are here because this is easily available for refreshing in isolation
    public render(): JSX.Element {
        return (
            <div className='sidebarContainer'>
                <input
                    className='form-control form-control-lg'
                    defaultValue={this.text}
                    onBlur={(e) => this.callback(e.target.value)}
                    onKeyUp={(e) => {
                        if (e.key == 'Enter') {
                            this.callback(e.currentTarget.value);
                            e.currentTarget.blur();
                        }
                    }}
                />
                <span className='text-muted mt-3'>
                    {this.panel.dataFilterer.getData()[1]} rows active
                </span>
                <br />
                <span className='text-muted'>
                    (
                    {this.panel.dataFilterer.getData()[0].length -
                        this.panel.dataFilterer.getData()[1]}{' '}
                    filtered)
                </span>
                <br></br>
                <OverlayTrigger
                    overlay={(props) => (
                        <Tooltip {...props}>
                            Advanced Option. Untick this when the file is very large. This lets you
                            choose when to render the graphics, so not every filter change triggers
                            a lag spike.
                        </Tooltip>
                    )}
                >
                    <div className='form-check'>
                        <input
                            onChange={(event) => {
                                this.refreshAutomatically = event.currentTarget.checked;
                                this.refreshComponent();
                            }}
                            defaultChecked={this.refreshAutomatically}
                            className='form-check-input'
                            type='checkbox'
                            id={this.uuid + '-automatic-refresh'}
                        />
                        <label
                            className='form-check-label selectorLabel'
                            htmlFor={this.uuid + '-automatic-refresh'}
                        >
                            Refresh Automatically
                        </label>
                        {!this.refreshAutomatically ? (
                            <button
                                onClick={this.refresher}
                                className='btn btn-danger'
                                type='button'
                            >
                                Refresh
                            </button>
                        ) : (
                            <></>
                        )}
                    </div>
                </OverlayTrigger>
            </div>
        );
    }

    public constructor(panel: Panel, name: string, text, refresher: () => void) {
        super(panel, name);
        this.text = text;
        this.refresher = refresher;
    }

    public callback(newValue): void {
        this.text = newValue;

        //Refresh to show new panel name
        this.panel.refreshComponent();
        //Refresh sidebar for new panel name too
        this.refreshComponent();
    }
    public query(): Query {
        throw new Error('Method not implemented.');
    }
    public value(): string {
        return this.text;
    }
}
