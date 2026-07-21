import { useTheme } from '@/hooks/useTheme';
import { useDashboardStore } from '@/hooks/store/useDashboardStore';
import { useGlobalMetrics } from '@/hooks/api/useGlobalMetrics';

import { Sun, Moon } from 'lucide-react';
import bestLogoKyiv from '@/assets/best-logo-kyiv-b&w.png';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const timeframe = useDashboardStore(state => state.timeframe);
  const lastUpdated = useDashboardStore(state => state.lastUpdated);

  useGlobalMetrics(timeframe);

  const formatLastUpdated = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="w-full flex flex-col">
      <div className="h-16 border-b border-border-default bg-bg-surface flex items-center justify-between px-6 w-full z-20 relative transition-colors duration-200">
        <div className="flex items-center">
          <div className="flex items-center gap-5 lg:hidden">
            <img src={bestLogoKyiv} alt="BEST Kyiv Logo" className="h-9 object-contain" />
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14b8a6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981] shadow-[0_0_8px_#10b981]"></span>
              </span>
              <span className="font-mono text-[10px] text-text-muted">
                {lastUpdated ? `updated ${formatLastUpdated(lastUpdated)}` : 'connecting...'}
              </span>
            </div>
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-6">
            <span className="font-mono text-[10px] text-text-muted tracking-widest">
              unified-healthcheck-system ~ /dashboard
            </span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14b8a6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981] shadow-[0_0_8px_#10b981]"></span>
              </span>
              <span className="font-mono text-[10px] text-text-muted">
                {lastUpdated ? `updated ${formatLastUpdated(lastUpdated)}` : 'connecting...'}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6">
          <img src={bestLogoKyiv} alt="BEST Kyiv Logo" className="h-10 object-contain" />
        </div>

        <button
          onClick={toggleTheme}
          className="text-text-secondary hover:text-text-primary border border-border-default bg-bg-surface hover:bg-bg-hover transition-all p-1.5 rounded-none cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
};
