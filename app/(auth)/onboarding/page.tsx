"use client";
// Wizard de onboarding — completa perfil tras el primer login
import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/lib/logger";

const tratamientos = ["oncologia", "cardiologia", "neurologia", "otro"] as const;
const etiquetasTratamiento: Record<typeof tratamientos[number], string> = {
  oncologia:   "Oncología",
  cardiologia: "Cardiología",
  neurologia:  "Neurología",
  otro:        "Otro",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    nombreCuidador:   "",
    nombreNino:       "",
    hospital:         "",
    tipoTratamiento:  "oncologia" as typeof tratamientos[number],
  });

  const set = (campo: keyof typeof form, valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const handleGuardar = async () => {
    if (!usuario) return;
    setGuardando(true);
    try {
      await setDoc(doc(db, "familias", usuario.uid), {
        ...form,
        telefono:    usuario.phoneNumber ?? "",
        casaRonald:  "default",
        rol:         "cuidador",
        fechaIngreso: Timestamp.now(),
        fcmToken:    null,
      });
      router.replace("/dashboard");
    } catch (err) {
      logger.error("Error guardando perfil:", err);
    } finally {
      setGuardando(false);
    }
  };

  const pasos = [
    {
      titulo: "Tu nombre",
      contenido: (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre completo</label>
            <input type="text" value={form.nombreCuidador}
              onChange={(e) => set("nombreCuidador", e.target.value)}
              placeholder="Ej. María González"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#F5C842]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del niño / niña</label>
            <input type="text" value={form.nombreNino}
              onChange={(e) => set("nombreNino", e.target.value)}
              placeholder="Ej. Sofía"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#F5C842]"
            />
          </div>
        </div>
      ),
      valido: form.nombreCuidador.trim().length > 0,
    },
    {
      titulo: "El hospital",
      contenido: (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hospital donde está internado</label>
          <input type="text" value={form.hospital}
            onChange={(e) => set("hospital", e.target.value)}
            placeholder="Ej. Hospital Infantil de México"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#F5C842]"
          />
        </div>
      ),
      valido: form.hospital.trim().length > 0,
    },
    {
      titulo: "Tipo de tratamiento",
      contenido: (
        <div className="grid grid-cols-2 gap-2">
          {tratamientos.map((t) => (
            <button key={t} onClick={() => set("tipoTratamiento", t)}
              className={`py-3 px-3 rounded-xl text-sm font-medium text-center transition-colors ${
                form.tipoTratamiento === t ? "text-white" : "bg-gray-100 text-gray-600"
              }`}
              style={form.tipoTratamiento === t ? { background: "#C85A2A" } : {}}>
              {etiquetasTratamiento[t]}
            </button>
          ))}
        </div>
      ),
      valido: true,
    },
  ];

  const pasoActual = pasos[paso - 1];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(160deg, #FDF0E6 0%, #fff 60%)" }}>

      {/* Progreso */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex gap-1.5">
          {pasos.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full transition-colors"
              style={{ background: i < paso ? "#C85A2A" : "#E5E7EB" }} />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Paso {paso} de {pasos.length}</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{pasoActual.titulo}</h2>
          <p className="text-sm text-gray-400 mt-0.5">Cuéntanos un poco sobre ti</p>
        </div>

        {pasoActual.contenido}

        <button
          onClick={paso < pasos.length ? () => setPaso(paso + 1) : handleGuardar}
          disabled={!pasoActual.valido || guardando}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base min-h-14 disabled:opacity-60 transition-colors"
          style={{ background: "#C85A2A" }}>
          {guardando ? "Guardando…" : paso < pasos.length ? "Continuar" : "Entrar a mcFaro"}
        </button>
      </div>
    </div>
  );
}
