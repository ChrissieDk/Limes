// Skeleton loaders that match the actual component dimensions

export function SimCardSkeleton() {
  return (
    <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          {/* SIM image placeholder */}
          <div className="w-12 h-8 rounded bg-neutral-700" />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {/* Name + Active badge */}
              <div className="h-4 w-16 bg-neutral-700 rounded" />
              <div className="h-5 w-14 bg-neutral-700 rounded-full" />
            </div>
            {/* Phone Number label */}
            <div className="h-3 w-20 bg-neutral-700 rounded mb-2" />
            {/* Phone Number value */}
            <div className="h-4 w-32 bg-neutral-700 rounded" />
          </div>
        </div>
        {/* More button */}
        <div className="size-5 bg-neutral-700 rounded" />
      </div>

      {/* Buttons */}
      <div className="flex space-x-2">
        <div className="flex-1 h-9 bg-neutral-700 rounded-lg" />
        <div className="w-20 h-9 bg-neutral-700 rounded-lg" />
      </div>
    </div>
  );
}

export function PlanDetailsSkeleton() {
  return (
    <div className="bg-neutral-800 rounded-2xl p-5 border border-neutral-700 animate-pulse">
      {/* Title */}
      <div className="h-8 w-32 bg-neutral-700 rounded mb-4" />
      
      {/* Grid of 4 boxes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-700/50 rounded-2xl p-4">
          <div className="h-3 w-20 bg-neutral-700 rounded mb-2" />
          <div className="h-6 w-16 bg-neutral-700 rounded" />
        </div>
        <div className="bg-neutral-700/50 rounded-2xl p-4">
          <div className="h-3 w-16 bg-neutral-700 rounded mb-2" />
          <div className="h-6 w-12 bg-neutral-700 rounded" />
        </div>
        <div className="bg-neutral-700/50 rounded-2xl p-4">
          <div className="h-3 w-20 bg-neutral-700 rounded mb-2" />
          <div className="h-6 w-14 bg-neutral-700 rounded" />
        </div>
        <div className="bg-neutral-700/50 rounded-2xl p-4">
          <div className="h-3 w-12 bg-neutral-700 rounded mb-2" />
          <div className="h-6 w-16 bg-neutral-700 rounded" />
        </div>
      </div>
    </div>
  );
}

export function BundleCardSkeleton() {
  return (
    <div className="bg-neutral-800 relative rounded-2xl px-6 pt-6 pb-4 min-h-[220px] border border-neutral-700 overflow-hidden flex flex-col animate-pulse">
      {/* Title */}
      <div className="flex items-center mb-4">
        <div className="w-6 h-6 bg-neutral-700 rounded mr-2" />
        <div className="h-8 w-32 bg-neutral-700 rounded" />
      </div>

      {/* Bullet list */}
      <div className="space-y-3 mb-4 max-w-[80%]">
        <div className="flex items-start">
          <div className="w-7 h-5 bg-neutral-700 rounded mr-3 mt-0.5" />
          <div className="h-4 flex-1 bg-neutral-700 rounded" />
        </div>
        <div className="flex items-start">
          <div className="w-7 h-5 bg-neutral-700 rounded mr-3 mt-0.5" />
          <div className="h-4 w-3/4 bg-neutral-700 rounded" />
        </div>
      </div>

      {/* CTA with offset shadow */}
      <div className="relative inline-flex w-fit self-start mt-auto pt-2">
        <div className="absolute inset-0 translate-x-1.5 translate-y-2 rounded-2xl bg-neutral-900" />
        <div className="relative bg-neutral-700 border-2 border-neutral-900 rounded-2xl px-5 py-2.5 w-36 h-11" />
      </div>
    </div>
  );
}
