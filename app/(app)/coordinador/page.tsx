"use client";
// Panel del coordinador — responsive: 1 col mobile / 2 cols desktop
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Familia, Cita } from "@/lib/types";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Calendar, Clock, Activity, Car } from "lucide-react";

export default function CoordinadorPage() {
  const router = useRouter();
  const { familia, cargando } = useAuth();
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [citasHoy, setCitasHoy] = useState<Cita[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    if (!cargando && familia && familia.rol !== "coordinador") {
      router.replace("/dashboard");
    }
  }, [familia, cargando, router]);

  useEffect(() => {
    if (!familia || familia.rol !== "coordinador") return;

    const qFamilias = query(collection(db, "familias"), where("rol", "==", "cuidador"));
    const unsubFamilias = onSnapshot(qFamilias, (snap) => {
      setFamilias(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Familia));
      setCargandoDatos(false);
    });

    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    const qCitas = query(
      collection(db, "citas"),
      where("fecha", ">=", inicioDia),
      where("fecha", "<=", finDia)
    );
    const unsubCitas = onSnapshot(qCitas, (snap) => {
      setCitasHoy(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Cita));
    });

    return () => { unsubFamilias(); unsubCitas(); };
  }, [familia]);

  if (cargando || cargandoDatos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#C85A2A", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const hoy = new Date();
  const promedioDias = familias.length > 0
    ? Math.round(
        familias.reduce((acc, f) => acc + (f.fechaIngreso ? differenceInDays(hoy, f.fechaIngreso.toDate()) : 0), 0)
        / familias.length
      )
    : 0;

  return (
    <>
      {/* ── Banner ───────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15"
          style={{ background: "#7A3D1A" }} />
        <div className="max-w-6xl mx-auto px-5 py-8 md:px-10 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Panel coordinador</h1>
          <p className="text-white/70 text-sm mt-1 capitalize">
            {format(hoy, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 md:px-10 md:pt-8">

        {/* Stats — 2 cols mobile / 4 cols desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 md:mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "#FDF0E6" }}>
              <Users size={18} style={{ color: "#C85A2A" }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "#7A3D1A" }}>{familias.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Familias activas</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-blue-50">
              <Calendar size={18} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-700">{citasHoy.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Citas hoy</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-purple-50">
              <Activity size={18} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-700">{promedioDias}</p>
            <p className="text-xs text-gray-500 mt-0.5">Días promedio estancia</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-emerald-50">
              <Clock size={18} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {familias.filter(f => citasHoy.some(c => c.familiaId === f.id)).length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Familias con cita hoy</p>
          </div>
        </div>

        {/* Acceso rápido a módulos */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/coordinador/transporte")}
            className="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-4 w-full text-left hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#FDF0E6" }}>
              <Car size={20} style={{ color: "#C85A2A" }} />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Gestión de transporte</p>
              <p className="text-xs text-gray-400 mt-0.5">Solicitudes, unidades y asignaciones</p>
            </div>
            <span className="ml-auto text-gray-300">›</span>
          </button>

          <button
            onClick={() => router.push("/coordinador/actividades")}
            className="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-4 w-full text-left hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#EDE9FE" }}>
              <Activity size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Gestión de actividades</p>
              <p className="text-xs text-gray-400 mt-0.5">Crear, editar y ver registrados</p>
            </div>
            <span className="ml-auto text-gray-300">›</span>
          </button>
        </div>

        {/* Grid principal — 2 cols en desktop */}
        <div className="md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8">

          {/* Citas de hoy */}
          <section className="mb-6 md:mb-0">
            <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
              Citas de hoy
            </h2>
            {citasHoy.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <Calendar size={28} className="mx-auto mb-2 opacity-25 text-gray-400" />
                <p className="text-sm text-gray-400">Sin citas registradas para hoy</p>
              </div>
            ) : (
              <div className="space-y-2">
                {citasHoy.map((cita) => {
                  const familiaCita = familias.find((f) => f.id === cita.familiaId);
                  return (
                    <div key={cita.id} className="bg-white rounded-2xl shadow-sm p-4"
                      style={{ borderLeft: "4px solid #C85A2A" }}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-blue-50">
                          <Clock className="text-blue-600" size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{cita.titulo}</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {format(cita.fecha.toDate(), "HH:mm")} ·{" "}
                            {familiaCita?.nombreCuidador ?? "Cuidador"}
                            {familiaCita?.nombreNino ? ` — ${familiaCita.nombreNino}` : ""}
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg shrink-0"
                          style={{ background: "#FDF0E6", color: "#C85A2A" }}>
                          {cita.servicio}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Familias hospedadas */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#9A6A2A" }}>
              Familias hospedadas
            </h2>
            {familias.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <Users size={28} className="mx-auto mb-2 opacity-25 text-gray-400" />
                <p className="text-sm text-gray-400">No hay familias activas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {familias.map((f) => {
                  const diasEstancia = f.fechaIngreso
                    ? differenceInDays(hoy, f.fechaIngreso.toDate())
                    : 0;
                  return (
                    <div key={f.id} className="bg-white rounded-2xl shadow-sm p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 truncate">{f.nombreCuidador}</p>
                          {f.nombreNino && (
                            <p className="text-gray-500 text-sm mt-0.5 truncate">
                              Acompañando a <span className="font-medium">{f.nombreNino}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{f.hospital}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-bold" style={{ color: "#7A3D1A" }}>
                            {diasEstancia}d
                          </span>
                          <p className="text-xs text-gray-400">estancia</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
                          {f.tipoTratamiento}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-lg"
                          style={{ background: "#FDF0E6", color: "#C85A2A" }}>
                          {citasHoy.filter((c) => c.familiaId === f.id).length} citas hoy
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
