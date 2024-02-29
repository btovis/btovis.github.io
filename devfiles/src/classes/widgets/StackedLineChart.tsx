import LineChart from './LineChart.js';

export default class StackedLineChart extends LineChart {
    public chartSpecificLayout(): object {
        return {
            ...super.chartSpecificLayout(),
            stackgroup: 'one',
            fill: 'tonexty'
        };
    }
    public chartType(): string {
        return 'Stacked Line Chart';
    }
}
