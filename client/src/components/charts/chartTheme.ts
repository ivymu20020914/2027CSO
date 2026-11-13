// 蓝图图表统一配置：单色蓝五级 + 零圆角 tooltip + 9px 坐标轴
export const BLUE_PALETTE: string[] = [
  '#0033A0',
  '#0066FF',
  '#4D94FF',
  '#99C2FF',
  '#CCE0FF',
];

export const CHART_TOOLTIP = {
  backgroundColor: '#FFFFFF',
  borderColor: '#E2E8F0',
  borderWidth: 1,
  borderRadius: 0,
  padding: 12,
  textStyle: { color: '#1A1A1A', fontSize: 11, fontWeight: 700 },
};

export const AXIS_LABEL = {
  color: '#94A3B8',
  fontSize: 9,
  fontWeight: 700,
};

export const SPLIT_LINE = {
  lineStyle: { color: '#E2E8F0' },
};

export const CHART_LEGEND = {
  bottom: 0,
  icon: 'rect',
  itemWidth: 10,
  itemHeight: 6,
  itemGap: 12,
  textStyle: { color: '#94A3B8', fontSize: 9, fontWeight: 700 },
};
