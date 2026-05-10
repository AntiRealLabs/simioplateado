const ALLOWED_ORIGINS = new Set([
  "https://simioplateado.com",
  "https://www.simioplateado.com",
  "https://simio-plateado.pages.dev",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]);

const PIEZAS = {
  "tuni-v01-negra": "TUNI.v01.NEGRA",
  "copa-chiste-colombia-v0": "COPA_CHISTE_COLOMBIA",
  "marxito-v01": "MARXITO.v01",
  "planti-punk-v01": "PLANTI_PUNK",
  "planti-punk-xl-v01": "PLANTI_PUNK_XL",
  "planti-k-v01": "PLANTI_K",
  "planti-k-xl-v01": "PLANTI_K_XL",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/sondeo" && request.method === "OPTIONS") {
      return corsResponse(request);
    }

    if (url.pathname === "/api/sondeo" && request.method === "POST") {
      return handleVoto(request, env, ctx);
    }

    if (url.pathname === "/api/admin/votes" && request.method === "GET") {
      return handleAdminVotes(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

async function handleVoto(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, { error: "json_invalido" }, 400);
  }

  const { slug, email, modo } = body;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!slug || typeof slug !== "string" || slug.length > 100 || !PIEZAS[slug]) {
    return jsonResponse(request, { error: "slug_invalido" }, 400);
  }

  if (modo !== "email" && modo !== "silencio") {
    return jsonResponse(request, { error: "modo_invalido" }, 400);
  }

  if (
    modo === "email" &&
    (!normalizedEmail || normalizedEmail.length > 200 || !EMAIL_RE.test(normalizedEmail))
  ) {
    return jsonResponse(request, { error: "email_invalido" }, 400);
  }

  const totalKey = `votes:${slug}:total`;
  const currentTotal = parseInt((await env.VOTES.get(totalKey)) || "0", 10);
  const nextTotal = Number.isFinite(currentTotal) ? currentTotal + 1 : 1;

  await env.VOTES.put(totalKey, String(nextTotal));

  if (modo === "email") {
    const emailsKey = `votes:${slug}:emails`;
    const existing = await readEmailList(env, emailsKey);

    if (!existing.some((entry) => entry.email === normalizedEmail)) {
      existing.push({ email: normalizedEmail, timestamp: new Date().toISOString() });
      await env.VOTES.put(emailsKey, JSON.stringify(existing));
    }
  }

  const notification = await enviarNotificacion(env, slug, modo, normalizedEmail, nextTotal).catch(
    (error) => {
      const failure = notificationFailureData(slug, modo, normalizedEmail, nextTotal, error);
      const writeFailure = recordNotificationFailure(env, slug, failure);

      if (ctx && typeof ctx.waitUntil === "function") {
        ctx.waitUntil(writeFailure);
      }

      return { ok: false, error: failure.error, status: failure.status || null };
    },
  );

  return jsonResponse(request, {
    ok: true,
    total: nextTotal,
    notified: notification.ok,
    provider: notification.provider || null,
  });
}

async function enviarNotificacion(env, slug, modo, email, nuevoTotal) {
  const timestamp = new Date().toISOString();
  const pieza = PIEZAS[slug] || slug;
  const subject =
    modo === "email"
      ? `[SIMIO] Voto con email · ${slug}`
      : `[SIMIO] Voto silencioso · ${slug}`;

  const text =
    modo === "email"
      ? [
          `Pieza: ${pieza}`,
          `Slug: ${slug}`,
          "Modo: con email",
          `Email: ${email}`,
          `Total acumulado: ${nuevoTotal}`,
          `Fecha: ${timestamp}`,
        ].join("\n")
      : [
          `Pieza: ${pieza}`,
          `Slug: ${slug}`,
          "Modo: silencioso (anonimo)",
          `Total acumulado: ${nuevoTotal}`,
          `Fecha: ${timestamp}`,
        ].join("\n");

  if (env.EMAIL && typeof env.EMAIL.send === "function") {
    const result = await env.EMAIL.send({
      to: "numeros@simioplateado.com",
      from: { email: "noreply@simioplateado.com", name: "Sondeo Simio Plateado" },
      subject,
      text,
    });

    return { ok: true, provider: "cloudflare_email", messageId: result && result.messageId };
  }

  if (!env.MAILCHANNELS_API_KEY) {
    const error = new Error("No notification provider is configured");
    error.code = "notification_not_configured";
    throw error;
  }

  const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": env.MAILCHANNELS_API_KEY },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: "numeros@simioplateado.com", name: "Juan" }] }],
      from: { email: "noreply@simioplateado.com", name: "Sondeo Simio Plateado" },
      subject,
      content: [{ type: "text/plain", value: text }],
    }),
  });

  if (!response.ok) {
    const error = new Error("MailChannels rejected the notification");
    error.status = response.status;
    throw error;
  }

  return { ok: true, provider: "mailchannels" };
}

async function handleAdminVotes(request, env) {
  if (!isAuthorized(request, env)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Simio Admin"' },
    });
  }

  const result = {};
  const slugs = await listSlugsWithVotes(env);

  for (const slug of slugs.sort()) {
    const total = parseInt((await env.VOTES.get(`votes:${slug}:total`)) || "0", 10);
    const emails = await readEmailList(env, `votes:${slug}:emails`);
    const notificationFailures = await readNotificationFailures(env, slug);

    result[slug] = {
      total: Number.isFinite(total) ? total : 0,
      emails_count: emails.length,
      emails,
      notification_failures_count: notificationFailures.length,
      notification_failures: notificationFailures,
    };
  }

  return jsonResponse(request, result, 200, false);
}

function isAuthorized(request, env) {
  const password = env.ADMIN_PASSWORD;
  const auth = request.headers.get("Authorization");

  if (!password || !auth) return false;

  return auth === `Basic ${btoa(`juan:${password}`)}`;
}

async function listSlugsWithVotes(env) {
  const slugs = new Set();
  let cursor;

  do {
    const list = await env.VOTES.list({ prefix: "votes:", cursor });

    for (const key of list.keys) {
      if (key.name.endsWith(":total")) {
        slugs.add(key.name.slice("votes:".length, -":total".length));
      }
    }

    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  return [...slugs];
}

async function readEmailList(env, key) {
  const raw = await env.VOTES.get(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function recordNotificationFailure(env, slug, failure) {
  const key = `votes:${slug}:notification_failures`;
  const existing = await readNotificationFailures(env, slug);

  existing.push(failure);

  await env.VOTES.put(key, JSON.stringify(existing.slice(-20)));
}

async function readNotificationFailures(env, slug) {
  const raw = await env.VOTES.get(`votes:${slug}:notification_failures`);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function notificationFailureData(slug, modo, email, total, error) {
  return {
    slug,
    modo,
    email: modo === "email" ? email : null,
    total,
    error: error && (error.code || error.message) ? error.code || error.message : "unknown",
    status: error && error.status ? error.status : null,
    timestamp: new Date().toISOString(),
  };
}

function corsResponse(request) {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

function jsonResponse(request, data, status = 200, includeCors = true) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(includeCors ? corsHeaders(request) : {}),
    },
  });
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const isPagesPreview =
    origin.startsWith("https://") && origin.endsWith(".simio-plateado.pages.dev");

  if (!ALLOWED_ORIGINS.has(origin) && !isPagesPreview) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Vary": "Origin",
  };
}
