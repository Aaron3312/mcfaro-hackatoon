"use client";
// Módulo de transporte — rutas fijas disponibles para el cuidador
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/Skeleton";
import { Ruta, DiaSemana, HorarioRuta } from "@/lib/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addDays, startOfDay, setHours, setMinutes } from "date-fns";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Bus, MapPin, Clock, ArrowRight, CalendarClock } from "lucide-react";

// ── Días de semana ────────────────────────────────────────────────────────────
const DIA_LABEL: Record<DiaSemana, string> = {
  lun: "Lun", mar: "Mar", mie: "Mié", jue: "Jue", vie: "Vie", sab: "Sáb", dom: "Dom",
};
const DIA_NUM: Record<DiaSemana, number> = {
  dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6,
};

function proximaSalida(horarios: HorarioRuta[]): Date | null {
  const ahora = new Date();
  let minFecha: Date | null = null;
  for (const h of horarios) {
    const [hh, mm] = h.hora.split(":").map(Number);
    for (const dia of h.dias) {
      const target = DIA_NUM[dia];
      const diasHasta = (target - ahora.getDay() + 7) % 7;
      let fecha = setMinutes(setHours(startOfDay(addDays(ahora, diasHasta)), hh), mm);
      if (fecha <= ahora) fecha = addDays(fecha, 7);
      if (!minFecha || fecha < minFecha) minFecha = fecha;
    }
  }
  return minFecha;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonTarjeta() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

// ── Tarjeta de ruta ───────────────────────────────────────────────────────────
function TarjetaRuta({ ruta }: { ruta: Ruta }) {
  const proxima = proximaSalida(ruta.horarios);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      {/* Nombre */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FDF0E6" }}>
          <Bus size={16} style={{ color: "#C85A2A" }} />
        </div>
        <h3 className="font-bold text-gray-800 text-sm">{ruta.nombre}</h3>
      </div>

      {/* Origen → paradas → Destino */}
      <div className="flex flex-col gap-1 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={13} className="text-gray-400 shrink-0" />
          <span className="font-medium">{ruta.origen}</span>
        </div>
        {ruta.paradas && ruta.paradas.length > 0 && (
          <div className="flex flex-col gap-1 pl-[19px] border-l-2 border-dashed ml-[6px]" style={{ borderColor: "#E8D8C8" }}>
            {ruta.paradas.map((parada, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0 -ml-[13px]" />
                <span>{parada}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={13} className="shrink-0" style={{ color: "#C85A2A" }} />
          <span className="font-medium">{ruta.destino}</span>
        </div>
      </div>

      {/* Horarios */}
      <div className="flex flex-wrap gap-2 mb-3">
        {ruta.horarios.map((h, i) => (
          <div
            key={i}
            className="flex items-center gap-1 text-xs rounded-lg px-2 py-1"
            style={{ background: "#F5F0EA", color: "#7A3D1A" }}
          >
            <Clock size={11} />
            <span className="font-semibold">{h.hora}</span>
            <span className="text-gray-400 mx-0.5">·</span>
            <span>{h.dias.map((d) => DIA_LABEL[d]).join(", ")}</span>
          </div>
        ))}
      </div>

      {/* Próxima salida */}
      {proxima && (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "#9A6A2A" }}>
          <CalendarClock size={12} />
          <span>
            Próxima salida:{" "}
            <span className="font-semibold">
              {format(proxima, "EEEE d MMM · HH:mm", { locale: es })}
            </span>
          </span>
        </div>
      )}

      {/* Notas */}
      {ruta.notas && (
        <p className="mt-2 text-xs text-gray-400 italic">"{ruta.notas}"</p>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function TransportePage() {
  const { familia } = useAuth();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!familia?.casaRonald) {
      setCargando(false);
      return;
    }
    const q = query(
      collection(db, "rutas"),
      where("casaRonald", "==", familia.casaRonald),
      where("activa", "==", true)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRutas(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Ruta));
        setCargando(false);
      },
      () => setCargando(false)
    );
    return unsub;
  }, [familia?.casaRonald]);

  return (
    <>
      {/* ── Banner ───────────────────────────────────────── */}
      <div
        className="relative overflow-hidden w-full"
        style={{ background: "linear-gradient(135deg, #C85A2A 0%, #E87A3A 70%, #F5C842 100%)" }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15" style={{ background: "#7A3D1A" }} />
        <div className="max-w-2xl mx-auto px-5 py-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bus size={24} /> Transporte
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Rutas disponibles desde tu Casa Ronald McDonald
          </p>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pt-5 pb-24 space-y-3">
        {cargando ? (
          <>
            <SkeletonTarjeta />
            <SkeletonTarjeta />
            <SkeletonTarjeta />
          </>
        ) : rutas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <Bus size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="font-semibold text-gray-500 text-sm">Sin rutas disponibles</p>
            <p className="text-gray-400 text-xs mt-2">
              El coordinador aún no ha registrado rutas para tu casa
            </p>
          </div>
        ) : (
          rutas.map((r) => <TarjetaRuta key={r.id} ruta={r} />)
        )}
      </div>
    </>
  );
}
