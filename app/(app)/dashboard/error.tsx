"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <span className="text-4xl mb-4">😔</span>
      <h2 className="text-lg font-bold text-gray-800 mb-1">Algo salió mal</h2>
      <p className="text-sm text-gray-400 mb-6">No se pudo cargar el dashboard</p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-2xl text-white font-medium text-sm"
        style={{ background: "#C85A2A" }}
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
