// ── Skeleton ─────────────────────────────────────────────────────────
export function FicheSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Hero */}
      <div className="flex items-start gap-5">
        <div className="w-24 h-24 rounded-xl bg-slate-200 flex-shrink-0" />
        <div className="flex-1 space-y-3 pt-1">
          <div className="h-7 bg-slate-200 rounded w-1/2" />
          <div className="h-4 bg-slate-100 rounded w-1/4" />
          <div className="h-4 bg-slate-100 rounded w-1/3" />
        </div>
      </div>
      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-52 bg-slate-100 rounded-xl" />
          <div className="h-28 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  )
}