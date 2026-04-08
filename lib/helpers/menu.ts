// Helpers de cálculo para el módulo de menú.
// Funciones puras — sin efectos secundarios, sin dependencias de React ni Firebase.
import { Menu } from "@/lib/types";

export interface ProximaComida {
  tipo: string;
  hora: string;
  disponible: boolean;
}

/**
 * Determina cuál es la próxima comida del día dado un menú y la hora actual.
 * Evalúa desayuno, comida y cena en orden y devuelve la primera que aún no haya pasado.
 *
 * @param menu - Documento de menú obtenido de Firestore
 * @returns La próxima comida con tipo, hora y disponibilidad, o null si ya pasaron todas
 */
export function calcularProximaComida(menu: Menu): ProximaComida | null {
  const ahora = new Date();
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

  const comidas: ProximaComida[] = [
    { tipo: "Desayuno", hora: menu.comidas.desayuno.hora, disponible: menu.comidas.desayuno.disponible },
    { tipo: "Comida",   hora: menu.comidas.comida.hora,   disponible: menu.comidas.comida.disponible },
    { tipo: "Cena",     hora: menu.comidas.cena.hora,     disponible: menu.comidas.cena.disponible },
  ];

  return comidas.find(({ hora }) => {
    const [horas, minutos] = hora.split(":").map(Number);
    return horas * 60 + minutos > horaActual;
  }) ?? null;
}
