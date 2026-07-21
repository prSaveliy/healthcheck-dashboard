import type { ServiceHistory } from '@/commons/types/api/globalMetrics';

/**
 * Given the raw history from the API (all time), the chart data within the
 * current timeframe, and the timeframe start, compute a final data series to
 * render that satisfies the edge-case rules from the spec.
 */
export function buildChartData(
  currentStatus: string,
  timeframeStart: number,
  allHistory: ServiceHistory[],
  isMonitored: boolean,
  getNow: () => number = Date.now,
): [number, number | null, string?][] {
  const now = getNow();
  const currentValue = currentStatus === 'up' ? 1 : currentStatus === 'down' ? 0 : null;

  const chartData: [number, number | null, string?][] = [];

  const historyInTimeframe = allHistory.filter(h => h.timestamp >= timeframeStart);
  const historyBeforeTimeframe = allHistory.filter(h => h.timestamp < timeframeStart);

  const lastBefore =
    historyBeforeTimeframe.length > 0
      ? historyBeforeTimeframe[historyBeforeTimeframe.length - 1]
      : null;

  let activeValue: number | null | undefined = undefined;

  if (lastBefore) {
    if (lastBefore.status === 'paused') {
      activeValue = null;
    } else if (lastBefore.status === 'resumed') {
      activeValue =
        lastBefore.prevServiceStatus === 'pending'
          ? null
          : lastBefore.prevServiceStatus === 'down'
            ? 0
            : 1;
    } else {
      activeValue = lastBefore.status === 'down' ? 0 : 1;
    }
  } else {
    if (historyInTimeframe.length === 0) {
      activeValue = isMonitored ? currentValue : null;
    }
  }

  if (activeValue !== undefined) {
    chartData.push([timeframeStart, activeValue]);
  }

  for (const h of historyInTimeframe) {
    if (h.status === 'paused') {
      activeValue = null;
    } else if (h.status === 'resumed') {
      activeValue =
        h.prevServiceStatus === 'pending' ? null : h.prevServiceStatus === 'down' ? 0 : 1;
    } else {
      activeValue = h.status === 'down' ? 0 : 1;
    }
    chartData.push([h.timestamp, activeValue, h.status]);
  }

  if (activeValue !== undefined) {
    chartData.push([now, activeValue]);
  }

  return chartData;
}
