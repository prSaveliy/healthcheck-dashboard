export const SkeletonServiceRow = () => (
  <div className="flex flex-col border border-border-default bg-bg-card p-4 gap-3 transition-colors duration-200">
    <div className="flex justify-between items-center">
      <div className="h-4 w-32 rounded shimmer"></div>
      <div className="flex items-center gap-3">
        <div className="h-3 w-12 rounded shimmer"></div>
        <div className="h-3 w-16 rounded shimmer"></div>
      </div>
    </div>
    <div className="h-[60px] w-full rounded mt-2 shimmer"></div>
  </div>
);
