"use client";
// Chat en tiempo real de un grupo de apoyo
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMensajesChat } from "@/hooks/useChatComunidad";
import { ChatMensaje } from "@/components/comunidad/ChatMensaje";
import { Toast, useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import { logger } from "@/lib/logger";

const MAX_CHARS = 500;

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const grupoId = searchParams.get("grupoId");
  const nombreGrupo = searchParams.get("nombre") ?? "Chat";

  const { familia } = useAuth();
  const { mensajes, cargando } = useMensajesChat(grupoId);
  const { toast, mostrar, cerrar } = useToast();

  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll al último mensaje al cargar o recibir nuevos
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // Redirigir si falta el grupoId
  useEffect(() => {
    if (!grupoId) router.replace("/comunidad/grupos");
  }, [grupoId, router]);

  const enviarMensaje = async () => {
    if (!texto.trim() || enviando || !familia || !grupoId) return;

    const mensajeTexto = texto.trim();
    setTexto("");
    setEnviando(true);

    try {
      const res = await fetch("/api/comunidad/mensaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grupoId,
          familiaId: familia.id,
          // Solo nombre de pila por privacidad
          nombreUsuario: familia.nombreCuidador.split(" ")[0],
          mensaje: mensajeTexto,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        mostrar(data.error ?? "No se pudo enviar el mensaje", "error");
        setTexto(mensajeTexto); // restaurar texto si falla
      }
    } catch (err) {
      logger.error("Error al enviar mensaje", err);
      mostrar("Sin conexión. Intenta de nuevo", "error");
      setTexto(mensajeTexto);
    } finally {
      setEnviando(false);
    }
  };

  const reportarMensaje = async (mensajeId: string) => {
    try {
      await fetch("/api/comunidad/mensaje", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajeId }),
      });
      mostrar("Mensaje reportado al coordinador", "exito");
    } catch {
      mostrar("No se pudo reportar el mensaje", "error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enviar con Enter (sin Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  if (!grupoId) return null;

  return (
    <div className="flex flex-col h-screen" style={{ background: "#F7EDD5" }}>
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={cerrar} />}

      {/* Barra superior */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0 shadow-sm"
        style={{ background: "#FFFFFF", borderBottom: "1px solid #F0E5D0" }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0"
          style={{ background: "#F7EDD5" }}
        >
          <ArrowLeft size={18} style={{ color: "#C85A2A" }} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base truncate" style={{ color: "#7A3D1A" }}>
            {decodeURIComponent(nombreGrupo)}
          </h1>
          <p className="text-xs" style={{ color: "#A89080" }}>
            Grupo de apoyo
          </p>
        </div>
      </div>

      {/* Aviso de privacidad */}
      <div
        className="flex items-center gap-2 mx-4 mt-3 mb-1 px-3 py-2 rounded-xl text-xs shrink-0"
        style={{ background: "#FDF0E6", color: "#7A3D1A" }}
      >
        <AlertCircle size={13} className="shrink-0" />
        <span>Usa solo tu nombre de pila. No compartas información médica.</span>
      </div>

      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {cargando ? (
          <div className="space-y-4 pt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-36"}`} />
              </div>
            ))}
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <p className="text-sm text-gray-400">Sé el primero en escribir</p>
            <p className="text-xs text-gray-300 mt-1">Los mensajes aparecen en tiempo real</p>
          </div>
        ) : (
          mensajes.map((msg) => (
            <ChatMensaje
              key={msg.id}
              mensaje={msg}
              esPropio={msg.familiaId === familia?.id}
              onReportar={reportarMensaje}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input de texto */}
      <div
        className="shrink-0 px-4 py-3 flex items-end gap-2"
        style={{ background: "#FFFFFF", borderTop: "1px solid #F0E5D0" }}
      >
        <div className="flex-1 relative">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none leading-snug"
            style={{
              background: "#F7EDD5",
              color: "#374151",
              maxHeight: "120px",
              overflowY: "auto",
            }}
          />
          {texto.length > MAX_CHARS * 0.8 && (
            <span
              className="absolute bottom-2 right-3 text-[10px]"
              style={{ color: texto.length >= MAX_CHARS ? "#DC2626" : "#A89080" }}
            >
              {MAX_CHARS - texto.length}
            </span>
          )}
        </div>

        <button
          onClick={enviarMensaje}
          disabled={!texto.trim() || enviando}
          className="w-11 h-11 flex items-center justify-center rounded-full shrink-0 transition-opacity disabled:opacity-40"
          style={{ background: "#C85A2A" }}
          aria-label="Enviar mensaje"
        >
          <Send size={18} color="#FFFFFF" />
        </button>
      </div>
    </div>
  );
}
