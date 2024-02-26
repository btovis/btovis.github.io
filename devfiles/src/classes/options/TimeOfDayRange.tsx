import { DatePicker, LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import RangeQuery from '../query/RangeQuery';
import { Attribute } from '../data/Data';

export default class TimeRange extends InputOption {
    public fromTime: Dayjs;
    public toTime: Dayjs;

    public constructor(panel: Panel, name: string, template?: TimeRange) {
        super(panel, name);

        //Copy the current state from the old template
        if (template === undefined) {
            this.fromTime = dayjs('00:00:00', 'HH:mm:ss');
            this.toTime = dayjs('23:59:59', 'HH:mm:ss');
        } else {
            this.fromTime = template.fromTime;
            this.toTime = template.toTime;
        }
    }

    public render(): JSX.Element {
        return (
            <div className='sidebar-padding'>
                <p>
                    <strong>{this.name}</strong>
                </p>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div style={{ display: 'inline-block' }}>
                        <div style={{ width: '50%', float: 'left' }}>
                            <TimePicker
                                ampm={false}
                                label='From'
                                format='HH:mm'
                                value={dayjs(this.fromTime, 'HH:mm')}
                                onChange={(value) =>
                                    this.callback({
                                        which: 0,
                                        time: value
                                    })
                                }
                            />
                        </div>
                        <div style={{ width: '50%', float: 'right' }}>
                            <TimePicker
                                ampm={false}
                                label='To'
                                format='HH:mm'
                                value={dayjs(this.toTime, 'HH:mm')}
                                onChange={(value) =>
                                    this.callback({
                                        which: 1,
                                        time: value
                                    })
                                }
                            />
                        </div>
                    </div>
                </LocalizationProvider>
            </div>
        );
    }
    public callback(newValue: { which: number; time: Dayjs }): void {
        if (newValue.which === 0) {
            this.fromTime = newValue.time.isBefore(this.toTime) ? newValue.time : this.toTime;
        } else {
            this.toTime = newValue.time.isAfter(this.fromTime) ? newValue.time : this.fromTime;
        }

        this.panel.recalculateFilters(this);
        //Refresh to update the associated panel and its widgets
        this.panel.refreshComponent();
        //Refresh this inputoption
        this.refreshComponent();
    }
    public query(): Query {
        let lowerLimit: number | string = this.fromTime.format('HH:mm:ss');
        if (lowerLimit == '00:00:00') {
            lowerLimit = -Infinity;
        }
        const upperLimit: number | string = this.toTime.format('HH:mm:ss');
        if (lowerLimit == '23:59:59') {
            lowerLimit = Infinity;
        }
        return new RangeQuery(this.panel.dataFilterer.getColumnIndex(Attribute.time)).query(
            lowerLimit,
            upperLimit
        );
    }
}
