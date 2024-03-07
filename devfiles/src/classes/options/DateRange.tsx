import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import RangeQuery from '../query/RangeQuery';
import { Attribute } from '../data/Data';
import { v4 as uuidv4 } from 'uuid';

export default class TimeRange extends InputOption {
    private feedbackOnChanged: boolean;
    private debounceTimer;
    public actualDateOrNot: number = 0; // 0 for survey date, 1 for actual date
    private minDate: [Dayjs, Dayjs]; // 0 for survey date, 1 for actual date
    private maxDate: [Dayjs, Dayjs]; // 0 for survey date, 1 for actual date
    public fromDate: Dayjs;
    public toDate: Dayjs;
    private renderResetId = 0;

    public constructor(
        panel: Panel,
        name: string,
        template?: TimeRange,
        feedbackOnChanged: boolean = false
    ) {
        super(panel, name);
        this.feedbackOnChanged = feedbackOnChanged;

        const acTimeMeta = panel.dataFilterer.getDataStats().getActualTimeMeta();
        const surTimeMeta = panel.dataFilterer.getDataStats().getSurveyTimeMeta();
        this.minDate = [dayjs(new Date(surTimeMeta.low())), dayjs(new Date(acTimeMeta.low()))];
        this.maxDate = [dayjs(new Date(surTimeMeta.up())), dayjs(new Date(acTimeMeta.up()))];

        //Copy the current state from the old template
        if (template === undefined) {
            this.fromDate = this.minDate[this.actualDateOrNot];
            this.toDate = this.maxDate[this.actualDateOrNot];
        } else {
            this.actualDateOrNot = template.actualDateOrNot;
            //If the template was set to minimum date, follow suit.
            //If not, follow the template
            if (template.fromDate.isSame(template.minDate[this.actualDateOrNot]))
                this.fromDate = this.minDate[this.actualDateOrNot];
            else
                this.fromDate = this.minDate[this.actualDateOrNot].isBefore(template.fromDate)
                    ? template.fromDate
                    : this.minDate[this.actualDateOrNot];
            //same for max
            if (template.toDate.isSame(template.maxDate[this.actualDateOrNot]))
                this.toDate = this.maxDate[this.actualDateOrNot];
            else
                this.toDate = this.maxDate[this.actualDateOrNot].isAfter(template.toDate)
                    ? template.toDate
                    : this.maxDate[this.actualDateOrNot];
            this.accordionOpen = template.accordionOpen;

            if (this.fromDate.isBefore(this.minDate[this.actualDateOrNot]))
                this.fromDate = this.minDate[this.actualDateOrNot];
            else if (this.fromDate.isAfter(this.maxDate[this.actualDateOrNot]))
                this.fromDate = this.maxDate[this.actualDateOrNot];
            if (this.toDate.isAfter(this.maxDate[this.actualDateOrNot]))
                this.toDate = this.maxDate[this.actualDateOrNot];
            else if (this.toDate.isBefore(this.minDate[this.actualDateOrNot]))
                this.toDate = this.minDate[this.actualDateOrNot];
        }
    }

    public render(): JSX.Element {
        return this.generateAccordion(
            <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div>
                        <DatePicker
                            key={uuidv4() + this.renderResetId}
                            label='From'
                            format='YYYY/MM/DD'
                            defaultValue={this.fromDate}
                            minDate={this.minDate[this.actualDateOrNot]}
                            maxDate={this.toDate}
                            slotProps={{
                                textField: {
                                    id: this.uuid + 'from'
                                }
                            }}
                            onChange={(value) => {
                                if (
                                    (this.minDate[this.actualDateOrNot].isBefore(value) ||
                                        this.minDate[this.actualDateOrNot].isSame(value)) &&
                                    (this.maxDate[this.actualDateOrNot].isAfter(value) ||
                                        this.maxDate[this.actualDateOrNot].isSame(value))
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
                            key={uuidv4() + 'to' + this.renderResetId}
                            label='To'
                            format='YYYY/MM/DD'
                            defaultValue={this.toDate}
                            minDate={this.fromDate}
                            maxDate={this.maxDate[this.actualDateOrNot]}
                            slotProps={{
                                textField: {
                                    id: this.uuid + 'to'
                                }
                            }}
                            onChange={(value) => {
                                if (
                                    (this.minDate[this.actualDateOrNot].isBefore(value) ||
                                        this.minDate[this.actualDateOrNot].isSame(value)) &&
                                    (this.maxDate[this.actualDateOrNot].isAfter(value) ||
                                        this.maxDate[this.actualDateOrNot].isSame(value))
                                ) {
                                    this.callback({
                                        which: 1,
                                        datetime: value
                                    });
                                }
                            }}
                        />
                        <br></br>

                        <button
                            style={{ marginTop: '5px' }}
                            type='button'
                            className='btn btn-secondary btn-sm'
                            onClick={() => {
                                this.callback({ which: 2, datetime: null });

                                //The elements don't refresh because they're set to value and
                                // not defaultValue. But defaultValue must be used here.
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </LocalizationProvider>
                <div style={{ marginTop: '10px' }} className='form-check'>
                    <input
                        className='form-check-input'
                        type='radio'
                        id={this.uuid + 'survey'}
                        name={this.uuid + 'datetype'}
                        value='Survey Date'
                        checked={this.actualDateOrNot === 0}
                        onChange={() => this.callback({ which: 3, datetime: null })}
                    ></input>
                    <label htmlFor={this.uuid + 'survey'}>Survey Date</label>
                    <br></br>
                    <input
                        className='form-check-input'
                        type='radio'
                        id={this.uuid + 'actual'}
                        name={this.uuid + 'datetype'}
                        value='Actual Date'
                        checked={this.actualDateOrNot === 1}
                        onChange={() => this.callback({ which: 4, datetime: null })}
                    ></input>
                    <label htmlFor={this.uuid + 'actual'}>Actual Date</label>
                    <br></br>
                </div>
            </div>
        );
    }

    protected checkDefault() {
        return this.isDefaultRange();
    }

    private isDefaultRange() {
        return (
            Math.abs(this.fromDate.diff(this.minDate[this.actualDateOrNot], 'day')) +
                Math.abs(this.toDate.diff(this.maxDate[this.actualDateOrNot], 'day')) ==
            0
        );
    }

    public callback(newValue: { which: number; datetime: Dayjs }): void {
        if (newValue.which === 0) {
            this.fromDate = newValue.datetime;
        } else if (newValue.which === 1) {
            this.toDate = newValue.datetime;
        } else if (newValue.which === 2) {
            this.fromDate = this.minDate[this.actualDateOrNot];
            this.toDate = this.maxDate[this.actualDateOrNot];
            this.renderResetId++;
        } else {
            const newDateType = newValue.which === 3 ? 0 : 1;
            if (newDateType != this.actualDateOrNot) {
                if (this.fromDate.isSame(this.minDate[this.actualDateOrNot]))
                    this.fromDate = this.minDate[newDateType];
                else if (this.fromDate.isBefore(this.minDate[newDateType]))
                    this.fromDate = this.minDate[newDateType];
                else if (this.fromDate.isAfter(this.maxDate[newDateType]))
                    this.fromDate = this.maxDate[newDateType];

                if (this.toDate.isSame(this.maxDate[this.actualDateOrNot]))
                    this.toDate = this.maxDate[newDateType];
                if (this.toDate.isAfter(this.maxDate[newDateType]))
                    this.toDate = this.maxDate[newDateType];
                else if (this.toDate.isBefore(this.minDate[newDateType]))
                    this.toDate = this.minDate[newDateType];

                this.actualDateOrNot = newDateType;
            }
            this.renderResetId++;
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
    public query(): { compound: boolean; queries: Query[] } {
        let fromDate: string | number;
        if (
            !this.fromDate.isValid() ||
            (this.minDate[this.actualDateOrNot].isValid() &&
                !this.fromDate.isAfter(this.minDate[this.actualDateOrNot]))
        )
            fromDate = -Infinity;
        else fromDate = this.fromDate.format('YYYY-MM-DD');

        let toDate: string | number;
        if (
            !this.toDate.isValid() ||
            (this.maxDate[this.actualDateOrNot].isValid() &&
                !this.toDate.isBefore(this.maxDate[this.actualDateOrNot]))
        )
            toDate = Infinity;
        else toDate = this.toDate.format('YYYY-MM-DD');

        // checkboxes predicate and react html value, also refresh min and max. testcase.
        return {
            compound: true,
            queries: [
                new RangeQuery(
                    this.panel.dataFilterer.getColumnIndex(
                        this.actualDateOrNot ? Attribute.actualDate : Attribute.surveyDate
                    )
                ).query(fromDate, toDate),
                new RangeQuery(
                    this.panel.dataFilterer.getColumnIndex(
                        !this.actualDateOrNot ? Attribute.actualDate : Attribute.surveyDate
                    )
                ).query(-Infinity, Infinity)
            ]
        };
    }
}
