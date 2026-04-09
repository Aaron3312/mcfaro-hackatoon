# mcFaro — Guiando Familias en Casa Ronald McDonald 🏠

<div align="center">

![mcFaro Logo](./public/icons/icon-faro.svg)

**Progressive Web App para cuidadores de niños hospitalizados**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.11-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)

[**Ver Demo**](#) · [**Reportar Bug**](https://github.com/tuusuario/mcfaro/issues) · [**Documentación**](./docs/)

</div>

---

## 👥 Equipo

**Nombre del equipo:** mcFaro

> Equipo formado para el Genius Arena Hackathon 2026 — Talent Land México, track Fundación Ronald McDonald.

| Nombre | GitHub |
|--------|--------|
| Miguel Cabral | [@tuusuario](https://github.com/tuusuario) |
| Aaron | [@Aaron3312](https://github.com/Aaron3312) |
| Banales | [@Banales2](https://github.com/Banales2) |
| Fer Cuevas | [@FerCuevasA](https://github.com/FerCuevasA) |

**Vigencia del equipo:** Marzo 2026 — Abril 2026

---

## 🎯 ¿Qué es mcFaro?

**mcFaro** es una Progressive Web App diseñada para **reducir la carga cognitiva** de las familias que se hospedan en Casas Ronald McDonald mientras sus hijos reciben tratamiento médico.

La app centraliza toda la información de la Casa: menús del día, actividades, transporte y recursos, en un solo lugar accesible desde el celular, con **notificaciones inteligentes** y **funcionamiento offline**.

> **Alcance:** mcFaro gestiona únicamente información y servicios propios de la Casa Ronald McDonald. No almacena datos clínicos ni se conecta con sistemas del hospital.

### Problemática que Resuelve

- 🤯 **Sobrecarga de información:** Los cuidadores reciben horarios, reglas y avisos dispersos en papeles, WhatsApp y pizarrones
- 🗺️ **Desorientación en la Casa:** Familias nuevas que no conocen los servicios, horarios ni espacios disponibles
- 🤝 **Aislamiento:** Familias que no saben que hay otras en situaciones similares hospedadas en la misma Casa

---

## 📖 Documentación Completa

Toda la documentación del proyecto está organizada en la carpeta [`docs/`](./docs/):

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [**📘 Visión y Problemática**](./docs/VISION.md) | Contexto, problemas que resuelve, impacto esperado | Jueces, stakeholders, equipo |
| [**🏗️ Arquitectura Técnica**](./docs/ARCHITECTURE.md) | Stack, justificación de tecnologías, escalabilidad | Desarrolladores, arquitectos |
| [**🧩 Componentes y Flujos**](./docs/COMPONENTS.md) | Hooks, componentes clave, patrones de diseño | Desarrolladores frontend |
| [**🔌 API y Servicios**](./docs/API.md) | Endpoints, Firebase, integraciones externas | Desarrolladores backend |

---

## ✨ Features Principales

### Para Cuidadores

- 📋 **Dashboard Centralizado:** Vista del día con próxima comida, próxima actividad y estado del transporte, todo desde la pantalla de inicio
- 🍽️ **Menú del Día:** Horarios de desayuno, comida y cena de la Casa; resalta la próxima comida automáticamente
- 🏃 **Actividades:** Talleres y eventos organizados por la Casa; registro y cancelación directa desde la app
- 🚌 **Transporte:** Solicitud de traslado Casa ↔ hospital; seguimiento del estado en tiempo real (pendiente → en camino → completado)
- 📚 **Recursos:** Reglamento, horarios de servicios y preguntas frecuentes de la Casa
- 👤 **Perfil:** Datos del cuidador, habitación asignada y días de estancia
- 🔔 **Notificaciones Push:** Avisos de comida lista, actividad próxima y transporte asignado
- 📴 **Modo Offline:** Consulta menú, actividades y recursos sin internet; sincroniza al reconectar

### Para Coordinadores

- 🏠 **Panel Principal:** Resumen de ocupación, actividades del día y solicitudes de transporte pendientes
- 👨‍👩‍👧 **Gestión de Familias:** Lista de familias activas con datos de hospedaje y habitación asignada
- 🛏️ **Habitaciones:** Asignación y liberación de habitaciones, historial de ocupantes y co-ocupación
- 🎨 **Actividades:** Publicar talleres y eventos con imagen, cupo máximo y control de asistencia
- 🚌 **Transporte:** Asignar vehículos y choferes a solicitudes; actualizar estado en tiempo real
- 🍽️ **Menú del Día:** Publicar el menú diario (desayuno, comida, cena) con horarios y descripción
- 📚 **Recursos:** Subir y editar documentos disponibles para las familias (reglamento, horarios, guías)
- 📊 **Reportes:** Estadísticas de ocupación, asistencia a actividades y uso del transporte
- 🔑 **Accesos:** Gestión de usuarios; cambiar roles y activar o suspender cuentas
- 📱 **Escanear QR:** Validación de credenciales de familias con cámara en tiempo real

---

## 🚀 Quick Start

### Prerrequisitos

- Node.js 18+ ([Descargar](https://nodejs.org/))
- npm, yarn, pnpm o bun
- Cuenta de Firebase ([Crear proyecto](https://console.firebase.google.com/))

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tuusuario/mcfaro-hackatoon.git
   cd mcfaro-hackatoon
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno:**

   Crear archivo `.env.local` en la raíz del proyecto:

   ```env
   # Firebase (Cliente)
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

   # Firebase Admin (Servidor)
   FIREBASE_ADMIN_PROJECT_ID=tu_proyecto_id
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@tu_proyecto.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   # Google Gemini API (Opcional - Fase 2)
   GEMINI_API_KEY=tu_gemini_api_key

   # FCM (Opcional - para push notifications)
   NEXT_PUBLIC_FCM_VAPID_KEY=tu_vapid_key
   ```

   > **Nota:** Copia las credenciales de Firebase Console → Configuración del proyecto → Cuentas de servicio

4. **Inicializar Firestore:**

   Crear colecciones en Firebase Console:
   - `familias`
   - `actividades`
   - `menus`
   - `solicitudesTransporte`
   - `habitaciones`
   - `recursos`
   - `comunidad`
   - `usuarios`

5. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16.2** — App Router, SSR, API Routes
- **React 19.2** — Hooks personalizados, Server Components
- **TypeScript 5** — Type safety end-to-end
- **Tailwind CSS 4** — Utility-first styling
- **GSAP 3.14** — Animaciones complejas (landing story)

### Backend & Database
- **Firebase Firestore** — NoSQL real-time database
- **Firebase Auth** — Autenticación por teléfono (SMS OTP)
- **Firebase Cloud Messaging** — Push notifications
- **Firebase Admin SDK** — Operaciones server-side

### PWA & Offline
- **next-pwa** — Service Workers, manifest.json
- **IndexedDB** — Persistencia offline (Firestore)

### IA & APIs
- **Google Gemini API** — Generación de rutinas (Fase 2)
- **libphonenumber-js** — Validación de teléfonos
- **date-fns** — Manipulación de fechas

### Justificación de Tecnologías

📄 **[Ver justificación completa](./docs/ARCHITECTURE.md#justificación-de-tecnologías)**

---

## 📁 Estructura del Proyecto

```
mcfaro-hackatoon/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Rutas de autenticación
│   │   ├── login/              # Login por teléfono
│   │   └── onboarding/         # Registro familiar
│   ├── (app)/                  # Área autenticada
│   │   ├── dashboard/          # Vista principal del cuidador
│   │   ├── actividades/        # Talleres y eventos de la Casa
│   │   ├── transporte/         # Solicitud de traslado Casa ↔ hospital
│   │   ├── recursos/           # Reglamento y FAQ de la Casa
│   │   ├── mapa/               # Plano de la Casa Ronald McDonald
│   │   ├── perfil/             # Perfil del cuidador
│   │   ├── comunidad/          # Mensajes entre familias hospedadas
│   │   └── coordinador/        # Panel del staff
│   │       ├── familias/       # Gestión de familias activas
│   │       ├── habitaciones/   # Asignación de habitaciones
│   │       ├── actividades/    # Publicar talleres y eventos
│   │       ├── transporte/     # Asignar vehículos y choferes
│   │       ├── recursos/       # Subir documentos para familias
│   │       ├── reportes/       # Estadísticas de la Casa
│   │       ├── accesos/        # Gestión de usuarios y roles
│   │       ├── usuarios/       # Lista y administración de cuentas
│   │       └── escanear/       # Validación QR de credenciales
│   └── api/                    # API Routes (server-only)
│       ├── notificaciones/     # FCM push
│       ├── actividades/        # CRUD actividades
│       ├── transporte/         # Gestión transporte
│       └── menu/               # Publicación menús diarios
│
├── components/                 # Componentes reutilizables
│   ├── ui/                     # Componentes base (Button, Toast, etc.)
│   ├── dashboard/              # Widgets del dashboard
│   ├── calendario/             # Componentes calendario
│   ├── menu/                   # Componentes menú
│   └── ...
│
├── hooks/                      # Custom hooks
│   ├── useAuth.ts              # Autenticación + datos familia
│   ├── useCitas.ts             # CRUD citas médicas
│   ├── useDashboard.ts         # Agregación dashboard
│   ├── useActividades.ts       # Gestión actividades
│   └── ...
│
├── contexts/                   # React Contexts
│   └── SidebarContext.tsx      # Estado sidebar coordinador
│
├── lib/                        # Utilidades y configuración
│   ├── firebase.ts             # Cliente Firebase (browser)
│   ├── firebase-admin.ts       # Admin SDK (server)
│   ├── types.ts                # Contratos TypeScript
│   ├── notificaciones.ts       # Helpers FCM
│   └── ...
│
├── public/                     # Assets estáticos
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   └── icons/                  # Iconos PWA
│
├── docs/                       # Documentación
│   ├── VISION.md               # Visión y problemática
│   ├── ARCHITECTURE.md         # Arquitectura técnica
│   ├── COMPONENTS.md           # Componentes clave
│   └── API.md                  # Endpoints y servicios
│
├── CLAUDE.md                   # Reglas y guía del proyecto
├── plan.md                     # Plan maestro de desarrollo
└── README.md                   # Este archivo
```

---

## 🧪 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build de producción
npm run start        # Iniciar servidor de producción
npm run lint         # Linter ESLint
npm run type-check   # Verificar tipos TypeScript

# Limpieza
npm run clean        # Limpiar .next y node_modules/.cache
```

### Convenciones de Código

- **TypeScript estricto:** `"strict": true` en `tsconfig.json`
- **Naming:**
  - Componentes: PascalCase (`BottomNav.tsx`)
  - Hooks: camelCase con prefijo `use` (`useAuth.ts`)
  - Archivos: kebab-case para utilidades (`firebase-admin.ts`)
- **Imports:** Usar alias `@/*` para imports absolutos
- **Comentarios:** En español (proyecto para equipo hispanohablante)
- **No usar `any`:** Siempre tipar correctamente
- **No console.log:** Usar `lib/logger.ts`

---

## 🌐 Deploy

### Vercel (Recomendado)

1. **Conectar repositorio:**
   - Ir a [vercel.com/new](https://vercel.com/new)
   - Importar repositorio de GitHub

2. **Configurar variables de entorno:**
   - Agregar todas las variables de `.env.local`
   - Marcar `FIREBASE_ADMIN_PRIVATE_KEY` como sensible

3. **Deploy:**
   ```bash
   npm run build
   vercel --prod
   ```

### Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar
firebase init hosting

# Deploy
npm run build
firebase deploy --only hosting
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guidelines

- Seguir convenciones de código
- Escribir tests para nuevas features (futuro)
- Actualizar documentación si es necesario
- Mantener commits atómicos y descriptivos

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo [LICENSE](./LICENSE) para más detalles.

---

## 🏆 Hackathon

**Proyecto desarrollado para:**
- **Evento:** Genius Arena Hackathon 2026 — Talent Land México
- **Track:** Care beyond the hospitality — Fundación Ronald McDonald
- **Fecha de entrega:** 8 de abril de 2026, 8:00 p.m.

---

## 📞 Contacto

- **Email:** contacto@acsoftwarelabs.com
- **Sitio Web:** [acsoftwarelabs.com](https://acsoftwarelabs.com)

---

<div align="center">

**Hecho con ❤️ para cuidadores que cuidan**

[⬆ Volver arriba](#mcfaro--guiando-familias-en-casa-ronald-mcdonald-)

</div>
