import useSWR from 'swr';
import { fetcher } from './fetcher';

import { useDashboardStore } from '@/hooks/store/useDashboardStore';

import type { Timeframe } from '@/commons/types/shared';
import type {
  WebsiteMetricsResponse,
  BotMetricsResponse,
} from '@/commons/types/api/serviceMetrics';

export const useWebsiteMetrics = (id: string | undefined, tf: Timeframe) => {
  const setLastUpdated = useDashboardStore(state => state.setLastUpdated);

  const { data, error, isLoading } = useSWR<WebsiteMetricsResponse>(
    id
      ? `${import.meta.env.VITE_API_BASE_URL}/api/metrics/services/website/${id}?timeframe=${tf}`
      : null,
    fetcher,
    {
      refreshInterval: Number(import.meta.env.VITE_GLOBAL_METRICS_REFRESH_INTERVAL_MS) || 10_000,
      onSuccess: () => setLastUpdated(new Date()),
    },
  );

  return { data, error, isLoading };
};

export const useBotMetrics = (id: string | undefined, tf: Timeframe) => {
  const setLastUpdated = useDashboardStore(state => state.setLastUpdated);

  const { data, error, isLoading } = useSWR<BotMetricsResponse>(
    id
      ? `${import.meta.env.VITE_API_BASE_URL}/api/metrics/services/telegramBot/${id}?timeframe=${tf}`
      : null,
    fetcher,
    {
      refreshInterval: Number(import.meta.env.VITE_GLOBAL_METRICS_REFRESH_INTERVAL_MS) || 10_000,
      onSuccess: () => setLastUpdated(new Date()),
    },
  );

  return { data, error, isLoading };
};
