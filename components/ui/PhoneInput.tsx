"use client";
// Selector de teléfono con país — basado en libphonenumber-js
import { useState, useRef, useEffect, useCallback } from "react";
import { AsYouType, parsePhoneNumber, CountryCode } from "libphonenumber-js";
import { ChevronDown, Search, Check } from "lucide-react";
import { generarPaises, obtenerPais, PAIS_DEFAULT, InfoPais } from "@/lib/paises";

interface PhoneInputProps {
  value: string; // número completo en formato internacional (+52...)
  onChange: (value: string) => void;
  disabled?: boolean;
}

function extraerNacional(completo: string, lada: string): string {
  if (!completo) return "";
  if (completo.startsWith(lada)) return completo.slice(lada.length).trim();
  return completo.startsWith("+") ? "" : completo;
}

const PAISES = generarPaises();

export function PhoneInput({ value, onChange, disabled }: PhoneInputProps) {
  const [pais, setPais] = useState<InfoPais>(
    () => obtenerPais(PAIS_DEFAULT)!
  );
  const [display, setDisplay] = useState(() =>
    extraerNacional(value, obtenerPais(PAIS_DEFAULT)!.lada)
  );
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [posicion, setPosicion] = useState({ top: 0, left: 0, width: 0 });

  const botonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const construirCompleto = useCallback((nacional: string, p: InfoPais) => {
    if (!nacional) return "";
    return `${p.lada}${nacional.replace(/\s/g, "")}`;
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;

      // Pegó un número con +
      if (val.startsWith("+")) {
        const encontrado = PAISES.find((p) => val.startsWith(p.lada));
        if (encontrado) {
          const nacional = val.slice(encontrado.lada.length).trim();
          const formateado = new AsYouType(encontrado.codigo as CountryCode).input(nacional);
          setPais(encontrado);
          setDisplay(formateado);
          onChange(construirCompleto(formateado, encontrado));
          return;
        }
        val = val.replace(/^\+\d*\s?/, "");
      }

      // Formateo nacional en tiempo real
      const formateado = new AsYouType(pais.codigo as CountryCode).input(val);
      setDisplay(formateado);
      onChange(construirCompleto(formateado, pais));
    },
    [pais, onChange, construirCompleto]
  );

  const seleccionarPais = useCallback(
    (nuevo: InfoPais) => {
      setPais(nuevo);
      setAbierto(false);
      setBusqueda("");
      const completo = construirCompleto(display, nuevo);
      onChange(completo);
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [display, onChange, construirCompleto]
  );

  // Calcular posición del popover al abrir
  const abrirPopover = () => {
    if (botonRef.current) {
      const rect = botonRef.current.getBoundingClientRect();
      setPosicion({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: 260,
      });
    }
    setAbierto((v) => !v);
    setBusqueda("");
  };

  // Cerrar al hacer click afuera
  useEffect(() => {
    if (!abierto) return;
    const handler = (e: MouseEvent) => {
      if (botonRef.current && !botonRef.current.contains(e.target as Node)) {
        setAbierto(false);
        setBusqueda("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [abierto]);

  // Sincronizar con value externo
  useEffect(() => {
    if (!value) { setDisplay(""); return; }
    if (value.startsWith("+")) {
      const encontrado = PAISES.find((p) => value.startsWith(p.lada));
      if (encontrado) {
        setPais(encontrado);
        setDisplay(extraerNacional(value, encontrado.lada));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const paisesFiltrados = PAISES.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.lada.includes(busqueda)
  );

  // Validación visual básica
  let esValido = false;
  try {
    const parsed = parsePhoneNumber(construirCompleto(display, pais));
    esValido = parsed?.isValid() ?? false;
  } catch { /* no-op */ }

  const ringColor = display
    ? esValido
      ? "focus-within:ring-green-400 border-green-300"
      : "focus-within:ring-[#F5C842]"
    : "focus-within:ring-[#F5C842]";

  return (
    <>
      <div className={`flex items-stretch border border-gray-200 rounded-2xl bg-white focus-within:ring-2 overflow-visible ${ringColor}`}>
        {/* Botón país */}
        <button
          ref={botonRef}
          type="button"
          onClick={abrirPopover}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-4 border-r border-gray-100 shrink-0 active:bg-gray-50 transition-colors rounded-l-2xl"
          aria-label="Seleccionar país"
        >
          <span className="text-xl leading-none">{pais.bandera}</span>
          <span className="text-sm font-medium text-gray-700">{pais.lada}</span>
          <ChevronDown
            size={13}
            className={`text-gray-400 transition-transform ${abierto ? "rotate-180" : ""}`}
          />
        </button>

        {/* Input número */}
        <input
          ref={inputRef}
          type="tel"
          value={display}
          onChange={handleChange}
          placeholder="55 1234 5678"
          disabled={disabled}
          className="flex-1 px-3 py-4 text-base outline-none bg-transparent rounded-r-2xl"
          autoComplete="tel-national"
          inputMode="tel"
        />
      </div>

      {/* Popover — portal via fixed */}
      {abierto && (
        <div
          style={{
            position: "fixed",
            top: posicion.top,
            left: posicion.left,
            width: posicion.width,
            zIndex: 9999,
          }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Buscador */}
          <div className="p-2 border-b border-gray-50">
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar país…"
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                autoFocus
              />
            </div>
          </div>

          {/* Lista */}
          <div className="overflow-y-auto max-h-52 py-1 px-1">
            {paisesFiltrados.map((p) => (
              <button
                key={p.codigo}
                onMouseDown={(e) => { e.preventDefault(); seleccionarPais(p); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                  pais.codigo === p.codigo ? "bg-[#FDF0E6]" : "hover:bg-gray-50"
                }`}
              >
                {pais.codigo === p.codigo ? (
                  <Check size={14} className="text-[#C85A2A] shrink-0" />
                ) : (
                  <span className="w-3.5 shrink-0" />
                )}
                <span className="text-lg leading-none shrink-0">{p.bandera}</span>
                <span className="flex-1 text-sm text-gray-800 truncate">{p.nombre}</span>
                <span className="text-xs font-medium text-gray-400 shrink-0">{p.lada}</span>
              </button>
            ))}
            {paisesFiltrados.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-4">Sin resultados</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
