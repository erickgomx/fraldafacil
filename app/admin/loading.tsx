export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-slate-100 rounded-xl" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-slate-100 rounded" />
              <div className="h-8 w-8 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-8 w-36 bg-slate-200 rounded-lg" />
            <div className="h-3 w-44 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-50 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
