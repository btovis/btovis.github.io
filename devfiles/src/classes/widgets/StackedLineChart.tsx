import LineChart from './LineChart.js';

export default class StackedLineChart extends LineChart {
    public chartSpecificLayout(numTraces: number): Array<{ [key: string]: any }> {
        const lineChartLayout = super.chartSpecificLayout(numTraces);
        lineChartLayout.forEach((singleTraceConfig) => {
            singleTraceConfig.stackgroup = 'one';
            singleTraceConfig.fill = 'tonexty';
        });
        return lineChartLayout;
    }
    public chartType(): string {
        return 'Stacked Line Chart';
    }
}
