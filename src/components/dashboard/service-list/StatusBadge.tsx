export const StatusBadge = ({ status, isMonitored }: { status: string; isMonitored: boolean }) => {
  const displayStatus = isMonitored ? status : 'paused';

  const styles: Record<string, string> = {
    up: 'border-status-ok/50 text-status-ok',
    down: 'border-status-error/50 text-status-error',
    paused: 'border-status-unknown/50 text-status-unknown',
    pending: 'border-status-warn/50 text-status-warn',
  };

  const dots: Record<string, string> = {
    up: 'bg-status-ok',
    down: 'bg-status-error',
    paused: 'bg-status-unknown',
    pending: 'bg-status-warn',
  };

  return (
    <div
      className={`
        flex items-center gap-1.5 px-2 py-0.5 border
        ${styles[displayStatus]} bg-badge-bg uppercase
        font-mono text-[10px] tracking-widest transition-colors duration-200
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dots[displayStatus]} transition-colors duration-200`}
      />
      {displayStatus}
    </div>
  );
};
