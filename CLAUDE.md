# CLAUDE.md — mcFaro

> Este archivo es el punto de entrada para Claude Code. Léelo completo antes de tocar cualquier archivo.

## ¿Qué es mcFaro?

**mcFaro** es una Progressive Web App (PWA) para cuidadores de niños hospitalizados que se hospedan en Casas Ronald McDonald en México. Su propósito es reducir la carga cognitiva del cuidador: organizar citas, generar rutinas diarias con IA y recordarles que también necesitan cuidarse.

- **Hackathon:** Genius Arena Hackathon 2026 — Talent Land México
- **Track:** Care beyond the hospitality — Fundación Ronald McDonald
- **Entrega Fase 2:** 8 de abril 2026, 8:00 p.m.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14+ (App Router) |
| Estilos | Tailwind CSS |
| PWA | next-pwa + Service Workers |
| Backend / DB | Firebase Firestore |
| Auth | Firebase Auth (login por número de teléfono) |
| Notificaciones | Firebase Cloud Messaging (FCM) |
| IA | Google Gemini API (gemini-2.0-flash) — rutinas y asistente conversacional |
| Hosting | Firebase Hosting |

---

## Estructura del proyecto

```
mcfaro/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   └── login/              # Login por teléfono
│   ├── (app)/
│   │   ├── dashboard/          # Vista principal del cuidador
│   │   ├── calendario/         # Citas y recordatorios
│   │   ├── rutina/             # Rutina diaria generada por IA
│   │   ├── respira/            # Módulo de bienestar / pausas
│   │   ├── mapa/               # Guía visual hospital + Casa Ronald
│   │   └── coordinador/        # Panel del staff (ruta protegida)
│   ├── api/
│   │   ├── rutina/             # Endpoint: genera rutina con Claude API
│   │   └── notificaciones/     # Endpoint: envía push via FCM
│   └── layout.tsx
├── components/
│   ├── ui/                     # Componentes base (Button, Card, Modal…)
│   ├── calendario/
│   ├── rutina/
│   └── respira/
├── lib/
│   ├── firebase.ts             # Inicialización Firebase (client)
│   ├── firebase-admin.ts       # Firebase Admin SDK (server)
│   ├── gemini.ts               # Wrapper Gemini API
│   └── notificaciones.ts       # Helper FCM
├── hooks/
│   ├── useAuth.ts
│   ├── useCitas.ts
│   └── useRutina.ts
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # Iconos PWA (512px, 192px, etc.)
├── CLAUDE.md                   # ← este archivo
├── plan.md                     # Plan de desarrollo por fases
├── .env.local                  # Variables de entorno (no commitear)
└── next.config.ts
```

---

## Reglas para Claude Code

### Siempre
- Usa TypeScript estricto en todos los archivos
- Componentes funcionales con React + hooks
- Tailwind para todo el CSS — sin CSS modules ni estilos inline (excepto casos muy específicos)
- Manejo de errores explícito — nunca `catch (e) {}` vacío
- Cada función de Firebase debe tener manejo de offline (Firestore tiene soporte nativo)
- Comentarios en **español** — este proyecto es para un equipo hispanohablante

### Nunca
- No uses `any` en TypeScript sin justificación
- No hagas llamadas directas a Claude API desde el cliente — siempre a través de `/api/`
- No expongas Firebase Admin SDK en el cliente
- No uses `console.log` en producción — usa una utilidad de logging
- No guardes datos clínicos del paciente — mcFaro no es un sistema médico

### Patrones preferidos
- `useEffect` + `onSnapshot` de Firestore para datos en tiempo real
- Server Components de Next.js donde no haya interactividad
- `loading.tsx` y `error.tsx` en cada ruta
- Validación con Zod en formularios y endpoints de API

---

## Variables de entorno requeridas

```env
# Firebase (cliente)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (servidor)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Gemini API
GEMINI_API_KEY=

# FCM
NEXT_PUBLIC_FCM_VAPID_KEY=
```

---

## Modelo de datos (Firestore)

```
familias/{familiaId}
  - nombreCuidador: string
  - telefono: string
  - hospital: string
  - fechaIngreso: Timestamp
  - fechaSalida: Timestamp
  - tipoTratamiento: string  (oncologia | cardiologia | neurologia | otro)
  - casaRonald: string       (id de la casa)
  - rol: "cuidador" | "coordinador"

citas/{citaId}
  - familiaId: string
  - titulo: string
  - fecha: Timestamp
  - servicio: string         (consulta | estudio | procedimiento | otro)
  - recordatorio60: boolean
  - recordatorio15: boolean
  - notificacionEnviada: boolean

rutinas/{rutinaId}
  - familiaId: string
  - fecha: string            (YYYY-MM-DD)
  - contenido: string        (JSON generado por Claude)
  - generadaEn: Timestamp
```

---

## UX / Accesibilidad

- Diseñado para usarse **con un solo pulgar**, parado en un pasillo
- Tipografía mínima 16px, botones mínimo 48px de altura
- Evitar modales complejos — preferir pantallas completas
- Feedback visual inmediato en cada acción (skeleton loaders, toasts)
- Modo offline funcional para consultar citas y rutina del día
- Colores: paleta cálida, no clínica. El rojo de Ronald McDonald se usa con moderación

---

## Prompt base para rutinas (Claude API)

```
Eres un asistente empático para cuidadores de niños hospitalizados.
Genera una rutina diaria estructurada y gentil para un cuidador con las siguientes citas hoy: [CITAS].
La rutina debe incluir: momentos de alimentación, pausas de descanso, tiempo en el hospital y actividades simples para el niño.
Tono: cálido, breve, sin abrumar. Formato: JSON con bloques de hora y descripción.
Idioma: español.
```