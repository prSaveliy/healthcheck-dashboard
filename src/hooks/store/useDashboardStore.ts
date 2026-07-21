import { create } from 'zustand';

import type { Timeframe } from '@/commons/types/shared';

interface DashboardState {
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  lastUpdated: Date | null;
  setLastUpdated: (date: Date) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const useDashboardStore = create<DashboardState>(set => ({
  timeframe: '3h',
  setTimeframe: tf => set({ timeframe: tf }),
  lastUpdated: null,
  setLastUpdated: date => set({ lastUpdated: date }),
  isSidebarOpen: false,
  setIsSidebarOpen: isOpen => set({ isSidebarOpen: isOpen }),
}));
