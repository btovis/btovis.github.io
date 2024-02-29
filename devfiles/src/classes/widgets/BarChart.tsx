import Widget from './Widget.js';
import WidgetConfig from './WidgetConfig.js';
import { Data, Attribute } from '../data/Data.js';
import Row from '../data/Row.js';
import { MonthGrouping, YGrouping } from './Grouping.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import Selector from '../options/Selector.js';
import MutuallyExclusiveSelector from '../options/MutuallyExclusiveSelector.js';
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
}
