import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';
import { moduleStats } from '@client/src/data/selectors';
import { AXIS_LABEL, CHART_TOOLTIP, SPLIT_LINE } from './chartTheme';

interface ModuleTaskBarChartProps {
  tasks: { moduleId: string; status: string; priority: string }[];
}

const ModuleTaskBarChart = ({ tasks }: ModuleTaskBarChartProps) => {
  const stats = moduleStats(tasks);
  const labels: string[] = stats.map((s) => s.module.name);
  const values: number[] = stats.map((s) => s.total);

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      ...CHART_TOOLTIP,
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params];
        const p = list[0] as CallbackDataParams;
        return `${p.name}<br/>任务数：<b>${p.value}</b>`;
      },
    },
    grid: { left: 0, right: 28, top: 8, bottom: 8, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: AXIS_LABEL,
      splitLine: SPLIT_LINE,
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: labels,
      inverse: true,
      axisLabel: { ...AXIS_LABEL, width: 84, overflow: 'truncate' },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: values,
        barWidth: 12,
        itemStyle: { color: '#0033A0', borderRadius: [0, 2, 2, 0] },
        label: {
          show: true,
          position: 'right',
          fontSize: 11,
          fontWeight: 700,
          formatter: (p: CallbackDataParams) => `${p.value}`,
        },
      },
    ],
  };

  return <ReactECharts option={option} theme="ud" className="h-[340px] w-full" />;
};

export { ModuleTaskBarChart };
