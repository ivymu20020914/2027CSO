import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';
import { ownerStats } from '@client/src/data/selectors';
import { BLUE_PALETTE, CHART_LEGEND, CHART_TOOLTIP } from './chartTheme';

interface OwnerDonutChartProps {
  tasks: { owner: string; priority: string }[];
}

const OwnerDonutChart = ({ tasks }: OwnerDonutChartProps) => {
  const stats = ownerStats(tasks);
  const data = stats.map((s, i) => ({
    name: s.owner,
    value: s.total,
    itemStyle: { color: BLUE_PALETTE[i % BLUE_PALETTE.length] },
  }));

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      ...CHART_TOOLTIP,
      formatter: (params) => {
        const p = params as CallbackDataParams;
        const pct = typeof p.percent === 'number' ? p.percent.toFixed(1) : '0';
        return `${p.name}<br/>主责任务：<b>${p.value}</b>（${pct}%）`;
      },
    },
    legend: { ...CHART_LEGEND, type: 'scroll' },
    series: [
      {
        type: 'pie',
        radius: ['46%', '70%'],
        padAngle: 2,
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        label: { show: false },
        emphasis: { label: { show: false } },
        data,
      },
    ],
  };

  return <ReactECharts option={option} theme="ud" className="h-[300px] w-full" />;
};

export { OwnerDonutChart };
