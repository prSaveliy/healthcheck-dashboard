import { useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';

import { themeColors } from '@/commons/theme';
import { useBotMetrics } from '@/hooks/api/useServiceMetrics';
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

export const BotMetrics = ({ getNow = Date.now }) => {
  const { id } = useParams<{ id: string }>();
  const timeframe = useDashboardStore(state => state.timeframe);
  const setTimeframe = useDashboardStore(state => state.setTimeframe);
  const lastUpdated = useDashboardStore(state => state.lastUpdated);
  const setIsSidebarOpen = useDashboardStore(state => state.setIsSidebarOpen);
  const { data, error, isLoading } = useBotMetrics(id, timeframe);
  
  useEffect(() => {
    if (!isLoading) {
      setIsSidebarOpen(false);
    }
  }, [id, isLoading, setIsSidebarOpen]);

  if (error) throw error;
  const { theme } = useTheme();
  const activeColors = themeColors[theme] || themeColors.dark;

  const timeframeStart = useMemo(() => getNow() - timeframeMs[timeframe], [timeframe, getNow, lastUpdated]);

  const lastHeartbeatAt = data?.lastHeartbeatAt;
  const formattedTimestamp = useMemo(() => {
    if (!lastHeartbeatAt) return 'never';
    const d = new Date(lastHeartbeatAt);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }, [lastHeartbeatAt]);

  const statusChartData = useMemo(() => {
    if (!data) return [];
    if (data.status === 'pending' && (!data.history || data.history.length === 0)) return [];
    return buildChartData(data.status, timeframeStart, data.history, data.isMonitored);
  }, [data, timeframeStart]);

  const allBotHeartbeats = data?.allBotHeartbeats;

  const scatterData = useMemo(() => {
    if (!allBotHeartbeats) return [];
    return allBotHeartbeats
      .filter(b => b.lastHeartbeatAt !== null)
      .map(b => ({
        value: [b.lastHeartbeatAt as number, b.botName],
        itemStyle: {
          color: b.isCurrent ? 'rgba(249, 115, 22, 0.85)' : 'rgba(100, 116, 139, 0.8)',
          shadowBlur: b.isCurrent ? 8 : 0,
          shadowColor: b.isCurrent ? 'rgba(249, 115, 22, 0.5)' : 'transparent',
        },
        symbolSize: b.isCurrent ? 14 : 8,
      }));
  }, [allBotHeartbeats]);

  const botNames = useMemo(() => {
    if (!allBotHeartbeats) return [];
    return allBotHeartbeats.map(b => b.botName);
  }, [allBotHeartbeats]);

  const scatterChartOptions = useMemo(() => {
    const currentNow = getNow();
    const heartbeatTimes =
      allBotHeartbeats?.map(b => b.lastHeartbeatAt).filter((t): t is number => t !== null) ?? [];
    const minTime =
      heartbeatTimes.length > 0 ? Math.min(...heartbeatTimes) : currentNow - 10 * 60 * 1000;
    const xMin = Math.min(minTime, currentNow - 5 * 60 * 1000) - 60 * 1000;
    const xMax = currentNow + 30 * 1000;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8fafc',
        borderColor: theme === 'dark' ? '#2a2a2a' : '#cbd5e1',
        borderWidth: 1,
        textStyle: {
          color: theme === 'dark' ? '#f0f0f0' : '#0f172a',
          fontFamily: 'monospace',
          fontSize: 10,
        },
        formatter: (params: unknown) => {
          const item = params as { value: [number, string] };
          const d = new Date(item.value[0]);
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          const seconds = String(d.getSeconds()).padStart(2, '0');
          const formattedDate = `${day}/${month} ${hours}:${minutes}:${seconds}`;

          return `<span style="color:${activeColors.textMuted};font-family:monospace;font-size:10px;">${item.value[1]}</span><br/><span style="font-family:monospace;font-size:10px;">Last Heartbeat: <strong style="color:${activeColors.textPrimary}">${formattedDate}</strong></span>`;
        },
      },
      grid: { top: 20, right: 30, bottom: 30, left: 120 },
      xAxis: {
        type: 'time',
        min: xMin,
        max: xMax,
        splitNumber: 3,
        axisLabel: {
          color: activeColors.textMuted,
          fontFamily: 'monospace',
          fontSize: 10,
          hideOverlap: true,
        },
        axisLine: { lineStyle: { color: 'rgba(128, 128, 128, 0.25)' } },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'category',
        data: botNames,
        axisLabel: {
          color: activeColors.textMuted,
          fontFamily: 'monospace',
          fontSize: 10,
        },
        splitLine: { lineStyle: { color: 'rgba(128, 128, 128, 0.25)', type: 'dashed' } },
        axisLine: { lineStyle: { color: 'rgba(128, 128, 128, 0.25)' } },
      },
      series: [
        {
          name: 'Last Heartbeat',
          type: 'scatter',
          data: scatterData,
        },
      ],
    };
  }, [allBotHeartbeats, theme, activeColors, botNames, scatterData, getNow, lastUpdated]);

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
            {isLoading ? 'Loading telegram bot...' : data?.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono text-text-muted transition-colors duration-200">
            <span className="text-accent transition-colors duration-200 truncate text-status-warn">
              {isLoading ? '// -' : `// ${data?.urlOrIdentifier}`}
            </span>
            <span className="transition-colors duration-200">|</span>
            <span className="transition-colors duration-200">
              Heartbeat expected every {data ? `${data.heartbeatIntervalMs / 60000}m` : '-'}
            </span>
            <span className="transition-colors duration-200">|</span>
            <span className="transition-colors duration-200">
              Last heartbeat: {formattedTimestamp}
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
              {/* Last Heartbeat */}
              <div className="border border-border-default bg-bg-surface p-3 sm:p-4 flex flex-col gap-2 transition-colors duration-200">
                <span className="font-mono text-[9px] sm:text-[10px] text-text-muted uppercase tracking-wider sm:tracking-widest transition-colors duration-200">
                  Last Heartbeat
                </span>
                <span className="text-lg sm:text-xl font-medium text-text-primary transition-colors duration-200">
                  {data?.status === 'pending' ? '-' : formattedTimestamp}
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
          {/* Heartbeat scatter plot */}
          <div className="border border-border-default bg-bg-surface p-4 flex flex-col min-h-[300px] transition-colors duration-200">
            <h3 className="font-mono text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0 transition-colors duration-200">
              <span className="text-accent">##</span> Last Heartbeat Timestamps
            </h3>
            <div className="flex-1 w-full min-h-0">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center text-xs font-mono text-text-muted shimmer rounded">
                  Loading chart...
                </div>
              ) : (
                <ReactECharts
                  option={scatterChartOptions}
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
