import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import RangeQuery from '../query/RangeQuery';
import { Attribute } from '../data/Data';

export default class TimeRange extends InputOption {
    private feedbackOnChanged: boolean;
    private debounceTimer;
    private minDate: Dayjs;
    private maxDate: Dayjs;
    public fromDate: Dayjs;
    public toDate: Dayjs;

    public constructor(
        panel: Panel,
        name: string,
        template?: TimeRange,
        feedbackOnChanged: boolean = false
    ) {
        super(panel, name);
        this.feedbackOnChanged = feedbackOnChanged;

        const timeMeta = panel.dataFilterer.getDataStats().getTimeMeta();
        this.minDate = dayjs(new Date(timeMeta.low()));
        this.maxDate = dayjs(new Date(timeMeta.up()));

        //Copy the current state from the old template
        if (template === undefined) {
            this.fromDate = this.minDate;
            this.toDate = this.maxDate;
        } else {
            //If the template was set to minimum date, follow suit.
            //If not, follow the template
            if (template.fromDate.isSame(template.minDate)) this.fromDate = this.minDate;
            else
                this.fromDate = this.minDate.isBefore(template.fromDate)
                    ? template.fromDate
                    : this.minDate;
            //same for max
            if (template.toDate.isSame(template.toDate)) this.toDate = this.maxDate;
            else
                this.toDate = this.maxDate.isAfter(template.toDate)
                    ? template.toDate
                    : this.maxDate;
            this.accordionOpen = template.accordionOpen;
        }
    }

    public render(): JSX.Element {
        return this.generateAccordion(
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div>
                    <DatePicker
                        label='From'
                        format='YYYY/MM/DD'
                        defaultValue={this.fromDate}
                        minDate={this.minDate}
                        maxDate={this.toDate}
                        onChange={(value) => {
                            if (
                                (this.minDate.isBefore(value) || this.minDate.isSame(value)) &&
                                (this.maxDate.isAfter(value) || this.maxDate.isSame(value))
                            ) {
                                this.callback({
                                    which: 0,
                                    datetime: value
                                });
                            }
                        }}
                    />
                    <p></p>
                    <DatePicker
                        label='To'
                        format='YYYY/MM/DD'
                        defaultValue={this.toDate}
                        minDate={this.fromDate}
                        maxDate={this.maxDate}
                        onChange={(value) => {
                            if (
                                (this.minDate.isBefore(value) || this.minDate.isSame(value)) &&
                                (this.maxDate.isAfter(value) || this.maxDate.isSame(value))
                            ) {
                                this.callback({
                                    which: 1,
                                    datetime: value
                                });
                            }
                        }}
                    />
                    <button
                        style={{ marginTop: '5px' }}
                        type='button'
                        className='btn btn-secondary btn-sm'
                        onClick={() => this.callback({ which: 2, datetime: null })}
                    >
                        Reset
                    </button>
                </div>
            </LocalizationProvider>
        );
    }

    protected checkDefault() {
        return this.isDefaultRange();
    }

    private isDefaultRange() {
        return (
            Math.abs(this.fromDate.diff(this.minDate, 'day')) +
                Math.abs(this.toDate.diff(this.maxDate, 'day')) ==
            0
        );
    }

    public callback(newValue: { which: number; datetime: Dayjs }): void {
        if (newValue.which === 0) {
            this.fromDate = newValue.datetime;
        } else if (newValue.which === 1) {
            this.toDate = newValue.datetime;
        } else {
            this.fromDate = this.minDate;
            this.toDate = this.maxDate;
        }

        this.titleItalics = this.feedbackOnChanged && !this.checkDefault() ? true : false;

        if (this.debounceTimer !== undefined) clearTimeout(this.debounceTimer);

        this.debounceTimer = setTimeout(() => {
            this.panel.recalculateFilters(this);
            //Refresh to update the associated panel and its widgets
            this.panel.refreshComponent();
            this.panel.refreshWidgets();

            //This is still needed for the italics
            this.refreshComponent();
        }, 600);
        //delay the debounce for a bit longer than 300, because its really fiddly
    }
    public query(): Query {
        let fromDate: string | number;
        if (
            !this.fromDate.isValid() ||
            (this.minDate.isValid() && !this.fromDate.isAfter(this.minDate))
        )
            fromDate = -Infinity;
        else fromDate = this.fromDate.format('YYYY-MM-DD');

        let toDate: string | number;
        if (
            !this.toDate.isValid() ||
            (this.maxDate.isValid() && !this.toDate.isBefore(this.maxDate))
        )
            toDate = Infinity;
        else toDate = this.toDate.format('YYYY-MM-DD');

        return new RangeQuery(this.panel.dataFilterer.getColumnIndex(Attribute.actualDate)).query(
            fromDate,
            toDate
        );
    }
}
