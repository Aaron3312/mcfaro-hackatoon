// Skeleton loader para estados de carga
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

export function SkeletonBloqueRutina() {
  return (
    <div className="flex gap-3 py-3">
      <Skeleton className="w-12 h-5 shrink-0 mt-1" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonTarjetaCita() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}
