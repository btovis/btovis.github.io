import Widget from './Widget.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Plot from 'react-plotly.js';
import {
    ContinuousMonthGrouping,
    DayGrouping,
    Grouping,
    YGrouping,
    YearGrouping
} from './Grouping.js';
import TimeChart from './TimeChart.js';

export default class LineChart extends TimeChart {
    public chartSpecificLayout(): object {
        return {
            type: 'scatter'
        };
    }
    public chartType(): string {
        return 'Line Chart';
    }
    public timeRangeGroupings(): (typeof Grouping)[] {
        return [DayGrouping, ContinuousMonthGrouping, YearGrouping];
    }
}
