import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker, dateTimePickerTabsClasses } from '@mui/x-date-pickers/DateTimePicker';
import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';

export default class TimeRange extends InputOption {
    private minDate: Date;
    private maxDate: Date;
    public fromDate: Date;
    public toDate: Date;

    public constructor(panel: Panel, name: string, minDate: Date, maxDate: Date) {
        super(panel, name);
        this.minDate = minDate;
        this.maxDate = maxDate;
    }

    public render(): JSX.Element[] {
        return [
            <div>
                <p id='elephant'>elephant</p>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                        label='From'
                        minDateTime={this.minDate}
                        onChange={(value) =>
                            this.callback({
                                which: 0,
                                datetime: value
                            })
                        }
                    />
                    <DateTimePicker label='To' />
                </LocalizationProvider>
            </div>
        ];
    }
    public callback(newValue: any): void {
        if (newValue.which === 0) {
            this.fromDate = newValue.datetime;
        } else {
            this.toDate = newValue.datetime;
        }
    }
    public query(): Query {
        throw new Error('Method not implemented.');
    }
}
