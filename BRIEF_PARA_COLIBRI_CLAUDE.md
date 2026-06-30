# Brief para chat Claude · Colibri

*Documento de hand-off del chat de Simio Plateado al chat de Colibri. Incluye todas las decisiones, credenciales públicas y configuración que afectan a Colibri tomadas durante la sesión del 17-18 de mayo de 2026.*

---

## 0 · Contexto rápido

En el chat de Simio Plateado tomamos una serie de decisiones de pagos y arquitectura que afectan a Colibri. Este brief te pone al día como un solo bloque para que puedas continuar desde aquí sin reconstruir el contexto.

**TL;DR**:

1. Se descartó Stripe (no opera en Colombia) y MoR digitales (Polar, Lemon Squeezy) tras evaluación.
2. PayPal Business de Anti Real Labs S.A.S. quedó aprobada y se decidió usarla para AMBOS productos.
3. Para Colibri se creó una app PayPal dedicada y dos Billing Plans (mensual y anual).
4. Se decidió un **modelo freemium con 30 días gratis SIN tarjeta**, doctrinalmente justificado.
5. Al revisar las env vars de Cloudflare, descubrimos que Colibri **ya tiene Better Auth + Google/Facebook OAuth + D1 SQL** configurado — entonces NO hay que construir auth desde cero.
6. Cloudflare KV namespace, bindings y env vars de PayPal/JWT/email ya están cargados en el proyecto `colibri`.

---

## 1 · Credenciales y configuración cargada en Cloudflare

### 1.1 · Apps PayPal creadas (modo Live, producción)

| App                      | Para qué              | Client ID (público)                                                                |
|--------------------------|-----------------------|------------------------------------------------------------------------------------|
| Colibri Subscriptions    | Suscripciones Colibri | `AafSyusTuCSxYfTwoI1bAo_7IaeClP3ygMUG3FmGjtEXP2sF0F0rMZmud16_QWQjB2i7uPIfHta36EcX` |
| Simio Plateado Checkout  | Compras únicas Simio  | `AZlzi0Y3rUJCP2YKJCinFHgmv-VDXuY4M90I3qWliqkN4UiKVv6GAMUOLQGQWkSXCZ7k9BWW-cs4gTPy` |

(El segundo no te toca, pero lo incluyo para que sepas que existe otra app PayPal del mismo dueño.)

### 1.2 · Billing Plans de Colibri

| Plan              | Plan ID                              | Precio        |
|-------------------|--------------------------------------|---------------|
| Colibri Mensual   | `P-44930247HK497823KNIFJMII`         | USD 4.99/mes  |
| Colibri Anual     | `P-7BC26124CP186415RNIFJOEY`         | USD 39.99/año |

Ambos planes:
- Sin trial nativo de PayPal (el trial lo manejamos nosotros antes de mostrar PayPal)
- Sin impuestos calculados por PayPal
- Facturación automática de pagos pendientes activada
- Ciclos perdidos antes de pause: mensual = 3, anual = 1

### 1.3 · Env vars cargadas en proyecto Cloudflare `colibri` (producción)

```
APP_ENV                  = production                   (pre-existente)
BASE_URL                 = https://colibripdf.com       (pre-existente)
BETTER_AUTH_SECRET       = [encrypted]                  (pre-existente)
DEMO_MODE                = false                        (pre-existente)
EMAIL_FROM               = "Colibri <contacto@colibripdf.com>"
FACEBOOK_CLIENT_ID       = [encrypted]                  (pre-existente)
FACEBOOK_CLIENT_SECRET   = [encrypted]                  (pre-existente)
GOOGLE_CLIENT_ID         = [encrypted]                  (pre-existente)
GOOGLE_CLIENT_SECRET     = [encrypted]                  (pre-existente)
JWT_SECRET               = [encrypted]                  (nuevo, generado con openssl rand -hex 64)
MAGIC_LINK_BASE_URL      = https://colibripdf.com
MODEL_PROVIDER           = workers-ai                   (pre-existente)
PAYPAL_CLIENT_ID         = Aafs...EcX                   (público, ver tabla 1.1)
PAYPAL_ENV               = production
PAYPAL_PLAN_ANUAL        = P-7BC26124CP186415RNIFJOEY
PAYPAL_PLAN_MENSUAL      = P-44930247HK497823KNIFJMII
PAYPAL_SECRET            = [encrypted]
TRIAL_DURATION_DAYS      = 30
```

### 1.4 · Bindings cargados en proyecto `colibri`

| Tipo            | Variable name     | Value / Target              |
|-----------------|-------------------|-----------------------------|
| Workers AI      | `AI`              | Workers AI Catalog          |
| Assets          | `ASSETS`          | (estático)                  |
| D1 database     | `colibri_db`      | colibri-db                  |
| R2 bucket       | `COLIBRI_PDFS`    | colibri-pdfs                |
| KV namespace    | `COLIBRI_USERS`   | COLIBRI_USERS (nuevo)       |

El mismo binding `COLIBRI_USERS` también se agregó al proyecto `colibri-staging`.

### 1.5 · Webhooks de PayPal

**Pendientes de configurar.** Se hacen DESPUÉS de que tu Worker exista en producción, porque PayPal necesita la URL pública del Worker para registrarlos. El paso correcto:

1. Una vez deployado el Worker con el endpoint `/api/webhook`, ir a developer.paypal.com → Apps & Credentials → "Colibri Subscriptions" → sección Webhooks → Add Webhook
2. URL: `https://colibripdf.com/api/webhook` (o el dominio donde viva el endpoint)
3. Eventos a escuchar:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.DENIED`
4. PayPal genera un `PAYPAL_WEBHOOK_ID` que se carga como env var nueva (encrypted).

---

## 2 · Decisión doctrinal · freemium voluntario

Esto es **decisión de Juan, no técnica**, y debe permear toda la implementación. Cita textual:

> *"Si nos ganamos un usuario es porque voluntariamente quiere pagar, no porque le pusimos la exigencia de pago de frente. Es parte de los principios y si solo nos cuesta algo de arquitectura adicional, lo vale al 10000%."*

### Implicaciones que NO son negociables:

1. **El usuario NUNCA da tarjeta al inicio.** Signup solo con email (o Google/Facebook OAuth ya existente).
2. **El trial de 30 días es real.** El usuario tiene acceso completo al producto premium durante esos 30 días.
3. **Al día 30, muro de pago suave** (no fricción agresiva). Botones PayPal mensual y anual visibles. El usuario decide si paga o cierra el tab.
4. **Recordatorios sin urgencia falsa.** Emails de días 25/29/30 son informativos, no de presión. Sin "¡últimas horas!", sin guilt trips.
5. **Cancelación sin fricción.** Sin "¿estás seguro?", sin ofertas de retención agresivas, sin múltiples confirmaciones.
6. **Banner de "te quedan X días" durante el trial**: cerrable, no agresivo, color varía sutilmente según día (gris al inicio, amarillo cerca del fin).
7. **Después de cancelar, mantener acceso hasta `current_period_end`** (lo que ya pagó es suyo).

### Conversión esperada bajo este modelo

5-15% del trial a suscripción (vs. estándar de industria 60-80% con tarjeta upfront). La diferencia es el costo ético del proyecto. Hipótesis comercial: usuarios alineados retienen más tiempo y refieren más.

---

## 3 · Situación de auth · NO rehacer

El descubrimiento crítico de la sesión: Colibri ya tiene auth implementada. NO se debe construir un sistema paralelo.

### Lo que ya existe en producción:

- **Better Auth** (librería moderna de auth para TypeScript) con `BETTER_AUTH_SECRET` configurada
- **Google OAuth** configurado con `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- **Facebook OAuth** configurado con `FACEBOOK_CLIENT_ID` + `FACEBOOK_CLIENT_SECRET`
- **D1 SQL database** `colibri_db` con tabla `users` (presumiblemente)

### Lo que NO se debe construir:

- Sistema custom de magic links con JWT
- Tabla paralela de usuarios en KV
- Cookies firmadas custom
- Sistema de sesión propio

### Lo que SÍ se debe construir encima de Better Auth:

1. **Extensión de schema D1** — agregar a la tabla `users` (o crear tabla relacionada `user_subscriptions`) estas columnas:

   ```sql
   ALTER TABLE users ADD COLUMN trial_start TEXT;
   ALTER TABLE users ADD COLUMN trial_end TEXT;
   ALTER TABLE users ADD COLUMN sub_status TEXT DEFAULT 'TRIAL';
   ALTER TABLE users ADD COLUMN sub_plan TEXT;
   ALTER TABLE users ADD COLUMN paypal_subscription_id TEXT;
   ALTER TABLE users ADD COLUMN current_period_end TEXT;
   ```

   Estados de `sub_status`: `TRIAL` | `EXPIRED` | `SUBSCRIBED` | `CANCELLED`

2. **Hook en el signup de Better Auth**: cuando un usuario nuevo se crea, automáticamente setear `trial_start = now`, `trial_end = now + 30 days`, `sub_status = 'TRIAL'`.

3. **Middleware de control de acceso**: lee la sesión de Better Auth, consulta el row del usuario en D1, decide si tiene acceso (TRIAL vigente, SUBSCRIBED, o CANCELLED con period_end futuro).

4. **KV `COLIBRI_USERS`**: opcional como caché. Si Better Auth + D1 cubre todo, este KV puede quedar sin uso por ahora. Tú decides si vale la pena el caché.

5. **`JWT_SECRET`**: queda disponible para firmar/verificar webhooks de PayPal exclusivamente.

---

## 4 · Arquitectura propuesta · capas

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND colibripdf.com                                     │
│                                                             │
│ Landing pública  /                                          │
│ Signup           /signup       (Google · Facebook · email)  │
│ Lectura          /lectura/*    (protegido por middleware)   │
│ Muro de pago     /suscripcion  (botones PayPal)             │
│ Cuenta           /cuenta       (estado + cancelar)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ AUTH · Better Auth (ya existe)                              │
│ Sesión via cookie firmada con BETTER_AUTH_SECRET            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ CONTROL DE ACCESO · Edge middleware (Cloudflare Pages)      │
│ 1. Lee sesión Better Auth                                   │
│ 2. Consulta users en D1                                     │
│ 3. Decide acceso según sub_status + fechas                  │
│ 4. Redirige a /suscripcion si no tiene acceso               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ STORAGE                                                     │
│ D1 (colibri_db) — usuarios + estado de suscripción          │
│ R2 (COLIBRI_PDFS) — PDFs del producto                       │
│ KV (COLIBRI_USERS) — caché opcional / no usar si D1 cubre   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ PAGOS · PayPal Subscriptions API                            │
│ /suscripcion renderiza Smart Buttons con Plan IDs           │
│ /api/webhook recibe eventos y actualiza D1                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 5 · Tareas concretas que sugiero arrancar

Por orden de prioridad:

1. **Inspeccionar lo que ya existe** en el repo de Colibri:
   - Confirma que Better Auth está integrado y funcionando
   - Lee el schema actual de D1 (`colibri_db`) — tabla `users`, qué columnas tiene
   - Identifica dónde vive el handler de signup actual (para agregar el hook de trial_start)

2. **Migración del schema D1** — agregar las columnas de suscripción a la tabla `users` (o crear tabla relacionada). Migración versionada, idempotente.

3. **Hook en signup**: cuando un usuario se crea (sea por Google, Facebook o email), setear los campos de trial automáticamente. Si Better Auth tiene hooks/middleware nativo, úsalo.

4. **Middleware de control de acceso** para rutas `/lectura/*`:
   - Lee sesión Better Auth
   - Consulta usuario en D1
   - Verifica `sub_status` y fechas
   - Redirige a `/suscripcion?expired=1` si no tiene acceso

5. **Página `/suscripcion`** con dos botones PayPal Subscriptions (mensual + anual). Layout sereno, sin manipulación. Lee el `PAYPAL_PLAN_MENSUAL` y `PAYPAL_PLAN_ANUAL` desde env vars.

6. **Endpoint `/api/activate-subscription`**: confirma con PayPal API que la suscripción está activa, actualiza el row del usuario en D1 con `sub_status = 'SUBSCRIBED'`, `paypal_subscription_id`, `current_period_end`.

7. **Endpoint `/api/webhook`** para PayPal:
   - Verifica signature del webhook con `PAYPAL_WEBHOOK_ID`
   - Maneja los 6 eventos (ver §1.5)
   - Actualiza D1 según el evento

8. **Banner persistente "te quedan X días"** durante TRIAL. Componente React/Vue/etc. que consulta `/api/me` y muestra el banner con tono variable según días restantes.

9. **Cron schedule** (Cloudflare Cron Triggers):
   - Diario a las 00:00 UTC: pasa usuarios con `trial_end < now` y `sub_status = 'TRIAL'` a `sub_status = 'EXPIRED'`
   - Diario: envía emails de recordatorio (día 25, 29, 30 del trial)

10. **8 plantillas de email** (signup, bienvenida tras verify, día 25, día 30, suscripción activada, renovación, tarjeta falló, cancelación). Vía MailChannels desde el Worker (gratis con Cloudflare).

11. **Tests**:
    - Signup → trial activo → acceso a `/lectura`
    - Trial vence → middleware bloquea → muro de pago
    - Suscripción en Sandbox → webhook → acceso restaurado
    - Cancelación → mantiene acceso hasta period_end → después bloquea

---

## 6 · Reglas de copy y tono · NO negociables

Para todos los emails y mensajes del sistema:

- **Nunca** urgencia falsa ("¡últimas horas!", "¡no pierdas tu acceso!")
- **Nunca** guilt trips ("nos vas a abandonar", "esperábamos más de ti")
- Párrafos cortos (máximo 2 líneas por idea)
- Botón único de acción por email, no múltiples CTAs
- Firmar como `Colibri` o `Juan — Colibri` (humano, no marca corporativa)
- En español por defecto; preparar slots para inglés en versión futura

Tabla de emails:

| Trigger                  | Asunto                                          | Tono                  |
|--------------------------|-------------------------------------------------|----------------------|
| Signup (si magic link)   | `Tu link para entrar a Colibri`                 | corto, neutral       |
| Bienvenida tras verify   | `Tienes 30 días de Colibri`                     | acogedor, sin promesas |
| Día 25                   | `Te quedan 5 días de prueba en Colibri`         | informativo          |
| Día 30 trial vence       | `Tu prueba terminó. Sigues si quieres.`         | sereno, ofrece opción |
| Suscripción activada     | `Gracias por sumarte a Colibri`                 | breve, agradecido    |
| Renovación exitosa       | `Tu suscripción se renovó`                      | recibo, sin más      |
| Tarjeta falló            | `Hubo un problema cobrando tu suscripción`     | factual, no alarmista |
| Cancelación              | `Confirmamos la cancelación`                    | respetuoso           |

---

## 7 · Archivos de referencia en el otro repo

Si quieres revisar el detalle técnico completo de cómo se decidió todo esto, en el repo de Simio Plateado existe:

- `BRIEF_CODEX_V13_PAGOS_PAYPAL.md` — brief técnico completo con la sección 8 dedicada a Colibri freemium, mismos contenidos que este resumen pero con más profundidad de código (endpoints, validaciones, eventos webhook detallados)

Path: `Documents/ANTI Mackinon/Playground2/simio-plateado/BRIEF_CODEX_V13_PAGOS_PAYPAL.md`

---

## 8 · Cuando empieces · primera pregunta sugerida

Para arrancar bien, sugiero que la primera pregunta del chat de Colibri sea algo como:

> *"Lee el archivo BRIEF_PARA_COLIBRI_CLAUDE.md que te pasé. Después inspecciona el repo de Colibri y dime:
> 1. ¿Cómo está estructurada la tabla users actual en D1?
> 2. ¿Dónde vive el handler de signup actual de Better Auth?
> 3. ¿Hay hooks/middleware ya implementados que pueda extender?
> Con eso te pido el plan de migración y la primera tarea concreta."*

Eso te da el suelo técnico antes de meter código.

---

*Documento creado 2026-05-18. Hand-off del chat de Simio Plateado al chat de Colibri Claude. Las credenciales públicas (Client IDs, Plan IDs) son seguras de circular; los Secrets están en 1Password de Juan y en Cloudflare encriptados, nunca en chat ni en código.*
