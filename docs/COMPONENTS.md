# Componentes Clave y Flujos — mcFaro

> Documentación técnica de componentes, hooks y patrones de diseño

---

## 📚 Tabla de Contenidos

1. [Componentes de UI Principales](#componentes-de-ui-principales)
2. [Hooks Personalizados](#hooks-personalizados)
3. [Contextos Globales](#contextos-globales)
4. [Flujos de Datos Críticos](#flujos-de-datos-críticos)
5. [Patrones de Diseño](#patrones-de-diseño)

---

## 🎨 Componentes de UI Principales

### BottomNav

**Ubicación:** `components/ui/BottomNav.tsx`

**Propósito:** Sistema de navegación adaptativo que cambia según el rol del usuario (cuidador vs coordinador) y el dispositivo (mobile vs desktop).

#### Props
```typescript
// Sin props - consume contextos globales
```

#### Flujo de Datos

```
useAuth() → familia.rol
  ↓
esCoordinador = rol === "coordinador"
  ↓
useSidebar() → {collapsed, toggleCollapsed}
  ↓
Renderizado condicional de 3 layouts:
  1. Mobile (ambos roles): Bottom navigation
  2. Desktop cuidador: Header horizontal fijo
  3. Desktop coordinador: Sidebar vertical colapsable
```

#### Dependencias Clave

- `useAuth()`: Detecta rol del usuario
- `useSidebar()`: Estado global del sidebar
- `usePathname()`: Detecta ruta activa para highlighting
- `signOut()`: Cierre de sesión Firebase

#### Interacción con Firebase

- **Cierre de sesión:**
  ```typescript
  const cerrarSesion = async () => {
    await signOut(auth);
    router.replace("/login");
  };
  ```

#### Patrones de Diseño

1. **Renderizado condicional por rol:**
   ```typescript
   const enlaces = esCoordinador ? enlacesCoordinador : enlacesCuidador;
   ```

2. **Refs para click fuera:**
   ```typescript
   useEffect(() => {
     const handler = (e: MouseEvent) => {
       if (menuRef.current && !menuRef.current.contains(e.target)) {
         setMenuAbierto(false);
       }
     };
     document.addEventListener("mousedown", handler);
     return () => document.removeEventListener("mousedown", handler);
   }, []);
   ```

3. **Navegación activa:**
   ```typescript
   const activo = exacto
     ? pathname === href
     : pathname === href || pathname.startsWith(href + "/");
   ```

#### Observaciones

- ✅ Botones mínimo 48×48px (accesibilidad táctil)
- ✅ Íconos con stroke dinámico (2.5 activo, 2 inactivo)
- ⚠️ Dos `menuRef` separados para evitar conflictos (mobile + desktop)

---

### Dashboard

**Ubicación:** `app/(app)/dashboard/page.tsx`

**Propósito:** Vista principal del cuidador que agrega información crítica del día (citas, comidas, actividades, transporte).

#### Flujo de Datos

```
useAuth() → {familia}
  ↓
useDashboard(familiaId, casaRonald) → {
  proximaCita,
  proximaComida,
  proximaActividad,
  transporteActivo,
  cargando
}
  ↓
Widgets individuales renderizados con datos
```

#### Componentes Hijos

- **WidgetProximaCita**: Tarjeta de próxima cita médica
- **WidgetProximaComida**: Tarjeta de próxima comida
- **WidgetProximaActividad**: Tarjeta de próxima actividad
- **WidgetTransporte**: Estado de solicitud de transporte

#### Dependencias Clave

- `useDashboard()`: Hook central que agrega 4 fuentes de datos
- `suscribirMensajesEntrantes()`: Listener FCM en primer plano
- `date-fns`: Formateo de fechas y horas

#### Características Especiales

1. **Reloj en tiempo real:**
   ```typescript
   const [ahora, setAhora] = useState(() => new Date());

   useEffect(() => {
     const id = setInterval(() => setAhora(new Date()), 1000);
     return () => clearInterval(id);
   }, []);
   ```

2. **Tips de bienestar contextuales:**
   ```typescript
   function WellnessTip({ horaActual }: { horaActual: number }) {
     const tips = [
       { rango: [6, 9],   emoji: "☀️", mensaje: "¿Ya desayunaste?" },
       { rango: [13, 15], emoji: "🍎", mensaje: "Es hora de comer algo" },
       // ...
     ];
     const tip = tips.find(({ rango }) =>
       horaActual >= rango[0] && horaActual < rango[1]
     );
     return tip ? <Card>{tip.mensaje}</Card> : null;
   }
   ```

3. **Skeleton loaders:**
   ```typescript
   {cargando ? (
     <div className="grid grid-cols-2 gap-3">
       {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
     </div>
   ) : (
     <div className="grid grid-cols-2 gap-3">
       <WidgetProximaCita cita={proximaCita} />
       {/* ... */}
     </div>
   )}
   ```

---

### TarjetaCita

**Ubicación:** `components/calendario/TarjetaCita.tsx`

**Propósito:** Card individual de cita médica con acciones (editar, eliminar, completar).

#### Props

```typescript
interface TarjetaCitaProps {
  cita: Cita;
  onEditar?: (cita: Cita) => void;
  onEliminar?: (id: string) => void;
  onCompletar?: (id: string) => void;
}
```

#### Flujo de Datos

```
<TarjetaCita cita={cita} onEditar={handleEditar} />
  ↓
Usuario hace clic en botón "Editar"
  ↓
onEditar(cita) llamado
  ↓
Componente padre (CalendarioPage) abre modal de edición
```

#### Patrones de Diseño

1. **Mapeo de iconos por tipo:**
   ```typescript
   const iconosPorServicio = {
     consulta: Stethoscope,
     estudio: FileText,
     procedimiento: Activity,
     otro: Calendar
   };
   const Icono = iconosPorServicio[cita.servicio] || Calendar;
   ```

2. **Formateo de fechas:**
   ```typescript
   const horaFormateada = format(cita.fecha.toDate(), "HH:mm");
   const diaFormateado = format(cita.fecha.toDate(), "EEEE d 'de' MMMM", { locale: es });
   ```

3. **Estado visual de completada:**
   ```typescript
   <div className={`${cita.completada ? 'opacity-60 line-through' : ''}`}>
     {cita.titulo}
   </div>
   ```

---

### Toast + useToast

**Ubicación:** `components/ui/Toast.tsx`

**Propósito:** Sistema de notificaciones locales (feedback de acciones del usuario).

#### Props (Toast)

```typescript
interface ToastProps {
  mensaje: string;
  tipo?: "exito" | "error";
  onCerrar: () => void;
}
```

#### Hook useToast

```typescript
function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  const mostrar = (mensaje: string, tipo: "exito" | "error" = "exito") => {
    setToast({ mensaje, tipo });
  };

  const cerrar = () => setToast(null);

  return { toast, mostrar, cerrar };
}
```

#### Uso en Componentes

```typescript
function CalendarioPage() {
  const { toast, mostrar, cerrar } = useToast();

  const handleCrearCita = async () => {
    await agregarCita(nuevaCita);
    mostrar("Cita creada exitosamente");
  };

  return (
    <>
      {/* Contenido */}
      {toast && <Toast {...toast} onCerrar={cerrar} />}
    </>
  );
}
```

#### Patrón de Auto-dismiss

```typescript
useEffect(() => {
  if (!mensaje) return;
  const timer = setTimeout(() => onCerrar(), 3500);
  return () => clearTimeout(timer);
}, [mensaje, onCerrar]);
```

---

### Skeleton Loaders

**Ubicación:** `components/ui/Skeleton.tsx`

**Propósito:** Placeholders animados para estados de carga que imitan la estructura del contenido real.

#### Componente Base

```typescript
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
}
```

#### Componentes Especializados

```typescript
export function SkeletonTarjetaCita() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
```

#### Observaciones

- ✅ Mantienen dimensiones similares al contenido real (evita layout shift)
- ✅ Usados consistentemente en dashboard, calendario, actividades
- ✅ `aria-hidden="true"` para screen readers

---

## 🪝 Hooks Personalizados

### useAuth

**Ubicación:** `hooks/useAuth.ts`

**Propósito:** Hook central de autenticación que sincroniza Firebase Auth con datos de familia en Firestore.

#### API

```typescript
function useAuth(): {
  user: User | null;
  familia: Familia | null;
  cargando: boolean;
}
```

#### Flujo de Datos

```
onAuthStateChanged(auth)
  ↓
user detectado → onSnapshot(doc(familias, user.uid))
  ↓
setState({user, familia, cargando: false})
```

#### Implementación

```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [familia, setFamilia] = useState<Familia | null>(null);
  const [cargando, setCargando] = useState(true);
  const snapshotUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      // Cleanup snapshot anterior
      if (snapshotUnsubRef.current) {
        snapshotUnsubRef.current();
        snapshotUnsubRef.current = null;
      }

      if (currentUser) {
        const familiaRef = doc(db, "familias", currentUser.uid);
        const unsubscribeSnapshot = onSnapshot(
          familiaRef,
          (snapshot) => {
            setFamilia(snapshot.exists()
              ? { id: snapshot.id, ...snapshot.data() } as Familia
              : null
            );
            setCargando(false);
          },
          (error) => {
            logger.error("Error cargando familia:", error);
            setCargando(false);
          }
        );
        snapshotUnsubRef.current = unsubscribeSnapshot;
      } else {
        setFamilia(null);
        setCargando(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (snapshotUnsubRef.current) {
        snapshotUnsubRef.current();
      }
    };
  }, []);

  return { user, familia, cargando };
}
```

#### Patrones de Diseño

1. **Doble suscripción:** Auth listener + Firestore snapshot
2. **Cleanup robusto:** `snapshotUnsubRef` guarda y limpia snapshot activo
3. **Estado de carga:** `cargando: true` hasta resolver ambas suscripciones

#### Observaciones

- ⚠️ Hook crítico usado en TODOS los componentes autenticados
- ✅ Reemplaza patrón de Context API para simplificar arquitectura

---

### useCitas

**Ubicación:** `hooks/useCitas.ts`

**Propósito:** Gestión completa de citas médicas en tiempo real (CRUD + queries).

#### API

```typescript
function useCitas(familiaId: string | undefined): {
  citas: Cita[];
  citasHoy: Cita[];
  proximaCita: Cita | null;
  cargando: boolean;
  diasConCitas: (anio: number, mes: number) => Set<number>;
  citasDelDia: (fecha: Date) => Cita[];
  agregarCita: (nueva: NuevaCita) => Promise<void>;
  editarCita: (id: string, cambios: Partial<Cita>) => Promise<void>;
  eliminarCita: (id: string) => Promise<void>;
}
```

#### Flujo de Datos

```
familiaId cambio
  ↓
query(citas, where(familiaId), orderBy(fecha))
  ↓
onSnapshot → setCitas(snapshot.docs)
  ↓
Derivados: citasHoy, proximaCita (computed properties)
```

#### Implementación de Query

```typescript
useEffect(() => {
  if (!familiaId) {
    setCitas([]);
    setCargando(false);
    return;
  }

  const q = query(
    collection(db, "citas"),
    where("familiaId", "==", familiaId),
    orderBy("fecha", "asc")
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const citasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Cita));
      setCitas(citasData);
      setCargando(false);
    },
    (error) => {
      logger.error("Error escuchando citas:", error);
      setCargando(false);
    }
  );

  return () => unsubscribe();
}, [familiaId]);
```

#### CRUD Operations

```typescript
const agregarCita = async (nueva: NuevaCita) => {
  await addDoc(collection(db, "citas"), {
    familiaId,
    ...nueva,
    fecha: Timestamp.fromDate(nueva.fecha),
    completada: false,
    recordatorio60: nueva.recordatorio60 ?? true,
    recordatorio15: nueva.recordatorio15 ?? true,
    notificacionEnviada: false,
    creadaEn: Timestamp.now(),
  });
};

const editarCita = async (id: string, cambios: Partial<Cita>) => {
  const citaRef = doc(db, "citas", id);
  await updateDoc(citaRef, {
    ...cambios,
    ...(cambios.fecha && { fecha: Timestamp.fromDate(cambios.fecha) }),
  });
};

const eliminarCita = async (id: string) => {
  await deleteDoc(doc(db, "citas", id));
};
```

#### Computed Properties

```typescript
const citasHoy = useMemo(() => {
  const hoy = startOfDay(new Date());
  const manana = addDays(hoy, 1);
  return citas.filter(c => {
    const fechaCita = c.fecha.toDate();
    return fechaCita >= hoy && fechaCita < manana;
  });
}, [citas]);

const proximaCita = useMemo(() => {
  const ahora = new Date();
  const futuras = citas.filter(c => c.fecha.toDate() > ahora);
  return futuras[0] || null;
}, [citas]);
```

---

### useDashboard

**Ubicación:** `hooks/useDashboard.ts`

**Propósito:** Centralizar 4 suscripciones Firestore para el dashboard (evita 4 hooks separados en componente).

#### API

```typescript
function useDashboard(
  familiaId: string | undefined,
  casaRonald: string | undefined
): {
  proximaCita: Cita | null;
  proximaComida: {tipo: string, hora: string, disponible: boolean} | null;
  proximaActividad: Actividad | null;
  transporteActivo: SolicitudTransporte | null;
  cargando: boolean;
}
```

#### Flujo de Datos (Paralelo)

```
4 useEffect independientes (uno por recurso)
  ↓
4 onSnapshot simultáneos:
  1. Próxima cita
  2. Menú del día
  3. Próxima actividad registrada
  4. Transporte activo
  ↓
4 estados de carga independientes
  ↓
cargando = ANY(cargandoCita || cargandoMenu || ...)
```

#### Query Optimizada: Próxima Cita

```typescript
useEffect(() => {
  if (!familiaId) return;

  const q = query(
    collection(db, "citas"),
    where("familiaId", "==", familiaId),
    where("fecha", ">", Timestamp.now()),
    orderBy("fecha", "asc"),
    limit(1)  // Solo necesitamos la primera
  );

  const unsub = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const citaData = snapshot.docs[0];
      setProximaCita({ id: citaData.id, ...citaData.data() } as Cita);
    } else {
      setProximaCita(null);
    }
    setCargandoCita(false);
  });

  return () => unsub();
}, [familiaId]);
```

#### Cálculo de Próxima Comida

```typescript
useEffect(() => {
  if (!casaRonald) return;

  const hoy = format(new Date(), "yyyy-MM-dd");
  const menuId = `${hoy}-${casaRonald}`;
  const menuRef = doc(db, "menus", menuId);

  const unsub = onSnapshot(menuRef, (snapshot) => {
    if (snapshot.exists()) {
      const menuData = snapshot.data();
      const proxima = calcularProximaComida(menuData.comidas);
      setProximaComida(proxima);
    }
    setCargandoMenu(false);
  });

  return () => unsub();
}, [casaRonald]);
```

#### Observaciones

- ⚠️ **Query anidado en actividades:** Puede causar memory leak si no se limpia correctamente
- ✅ Usa `limit(1)` para optimizar queries
- ✅ Estados de carga independientes permiten render parcial

---

### useOnlineStatus

**Ubicación:** `hooks/useOnlineStatus.ts`

**Propósito:** Detectar conectividad de red para mostrar banner de offline.

#### API

```typescript
function useOnlineStatus(): boolean
```

#### Implementación

```typescript
export function useOnlineStatus() {
  const [online, setOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}
```

#### Uso en Layout

```typescript
function AppLayout() {
  const online = useOnlineStatus();

  return (
    <>
      {!online && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500">
          ⚠️ Sin conexión a Internet
        </div>
      )}
      {children}
    </>
  );
}
```

---

## 🌐 Contextos Globales

### SidebarContext

**Ubicación:** `contexts/SidebarContext.tsx`

**Propósito:** Estado global del sidebar del coordinador (colapsado/expandido) con persistencia en localStorage.

#### API

```typescript
interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
}
```

#### Implementación

```typescript
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [montado, setMontado] = useState(false);

  // Cargar estado guardado al montar
  useEffect(() => {
    setMontado(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed");
      if (saved) {
        try {
          setCollapsed(JSON.parse(saved));
        } catch (error) {
          logger.error("Error parsing sidebar state:", error);
        }
      }
    }
  }, []);

  // Guardar estado cuando cambie
  useEffect(() => {
    if (montado && typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
    }
  }, [collapsed, montado]);

  const toggleCollapsed = () => setCollapsed(prev => !prev);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}
```

#### Hook de Consumo

```typescript
export function useSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    // Durante SSR o fuera del provider, retornar valores por defecto
    if (typeof window === "undefined") {
      return {
        collapsed: false,
        setCollapsed: () => {},
        toggleCollapsed: () => {},
      };
    }
    throw new Error("useSidebar must be used within SidebarProvider");
  }

  return context;
}
```

#### Patrones de Diseño

1. **Persistencia local:** Guarda preferencia en localStorage
2. **SSR-safe:** Retorna valores default durante SSR
3. **Doble mount check:** `montado` previene escritura durante hidratación

---

## 🔄 Flujos de Datos Críticos

### Login → Dashboard

```
┌──────────────────────────────────────────┐
│ 1. Usuario ingresa teléfono             │
│    → signInWithPhoneNumber()            │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 2. Firebase Auth envía SMS OTP          │
│    → usuario ingresa código 6 dígitos   │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 3. confirmationResult.confirm(codigo)   │
│    → Firebase Auth valida                │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 4. onAuthStateChanged detecta usuario   │
│    → useAuth() activado                  │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 5. onSnapshot(familias/{uid})           │
│    → carga datos de familia              │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 6. Router push a /dashboard             │
│    → Dashboard consume useAuth()         │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 7. useDashboard() ejecuta 4 queries     │
│    → citas, menu, actividades, transporte│
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 8. Widgets renderizan con datos reales  │
└──────────────────────────────────────────┘
```

---

### Creación de Cita → Notificación Push

```
┌──────────────────────────────────────────┐
│ 1. Usuario toca botón "+" en calendario │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 2. FormularioCita (sheet drawer) abre   │
│    → usuario llena: título, fecha, hora  │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 3. useCitas().agregarCita({...})        │
│    → addDoc(citas, {...})                │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 4. Firestore crea documento             │
│    → citas/{newId}                       │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 5. onSnapshot listener detecta cambio   │
│    → actualiza estado local              │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 6. UI re-renderiza con nueva cita       │
│    → Toast "Cita creada exitosamente"    │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ [FUTURO] Cloud Function detecta onCreate │
│    → crea recordatorio 60min antes       │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ [FUTURO] Cron job verifica recordatorios│
│    → POST /api/notificaciones            │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ FCM envía push al dispositivo            │
│    → usuario hace clic → abre /calendario│
└──────────────────────────────────────────┘
```

---

### Modo Offline → Sincronización

```
┌──────────────────────────────────────────┐
│ 1. Usuario pierde conexión Wi-Fi        │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 2. useOnlineStatus() detecta offline    │
│    → banner amarillo aparece en header   │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 3. useCitas() query a Firestore         │
│    → Firestore retorna cache local       │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 4. UI renderiza con datos cacheados     │
│    (última versión conocida)             │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 5. Usuario intenta crear cita           │
│    → Operación queued en Firestore       │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 6. Usuario reconecta a Wi-Fi            │
│    → useOnlineStatus() detecta online    │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 7. Firestore sincroniza automáticamente │
│    → envía operaciones pendientes         │
└────────────┬─────────────────────────────┘
             │
┌────────────▼─────────────────────────────┐
│ 8. onSnapshot re-emite con datos nuevos │
│    → UI actualiza (sin reload manual)    │
└──────────────────────────────────────────┘
```

---

## 🎨 Patrones de Diseño

### Composición de Componentes

**Principio:** Componentes pequeños, reutilizables y componibles.

#### Ejemplo: Dashboard Widgets

```
DashboardPage
  ├── HeroSection (saludo + reloj)
  ├── WellnessTip (tip contextual por hora)
  ├── AlertasActivas (notificaciones urgentes)
  ├── Section "Tu día de hoy"
  │   ├── WidgetProximaCita
  │   ├── WidgetProximaComida
  │   ├── WidgetProximaActividad
  │   └── WidgetTransporte
  ├── Section "Accesos rápidos"
  │   ├── AccesoRapido (Actividades)
  │   ├── AccesoRapido (Transporte)
  │   └── AccesoRapido (Recursos)
  └── (Condicional) PanelCoordinador
```

**Ventajas:**
- Cada widget es independiente y testeable
- Widgets reciben data pre-filtrada (no hacen fetching)
- Skeleton loaders con misma estructura

---

### Renderizado Condicional por Rol

**Patrón usado en:**
- `BottomNav`: 3 layouts diferentes
- `AppLayout`: Padding dinámico según rol y sidebar
- Rutas: Bloqueo de acceso por rol

#### Implementación

```typescript
const esCoordinador = familia?.rol === "coordinador";

// En navegación
const enlaces = esCoordinador ? enlacesCoordinador : enlacesCuidador;

// En UI
{esCoordinador ? (
  <SidebarVertical />
) : (
  <HeaderHorizontal />
)}

// En protección de rutas
useEffect(() => {
  if (esCoordinador && RUTAS_CUIDADOR.includes(pathname)) {
    router.replace("/coordinador");
  }
}, [esCoordinador, pathname]);
```

---

### Custom Hooks para Lógica de Negocio

**Principio:** Separar lógica de presentación.

#### Antes (sin hook)

```typescript
function CalendarioPage() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "citas"), where(...));
    const unsub = onSnapshot(q, (snapshot) => {
      setCitas(snapshot.docs.map(...));
      setCargando(false);
    });
    return () => unsub();
  }, [familiaId]);

  const agregarCita = async (nueva) => {
    await addDoc(collection(db, "citas"), nueva);
  };

  // ... mucha lógica

  return <div>...</div>;
}
```

#### Después (con hook)

```typescript
function CalendarioPage() {
  const { citas, cargando, agregarCita, editarCita } = useCitas(familiaId);

  return <div>...</div>;
}
```

**Ventajas:**
- Componente más limpio (solo UI)
- Lógica reutilizable
- Testeable independientemente

---

### Error Boundaries de Next.js

**Patrón:** Capturar errores de renderizado por ruta.

#### Implementación

```typescript
// app/(app)/dashboard/error.tsx
"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto px-4 pt-20 text-center">
      <p className="text-4xl mb-4">😔</p>
      <h2 className="text-lg font-semibold">Algo salió mal</h2>
      <p className="text-gray-400 text-sm mt-1">{error.message}</p>
      <Button onClick={reset}>Intentar de nuevo</Button>
    </div>
  );
}
```

**Observaciones:**
- Solo captura errores de renderizado
- Errores async (fetch, Firestore) manejados con try/catch

---

## 📌 Conclusión

Los componentes de mcFaro siguen principios sólidos de arquitectura:

- ✅ **Separación de responsabilidades:** Hooks (lógica) vs Componentes (UI)
- ✅ **Reutilización:** Componentes pequeños y componibles
- ✅ **Real-time:** `onSnapshot` listeners en todos los hooks de datos
- ✅ **Offline-first:** Persistencia automática de Firestore
- ✅ **Accesibilidad:** Botones ≥48px, textos ≥16px, aria-labels

**Áreas de mejora:**
- Reducir complejidad de subscripciones anidadas en `useDashboard`
- Validación con Zod en todos los formularios
- Error boundaries en más rutas críticas

---

**Documentación relacionada:**
- [Visión y Problemática](./VISION.md)
- [Arquitectura Técnica](./ARCHITECTURE.md)
- [API y Servicios](./API.md)
