# Visión y Problemática — mcFaro

> **"Cuidar al cuidador para que pueda seguir cuidando"**

---

## 🎯 Visión del Proyecto

**mcFaro** es una Progressive Web App diseñada para transformar la experiencia de las familias que se hospedan en Casas Ronald McDonald mientras sus hijos reciben tratamiento médico. Nuestro objetivo es convertir el caos y la sobrecarga cognitiva en claridad, organización y bienestar.

### ¿Qué buscamos lograr?

- **Reducir la carga mental** de los cuidadores consolidando toda la información crítica en un solo lugar
- **Prevenir olvidos** que puedan afectar el tratamiento (citas médicas, medicamentos, comidas)
- **Fomentar el autocuidado** recordando a los cuidadores que también necesitan descansar y alimentarse
- **Crear comunidad** conectando a familias que atraviesan situaciones similares
- **Empoderar a las familias** dándoles control y visibilidad sobre su día a día

---

## 📊 La Problemática

### Contexto Real

Una familia con un hijo hospitalizado enfrenta una crisis simultánea en múltiples dimensiones:

#### 1. **Crisis Emocional**
- Angustia constante por el estado de salud del niño
- Culpa por no poder "hacer más"
- Miedo al futuro y a lo desconocido
- Aislamiento social (lejos de familia y amigos)

#### 2. **Crisis Operativa**
- **Sobrecarga de información:** Múltiples citas, horarios, estudios, medicamentos
- **Falta de coordinación:** Información dispersa en papelitos, WhatsApp, emails
- **Olvidos frecuentes:** "¿A qué hora era la consulta?" "¿Ya comí hoy?"
- **Desorientación:** "¿Dónde queda el laboratorio?" "¿Cómo pido transporte?"

#### 3. **Crisis de Autocuidado**
- Cuidadores que **se saltan comidas** porque "no tienen tiempo"
- Cuidadores que **no duermen bien** por vigilar al niño
- Cuidadores que **no piden ayuda** porque "otros lo necesitan más"
- Burnout físico y emocional progresivo

---

## 🔍 Problemas Específicos que Resuelve mcFaro

### 1. Información Dispersa y Caótica

**Antes:**
- Citas en papeles sueltos
- Horarios del hospital en un papel diferente
- Menú del día en la pared de la cocina (si es que lo vieron)
- Actividades anunciadas en grupos de WhatsApp
- Coordinación de transporte vía llamadas telefónicas

**Con mcFaro:**
- **Un dashboard centralizado** que muestra TODO lo del día
- **Notificaciones push** cuando algo está listo (comida, transporte)
- **Calendario integrado** con todas las citas y actividades
- **Acceso offline** a la información esencial

---

### 2. Olvidos Críticos

**Situación real:**
- Un cuidador pasa 8 horas en el hospital esperando resultados
- Olvida regresar a la Casa Ronald a comer (la comida se sirve solo en horarios fijos)
- Se queda sin comer todo el día porque "ya pasó el horario"
- Al día siguiente está más débil para cuidar a su hijo

**Solución mcFaro:**
- **Notificación push 30 min antes:** "🍽️ La comida estará lista a las 2:00 PM"
- **Badge prominente "GRATUITO ❤️"** en cada comida (muchos cuidadores sienten culpa por "gastar")
- **Recordatorios de autocuidado contextuales:** "¿Ya tomaste agua?" "¿Comiste algo hoy?"

---

### 3. Desorientación en el Hospital

**Situación real:**
- Familia recién llegada no sabe dónde queda el laboratorio
- Pierde 20 minutos preguntando, llega tarde a la cita
- Genera estrés y frustración innecesarios

**Solución mcFaro:**
- **Mapa interactivo** del hospital con puntos de interés
- **Deep links a Google Maps** para rutas precisas
- **Información contextual** de cada ubicación (horarios, servicios)

---

### 4. Falta de Comunidad y Apoyo

**Situación real:**
- Familias que comparten el mismo diagnóstico no se conocen entre sí
- Pierden oportunidad de compartir experiencias, tips, apoyo emocional
- Sensación de soledad: "Nadie entiende por lo que estoy pasando"

**Solución mcFaro:**
- **Grupos de apoyo temáticos** (oncología, cardiología, neurología)
- **Chat moderado** para compartir experiencias y consejos
- **Privacidad garantizada:** solo familias de la misma Casa Ronald

---

### 5. Desconexión entre Coordinadores y Familias

**Situación real:**
- Coordinador publica actividad en pizarrón físico
- Familias que están en el hospital no se enteran
- Actividad queda vacía o con poca asistencia

**Solución mcFaro:**
- **Notificaciones push** cuando se publica nueva actividad
- **Registro digital** para reservar cupo desde el celular
- **Panel coordinador** para ver en tiempo real quién se registró

---

## 💡 Enfoque de Diseño: Empatía Primero

### Principios de Diseño

1. **Diseñado para usarse con un pulgar, parado en un pasillo**
   - Botones grandes (≥48px)
   - Texto legible (≥16px)
   - Sin menús complejos ni acciones escondidas

2. **Feedback inmediato en cada acción**
   - Skeleton loaders mientras carga
   - Toasts de confirmación
   - Estados visuales claros (cargando, éxito, error)

3. **Lenguaje cálido y empático**
   - "Hola, María 👋" en lugar de "Bienvenido, usuario"
   - "¿Ya comiste algo hoy?" en lugar de "Recordatorio: alimentación"
   - "Tu día de hoy" en lugar de "Agenda del usuario"

4. **Colores no clínicos**
   - Paleta cálida (naranjas, amarillos, beige)
   - Evitar blanco hospital estéril
   - Uso moderado del rojo de Ronald McDonald

5. **Funciona sin internet**
   - Modo offline funcional para consultar información
   - Sincronización automática al reconectar
   - Banner discreto de "sin conexión"

---

## 🎯 Impacto Esperado

### Métricas de Éxito (Fase 1 - 3 meses)

#### Operativas
- **90%** de las citas médicas NO olvidadas (vs. ~70% baseline)
- **80%** de asistencia a comidas en horario (vs. ~50% baseline)
- **60%** de familias utilizan transporte digital (vs. 100% telefónico)

#### Bienestar
- **75%** de cuidadores reportan "menos estrés por organización"
- **50%** de cuidadores usan módulo "Respira" al menos 1 vez por semana
- **40%** de familias participan en grupos de comunidad

#### Técnicas
- **95%** disponibilidad del sistema (uptime)
- **<3 segundos** tiempo de carga promedio
- **100%** funcionalidad offline de features críticos

---

### Impacto a Largo Plazo

1. **Escalabilidad nacional:**
   - Implementación en las 15 Casas Ronald de México
   - Adaptación para otros países de LATAM

2. **Modelo replicable:**
   - Framework que otras organizaciones de apoyo puedan adoptar
   - Open-source para hospitales pediátricos

3. **Datos para mejora continua:**
   - Analytics anónimos para optimizar horarios de comida
   - Feedback sobre servicios más necesitados
   - Identificar patrones de necesidades por tipo de tratamiento

---

## 🌟 Diferenciadores Clave

### ¿Por qué mcFaro y no solo WhatsApp o Excel?

| Aspecto | WhatsApp/Excel | mcFaro |
|---------|----------------|--------|
| **Notificaciones** | Fácil perder mensajes en grupos activos | Push notifications personalizadas por evento |
| **Organización** | Información dispersa en múltiples chats | Dashboard centralizado y estructurado |
| **Offline** | Requiere conexión constante | Funciona sin internet, sincroniza después |
| **Privacidad** | Números telefónicos expuestos | Login seguro, datos encriptados |
| **Escalabilidad** | Administración manual por coordinador | Automatización de recordatorios y alertas |
| **Comunidad** | Grupos no moderados, sin estructura | Grupos temáticos, moderados, seguros |

---

## 🚀 Visión a Futuro

### Fase 2 (6-12 meses)
- **Integración con IA:** Asistente conversacional (chatbot) para responder dudas 24/7
- **Rutinas personalizadas:** Gemini API genera rutinas diarias basadas en citas y tratamiento
- **Telemedicina ligera:** Recordatorios de medicamentos (no recetas, solo recordatorios)
- **Multi-idioma:** Soporte para comunidades indígenas

### Fase 3 (12-24 meses)
- **Expansión regional:** Todas las Casas Ronald de México
- **APIs con hospitales:** Sincronización automática de citas (con consentimiento)
- **Credenciales digitales:** QR para check-in rápido en hospital
- **Analytics predictivos:** Identificar familias en riesgo de burnout

---

## 🤝 Alianzas Estratégicas

- **Fundación Ronald McDonald:** Partner principal, validación de necesidades
- **Hospitales pediátricos:** Validación clínica, posible integración de sistemas
- **Google for Nonprofits:** Créditos GCP para hosting, Gemini API
- **ONG de salud mental:** Validación de módulo "Respira" y contenido de bienestar

---

## 📌 Conclusión

mcFaro no es solo una app, es **un faro de claridad en medio de la tormenta emocional y operativa** que viven las familias con hijos hospitalizados.

Cada funcionalidad está diseñada con empatía profunda, basada en investigación cualitativa con cuidadores reales. No asumimos qué necesitan las familias — **escuchamos, observamos y diseñamos en consecuencia**.

El éxito de mcFaro se medirá no solo en métricas técnicas, sino en **lágrimas evitadas, comidas no saltadas, y cuidadores que sienten que alguien finalmente cuida de ellos**.

---

**Documentación relacionada:**
- [Arquitectura Técnica](./ARCHITECTURE.md)
- [Componentes y Flujos](./COMPONENTS.md)
- [API y Servicios](./API.md)
