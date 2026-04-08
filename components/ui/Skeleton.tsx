// Skeleton loader para estados de carga
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;
}

export function SkeletonTarjetaCita() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export function SkeletonTarjetaComida() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function SkeletonTarjetaTransporte() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
