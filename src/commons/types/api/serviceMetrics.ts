import type { ServiceHistory } from './globalMetrics';

export interface WebsiteMetricsResponse {
  id: number;
  name: string;
  urlOrIdentifier: string;
  type: 'website';
  status: 'up' | 'down' | 'pending';
  isMonitored: boolean;
  lastCheckedAt: number | null;
  checkIntervalMs: number;
  latency: number | null;
  avgLatencyAcrossWebsites: number;
  uptimePercentage: number | null;
  drops: number;
  history: ServiceHistory[];
}

export interface BotHeartbeat {
  botName: string;
  lastHeartbeatAt: number | null;
  isCurrent: boolean;
}

export interface BotMetricsResponse {
  id: number;
  name: string;
  urlOrIdentifier: string;
  type: 'telegramBot';
  status: 'up' | 'down' | 'pending';
  isMonitored: boolean;
  lastHeartbeatAt: number | null;
  heartbeatIntervalMs: number;
  uptimePercentage: number | null;
  drops: number;
  history: ServiceHistory[];
  allBotHeartbeats: BotHeartbeat[];
}
