# Brief V0.16 · Watchdog del checkout · Capa 1 de monitoreo

*Brief autocontenido para un agente de Claude Code. Implementa la **Capa 1** del sistema de monitoreo: un Worker programado que cada 15 minutos verifica que el flujo de compra de simioplateado.com está vivo, y le manda un correo a Juan si se rompe. Versión 1.0 · 2026-05-28.*

---

## 0 · Contexto (léelo antes de tocar nada)

Simio Plateado vende piezas físicas en `simioplateado.com`. El checkout va contra el Worker `simio-sondeo` (despliega en `api.simioplateado.com`), que crea preferencias en MercadoPago Checkout Pro y redirige al cliente.

Hace pocos días la página estuvo en producción con el botón de compra muerto durante varios días — Juan estuvo pagando publicidad mientras nadie podía pagar. **Nadie se enteró.** El objetivo de este Worker es que esa situación nunca se repita.

Lo que ya existe en el repo:

- `workers/simio-sondeo/worker.js` — Worker principal. Tiene los endpoints `/api/checkout`, `/api/mercadopago/webhook`, `/api/central`. Usa env vars `MERCADOPAGO_ACCESS_TOKEN`, `MAILCHANNELS_API_KEY`, KV `VOTES`, y un binding `EMAIL` de `cloudflare:email`.
- `workers/simio-sondeo/wrangler.toml` — config del Worker principal.
- `.github/workflows/deploy-sondeo-worker.yml` — GH Action que despliega `simio-sondeo` cuando cambia su carpeta.

---

## 1 · Objetivo de este Worker

Un nuevo Worker `simio-watchdog` que:

1. Corre por cron cada 15 minutos.
2. Hace un check de salud al Worker de producción.
3. Si el check falla **2 veces seguidas**, envía un correo de alerta a Juan.
4. Si el check vuelve a pasar después de una alerta, envía un correo de "recuperado".
5. No spamea: una vez alertado, no vuelve a alertar por la misma falla en las próximas 4 horas (cooldown).
6. Guarda un histórico ligero en KV (últimos 50 checks) para diagnóstico.

**Lo que NO hace este Worker en v1** (puede venir en Capa 2/3 después): no captura errores del frontend en tiempo real, no manda resumen diario de ventas, no testea Telegram/Discord. Solo el health-check del checkout.

---

## 2 · Decisiones de diseño (no negociables)

1. **Endpoint dedicado en `simio-sondeo`:** agregar `GET /api/health` en el Worker principal que devuelve un JSON con el estado interno (env vars críticas presentes, KV alcanzable, MercadoPago alcanzable con un ping no-destructivo). **No** crear preferencias reales en MP desde el watchdog — eso ensucia el dashboard. El check pregunta "¿estás vivo y configurado?", no "¿puedes cobrar?".

2. **Worker separado, no enredar el principal.** El watchdog vive en `workers/simio-watchdog/` con su propio `wrangler.toml`, su propio KV binding (nuevo namespace `WATCHDOG`), y su propio deploy. Aislamiento = menos riesgo de romper el principal.

3. **Canal de alerta: email vía MailChannels.** Ya está la infraestructura de email en el Worker principal. Mismo patrón. Telegram queda como opcional en el apéndice.

4. **Cron schedule: `*/15 * * * *`** (cada 15 min). Suficiente para detectar problemas rápido sin gastar excesivo cómputo.

5. **Umbral de alerta: 2 fallas consecutivas.** Una falla puede ser un timeout efímero. Dos seguidas casi siempre es un problema real.

6. **Cooldown entre alertas: 4 horas.** Si Juan ya recibió un correo "está roto", no se le manda otro hasta que pasen 4 horas o se recupere y vuelva a romperse.

7. **Recuperación notificada:** cuando el estado pasa de FAIL → OK después de una alerta, mandar un correo corto de "ya está funcionando".

---

## 3 · Arquitectura

```
Cloudflare Cron (cada 15 min)
       │
       ▼
Worker: simio-watchdog
  ├── scheduled() handler
  │      ├─ Llama a https://api.simioplateado.com/api/health
  │      ├─ Lee respuesta JSON
  │      ├─ Decide OK / FAIL
  │      ├─ Actualiza estado en KV WATCHDOG
  │      │     ├─ watchdog:last (último resultado completo)
  │      │     ├─ watchdog:streak:fail (contador de fallas seguidas)
  │      │     ├─ watchdog:streak:ok   (contador de éxitos seguidos)
  │      │     ├─ watchdog:last_alert (timestamp del último correo enviado)
  │      │     └─ watchdog:history (array circular de 50 checks)
  │      └─ Si FAIL 2x seguidas y fuera de cooldown → manda correo
  │         Si OK después de un alert previo → manda correo de recuperación
  │
  └── fetch() handler (opcional, /status para inspección manual)
        └─ Devuelve último resultado + streak en JSON para que Juan lo consulte
```

Y en el Worker principal:

```
GET /api/health  →  responde con
{
  "ok": true,
  "checks": {
    "kv_votes": true,           // env.VOTES.get() no falla
    "mp_token_set": true,        // env.MERCADOPAGO_ACCESS_TOKEN existe
    "mp_api_reachable": true,    // GET /users/me a MP responde 200
    "mailchannels_set": true     // env.MAILCHANNELS_API_KEY existe (o EMAIL binding)
  },
  "timestamp": "2026-05-28T15:00:00Z",
  "version": "1.0"
}
```

Si CUALQUIER `check` falla, responde HTTP 503 con el mismo JSON y `"ok": false`. Eso le permite al watchdog distinguir "el sitio está caído" vs "está vivo pero con algo mal".

---

## 4 · Implementación paso a paso

### Paso 1 · Agregar `/api/health` al Worker principal

En `workers/simio-sondeo/worker.js`:

- Agregar una ruta `GET /api/health` (antes de los catch-all).
- La función `handleHealth(env)` ejecuta los 4 checks en paralelo con `Promise.allSettled`:
  - `kv_votes`: hace `await env.VOTES.get("__healthcheck__")` (devuelve null pero no falla → OK).
  - `mp_token_set`: verifica `typeof env.MERCADOPAGO_ACCESS_TOKEN === "string" && env.MERCADOPAGO_ACCESS_TOKEN.length > 10`.
  - `mp_api_reachable`: `GET https://api.mercadopago.com/users/me` con el Bearer token, timeout 5s. Si responde 200 → OK. Cualquier otra cosa → FAIL.
  - `mailchannels_set`: verifica que `env.MAILCHANNELS_API_KEY` existe o que el binding `EMAIL` existe. (Para v1, basta con verificar `MAILCHANNELS_API_KEY`.)
- `ok = todos los checks son true`. Status code: 200 si ok, 503 si no.
- Importante: NO incluir secretos en la respuesta. Solo booleanos.
- Importante: cachear el resultado de `mp_api_reachable` por 5 minutos en KV para no consumir cuota MP en cada check. (Clave: `health:mp_api_reachable_cached_at` + valor del check.)

### Paso 2 · Crear el Worker `simio-watchdog`

Estructura:

```
workers/simio-watchdog/
├── wrangler.toml
├── worker.js
└── README.md (opcional, una línea explicando qué hace)
```

`wrangler.toml`:

```toml
name = "simio-watchdog"
main = "worker.js"
compatibility_date = "2026-05-28"

[vars]
HEALTH_URL = "https://api.simioplateado.com/api/health"
FAIL_THRESHOLD = "2"
ALERT_COOLDOWN_SECONDS = "14400"   # 4 horas
HISTORY_SIZE = "50"
ADMIN_EMAIL = "el@simioplateado.com"   # confirmar con Juan
EMAIL_FROM = "noreply@simioplateado.com"

[[kv_namespaces]]
binding = "WATCHDOG"
id = "<crear y reemplazar>"

[triggers]
crons = ["*/15 * * * *"]
```

`worker.js`:

```js
export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runHealthCheck(env));
  },
  async fetch(request, env) {
    // Endpoint /status para inspección manual (no autenticado, solo lectura)
    const url = new URL(request.url);
    if (url.pathname === "/status") {
      const last = await env.WATCHDOG.get("watchdog:last", "json");
      const streakFail = await env.WATCHDOG.get("watchdog:streak:fail");
      const streakOk = await env.WATCHDOG.get("watchdog:streak:ok");
      const history = await env.WATCHDOG.get("watchdog:history", "json");
      return Response.json({ last, streakFail, streakOk, history });
    }
    return new Response("simio-watchdog", { status: 200 });
  }
};

async function runHealthCheck(env) {
  const now = new Date();
  let result;
  try {
    const res = await fetch(env.HEALTH_URL, {
      method: "GET",
      headers: { "User-Agent": "simio-watchdog/1.0" },
      signal: AbortSignal.timeout(10_000)
    });
    const body = await res.json().catch(() => null);
    result = {
      timestamp: now.toISOString(),
      ok: res.ok && body?.ok === true,
      status: res.status,
      checks: body?.checks || null,
      error: null
    };
  } catch (err) {
    result = {
      timestamp: now.toISOString(),
      ok: false,
      status: null,
      checks: null,
      error: err.message || String(err)
    };
  }

  // Guardar último resultado + histórico (array circular)
  await env.WATCHDOG.put("watchdog:last", JSON.stringify(result));
  const HISTORY_SIZE = parseInt(env.HISTORY_SIZE || "50", 10);
  const history = (await env.WATCHDOG.get("watchdog:history", "json")) || [];
  history.push(result);
  if (history.length > HISTORY_SIZE) history.shift();
  await env.WATCHDOG.put("watchdog:history", JSON.stringify(history));

  // Actualizar streaks
  const FAIL_THRESHOLD = parseInt(env.FAIL_THRESHOLD || "2", 10);
  const COOLDOWN = parseInt(env.ALERT_COOLDOWN_SECONDS || "14400", 10) * 1000;
  let streakFail = parseInt((await env.WATCHDOG.get("watchdog:streak:fail")) || "0", 10);
  let streakOk = parseInt((await env.WATCHDOG.get("watchdog:streak:ok")) || "0", 10);

  if (result.ok) {
    const prevAlertActive = streakFail >= FAIL_THRESHOLD; // ya habíamos avisado
    streakOk += 1;
    streakFail = 0;
    if (prevAlertActive) {
      await sendRecoveryEmail(env, result);
      await env.WATCHDOG.delete("watchdog:last_alert");
    }
  } else {
    streakFail += 1;
    streakOk = 0;
    if (streakFail >= FAIL_THRESHOLD) {
      const lastAlertAt = parseInt((await env.WATCHDOG.get("watchdog:last_alert")) || "0", 10);
      if (Date.now() - lastAlertAt > COOLDOWN) {
        await sendAlertEmail(env, result, streakFail);
        await env.WATCHDOG.put("watchdog:last_alert", String(Date.now()));
      }
    }
  }

  await env.WATCHDOG.put("watchdog:streak:fail", String(streakFail));
  await env.WATCHDOG.put("watchdog:streak:ok", String(streakOk));
}

async function sendAlertEmail(env, result, streak) {
  const subject = `🚨 Simio · checkout caído (${streak} fallas seguidas)`;
  const body = [
    `El watchdog detectó que el checkout de Simio Plateado no está respondiendo correctamente.`,
    ``,
    `Hora: ${result.timestamp}`,
    `Status HTTP: ${result.status}`,
    `Checks: ${JSON.stringify(result.checks, null, 2)}`,
    `Error: ${result.error || "—"}`,
    ``,
    `Acciones sugeridas:`,
    `1. Abrir simioplateado.com y verificar manualmente.`,
    `2. Revisar logs del Worker simio-sondeo en Cloudflare.`,
    `3. Confirmar que MERCADOPAGO_ACCESS_TOKEN sigue siendo válido.`,
    ``,
    `— simio-watchdog`
  ].join("\n");
  await sendMail(env, subject, body);
}

async function sendRecoveryEmail(env, result) {
  const subject = `✅ Simio · checkout recuperado`;
  const body = [
    `El watchdog confirma que el checkout de Simio Plateado volvió a responder OK.`,
    ``,
    `Hora: ${result.timestamp}`,
    `Checks: ${JSON.stringify(result.checks, null, 2)}`,
    ``,
    `— simio-watchdog`
  ].join("\n");
  await sendMail(env, subject, body);
}

async function sendMail(env, subject, text) {
  // Vía MailChannels API (mismo patrón que el Worker principal)
  await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.MAILCHANNELS_API_KEY ? { "X-Api-Key": env.MAILCHANNELS_API_KEY } : {})
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: env.ADMIN_EMAIL }] }],
      from: { email: env.EMAIL_FROM, name: "Simio Watchdog" },
      subject,
      content: [{ type: "text/plain", value: text }]
    })
  });
}
```

(Este código es esquema/referencia. Refinarlo si hace falta — manejo de errores, abort timeouts, etc.)

### Paso 3 · Crear el KV namespace `WATCHDOG`

Vía Wrangler CLI (Juan corre esto en su máquina o el agente con credenciales correctas):

```bash
npx wrangler kv namespace create WATCHDOG
```

Copia el `id` que devuelve y reemplázalo en `wrangler.toml` del watchdog.

### Paso 4 · Configurar secretos

El Worker watchdog necesita acceso a MailChannels. Si MailChannels requiere API key:

```bash
cd workers/simio-watchdog
npx wrangler secret put MAILCHANNELS_API_KEY
```

(Pegar el mismo valor que ya tiene `simio-sondeo`. Confirmar con Juan que ya existe en el otro worker.)

### Paso 5 · GitHub Action de deploy

Crear `.github/workflows/deploy-watchdog-worker.yml`, copiar el patrón de `deploy-sondeo-worker.yml`, cambiar:

- `name: Deploy Watchdog Worker`
- `paths: ["workers/simio-watchdog/**", ".github/workflows/deploy-watchdog-worker.yml"]`
- `command: deploy --config workers/simio-watchdog/wrangler.toml`

### Paso 6 · Probar local

Antes de mergear:

```bash
# En workers/simio-watchdog/
npx wrangler dev --test-scheduled
# En otra terminal:
curl "http://localhost:8787/cdn-cgi/handler/scheduled?cron=*+*+*+*+*"
curl "http://localhost:8787/status"
```

Confirmar que:
- Llamando `/cdn-cgi/handler/scheduled` el watchdog corre, hace el fetch a la URL configurada y guarda el resultado.
- `/status` muestra el último resultado, los streaks y el histórico.

### Paso 7 · Commit + push

Mensaje sugerido:

```
Agregar Worker simio-watchdog (health-check + alertas)

- GET /api/health en simio-sondeo (estado interno + ping a MP)
- Worker simio-watchdog en cron */15, alerta por email a Juan
- Umbral 2 fallas, cooldown 4h, recovery notification
- KV WATCHDOG con histórico de últimos 50 checks
```

---

## 5 · Plan de pruebas (después del deploy)

### 5.1 · Confirmar que el watchdog está corriendo

Esperar 15 min después del deploy. Luego:

```bash
curl https://simio-watchdog.<account>.workers.dev/status
```

(O configurarle un dominio si se quiere acceso público. Para v1, el subdominio `.workers.dev` está bien y solo lo usa Juan.)

Debe devolver `last` con un resultado reciente, `streakOk: 1+`, `streakFail: 0`.

### 5.2 · Simular una caída

Opciones:

1. Cambiar temporalmente `HEALTH_URL` en `wrangler.toml` a una URL que devuelve 500 (ej. `https://httpstat.us/500`), desplegar, esperar 30 min. Debe llegar un correo de alerta.
2. (Más realista pero invasivo) borrar temporalmente el secreto `MERCADOPAGO_ACCESS_TOKEN` del Worker principal y esperar. El `/api/health` devolverá 503 con `mp_token_set: false`.
3. Restaurar todo. Debe llegar un correo de recuperación.

---

## 6 · Lo que hace Juan vs el agente

**Agente de Claude Code (lo que tú haces):**

- [ ] Implementar `/api/health` en `workers/simio-sondeo/worker.js` (Paso 1).
- [ ] Crear `workers/simio-watchdog/` con sus archivos (Paso 2).
- [ ] Probar local (Paso 6 de implementación).
- [ ] Crear el GH Action (Paso 5).
- [ ] Commit + push.

**Juan (manual):**

- [ ] Confirmar `ADMIN_EMAIL` que va en `wrangler.toml` (¿el@simioplateado.com? ¿otro?).
- [ ] Crear el KV namespace `WATCHDOG` con `wrangler kv namespace create WATCHDOG` y pegar el id en el `wrangler.toml`.
- [ ] Configurar el secret `MAILCHANNELS_API_KEY` en el Worker `simio-watchdog` (si aplica).
- [ ] Verificar después del deploy que llegue el primer correo de prueba simulando una caída.

---

## 7 · Apéndice opcional · Telegram como canal de alerta extra

Si Juan quiere alertas instantáneas en su celular además del correo:

1. Crear un bot con `@BotFather` en Telegram. Copiar el token.
2. Mandar `/start` al bot desde su Telegram personal.
3. Llamar `https://api.telegram.org/bot<TOKEN>/getUpdates` y copiar su `chat_id`.
4. Agregar al `wrangler.toml` del watchdog:
   ```toml
   TELEGRAM_BOT_TOKEN = "..."   # como secret
   TELEGRAM_CHAT_ID = "..."     # var
   ```
5. En `sendAlertEmail` y `sendRecoveryEmail`, después del email, hacer un `fetch` a:
   ```
   POST https://api.telegram.org/bot<TOKEN>/sendMessage
   body: { chat_id, text: subject + "\n\n" + body }
   ```

Telegram = casi instantáneo, ideal para urgencias.

---

## 8 · Capas futuras (no implementar en este brief)

- **Capa 2:** Captura de errores reales del frontend y del worker (Sentry o endpoint `/api/log` propio).
- **Capa 3:** Correo diario con resumen de visitas, inicios de checkout y compras completadas (KPIs).

Cuando Juan las pida, se hacen como briefs separados.

---

*Brief creado 2026-05-28 · Versión 1.0. Acompaña a `BRIEF_CODEX_V15_MERCADOPAGO.md` (la integración de pago) y al protocolo de operaciones. Si algo en este brief contradice el código actual del Worker principal, el código actual gana — abrir un PR con la corrección al brief, no al revés.*
