import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useGlobalMetrics } from '@/hooks/api/useGlobalMetrics';
import { useDashboardStore } from '@/hooks/store/useDashboardStore';

import { ServiceCard } from './ServiceCard';
import { SkeletonServiceCard } from './SkeletonServiceCard';

const statusOrder: Record<string, number> = {
  up: 1,
  down: 2,
  pending: 3,
  paused: 4,
};

export const ServiceList = () => {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const timeframe = useDashboardStore(state => state.timeframe);
  const { data, isLoading } = useGlobalMetrics(timeframe);

  const isAllServicesActive = location.pathname === '/';

  const filteredServices = useMemo(() => {
    if (!data?.services) return [];
    return data.services
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const statusA = !a.isMonitored ? 'paused' : a.status;
        const statusB = !b.isMonitored ? 'paused' : b.status;
        const statusDiff = (statusOrder[statusA] || 5) - (statusOrder[statusB] || 5);
        
        if (statusDiff !== 0) {
          return statusDiff;
        }

        const uptimeA = a.uptimePercentage ?? -1;
        const uptimeB = b.uptimePercentage ?? -1;
        return uptimeB - uptimeA;
      });
  }, [search, data]);

  const websites = filteredServices.filter(s => s.type === 'website');
  const bots = filteredServices.filter(s => s.type === 'telegramBot');

  return (
    <div className="w-full h-full font-sans flex flex-col">
      <div className="flex flex-col h-full border border-border-default bg-bg-sidebar shadow-2xl transition-colors duration-200">
        <div className="border-b border-border-default p-4 flex flex-col gap-3 bg-bg-surface shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-4 text-text-secondary transition-colors duration-200">
            <span className="font-mono text-[10px] uppercase tracking-widest">
              /// Services.List
            </span>
          </div>
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs">
              {'>'}
            </span>
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-bg-input border border-border-default pl-8 pr-4 py-1.5 text-xs text-text-primary outline-none focus:border-text-secondary font-mono placeholder:text-text-muted transition-colors duration-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col transition-colors duration-200">
          <div className="p-4 flex flex-col gap-3 transition-colors duration-200">
            <h2 className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="text-accent">//</span> All Services
            </h2>
            <Link
              to="/"
              className={`group flex items-center justify-between border transition-all p-4 cursor-pointer duration-200 ${isAllServicesActive ? 'border-text-muted bg-bg-hover' : 'border-border-default bg-bg-surface hover:border-text-muted hover:bg-bg-hover'}`}
            >
              <div className="flex flex-col gap-1">
                <span className={`text-sm font-medium transition-colors ${isAllServicesActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                  All Services
                </span>
              </div>
              <span className={`transition-all duration-300 font-mono text-lg ${isAllServicesActive ? 'text-text-primary translate-x-1.5' : 'text-text-muted group-hover:text-text-primary group-hover:translate-x-1.5'}`}>
                →
              </span>
            </Link>
          </div>

          <div className="p-4 flex flex-col gap-3 border-t border-border-default transition-colors duration-200">
            <h2 className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="text-accent">/</span> Websites
            </h2>
            <div className="flex flex-col gap-2">
              {isLoading ? (
                <>
                  <SkeletonServiceCard />
                  <SkeletonServiceCard />
                  <SkeletonServiceCard />
                </>
              ) : websites.length > 0 ? (
                websites.map(service => <ServiceCard key={service.id} service={service} />)
              ) : (
                <div className="text-xs font-mono text-text-muted p-4 border border-dashed border-border-default text-center transition-colors duration-200">
                  No websites found.
                </div>
              )}
            </div>
          </div>

          <div className="p-4 flex flex-col gap-3 border-t border-border-default transition-colors duration-200">
            <h2 className="font-mono text-[10px] text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="text-accent">/</span> Telegram Bots
            </h2>
            <div className="flex flex-col gap-2">
              {isLoading ? (
                <>
                  <SkeletonServiceCard />
                  <SkeletonServiceCard />
                  <SkeletonServiceCard />
                </>
              ) : bots.length > 0 ? (
                bots.map(service => <ServiceCard key={service.id} service={service} />)
              ) : (
                <div className="text-xs font-mono text-text-muted p-4 border border-dashed border-border-default text-center transition-colors duration-200">
                  No bots found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
