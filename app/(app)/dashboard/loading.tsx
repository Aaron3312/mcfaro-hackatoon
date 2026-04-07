import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Banner skeleton */}
      <div className="w-full h-36 bg-gray-200" />
      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    </div>
  );
}
