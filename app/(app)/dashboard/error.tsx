"use client";
// Error boundary del dashboard
import { Button } from "@/components/ui/Button";
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto px-4 pt-20 text-center">
      <p className="text-4xl mb-4">😔</p>
      <h2 className="text-lg font-semibold text-gray-800">Algo salió mal</h2>
      <p className="text-gray-400 text-sm mt-1 mb-6">{error.message}</p>
      <Button onClick={reset}>
        Intentar de nuevo
      </Button>
    </div>
  );
}
