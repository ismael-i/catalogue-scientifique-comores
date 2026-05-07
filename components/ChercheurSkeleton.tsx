// ── Skeletons ────────────────────────────────────────────────────────

export function ChercheurGridSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 animate-pulse">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-slate-200" />
      {/* Nom */}
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      {/* Institution */}
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      {/* Spécialité */}
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
  )
}

export function ChercheurListSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4 animate-pulse">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-1/4" />
      </div>
    </div>
  )
}

interface SkeletonListProps {
  count?: number
  mode?: 'grid' | 'list'
}

export function ChercheurSkeletonList({ count = 12, mode = 'grid' }: SkeletonListProps) {
  if (mode === 'list') {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <ChercheurListSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ChercheurGridSkeleton key={i} />
      ))}
    </div>
  )
}
