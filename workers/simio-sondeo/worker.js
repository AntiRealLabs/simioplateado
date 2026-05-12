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
  "traumin-v01": "TRAUMIN.v01",
  "superhombresito-v01": "SUPERHOMBRESITO.v01",
  "dialoguin-v01": "DIALOGUIN.v01",
  "mini-devenires-v01": "MINI_DEVENIRES.v01",
  "parchao-v01": "PARCHAO.v01",
  "melisimo-v01": "MELISIMO.v01",
};

const PREORDER_PRODUCTS = {
  "camiseta-blanca": { name: "CAMISETA_BLANCA", price: 34, sizes: ["S", "M", "L", "XL"] },
  "camiseta-negra": { name: "CAMISETA_NEGRA", price: 38, sizes: ["S", "M", "L", "XL"] },
  gorra: { name: "GORRA", price: 44, sizes: ["unitalla"] },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_TTL_SECONDS = 3600;
const INTERNAL_EMAIL = "numeros@simioplateado.com";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/sondeo" && request.method === "OPTIONS") {
      return corsResponse(request);
    }

    if (url.pathname === "/api/sondeo" && request.method === "POST") {
      return handleVoto(request, env, ctx);
    }

    if (url.pathname === "/api/preorder" && request.method === "OPTIONS") {
      return corsResponse(request);
    }

    if (url.pathname === "/api/preorder" && request.method === "POST") {
      return handlePreorder(request, env, ctx);
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

async function handlePreorder(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, { error: "json_invalido" }, 400);
  }

  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const product = PREORDER_PRODUCTS[slug];
  const nombre = typeof body.nombre === "string" ? body.nombre.trim().slice(0, 120) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const talla = typeof body.talla === "string" ? body.talla.trim() : "";
  const price = Number(body.price);
  const lang = body.lang === "en" ? "en" : "es";

  if (body.mode !== "preorder") {
    return jsonResponse(request, { error: "modo_invalido" }, 400);
  }

  if (!product) {
    return jsonResponse(request, { error: "producto_invalido" }, 400);
  }

  if (!email || email.length > 200 || !EMAIL_RE.test(email)) {
    return jsonResponse(request, { error: "email_invalido", message: "Email invalido." }, 400);
  }

  if (!product.sizes.includes(talla)) {
    return jsonResponse(request, { error: "talla_invalida", message: "Talla invalida." }, 400);
  }

  if (price !== product.price) {
    return jsonResponse(request, { error: "precio_invalido", message: "Precio invalido." }, 400);
  }

  const rateLimit = await takePreorderSlot(env, request);
  if (!rateLimit.allowed) {
    return jsonResponse(
      request,
      {
        error: "rate_limited",
        message: "Demasiados pre-orders desde esta dirección. Esperá una hora o contactanos.",
        retry_after: rateLimit.retryAfter,
      },
      429,
    );
  }

  const timestamp = new Date().toISOString();
  const preorder = {
    id: crypto.randomUUID(),
    slug,
    product: product.name,
    nombre,
    email,
    talla,
    price: product.price,
    mode: "preorder",
    lang,
    timestamp,
    ip_hash: rateLimit.ipHash,
  };

  await env.VOTES.put(`preorders:${slug}:${timestamp}:${preorder.id}`, JSON.stringify(preorder));
  const total = await incrementCounter(env, `preorders:${slug}:total`);

  const notification = await sendPreorderEmails(env, preorder, total).catch((error) => {
    const failure = preorderFailureData(preorder, error);
    const writeFailure = recordPreorderFailure(env, slug, failure);

    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(writeFailure);
    }

    return { ok: false, error: failure.error, status: failure.status || null };
  });

  return jsonResponse(request, {
    ok: true,
    id: preorder.id,
    total,
    notified_internal: Boolean(notification.internal),
    notified_customer: Boolean(notification.customer),
    provider: notification.provider || null,
  });
}

async function enviarNotificacion(env, slug, modo, email, nuevoTotal) {
  const timestamp = new Date().toISOString();
  const pieza = PIEZAS[slug] || slug;
  const subject =
    modo === "email"
      ? `[SIMIO] Aviso con email · ${slug}`
      : `[SIMIO] Interés anónimo · ${slug}`;

  const text =
    modo === "email"
      ? [
          `Pieza: ${pieza}`,
          `Slug: ${slug}`,
          "Modo: aviso con email",
          `Email: ${email}`,
          `Total acumulado: ${nuevoTotal}`,
          `Fecha: ${timestamp}`,
        ].join("\n")
      : [
          `Pieza: ${pieza}`,
          `Slug: ${slug}`,
          "Modo: interes anonimo",
          `Total acumulado: ${nuevoTotal}`,
          `Fecha: ${timestamp}`,
        ].join("\n");

  return sendInternalEmail(env, subject, text, "Simio Plateado");
}

async function sendPreorderEmails(env, preorder, total) {
  const subjectInternal = `[SIMIO] Pre-order · ${preorder.product}`;
  const internalText = [
    `Producto: ${preorder.product}`,
    `Slug: ${preorder.slug}`,
    `Nombre: ${preorder.nombre || "(sin nombre)"}`,
    `Email: ${preorder.email}`,
    `Talla: ${preorder.talla}`,
    `Precio: USD ${preorder.price}`,
    `Total acumulado producto: ${total}`,
    `Fecha: ${preorder.timestamp}`,
  ].join("\n");

  const internal = await captureEmailResult(() =>
    sendInternalEmail(env, subjectInternal, internalText, "Pre-order Simio"),
  );
  const customer = await captureEmailResult(() => sendCustomerPreorderEmail(env, preorder));

  return {
    ok: internal.ok || customer.ok,
    internal: internal.ok,
    customer: customer.ok,
    provider: customer.provider || internal.provider || null,
    errors: [internal.error, customer.error].filter(Boolean),
  };
}

async function sendInternalEmail(env, subject, text, fromName) {
  return sendTransactionalEmail(env, {
    to: [{ email: INTERNAL_EMAIL, name: "Juan" }],
    from: { email: "noreply@simioplateado.com", name: fromName },
    subject,
    text,
  });
}

function customerPreorderText(preorder) {
  if (preorder.lang === "en") {
    return [
      preorder.nombre ? `Hi ${preorder.nombre},` : "Hi,",
      "",
      "Your pre-order was registered.",
      "",
      `Product: ${preorder.product}`,
      `Size: ${preorder.talla}`,
      `Price: USD ${preorder.price}`,
      "",
      "When the drop closes, we will write to process payment via Lemon Squeezy.",
      "",
      "simioplateado.com",
    ].join("\n");
  }

  return [
    preorder.nombre ? `Hola ${preorder.nombre},` : "Hola,",
    "",
    "Tu pre-order quedó registrado.",
    "",
    `Producto reservado: ${preorder.product}`,
    `Talla: ${preorder.talla}`,
    `Precio: USD ${preorder.price}`,
    "",
    "Cuando el drop cierre, te escribimos para procesar el pago vía Lemon Squeezy.",
    "",
    "simioplateado.com",
  ].join("\n");
}

async function sendCustomerPreorderEmail(env, preorder) {
  const subject =
    preorder.lang === "en"
      ? `Your Simio Plateado pre-order · ${preorder.product}`
      : `Tu pre-order Simio Plateado · ${preorder.product}`;

  return sendTransactionalEmail(env, {
    to: [{ email: preorder.email, name: preorder.nombre || preorder.email }],
    from: { email: "noreply@simioplateado.com", name: "Simio Plateado" },
    subject,
    text: customerPreorderText(preorder),
  });
}

async function captureEmailResult(sendFn) {
  try {
    return await sendFn();
  } catch (error) {
    return {
      ok: false,
      error: error && (error.code || error.message) ? error.code || error.message : "unknown",
      status: error && error.status ? error.status : null,
    };
  }
}

async function sendTransactionalEmail(env, message) {
  const cloudflare = await sendCloudflareEmail(env, message).catch((error) => {
    if (env.MAILCHANNELS_API_KEY) return null;
    throw error;
  });

  if (cloudflare) return cloudflare;

  return sendMailChannels(env, message);
}

async function sendCloudflareEmail(env, message) {
  if (!env.EMAIL || typeof env.EMAIL.send !== "function") {
    throw new Error("cloudflare_email_binding_missing");
  }

  const result = await env.EMAIL.send({
    to: message.to.map((recipient) => recipient.email),
    from: message.from,
    subject: message.subject,
    text: message.text,
  });

  return { ok: true, provider: "cloudflare_email", messageId: result && result.messageId };
}

async function sendMailChannels(env, message) {
  if (!env.MAILCHANNELS_API_KEY) {
    throw new Error("mailchannels_key_missing");
  }

  const headers = { "Content-Type": "application/json" };
  headers["X-Api-Key"] = env.MAILCHANNELS_API_KEY;

  const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers,
    body: JSON.stringify({
      personalizations: [{ to: message.to }],
      from: message.from,
      subject: message.subject,
      content: [{ type: "text/plain", value: message.text }],
    }),
  });

  if (!response.ok) {
    const error = new Error("MailChannels rejected the notification");
    error.status = response.status;
    throw error;
  }

  return { ok: true, provider: "mailchannels" };
}

async function takePreorderSlot(env, request) {
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown";
  const ipHash = await sha256(ip);
  const key = `preorders:rate:${ipHash}`;
  const now = Date.now();
  const raw = await env.VOTES.get(key);
  let bucket = null;

  if (raw) {
    try {
      bucket = JSON.parse(raw);
    } catch {
      bucket = null;
    }
  }

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + RATE_LIMIT_TTL_SECONDS * 1000 };
  }

  if (bucket.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      ipHash,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  await env.VOTES.put(key, JSON.stringify(bucket), {
    expirationTtl: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  });

  return { allowed: true, ipHash, remaining: RATE_LIMIT_MAX - bucket.count };
}

async function incrementCounter(env, key) {
  const current = parseInt((await env.VOTES.get(key)) || "0", 10);
  const next = Number.isFinite(current) ? current + 1 : 1;
  await env.VOTES.put(key, String(next));
  return next;
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

async function recordPreorderFailure(env, slug, failure) {
  const key = `preorders:${slug}:notification_failures`;
  const existing = await readJsonArray(env, key);
  existing.push(failure);
  await env.VOTES.put(key, JSON.stringify(existing.slice(-20)));
}

function preorderFailureData(preorder, error) {
  return {
    id: preorder.id,
    slug: preorder.slug,
    email: preorder.email,
    error: error && (error.code || error.message) ? error.code || error.message : "unknown",
    status: error && error.status ? error.status : null,
    timestamp: new Date().toISOString(),
  };
}

async function readJsonArray(env, key) {
  const raw = await env.VOTES.get(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
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
    Vary: "Origin",
  };
}
