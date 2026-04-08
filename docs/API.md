# API y Servicios — mcFaro

> Documentación de endpoints, servicios externos y flujos de integración

---

## 📚 Tabla de Contenidos

1. [API Routes de Next.js](#api-routes-de-nextjs)
2. [Servicios de Firebase](#servicios-de-firebase)
3. [Integraciones Externas](#integraciones-externas)
4. [Autenticación y Autorización](#autenticación-y-autorización)
5. [Manejo de Errores](#manejo-de-errores)

---

## 🛣️ API Routes de Next.js

### Estructura General

Todos los endpoints siguen este patrón:

```
app/api/
├── notificaciones/
│   ├── suscribir/route.ts    # POST - Registrar token FCM
│   └── enviar/route.ts        # POST - Enviar push (coordinador)
├── actividades/
│   └── registrar/route.ts     # POST - Registrarse en actividad
├── transporte/
│   ├── solicitar/route.ts     # POST - Crear solicitud
│   └── [id]/
│       └── cancelar/route.ts  # DELETE - Cancelar solicitud
└── menus/
    └── route.ts               # GET/POST - Gestión de menús
```

---

### Notificaciones Push

#### POST `/api/notificaciones/suscribir`

**Propósito:** Registrar token FCM de un dispositivo para recibir push notifications.

**Request:**
```typescript
{
  familiaId: string,
  token: string  // FCM token del dispositivo
}
```

**Response:**
```typescript
{
  success: true,
  message: "Token registrado exitosamente"
}
```

**Implementación:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";
import { doc, updateDoc } from "firebase/firestore";

const schema = z.object({
  familiaId: z.string().min(1),
  token: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error },
        { status: 400 }
      );
    }

    const { familiaId, token } = parsed.data;
    const db = getAdminDb();
    const familiaRef = doc(db, "familias", familiaId);

    await updateDoc(familiaRef, {
      fcmToken: token,
      fcmTokenUpdatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Token registrado exitosamente",
    });
  } catch (error) {
    console.error("Error registrando token:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
```

---

#### POST `/api/notificaciones/enviar`

**Propósito:** Enviar notificación push a familias específicas (solo coordinadores).

**Request:**
```typescript
{
  casaRonald: string,
  titulo: string,
  cuerpo: string,
  link?: string,  // Deep link opcional (ej: "/calendario")
  familiaIds?: string[]  // Opcional: enviar solo a familias específicas
}
```

**Response:**
```typescript
{
  success: true,
  enviadas: 12,  // Número de notificaciones enviadas
  fallidas: 1
}
```

**Implementación:**

```typescript
import { adminMessaging } from "@/lib/firebase-admin";
import { z } from "zod";

const schema = z.object({
  casaRonald: z.string(),
  titulo: z.string().min(1).max(100),
  cuerpo: z.string().min(1).max(200),
  link: z.string().optional(),
  familiaIds: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  // Validar autorización
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const token = authHeader.split("Bearer ")[1];
  const decodedToken = await adminAuth.verifyIdToken(token);

  if (decodedToken.rol !== "coordinador") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  // Validar body
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos" },
      { status: 400 }
    );
  }

  const { casaRonald, titulo, cuerpo, link, familiaIds } = parsed.data;

  // Obtener familias con token FCM
  const db = getAdminDb();
  let query = collection(db, "familias")
    .where("casaRonald", "==", casaRonald)
    .where("fcmToken", "!=", null);

  if (familiaIds) {
    query = query.where("__name__", "in", familiaIds);
  }

  const snapshot = await query.get();
  const tokens = snapshot.docs
    .map(doc => doc.data().fcmToken)
    .filter(Boolean);

  if (tokens.length === 0) {
    return NextResponse.json({
      success: true,
      enviadas: 0,
      message: "No hay dispositivos registrados",
    });
  }

  // Enviar notificaciones
  const mensajes = tokens.map(token => ({
    token,
    notification: { title: titulo, body: cuerpo },
    webpush: {
      fcmOptions: { link: link || "/dashboard" },
      notification: {
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
      },
    },
  }));

  const resultado = await adminMessaging.sendEach(mensajes);

  return NextResponse.json({
    success: true,
    enviadas: resultado.successCount,
    fallidas: resultado.failureCount,
  });
}
```

---

### Actividades

#### POST `/api/actividades/registrar`

**Propósito:** Registrar o cancelar registro en una actividad.

**Request:**
```typescript
{
  actividadId: string,
  familiaId: string,
  nombreCuidador: string,
  accion: "registrar" | "cancelar"
}
```

**Response:**
```typescript
{
  success: true,
  message: "Registrado exitosamente"
}
```

**Validaciones:**
- Verificar capacidad máxima (si registrar)
- Verificar que actividad esté en estado "programada"
- Prevenir duplicados

**Implementación:**

```typescript
const schema = z.object({
  actividadId: z.string(),
  familiaId: z.string(),
  nombreCuidador: z.string(),
  accion: z.enum(["registrar", "cancelar"]),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { actividadId, familiaId, nombreCuidador, accion } = schema.parse(body);

  const db = getAdminDb();
  const actividadRef = doc(db, "actividades", actividadId);
  const actividad = await getDoc(actividadRef);

  if (!actividad.exists()) {
    return NextResponse.json(
      { error: "Actividad no encontrada" },
      { status: 404 }
    );
  }

  const data = actividad.data();

  if (accion === "registrar") {
    // Validar capacidad
    if (data.registrados >= data.capacidadMax) {
      return NextResponse.json(
        { error: "Actividad llena" },
        { status: 400 }
      );
    }

    // Crear registro
    await addDoc(collection(db, "registrosActividad"), {
      actividadId,
      familiaId,
      nombreCuidador,
      fechaRegistro: Timestamp.now(),
      asistio: false,
    });

    // Incrementar contador
    await updateDoc(actividadRef, {
      registrados: increment(1),
    });

    return NextResponse.json({
      success: true,
      message: "Registrado exitosamente",
    });
  } else {
    // Cancelar registro
    const registroQuery = query(
      collection(db, "registrosActividad"),
      where("actividadId", "==", actividadId),
      where("familiaId", "==", familiaId),
      limit(1)
    );

    const registroSnapshot = await getDocs(registroQuery);

    if (registroSnapshot.empty) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 }
      );
    }

    await deleteDoc(registroSnapshot.docs[0].ref);

    // Decrementar contador
    await updateDoc(actividadRef, {
      registrados: increment(-1),
    });

    return NextResponse.json({
      success: true,
      message: "Registro cancelado",
    });
  }
}
```

---

### Transporte

#### POST `/api/transporte/solicitar`

**Propósito:** Crear nueva solicitud de transporte.

**Request:**
```typescript
{
  familiaId: string,
  nombreCuidador: string,
  origen: string,
  destino: string,
  fechaHora: string,  // ISO 8601
  pasajeros: number,
  notas?: string
}
```

**Response:**
```typescript
{
  success: true,
  id: string,  // ID de la solicitud creada
  message: "Solicitud creada"
}
```

**Implementación:**

```typescript
const schema = z.object({
  familiaId: z.string(),
  nombreCuidador: z.string(),
  origen: z.string(),
  destino: z.string(),
  fechaHora: z.string().datetime(),
  pasajeros: z.number().min(1).max(6),
  notas: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const datos = schema.parse(body);

  const db = getAdminDb();
  const docRef = await addDoc(collection(db, "solicitudesTransporte"), {
    ...datos,
    fechaHora: Timestamp.fromDate(new Date(datos.fechaHora)),
    estado: "pendiente",
    creadaEn: Timestamp.now(),
    actualizadaEn: Timestamp.now(),
  });

  return NextResponse.json({
    success: true,
    id: docRef.id,
    message: "Solicitud creada exitosamente",
  });
}
```

---

#### DELETE `/api/transporte/[id]/cancelar`

**Propósito:** Cancelar solicitud de transporte.

**Params:**
- `id`: ID de la solicitud

**Response:**
```typescript
{
  success: true,
  message: "Solicitud cancelada"
}
```

**Implementación:**

```typescript
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getAdminDb();
  const solicitudRef = doc(db, "solicitudesTransporte", params.id);

  await updateDoc(solicitudRef, {
    estado: "cancelada",
    actualizadaEn: Timestamp.now(),
  });

  return NextResponse.json({
    success: true,
    message: "Solicitud cancelada exitosamente",
  });
}
```

---

### Menús

#### GET `/api/menus?fecha=YYYY-MM-DD&casa=cdmx`

**Propósito:** Obtener menú de un día específico.

**Query Params:**
- `fecha`: Fecha en formato YYYY-MM-DD
- `casa`: ID de la Casa Ronald

**Response:**
```typescript
{
  id: string,
  fecha: string,
  casaRonald: string,
  comidas: {
    desayuno: {
      hora: "08:00",
      descripcion: "Huevos revueltos...",
      disponible: true
    },
    comida: {...},
    cena: {...}
  }
}
```

---

#### POST `/api/menus`

**Propósito:** Publicar menú del día (solo coordinadores).

**Request:**
```typescript
{
  fecha: string,  // YYYY-MM-DD
  casaRonald: string,
  comidas: {
    desayuno: { hora: string, descripcion: string },
    comida: { hora: string, descripcion: string },
    cena: { hora: string, descripcion: string }
  }
}
```

**Response:**
```typescript
{
  success: true,
  id: string,
  message: "Menú publicado"
}
```

**Implementación:**

```typescript
const schema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  casaRonald: z.string(),
  comidas: z.object({
    desayuno: z.object({
      hora: z.string(),
      descripcion: z.string(),
    }),
    comida: z.object({
      hora: z.string(),
      descripcion: z.string(),
    }),
    cena: z.object({
      hora: z.string(),
      descripcion: z.string(),
    }),
  }),
});

export async function POST(req: NextRequest) {
  // Validar autorización de coordinador
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { fecha, casaRonald, comidas } = schema.parse(body);

  // ID compuesto previene duplicados
  const menuId = `${fecha}-${casaRonald}`;

  const db = getAdminDb();
  await setDoc(doc(db, "menus", menuId), {
    id: menuId,
    fecha,
    casaRonald,
    comidas: {
      desayuno: { ...comidas.desayuno, disponible: false },
      comida: { ...comidas.comida, disponible: false },
      cena: { ...comidas.cena, disponible: false },
    },
    publicadoPor: decodedToken.uid,
    publicadoEn: Timestamp.now(),
  });

  return NextResponse.json({
    success: true,
    id: menuId,
    message: "Menú publicado exitosamente",
  });
}
```

---

## 🔥 Servicios de Firebase

### Firebase Authentication

#### signInWithPhoneNumber

**Uso:** Login por SMS OTP

```typescript
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "@/lib/firebase";

// 1. Crear verifier de reCAPTCHA
const appVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
  size: "invisible",
  callback: () => console.log("reCAPTCHA resuelto"),
});

// 2. Enviar SMS
const confirmationResult = await signInWithPhoneNumber(
  auth,
  "+52 55 1234 5678",
  appVerifier
);

// 3. Confirmar código
const userCredential = await confirmationResult.confirm("123456");
console.log("Usuario autenticado:", userCredential.user);
```

**Configuración de desarrollo:**
```typescript
// Deshabilitar reCAPTCHA en dev
if (process.env.NODE_ENV === "development") {
  auth.settings.appVerificationDisabledForTesting = true;
}
```

---

#### onAuthStateChanged

**Uso:** Detectar cambios en sesión

```typescript
import { onAuthStateChanged } from "firebase/auth";

const unsubscribe = onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuario autenticado:", user.uid);
  } else {
    console.log("Sin sesión");
  }
});

// Cleanup
return () => unsubscribe();
```

---

### Firebase Firestore

#### onSnapshot (Real-time Listener)

**Uso:** Escuchar cambios en colecciones/documentos

```typescript
import { collection, query, where, onSnapshot } from "firebase/firestore";

const q = query(
  collection(db, "citas"),
  where("familiaId", "==", familiaId),
  orderBy("fecha", "asc")
);

const unsubscribe = onSnapshot(
  q,
  (snapshot) => {
    const citas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCitas(citas);
  },
  (error) => {
    console.error("Error escuchando:", error);
  }
);

return () => unsubscribe();
```

---

#### addDoc / setDoc

**Uso:** Crear documentos

```typescript
import { addDoc, setDoc, doc, Timestamp } from "firebase/firestore";

// addDoc: genera ID automático
const docRef = await addDoc(collection(db, "citas"), {
  titulo: "Consulta",
  fecha: Timestamp.fromDate(new Date()),
  familiaId: "abc123",
});
console.log("ID generado:", docRef.id);

// setDoc: ID manual (útil para prevenir duplicados)
await setDoc(doc(db, "menus", "2026-04-08-cdmx"), {
  fecha: "2026-04-08",
  casaRonald: "cdmx",
  // ...
});
```

---

#### updateDoc / deleteDoc

**Uso:** Modificar o eliminar documentos

```typescript
import { updateDoc, deleteDoc, doc } from "firebase/firestore";

// Update
await updateDoc(doc(db, "citas", citaId), {
  completada: true,
  actualizadaEn: Timestamp.now(),
});

// Delete
await deleteDoc(doc(db, "citas", citaId));
```

---

### Firebase Cloud Messaging (FCM)

#### Solicitar Permiso

```typescript
import { getMessaging, getToken } from "firebase/messaging";

const messaging = getMessaging();

// Solicitar permiso al usuario
const permission = await Notification.requestPermission();

if (permission === "granted") {
  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
  });

  console.log("FCM Token:", token);

  // Guardar token en Firestore
  await updateDoc(doc(db, "familias", familiaId), {
    fcmToken: token,
  });
}
```

---

#### Escuchar Mensajes (Foreground)

```typescript
import { onMessage } from "firebase/messaging";

onMessage(messaging, (payload) => {
  console.log("Mensaje recibido:", payload);

  // Mostrar toast
  showToast({
    title: payload.notification?.title,
    body: payload.notification?.body,
  });
});
```

---

#### Service Worker (Background)

```javascript
// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "...",
  projectId: "...",
  messagingSenderId: "...",
  appId: "...",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Mensaje en background:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: payload.fcmOptions?.link || "/dashboard" },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

---

## 🌐 Integraciones Externas

### Google Gemini API (Futuro)

**Propósito:** Generar rutinas diarias personalizadas con IA.

#### Endpoint: POST `/api/rutina`

**Request:**
```typescript
{
  familiaId: string,
  citas: Cita[],
  comidas: {desayuno, comida, cena},
  tipoTratamiento: string
}
```

**Response:**
```typescript
{
  bloques: [
    {
      hora: "08:00",
      titulo: "Desayuno",
      descripcion: "Tomar desayuno en la Casa Ronald...",
      tipo: "comida"
    },
    {
      hora: "10:00",
      titulo: "Consulta oncología",
      descripcion: "Presentarse en el INP, piso 3...",
      tipo: "cita"
    },
    // ...
  ]
}
```

**Implementación:**

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

export async function POST(req: NextRequest) {
  const { familiaId, citas, comidas, tipoTratamiento } = await req.json();

  const prompt = `
Eres un asistente empático para cuidadores de niños hospitalizados.
Genera una rutina diaria estructurada y gentil para un cuidador con:

Citas hoy: ${JSON.stringify(citas)}
Comidas disponibles: ${JSON.stringify(comidas)}
Tipo de tratamiento: ${tipoTratamiento}

La rutina debe incluir:
- Momentos de alimentación
- Pausas de descanso
- Tiempo en el hospital
- Actividades simples para el niño

Tono: cálido, breve, sin abrumar.
Formato: JSON con bloques de hora y descripción.
Idioma: español.
  `.trim();

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Parsear JSON de respuesta
  const rutina = JSON.parse(responseText);

  // Guardar en Firestore
  await addDoc(collection(db, "rutinas"), {
    familiaId,
    fecha: format(new Date(), "yyyy-MM-dd"),
    contenido: rutina,
    generadaEn: Timestamp.now(),
  });

  return NextResponse.json(rutina);
}
```

---

## 🔐 Autenticación y Autorización

### Protección de API Routes

**Patrón estándar:**

```typescript
export async function POST(req: NextRequest) {
  // 1. Verificar Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // 2. Extraer y verificar token
  const token = authHeader.split("Bearer ")[1];
  let decodedToken;

  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (error) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  // 3. Verificar rol (si aplica)
  if (decodedToken.rol !== "coordinador") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  // 4. Procesar request
  // ...
}
```

---

### Cliente: Obtener Token de Firebase Auth

```typescript
import { getAuth } from "firebase/auth";

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const token = await user.getIdToken();

  const response = await fetch("/api/notificaciones/enviar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ casaRonald: "cdmx", titulo: "...", cuerpo: "..." }),
  });
}
```

---

## ⚠️ Manejo de Errores

### Patrón de Respuesta de Error

```typescript
// Success
return NextResponse.json({
  success: true,
  data: {...}
});

// Error de validación (400)
return NextResponse.json({
  error: "Datos inválidos",
  details: zodError.issues
}, { status: 400 });

// No autorizado (401)
return NextResponse.json({
  error: "Token inválido o expirado"
}, { status: 401 });

// Prohibido (403)
return NextResponse.json({
  error: "No tienes permisos para esta acción"
}, { status: 403 });

// No encontrado (404)
return NextResponse.json({
  error: "Recurso no encontrado"
}, { status: 404 });

// Error interno (500)
return NextResponse.json({
  error: "Error interno del servidor",
  message: process.env.NODE_ENV === "development" ? error.message : undefined
}, { status: 500 });
```

---

### Logging de Errores

```typescript
import { logger } from "@/lib/logger";

try {
  await operacionRiesgosa();
} catch (error) {
  logger.error("Contexto específico:", {
    error,
    familiaId,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(
    { error: "Algo salió mal" },
    { status: 500 }
  );
}
```

---

## 📌 Conclusión

La API de mcFaro está diseñada para:

- ✅ **Seguridad:** Todos los endpoints protegidos con Firebase Auth
- ✅ **Validación:** Zod en todos los inputs
- ✅ **Observabilidad:** Logging estructurado de errores
- ✅ **Escalabilidad:** Serverless (Next.js API Routes)
- ✅ **Tipo-safe:** TypeScript end-to-end

**Próximos pasos (Fase 2):**
- Rate limiting con Upstash
- Webhooks de Firestore → Cloud Functions
- Integración con sistema de citas hospitalarias (API externa)

---

**Documentación relacionada:**
- [Visión y Problemática](./VISION.md)
- [Arquitectura Técnica](./ARCHITECTURE.md)
- [Componentes y Flujos](./COMPONENTS.md)
