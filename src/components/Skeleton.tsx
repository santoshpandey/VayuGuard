export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 space-y-3 animate-fade-in">
      <div className="flex justify-between gap-3">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-16 w-full" />
      <div className="skeleton h-8 w-40" />
    </div>
  );
}

export function PlanSkeleton() {
  return (
    <div className="space-y-3">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
