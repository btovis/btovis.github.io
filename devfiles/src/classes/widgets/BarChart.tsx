import Widget from './Widget.js';
import WidgetConfig from './WidgetConfig.js';
import { Data, Attribute } from '../data/Data.js';
import Row from '../data/Row.js';
import {
    BatchNameGrouping,
    ContinuousMonthGrouping,
    DayGrouping,
    FilenameGrouping,
    Grouping,
    MonthGrouping,
    ProjectNameGrouping,
    YGrouping,
    YearGrouping
} from './Grouping.js';
import TimeChart from './TimeChart.js';

export default class BarChart extends TimeChart {
    public chartSpecificLayout(): object {
        return {
            type: 'bar'
        };
    }
    public chartType(): string {
        return 'Bar Chart';
    }
    public timeRangeGroupings(): (typeof Grouping)[] {
        return [
            DayGrouping,
            MonthGrouping,
            YearGrouping,
            ProjectNameGrouping,
            BatchNameGrouping,
            FilenameGrouping
        ];
    }
}
