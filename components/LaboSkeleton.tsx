// components/laboratoires/LaboSkeleton.tsx

export function LaboCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded w-16" />
        <div className="h-5 bg-slate-100 rounded-full w-20" />
      </div>
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
        <div className="h-3 bg-slate-100 rounded w-4/6" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="h-3 bg-slate-100 rounded w-32" />
        <div className="h-3 bg-slate-100 rounded w-4" />
      </div>
    </div>
  )
}

export function LaboSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <LaboCardSkeleton key={i} />
      ))}
    </div>
  )
}
