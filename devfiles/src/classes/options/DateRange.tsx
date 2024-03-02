import { Accordion } from 'react-bootstrap';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import RangeQuery from '../query/RangeQuery';
import { Attribute } from '../data/Data';

export default class TimeRange extends InputOption {
    private minDate: Dayjs;
    private maxDate: Dayjs;
    public fromDate: Dayjs;
    public toDate: Dayjs;
    private accordionOpen = false;

    public constructor(panel: Panel, name: string, template?: TimeRange) {
        super(panel, name);
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
        return (
            <Accordion
                onSelect={(eventKey) => {
                    this.accordionOpen = typeof eventKey === 'string';
                }}
                defaultActiveKey={this.accordionOpen ? '0' : []}
            >
                <Accordion.Item eventKey='0'>
                    <Accordion.Header>
                        <span
                            style={{
                                color: this.isDefaultRange() ? '' : 'chocolate',
                                fontSize: 'larger'
                            }}
                            id={this.uuid.toString() + 'title'}
                        >
                            {this.name}
                        </span>
                    </Accordion.Header>
                    <Accordion.Body>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label='From'
                                format='YYYY/MM/DD'
                                value={this.fromDate}
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
                                format='YYYY/MM/DD'
                                value={this.toDate}
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
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        );
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
        } else {
            this.toDate = newValue.datetime;
        }

        this.panel.recalculateFilters(this);
        //Refresh to update the associated panel and its widgets
        this.panel.refreshComponent();
        //Refresh this inputoption
        this.refreshComponent();
    }
    public query(): Query {
        return new RangeQuery(this.panel.dataFilterer.getColumnIndex(Attribute.actualDate)).query(
            this.fromDate.format('YYYY-MM-DD'),
            this.toDate.format('YYYY-MM-DD')
        );
    }
}
