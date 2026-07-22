import { ChevronRight, ChevronLeft } from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { ServiceList } from '@/components/dashboard/service-list/ServiceList';
import { useDashboardStore } from '@/hooks/store/useDashboardStore';

export const DashBoard = ({ children }: { children?: React.ReactNode }) => {
  const isSidebarOpen = useDashboardStore(state => state.isSidebarOpen);
  const setIsSidebarOpen = useDashboardStore(state => state.setIsSidebarOpen);

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <Header />
      <div className="flex flex-1 overflow-hidden p-6 gap-6 relative">
        <div className="hidden lg:block w-[350px] shrink-0 h-full">
          <ServiceList />
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-40 w-[300px] sm:w-[350px] max-w-[calc(100vw-50px)] transition-transform duration-300 ease-in-out lg:hidden transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <ServiceList className={isSidebarOpen ? 'shadow-2xl' : 'shadow-none'} />

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute left-full top-1/2 -translate-y-1/2 h-16 w-8 flex items-center justify-center bg-bg-surface border border-l-0 border-border-default rounded-r-xl cursor-pointer shadow-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors duration-200"
          >
            {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <div className="flex-1 min-w-0 h-full">
          <>{children}</>
        </div>
      </div>
    </div>
  );
};
