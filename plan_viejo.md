# plan.md — mcFaro: Plan de desarrollo con Claude Code

> **Instrucción para Claude Code:** Este es el plan de desarrollo del proyecto mcFaro. Síguelo en orden. Antes de comenzar cualquier fase, lee el `CLAUDE.md` completo. Ejecuta los comandos de setup antes de escribir cualquier componente.

---

## Contexto del hackathon

- **Entrega Fase 2:** 8 de abril 2026, 8:00 p.m.
- **Presentación final:** 9 de abril 2026
- **Tiempo disponible:** ~2–3 días de desarrollo intensivo
- **Prioridad absoluta:** MVP funcional y demostrable en vivo

---

## Setup inicial del proyecto

```bash
# Crear proyecto Next.js
npx create-next-app@latest mcfaro \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd mcfaro

# Dependencias principales
npm install firebase firebase-admin
npm install @google/generative-ai
npm install next-pwa
npm install zod
npm install date-fns
npm install lucide-react

# Dependencias de desarrollo
npm install -D @types/node
```

### next.config.ts — habilitar PWA

```ts
import withPWA from 'next-pwa';

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})({
  // tu next config aquí
});

export default config;
```

### public/manifest.json — PWA manifest

```json
{
  "name": "mcFaro — Guiando familias",
  "short_name": "mcFaro",
  "description": "Organiza el día a día de tu familia en Casa Ronald McDonald",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#DA291C",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## Fase 1 — Fundación y autenticación ⏱ ~3–4 horas

**Objetivo:** Proyecto corriendo localmente con auth funcional.

### Tareas

- [ ] Crear proyecto en Firebase Console (Firestore, Auth, FCM, Hosting)
- [ ] Configurar `.env.local` con todas las variables (ver CLAUDE.md)
- [ ] Crear `lib/firebase.ts` — inicialización del cliente Firebase
- [ ] Crear `lib/firebase-admin.ts` — inicialización del Admin SDK
- [ ] Crear pantalla de login con número de teléfono + verificación OTP
  - Ruta: `app/(auth)/login/page.tsx`
  - Usar `signInWithPhoneNumber` de Firebase Auth
  - UI: campo de teléfono → código SMS → redirect a `/dashboard`
- [ ] Crear `hooks/useAuth.ts` — estado de autenticación global
- [ ] Proteger rutas `(app)/` con middleware de Next.js
- [ ] Crear pantalla de onboarding post-login (registro familiar)
  - Campos: nombre del cuidador, nombre del niño, hospital, Casa Ronald, tipo de tratamiento, fechas de estancia
  - Guardar en Firestore: `familias/{uid}`
  - Validación con Zod

### Criterio de éxito
Un usuario puede registrarse con su teléfono, completar el onboarding y llegar al dashboard (aunque esté vacío).

---

## Fase 2 — Calendario de citas ⏱ ~4–5 horas

**Objetivo:** El cuidador puede registrar citas y recibir recordatorios push.

### Tareas

- [ ] Crear `hooks/useCitas.ts`
  - `onSnapshot` para escuchar citas en tiempo real
  - Funciones: `agregarCita`, `editarCita`, `eliminarCita`
- [ ] Pantalla calendario: `app/(app)/calendario/page.tsx`
  - Vista de lista por día (no grid complejo — optimizado para móvil)
  - Formulario para agregar cita: título, fecha/hora, servicio, notas
  - Indicador de tiempo de traslado (valor fijo configurable por Casa Ronald)
- [ ] Componentes:
  - `components/calendario/TarjetaCita.tsx`
  - `components/calendario/FormularioCita.tsx`
- [ ] Notificaciones push:
  - Crear `app/api/notificaciones/route.ts`
  - Usar Firebase Admin + FCM para enviar push
  - Lógica: 60 min antes y 15 min antes de cada cita
  - Registrar Service Worker para recibir push en segundo plano
- [ ] Crear `lib/notificaciones.ts` — helper para solicitar permisos y registrar token FCM
- [ ] Guardar token FCM en el perfil de la familia en Firestore

### Criterio de éxito
El cuidador agrega una cita para dentro de 2 minutos y recibe la notificación push en su dispositivo.

---

## Fase 3 — Rutina diaria con IA ⏱ ~3–4 horas

**Objetivo:** El asistente genera una rutina personalizada basada en las citas del día.

### Tareas

- [ ] Crear `lib/gemini.ts` — wrapper del Gemini API
  ```ts
  // Usar gemini-2.0-flash para velocidad y costo
  // Model: gemini-2.0-flash
  ```
- [ ] Crear `app/api/rutina/route.ts` — endpoint POST
  - Recibe: `familiaId`, `fecha`
  - Obtiene citas del día desde Firestore
  - Llama a Claude API con el prompt base (ver CLAUDE.md)
  - Devuelve rutina en JSON estructurado
  - Guarda resultado en `rutinas/{rutinaId}`
- [ ] Crear `hooks/useRutina.ts`
  - Obtiene la rutina del día desde Firestore
  - Si no existe, llama al endpoint para generarla
- [ ] Pantalla rutina: `app/(app)/rutina/page.tsx`
  - Muestra bloques de horario en formato timeline vertical
  - Botón "Regenerar mi rutina" para el día
  - Skeleton loader mientras genera
  - Funciona offline mostrando la última rutina guardada
- [ ] Componente `components/rutina/BloqueHorario.tsx`

### Schema JSON esperado de Claude

```json
{
  "fecha": "2026-04-08",
  "bloques": [
    {
      "hora": "07:30",
      "tipo": "alimentacion",
      "descripcion": "Desayuna antes de salir — tienes tiempo",
      "duracion_min": 20
    },
    {
      "hora": "08:30",
      "tipo": "traslado",
      "descripcion": "Sal hacia el hospital — consulta de oncología a las 9:00",
      "duracion_min": 20
    }
  ]
}
```

### Criterio de éxito
Con 2 citas registradas, la app genera y muestra una rutina coherente y empática en menos de 10 segundos.

---

## Fase 4 — Módulo Respira ⏱ ~2 horas

**Objetivo:** El cuidador tiene un espacio de bienestar accesible desde el dashboard.

### Tareas

- [ ] Pantalla: `app/(app)/respira/page.tsx`
- [ ] Temporizador de respiración guiada (4-7-8):
  - Componente `components/respira/TemporizadorRespiracion.tsx`
  - Animación CSS suave con Tailwind (círculo que expande/contrae)
  - 3 ciclos = ~2 minutos
- [ ] Recordatorios gentiles en el dashboard (tarjeta de bienestar)
  - "¿Cuándo fue la última vez que tomaste agua?"
  - "Ya llevas 3 horas en el hospital. Tómate 5 minutos."
  - Lógica simple basada en hora del día

### Criterio de éxito
El módulo es accesible en 1 tap desde el dashboard y el temporizador funciona sin conexión.

---

## Fase 5 — Dashboard y navegación ⏱ ~2–3 horas

**Objetivo:** Experiencia cohesiva desde que el usuario abre la app.

### Tareas

- [ ] Dashboard: `app/(app)/dashboard/page.tsx`
  - Saludo con nombre del cuidador y nombre del niño
  - Próxima cita del día (tarjeta destacada)
  - Vista previa de la rutina del día (primeros 3 bloques)
  - Acceso rápido a Respira
  - Banner de notificación si hay cita en menos de 2 horas
- [ ] Navegación bottom bar (mobile-first):
  - Inicio | Calendario | Rutina | Respira
  - Componente `components/ui/BottomNav.tsx`
- [ ] Pantalla de mapa/guía: `app/(app)/mapa/page.tsx`
  - Imagen estática del hospital + Casa Ronald con puntos de interés marcados
  - Tiempo de traslado estimado (configurable)
  - Para el hackathon: imagen hardcodeada del hospital demo

### Criterio de éxito
La navegación entre todas las pantallas es fluida y la app se siente como una unidad coherente.

---

## Fase 6 — Panel del coordinador ⏱ ~2 horas

**Objetivo:** El staff de Casa Ronald puede ver el estado general de las familias.

### Tareas

- [ ] Ruta protegida: `app/(app)/coordinador/page.tsx`
  - Solo accesible si `rol === "coordinador"` en Firestore
  - Lista de familias activas (nombre cuidador, nombre niño, días de estancia)
  - Citas del día agrupadas por familia
  - Sin datos clínicos — solo logística
- [ ] Middleware: verificar rol coordinador en `middleware.ts`

### Criterio de éxito
Un coordinador puede ver en un vistazo qué familias tienen citas hoy y cuánto tiempo llevan en Casa Ronald.

---

## Fase 7 — PWA, offline y polish ⏱ ~2 horas

**Objetivo:** La app funciona bien en condiciones reales (señal intermitente, primera visita).

### Tareas

- [ ] Verificar que `next-pwa` genera el Service Worker correctamente
- [ ] Configurar estrategia de caché para:
  - Citas del día → `CacheFirst` con revalidación
  - Rutina del día → `CacheFirst`
  - Assets estáticos → `StaleWhileRevalidate`
- [ ] Pantalla de instalación PWA (banner "Agregar a pantalla de inicio")
- [ ] Probar en Chrome DevTools → Application → Offline
- [ ] Probar notificaciones push en dispositivo físico (Android preferido)
- [ ] Ajustes de UX:
  - Todos los botones ≥ 48px
  - Tipografía ≥ 16px
  - Loading states en todas las operaciones async
  - Toast de confirmación en acciones críticas (cita guardada, rutina generada)
- [ ] Favicon y splash screen para iOS/Android

### Criterio de éxito
La app carga y muestra la rutina del día sin conexión a internet.

---

## Checklist para el demo (Hackathon)

Flujo que hay que mostrar sin pausas ni errores:

1. **Login** — número de teléfono → OTP → onboarding
2. **Agregar 2–3 citas** — distintos servicios y horarios
3. **Ver el dashboard** — próxima cita destacada, rutina resumida
4. **Abrir Rutina** — ver la rutina generada por Claude API
5. **Módulo Respira** — abrir temporizador, mostrar animación
6. **Notificación push** — mostrar que llega (preparar cita a ~2 min)
7. **Panel coordinador** — cambiar a rol coordinador, mostrar vista de familias
8. **Offline** — activar modo avión, mostrar que las citas y rutina siguen visibles

---

## Prioridad si el tiempo se acaba

Si el tiempo es crítico, este es el orden de corte:

| Prioridad | Módulo | ¿Qué sacrificar? |
|-----------|--------|-----------------|
| 🔴 MUST | Login + Calendario + Push | No negociable para el demo |
| 🔴 MUST | Rutina con IA | Es el diferenciador tecnológico |
| 🟠 HIGH | Dashboard cohesivo | Se puede simplificar |
| 🟠 HIGH | Módulo Respira | Se puede hacer estático |
| 🟡 NICE | Panel coordinador | Se puede mostrar como mockup |
| 🟡 NICE | Mapa | Imagen estática suficiente |
| 🟢 POLISH | Offline completo | Mencionar en pitch sin demo |

---

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Desplegar en Firebase Hosting
npx firebase deploy --only hosting

# Emuladores Firebase (para desarrollo sin internet)
npx firebase emulators:start
```

---

## Notas de arquitectura

- **¿Por qué Next.js y no Vite/CRA?** App Router de Next.js permite Server Components que protegen las llamadas a Claude API y Firebase Admin sin exponer credenciales. Además, el soporte de PWA con `next-pwa` está bien documentado.
- **¿Por qué Gemini y no otro LLM?** Gemini se integra nativamente con el ecosistema Google/Firebase que ya usa el proyecto. `gemini-2.0-flash` ofrece respuestas rápidas y económicas — ideal para generación de rutinas en tiempo real. Además, coherencia de proveedor: Firebase + GCP + Gemini son todos Google.
- **¿Por qué Firebase y no Supabase/PlanetScale?** El plan Spark de Firebase es suficiente para el piloto, tiene offline support nativo en Firestore, y FCM para push es gratuito. El equipo no necesita gestionar servidores.
- **Sobre los datos clínicos:** mcFaro deliberadamente NO almacena diagnósticos, medicamentos ni resultados de estudios. Eso elimina la necesidad de cumplimiento HIPAA/NOM-024 para el prototipo del hackathon.