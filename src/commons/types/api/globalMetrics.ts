export interface SystemOverview {
  systemStatus: 'OPERATIONAL' | 'DEGRADED' | 'PARTIAL OUTAGE' | 'MAJOR OUTAGE';
  totalServices: number;
  upServices: number;
  downServices: number;
  activeServices: number;
  pausedServices: number;
  globalUptimePercentage: number | null;
}

export interface ServiceHistory {
  timestamp: number;
  status: 'up' | 'down' | 'paused' | 'resumed';
  prevServiceStatus?: 'up' | 'down' | 'pending';
}

export interface ServiceMetrics {
  id: number;
  name: string;
  type: 'website' | 'telegramBot';
  urlOrIdentifier: string;
  status: 'up' | 'down' | 'pending';
  isMonitored: boolean;
  uptimePercentage: number | null;
  history: ServiceHistory[];
  drops: number;
}

export interface GlobalMetricsResponse {
  overview: SystemOverview;
  services: ServiceMetrics[];
}
