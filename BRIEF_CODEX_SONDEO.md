# Brief Codex · Backend del sondeo silencioso IRREAL

**Para:** Codex CLI (mismo agente del deploy inicial)
**De:** Juan / Cowork Simio Plateado
**Fecha:** 2026-05-10+
**Status pre-requisito:** Zoho Mail configurado con simioplateado.com, dos cuentas activas:
- `el@simioplateado.com` (contacto general, lo que aparece en about del sitio)
- `numeros@simioplateado.com` (recibe notificaciones del sondeo, dashboard interno)

Ambas verificadas y reciben emails OK. El sender autorizado vía MailChannels es `noreply@simioplateado.com` (alias técnico que NO necesita inbox real, solo SPF/DKIM válidos).

---

## Contexto

Las piezas IRREAL del sitio Simio Plateado tienen un botón "Querer que exista" que hoy no hace nada real — solo muestra un mensaje de confirmación en el navegador via JavaScript local. Hay que conectarlo a un backend real que registre los votos y notifique a Juan.

**Sistema canónico**: dos modos de voto por pieza:

1. **Con email** — el visitante deja su email para ser notificado cuando la pieza se materialice. Mensaje de confirmación: *"Aviso registrado. Te escribimos cuando [pieza] se materialice. Solo eso. No newsletter."*
2. **Anónimo / silencioso** — el visitante solo aprieta "Anotar en silencio". Suma al contador, no deja datos. Mensaje: *"Anotado en silencio. Tu voto cuenta sin nombre."*

Ambos modos deben persistir el voto y notificar a Juan.

---

## Stack canónico

- **Cloudflare Worker** (gratis, ya estás en Cloudflare)
- **Workers KV** para persistencia (gratis, 100k operaciones/día)
- **MailChannels** para enviar emails (gratis con Cloudflare Workers, ilimitado)
- **Sin dependencias externas** (no Formspree, no SendGrid, no Resend)

---

## Tarea 1 · Crear Cloudflare Worker

Estructura del Worker:

```javascript
// worker.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Rutas
    if (url.pathname === "/api/sondeo" && request.method === "POST") {
      return handleVoto(request, env);
    }
    if (url.pathname === "/api/admin/votes" && request.method === "GET") {
      return handleAdminVotes(request, env);
    }
    return new Response("Not found", { status: 404 });
  },
};

async function handleVoto(request, env) {
  // CORS
  if (request.method === "OPTIONS") {
    return corsResponse();
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "JSON inválido" }, 400);
  }

  const { slug, email, modo } = body;
  // slug: "tuni-v01-negra" | "marxito-v01" | etc.
  // modo: "email" | "silencio"
  // email: presente solo si modo === "email"

  if (!slug || typeof slug !== "string" || slug.length > 100) {
    return jsonResponse({ error: "slug inválido" }, 400);
  }
  if (modo !== "email" && modo !== "silencio") {
    return jsonResponse({ error: "modo inválido" }, 400);
  }
  if (modo === "email") {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
      return jsonResponse({ error: "email inválido" }, 400);
    }
  }

  // Incrementar contador total
  const totalKey = `votes:${slug}:total`;
  const currentTotal = parseInt(await env.VOTES.get(totalKey) || "0");
  await env.VOTES.put(totalKey, String(currentTotal + 1));

  // Si dejó email, guardarlo (sin duplicar)
  if (modo === "email") {
    const emailsKey = `votes:${slug}:emails`;
    const existing = JSON.parse(await env.VOTES.get(emailsKey) || "[]");
    if (!existing.find(e => e.email === email)) {
      existing.push({ email, timestamp: new Date().toISOString() });
      await env.VOTES.put(emailsKey, JSON.stringify(existing));
    }
  }

  // Notificar a Juan vía email (MailChannels)
  await enviarNotificacion(slug, modo, email, currentTotal + 1, env);

  return jsonResponse({ ok: true, total: currentTotal + 1 });
}

async function enviarNotificacion(slug, modo, email, nuevoTotal, env) {
  const subject = modo === "email"
    ? `[SIMIO] Voto con email · ${slug}`
    : `[SIMIO] Voto silencioso · ${slug}`;

  const text = modo === "email"
    ? `Pieza: ${slug}\nModo: con email\nEmail: ${email}\nTotal acumulado: ${nuevoTotal}\nFecha: ${new Date().toISOString()}`
    : `Pieza: ${slug}\nModo: silencioso (anónimo)\nTotal acumulado: ${nuevoTotal}\nFecha: ${new Date().toISOString()}`;

  await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: "numeros@simioplateado.com", name: "Juan" }] }],
      from: { email: "noreply@simioplateado.com", name: "Sondeo Simio Plateado" },
      subject,
      content: [{ type: "text/plain", value: text }],
    }),
  });
}

async function handleAdminVotes(request, env) {
  // Auth básica simple — el password va como variable de entorno
  const auth = request.headers.get("Authorization");
  const expected = "Basic " + btoa("juan:" + env.ADMIN_PASSWORD);
  if (auth !== expected) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Simio Admin"' },
    });
  }

  // Listar todas las keys de votes:*:total
  const list = await env.VOTES.list({ prefix: "votes:" });
  const result = {};
  for (const key of list.keys) {
    if (key.name.endsWith(":total")) {
      const slug = key.name.replace("votes:", "").replace(":total", "");
      const total = parseInt(await env.VOTES.get(key.name) || "0");
      const emailsRaw = await env.VOTES.get(`votes:${slug}:emails`) || "[]";
      const emails = JSON.parse(emailsRaw);
      result[slug] = {
        total,
        emails_count: emails.length,
        emails,
      };
    }
  }
  return jsonResponse(result);
}

function corsResponse() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://simioplateado.com",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://simioplateado.com",
    },
  });
}
```

---

## Tarea 2 · Configurar el Worker en Cloudflare

1. **Crear KV namespace**:
   - Cloudflare Dashboard → Workers & Pages → KV
   - Create namespace → nombre: `SIMIO_VOTES`
   - Anotá el ID que te dé

2. **Crear Worker**:
   - Workers & Pages → Create application → Create Worker
   - Nombre: `simio-sondeo`
   - Pegá el código de arriba
   - Configurá variables de entorno:
     - `ADMIN_PASSWORD`: una contraseña fuerte para Juan (ejemplo: `simio_punk_2026_xN8k...`) — guardala en 1Password
   - Bind del KV namespace:
     - Settings → Variables → KV Namespace Bindings → Add binding
     - Variable name: `VOTES`
     - KV namespace: `SIMIO_VOTES`
   - Deploy

3. **Configurar dominio del Worker**:
   - Settings del Worker → Triggers → Custom Domains
   - Add Custom Domain: `api.simioplateado.com`
   - Cloudflare configura DNS automáticamente (subdominio del que ya está activo)

4. **Configurar SPF/DKIM para que MailChannels pueda enviar**:
   - Cloudflare DNS → simioplateado.com → agregar record TXT:
     - Name: `_mailchannels`
     - Content: `v=mc1 cfid=simioplateado.com`
   - Esto autoriza a MailChannels a enviar como `@simioplateado.com`

---

## Tarea 3 · Modificar el frontend para llamar al Worker

En el HTML del sitio (probablemente en `index.html` o donde estén los handlers), reemplazar las funciones JS actuales `votarEmail` y `votarSilencio` por versiones que llamen al Worker:

```javascript
async function votarEmail(panelId, inputId, confId, btnId, nombre) {
  const email = document.getElementById(inputId).value.trim();
  if (!email || !email.includes("@")) {
    alert("Necesitamos un email válido para avisarte.");
    return;
  }

  // Slug de la pieza — sacarlo del ID o del modal actual
  const slug = btnId.replace("btn-votar-", ""); // ej. "tuni" o "marxito"

  try {
    const resp = await fetch("https://api.simioplateado.com/api/sondeo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, email, modo: "email" }),
    });
    if (!resp.ok) throw new Error("No se pudo registrar el voto");
  } catch (err) {
    alert("Hubo un problema. Intentá de nuevo.");
    return;
  }

  const conf = document.getElementById(confId);
  conf.innerHTML = `<strong>Aviso registrado.</strong> Te escribimos cuando ${nombre} se materialice. Solo eso. No newsletter.`;
  conf.classList.add("visible");
  document.getElementById(panelId).classList.remove("abierto");
  const btn = document.getElementById(btnId);
  btn.textContent = "Anotado · gracias";
  btn.disabled = true;
}

async function votarSilencio(panelId, confId, btnId) {
  const slug = btnId.replace("btn-votar-", "");

  try {
    await fetch("https://api.simioplateado.com/api/sondeo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, modo: "silencio" }),
    });
  } catch (err) {
    // Falla silenciosa — el voto silencioso debe ser silencioso incluso ante errores
  }

  const conf = document.getElementById(confId);
  conf.innerHTML = `<strong>Anotado en silencio.</strong> Tu voto cuenta sin nombre.`;
  conf.classList.add("visible");
  document.getElementById(panelId).classList.remove("abierto");
  const btn = document.getElementById(btnId);
  btn.textContent = "Anotado · gracias";
  btn.disabled = true;
}
```

---

## Tarea 4 · Verificación

1. Push del código modificado a `main` → deploy automático
2. Abrir el sitio, click en "Querer que exista" en alguna pieza
3. Probar modo email:
   - Ingresar email
   - Click "Enviar →"
   - Debe aparecer mensaje "Aviso registrado..."
4. Verificar que llegó email a `numeros@simioplateado.com` con asunto `[SIMIO] Voto con email · [slug]`
5. Probar modo silencioso:
   - Click "Anotar en silencio"
   - Debe aparecer mensaje "Anotado en silencio..."
6. Verificar que llegó email con asunto `[SIMIO] Voto silencioso · [slug]`
7. Verificar admin: en navegador `https://api.simioplateado.com/api/admin/votes` con auth básica (usuario `juan`, contraseña la que pusiste). Debe devolver JSON con los votos registrados.

---

## Consideraciones de doctrina

- **Anti-vigilancia**: el Worker NO loguea IP, user-agent, ni nada que identifique al visitante salvo el email (si lo dejó voluntariamente). Coherente con doctrina del proyecto.
- **No newsletter**: el email solo se usa para notificar UNA VEZ cuando la pieza se materialice. NO se manda nada más nunca. Si Juan algún día decide hacer newsletter, deberá pedirle consentimiento explícito separado a cada email recolectado, no se los puede dar por opt-in implícito.
- **Borrado**: agregar después un endpoint `DELETE /api/admin/votes/:slug/emails/:email` para borrar un email puntual si alguien lo pide (GDPR-friendly aunque el proyecto no es europeo).

---

## Reportar a Juan cuando termines

Mensaje de confirmación con:
- URL del Worker activo (ej. `api.simioplateado.com`)
- Confirmación de que llegó email de prueba a `numeros@simioplateado.com`
- Captura del JSON de admin con votos de prueba
- Cualquier problema encontrado
