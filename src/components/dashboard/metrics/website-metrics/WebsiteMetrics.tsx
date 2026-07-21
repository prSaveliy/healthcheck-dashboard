import { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';

import { themeColors } from '@/commons/theme';
import { useWebsiteMetrics } from '@/hooks/api/useServiceMetrics';
import { useDashboardStore } from '@/hooks/store/useDashboardStore';
import { useTheme } from '@/hooks/useTheme';
import { SkeletonKPI } from '../shared/SkeletonKPI';
import { buildChartData } from '@/utils/buildChartData';

const timeframeMs = {
  '3h': 3 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

export const WebsiteMetrics = ({ getNow = Date.now }) => {
  const { id } = useParams<{ id: string }>();
  const timeframe = useDashboardStore(state => state.timeframe);
  const setTimeframe = useDashboardStore(state => state.setTimeframe);
  const lastUpdated = useDashboardStore(state => state.lastUpdated);
  const setIsSidebarOpen = useDashboardStore(state => state.setIsSidebarOpen);
  const { data, error, isLoading } = useWebsiteMetrics(id, timeframe);
  
  useEffect(() => {
    if (!isLoading) {
      setIsSidebarOpen(false);
    }
  }, [id, isLoading, setIsSidebarOpen]);

  if (error) throw error;
  const { theme } = useTheme();
  const activeColors = themeColors[theme] || themeColors.dark;

  const timeframeStart = useMemo(
    () => getNow() - timeframeMs[timeframe],
    [timeframe, getNow, lastUpdated],
  );

  const lastCheckedAt = data?.lastCheckedAt;
  const formattedTimestamp = useMemo(() => {
    if (!lastCheckedAt) return 'never';
    const d = new Date(lastCheckedAt);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }, [lastCheckedAt]);

  const statusChartData = useMemo(() => {
    if (!data) return [];
    if (data.status === 'pending' && (!data.history || data.history.length === 0)) return [];
    return buildChartData(data.status, timeframeStart, data.history, data.isMonitored);
  }, [data, timeframeStart]);

  const latencyChartOptions = useMemo(() => {
    return {
      backgroundColor: 'transparent',
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
        axisPointer: { type: 'shadow' },
      },
      grid: { top: 20, right: 20, bottom: 30, left: 50 },
      xAxis: {
        type: 'category',
        data: [data?.name || 'Website', 'AVG'],
        axisLabel: {
          color: activeColors.textMuted,
          fontFamily: 'monospace',
          fontSize: 10,
        },
        axisLine: { lineStyle: { color: 'rgba(128, 128, 128, 0.25)' } },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: activeColors.textMuted,
          fontFamily: 'monospace',
          fontSize: 10,
          formatter: '{value}ms',
        },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(128, 128, 128, 0.25)', type: 'dashed' } },
      },
      series: [
        {
          type: 'bar',
          barWidth: '30%',
          data: [
            {
              value: data?.status === 'pending' ? null : (data?.latency ?? 0),
              itemStyle: {
                color: 'rgba(249, 115, 22, 0.85)',
                borderRadius: [4, 4, 0, 0],
              },
            },
            {
              value: data?.avgLatencyAcrossWebsites ?? 0,
              itemStyle: {
                color: 'rgba(100, 116, 139, 0.8)',
                borderRadius: [4, 4, 0, 0],
              },
            },
          ],
        },
      ],
    };
  }, [data, theme, activeColors]);

  const statusChartOptions = useMemo(() => {
    return {
      backgroundColor: 'transparent',
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
      xAxis: {
        type: 'time',
        show: false,
      },
      yAxis: {
        type: 'value',
        min: -0.1,
        max: 1.3,
        show: false,
      },
      visualMap: {
        show: false,
        dimension: 1,
        pieces: [
          { min: -0.1, max: 0.5, color: activeColors.statusError },
          { min: 0.5, max: 1.3, color: activeColors.statusOk },
        ],
      },
      series: [
        {
          name: 'Status',
          data: statusChartData,
          type: 'line',
          step: 'end',
          lineStyle: { width: 2 },
          showSymbol: false,
        },
      ],
    };
  }, [statusChartData, theme, activeColors]);

  const displayStatus = !data?.isMonitored ? 'PAUSED' : data?.status.toUpperCase();
  const statusColor = !data?.isMonitored
    ? activeColors.statusUnknown
    : data?.status === 'up'
      ? activeColors.statusOk
      : data?.status === 'pending'
        ? activeColors.statusWarn
        : activeColors.statusError;

  return (
    <div className="flex flex-col h-full bg-bg-sidebar border border-border-default shadow-2xl font-sans relative overflow-y-auto lg:overflow-hidden transition-colors duration-200">
      {/* Header */}
      <div className="border-b border-border-default bg-bg-surface p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 z-10 transition-colors duration-200">
        <div className="min-w-0">
          <h2 className="text-xl font-medium text-text-primary mb-1 transition-colors duration-200 truncate">
            {isLoading ? 'Loading website...' : data?.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono text-text-muted transition-colors duration-200">
            <span className="text-accent transition-colors duration-200 truncate">
              {isLoading ? '// -' : `// ${data?.urlOrIdentifier}`}
            </span>
            <span className="transition-colors duration-200">|</span>
            <span className="transition-colors duration-200">
              Checked every {data ? `${data.checkIntervalMs / 1000}s` : '-'}
            </span>
            <span className="transition-colors duration-200">|</span>
            <span className="transition-colors duration-200">
              Last checked: {formattedTimestamp}
            </span>
          </div>
        </div>
        <div className="flex w-full md:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-bg-sidebar border border-border-default transition-colors duration-200">
          {(['3h', '1d', '7d', '30d'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 md:flex-none px-3 md:px-4 py-2 border-r last:border-r-0 border-border-default text-[10px] font-mono uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${timeframe === tf ? 'bg-bg-active text-text-primary' : 'hover:bg-bg-hover text-text-secondary'}`}
            >
              {tf === '3h' ? '3 Hours' : tf === '1d' ? '1 Day' : tf === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="p-4 sm:p-6 border-b border-border-default shrink-0 bg-bg-sidebar transition-colors duration-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading ? (
            <>
              <SkeletonKPI />
              <SkeletonKPI />
              <SkeletonKPI />
              <SkeletonKPI />
            </>
          ) : (
            <>
              {/* Status */}
              <div className="border border-border-default bg-bg-surface p-3 sm:p-4 flex flex-col gap-2 transition-colors duration-200">
                <span className="font-mono text-[9px] sm:text-[10px] text-text-muted uppercase tracking-wider sm:tracking-widest transition-colors duration-200">
                  Status
                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                  {data?.status === 'up' && data?.isMonitored && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-ok opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-status-ok shadow-[0_0_8px_var(--color-status-ok)]"></span>
                    </span>
                  )}
                  {data?.status === 'pending' && data?.isMonitored && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-warn opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-status-warn shadow-[0_0_8px_var(--color-status-warn)]"></span>
                    </span>
                  )}
                  {data?.status === 'down' && data?.isMonitored && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-error opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-status-error shadow-[0_0_8px_var(--color-status-error)]"></span>
                    </span>
                  )}
                  <span
                    className="text-base sm:text-xl font-medium transition-colors duration-200 truncate"
                    style={{ color: statusColor }}
                  >
                    {displayStatus}
                  </span>
                </div>
              </div>
              {/* Latency */}
              <div className="border border-border-default bg-bg-surface p-3 sm:p-4 flex flex-col gap-2 transition-colors duration-200">
                <span className="font-mono text-[9px] sm:text-[10px] text-text-muted uppercase tracking-wider sm:tracking-widest transition-colors duration-200">
                  Latency
                </span>
                <span className="text-lg sm:text-xl font-medium text-text-primary transition-colors duration-200">
                  {data?.latency !== null && data?.status !== 'pending' ? (
                    <>
                      {data?.latency} <span className="text-xs sm:text-sm text-text-muted">ms</span>
                    </>
                  ) : (
                    '-'
                  )}
                </span>
              </div>
              {/* Uptime % */}
              <div className="border border-border-default bg-bg-surface p-3 sm:p-4 flex flex-col gap-2 transition-colors duration-200">
                <span className="font-mono text-[9px] sm:text-[10px] text-text-muted uppercase tracking-wider sm:tracking-widest transition-colors duration-200">
                  Uptime
                </span>
                <span className="text-lg sm:text-xl font-medium text-text-primary transition-colors duration-200">
                  {data && data.status !== 'pending' && data.uptimePercentage !== null ? `${data.uptimePercentage}%` : '-%'}
                </span>
              </div>
              {/* Drops */}
              <div className="border border-border-default bg-bg-surface p-3 sm:p-4 flex flex-col gap-2 transition-colors duration-200">
                <span className="font-mono text-[9px] sm:text-[10px] text-text-muted uppercase tracking-wider sm:tracking-widest transition-colors duration-200">
                  Drops Recorded
                </span>
                <span
                  className={`text-lg sm:text-xl font-medium transition-colors duration-200 ${data?.drops && data.drops > 0 && data.status !== 'pending' ? 'text-status-error' : 'text-text-primary'}`}
                >
                  {data?.status === 'pending' ? '-' : (data?.drops ?? 0)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Area */}
      <div className="flex-1 overflow-visible lg:overflow-y-auto p-4 sm:p-6 flex flex-col gap-6 lg:gap-8">
        <div className="flex flex-col gap-6 min-h-0 flex-1">
          {/* Latency bar comparison */}
          <div className="border border-border-default bg-bg-surface p-4 flex flex-col min-h-[300px] transition-colors duration-200">
            <h3 className="font-mono text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0 transition-colors duration-200">
              <span className="text-accent">##</span> Current Latency vs Global Avg Across Websites
            </h3>
            <div className="flex-1 w-full min-h-0">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center text-xs font-mono text-text-muted shimmer rounded">
                  Loading chart...
                </div>
              ) : (
                <ReactECharts
                  option={latencyChartOptions}
                  style={{ height: '100%', width: '100%' }}
                />
              )}
            </div>
          </div>

          {/* Stepped Status Chart */}
          <div className="border border-border-default bg-bg-surface p-4 flex flex-col min-h-[180px] flex-1 transition-colors duration-200">
            <h3 className="font-mono text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0 transition-colors duration-200">
              <span className="text-accent">##</span> Status History
            </h3>
            <div className="flex-1 w-full min-h-0">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center text-xs font-mono text-text-muted shimmer rounded">
                  Loading chart...
                </div>
              ) : data?.status === 'pending' && (!data?.history || data.history.length === 0) ? (
                <div className="h-full w-full flex items-center justify-center text-sm font-mono text-text-muted rounded transition-colors duration-200">
                  NO DATA
                </div>
              ) : (
                <ReactECharts
                  option={statusChartOptions}
                  style={{ height: '100%', width: '100%' }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
