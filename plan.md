# plan.md — mcFaro: Guía de desarrollo para Claude Code

> **Instrucción para Claude Code:** Este es el plan maestro de mcFaro. Léelo **completo** antes de escribir una sola línea de código. Cada decisión de arquitectura está justificada. Cada tarea está secuenciada por dependencias. El objetivo es un MVP funcional, demostrable en vivo y emocionalmente poderoso ante el jurado. Con Claude Code hacemos 20x — ejecuta en paralelo siempre que las dependencias lo permitan.

---

## Contexto del hackathon

| Campo | Dato |
|---|---|
| **Track** | McDonald's / Fundación Infantil Ronald McDonald México |
| **Tema** | *"Care beyond the hospitality: family‑centered solutions"* |
| **Entrega Fase 2** | 8 de abril 2026 — 8:00 p.m. (repositorio + enlace demo) |
| **Demo final** | 9 de abril 2026 — jurado en vivo en Expo Santa Fe |
| **Premio** | $100,000 MXN |
| **Competidores** | 15 equipos en el track |
| **Criterios del jurado** | Uso creativo de tecnología · Enfoque en personas · Factibilidad · Escalabilidad · Funcionalidad del prototipo |

### Por qué mcFaro gana

La fundación tiene un problema declarado por su directora en diciembre 2025: **"La gente no sabe que existimos."** Y las familias llegan **"llenas de miedo y dudas, desorientadas"** — testimonio real del informe 2022.

mcFaro ataca exactamente eso: el momento más crítico y más humano del journey — **la llegada**. Una familia de Chiapas que llega por primera vez a Casa Ronald CDMX, sin conocer la ciudad, con un hijo con leucemia. La app les da claridad, rutina, acompañamiento emocional y conexión — en un dispositivo que ya tienen: su celular.

El diferenciador técnico es la **rutina diaria generada por IA** — Gemini orquesta el día del cuidador considerando sus citas, los horarios de la Casa y su estado emocional. Ningún otro equipo va a tener esto con datos reales de la fundación.

---

## Stack tecnológico — decisiones definitivas

```
Frontend:    Next.js 15 (App Router) + TypeScript + Tailwind CSS
PWA:         next-pwa (Service Worker + offline)
Auth:        Firebase Auth (Phone OTP) 
Database:    Firebase Firestore (offline persistence nativa)
Push:        Firebase Cloud Messaging (FCM)
IA:          Google Gemini 2.0 Flash (rutina del día + chatbot Faro)
Iconos:      Lucide React
Validación:  Zod
Fechas:      date-fns
Deploy:      Vercel (frontend) — URL pública en <5 min
```

### Por qué este stack específico (argumentos para el jurado)

- **Next.js App Router**: Server Components protegen las API keys de Gemini y Firebase Admin. Sin backend separado que pueda caerse en la demo.
- **Gemini 2.0 Flash**: Respuestas en <3 segundos. Costo mínimo. Ecosistema Google/Firebase coherente. Ideal para generación de rutinas en tiempo real.
- **Firebase Firestore**: Offline persistence nativa — la app funciona sin internet con los datos del día almacenados localmente. Crítico porque los hospitales tienen señal intermitente.
- **Firebase Auth Phone OTP**: Las familias no tienen email corporativo. El teléfono es el identificador universal. Un cuidador de Guerrero puede registrarse.
- **PWA**: Instalable en Android sin App Store. Deploy instantáneo. La fundación puede distribuirla con un QR en recepción el día 1.

### Lo que mcFaro NO hace (importante para el pitch)

- ❌ No almacena diagnósticos, medicamentos ni resultados clínicos
- ❌ No accede a expedientes hospitalarios
- ❌ No toma decisiones de salud
- ✅ Solo: organización, bienestar y acompañamiento humano

---

## Arquitectura de carpetas

```
mcfaro/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              # Login con teléfono + OTP
│   ├── (app)/
│   │   ├── layout.tsx                # Layout con BottomNav
│   │   ├── dashboard/page.tsx        # Home — vista general del día
│   │   ├── calendario/page.tsx       # Citas + recordatorios
│   │   ├── rutina/page.tsx           # Rutina IA del día
│   │   ├── respira/page.tsx          # Bienestar emocional
│   │   ├── faro/page.tsx             # Chatbot IA de acompañamiento
│   │   ├── mapa/page.tsx             # Guía de traslados
│   │   └── coordinador/page.tsx      # Panel staff Casa Ronald
│   ├── api/
│   │   ├── rutina/route.ts           # POST — genera rutina con Gemini
│   │   ├── faro/route.ts             # POST — chatbot streaming
│   │   └── notificaciones/route.ts   # POST — envía push FCM
│   ├── globals.css
│   └── layout.tsx                    # Root layout + providers
├── components/
│   ├── ui/
│   │   ├── BottomNav.tsx
│   │   ├── Toast.tsx
│   │   └── Skeleton.tsx
│   ├── calendario/
│   │   ├── TarjetaCita.tsx
│   │   └── FormularioCita.tsx
│   ├── rutina/
│   │   └── BloqueHorario.tsx
│   ├── respira/
│   │   └── TemporizadorRespiracion.tsx
│   └── faro/
│       └── ChatBurbuja.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCitas.ts
│   ├── useRutina.ts
│   └── useFaro.ts
├── lib/
│   ├── firebase.ts                   # Cliente Firebase
│   ├── firebase-admin.ts             # Admin SDK (server only)
│   ├── gemini.ts                     # Wrapper Gemini API
│   └── notificaciones.ts             # Helper FCM
├── types/
│   └── index.ts                      # Familia, Cita, BloqueRutina, etc.
└── public/
    ├── manifest.json
    └── icons/
```

---

## Setup inicial — ejecutar primero

```bash
# Crear proyecto
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
npm install zod date-fns lucide-react
npm install -D @types/node

# Verificar que todo compila
npm run build
```

### Variables de entorno — `.env.local`

```env
# Firebase Client (público — van en NEXT_PUBLIC_)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=          # Para FCM push en browser

# Firebase Admin (privado — solo server)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=              # Con saltos de línea: "-----BEGIN...\n..."

# Gemini
GEMINI_API_KEY=
```

### `next.config.ts`

```typescript
import withPWA from 'next-pwa';

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})({
  images: { domains: [] },
  experimental: { serverActions: { allowedOrigins: ['localhost:3000'] } }
});

export default config;
```

### `public/manifest.json`

```json
{
  "name": "mcFaro — Tu guía en Casa Ronald",
  "short_name": "mcFaro",
  "description": "Organiza el día a día de tu familia en Casa Ronald McDonald",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#DA291C",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

---

## Tipos de datos — `types/index.ts`

Definir esto primero. Todos los hooks y componentes dependen de estos contratos.

```typescript
// Familia registrada en Casa Ronald
export interface Familia {
  uid: string;
  nombreCuidador: string;
  nombreNino: string;
  hospital: string;              // Ej: "Instituto Nacional de Pediatría"
  casaRonald: 'cdmx' | 'puebla' | 'tlalnepantla';
  tipoTratamiento: string;       // Libre, no diagnóstico clínico
  fechaIngreso: string;          // ISO date
  fechaSalidaEstimada?: string;
  rol: 'familia' | 'coordinador';
  tokenFCM?: string;
  idioma: 'es' | 'en';
  createdAt: string;
}

// Cita médica o evento del día
export interface Cita {
  id: string;
  familiaId: string;
  titulo: string;
  fecha: string;                 // ISO date "2026-04-08"
  hora: string;                  // "09:30"
  servicio: 'consulta' | 'estudio' | 'cirugia' | 'quimioterapia' | 'traslado' | 'otro';
  hospital: string;
  notas?: string;
  recordatorio60min: boolean;
  recordatorio15min: boolean;
  createdAt: string;
}

// Bloque de rutina generado por Gemini
export interface BloqueRutina {
  hora: string;                  // "07:30"
  tipo: 'alimentacion' | 'traslado' | 'cita' | 'descanso' | 'actividad' | 'bienestar';
  descripcion: string;           // Texto empático y cálido
  duracion_min: number;
  icono?: string;
}

export interface Rutina {
  id: string;
  familiaId: string;
  fecha: string;
  bloques: BloqueRutina[];
  generadaEn: string;
}

// Mensaje del chatbot Faro
export interface MensajeFaro {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
```

---

## Diseño visual — identidad de mcFaro

**Concepto:** *Calidez digital*. Nada de interfaces médicas frías. mcFaro debe sentirse como un abrazo tecnológico.

**Paleta:**
```css
:root {
  --rojo:      #DA291C;   /* Rojo Ronald — energía, urgencia */
  --amarillo:  #FFC72C;   /* Amarillo Ronald — calidez, alegría */
  --crema:     #FFFBF0;   /* Fondo principal — suave, hogareño */
  --carbón:    #1A1A1A;   /* Texto principal */
  --gris:      #6B7280;   /* Texto secundario */
  --success:   #16A34A;   /* Confirmaciones */
  --superficie: #FFFFFF;  /* Cards */
}
```

**Tipografía:**
- Display / títulos: `Nunito` (Google Fonts) — redondeada, amigable, accesible
- Cuerpo: `Nunito` mismo peso 400 — consistencia, legibilidad en pantallas pequeñas
- Tamaño mínimo: 16px. Botones: 18px. Títulos de pantalla: 24px.

**Reglas de UI:**
- Botones táctiles: mínimo 48×48px
- Border-radius generoso: 16px para cards, 12px para botones
- Sombras suaves: `shadow-md` de Tailwind — profundidad sin frialdad
- Iconos: Lucide React (consistentes, no decorativos — cada ícono tiene significado)
- Animaciones: suaves y funcionales. Nada de parallax. Transiciones de 200ms.
- Loading states en TODA operación async — nunca pantalla en blanco

**Modo offline:** Banner amarillo discreto en la parte superior cuando no hay conexión. La app sigue funcionando — solo muestra datos cacheados.

---

## Fase 1 — Fundación y autenticación ⏱ ~3 horas

**Objetivo:** Proyecto corriendo, auth funcional, perfil de familia guardado en Firestore.

### Tareas (en orden de dependencia)

- [ ] Crear proyecto Firebase Console: habilitar Firestore, Auth (Phone), FCM, Hosting
- [ ] Copiar `.env.local` con todas las variables
- [ ] Crear `lib/firebase.ts` — inicialización cliente con detección SSR:
  ```typescript
  // IMPORTANTE: Firestore debe inicializarse con enableIndexedDbPersistence()
  // para que el offline funcione. Solo en browser, no en SSR.
  ```
- [ ] Crear `lib/firebase-admin.ts` — solo para Server Components y API Routes
- [ ] Crear `types/index.ts` — contratos de datos completos (ver arriba)
- [ ] Crear `hooks/useAuth.ts`:
  - Estado: `{ user, familia, loading, error }`
  - Escucha `onAuthStateChanged`
  - Si usuario autenticado, carga `familia/{uid}` de Firestore
- [ ] `app/(auth)/login/page.tsx` — pantalla de login:
  - Campo de teléfono con código de país (+52 MX por default)
  - Botón "Enviar código"
  - Campo OTP de 6 dígitos con autofocus
  - Si `familia/{uid}` no existe → redirect a `/onboarding`
  - Si existe → redirect a `/dashboard`
  - UI: fondo crema, logo mcFaro centrado, texto empático no técnico
- [ ] `app/(auth)/onboarding/page.tsx` — registro familiar:
  - Paso 1: Nombre del cuidador + nombre del niño
  - Paso 2: Hospital donde recibe tratamiento (dropdown con 35+ hospitales aliados)
  - Paso 3: Casa Ronald donde se hospedan + fecha de ingreso + tipo de tratamiento (texto libre)
  - Validación Zod en cada paso
  - Guardar en `familias/{uid}`
  - UI: wizard con progreso visual (3 pasos), lenguaje cálido ("¿Cómo se llama el pequeño?")
- [ ] Proteger rutas `(app)/` con `middleware.ts` — redirect a `/login` si no hay sesión
- [ ] Pantalla splash / loading: animación de faro parpadeando con Tailwind

### Criterio de éxito
Un número de teléfono real recibe el SMS, completa el onboarding y llega al dashboard (aunque esté vacío). El perfil está en Firestore.

---

## Fase 2 — Calendario de citas + Push ⏱ ~4 horas

**Objetivo:** El cuidador registra citas y recibe notificaciones push 60 y 15 min antes.

### Tareas

- [ ] `lib/notificaciones.ts`:
  - `solicitarPermiso()` — pide permiso de notificación al browser
  - `registrarTokenFCM()` — obtiene token y lo guarda en `familias/{uid}.tokenFCM`
  - `suscribirseATopic(topic)` — suscripción a tópicos (ej: `casa-cdmx`)
- [ ] `hooks/useCitas.ts`:
  - `onSnapshot` en `citas/` filtrado por `familiaId` y `fecha`
  - `agregarCita(cita: Omit<Cita, 'id' | 'createdAt'>)`
  - `editarCita(id, cambios)`
  - `eliminarCita(id)`
  - Las citas se cachean en Firestore offline automáticamente
- [ ] `app/(app)/calendario/page.tsx`:
  - Header: fecha actual en español ("Martes 8 de abril")
  - Navegación por días: ← hoy mañana →
  - Lista de citas del día seleccionado, ordenadas por hora
  - Si no hay citas: estado vacío amigable con CTA para agregar
  - Botón FAB (+) para nueva cita
  - Swipe-to-delete en cada tarjeta (mobile)
- [ ] `components/calendario/TarjetaCita.tsx`:
  - Icono del tipo de servicio (color-coded)
  - Hora + título + hospital
  - Indicador de tiempo de traslado si aplica
  - Estado: próxima (borde amarillo), pasada (gris), ahora (borde rojo pulsante)
- [ ] `components/calendario/FormularioCita.tsx`:
  - Sheet/drawer desde abajo (mobile-first)
  - Campos: título, fecha, hora, tipo de servicio, hospital, notas
  - Toggles para activar recordatorios 60min / 15min
  - Validación inline con mensajes humanizados
- [ ] `app/api/notificaciones/route.ts` (Server):
  - POST `{ familiaId, citaId, minutosAntes }`
  - Obtiene token FCM de `familias/{familiaId}`
  - Usa Firebase Admin para enviar push con FCM
  - Payload: título, cuerpo, datos de navegación (deep link a `/calendario`)
- [ ] Registrar Service Worker para push en segundo plano:
  - `public/firebase-messaging-sw.js` — handler de mensajes en background
- [ ] Lógica de scheduling de recordatorios:
  - Al crear/editar una cita, calcular timestamps para push
  - Guardar en `recordatorios/{id}` con campos `enviarEn`, `enviado`
  - Cloud Function (o endpoint cron) que revisa cada minuto — **para el hackathon: botón manual "Simular recordatorio" en el panel coordinador**

### Criterio de éxito
Cita creada para dentro de 3 minutos → notificación push llega al dispositivo con el mensaje correcto.

---

## Fase 3 — Rutina diaria con Gemini ⏱ ~3 horas

**Objetivo:** El cuidador abre la app y ve su día organizado inteligentemente. Es el diferenciador principal del proyecto.

### `lib/gemini.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
export const geminiFlash = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
```

### `app/api/rutina/route.ts`

```typescript
// POST { familiaId, fecha }
// 1. Obtener familia desde Firestore (nombre cuidador, nombre niño, Casa)
// 2. Obtener citas del día desde Firestore
// 3. Construir prompt contextual con datos reales
// 4. Llamar Gemini, parsear JSON, guardar en rutinas/{id}
// 5. Return { rutina }

// PROMPT BASE — adaptar con datos reales de la familia:
const PROMPT_RUTINA = `
Eres mcFaro, el asistente de organización de la Fundación Infantil Ronald McDonald México.
Estás ayudando a ${nombreCuidador}, quien cuida a ${nombreNino} durante su tratamiento médico 
en ${hospital}. Se hospedan en la Casa Ronald McDonald de ${casaRonald}.

Hoy es ${fechaFormateada}. Las citas del día son:
${citasFormateadas}

La Casa Ronald tiene estos horarios:
- Desayuno: 7:30 – 8:30 am
- Comida: 13:00 – 14:30 pm  
- Cena: 19:00 – 20:00 pm
- Transporte al hospital: sale 30 minutos antes de la primera cita

Genera una rutina del día para ${nombreCuidador} en formato JSON con este schema exacto:
{
  "fecha": "YYYY-MM-DD",
  "mensaje_inicio": "Una frase cálida y alentadora para comenzar el día (max 20 palabras)",
  "bloques": [
    {
      "hora": "HH:MM",
      "tipo": "alimentacion|traslado|cita|descanso|actividad|bienestar",
      "descripcion": "Instrucción clara y empática, en segunda persona (max 30 palabras)",
      "duracion_min": número
    }
  ]
}

Reglas:
- Incluir tiempo para que ${nombreCuidador} desayune, coma y cene
- Agregar bloques de descanso entre actividades largas
- Si hay cita temprana, incluir bloque de preparación/traslado antes
- Usar lenguaje cálido, nunca clínico
- Máximo 10 bloques
- Responder SOLO con el JSON, sin texto adicional
`;
```

### Tareas

- [ ] Implementar `app/api/rutina/route.ts` con el prompt completo y parsing JSON robusto
- [ ] `hooks/useRutina.ts`:
  - Busca rutina del día en `rutinas/` (por `familiaId` + `fecha`)
  - Si no existe o tiene más de 6h → llama al endpoint para regenerar
  - Retorna `{ rutina, loading, error, regenerar }`
- [ ] `app/(app)/rutina/page.tsx`:
  - Header con fecha y mensaje de inicio de Gemini
  - Timeline vertical de bloques horarios
  - Cada bloque con: hora, icono del tipo, descripción, duración
  - Bloque activo (hora actual) destacado con borde rojo
  - Botón "Regenerar mi rutina" con loader
  - Estado vacío: "Agrega citas en el calendario para generar tu rutina"
  - Funciona offline mostrando la última rutina guardada
- [ ] `components/rutina/BloqueHorario.tsx`:
  - Línea de tiempo vertical con conector visual entre bloques
  - Color del bloque según tipo (amarillo=alimentación, rojo=cita, verde=bienestar...)
  - Indicador "Ahora" en el bloque actual
- [ ] **Seed data para demo**: Pre-cargar 2-3 citas realistas en la cuenta de demo antes de la presentación. La rutina debe generarse instantáneamente ante el jurado.

### Criterio de éxito
Con 2 citas registradas, la app genera y muestra en <8 segundos una rutina coherente, empática y útil para el día.

---

## Fase 4 — Chatbot Faro (IA conversacional) ⏱ ~3 horas

**Objetivo:** El cuidador tiene un asistente disponible 24/7 que responde dudas operativas y ofrece apoyo emocional. Este es el **segundo diferenciador técnico**.

### Por qué Faro marca la diferencia

La directora de la fundación dijo: *"La gente no sabe qué hacemos."* Y las familias llegan con preguntas como "¿A qué hora sale el transporte?", "¿Puedo traer más familiares?", "¿Dónde queda el laboratorio del INP?". Faro responde eso — con contexto real de Casa Ronald.

Faro también puede decir: *"Llevas 4 horas en el hospital. ¿Cómo estás tú? ¿Tomaste agua?"*

### `app/api/faro/route.ts` — Streaming

```typescript
// POST { messages: MensajeFaro[], familiaId }
// Usa Gemini streaming para respuesta en tiempo real

const SYSTEM_FARO = `
Eres Faro, el asistente de la Fundación Infantil Ronald McDonald México.
Tu propósito es ayudar a los cuidadores de familias que se hospedan en las 
Casas Ronald McDonald durante el tratamiento médico de sus hijos.

Contexto que conoces sobre las Casas Ronald McDonald México:
- 3 sedes: Ciudad de México (Tlalpan), Puebla (Cholula) y Tlalnepantla (EdoMex)
- Servicios incluidos: 3 comidas al día, habitación privada con baño, transporte diario al hospital, lavandería
- Costo: $0–5 MXN/persona/día según estudio socioeconómico. Nunca se rechaza a una familia.
- Transporte: sale 30 min antes de la primera cita del día
- Actividades: arte terapia, terapia con perros, huerto Ronald, acompañamiento psicológico
- Voluntarios: pueden apoyar en actividades, limpieza, compañía emocional
- Hospitales principales: INP, Federico Gómez, La Raza, Shriners, entre otros

Familia con quien hablas: ${nombreCuidador}, cuida a ${nombreNino} en ${hospital}.

Reglas de comportamiento:
- Responde siempre en español, con calidez y empatía
- Sé concreto y útil — los cuidadores tienen poco tiempo y mucho estrés
- Si no sabes algo, di "No tengo esa información, te recomiendo preguntar al personal de la Casa"
- NUNCA des consejos médicos ni interpretes síntomas
- Si detectas angustia extrema, ofrece el contacto de apoyo emocional: "¿Te gustaría hablar con alguien del equipo de la Casa?"
- Máximo 3 párrafos por respuesta
- Puedes usar emojis con moderación 🌟
`;
```

### Tareas

- [ ] `app/api/faro/route.ts` — streaming con `ReadableStream` y `getGenerativeModel().generateContentStream()`
- [ ] `hooks/useFaro.ts`:
  - Estado de historial de mensajes
  - `enviarMensaje(texto)` — llama al endpoint y hace streaming de la respuesta
  - Persiste historial en Firestore `chats/{uid}/mensajes`
- [ ] `app/(app)/faro/page.tsx`:
  - Pantalla de chat estilo WhatsApp / iMessage
  - Burbuja de bienvenida con pregunta sugerida
  - Input con botón enviar
  - Streaming visible: cursor parpadeante mientras Faro escribe
  - Chips de preguntas frecuentes debajo del input:
    - "¿A qué hora sale el transporte?"
    - "¿Qué incluye el desayuno?"
    - "Necesito apoyo emocional"
    - "¿Cómo llego al INP?"
- [ ] `components/faro/ChatBurbuja.tsx` — burbujas diferenciadas usuario/Faro con avatar
- [ ] En el **Dashboard**: una tarjeta de Faro con el último mensaje o una pregunta proactiva

### Criterio de éxito
El jurado le hace una pregunta a Faro en vivo (ej: "¿Qué hace Casa Ronald?") y recibe una respuesta en streaming, cálida y correcta en <3 segundos.

---

## Fase 5 — Módulo Respira ⏱ ~1.5 horas

**Objetivo:** Herramienta de bienestar emocional para el cuidador. Simple, hermosa, accesible en 1 tap.

### Tareas

- [ ] `app/(app)/respira/page.tsx`:
  - Header: "Un momento para ti"
  - Temporizador de respiración 4-7-8:
    - Círculo animado con CSS (escala: 1.0 → 1.4 → 1.0)
    - Tres fases con color y texto: Inhala (azul suave) / Retén (amarillo) / Exhala (verde suave)
    - Contador de ciclos completados
    - Duración total: 3 ciclos ≈ 57 segundos
  - Mensajes de microbienestar al completar:
    - "Muy bien, {nombreCuidador}. Cuidarte a ti también cuida a {nombreNino}."
  - Sección "Momentos del día" — recordatorios gentiles:
    - "¿Tomaste agua en las últimas 2 horas?"
    - "¿Comiste algo hoy?"
    - "Llevas muchas horas de pie — busca un lugar para sentarte 10 minutos"
    - Lógica basada en hora del día
  - Sección "Frases de otras familias" — 3-4 testimonios reales del informe 2022 rotando

- [ ] `components/respira/TemporizadorRespiracion.tsx`:
  - Animación 100% CSS Tailwind (`transition-transform duration-[4000ms]`)
  - Sin dependencias externas
  - Funciona completamente offline

### Criterio de éxito
El módulo se abre en <1 segundo y el temporizador funciona sin conexión a internet.

---

## Fase 6 — Dashboard y navegación ⏱ ~2 horas

**Objetivo:** La primera pantalla que ve un cuidador cada mañana. Debe ser útil en 5 segundos.

### `app/(app)/dashboard/page.tsx`

**Layout en mobile (375px):**
```
┌─────────────────────────────┐
│  Buenos días, María 👋       │ ← Saludo con nombre
│  Día 12 en Casa Ronald      │ ← Días de estancia calculados
├─────────────────────────────┤
│  ⚡ PRÓXIMA CITA             │ ← Tarjeta destacada con borde rojo
│  09:00 — Oncología INP      │
│  Sale en 45 minutos         │
├─────────────────────────────┤
│  📅 TU RUTINA DE HOY        │ ← Primeros 3 bloques de rutina
│  07:30 Desayuna             │
│  08:00 Prepárate para salir │
│  09:00 Consulta oncología   │
│  Ver rutina completa →      │
├─────────────────────────────┤
│  💬 FARO                    │ ← Chatbot con pregunta proactiva
│  "¿Tienes dudas sobre el    │
│   transporte de hoy?"       │
├─────────────────────────────┤
│  🌬️ RESPIRA                 │ ← Acceso rápido bienestar
│  57 segundos para ti        │
└─────────────────────────────┘
│  🏠  📅  🗂️  💬  🌬️       │ ← Bottom nav
```

### Tareas

- [ ] `app/(app)/dashboard/page.tsx` — layout completo con todas las tarjetas
- [ ] `components/ui/BottomNav.tsx` — 5 tabs: Inicio, Calendario, Rutina, Faro, Respira
  - Indicador activo con punto amarillo
  - Transición suave entre tabs
  - Safe area bottom para iPhones con notch
- [ ] Tarjeta de próxima cita:
  - Countdown dinámico si hay cita en las próximas 2 horas
  - "No tienes citas hoy — un día de descanso 🌟" si no hay
- [ ] Contador de días de estancia (calculado desde `fechaIngreso`)
- [ ] Banner de modo offline (si `navigator.onLine === false`)

### Criterio de éxito
El dashboard carga en <2 segundos y muestra información útil y real del cuidador.

---

## Fase 7 — Panel del Coordinador ⏱ ~1.5 horas

**Objetivo:** El personal de Casa Ronald ve en un vistazo qué familias tienen citas hoy y cuánto tiempo llevan.

### Tareas

- [ ] `app/(app)/coordinador/page.tsx` — solo si `familia.rol === 'coordinador'`
- [ ] Acceso: en el demo, botón "Ver como Coordinador" en el dashboard para switching de rol
- [ ] Vista: lista de familias activas con:
  - Nombre del cuidador + nombre del niño + hospital
  - Días de estancia (calculado)
  - Citas del día ordenadas por hora
  - Estado de bienestar (si la familia usó Respira o habló con Faro ese día → indicador verde)
- [ ] Estadísticas del día:
  - Familias activas hoy
  - Total de citas del día
  - Familias sin citas (pueden necesitar atención)
- [ ] Botón "Simular notificación push" — envía push de prueba a una familia (para demo)
- [ ] Protección en `middleware.ts`: verificar `rol === 'coordinador'` en el JWT

### Criterio de éxito
Cambiar al rol coordinador y ver la lista de familias con sus citas del día en tiempo real.

---

## Fase 8 — Guía de traslados / Mapa ⏱ ~1 hora

**Objetivo:** Reducir la ansiedad de las familias que no conocen la ciudad.

### Tareas

- [ ] `app/(app)/mapa/page.tsx`
- [ ] Selector de trayecto:
  - Dropdown: Casa Ronald (CDMX / Puebla / Tlalnepantla)
  - Dropdown: Hospital destino (lista de 12 hospitales principales aliados)
- [ ] Para cada trayecto:
  - Tiempo estimado en transporte Casa Ronald (valor hardcodeado — dato real del equipo fundación)
  - Instrucciones de abordaje: "El camión sale de la puerta principal a las 8:00, 10:00 y 14:00"
  - Mapa estático (imagen) con ruta marcada (para el hackathon: imagen pre-renderizada)
  - Botón "Abrir en Google Maps" (deep link con coordenadas reales)
- [ ] Integrar con Calendario: al agregar cita, sugerir tiempo de traslado automáticamente

### Criterio de éxito
Una familia puede saber en 10 segundos a qué hora debe salir para llegar a tiempo a su cita.

---

## Fase 9 — PWA, offline y polish ⏱ ~2 horas

**Objetivo:** La app funciona en condiciones reales: señal intermitente, primera visita, dispositivo Android de gama media.

### Estrategia de caché

```typescript
// next-pwa runtime caching en next.config.ts
runtimeCaching: [
  {
    urlPattern: /^https:\/\/firestore\.googleapis\.com/,
    handler: 'NetworkFirst',         // Firestore tiene su propio offline — dejarlo
  },
  {
    urlPattern: /\/_next\/static\//,
    handler: 'CacheFirst',
    options: { cacheName: 'static-assets', expiration: { maxAgeSeconds: 86400 } }
  },
  {
    urlPattern: /\/api\/rutina/,
    handler: 'NetworkFirst',
    options: { cacheName: 'rutina-cache', expiration: { maxAgeSeconds: 21600 } } // 6h
  },
]
```

### Tareas

- [ ] Verificar Service Worker en Chrome DevTools → Application → Service Workers
- [ ] Probar offline: Application → Network → Offline → reload. Dashboard debe cargar.
- [ ] Probar en Android físico (Chrome). PWA install prompt debe aparecer.
- [ ] Auditoría Lighthouse: apuntar a >85 en Performance, >90 en Accessibility, 100 en PWA
- [ ] UX polish:
  - Todos los `<button>` y `<a>` tienen `min-h-[48px] min-w-[48px]`
  - Fuentes ≥ 16px en todo el app
  - `aria-label` en botones de ícono
  - `lang="es"` en `<html>`
  - Colors contrast ratio ≥ 4.5:1
  - Loading skeleton en todas las pantallas async
  - Toast de confirmación en: cita guardada, rutina generada, mensaje enviado
  - Error states humanizados: "Algo salió mal — intenta de nuevo 🙏"
- [ ] Favicon personalizado mcFaro (faro estilizado en rojo/amarillo)
- [ ] Splash screen para iOS (meta tags en `layout.tsx`)
- [ ] `<meta name="theme-color" content="#DA291C">` para barra de estado en Android

### Criterio de éxito
Lighthouse PWA: 100. App funciona completamente offline. Instala en Android en <30 segundos.

---

## Datos de demo — preparar antes de la presentación

**Crear estas cuentas en Firebase antes del 9 de abril:**

### Cuenta Familia (demo principal)
```
Teléfono: número real del presentador
Cuidador: "María Hernández"
Niño: "Sebastián, 7 años"
Hospital: Instituto Nacional de Pediatría
Casa Ronald: CDMX
Tratamiento: "Seguimiento oncológico — leucemia linfoblástica"
Fecha ingreso: 2026-03-26 (12 días antes del hackathon)

Citas del 9 de abril:
- 09:00 — Consulta oncología — INP
- 14:30 — Análisis de sangre — INP
- 16:00 — Sesión psicológica — Casa Ronald (interna)
```

### Cuenta Coordinador (para demo panel)
```
Teléfono: número del segundo presentador
Rol: coordinador
Casa: CDMX
```

### Script de la demo (8 minutos máximo)

1. **00:00 — 00:45** — Story inicial: "María es de Oaxaca. Llegó hace 12 días con Sebastián. No conoce CDMX. Tiene miedo. Tiene mcFaro."
2. **00:45 — 01:30** — Login → dashboard (mostrar saludo, 12 días, próxima cita destacada)
3. **01:30 — 02:30** — Agregar cita nueva (mostrar push notification en vivo)
4. **02:30 — 03:30** — Abrir Rutina → mostrar rutina generada por Gemini con las 3 citas
5. **03:30 — 04:15** — Chatbot Faro → pregunta en vivo "¿A qué hora sale el transporte hoy?" → respuesta streaming
6. **04:15 — 05:00** — Módulo Respira → temporizador en vivo
7. **05:00 — 05:45** — Cambiar a rol coordinador → panel con familias del día
8. **05:45 — 06:30** — Activar modo avión → mostrar que todo sigue funcionando offline
9. **06:30 — 07:30** — Pitch de escalabilidad: "Esto corre en 3 Casas y 6 Salas hoy. Puede estar en las 390 Casas globales de RMHC mañana."
10. **07:30 — 08:00** — Cierre: impacto humano — la frase de Caleb: *"Dejé de sentirme sola."*

---

## Argumentos de escalabilidad (para cuando el jurado pregunte)

| Dimensión | Hoy (piloto) | Escala 1 | Escala 2 |
|---|---|---|---|
| Usuarios | Demo / 3 Casas MX | 540 familias activas en 3 Casas MX | 6 Salas Familiares MX |
| Infraestructura | Firebase Spark (gratuito) | Firebase Blaze (~$50 USD/mes) | RMHC global — 390 Casas, 62 países |
| Multi-idioma | Español | + Inglés (i18n en 2h con i18next) | + Lenguas indígenas MX (Nahuatl, Zapoteco) |
| Multi-tenant | 1 configuración | Config por Casa Ronald (horarios, hospitales) | Config global por país/sede |
| IA | Gemini 2.0 Flash | Mismo modelo, más contexto por sede | Fine-tuning con datos agregados (anonimizados) |
| Costo por familia | ~$0.10 USD/mes (Gemini + FCM) | Absorbible por la fundación | McDonald's cubre el 80% del presupuesto |

---

## Criterios del jurado — cómo mcFaro los cubre

| Criterio | Cómo lo cubrimos |
|---|---|
| **Uso creativo de la tecnología** | Gemini genera rutinas personalizadas con datos reales de la familia + chatbot Faro con contexto de Casa Ronald. No es "IA genérica". |
| **Enfoque centrado en personas** | El user journey es de María, no de un sistema. Los datos seed son reales. La narrativa del demo es emocional. |
| **Factibilidad** | Firebase Spark = $0 para el piloto. La fundación ya tiene WhatsApp grupos — mcFaro es una evolución, no una revolución. |
| **Escalabilidad** | Multi-tenant por Casa, internacionalizable, costo <$0.10/familia/mes. RMHC global ya tiene infraestructura de datos. |
| **Funcionalidad** | Demo en vivo con datos reales, push notification en tiempo real, streaming de IA, modo offline verificado. |

---

## Prioridad si el tiempo se acaba

| Prioridad | Módulo | ¿Qué sacrificar? |
|---|---|---|
| 🔴 **MUST** | Auth + Onboarding | No negociable — sin esto no hay demo |
| 🔴 **MUST** | Calendario + Push | Es el core funcional |
| 🔴 **MUST** | Rutina con Gemini | El diferenciador técnico principal |
| 🔴 **MUST** | Dashboard cohesivo | Primera impresión del jurado |
| 🟠 **HIGH** | Chatbot Faro | Segundo diferenciador — si no hay tiempo: mostrar como mockup en video |
| 🟠 **HIGH** | Módulo Respira | Puede ser estático sin temporizador real |
| 🟡 **NICE** | Panel coordinador | Mockup de Figma si no hay tiempo |
| 🟡 **NICE** | Mapa / traslados | Imagen estática suficiente |
| 🟢 **POLISH** | Offline completo | Mencionar en pitch sin demo en vivo |

---

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Build producción
npm run build && npm run start

# Desplegar en Vercel (recomendado para el hackathon)
npx vercel --prod

# Desplegar en Firebase Hosting (alternativa)
npm run build && npx firebase deploy --only hosting

# Emuladores Firebase locales (para desarrollar sin internet)
npx firebase emulators:start --only firestore,auth,functions

# Verificar PWA localmente (necesita HTTPS)
npx serve out -l 3000
```

---

## Notas de arquitectura — por qué cada decisión

### ¿Por qué Next.js y no Vite/React puro?
App Router + Server Components protegen las API keys de Gemini y Firebase Admin del cliente. Las llamadas a IA van server-side — no se exponen credenciales. Además, el soporte de PWA con `next-pwa` está maduro y la integración con Vercel es instantánea.

### ¿Por qué Gemini y no Claude/OpenAI?
Gemini 2.0 Flash integra nativamente con Firebase/GCP — coherencia de stack. Respuestas en <3s para generación de rutinas. El ecosistema Google (Firebase + Gemini + FCM + Firestore) permite usar una sola cuenta de GCP para todo, simplificando las credenciales en el hackathon.

### ¿Por qué Firebase Auth con teléfono?
Las familias en Casa Ronald vienen de los 32 estados, muchas en situación de pobreza. No todas tienen email. El teléfono es el único identificador universal. El flujo OTP por SMS es familiar y no requiere que el usuario recuerde contraseñas.

### ¿Por qué Firestore y no PostgreSQL/Supabase?
Offline persistence nativa. En hospitales con señal intermitente, las citas y rutinas del día se cachean automáticamente en IndexedDB y siguen funcionando. No requiere gestionar servidores. El plan Spark es gratuito para el piloto.

### Sobre privacidad y datos
mcFaro deliberadamente NO almacena:
- Diagnósticos clínicos
- Nombres de medicamentos
- Resultados de estudios
- Historial médico

Solo almacena: nombre (cuidador y niño), hospital, tipo de tratamiento (texto libre, no clínico), citas logísticas. Esto elimina la necesidad de cumplimiento NOM-024 y hace el prototipo legalmente limpio para el hackathon.

---

*mcFaro — Cuando tu familia enfrenta lo más difícil, nosotros organizamos el camino.*