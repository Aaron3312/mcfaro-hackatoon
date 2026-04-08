"use client";
// Vista del menú del día — responsive: 1 col mobile / 2 cols desktop
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMenu } from "@/hooks/useMenu";
import { TarjetaComida } from "@/components/menu/TarjetaComida";
import { Toast, useToast } from "@/components/ui/Toast";
import { SkeletonTarjetaComida } from "@/components/ui/Skeleton";
import { UtensilsCrossed, Clock, MapPin, X, AlertCircle } from "lucide-react";

// ── Form de publicación de menú ───────────────────────────────────────────────
function FormPublicarMenu({
  onPublicar,
  onCerrar,
}: {
  onPublicar: (datos: {
    desayuno: { hora: string; descripcion: string };
    comida:   { hora: string; descripcion: string };
    cena:     { hora: string; descripcion: string };
  }) => Promise<void>;
  onCerrar: () => void;
}) {
  const [form, setForm] = useState({
    desayuno: { hora: "08:00", descripcion: "" },
    comida:   { hora: "13:00", descripcion: "" },
    cena:     { hora: "19:00", descripcion: "" },
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  type TipoComida = "desayuno" | "comida" | "cena";

  const setcampo = (tipo: TipoComida, campo: "hora" | "descripcion", valor: string) =>
    setForm((prev) => ({ ...prev, [tipo]: { ...prev[tipo], [campo]: valor } }));

  const valido =
    form.desayuno.descripcion.trim() &&
    form.comida.descripcion.trim() &&
    form.cena.descripcion.trim();

  const handleSubmit = async () => {
    if (!valido) return;
    setGuardando(true);
    setError("");
    try {
      await onPublicar(form);
      onCerrar();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al publicar");
    } finally {
      setGuardando(false);
    }
  };

  const SECCIONES: { tipo: TipoComida; label: string; emoji: string }[] = [
    { tipo: "desayuno", label: "Desayuno", emoji: "🌅" },
    { tipo: "comida",   label: "Comida",   emoji: "☀️" },
    { tipo: "cena",     label: "Cena",     emoji: "🌙" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={18} style={{ color: "#C85A2A" }} />
            <h3 className="font-bold text-gray-800">Publicar menú del día</h3>
          </div>
          <button onClick={onCerrar} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Formulario */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {SECCIONES.map(({ tipo, label, emoji }) => (
            <div key={tipo} className="rounded-2xl border border-gray-100 p-4 space-y-3">
              <p className="font-bold text-gray-700 text-sm">{emoji} {label}</p>

              {/* Hora */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Hora</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="time"
                    value={form[tipo].hora}
                    onChange={(e) => setcampo(tipo, "hora", e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 min-h-[44px]"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Descripción del menú *
                </label>
                <textarea
                  placeholder={
                    tipo === "desayuno"
                      ? "Ej: Huevos revueltos, frijoles, pan tostado y jugo"
                      : tipo === "comida"
                      ? "Ej: Sopa de verduras, arroz, pollo a la plancha"
                      : "Ej: Crema de brócoli, quesadillas y agua de fruta"
                  }
                  value={form[tipo].descripcion}
                  onChange={(e) => setcampo(tipo, "descripcion", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none"
                />
              </div>
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!valido || guardando}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white disabled:opacity-50 transition-opacity"
            style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}
          >
            {guardando ? "Publicando…" : "Publicar menú"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function MenuPage() {
  const { familia } = useAuth();
  const { menuHoy, cargando, publicarMenu, marcarDisponible } = useMenu(familia?.casaRonald);
  const { toast, mostrar, cerrar } = useToast();
  const [formAbierto, setFormAbierto] = useState(false);

  const esCoordinador = familia?.rol === "coordinador";

  const handlePublicar = async (datos: {
    desayuno: { hora: string; descripcion: string };
    comida:   { hora: string; descripcion: string };
    cena:     { hora: string; descripcion: string };
  }) => {
    await publicarMenu({ ...datos, publicadoPor: familia?.nombreCuidador ?? "Coordinador" });
    mostrar("Menú publicado correctamente");
  };

  const handleMarcarDisponible = async (tipo: "desayuno" | "comida" | "cena") => {
    try {
      await marcarDisponible(tipo);
      mostrar("Familias notificadas correctamente");
    } catch {
      mostrar("Error al marcar disponible", "error");
    }
  };

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Menú del día</h1>
              <p className="text-white/70 text-sm mt-1">
                Desayuno, comida y cena incluidos
              </p>
            </div>
            {esCoordinador && (
              <button
                onClick={() => setFormAbierto(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-2xl px-4 py-3 font-semibold text-sm transition-colors shadow-sm min-h-[48px]"
              >
                <UtensilsCrossed size={18} />
                <span className="hidden sm:inline">
                  {menuHoy ? "Editar menú" : "Publicar menú"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4 md:px-10 md:pt-8 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-8">

        {/* Columna principal — tarjetas de comidas */}
        <div className="space-y-4">
          {cargando ? (
            <>
              <SkeletonTarjetaComida />
              <SkeletonTarjetaComida />
              <SkeletonTarjetaComida />
            </>
          ) : !menuHoy ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-25" style={{ color: "#C85A2A" }} />
              <p className="font-semibold text-gray-600">No hay menú publicado hoy</p>
              <p className="text-gray-400 text-sm mt-1">
                {esCoordinador
                  ? "Publica el menú del día para que las familias sepan qué hay de comer"
                  : "El coordinador publicará el menú pronto"}
              </p>
              {esCoordinador && (
                <button
                  onClick={() => setFormAbierto(true)}
                  className="mt-5 px-6 py-3 rounded-2xl text-sm font-bold text-white min-h-[48px]"
                  style={{ background: "linear-gradient(135deg, #C85A2A, #E87A3A)" }}
                >
                  + Publicar menú de hoy
                </button>
              )}
            </div>
          ) : (
            <>
              <TarjetaComida
                tipo="desayuno"
                comida={menuHoy.comidas.desayuno}
                esCoordinador={esCoordinador}
                onMarcarDisponible={() => handleMarcarDisponible("desayuno")}
              />
              <TarjetaComida
                tipo="comida"
                comida={menuHoy.comidas.comida}
                esCoordinador={esCoordinador}
                onMarcarDisponible={() => handleMarcarDisponible("comida")}
              />
              <TarjetaComida
                tipo="cena"
                comida={menuHoy.comidas.cena}
                esCoordinador={esCoordinador}
                onMarcarDisponible={() => handleMarcarDisponible("cena")}
              />
            </>
          )}
        </div>

        {/* Columna lateral (desktop): Info adicional */}
        <div className="hidden md:block space-y-4">
          {/* Badge GRATUITO destacado */}
          <div className="rounded-2xl p-5 text-center" style={{ background: "#FFF8E6" }}>
            <p className="text-2xl font-bold mb-2" style={{ color: "#7A3D1A" }}>
              GRATUITO ❤️
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#9A6A2A" }}>
              Todas las comidas están incluidas en tu estancia. No necesitas pagar nada.
            </p>
          </div>

          {/* Horarios del comedor */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#9A6A2A" }}>
              Horarios del comedor
            </h2>
            <div className="space-y-3">
              {[
                { label: "Desayuno", hora: menuHoy?.comidas.desayuno.hora ?? "7:30 - 9:00 AM" },
                { label: "Comida",   hora: menuHoy?.comidas.comida.hora   ?? "1:00 - 3:00 PM" },
                { label: "Cena",     hora: menuHoy?.comidas.cena.hora     ?? "7:00 - 9:00 PM" },
              ].map(({ label, hora }) => (
                <div key={label} className="flex items-center gap-3">
                  <Clock size={16} style={{ color: "#C85A2A" }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className="text-xs text-gray-500">{hora}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ubicación del comedor */}
          <div className="rounded-2xl p-4" style={{ background: "#FDF0E6" }}>
            <div className="flex items-start gap-2 mb-2">
              <MapPin size={14} style={{ color: "#C85A2A" }} className="mt-0.5" />
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#9A6A2A" }}>
                Ubicación
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#7A3D1A" }}>
              El comedor está en la planta baja de la Casa Ronald, junto a la sala común.
            </p>
          </div>
        </div>
      </div>

      {/* ── Modal publicar menú ──────────────────────────────── */}
      {formAbierto && (
        <FormPublicarMenu
          onPublicar={handlePublicar}
          onCerrar={() => setFormAbierto(false)}
        />
      )}

      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}
    </>
  );
}
