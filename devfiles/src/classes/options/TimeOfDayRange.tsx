import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import SwappableRangeQuery from '../query/SwappableRangeQuery';
import { Attribute } from '../data/Data';

export default class TimeRange extends InputOption {
    private feedbackOnChanged: boolean;
    private debounceTimer;
    public fromTime: Dayjs;
    public toTime: Dayjs;

    public constructor(
        panel: Panel,
        name: string,
        template?: TimeRange,
        feedbackOnChanged: boolean = false
    ) {
        super(panel, name);
        this.feedbackOnChanged = feedbackOnChanged;

        //Copy the current state from the old template
        if (template === undefined) {
            this.fromTime = dayjs('00:00', 'HH:mm');
            this.toTime = dayjs('23:59', 'HH:mm');
        } else {
            this.fromTime = template.fromTime;
            this.toTime = template.toTime;
            this.accordionOpen = template.accordionOpen;
        }
    }

    public render(): JSX.Element {
        return this.generateAccordion(
            <LocalizationProvider dateAdapter={AdapterDayjs} key={this.uuid}>
                <div style={{ display: 'inline-block' }}>
                    <div style={{ width: '50%', float: 'left' }}>
                        <TimePicker
                            ampm={false}
                            label='From'
                            format='HH:mm'
                            defaultValue={dayjs(this.fromTime, 'HH:mm')}
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
                            defaultValue={dayjs(this.toTime, 'HH:mm')}
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
        );
    }

    protected checkDefault() {
        const diff = this.fromTime.diff(this.toTime, 'm');
        return diff == 1 || diff == -1439; // 1440 minutes in a day
    }

    public callback(newValue: { which: number; time: Dayjs }): void {
        if (newValue.which === 0) {
            this.fromTime = newValue.time;
        } else {
            this.toTime = newValue.time;
        }
        this.titleItalics = this.feedbackOnChanged && !this.checkDefault() ? true : false;

        if (this.debounceTimer) clearTimeout(this.debounceTimer);

        this.debounceTimer = setTimeout(() => {
            this.panel.recalculateFilters(this);
            this.panel.refreshComponent();
            this.panel.refreshWidgets();
            this.refreshComponent(); //for Italics
        }, 600);
    }
    public query(): Query {
        let fromTime: string | number = this.fromTime.format('HH:mm');
        let toTime: string | number = this.toTime.add(1, 'm').format('HH:mm');
        if (fromTime.endsWith(':00')) {
            fromTime = fromTime.slice(0, -3);
            if (fromTime == '00') {
                fromTime = -Infinity;
            }
        }
        if (toTime.endsWith(':00')) {
            toTime = toTime.slice(0, -3);
            if (toTime == '00') {
                toTime = Infinity;
            }
        }
        return new SwappableRangeQuery(
            this.panel.dataFilterer.getColumnIndex(Attribute.time)
        ).query(fromTime, toTime);
    }
}
