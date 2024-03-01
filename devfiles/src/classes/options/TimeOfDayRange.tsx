import { Accordion } from 'react-bootstrap';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Panel from '../Panel';
import { Query } from '../query/Query';
import InputOption from './InputOption';
import SwappableRangeQuery from '../query/SwappableRangeQuery';
import { Attribute } from '../data/Data';

export default class TimeRange extends InputOption {
    private accordionOpen = false;
    public fromTime: Dayjs;
    public toTime: Dayjs;

    public constructor(panel: Panel, name: string, template?: TimeRange) {
        super(panel, name);

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
        return (
            <Accordion
                onSelect={(eventKey) => {
                    this.accordionOpen = typeof eventKey === 'string';
                }}
                defaultActiveKey={this.accordionOpen ? '0' : []}
            >
                <Accordion.Item eventKey='0'>
                    <Accordion.Header>
                        <span>
                            <strong id={this.uuid.toString() + 'title'}>{this.name}</strong>
                        </span>
                    </Accordion.Header>
                    <Accordion.Body>
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
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        );
    }

    private isDefaultRange() {
        return this.fromTime.diff(this.toTime, 'm') == 1;
    }

    public callback(newValue: { which: number; time: Dayjs }): void {
        if (newValue.which === 0) {
            this.fromTime = newValue.time;
        } else {
            this.toTime = newValue.time;
        }

        //If filter is active then indicate with title colour
        document.getElementById(this.uuid.toString() + 'title').style.color = this.isDefaultRange()
            ? ''
            : 'chocolate';

        this.panel.recalculateFilters(this);
        //Refresh to update the associated panel and its widgets
        this.panel.refreshComponent();
        //Refresh this inputoption
        this.refreshComponent();
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
