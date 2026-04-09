// Utilidad para cachear datos en IndexedDB para funcionalidad offline
// Soporta almacenamiento de menús, actividades, citas, etc.

const DB_NAME = "mcFaroOfflineDB";
const DB_VERSION = 1;
const STORES = {
  MENUS: "menus",
  ACTIVIDADES: "actividades",
  CITAS: "citas",
  TRANSPORTE: "transporte",
  PERFIL: "perfil",
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

// Inicializar la base de datos
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Crear stores si no existen
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      });
    };
  });
}

// Guardar datos en el caché
export async function saveToCache<T extends { id: string }>(
  storeName: StoreName,
  data: T
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    // Agregar timestamp de caché
    const dataWithTimestamp = {
      ...data,
      _cachedAt: new Date().toISOString(),
    };

    store.put(dataWithTimestamp);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Error al guardar en caché:", error);
    throw error;
  }
}

// Obtener datos del caché
export async function getFromCache<T>(
  storeName: StoreName,
  id: string
): Promise<(T & { _cachedAt?: string }) | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        resolve(request.result || null);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Error al obtener del caché:", error);
    return null;
  }
}

// Obtener todos los datos de un store
export async function getAllFromCache<T>(
  storeName: StoreName
): Promise<T[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        resolve(request.result || []);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Error al obtener todos del caché:", error);
    return [];
  }
}

// Eliminar datos del caché
export async function deleteFromCache(
  storeName: StoreName,
  id: string
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.delete(id);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Error al eliminar del caché:", error);
    throw error;
  }
}

// Limpiar todo el caché de un store
export async function clearCache(storeName: StoreName): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Error al limpiar caché:", error);
    throw error;
  }
}

// Verificar si los datos están actualizados (menos de X horas)
export function isCacheStale(
  cachedAt: string | undefined,
  maxAgeHours: number = 24
): boolean {
  if (!cachedAt) return true;

  const cached = new Date(cachedAt);
  const now = new Date();
  const diffHours = (now.getTime() - cached.getTime()) / (1000 * 60 * 60);

  return diffHours > maxAgeHours;
}

// Exportar nombres de stores para uso en hooks
export { STORES };
