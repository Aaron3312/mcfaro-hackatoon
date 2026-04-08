// Cliente MOCK para la integración con Avancys — sistema oficial de Casas Ronald McDonald.
// Cuando Fundación Ronald McDonald proporcione credenciales y documentación de la API,
// reemplazar el cuerpo de `sincronizarFamilia` con la llamada real a su endpoint.

export interface DatosSincronizacionAvancys {
  familiaId: string;
  nombreCuidador: string;
  nombreNino: string;
  hospital: string;
  tipoTratamiento: string;
  casaRonald: string;
  fechaIngreso: string; // ISO 8601
}

export interface ResultadoSincronizacion {
  ok: boolean;
  avancysId?: string; // ID asignado por Avancys al registro
  error?: string;
}

/**
 * Envía los metadatos de una familia recién registrada a Avancys.
 * MOCK: simula una respuesta exitosa hasta que haya credenciales reales.
 *
 * @param datos - Metadatos de la familia (sin información clínica detallada)
 * @returns Resultado de la sincronización con el ID asignado por Avancys
 */
export async function sincronizarFamilia(
  datos: DatosSincronizacionAvancys
): Promise<ResultadoSincronizacion> {
  // TODO: reemplazar con llamada real cuando se tengan credenciales de Avancys
  // const AVANCYS_API_URL = process.env.AVANCYS_API_URL;
  // const AVANCYS_API_KEY = process.env.AVANCYS_API_KEY;
  // const res = await fetch(`${AVANCYS_API_URL}/familias`, {
  //   method: "POST",
  //   headers: { "Authorization": `Bearer ${AVANCYS_API_KEY}`, "Content-Type": "application/json" },
  //   body: JSON.stringify(datos),
  // });
  // const json = await res.json();
  // return { ok: res.ok, avancysId: json.id, error: json.error };

  // Simula latencia de red y respuesta exitosa
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    ok: true,
    avancysId: `AVANCYS-MOCK-${datos.familiaId.slice(0, 8).toUpperCase()}`,
  };
}
