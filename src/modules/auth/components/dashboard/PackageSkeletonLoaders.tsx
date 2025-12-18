// Skeleton loaders for package selection flow

export function BundleCategorySkeleton() {
  return (
    <div className="group rounded-2xl p-8 bg-neutral-800 border border-neutral-700 shadow-[8px_8px_0_0_rgba(0,0,0,0.7)] min-h-[240px] flex flex-col items-center justify-center text-center animate-pulse">
      {/* Icon circle */}
      <div className="size-16 rounded-full bg-neutral-700 mb-4" />
      
      {/* Title */}
      <div className="h-7 w-32 bg-neutral-700 rounded mb-2" />
      
      {/* Badge */}
      <div className="mt-2 px-4 py-1.5 rounded-full bg-neutral-700/50">
        <div className="h-4 w-16 bg-neutral-700 rounded" />
      </div>
    </div>
  );
}

export function PackageCardSkeleton({ variant = 0 }: { variant?: number }) {
  const colorClass = variant === 0 ? 'bg-neutral-800 border-neutral-700' : variant === 1 ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-800 border-neutral-700';
  
  return (
    <div className={`rounded-2xl p-6 lg:p-6 border shadow-[8px_8px_0_0_rgba(0,0,0,0.7)] ${colorClass} min-h-[320px] flex flex-col animate-pulse`}>
      {/* Icon and badge row */}
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 bg-neutral-700 rounded" />
        <div className="ml-auto h-6 w-20 bg-neutral-700 rounded-full" />
      </div>
      
      {/* Title */}
      <div className="mt-4 h-8 w-40 bg-neutral-700 rounded" />
      
      {/* Feature list */}
      <div className="mt-5 space-y-3">
        <div className="flex items-start gap-2">
          <div className="mt-1 size-4 rounded-full bg-neutral-700 flex-shrink-0" />
          <div className="h-4 flex-1 bg-neutral-700 rounded" />
        </div>
        <div className="flex items-start gap-2">
          <div className="mt-1 size-4 rounded-full bg-neutral-700 flex-shrink-0" />
          <div className="h-4 w-3/4 bg-neutral-700 rounded" />
        </div>
        <div className="flex items-start gap-2">
          <div className="mt-1 size-4 rounded-full bg-neutral-700 flex-shrink-0" />
          <div className="h-4 w-5/6 bg-neutral-700 rounded" />
        </div>
      </div>
      
      {/* Price and CTA */}
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between">
          <div className="h-7 w-20 bg-neutral-700 rounded" />
          <div className="h-10 w-28 bg-neutral-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CompactPackageCardSkeleton() {
  return (
    <div className="rounded-xl p-5 bg-neutral-800 border border-neutral-700 animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div className="h-6 w-32 bg-neutral-700 rounded" />
        <div className="h-6 w-16 bg-neutral-700 rounded-full" />
      </div>
      <div className="h-4 w-full bg-neutral-700/50 rounded mb-2" />
      <div className="h-4 w-3/4 bg-neutral-700/50 rounded mb-4" />
      <div className="flex items-center justify-between">
        <div className="h-6 w-20 bg-neutral-700 rounded" />
        <div className="h-8 w-20 bg-neutral-700 rounded-lg" />
      </div>
    </div>
  );
}
