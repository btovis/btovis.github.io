import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';

export default class TimeRange extends InputOption {
    private minDate: Dayjs;
    private maxDate: Dayjs;
    public fromDate: Dayjs;
    public toDate: Dayjs;

    public constructor(panel: Panel, name: string, minDate: Date, maxDate: Date) {
        super(panel, name);
        this.minDate = dayjs(minDate);
        this.maxDate = dayjs(maxDate);
        this.fromDate = this.minDate;
        this.toDate = this.maxDate;
    }

    public render(): JSX.Element[] {
        return [
            <div className='sidebar-padding'>
                <p>
                    <strong>Filter by time</strong>
                </p>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label='From'
                        format='YYYY/MM/DD h:mm A'
                        defaultValue={this.minDate}
                        minDate={this.minDate}
                        maxDate={this.toDate}
                        onChange={(value) =>
                            this.callback({
                                which: 0,
                                datetime: value
                            })
                        }
                    />
                    <p></p>
                    <DatePicker
                        label='To'
                        format='YYYY/MM/DD h:mm A'
                        defaultValue={this.maxDate}
                        minDate={this.fromDate}
                        maxDate={this.maxDate}
                        onChange={(value) =>
                            this.callback({
                                which: 1,
                                datetime: value
                            })
                        }
                    />
                    <p className='text-warning' id='warning-if-time-range-zero'></p>
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
