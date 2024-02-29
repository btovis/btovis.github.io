import Widget from './Widget.js';
import WidgetConfig from './WidgetConfig.js';
import { Data } from '../data/Data.js';
import Sidebar from '../Sidebar.js';
import ExportFileType from './ExportFileType.js';
import React from 'react';
import Plot from 'react-plotly.js';
import {
    ContinuousMonthGrouping,
    DayGrouping,
    Grouping,
    YGrouping,
    YearGrouping
} from './Grouping.js';
import TimeChart from './TimeChart.js';

export default class StackedLineChart extends TimeChart {
    public chartSpecificLayout(): object {
        return {
            type: 'scatter',
            stackgroup: 'one',
            fill: 'tonexty'
        };
    }
    public chartType(): string {
        return 'Stacked Line Chart';
    }
    public timeRangeGroupings(): (typeof Grouping)[] {
        return [DayGrouping, ContinuousMonthGrouping, YearGrouping];
    }
}
