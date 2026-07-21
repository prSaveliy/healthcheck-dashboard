import { Link, useLocation } from 'react-router-dom';

import { StatusBadge } from './StatusBadge';

import type { ServiceMetrics } from '@/commons/types/api/globalMetrics';

export const ServiceCard = ({ service }: { service: ServiceMetrics }) => {
  const location = useLocation();
  const targetPath = `/${service.type}/${service.id}`;
  const isActive = location.pathname === targetPath;

  return (
    <Link
      to={targetPath}
      className={`flex items-center justify-between border transition-colors p-3 cursor-pointer group duration-200 ${isActive ? 'border-text-muted bg-bg-hover' : 'border-border-default bg-bg-surface hover:border-text-muted hover:bg-bg-hover'}`}
    >
      <span
        className={`text-sm font-medium transition-colors truncate pr-4 ${isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}
      >
        {service.name}
      </span>
      <StatusBadge status={service.status} isMonitored={service.isMonitored} />
    </Link>
  );
};
