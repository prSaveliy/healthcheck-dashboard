import { useMemo, useEffect } from 'react';
import { useGlobalMetrics } from '@/hooks/api/useGlobalMetrics';
import { useDashboardStore } from '@/hooks/store/useDashboardStore';
import type { Timeframe } from '@/commons/types/shared';

import { ServiceStatusRow } from './ServiceStatusRow';
import { SkeletonKPI } from '../shared/SkeletonKPI';
import { SkeletonServiceRow } from './SkeletonServiceRow';

const timeframeMs: Record<Timeframe, number> = {
  '3h': 3 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

export const GlobalMetrics = ({ getNow = Date.now }) => {
  const timeframe = useDashboardStore(state => state.timeframe);
  const setTimeframe = useDashboardStore(state => state.setTimeframe);
  const lastUpdated = useDashboardStore(state => state.lastUpdated);
  const setIsSidebarOpen = useDashboardStore(state => state.setIsSidebarOpen);
  const { data, error, isLoading } = useGlobalMetrics(timeframe);
  
  useEffect(() => {
    if (!isLoading) {
      setIsSidebarOpen(false);
    }
  }, [isLoading, setIsSidebarOpen]);

  if (error) throw error;

  const timeframeStart = useMemo(() => getNow() - timeframeMs[timeframe], [timeframe, getNow, lastUpdated]);

  const websites = useMemo(() => {
    if (!data?.services) return [];
    return data.services
      .filter(s => s.type === 'website' && s.status !== 'pending')
      .sort((a, b) => {
        const statusOrder: Record<string, number> = { up: 1, down: 2, paused: 3, pending: 4 };
        const statusA = !a.isMonitored ? 'paused' : a.status;
        const statusB = !b.isMonitored ? 'paused' : b.status;
        const statusDiff = (statusOrder[statusA] || 5) - (statusOrder[statusB] || 5);
        
        if (statusDiff !== 0) {
          return statusDiff;
        }

        const uptimeA = a.uptimePercentage ?? -1;
        const uptimeB = b.uptimePercentage ?? -1;
        return uptimeB - uptimeA;
      })
      .map(service => ({
        ...service,
        formattedUptime:
          !service.isMonitored || service.status === 'pending' || service.uptimePercentage === null
            ? '-%'
            : `${service.uptimePercentage}%`,
      }));
  }, [data]);

  const bots = useMemo(() => {
    if (!data?.services) return [];
    return data.services
      .filter(s => s.type === 'telegramBot' && s.status !== 'pending')
      .sort((a, b) => {
        const statusOrder: Record<string, number> = { up: 1, down: 2, paused: 3, pending: 4 };
        const statusA = !a.isMonitored ? 'paused' : a.status;
        const statusB = !b.isMonitored ? 'paused' : b.status;
        const statusDiff = (statusOrder[statusA] || 5) - (statusOrder[statusB] || 5);
        
        if (statusDiff !== 0) {
          return statusDiff;
        }

        const uptimeA = a.uptimePercentage ?? -1;
        const uptimeB = b.uptimePercentage ?? -1;
        return uptimeB - uptimeA;
      })
      .map(service => ({
        ...service,
        formattedUptime:
          !service.isMonitored || service.status === 'pending' || service.uptimePercentage === null
            ? '-%'
            : `${service.uptimePercentage}%`,
      }));
  }, [data]);

  return (
    <div className="flex flex-col h-full bg-bg-sidebar border border-border-default shadow-2xl font-sans relative overflow-y-auto lg:overflow-hidden transition-colors duration-200">
      {/* Header */}
      <div className="border-b border-border-default bg-bg-surface p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 z-10 transition-colors duration-200">
        <div className="min-w-0">
          <h2 className="text-xl font-medium text-text-primary mb-1 transition-colors duration-200 truncate">
            Global System Overview
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono text-text-muted transition-colors duration-200">
            <span className="text-accent transition-colors duration-200 truncate">
              // all_systems
            </span>
            <span className="transition-colors duration-200">|</span>
            <span className="transition-colors duration-200">
              {isLoading ? '-' : (data?.overview.activeServices ?? 0)} Active Service
              {data?.overview.activeServices === 1 ? '' : 's'}
            </span>
            <span className="transition-colors duration-200">|</span>
            <span className="transition-colors duration-200">Global Polling Active</span>
          </div>
        </div>
        <div className="flex w-full md:w-auto overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-bg-sidebar border border-border-default transition-colors duration-200">
          <button
            onClick={() => setTimeframe('3h')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 border-r border-border-default text-[10px] font-mono uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${timeframe === '3h' ? 'bg-bg-active text-text-primary' : 'hover:bg-bg-hover text-text-secondary'}`}
          >
            3 Hours
          </button>
          <button
            onClick={() => setTimeframe('1d')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 border-r border-border-default text-[10px] font-mono uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${timeframe === '1d' ? 'bg-bg-active text-text-primary' : 'hover:bg-bg-hover text-text-secondary'}`}
          >
            1 Day
          </button>
          <button
            onClick={() => setTimeframe('7d')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 border-r border-border-default text-[10px] font-mono uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${timeframe === '7d' ? 'bg-bg-active text-text-primary' : 'hover:bg-bg-hover text-text-secondary'}`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeframe('30d')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-[10px] font-mono uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${timeframe === '30d' ? 'bg-bg-active text-text-primary' : 'hover:bg-bg-hover text-text-secondary'}`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Top KPIs (Fixed) */}
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
                  System Status
                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                  {data?.overview.systemStatus === 'OPERATIONAL' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-ok opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-status-ok shadow-[0_0_8px_var(--color-status-ok)]"></span>
                    </span>
                  )}
                  {data?.overview.systemStatus === 'DEGRADED' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-warn opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-status-warn shadow-[0_0_8px_var(--color-status-warn)]"></span>
                    </span>
                  )}
                  {(data?.overview.systemStatus === 'PARTIAL OUTAGE' ||
                    data?.overview.systemStatus === 'MAJOR OUTAGE') && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-error opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-status-error shadow-[0_0_8px_var(--color-status-error)]"></span>
                    </span>
                  )}
                  <span className="text-base sm:text-xl font-medium text-text-primary transition-colors duration-200 truncate">
                    {data?.overview.systemStatus || 'LOADING'}
                  </span>
                </div>
              </div>
              {/* Overall Uptime */}
              <div className="border border-border-default bg-bg-surface p-3 sm:p-4 flex flex-col gap-2 transition-colors duration-200">
                <span className="font-mono text-[9px] sm:text-[10px] text-text-muted uppercase tracking-wider sm:tracking-widest transition-colors duration-200">
                  Avg Uptime
                </span>
                <span className="text-lg sm:text-xl font-medium text-text-primary transition-colors duration-200">
                  {data && data.overview.globalUptimePercentage !== null ? `${data.overview.globalUptimePercentage}%` : '-%'}
                </span>
              </div>
              {/* Monitored / Not Monitored */}
              <div className="border border-border-default bg-bg-surface p-3 sm:p-4 flex flex-col gap-2 transition-colors duration-200">
                <span className="font-mono text-[9px] sm:text-[10px] text-text-muted uppercase tracking-wider sm:tracking-widest transition-colors duration-200">
                  Monitored
                </span>
                <span className="text-lg sm:text-xl font-medium text-text-primary transition-colors duration-200">
                  {data?.overview.activeServices ?? 0}{' '}
                  <span className="text-sm text-status-ok font-medium transition-colors duration-200">
                    ON
                  </span>
                  <span className="text-sm text-text-muted mx-2 transition-colors duration-200">
                    /
                  </span>
                  {data?.overview.pausedServices ?? 0}{' '}
                  <span className="text-sm text-text-muted transition-colors duration-200">
                    OFF
                  </span>
                </span>
              </div>
              {/* Downed Services */}
              <div className="border border-border-default bg-bg-surface p-3 sm:p-4 flex flex-col gap-2 transition-colors duration-200">
                <span className="font-mono text-[9px] sm:text-[10px] text-text-muted uppercase tracking-wider sm:tracking-widest transition-colors duration-200">
                  Downed Services
                </span>
                <span
                  className={`text-lg sm:text-xl font-medium transition-colors duration-200 ${data?.overview.downServices && data.overview.downServices > 0 ? 'text-status-error' : 'text-text-primary'}`}
                >
                  {data?.overview.downServices ?? 0}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scrollable Metrics Area */}
      <div className="flex-1 overflow-visible lg:overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
        {/* Left Column: Websites Block */}
        <div className="flex flex-col gap-4">
          <h3 className="font-mono text-[12px] text-text-primary uppercase tracking-widest flex items-center gap-2 border-b border-border-default pb-2 transition-colors duration-200">
            <span className="text-accent transition-colors duration-200">##</span> Websites{' '}
            <span className="text-text-muted transition-colors duration-200">
              ({isLoading ? '-' : websites.length})
            </span>
          </h3>
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <>
                <SkeletonServiceRow />
                <SkeletonServiceRow />
                <SkeletonServiceRow />
              </>
            ) : (
              websites.map(site => (
                <ServiceStatusRow
                  key={site.id}
                  name={site.name}
                  currentStatus={site.status}
                  uptime={site.formattedUptime}
                  isMonitored={site.isMonitored}
                  timeframeStart={timeframeStart}
                  allHistory={site.history}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Telegram Bots Block */}
        <div className="flex flex-col gap-4">
          <h3 className="font-mono text-[12px] text-text-primary uppercase tracking-widest flex items-center gap-2 border-b border-border-default pb-2 transition-colors duration-200">
            <span className="text-status-warn transition-colors duration-200">##</span> Telegram
            Bots{' '}
            <span className="text-text-muted transition-colors duration-200">
              ({isLoading ? '-' : bots.length})
            </span>
          </h3>
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <>
                <SkeletonServiceRow />
                <SkeletonServiceRow />
                <SkeletonServiceRow />
              </>
            ) : (
              bots.map(bot => (
                <ServiceStatusRow
                  key={bot.id}
                  name={bot.name}
                  currentStatus={bot.status}
                  uptime={bot.formattedUptime}
                  isMonitored={bot.isMonitored}
                  timeframeStart={timeframeStart}
                  allHistory={bot.history}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
