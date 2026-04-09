"use client";
// Banner de instalación PWA — aparece cuando el navegador dispara beforeinstallprompt
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstaladorPWA() {
  const [promptEvento, setPromptEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [instalando, setInstalando] = useState(false);

  useEffect(() => {
    // No mostrar si ya está instalada como PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // No mostrar si el usuario ya lo descartó en esta sesión
    if (sessionStorage.getItem("pwa-banner-descartado")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvento(e as BeforeInstallPromptEvent);
      // Mostrar el banner con un pequeño retraso para no interrumpir la carga
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstalar = async () => {
    if (!promptEvento) return;
    setInstalando(true);
    try {
      await promptEvento.prompt();
      const { outcome } = await promptEvento.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
      }
    } finally {
      setInstalando(false);
      setPromptEvento(null);
    }
  };

  const handleDescartar = () => {
    setVisible(false);
    sessionStorage.setItem("pwa-banner-descartado", "1");
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:w-80 animate-in fade-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-label="Instalar aplicación McFaro"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-4">
        <div className="flex items-start gap-3">
          {/* Ícono */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#FDF0E6" }}
          >
            <img
              src="/icons/icon-192.png"
              alt="McFaro"
              className="w-8 h-8 rounded-lg object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm">Instalar McFaro</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Accede rápido desde tu pantalla de inicio, incluso sin internet.
            </p>
          </div>

          <button
            onClick={handleDescartar}
            className="p-1 rounded-lg hover:bg-gray-100 shrink-0 -mt-0.5"
            aria-label="Cerrar"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDescartar}
            className="flex-1 py-2 rounded-xl text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Ahora no
          </button>
          <button
            onClick={handleInstalar}
            disabled={instalando}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-70 transition-opacity"
            style={{ background: "#C85A2A" }}
          >
            <Download size={13} />
            {instalando ? "Instalando…" : "Instalar"}
          </button>
        </div>
      </div>
    </div>
  );
}
