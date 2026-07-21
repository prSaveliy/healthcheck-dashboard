import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/hooks/useTheme';
import type { ServiceHistory } from '@/commons/types/api/globalMetrics';
import { themeColors } from '@/commons/theme';
import { buildChartData } from '@/utils/buildChartData';

export const ServiceStatusRow = ({
  name,
  currentStatus,
  uptime,
  isMonitored,
  timeframeStart,
  allHistory,
}: {
  name: string;
  currentStatus: string;
  uptime: string;
  isMonitored: boolean;
  timeframeStart: number;
  allHistory: ServiceHistory[];
}) => {
  const { theme } = useTheme();
  const activeColors = themeColors[theme] || themeColors.dark;

  const displayStatus = !isMonitored ? 'PAUSED' : currentStatus.toUpperCase();
  const statusColor = !isMonitored
    ? activeColors.statusUnknown
    : currentStatus === 'up'
      ? activeColors.statusOk
      : currentStatus === 'pending'
        ? activeColors.statusWarn
        : activeColors.statusError;

  const chartData = buildChartData(currentStatus, timeframeStart, allHistory, isMonitored);

  const statusChartOptions = {
    backgroundColor: 'rgba(0,0,0,0)',
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
      borderColor: theme === 'dark' ? '#2a2a2a' : '#cbd5e1',
      borderWidth: 1,
      textStyle: {
        color: theme === 'dark' ? '#f0f0f0' : '#0f172a',
        fontFamily: 'monospace',
        fontSize: 10,
      },
      formatter: (params: unknown) => {
        const paramsArray = params as { value: [number, number | null, string?] }[];
        const d = new Date(paramsArray[0].value[0]);

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        const dateStr = `${day}/${month}`;
        const timeStr = `${hours}:${minutes}:${seconds}`;
        const val = paramsArray[0].value[1];
        const eventStatus = paramsArray[0].value[2];
        const isPaused = eventStatus === 'paused' || val === null;
        const isResumed = eventStatus === 'resumed';
        const isUp = val === 1;
        const status = isResumed ? 'RESUMED' : isPaused ? 'PAUSED' : isUp ? 'UP' : 'DOWN';
        const color = isResumed ? activeColors.statusUnknown : isPaused ? activeColors.statusUnknown : isUp ? activeColors.statusOk : activeColors.statusError;

        return `<span style="font-family:monospace;font-size:10px;">${dateStr} ${timeStr}</span><br/><span style="color:${color}; font-weight:bold; font-family:monospace; font-size:10px;">${status}</span>`;
      },
    },
    grid: { top: 2, right: 2, bottom: 2, left: 2 },
    xAxis: { type: 'time', show: false },
    yAxis: { type: 'value', min: -0.1, max: 1.3, show: false },
    visualMap: {
      show: false,
      dimension: 1,
      pieces: [
        { min: -0.1, max: 0.5, color: activeColors.statusError }, // Down (red)
        { min: 0.5, max: 1.3, color: activeColors.statusOk }, // Up (green)
      ],
    },
    series: [
      {
        name: 'Status',
        data: chartData,
        type: 'line',
        step: 'end',
        lineStyle: { width: 2 },
        showSymbol: false,
      },
    ],
  };

  return (
    <div className="flex flex-col border border-border-default bg-bg-card p-4 gap-3 hover:border-text-muted transition-colors duration-200 group min-w-0">
      <div className="flex justify-between items-center gap-4">
        <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors duration-200 truncate flex-1">
          {name}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-[10px] text-text-muted group-hover:text-text-secondary transition-colors duration-200">
            {uptime}
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: statusColor }}
          >
            {displayStatus}
          </span>
        </div>
      </div>
      <div className="h-[72px] w-full">
        <ReactECharts option={statusChartOptions} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};
