import useSWR from 'swr';
import { fetcher } from './fetcher';

import { useDashboardStore } from '@/hooks/store/useDashboardStore';

import type { Timeframe } from '@/commons/types/shared';
import type { GlobalMetricsResponse } from '@/commons/types/api/globalMetrics';

export const useGlobalMetrics = (tf: Timeframe) => {
  const setLastUpdated = useDashboardStore(state => state.setLastUpdated);

  const { data, error, isLoading } = useSWR<GlobalMetricsResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/api/metrics/services?timeframe=${tf}`,
    fetcher,
    {
      refreshInterval: Number(import.meta.env.VITE_GLOBAL_METRICS_REFRESH_INTERVAL_MS) || 10_000,
      onSuccess: () => setLastUpdated(new Date()),
    },
  );

  return { data, error, isLoading };
};
