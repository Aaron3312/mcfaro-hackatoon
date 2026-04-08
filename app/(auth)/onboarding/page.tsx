"use client";
// Wizard de onboarding — 4 pasos para registrar familia en Casa Ronald McDonald
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/lib/logger";
import { CheckCircle, User, Heart, Hospital, Home } from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface FormState {
  // Paso 1 — cuidador
  nombreCuidador: string;
  email: string;
  parentesco: string;
  // Paso 2 — paciente
  nombreNino: string;
  edadNino: string;
  // Paso 3 — hospital
  hospital: string;
  // Paso 4 — casa
  casaRonald: string;
  habitacion: string;
}

const CASAS_RONALD = [
  "Casa Ronald McDonald CDMX",
  "Casa Ronald McDonald Guadalajara",
  "Casa Ronald McDonald Monterrey",
  "Casa Ronald McDonald Puebla",
  "Otra",
];

// ── Indicador de pasos ────────────────────────────────────────────────────────
function IndicadorPasos({ total, actual }: { total: number; actual: number }) {
  const iconos = [User, Heart, Hospital, Home];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => {
        const Icono = iconos[i];
        const completado = i < actual - 1;
        const enCurso = i === actual - 1;
        return (
          <div key={i} className="flex items-center">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{
                background: completado ? "#C85A2A" : enCurso ? "#FDF0E6" : "#F3F4F6",
                border: enCurso ? "2px solid #C85A2A" : "2px solid transparent",
              }}
            >
              {completado
                ? <CheckCircle size={16} color="#fff" />
                : <Icono size={16} color={enCurso ? "#C85A2A" : "#9CA3AF"} />
              }
            </div>
            {i < total - 1 && (
              <div
                className="w-8 h-0.5 mx-1 transition-colors"
                style={{ background: completado ? "#C85A2A" : "#E5E7EB" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Campo de formulario ───────────────────────────────────────────────────────
function Campo({
  label, obligatorio, children,
}: { label: string; obligatorio?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {obligatorio && <span style={{ color: "#C85A2A" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors min-h-[48px]";

// ── Pantalla de éxito ─────────────────────────────────────────────────────────
function PantallaExito({ nombre, qrCode }: { nombre: string; qrCode: string }) {
  const router = useRouter();
  return (
    <div className="text-center space-y-5">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
        style={{ background: "#FDF0E6" }}
      >
        <CheckCircle size={40} style={{ color: "#C85A2A" }} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">¡Bienvenido, {nombre}!</h2>
        <p className="text-sm text-gray-500 mt-1">
          Tu registro está completo. mcFaro estará contigo en este camino.
        </p>
      </div>

      {/* QR credential preview */}
      <div
        className="rounded-2xl p-4 mx-auto max-w-xs"
        style={{ background: "#FDF0E6" }}
      >
        <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#9A6A2A" }}>
          Tu código de credencial
        </p>
        <div
          className="bg-white rounded-xl p-3 font-mono text-xs break-all text-center"
          style={{ color: "#7A3D1A" }}
        >
          {qrCode}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Lo encontrarás también en tu perfil dentro de la app.
        </p>
      </div>

      <button
        onClick={() => router.replace("/dashboard")}
        className="w-full py-4 rounded-2xl text-white font-bold text-base min-h-[52px]"
        style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}
      >
        Ir a mcFaro
      </button>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { user: usuario } = useAuth();
  const [paso, setPaso] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [completado, setCompletado] = useState(false);

  const [form, setForm] = useState<FormState>({
    nombreCuidador: "",
    email: "",
    parentesco: "madre",
    nombreNino: "",
    edadNino: "",
    hospital: "",
    casaRonald: CASAS_RONALD[0],
    habitacion: "",
  });

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const TOTAL_PASOS = 4;

  const validoPaso = (p: number): boolean => {
    if (p === 1) return form.nombreCuidador.trim().length > 0 && form.parentesco.trim().length > 0;
    if (p === 2) return form.nombreNino.trim().length > 0 && form.edadNino.trim().length > 0;
    if (p === 3) return form.hospital.trim().length > 0;
    return true;
  };

  const handleFinalizar = async () => {
    if (!usuario) return;
    setGuardando(true);
    setError("");
    try {
      const res = await fetch("/api/familias/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: usuario.uid,
          nombreCuidador: form.nombreCuidador.trim(),
          telefono: usuario.phoneNumber ?? "",
          email: form.email.trim(),
          parentesco: form.parentesco,
          nombreNino: form.nombreNino.trim(),
          edadNino: parseInt(form.edadNino) || 0,
          hospital: form.hospital.trim(),
          casaRonald: form.casaRonald,
          habitacion: form.habitacion.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Error al guardar");
      }

      const { qrCode: qr } = await res.json();
      setQrCode(qr);
      setCompletado(true);
    } catch (e: unknown) {
      logger.error("Error en onboarding:", e);
      setError(e instanceof Error ? e.message : "Error al guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  if (completado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "linear-gradient(160deg, #FDF0E6 0%, #fff 60%)" }}>
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-6">
          <PantallaExito nombre={form.nombreCuidador.split(" ")[0]} qrCode={qrCode} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
      style={{ background: "linear-gradient(160deg, #FDF0E6 0%, #fff 60%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <p className="text-2xl font-bold" style={{ color: "#7A3D1A" }}>
            mc<span style={{ color: "#C85A2A" }}>Faro</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Registro de familia</p>
        </div>

        <IndicadorPasos total={TOTAL_PASOS} actual={paso} />

        <div className="bg-white rounded-3xl shadow-sm p-6 space-y-5">
          {/* Paso 1 — datos del cuidador */}
          {paso === 1 && (
            <>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tus datos</h2>
                <p className="text-sm text-gray-400 mt-0.5">Cuéntanos quién eres</p>
              </div>
              <div className="space-y-4">
                <Campo label="Tu nombre completo" obligatorio>
                  <input
                    type="text"
                    value={form.nombreCuidador}
                    onChange={(e) => set("nombreCuidador", e.target.value)}
                    placeholder="Ej. María González"
                    className={inputClass}
                  />
                </Campo>
                <Campo label="Correo electrónico">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="correo@ejemplo.com (opcional)"
                    className={inputClass}
                  />
                </Campo>
                <Campo label="Parentesco con el paciente" obligatorio>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {["madre", "padre", "abuelo/a", "otro familiar"].map((p) => (
                      <button
                        key={p}
                        onClick={() => set("parentesco", p)}
                        className="py-2.5 px-3 rounded-xl text-sm font-medium capitalize transition-colors min-h-[44px]"
                        style={
                          form.parentesco === p
                            ? { background: "#C85A2A", color: "#fff" }
                            : { background: "#F3F4F6", color: "#374151" }
                        }
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </Campo>
              </div>
            </>
          )}

          {/* Paso 2 — datos del paciente */}
          {paso === 2 && (
            <>
              <div>
                <h2 className="text-lg font-bold text-gray-900">El paciente</h2>
                <p className="text-sm text-gray-400 mt-0.5">Datos del niño o niña</p>
              </div>
              <div className="space-y-4">
                <Campo label="Nombre del niño / niña" obligatorio>
                  <input
                    type="text"
                    value={form.nombreNino}
                    onChange={(e) => set("nombreNino", e.target.value)}
                    placeholder="Ej. Sofía"
                    className={inputClass}
                  />
                </Campo>
                <Campo label="Edad" obligatorio>
                  <input
                    type="number"
                    min={0}
                    max={18}
                    value={form.edadNino}
                    onChange={(e) => set("edadNino", e.target.value)}
                    placeholder="Años"
                    className={inputClass}
                  />
                </Campo>
              </div>
            </>
          )}

          {/* Paso 3 — hospital */}
          {paso === 3 && (
            <>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Hospital</h2>
                <p className="text-sm text-gray-400 mt-0.5">¿En qué hospital está internado el niño?</p>
              </div>
              <div className="space-y-4">
                <Campo label="Hospital donde está internado" obligatorio>
                  <input
                    type="text"
                    value={form.hospital}
                    onChange={(e) => set("hospital", e.target.value)}
                    placeholder="Ej. Hospital Infantil de México"
                    className={inputClass}
                  />
                </Campo>
              </div>
            </>
          )}

          {/* Paso 4 — casa Ronald */}
          {paso === 4 && (
            <>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tu Casa Ronald</h2>
                <p className="text-sm text-gray-400 mt-0.5">¿En cuál te hospedas?</p>
              </div>
              <div className="space-y-4">
                <Campo label="Casa Ronald McDonald" obligatorio>
                  <div className="space-y-2">
                    {CASAS_RONALD.map((c) => (
                      <button
                        key={c}
                        onClick={() => set("casaRonald", c)}
                        className="w-full text-left py-3 px-4 rounded-xl text-sm font-medium transition-colors min-h-[48px]"
                        style={
                          form.casaRonald === c
                            ? { background: "#FDF0E6", color: "#C85A2A", border: "2px solid #C85A2A" }
                            : { background: "#F9FAFB", color: "#374151", border: "2px solid transparent" }
                        }
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </Campo>
                <Campo label="Número de habitación">
                  <input
                    type="text"
                    value={form.habitacion}
                    onChange={(e) => set("habitacion", e.target.value)}
                    placeholder="Ej. 12A (opcional)"
                    className={inputClass}
                  />
                </Campo>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Navegación */}
          <div className="flex gap-3 pt-1">
            {paso > 1 && (
              <button
                onClick={() => setPaso(paso - 1)}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Atrás
              </button>
            )}
            <button
              onClick={paso < TOTAL_PASOS ? () => setPaso(paso + 1) : handleFinalizar}
              disabled={!validoPaso(paso) || guardando}
              className="flex-1 py-3.5 rounded-2xl font-bold text-white text-sm disabled:opacity-50 transition-opacity min-h-[52px]"
              style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}
            >
              {guardando
                ? "Guardando…"
                : paso < TOTAL_PASOS
                ? "Continuar"
                : "Finalizar registro"}
            </button>
          </div>

          {/* Indicador numérico */}
          <p className="text-center text-xs text-gray-400">
            Paso {paso} de {TOTAL_PASOS}
          </p>
        </div>
      </div>
    </div>
  );
}
