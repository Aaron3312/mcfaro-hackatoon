// Skeleton del dashboard mientras carga
export default function DashboardLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-10 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
      <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
      <div className="h-20 bg-gray-200 rounded-2xl mb-4" />
      <div className="h-48 bg-gray-200 rounded-2xl mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 bg-gray-200 rounded-2xl" />
        <div className="h-24 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}
