"use client";
// Tabla de familias registradas en una actividad con exportación CSV
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RegistroActividad } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Download, X, CheckCircle, Circle } from "lucide-react";

interface Props {
  actividadId: string;
  tituloActividad: string;
  onCerrar: () => void;
}

export function TablaRegistrados({ actividadId, tituloActividad, onCerrar }: Props) {
  const [registros, setRegistros] = useState<RegistroActividad[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "registrosActividad"),
      where("actividadId", "==", actividadId)
    );
    const unsub = onSnapshot(q, (snap) => {
      setRegistros(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RegistroActividad));
      setCargando(false);
    });
    return unsub;
  }, [actividadId]);

  const toggleAsistencia = async (registro: RegistroActividad) => {
    await updateDoc(doc(db, "registrosActividad", registro.id), {
      asistio: !registro.asistio,
    });
  };

  const exportarCSV = () => {
    const cabecera = "Nombre cuidador,Fecha registro,Asistió";
    const filas = registros.map((r) => {
      const fecha = format(r.fechaRegistro.toDate(), "d/MM/yyyy HH:mm", { locale: es });
      return `${r.nombreCuidador},${fecha},${r.asistio ? "Sí" : "No"}`;
    });
    const csv = [cabecera, ...filas].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrados_${actividadId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const asistentes = registros.filter((r) => r.asistio).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[85vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{tituloActividad}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {registros.length} registrado{registros.length !== 1 ? "s" : ""} · {asistentes} asistieron
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportarCSV}
              disabled={registros.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Download size={13} /> CSV
            </button>
            <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1 p-4">
          {cargando ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : registros.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-400">Sin registros aún</p>
            </div>
          ) : (
            <div className="space-y-2">
              {registros.map((r) => (
                <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.nombreCuidador}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(r.fechaRegistro.toDate(), "d MMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleAsistencia(r)}
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                    style={
                      r.asistio
                        ? { background: "#D1FAE5", color: "#065F46" }
                        : { background: "#F3F4F6", color: "#6B7280" }
                    }
                  >
                    {r.asistio
                      ? <><CheckCircle size={13} /> Asistió</>
                      : <><Circle size={13} /> Pendiente</>
                    }
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
