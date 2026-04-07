// Datos de países para el selector de teléfono
import { CountryCode, getCountries, getCountryCallingCode } from "libphonenumber-js";

export const BANDERAS_PAISES: Record<string, string> = {
  MX: "🇲🇽", US: "🇺🇸", CA: "🇨🇦", ES: "🇪🇸", AR: "🇦🇷",
  CL: "🇨🇱", CO: "🇨🇴", PE: "🇵🇪", VE: "🇻🇪", BR: "🇧🇷",
  GB: "🇬🇧", FR: "🇫🇷", DE: "🇩🇪", IT: "🇮🇹", PT: "🇵🇹",
  EC: "🇪🇨", UY: "🇺🇾", PY: "🇵🇾", BO: "🇧🇴", CR: "🇨🇷",
  PA: "🇵🇦", GT: "🇬🇹", SV: "🇸🇻", HN: "🇭🇳", NI: "🇳🇮",
  CU: "🇨🇺", DO: "🇩🇴", JP: "🇯🇵", CN: "🇨🇳", KR: "🇰🇷",
  IN: "🇮🇳", AU: "🇦🇺", RU: "🇷🇺", TR: "🇹🇷", SA: "🇸🇦",
};

export const NOMBRES_PAISES: Record<string, string> = {
  MX: "México", US: "Estados Unidos", CA: "Canadá", ES: "España",
  AR: "Argentina", CL: "Chile", CO: "Colombia", PE: "Perú",
  VE: "Venezuela", BR: "Brasil", GB: "Reino Unido", FR: "Francia",
  DE: "Alemania", IT: "Italia", PT: "Portugal", EC: "Ecuador",
  UY: "Uruguay", PY: "Paraguay", BO: "Bolivia", CR: "Costa Rica",
  PA: "Panamá", GT: "Guatemala", SV: "El Salvador", HN: "Honduras",
  NI: "Nicaragua", CU: "Cuba", DO: "Rep. Dominicana", JP: "Japón",
  CN: "China", KR: "Corea del Sur", IN: "India", AU: "Australia",
  RU: "Rusia", TR: "Turquía", SA: "Arabia Saudita",
};

const PRIORITARIOS: CountryCode[] = ["MX", "US", "CA", "ES", "AR", "CL", "CO", "PE", "BR"];

export interface InfoPais {
  codigo: CountryCode;
  nombre: string;
  bandera: string;
  lada: string; // e.g. "+52"
}

export function generarPaises(): InfoPais[] {
  const todos = getCountries()
    .filter((c) => BANDERAS_PAISES[c])
    .map((c) => ({
      codigo: c,
      nombre: NOMBRES_PAISES[c] || c,
      bandera: BANDERAS_PAISES[c],
      lada: `+${getCountryCallingCode(c)}`,
    }));

  const prioritarios = PRIORITARIOS
    .map((c) => todos.find((p) => p.codigo === c))
    .filter(Boolean) as InfoPais[];

  const resto = todos
    .filter((p) => !PRIORITARIOS.includes(p.codigo))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return [...prioritarios, ...resto];
}

export function obtenerPais(codigo: CountryCode): InfoPais | undefined {
  if (!BANDERAS_PAISES[codigo]) return undefined;
  return {
    codigo,
    nombre: NOMBRES_PAISES[codigo] || codigo,
    bandera: BANDERAS_PAISES[codigo],
    lada: `+${getCountryCallingCode(codigo)}`,
  };
}

export const PAIS_DEFAULT: CountryCode = "MX";
