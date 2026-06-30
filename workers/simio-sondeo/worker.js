import { EmailMessage } from "cloudflare:email";

const ALLOWED_ORIGINS = new Set([
  "https://simioplateado.com",
  "https://www.simioplateado.com",
  "https://simio-plateado.pages.dev",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  // Allows file:// mockup reviews without blocking checkout during local QA.
  "null",
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
  "superhombresito-v01": "NIETZSCHESITO.v01",
  "kraken-v01": "KRAKEN_FLORERO.v01",
  "kraken-florero-v01": "KRAKEN_FLORERO.v01",
  "jarron-pulpo-v01": "KRAKEN_FLORERO.v01",
  "dialoguin-v01": "DIALOGUIN.v01",
  "mini-devenires-v01": "MINI_DEVENIRES.v01",
  "arturito-v01": "ARTURITO_EMO.v01",
  "gramscito-v01": "GRAMSCITO.v01",
  "lacancito-v01": "LACANCITO.v01",
  "capitan-nausea-v01": "CAPITAN_NAUSEA.v01",
  "cthulito-v01": "CTHULITO.v01",
  "poesito-v01": "POESITO.v01",
  "dostoiecito-v01": "MINI_FIODOR.v01",
  "mini-fiodor-v01": "MINI_FIODOR.v01",
  "acefalo-v01": "ACEFALO.v01",
  "coleccion-feli": "COLECCION_FELI.v01",
  "coleccion-feli-v01": "COLECCION_FELI.v01",
  "venus-feli": "VENUS_FELI.v01",
  "venus-feli-v01": "VENUS_FELI.v01",
  "pensador-feli": "PENSADOR_FELI.v01",
  "pensador-feli-v01": "PENSADOR_FELI.v01",
  "happensador-v01": "PENSADOR_FELI.v01",
  "david-feli": "DAVID_FELI.v01",
  "david-feli-v01": "DAVID_FELI.v01",
  "vorator-coronarum": "PA-001 · VORATOR CORONARUM",
  "vorator-coronarum-v01": "PA-001 · VORATOR CORONARUM",
  "pa-001": "PA-001 · VORATOR CORONARUM",
  "sphinx-tenebrosa": "PA-002 · SPHINX TENEBROSA",
  "sphinx-tenebrosa-v01": "PA-002 · SPHINX TENEBROSA",
  "pa-002": "PA-002 · SPHINX TENEBROSA",
  "geminae-doloris": "PA-003 · GEMINAE DOLORIS",
  "geminae-doloris-v01": "PA-003 · GEMINAE DOLORIS",
  "pa-003": "PA-003 · GEMINAE DOLORIS",
  "aureus-mendicans": "PA-004 · AUREUS MENDICANS",
  "aureus-mendicans-v01": "PA-004 · AUREUS MENDICANS",
  "pa-004": "PA-004 · AUREUS MENDICANS",
  gabito: "GABITO.v01",
  "gabito-v01": "GABITO.v01",
  quijotico: "QUIJOTICO.v01",
  "quijotico-v01": "QUIJOTICO.v01",
  gotimonda: "GOTIMONDA.v01",
  "gotimonda-v01": "GOTIMONDA.v01",
  "parchao-v01": "PARCHAO.v01",
  "melisimo-v01": "MELISIMO.v01",
};

const PREORDER_PRODUCTS = {
  "camiseta-blanca": { name: "CAMISETA_BLANCA", price: 20.4, sizes: ["S", "M", "L", "XL"] },
  "camiseta-negra": { name: "CAMISETA_NEGRA", price: 22.8, sizes: ["S", "M", "L", "XL"] },
  gorra: { name: "GORRA", price: 26.4, sizes: ["unitalla"] },
  superhombresito: { name: "NIETZSCHESITO.v01", price: 58, sizes: ["pieza-unica"] },
};

const CHECKOUT_PRODUCTS = {
  "camiseta-blanca": {
    slug: "camiseta-blanca",
    name: "CAMISETA_BLANCA",
    title: "CAMISETA_BLANCA · Camiseta blanca",
    description:
      "Camiseta blanca Simio Plateado. Tallas disponibles: S, M, L y XL. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 20.4,
    defaultPriceCop: 81600,
    stock: null,
    sizes: ["S", "M", "L", "XL"],
    enabled: true,
  },
  "camiseta-negra": {
    slug: "camiseta-negra",
    name: "CAMISETA_NEGRA",
    title: "CAMISETA_NEGRA · Camiseta negra",
    description:
      "Camiseta negra Simio Plateado. Tallas disponibles: S, M, L y XL. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 22.8,
    defaultPriceCop: 91200,
    stock: null,
    sizes: ["S", "M", "L", "XL"],
    enabled: true,
  },
  gorra: {
    slug: "gorra",
    name: "GORRA",
    title: "GORRA · Gorra",
    description:
      "Gorra Simio Plateado. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 26.4,
    defaultPriceCop: 105600,
    stock: null,
    sizes: ["unitalla"],
    enabled: true,
  },
  superhombresito: {
    slug: "superhombresito",
    name: "NIETZSCHESITO.v01",
    title: "NIETZSCHESITO.v01 · Superhombresito",
    description:
      "Figura FDM intervenida a mano, acabado dorado. Medidas aproximadas: 17,5 cm alto x 10,5 cm ancho x 9 cm profundo. Tirada inicial de 10 unidades. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 58,
    defaultPriceCop: 230000,
    stock: 10,
    enabled: true,
  },
  marxito: {
    slug: "marxito",
    name: "MARXITO.v01",
    title: "MARXITO.v01",
    description:
      "Figura FDM intervenida a mano. Medidas aproximadas: 18 cm alto x 12 cm ancho x 11 cm profundo. Tirada inicial de 10 unidades. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 63,
    defaultPriceCop: 250000,
    stock: 10,
    enabledEnv: "SIMIO_MARXITO_CHECKOUT_ENABLED",
  },
  traumin: {
    slug: "traumin",
    name: "TRAUMIN.v01",
    title: "TRAUMIN.v01 · Traumin",
    description:
      "Figura FDM intervenida a mano, acabado dorado. Medidas aproximadas: 18 cm alto x 11 cm ancho x 11 cm profundo. Tirada inicial de 10 unidades. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 55,
    defaultPriceCop: 220000,
    stock: 10,
    enabled: true,
  },
  jarron: {
    slug: "jarron",
    name: "KRAKEN_FLORERO.v01",
    title: "KRAKEN_FLORERO.v01 · Kraken Florero",
    description:
      "Kraken Florero FDM de línea intervenido a mano, acabado negro brillante. Medidas aproximadas: 15,2 cm alto x 9,9 cm ancho x 10,3 cm profundo. Tirada inicial de 5 unidades. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 55,
    defaultPriceCop: 220000,
    stock: 5,
    enabled: true,
  },
  cthulito: {
    slug: "cthulito",
    name: "CTHULITO.v01",
    title: "CTHULITO.v01",
    description:
      "CTHULITO.v01 FDM intervenido a mano, acabado dorado brillante. Medidas aproximadas: 11 cm alto x 18,5 cm ancho x 16,5 cm profundo. Tirada inicial de 3 unidades. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 75,
    defaultPriceCop: 300000,
    stock: 3,
    enabled: true,
  },
  quijotico: {
    slug: "quijotico",
    name: "QUIJOTICO.v01",
    title: "QUIJOTICO.v01",
    description:
      "QUIJOTICO.v01 FDM intervenido a mano, acabado dorado brillante. Pieza física disponible, con lanza fina y alto nivel de detalle. Medidas finales por confirmar antes de despacho. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 65,
    defaultPriceCop: 260000,
    stock: 1,
    enabled: true,
  },
  gabito: {
    slug: "gabito",
    name: "GABITO.v01",
    title: "GABITO.v01",
    description:
      "GABITO.v01 FDM intervenido a mano, acabado dorado brillante. Medidas aproximadas en caja: 16 cm alto x 10 cm ancho x 10 cm profundo. Pieza física disponible. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 60,
    defaultPriceCop: 240000,
    stock: 1,
    enabled: true,
  },
  poesito: {
    slug: "poesito",
    name: "POESITO.v01",
    title: "POESITO.v01",
    description:
      "POESITO.v01 FDM intervenido a mano, acabado dorado brillante. Medidas aproximadas: 18 cm alto x 11 cm ancho x 11 cm profundo. Pieza física disponible. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 58,
    defaultPriceCop: 230000,
    stock: 1,
    enabled: true,
  },
  dostoiecito: {
    slug: "dostoiecito",
    name: "MINI_FIODOR.v01",
    title: "MINI_FIODOR.v01 · Mini Fiodor",
    description:
      "MINI_FIODOR.v01 FDM intervenido a mano, acabado rosa brillante. Medidas aproximadas: 18 cm alto x 11 cm ancho x 11 cm profundo. Pieza física disponible. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 58,
    defaultPriceCop: 230000,
    stock: 1,
    enabled: true,
  },
  acefalo: {
    slug: "acefalo",
    name: "ACEFALO.v01",
    title: "ACEFALO.v01",
    description:
      "ACEFALO.v01 FDM intervenido a mano, acabado rosa brillante. Medidas aproximadas: 25 cm alto x 20 cm ancho x 5 cm profundo. Pieza física disponible, sin caja. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 50,
    defaultPriceCop: 200000,
    stock: 1,
    enabled: true,
  },
  "coleccion-feli": {
    slug: "coleccion-feli",
    name: "COLECCION_FELI.v01",
    title: "COLECCION_FELI.v01 · Venus + Pensador + David",
    description:
      "Colección de 3 piezas FDM terminadas a mano en Medellín: VENUS_FELI.v01, PENSADOR_FELI.v01 y DAVID_FELI.v01. Precio especial por llevar las tres juntas. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 100,
    defaultPriceCop: 400000,
    stock: 1,
    enabled: true,
  },
  "venus-feli": {
    slug: "venus-feli",
    name: "VENUS_FELI.v01",
    title: "VENUS_FELI.v01",
    description:
      "VENUS_FELI.v01 FDM terminada a mano en Medellín. Estatua clásica intervenida con gesto feliz. Pieza física disponible. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 37.5,
    defaultPriceCop: 150000,
    stock: 1,
    enabled: true,
  },
  "pensador-feli": {
    slug: "pensador-feli",
    name: "PENSADOR_FELI.v01",
    title: "PENSADOR_FELI.v01",
    description:
      "PENSADOR_FELI.v01 FDM terminada a mano en Medellín. Estatua pensante con gesto feliz. Pieza física disponible. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 45,
    defaultPriceCop: 180000,
    stock: 1,
    enabled: true,
  },
  "david-feli": {
    slug: "david-feli",
    name: "DAVID_FELI.v01",
    title: "DAVID_FELI.v01",
    description:
      "DAVID_FELI.v01 FDM terminada a mano en Medellín. Estatua clásica intervenida con gesto feliz. Pieza física disponible. Envío nacional incluido en Colombia. Para envíos internacionales, te contactamos antes del despacho con una cotización exacta.",
    priceUsd: 37.5,
    defaultPriceCop: 150000,
    stock: 1,
    enabled: true,
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_NAMES = {
  CO: "Colombia",
  US: "Estados Unidos",
  MX: "Mexico",
  CA: "Canada",
  ES: "Espana",
  FR: "Francia",
  DE: "Alemania",
  IT: "Italia",
  NL: "Paises Bajos",
  CL: "Chile",
  PE: "Peru",
  EC: "Ecuador",
  PA: "Panama",
};
const DEFAULT_ENABLED_COUNTRIES = Object.keys(COUNTRY_NAMES);
const DEFAULT_SHIPPING_USD = {
  CO: 0,
  US: 130,
  MX: 130,
  CA: 140,
  ES: 230,
  FR: 230,
  DE: 230,
  IT: 230,
  NL: 230,
  CL: 120,
  PE: 120,
  EC: 115,
  PA: 115,
};
const DEFAULT_INTERNATIONAL_INCLUDED_ADDON_USD = {
  CO: 0,
  US: 70,
  MX: 70,
  CA: 80,
  ES: 110,
  FR: 110,
  DE: 110,
  IT: 110,
  NL: 110,
  CL: 65,
  PE: 65,
  EC: 60,
  PA: 60,
};
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_TTL_SECONDS = 3600;
const CHECKOUT_RATE_LIMIT_MAX = 10;
const CHECKOUT_RATE_LIMIT_TTL_SECONDS = 3600;
const CHECKOUT_RECORD_TTL_SECONDS = 60 * 60 * 24 * 30;
const CHECKOUT_ISSUE_RATE_LIMIT_MAX = 12;
const CHECKOUT_ISSUE_RATE_LIMIT_TTL_SECONDS = 3600;
const CHECKOUT_ISSUE_RECORD_TTL_SECONDS = 60 * 60 * 24 * 30;
const INTERNATIONAL_QUOTE_RATE_LIMIT_MAX = 12;
const INTERNATIONAL_QUOTE_RATE_LIMIT_TTL_SECONDS = 3600;
const INTERNATIONAL_QUOTE_RECORD_TTL_SECONDS = 60 * 60 * 24 * 90;
const ENCARGOS_INTENT_RATE_LIMIT_MAX = 12;
const ENCARGOS_INTENT_RATE_LIMIT_TTL_SECONDS = 3600;
const ENCARGOS_PREVIEW_RATE_LIMIT_MAX = 24;
const ENCARGOS_PREVIEW_RATE_LIMIT_TTL_SECONDS = 3600;
const ENCARGOS_REQUEST_RATE_LIMIT_MAX = 6;
const ENCARGOS_REQUEST_RATE_LIMIT_TTL_SECONDS = 60 * 60 * 24;
const ENCARGOS_RECORD_TTL_SECONDS = 60 * 60 * 24 * 90;
const ENCARGOS_IMAGE_MAX_BYTES = 1_600_000;
const ENCARGOS_UPLOAD_MAX_BYTES = 8_000_000;
const ENCARGOS_PREVIEW_UPLOAD_TTL_SECONDS = 60 * 60 * 24;
const TRIPO_API_URL_DEFAULT = "https://openapi.tripo3d.ai/v3";
const TRIPO_IMAGE_MODEL_DEFAULT = "v3.1-20260211";
const HEALTH_MP_CACHE_TTL_SECONDS = 5 * 60;
const ANALYTICS_RATE_LIMIT_MAX = 120;
const ANALYTICS_RATE_LIMIT_TTL_SECONDS = 3600;
const ANALYTICS_RECENT_LIMIT = 150;
const ANALYTICS_EVENTS = [
  "page_view",
  "product_view",
  "buy_cta_click",
  "checkout_validation_error",
  "initiate_checkout",
  "checkout_redirect",
  "checkout_error",
  "checkout_return",
  "checkout_issue_opened",
  "checkout_issue_reported",
  "shipping_cost_viewed",
  "international_quote_started",
  "international_quote_requested",
  "international_quote_error",
  "encargos_landing_view",
  "encargos_intent",
  "encargos_step_view",
  "encargos_image_uploaded",
  "encargos_preview_started",
  "encargos_preview_pending",
  "encargos_preview_failed",
  "encargos_preview_ready",
  "encargos_manual_continue",
  "encargos_request_sent",
  "interest_started",
  "interest_registered",
  "preorder_started",
  "preorder_registered",
];
const ANALYTICS_EVENT_SET = new Set(ANALYTICS_EVENTS);
const INTERNAL_EMAIL = "numeros@simioplateado.com";
const SITE_URL = "https://simioplateado.com";
const API_URL = "https://api.simioplateado.com";
const CENTRAL_FULFILLMENT_STATES = new Set([
  "PENDIENTE_PAGO",
  "PAGADO",
  "EN_PRODUCCION",
  "EMPACADO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
]);

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

    if (url.pathname === "/api/checkout" && request.method === "OPTIONS") {
      return corsResponse(request);
    }

    if (url.pathname === "/api/checkout" && request.method === "POST") {
      return handleCheckout(request, env, ctx);
    }

    if (url.pathname === "/api/shipping-cost" && request.method === "OPTIONS") {
      return corsResponse(request, "GET, OPTIONS", "Content-Type");
    }

    if (url.pathname === "/api/shipping-cost" && request.method === "GET") {
      return handleShippingCost(request, env);
    }

    if (url.pathname === "/api/international-quote" && request.method === "OPTIONS") {
      return corsResponse(request);
    }

    if (url.pathname === "/api/international-quote" && request.method === "POST") {
      return handleInternationalQuote(request, env, ctx);
    }

    if (url.pathname === "/api/checkout-issue" && request.method === "OPTIONS") {
      return corsResponse(request);
    }

    if (url.pathname === "/api/checkout-issue" && request.method === "POST") {
      return handleCheckoutIssue(request, env, ctx);
    }

    if (url.pathname === "/api/analytics" && request.method === "OPTIONS") {
      return corsResponse(request);
    }

    if (url.pathname === "/api/analytics" && request.method === "POST") {
      return handleAnalyticsEvent(request, env);
    }

    if (url.pathname.startsWith("/api/encargos") && request.method === "OPTIONS") {
      return corsResponse(request, "GET, POST, OPTIONS", "Content-Type");
    }

    if (url.pathname === "/api/encargos/intent" && request.method === "POST") {
      return handleEncargosIntent(request, env);
    }

    if (url.pathname === "/api/encargos/preview" && request.method === "POST") {
      return handleEncargosPreview(request, env);
    }

    if (url.pathname.startsWith("/api/encargos/uploads/") && (request.method === "GET" || request.method === "HEAD")) {
      return handleEncargosPreviewUpload(request, env);
    }

    if (url.pathname.startsWith("/api/encargos/tripo-task/") && request.method === "GET") {
      return handleEncargosTripoTask(request, env);
    }

    if (url.pathname === "/api/encargos/request" && request.method === "POST") {
      return handleEncargosRequest(request, env, ctx);
    }

    if (url.pathname.startsWith("/api/encargos/request/") && url.pathname.endsWith("/payment") && request.method === "POST") {
      return handleEncargosPaymentLink(request, env, ctx);
    }

    if (url.pathname.startsWith("/api/encargos/request/") && request.method === "GET") {
      return handleEncargosRequestView(request, env);
    }

    if (url.pathname === "/api/health" && request.method === "OPTIONS") {
      return corsResponse(request, "GET, OPTIONS");
    }

    if (url.pathname === "/api/health" && request.method === "GET") {
      return handleHealth(request, env);
    }

    if (url.pathname === "/api/mercadopago/webhook" && request.method === "POST") {
      return handleMercadoPagoWebhook(request, env, ctx);
    }

    if (url.pathname.startsWith("/api/central") && request.method === "OPTIONS") {
      return corsResponse(request, "GET, POST, OPTIONS", "Content-Type, Authorization, X-Simio-Central-Code");
    }

    if (url.pathname.startsWith("/api/central")) {
      return handleCentral(request, env, ctx);
    }

    if (url.pathname === "/api/admin/votes" && request.method === "GET") {
      return handleAdminVotes(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

async function handleHealth(request, env) {
  const checks = {
    kv_votes: await checkVotesKv(env),
    mp_token_set: Boolean(env.MERCADOPAGO_ACCESS_TOKEN),
    mp_api_reachable: await checkMercadoPagoHealth(env),
    mailchannels_set: Boolean(env.MAILCHANNELS_API_KEY || (env.EMAIL && typeof env.EMAIL.send === "function")),
  };
  const ok = Object.values(checks).every(Boolean);

  return jsonResponse(
    request,
    {
      ok,
      checks,
      service: "simio-sondeo",
      timestamp: new Date().toISOString(),
    },
    ok ? 200 : 503,
  );
}

async function checkVotesKv(env) {
  try {
    if (!env.VOTES || typeof env.VOTES.put !== "function" || typeof env.VOTES.get !== "function") {
      return false;
    }
    const key = `health:kv:${crypto.randomUUID()}`;
    await env.VOTES.put(key, "ok", { expirationTtl: 60 });
    return (await env.VOTES.get(key)) === "ok";
  } catch {
    return false;
  }
}

async function checkMercadoPagoHealth(env) {
  if (!env.MERCADOPAGO_ACCESS_TOKEN || !env.VOTES) return false;

  const cacheKey = "health:mercadopago";
  try {
    const cached = await env.VOTES.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Date.now() - parsed.ts < HEALTH_MP_CACHE_TTL_SECONDS * 1000) {
        return Boolean(parsed.ok);
      }
    }
  } catch {}

  let ok = false;
  try {
    await mercadoPagoRequest(env, "/users/me", { method: "GET" });
    ok = true;
  } catch {
    ok = false;
  }

  try {
    await env.VOTES.put(cacheKey, JSON.stringify({ ok, ts: Date.now() }), {
      expirationTtl: HEALTH_MP_CACHE_TTL_SECONDS,
    });
  } catch {}

  return ok;
}

async function handleEncargosIntent(request, env) {
  const rateLimit = await takeRateLimitedSlot(
    env,
    request,
    "encargos:intent:rate",
    ENCARGOS_INTENT_RATE_LIMIT_MAX,
    ENCARGOS_INTENT_RATE_LIMIT_TTL_SECONDS,
  );

  if (!rateLimit.allowed) {
    return jsonResponse(request, {
      ok: true,
      registered: false,
      reason: "rate_limited",
      retry_after: rateLimit.retryAfter,
    });
  }

  const dateKey = bogotaDateKey();
  await incrementCounter(env, `encargos:metrics:intent:${dateKey}`);
  await incrementCounter(env, "encargos:metrics:intent:total");

  return jsonResponse(request, { ok: true, registered: true, remaining: rateLimit.remaining });
}

async function handleEncargosPreview(request, env) {
  const rateLimit = await takeRateLimitedSlot(
    env,
    request,
    "encargos:preview:rate",
    envNumber(env, "ENCARGOS_PREVIEW_RATE_LIMIT_MAX", ENCARGOS_PREVIEW_RATE_LIMIT_MAX),
    ENCARGOS_PREVIEW_RATE_LIMIT_TTL_SECONDS,
  );

  if (!rateLimit.allowed) {
    return jsonResponse(
      request,
      {
        error: "rate_limited",
        message: "Demasiados intentos en poco tiempo. Espera un momento y vuelve a probar.",
        retry_after: rateLimit.retryAfter,
      },
      429,
    );
  }

  if (!isTripoEnabled(env)) {
    return jsonResponse(
      request,
      {
        error: "tripo_no_configurado",
        message:
          "Tripo3D todavia no esta configurado en el servidor. Falta guardar la clave TRIPO3D_API_KEY.",
      },
      503,
    );
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return jsonResponse(request, { error: "form_invalido", message: "No pudimos leer la imagen." }, 400);
  }

  const email = normalizeEmail(form.get("email"));
  if (!email) {
    return jsonResponse(request, { error: "email_invalido", message: "Escribe un email valido." }, 400);
  }

  const rawImageUrl = form.get("image_url");
  const imageUrl = normalizeTripoImageUrl(rawImageUrl);
  if (rawImageUrl && !imageUrl) {
    return jsonResponse(
      request,
      { error: "imagen_url_invalida", message: "La URL de imagen debe ser publica y comenzar por https://." },
      400,
    );
  }

  const image = form.get("image");
  if (!imageUrl && !isValidImageFile(image)) {
    return jsonResponse(
      request,
      { error: "imagen_invalida", message: "Sube una imagen JPG o PNG de maximo 8 MB." },
      400,
    );
  }

  const maxPerDay = envNumber(env, "MAX_MODELS_PER_EMAIL_PER_DAY", 6);
  const usage = await getEncargosPreviewUsage(env, email);
  if (usage.count >= maxPerDay) {
    return jsonResponse(
      request,
      {
        error: "limite_email",
        message: `Este email ya uso sus ${maxPerDay} generaciones de prueba de hoy. Puedes enviar la solicitud con una vista ya generada o volver manana.`,
        used: usage.count,
        remaining: 0,
        reset: `${usage.date}T24:00:00-05:00`,
      },
      429,
    );
  }

  const input = {
    email,
    tipo: cleanText(form.get("tipo"), 80) || "figura completa",
    acabado: cleanText(form.get("acabado"), 80) || "dorado",
    size: cleanText(form.get("size"), 8) || "M",
    indicaciones: cleanText(form.get("indicaciones"), 700),
  };
  const debug = cleanText(form.get("debug"), 12) === "1";
  if (input.indicaciones.length < 8) {
    return jsonResponse(
      request,
      {
        error: "sujeto_requerido",
        message: "Esta indicacion es obligatoria. Escribe al menos 8 caracteres: ej. solo el gato, sin silla ni fondo.",
      },
      400,
    );
  }
  const prompt = buildEncargosPrompt(input);

  let tripoInputSource = imageUrl ? "url" : "file_token";
  let tripoImageUrl = imageUrl;

  try {
    const tripo = tripoImageUrl
      ? await runTripoImageUrlToModel(env, tripoImageUrl, input, tripoInputSource)
      : await runTripoImageToModel(env, image, input);
    const shouldCountUsage = shouldCountEncargosPreviewUsage(tripo);
    const used = shouldCountUsage ? usage.count + 1 : usage.count;
    if (shouldCountUsage) {
      await markEncargosPreviewUsage(env, email, used);
    }
    await incrementCounter(env, `encargos:metrics:preview:${bogotaDateKey()}`);
    await incrementCounter(env, "encargos:metrics:preview:total");

    const status = tripo.status === "success" ? 200 : 202;
    return jsonResponse(
      request,
      {
        ok: true,
        mode: "tripo",
        provider: "tripo3d",
        prompt,
        preview_data_url: "",
        tripo,
        task_id: tripo.task_id,
        status: tripo.status,
        progress: tripo.progress,
        model_url: tripo.model_url,
        rendered_image_url: tripo.rendered_image_url,
        used,
        remaining: Math.max(0, maxPerDay - used),
        message:
          tripo.status === "success"
            ? "Modelo 3D generado con Tripo. Revisa la pieza y continua con las opciones."
            : "Tripo ya esta generando el modelo. La pagina seguira consultando hasta que este listo.",
      },
      status,
    );
  } catch (error) {
    await recordEncargosFailure(env, "preview", {
      email_hash: await sha256(email),
      error: error && (error.code || error.message) ? error.code || error.message : "unknown",
      status: error && error.status ? error.status : 0,
      tripo_path: cleanText(error && error.path, 160),
      provider_message: cleanText(error && (error.providerMessage || error.message), 280),
      input_source: tripoInputSource,
      timestamp: new Date().toISOString(),
    });

    return jsonResponse(
      request,
      {
        error: "tripo_error",
        message:
          error && error.publicMessage
            ? error.publicMessage
            : "Tripo no pudo generar el modelo ahora. Intenta con una imagen mas clara o vuelve a probar en unos minutos.",
        ...(debug
          ? {
              debug: {
                status: error && error.status ? error.status : 0,
                code: cleanText(error && (error.code || error.message), 160),
                tripo_path: cleanText(error && error.path, 160),
                provider_message: cleanText(error && (error.providerMessage || error.message), 280),
                input_source: tripoInputSource,
                tripo_image_url: cleanText(tripoImageUrl, 1200),
              },
            }
          : {}),
      },
      error && error.status ? error.status : 502,
    );
  }
}

async function saveEncargosPreviewUpload(env, imageFile) {
  const token = createPublicToken();
  const baseKey = `encargos:preview:upload:${token}`;
  const body = await imageFile.arrayBuffer();
  const metadata = {
    contentType: imageFile.type === "image/png" ? "image/png" : "image/jpeg",
    filename: safeTripoFileName(imageFile),
    size: Number(imageFile.size) || body.byteLength || 0,
    created_at: new Date().toISOString(),
  };

  await env.VOTES.put(`${baseKey}:body`, body, {
    expirationTtl: ENCARGOS_PREVIEW_UPLOAD_TTL_SECONDS,
  });
  await env.VOTES.put(`${baseKey}:meta`, JSON.stringify(metadata), {
    expirationTtl: ENCARGOS_PREVIEW_UPLOAD_TTL_SECONDS,
  });

  const apiUrl = String(env.SIMIO_API_URL || "https://api.simioplateado.com").replace(/\/+$/, "");
  return {
    token,
    url: `${apiUrl}/api/encargos/uploads/${token}`,
    ...metadata,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForEncargosPreviewUpload(url) {
  // Workers KV can take a few seconds to be visible from the region where Tripo fetches the image.
  // Avoid self-fetching the custom domain from inside the Worker; that can return Cloudflare 522.
  void url;
  await sleep(8000);
  return true;
}

async function handleEncargosPreviewUpload(request, env) {
  const token = cleanText(new URL(request.url).pathname.split("/").pop(), 80);
  if (!/^[a-f0-9]{36}$/.test(token)) {
    return new Response("Imagen no encontrada.", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const baseKey = `encargos:preview:upload:${token}`;
  const [body, rawMeta] = await Promise.all([
    env.VOTES.get(`${baseKey}:body`, { type: "arrayBuffer" }),
    env.VOTES.get(`${baseKey}:meta`),
  ]);

  if (!body) {
    return new Response("Imagen no encontrada.", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  let metadata = {};
  try {
    metadata = rawMeta ? JSON.parse(rawMeta) : {};
  } catch {
    metadata = {};
  }

  return new Response(request.method === "HEAD" ? null : body, {
    status: 200,
    headers: {
      "Content-Type": metadata.contentType === "image/png" ? "image/png" : "image/jpeg",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

async function handleEncargosTripoTask(request, env) {
  if (!isTripoEnabled(env)) {
    return jsonResponse(
      request,
      {
        error: "tripo_no_configurado",
        message: "Tripo3D todavia no esta configurado en el servidor.",
      },
      503,
    );
  }

  const url = new URL(request.url);
  const taskId = cleanText(url.pathname.split("/").pop(), 80);
  if (!/^(task_[A-Za-z0-9_-]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(taskId)) {
    return jsonResponse(request, { error: "task_invalida", message: "Tarea Tripo invalida." }, 400);
  }

  try {
    const tripo = await getTripoTask(env, taskId);
    return jsonResponse(request, {
      ok: true,
      mode: "tripo",
      provider: "tripo3d",
      tripo,
      task_id: tripo.task_id,
      status: tripo.status,
      progress: tripo.progress,
      model_url: tripo.model_url,
      rendered_image_url: tripo.rendered_image_url,
      message:
        tripo.status === "success"
          ? "Modelo 3D listo."
          : tripo.status === "failed" || tripo.status === "cancelled"
            ? "Tripo no pudo completar este modelo."
            : "Modelo 3D en proceso.",
    });
  } catch (error) {
    return jsonResponse(
      request,
      {
        error: "tripo_task_error",
        message: "No pudimos consultar la tarea de Tripo ahora.",
      },
      error && error.status ? error.status : 502,
    );
  }
}

async function handleEncargosRequest(request, env, ctx) {
  const rateLimit = await takeRateLimitedSlot(
    env,
    request,
    "encargos:request:rate",
    ENCARGOS_REQUEST_RATE_LIMIT_MAX,
    ENCARGOS_REQUEST_RATE_LIMIT_TTL_SECONDS,
  );

  if (!rateLimit.allowed) {
    return jsonResponse(
      request,
      {
        error: "rate_limited",
        message: "Demasiadas solicitudes desde esta conexion. Escribenos si necesitas ayuda.",
        retry_after: rateLimit.retryAfter,
      },
      429,
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, { error: "json_invalido", message: "Solicitud invalida." }, 400);
  }

  const email = normalizeEmail(body.email);
  const nombre = cleanText(body.nombre, 120);
  const telefono = cleanText(body.telefono, 80);
  const ciudad = cleanText(body.ciudad, 100);
  const pais = cleanText(body.pais, 100);
  const observaciones = cleanText(body.observaciones, 900);
  const modelNotes = cleanText(body.model_notes || body.modelNotes, 900);
  const options = normalizeEncargosOptions(body.options || {});
  const image = validateImageDataUrl(body.imageDataUrl);
  const preview = body.previewDataUrl ? validateImageDataUrl(body.previewDataUrl, true) : { ok: true, dataUrl: "" };
  const tripo = normalizeTripoPayload(body.tripo || body);

  if (!email) {
    return jsonResponse(request, { error: "email_invalido", message: "Escribe un email valido." }, 400);
  }

  if (!nombre || !telefono || !ciudad || !pais) {
    return jsonResponse(
      request,
      { error: "datos_incompletos", message: "Completa nombre, telefono, ciudad y pais." },
      400,
    );
  }


  if (!image.ok) {
    return jsonResponse(request, { error: image.error, message: image.message }, 400);
  }

  if (!preview.ok) {
    return jsonResponse(request, { error: preview.error, message: preview.message }, 400);
  }

  if (!body.terms?.rights || !body.terms?.estimate || !body.terms?.legal) {
    return jsonResponse(
      request,
      { error: "terminos_requeridos", message: "Acepta las tres confirmaciones antes de enviar." },
      400,
    );
  }

  const id = await createEncargoId(env);
  const token = createPublicToken();
  const price = calculateEncargosPrice(options, env);
  const timestamp = new Date().toISOString();
  const encargo = {
    id,
    token,
    timestamp,
    estado: "RECIBIDO",
    cliente: { nombre, email, telefono, ciudad, pais },
    observaciones,
    model_notes: modelNotes,
    options,
    price,
    conceptual_prompt: cleanText(body.conceptualPrompt, 1600),
    image_data_url: image.dataUrl,
    preview_data_url: preview.dataUrl || "",
    tripo,
    source_url: cleanText(body.sourceUrl, 500),
    user_agent: cleanText(request.headers.get("User-Agent"), 240),
    ip_hash: rateLimit.ipHash,
  };

  await saveEncargo(env, encargo);
  await incrementCounter(env, `encargos:metrics:request:${bogotaDateKey()}`);
  await incrementCounter(env, "encargos:metrics:request:total");

  const emails = await sendEncargosEmails(env, encargo).catch((error) => ({
    ok: false,
    internal: false,
    customer: false,
    errors: [error && (error.code || error.message) ? error.code || error.message : "unknown"],
  }));

  if (!emails.ok && ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(recordEncargosFailure(env, "email", { id, errors: emails.errors, timestamp }));
  }

  return jsonResponse(request, {
    ok: true,
    id,
    price,
    notified_internal: Boolean(emails.internal),
    notified_customer: Boolean(emails.customer),
  });
}

async function handleEncargosRequestView(request, env) {
  const url = new URL(request.url);
  const id = cleanText(url.pathname.split("/").pop(), 40);
  const token = cleanText(url.searchParams.get("token"), 120);
  const encargo = await getEncargo(env, id);

  if (!encargo) {
    return new Response("Solicitud no encontrada.", { status: 404 });
  }

  if (!token || token !== encargo.token) {
    return new Response("Token invalido.", { status: 403 });
  }

  return new Response(renderEncargoAdminHtml(encargo), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function handleEncargosPaymentLink(request, env, ctx) {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const id = cleanText(segments[3], 40);
  const token = cleanText(url.searchParams.get("token"), 120);
  const encargo = await getEncargo(env, id);

  if (!encargo) {
    return new Response("Solicitud no encontrada.", { status: 404 });
  }

  if (!token || token !== encargo.token) {
    return new Response("Token invalido.", { status: 403 });
  }

  if (!env.MERCADOPAGO_ACCESS_TOKEN) {
    return renderEncargoAdminResponse(encargo, "Mercado Pago no esta configurado en este Worker.", 503);
  }

  let body;
  try {
    body = await readEncargosPaymentBody(request);
  } catch {
    return renderEncargoAdminResponse(encargo, "No pude leer los datos de cotizacion.", 400);
  }

  const priceCop = parseCopAmount(body.final_price_cop || body.price_cop || body.priceCop);
  if (!priceCop || priceCop < 10_000 || priceCop > 20_000_000) {
    return renderEncargoAdminResponse(encargo, "Escribe un precio final valido en COP.", 400);
  }

  const quoteTitle =
    cleanText(body.title, 140) ||
    `Encargo personalizado ${encargo.id}`;
  const quoteDescription =
    cleanText(body.description, 500) ||
    `Pieza personalizada Simio Plateado. Solicitud ${encargo.id}.`;
  const quoteNote = cleanText(body.quote_note || body.note, 1200);
  const sendToCustomer = Boolean(body.send_email);
  const now = new Date().toISOString();
  const orderId = await createOrderId(env);
  const checkoutId = crypto.randomUUID();
  const slug = `encargo-${encargo.id.toLowerCase()}`;
  const externalReference = `simio:${slug}:${checkoutId}:${orderId}`;
  const shipping = {
    linea1: "",
    ciudad: encargo.cliente?.ciudad || "",
    departamento: "",
    pais: encargo.cliente?.pais || "Colombia",
    codigo_postal: "",
    notas: `Encargo personalizado ${encargo.id}`,
  };
  const checkout = {
    id: checkoutId,
    order_id: orderId,
    slug,
    encargo_id: encargo.id,
    product: quoteTitle,
    title: quoteTitle,
    price_usd: null,
    price_cop: priceCop,
    currency: "COP",
    stock: null,
    talla: encargo.options?.size || null,
    lang: "es",
    provider: "mercadopago",
    status: "created",
    timestamp: now,
    ip_hash: "",
    customer_email: encargo.cliente?.email || "",
    customer_name: encargo.cliente?.nombre || "",
  };
  const order = {
    id: orderId,
    external_reference: externalReference,
    checkout_id: checkoutId,
    encargo_id: encargo.id,
    pieza: quoteTitle,
    title: quoteTitle,
    slug,
    talla: encargo.options?.size || null,
    tipo: "encargo_personalizado",
    monto_usd: null,
    monto: priceCop,
    moneda: "COP",
    cliente_nombre: encargo.cliente?.nombre || "",
    cliente_email: encargo.cliente?.email || "",
    cliente_telefono: encargo.cliente?.telefono || "",
    direccion: shipping,
    lang: "es",
    fecha: now,
    mp_payment_id: null,
    mp_status: "preference_pending",
    estado_pago: "PENDIENTE",
    estado_fulfillment: "PENDIENTE_PAGO",
    guia: "",
    transportadora: "",
    fecha_envio: null,
    checklist: {
      producido: false,
      control_calidad: false,
      empacado: false,
      enviado: false,
    },
    notas_internas: [
      `Orden creada desde encargo personalizado ${encargo.id}.`,
      quoteNote ? `Nota cotizacion: ${quoteNote}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    updated_at: now,
  };

  await saveOrder(env, order);
  await env.VOTES.put(`checkout:order:${checkoutId}`, orderId);
  await env.VOTES.put(`order:external:${externalReference}`, orderId);
  await env.VOTES.put(`checkout:${checkoutId}`, JSON.stringify(checkout), {
    expirationTtl: CHECKOUT_RECORD_TTL_SECONDS,
  });
  await env.VOTES.put(`checkout:external:${externalReference}`, checkoutId, {
    expirationTtl: CHECKOUT_RECORD_TTL_SECONDS,
  });

  let preference;
  try {
    preference = await createMercadoPagoPreference(env, {
      slug,
      name: quoteTitle,
      title: quoteTitle,
      description: quoteDescription,
      priceUsd: null,
      priceCop,
      stock: null,
      externalReference,
      checkoutId,
      orderId,
      customer: {
        nombre: encargo.cliente?.nombre || "",
        email: encargo.cliente?.email || "",
        telefono: encargo.cliente?.telefono || "",
      },
      shipping,
      talla: encargo.options?.size || null,
      lang: "es",
    });
  } catch (error) {
    const failure = checkoutFailureData(checkout, error);
    await saveOrder(env, {
      ...order,
      mp_status: "preference_error",
      estado_pago: "ERROR_CHECKOUT",
      notas_internas: `${order.notas_internas}\nMercado Pago no pudo crear preferencia: ${failure.error}`,
      updated_at: new Date().toISOString(),
    });

    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(recordCheckoutFailure(env, slug, failure));
    } else {
      await recordCheckoutFailure(env, slug, failure);
    }

    return renderEncargoAdminResponse(encargo, "Mercado Pago no pudo crear el link. Revisa la configuracion o intenta otra vez.", 502);
  }

  const checkoutUrl = preference.init_point || preference.sandbox_init_point;
  if (!checkoutUrl) {
    return renderEncargoAdminResponse(encargo, "Mercado Pago no devolvio un link de checkout.", 502);
  }

  const savedCheckout = {
    ...checkout,
    status: "preference_created",
    external_reference: externalReference,
    preference_id: preference.id || null,
    checkout_url: checkoutUrl,
    shipping_summary: formatOrderAddress(order),
  };
  const quote = {
    price_cop: priceCop,
    title: quoteTitle,
    description: quoteDescription,
    note: quoteNote,
    checkout_id: checkoutId,
    order_id: orderId,
    preference_id: preference.id || null,
    checkout_url: checkoutUrl,
    generated_at: now,
    sent_to_customer: false,
    sent_at: null,
  };
  const updatedEncargo = {
    ...encargo,
    estado: "COTIZADO",
    quote,
    updated_at: now,
  };

  await env.VOTES.put(`checkout:${checkoutId}`, JSON.stringify(savedCheckout), {
    expirationTtl: CHECKOUT_RECORD_TTL_SECONDS,
  });
  await saveOrder(env, {
    ...order,
    mp_status: "preference_created",
    preference_id: preference.id || null,
    checkout_url: checkoutUrl,
    updated_at: new Date().toISOString(),
  });

  let customerEmailResult = { ok: false };
  if (sendToCustomer) {
    customerEmailResult = await captureEmailResult(() => sendEncargosPaymentLinkCustomerEmail(env, updatedEncargo));
    quote.sent_to_customer = Boolean(customerEmailResult.ok);
    quote.sent_at = customerEmailResult.ok ? new Date().toISOString() : null;
    updatedEncargo.quote = quote;
  }

  await updateEncargo(env, updatedEncargo);

  const internalEmail = sendEncargosPaymentLinkInternalEmail(env, updatedEncargo).catch(() => null);
  if (ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(internalEmail);
  } else {
    await internalEmail;
  }

  return renderEncargoAdminResponse(
    updatedEncargo,
    sendToCustomer && customerEmailResult.ok
      ? "Link de pago generado y enviado al cliente."
      : sendToCustomer
        ? "Link de pago generado, pero el email al cliente no pudo confirmarse. Copia el link manualmente."
      : "Link de pago generado. Puedes copiarlo o enviarlo desde aqui.",
  );
}

async function readEncargosPaymentBody(request) {
  const contentType = request.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return request.json();
  }

  const form = await request.formData();
  const body = {};
  for (const [key, value] of form.entries()) {
    body[key] = typeof value === "string" ? value : "";
  }
  return body;
}

function parseCopAmount(value) {
  const cleaned = String(value || "").replace(/[^\d]/g, "");
  const amount = Number(cleaned);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.round(amount);
}

function renderEncargoAdminResponse(encargo, message, status = 200) {
  return new Response(renderEncargoAdminHtml(encargo, message), {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!email || email.length > 200 || !EMAIL_RE.test(email)) return "";
  return email;
}

function isValidImageFile(file) {
  return (
    file &&
    typeof file === "object" &&
    typeof file.type === "string" &&
    typeof file.size === "number" &&
    ["image/jpeg", "image/png"].includes(file.type) &&
    file.size > 0 &&
    file.size <= ENCARGOS_UPLOAD_MAX_BYTES
  );
}

function normalizeTripoImageUrl(value) {
  const raw = cleanText(value, 1200);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function isTripoEnabled(env) {
  return Boolean(env.TRIPO3D_API_KEY);
}

function shouldCountEncargosPreviewUsage(tripo) {
  const status = String((tripo && tripo.status) || "").toLowerCase();
  return Boolean(
    tripo &&
      tripo.task_id &&
      !tripo.not_counted &&
      status !== "failed" &&
      status !== "cancelled",
  );
}

async function getEncargosPreviewUsage(env, email) {
  const date = bogotaDateKey();
  const key = `encargos:preview:email:${await sha256(email)}:${date}`;
  const count = parseInt((await env.VOTES.get(key)) || "0", 10);
  return { key, date, count: Number.isFinite(count) ? count : 0 };
}

async function markEncargosPreviewUsage(env, email, nextCount) {
  const usage = await getEncargosPreviewUsage(env, email);
  await env.VOTES.put(usage.key, String(nextCount), { expirationTtl: 60 * 60 * 36 });
}

function bogotaDateKey(date = new Date()) {
  return new Date(date.getTime() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function envNumber(env, key, fallback) {
  const value = Number(env[key]);
  return Number.isFinite(value) ? value : fallback;
}

function parseEnvList(env, key, fallback) {
  const raw = String(env[key] || fallback || "");
  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeEncargosOptions(options) {
  const size = ["S", "M", "L", "XL"].includes(String(options.size || "").toUpperCase())
    ? String(options.size).toUpperCase()
    : "M";
  const quantity = Math.max(1, Math.min(6, parseInt(options.quantity || "1", 10) || 1));
  const cityZone = ["medellin", "colombia", "internacional"].includes(options.cityZone)
    ? options.cityZone
    : "medellin";
  const graffiti = ["ninguno", "negras", "plateadas"].includes(options.graffiti) ? options.graffiti : "ninguno";

  return {
    size,
    quantity,
    finish: cleanText(options.finish, 50) || "blanco",
    tipo: cleanText(options.tipo, 80) || "figura completa",
    cityZone,
    graffiti,
    keychain: Boolean(options.keychain),
    caseSelected: Boolean(options.caseSelected),
    caseText: cleanText(options.caseText, envNumber({}, "CASE_TEXT_MAX_CHARS", 20)),
    modelNotes: cleanText(options.modelNotes || options.model_notes, 900),
  };
}

function calculateEncargosPrice(options, env) {
  const size = options.size || "M";
  const quantity = options.quantity || 1;
  const finish = String(options.finish || "blanco").toLowerCase();
  const baseBySize = {
    S: envNumber(env, "PRICE_BASE_S", 120000),
    M: envNumber(env, "PRICE_BASE_M", 160000),
    L: envNumber(env, "PRICE_BASE_L", 190000),
    XL: envNumber(env, "PRICE_BASE_XL", 215000),
  };
  const caseBySize = {
    S: envNumber(env, "PRICE_CASE_S", 30000),
    M: envNumber(env, "PRICE_CASE_M", 40000),
    L: envNumber(env, "PRICE_CASE_L", 50000),
    XL: envNumber(env, "PRICE_CASE_XL", 60000),
  };
  const multipliers = [
    envNumber(env, "MULTIPLIER_PIECE_1", 1),
    envNumber(env, "MULTIPLIER_PIECE_2", 0.8),
    envNumber(env, "MULTIPLIER_PIECE_3", 0.7),
    envNumber(env, "MULTIPLIER_PIECE_4", 0.6),
  ];
  const premiumFinishes = new Set(parseEnvList(env, "COLORS_PREMIUM", "dorado,plateado,rosado,plateado_mate"));
  const premiumAddon = premiumFinishes.has(finish) ? envNumber(env, "PRICE_PREMIUM_FINISH_ADDON", 20000) : 0;
  const unitBeforeDiscount = baseBySize[size] + premiumAddon;
  const lines = [];
  let piecesSubtotal = 0;

  for (let index = 1; index <= quantity; index += 1) {
    const multiplier = multipliers[index - 1] || envNumber(env, "MULTIPLIER_PIECE_5_PLUS", 0.5);
    const amount = Math.round(unitBeforeDiscount * multiplier);
    piecesSubtotal += amount;
    lines.push({
      label: `Pieza ${index} (${size}, ${finish})`,
      amount,
      note: index === 1 ? "" : `${Math.round((1 - multiplier) * 100)}% off`,
    });
  }

  const caseUnit = options.caseSelected ? caseBySize[size] : 0;
  const casesSubtotal = caseUnit * quantity;
  if (casesSubtotal) {
    lines.push({ label: `Estuche personalizado (${quantity})`, amount: casesSubtotal, note: "texto gratis" });
  }

  const keychainSubtotal = options.keychain ? envNumber(env, "PRICE_KEYCHAIN_ADDON", 35000) : 0;
  if (keychainSubtotal) {
    lines.push({ label: "Mini llavero", amount: keychainSubtotal, note: "5-7 cm aprox." });
  }

  const shipping = shippingForEncargo(options.cityZone, env);
  if (shipping.amount !== null) {
    lines.push({ label: shipping.label, amount: shipping.amount, note: shipping.amount === 0 ? "incluido" : "" });
  } else {
    lines.push({ label: shipping.label, amount: 0, note: "cotizar aparte" });
  }

  const addonsSubtotal = casesSubtotal + keychainSubtotal;
  const total = piecesSubtotal + addonsSubtotal + (shipping.amount || 0);

  return {
    currency: "COP",
    size,
    finish,
    quantity,
    pieces_subtotal: piecesSubtotal,
    addons_subtotal: addonsSubtotal,
    shipping,
    total_estimated: total,
    estimated: true,
    lines,
  };
}

function shippingForEncargo(cityZone, env) {
  if (cityZone === "internacional") {
    return { label: "Envio internacional", amount: null, included: false };
  }
  if (cityZone === "colombia") {
    return { label: "Envio Colombia", amount: envNumber(env, "SHIPPING_COLOMBIA", 15000), included: false };
  }
  return { label: "Envio area metropolitana", amount: envNumber(env, "SHIPPING_MEDELLIN", 0), included: true };
}

function buildEncargosPrompt(input) {
  const subject = input.indicaciones
    ? `Sujeto a extraer de la imagen: ${input.indicaciones}.`
    : "Sujeto a extraer de la imagen: el elemento principal indicado por el cliente.";

  return [
    "Encargo personalizado para generar un modelo 3D preliminar con Tripo.",
    "No se debe tomar la foto completa como escena; la pieza debe centrarse en el sujeto indicado por el cliente.",
    `Tipo de pieza: ${input.tipo}. Tamano: ${input.size}. Acabado deseado: ${input.acabado}.`,
    subject,
    "Objetivo: pieza fisica imprimible, aislada, revisable y ajustable antes de cotizar produccion final.",
  ].join(" ");
}

function tripoBaseUrl(env) {
  return String(env.TRIPO3D_API_URL || TRIPO_API_URL_DEFAULT).replace(/\/+$/, "");
}

function tripoBoolean(value, fallback = true) {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() !== "false";
}

function safeTripoFileName(file) {
  const name = cleanText(file?.name, 120) || "simio-encargo.jpg";
  const ext = file?.type === "image/png" ? ".png" : ".jpg";
  const normalized = name
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized.includes(".") ? normalized : `${normalized || "simio-encargo"}${ext}`;
}

function normalizeTripoTask(raw = {}) {
  const output = raw.output && typeof raw.output === "object" ? raw.output : {};
  const modelUrls = output.model_urls;
  const modelUrl = cleanText(output.model_url, 1200)
    || cleanText(output.pbr_model_url, 1200)
    || cleanText(output.base_model_url, 1200)
    || cleanText(output.glb_url, 1200)
    || cleanText(modelUrls && modelUrls.glb, 1200)
    || cleanText(modelUrls && modelUrls.pbr, 1200)
    || cleanText(modelUrls && modelUrls.model, 1200)
    || cleanText(Array.isArray(modelUrls) ? modelUrls[0] : "", 1200);
  const renderedImageUrl = cleanText(output.rendered_image_url, 1200)
    || cleanText(output.preview_url, 1200)
    || cleanText(output.thumbnail_url, 1200)
    || cleanText(output.image_url, 1200);

  return {
    task_id: cleanText(raw.task_id, 100),
    type: cleanText(raw.type, 80),
    status: cleanText(raw.status, 40) || "queued",
    progress: Math.max(0, Math.min(100, Number(raw.progress) || 0)),
    model_url: modelUrl,
    rendered_image_url: renderedImageUrl,
    credits_consumed: Number(raw.credits_consumed) || 0,
    created_at: cleanText(raw.created_at, 80),
    completed_at: cleanText(raw.completed_at, 80),
    output,
  };
}

function normalizeTripoPayload(value = {}) {
  const output = value.output && typeof value.output === "object" ? value.output : {};
  return {
    provider: cleanText(value.provider, 40) || (value.task_id || value.tripoTaskId ? "tripo3d" : ""),
    task_id: cleanText(value.task_id || value.tripoTaskId, 100),
    status: cleanText(value.status || value.tripoStatus, 40),
    progress: Math.max(0, Math.min(100, Number(value.progress || value.tripoProgress) || 0)),
    model_url: cleanText(value.model_url || value.tripoModelUrl || output.model_url, 1200),
    rendered_image_url: cleanText(
      value.rendered_image_url || value.tripoRenderedImageUrl || output.rendered_image_url,
      1200,
    ),
    file_token: cleanText(value.file_token || value.tripoFileToken, 160),
    credits_consumed: Number(value.credits_consumed || value.tripoCreditsConsumed) || 0,
  };
}

async function tripoRequest(env, path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${env.TRIPO3D_API_KEY}`);

  let body = options.body;
  if (options.json) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.json);
  }

  const response = await fetch(`${tripoBaseUrl(env)}${path}`, {
    method: options.method || "GET",
    headers,
    body,
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok || (payload && Number(payload.code) !== 0)) {
    const error = new Error(payload?.message || payload?.error || `tripo_http_${response.status}`);
    error.status = response.status || 502;
    error.code = payload?.code || `tripo_http_${response.status}`;
    error.path = path;
    error.providerMessage = cleanText(payload?.message || payload?.error || text, 300);
    error.publicMessage =
      Number(payload?.code) === 2010
        ? "Tripo3D respondio que faltan creditos API para generar el modelo. Revisa Billing en Tripo y compra creditos API."
        : Number(payload?.code) === 1004
        ? "La imagen temporal aun se estaba preparando para Tripo. Intenta generar de nuevo en unos segundos."
        : response.status === 504
        ? "Tripo3D no respondio a tiempo. La API puede estar saturada; intenta de nuevo en unos minutos."
        : response.status === 401 || response.status === 403
        ? "La clave de Tripo3D no fue aceptada. Revisa la configuracion antes de generar modelos."
        : "";
    throw error;
  }

  return payload?.data || {};
}

function tripoImageTaskInput(imageInput, fileType = "image") {
  const value = cleanText(imageInput, 1200);
  const normalizedType = cleanText(fileType, 20) || "image";
  if (!value) {
    const error = new Error("tripo_image_input_missing");
    error.status = 400;
    error.code = "tripo_image_input_missing";
    error.path = "/generation/image-to-model";
    error.publicMessage = "No recibimos una imagen valida para enviar a Tripo.";
    throw error;
  }

  if (/^https:\/\//i.test(value)) {
    return {
      image_url: value,
      file: {
        type: normalizedType,
        url: value,
      },
    };
  }

  return {
    file_token: value,
    file: {
      type: normalizedType,
      file_token: value,
    },
  };
}

async function uploadImageToTripo(env, imageFile) {
  const form = new FormData();
  form.append("file", imageFile, safeTripoFileName(imageFile));
  const data = await tripoRequest(env, "/files", { method: "POST", body: form });
  const fileToken = cleanText(data.file_token, 160);
  if (!fileToken) {
    const error = new Error("tripo_file_token_missing");
    error.status = 502;
    error.code = "tripo_file_token_missing";
    error.path = "/files";
    throw error;
  }
  return fileToken;
}

async function createTripoImageTask(env, imageInput, fileType = "image") {
  const payload = {
    ...tripoImageTaskInput(imageInput, fileType),
    model: cleanText(env.TRIPO3D_MODEL, 80) || TRIPO_IMAGE_MODEL_DEFAULT,
    texture: tripoBoolean(env.TRIPO3D_TEXTURE, true),
    pbr: tripoBoolean(env.TRIPO3D_PBR, true),
    texture_quality: cleanText(env.TRIPO3D_TEXTURE_QUALITY, 40) || "standard",
    enable_image_autofix: tripoBoolean(env.TRIPO3D_IMAGE_AUTOFIX, true),
    orientation: cleanText(env.TRIPO3D_ORIENTATION, 40) || "align_image",
  };
  const data = await tripoRequest(env, "/generation/image-to-model", {
    method: "POST",
    json: payload,
  });
  const taskId = cleanText(data.task_id, 100);
  if (!taskId) {
    const error = new Error("tripo_task_missing");
    error.status = 502;
    error.code = "tripo_task_missing";
    error.path = "/generation/image-to-model";
    throw error;
  }
  return taskId;
}

async function createTripoImageTaskWithRetry(env, imageInput, fileType = "image") {
  const delays = [900, 1500, 2500, 4000, 6000];
  let lastError = null;

  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try {
      return await createTripoImageTask(env, imageInput, fileType);
    } catch (error) {
      lastError = error;
      if (!isTripoImagePreparingError(error) || attempt === delays.length) {
        throw error;
      }
      await sleep(delays[attempt]);
    }
  }

  throw lastError;
}

function isTripoImagePreparingError(error) {
  return (
    String(error?.code || "") === "1004" ||
    /prepar|tempor/i.test(String(error?.providerMessage || error?.message || ""))
  );
}

async function getTripoTask(env, taskId) {
  const data = await tripoRequest(env, `/tasks/${encodeURIComponent(taskId)}`);
  return normalizeTripoTask(data);
}

async function runTripoImageToModel(env, imageFile, input) {
  const fileToken = await uploadImageToTripo(env, imageFile);
  const fileType = imageFile?.type === "image/png" ? "png" : "jpg";
  const taskId = await createTripoImageTaskWithRetry(env, fileToken, fileType);
  let task = { task_id: taskId, status: "queued", progress: 0 };
  try {
    task = await getTripoTask(env, taskId);
  } catch {
    // The browser will continue polling by task id; creation already succeeded.
  }
  return {
    provider: "tripo3d",
    input_source: "file_token",
    file_token: fileToken,
    ...task,
  };
}

async function runTripoImageUrlToModel(env, imageUrl, input, inputSource = "url") {
  const fileType = /\.png(?:$|\?)/i.test(imageUrl) ? "png" : "jpg";
  const taskId = await createTripoImageTaskWithRetry(env, imageUrl, fileType);
  let task = { task_id: taskId, status: "queued", progress: 0 };
  try {
    task = await getTripoTask(env, taskId);
  } catch {
    // The browser will continue polling by task id; creation already succeeded.
  }
  return {
    provider: "tripo3d",
    input_source: inputSource,
    ...task,
  };
}

function validateImageDataUrl(value, optional = false) {
  const dataUrl = String(value || "");
  if (!dataUrl && optional) return { ok: true, dataUrl: "" };
  const match = dataUrl.match(/^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    return { ok: false, error: "imagen_invalida", message: "La imagen debe ser JPG, PNG o WebP." };
  }
  const base64 = match[2] || "";
  const estimatedBytes = Math.floor((base64.length * 3) / 4);
  if (estimatedBytes > ENCARGOS_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      error: "imagen_pesada",
      message: "La imagen quedo demasiado pesada. Intenta con una foto mas liviana.",
    };
  }
  return { ok: true, dataUrl };
}

async function createEncargoId(env) {
  const year = new Date().getFullYear();
  const serial = await incrementCounter(env, `encargos:${year}:counter`);
  return `ENC-${year}-${String(serial).padStart(4, "0")}`;
}

function createPublicToken() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function encargoStore(env) {
  return env.ENCARGOS || env.VOTES;
}

async function saveEncargo(env, encargo) {
  const store = encargoStore(env);
  await store.put(`encargos:request:${encargo.id}`, JSON.stringify(encargo), {
    expirationTtl: ENCARGOS_RECORD_TTL_SECONDS,
  });

  const recent = await readJsonArrayFromStore(store, "encargos:request:recent");
  recent.push({
    id: encargo.id,
    timestamp: encargo.timestamp,
    nombre: encargo.cliente.nombre,
    email: encargo.cliente.email,
    total_estimated: encargo.price.total_estimated,
    estado: encargo.estado,
  });
  await store.put("encargos:request:recent", JSON.stringify(recent.slice(-80)), {
    expirationTtl: ENCARGOS_RECORD_TTL_SECONDS,
  });
}

async function updateEncargo(env, encargo) {
  const store = encargoStore(env);
  await store.put(`encargos:request:${encargo.id}`, JSON.stringify(encargo), {
    expirationTtl: ENCARGOS_RECORD_TTL_SECONDS,
  });

  const recent = await readJsonArrayFromStore(store, "encargos:request:recent");
  const summary = {
    id: encargo.id,
    timestamp: encargo.timestamp,
    nombre: encargo.cliente.nombre,
    email: encargo.cliente.email,
    total_estimated: encargo.price.total_estimated,
    estado: encargo.estado,
    order_id: encargo.quote?.order_id || "",
  };
  const index = recent.findIndex((item) => item.id === encargo.id);
  if (index >= 0) {
    recent[index] = { ...recent[index], ...summary };
  } else {
    recent.push(summary);
  }

  await store.put("encargos:request:recent", JSON.stringify(recent.slice(-80)), {
    expirationTtl: ENCARGOS_RECORD_TTL_SECONDS,
  });
}

async function getEncargo(env, id) {
  if (!id) return null;
  const raw = await encargoStore(env).get(`encargos:request:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function readJsonArrayFromStore(store, key) {
  const raw = await store.get(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function sendEncargosEmails(env, encargo) {
  const internal = await captureEmailResult(() => sendEncargosInternalEmail(env, encargo));
  const customer = await captureEmailResult(() => sendEncargosCustomerEmail(env, encargo));

  return {
    ok: internal.ok || customer.ok,
    internal: internal.ok,
    customer: customer.ok,
    provider: customer.provider || internal.provider || null,
    errors: [internal.error, customer.error].filter(Boolean),
  };
}

function sendEncargosInternalEmail(env, encargo) {
  const adminUrl = `${normalizeBaseUrl(env.SIMIO_API_URL || API_URL)}/api/encargos/request/${encargo.id}?token=${encargo.token}`;
  const price = encargo.price || {};
  const tripo = encargo.tripo || {};
  const text = [
    `Solicitud: ${encargo.id}`,
    `Cliente: ${encargo.cliente.nombre}`,
    `Email: ${encargo.cliente.email}`,
    `Telefono: ${encargo.cliente.telefono}`,
    `Ciudad/Pais: ${encargo.cliente.ciudad}, ${encargo.cliente.pais}`,
    `Tipo: ${encargo.options.tipo}`,
    `Tamano: ${encargo.options.size}`,
    `Acabado: ${encargo.options.finish}`,
    `Cantidad: ${encargo.options.quantity}`,
    `Graffiti: ${encargo.options.graffiti}`,
    `Mini llavero: ${encargo.options.keychain ? "si" : "no"}`,
    `Estuche: ${encargo.options.caseSelected ? "si" : "no"}`,
    `Texto estuche: ${encargo.options.caseText || "(sin texto)"}`,
    `Total estimado: COP ${formatPlainNumber(price.total_estimated)}`,
    `Envio: ${price.shipping?.label || "(sin envio)"} ${price.shipping?.amount === null ? "cotizar aparte" : `COP ${formatPlainNumber(price.shipping?.amount || 0)}`}`,
    "",
    "Desglose:",
    ...(price.lines || []).map((line) => `- ${line.label}: COP ${formatPlainNumber(line.amount)}${line.note ? ` (${line.note})` : ""}`),
    "",
    `Ajustes sobre modelo generado: ${encargo.model_notes || encargo.options.modelNotes || "(sin ajustes)"}`,
    "",
    `Observaciones: ${encargo.observaciones || "(sin observaciones)"}`,
    "",
    `Instrucciones/sujeto: ${encargo.conceptual_prompt || "(sin instrucciones)"}`,
    "",
    "Tripo3D:",
    `- task_id: ${tripo.task_id || "(sin tarea)"}`,
    `- estado: ${tripo.status || "(sin estado)"} ${tripo.progress ? `${tripo.progress}%` : ""}`,
    `- creditos: ${tripo.credits_consumed || 0}`,
    `- modelo GLB: ${tripo.model_url || "(pendiente)"}`,
    `- imagen render: ${tripo.rendered_image_url || "(pendiente)"}`,
    "",
    `Ver imagenes y detalle: ${adminUrl}`,
    `URL origen: ${encargo.source_url || "(sin URL)"}`,
    `Fecha: ${encargo.timestamp}`,
  ].join("\n");

  return sendTransactionalEmail(env, {
    to: [{ email: env.ADMIN_EMAIL || INTERNAL_EMAIL, name: "Juan" }],
    from: { email: env.EMAIL_FROM || "noreply@simioplateado.com", name: "Encargos Simio" },
    subject: `[SIMIO] Encargo personalizado · ${encargo.id}`,
    text,
  });
}

function sendEncargosCustomerEmail(env, encargo) {
  const text = [
    encargo.cliente.nombre ? `Hola ${encargo.cliente.nombre},` : "Hola,",
    "",
    "Recibimos tu solicitud para hacer realidad una pieza personalizada.",
    "",
    `Solicitud: ${encargo.id}`,
    `Total estimado visible: COP ${formatPlainNumber(encargo.price.total_estimated)}`,
    "",
    "Este monto es estimado. Revisaremos la imagen, la escala y la viabilidad de impresion antes de enviarte la cotizacion definitiva y el link de pago.",
    "",
    "Si algo no es imprimible tal como viene, te propondremos un ajuste antes de producir.",
    "",
    "Simio Plateado",
    "simioplateado.com",
  ].join("\n");

  return sendTransactionalEmail(env, {
    to: [{ email: encargo.cliente.email, name: encargo.cliente.nombre || encargo.cliente.email }],
    from: { email: env.EMAIL_FROM || "noreply@simioplateado.com", name: "Simio Plateado" },
    subject: `Recibimos tu solicitud · ${encargo.id}`,
    text,
  });
}

function sendEncargosPaymentLinkInternalEmail(env, encargo) {
  const quote = encargo.quote || {};
  const text = [
    `Solicitud: ${encargo.id}`,
    `Orden: ${quote.order_id || "(sin orden)"}`,
    `Checkout ID: ${quote.checkout_id || "(sin checkout)"}`,
    `Cliente: ${encargo.cliente?.nombre || "(sin nombre)"}`,
    `Email: ${encargo.cliente?.email || "(sin email)"}`,
    `Precio final: COP ${formatPlainNumber(quote.price_cop)}`,
    `Preferencia Mercado Pago: ${quote.preference_id || "(sin id)"}`,
    `Enviado al cliente: ${quote.sent_to_customer ? "si" : "no"}`,
    `Link: ${quote.checkout_url || "(sin link)"}`,
    "",
    `Nota: ${quote.note || "(sin nota)"}`,
    `Fecha: ${quote.generated_at || new Date().toISOString()}`,
  ].join("\n");

  return sendTransactionalEmail(env, {
    to: [{ email: env.ADMIN_EMAIL || INTERNAL_EMAIL, name: "Juan" }],
    from: { email: env.EMAIL_FROM || "noreply@simioplateado.com", name: "Encargos Simio" },
    subject: `[SIMIO] Link de pago encargo · ${encargo.id}`,
    text,
  });
}

function sendEncargosPaymentLinkCustomerEmail(env, encargo) {
  const quote = encargo.quote || {};
  const text = [
    encargo.cliente?.nombre ? `Hola ${encargo.cliente.nombre},` : "Hola,",
    "",
    "Ya revisamos tu solicitud personalizada y dejamos listo el link de pago para continuar.",
    "",
    `Solicitud: ${encargo.id}`,
    `Precio final: COP ${formatPlainNumber(quote.price_cop)}`,
    "",
    quote.note ? `Nota de cotizacion: ${quote.note}` : "",
    "",
    "Puedes pagar de forma segura por Mercado Pago aqui:",
    quote.checkout_url || "",
    "",
    "Cuando el pago quede aprobado, pasamos tu pieza a produccion.",
    "",
    "Simio Plateado",
    "simioplateado.com",
  ]
    .filter((line, index, lines) => line || lines[index - 1] !== "")
    .join("\n");

  return sendTransactionalEmail(env, {
    to: [{ email: encargo.cliente.email, name: encargo.cliente.nombre || encargo.cliente.email }],
    from: { email: env.EMAIL_FROM || "noreply@simioplateado.com", name: "Simio Plateado" },
    subject: `Cotizacion y link de pago · ${encargo.id}`,
    text,
  });
}

function renderEncargoAdminHtml(encargo, notice = "") {
  const lines = (encargo.price?.lines || [])
    .map(
      (line) =>
        `<li><strong>${escapeHtmlWorker(line.label)}</strong>: COP ${escapeHtmlWorker(formatPlainNumber(line.amount))}${line.note ? ` · ${escapeHtmlWorker(line.note)}` : ""}</li>`,
    )
    .join("");
  const tripo = encargo.tripo || {};
  const quote = encargo.quote || {};
  const defaultQuoteAmount = quote.price_cop || encargo.price?.total_estimated || 0;
  const paymentAction = `${normalizeBaseUrl(API_URL)}/api/encargos/request/${encodeURIComponent(encargo.id)}/payment?token=${encodeURIComponent(encargo.token)}`;
  const tripoModel = tripo.model_url
    ? `<model-viewer src="${escapeHtmlWorker(tripo.model_url)}" ${tripo.rendered_image_url ? `poster="${escapeHtmlWorker(tripo.rendered_image_url)}"` : ""} camera-controls auto-rotate shadow-intensity="1" environment-image="neutral" exposure="0.9"></model-viewer>`
    : "<p>Modelo Tripo pendiente o no disponible.</p>";
  const tripoLinks = [
    tripo.task_id ? `<p><strong>Task:</strong> <code>${escapeHtmlWorker(tripo.task_id)}</code> · ${escapeHtmlWorker(tripo.status || "")} ${escapeHtmlWorker(tripo.progress || 0)}%</p>` : "",
    tripo.model_url ? `<p><a href="${escapeHtmlWorker(tripo.model_url)}" target="_blank" rel="noreferrer">Abrir/descargar GLB</a></p>` : "",
    tripo.rendered_image_url ? `<p><a href="${escapeHtmlWorker(tripo.rendered_image_url)}" target="_blank" rel="noreferrer">Abrir render Tripo</a></p>` : "",
    tripo.credits_consumed ? `<p>Creditos consumidos: ${escapeHtmlWorker(tripo.credits_consumed)}</p>` : "",
  ].join("");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtmlWorker(encargo.id)} · Encargo Simio</title>
  <script type="module" src="https://unpkg.com/@google/model-viewer@4.2.0/dist/model-viewer.min.js"></script>
  <style>
    body{font-family:Helvetica,Arial,sans-serif;margin:0;padding:32px;background:#fff;color:#000;line-height:1.45}
    main{max-width:980px;margin:auto}
    h1{font-size:32px;margin:0 0 8px}
    section{border-top:1px solid #000;padding:22px 0}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
    img{max-width:100%;border:1px solid #000;background:#fff}
    model-viewer{width:100%;height:520px;border:1px solid #000;background:#fff}
    code{background:#f5f5f5;padding:2px 5px}
    .notice{border:1px solid #000;padding:12px 14px;margin:18px 0;background:#f7f7f7}
    .quote-box{border:1px solid #000;padding:18px;margin-top:10px}
    label{display:block;font-size:13px;font-weight:700;margin:12px 0 6px;text-transform:uppercase;letter-spacing:.08em}
    input,textarea{width:100%;border:1px solid #000;padding:10px;font:inherit;background:#fff}
    textarea{min-height:92px}
    .row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .checkbox{display:flex;align-items:center;gap:8px;margin:12px 0}.checkbox input{width:auto}
    button,.button{display:inline-block;border:1px solid #000;background:#000;color:#fff;padding:11px 14px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;text-decoration:none;cursor:pointer}
    .button.secondary{background:#fff;color:#000}
    .payment-link{word-break:break-all}
    @media(max-width:760px){body{padding:18px}.grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
<main>
  <h1>${escapeHtmlWorker(encargo.id)}</h1>
  <p><strong>${escapeHtmlWorker(encargo.cliente.nombre)}</strong> · ${escapeHtmlWorker(encargo.cliente.email)} · ${escapeHtmlWorker(encargo.cliente.telefono)}</p>
  ${notice ? `<div class="notice">${escapeHtmlWorker(notice)}</div>` : ""}
  <section class="grid">
    <div><h2>Imagen subida</h2><img src="${encargo.image_data_url}" alt="Imagen enviada por cliente"></div>
    <div><h2>Modelo Tripo3D</h2>${tripoModel}${tripoLinks}</div>
  </section>
  <section>
    <h2>Opciones</h2>
    <p>${escapeHtmlWorker(encargo.options.tipo)} · ${escapeHtmlWorker(encargo.options.size)} · ${escapeHtmlWorker(encargo.options.finish)} · cantidad ${escapeHtmlWorker(encargo.options.quantity)}</p>
    <p>Ciudad/Pais: ${escapeHtmlWorker(encargo.cliente.ciudad)}, ${escapeHtmlWorker(encargo.cliente.pais)}</p>
    <ul>${lines}</ul>
    <p><strong>Total estimado: COP ${escapeHtmlWorker(formatPlainNumber(encargo.price?.total_estimated || 0))}</strong></p>
  </section>
  <section>
    <h2>Observaciones</h2>
    <p><strong>Ajustes sobre modelo generado:</strong> ${escapeHtmlWorker(encargo.model_notes || encargo.options?.modelNotes || "(sin ajustes)")}</p>
    <p>${escapeHtmlWorker(encargo.observaciones || "(sin observaciones)")}</p>
    <h2>Instrucciones/sujeto</h2>
    <p>${escapeHtmlWorker(encargo.conceptual_prompt || "(sin instrucciones)")}</p>
    <p><code>${escapeHtmlWorker(encargo.timestamp)}</code></p>
  </section>
  <section>
    <h2>Cotizacion y pago</h2>
    ${
      quote.checkout_url
        ? `<div class="quote-box">
            <p><strong>Precio final:</strong> COP ${escapeHtmlWorker(formatPlainNumber(quote.price_cop))}</p>
            <p><strong>Orden:</strong> ${escapeHtmlWorker(quote.order_id || "")} · <strong>Checkout:</strong> ${escapeHtmlWorker(quote.checkout_id || "")}</p>
            <p><strong>Estado envio cliente:</strong> ${quote.sent_to_customer ? `enviado ${escapeHtmlWorker(quote.sent_at || "")}` : "generado, no enviado desde sistema"}</p>
            ${quote.note ? `<p><strong>Nota:</strong> ${escapeHtmlWorker(quote.note)}</p>` : ""}
            <p class="payment-link"><a href="${escapeHtmlWorker(quote.checkout_url)}" target="_blank" rel="noreferrer">${escapeHtmlWorker(quote.checkout_url)}</a></p>
            <p><a class="button secondary" href="${escapeHtmlWorker(quote.checkout_url)}" target="_blank" rel="noreferrer">Abrir link de pago</a></p>
          </div>`
        : ""
    }
    <form class="quote-box" action="${escapeHtmlWorker(paymentAction)}" method="post">
      <div class="row">
        <div>
          <label for="final_price_cop">Precio final COP</label>
          <input id="final_price_cop" name="final_price_cop" inputmode="numeric" value="${escapeHtmlWorker(defaultQuoteAmount)}" required>
        </div>
        <div>
          <label for="title">Titulo de cobro</label>
          <input id="title" name="title" value="${escapeHtmlWorker(quote.title || `Encargo personalizado ${encargo.id}`)}" maxlength="140" required>
        </div>
      </div>
      <label for="description">Descripcion Mercado Pago</label>
      <input id="description" name="description" value="${escapeHtmlWorker(quote.description || `Pieza personalizada Simio Plateado. Solicitud ${encargo.id}.`)}" maxlength="500">
      <label for="quote_note">Nota para el cliente</label>
      <textarea id="quote_note" name="quote_note" placeholder="Ej. Incluye produccion, acabado seleccionado y envio nacional.">${escapeHtmlWorker(quote.note || "")}</textarea>
      <label class="checkbox"><input type="checkbox" name="send_email" value="1" checked> Enviar link al cliente por email al generar</label>
      <button type="submit">${quote.checkout_url ? "Generar nuevo link" : "Generar link de pago"}</button>
    </form>
  </section>
</main>
</body>
</html>`;
}

function escapeHtmlWorker(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPlainNumber(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "0";
  return Math.round(amount).toLocaleString("es-CO");
}

async function recordEncargosFailure(env, type, failure) {
  const key = `encargos:failures:${type}`;
  const existing = await readJsonArray(env, key);
  existing.push(failure);
  await env.VOTES.put(key, JSON.stringify(existing.slice(-30)), {
    expirationTtl: ENCARGOS_RECORD_TTL_SECONDS,
  });
}

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

async function handleCheckout(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, { error: "json_invalido" }, 400);
  }

  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const lang = body.lang === "en" ? "en" : "es";
  const baseProduct = CHECKOUT_PRODUCTS[slug];

  if (!baseProduct) {
    return jsonResponse(request, { error: "producto_invalido" }, 400);
  }

  if (!isCheckoutEnabled(env, baseProduct)) {
    return jsonResponse(
      request,
      {
        error: "checkout_no_disponible",
        message:
          lang === "en"
            ? "This piece is not open for checkout yet."
            : "Esta pieza todavía no tiene compra abierta.",
      },
      409,
    );
  }

  const soldOut = await isCheckoutSoldOut(env, baseProduct);
  if (soldOut) {
    return jsonResponse(
      request,
      {
        error: "checkout_agotado",
        message:
          lang === "en"
            ? "This edition is sold out for now."
            : "Esta edición está agotada por ahora.",
      },
      409,
    );
  }

  const priceCop = resolveCheckoutPriceCop(env, baseProduct);
  if (!priceCop) {
    return jsonResponse(
      request,
      {
        error: "checkout_precio_no_configurado",
        message:
          lang === "en"
            ? "Checkout price is not configured yet."
            : "El precio de checkout todavía no está configurado.",
      },
      503,
    );
  }

  const orderInput = normalizeCheckoutOrderInput(body, lang);
  if (!orderInput.ok) {
    return jsonResponse(
      request,
      {
        error: orderInput.error,
        message: orderInput.message,
      },
      400,
    );
  }

  const checkoutCountry = orderInput.shipping.country_code || normalizeCountryCode(orderInput.shipping.pais);
  if (checkoutCountry && checkoutCountry !== "CO") {
    return jsonResponse(
      request,
      {
        error: "checkout_internacional_cotizacion",
	        message:
	          lang === "en"
	            ? "International orders are quoted before payment so the final total and possible import duties are clear."
	            : "Los pedidos internacionales se cotizan antes del pago para confirmar el total final y posibles impuestos.",
      },
      409,
    );
  }

  const talla = cleanText(body.talla || body.size || body.variant, 80);
  if (baseProduct.sizes?.length && !baseProduct.sizes.includes(talla)) {
    return jsonResponse(
      request,
      {
        error: "talla_invalida",
        message:
          lang === "en"
            ? "Please choose a valid size before payment."
            : "Elegí una talla válida antes del pago.",
      },
      400,
    );
  }

  const rateLimit = await takeRateLimitedSlot(
    env,
    request,
    "checkout:rate",
    CHECKOUT_RATE_LIMIT_MAX,
    CHECKOUT_RATE_LIMIT_TTL_SECONDS,
  );

  if (!rateLimit.allowed) {
    return jsonResponse(
      request,
      {
        error: "rate_limited",
        message:
          lang === "en"
            ? "Too many checkout attempts from this address. Please wait one hour or contact us."
            : "Demasiados intentos de compra desde esta dirección. Esperá una hora o contactanos.",
        retry_after: rateLimit.retryAfter,
      },
      429,
    );
  }

  if (!env.MERCADOPAGO_ACCESS_TOKEN) {
    return jsonResponse(
      request,
      {
        error: "checkout_no_configurado",
        message:
          lang === "en"
            ? "Mercado Pago checkout is not configured yet."
            : "El checkout de Mercado Pago todavía no está configurado.",
      },
      503,
    );
  }

  const timestamp = new Date().toISOString();
  const orderId = await createOrderId(env);
  const checkout = {
    id: crypto.randomUUID(),
    order_id: orderId,
    slug,
    product: baseProduct.name,
    title: baseProduct.title,
    price_usd: baseProduct.priceUsd,
    price_cop: priceCop,
    currency: "COP",
    stock: baseProduct.stock,
    talla: talla || null,
    lang,
    provider: "mercadopago",
    status: "created",
    timestamp,
    ip_hash: rateLimit.ipHash,
    customer_email: orderInput.customer.email,
    customer_name: orderInput.customer.nombre,
  };
  const externalReference = `simio:${slug}:${checkout.id}:${orderId}`;
  const order = {
    id: orderId,
    external_reference: externalReference,
    checkout_id: checkout.id,
    pieza: baseProduct.name,
    title: baseProduct.title,
    slug,
    talla: talla || null,
    tipo: "compra_directa",
    monto_usd: baseProduct.priceUsd,
    monto: priceCop,
    moneda: "COP",
    cliente_nombre: orderInput.customer.nombre,
    cliente_email: orderInput.customer.email,
    cliente_telefono: orderInput.customer.telefono,
    direccion: orderInput.shipping,
    lang,
    fecha: timestamp,
    mp_payment_id: null,
    mp_status: "preference_pending",
    estado_pago: "PENDIENTE",
    estado_fulfillment: "PENDIENTE_PAGO",
    guia: "",
    transportadora: "",
    fecha_envio: null,
    checklist: {
      producido: false,
      control_calidad: false,
      empacado: false,
      enviado: false,
    },
    notas_internas: "",
    updated_at: timestamp,
  };

  await saveOrder(env, order);
  await env.VOTES.put(`checkout:order:${checkout.id}`, orderId);
  await env.VOTES.put(`order:external:${externalReference}`, orderId);

  await env.VOTES.put(`checkout:${checkout.id}`, JSON.stringify(checkout), {
    expirationTtl: CHECKOUT_RECORD_TTL_SECONDS,
  });
  await env.VOTES.put(`checkout:external:${externalReference}`, checkout.id, {
    expirationTtl: CHECKOUT_RECORD_TTL_SECONDS,
  });

  let preference;
  try {
    preference = await createMercadoPagoPreference(env, {
      ...baseProduct,
      priceCop,
      externalReference,
      checkoutId: checkout.id,
      orderId,
      customer: orderInput.customer,
      shipping: orderInput.shipping,
      talla,
      lang,
    });
  } catch (error) {
    const failure = checkoutFailureData(checkout, error);
    await saveOrder(env, {
      ...order,
      mp_status: "preference_error",
      estado_pago: "ERROR_CHECKOUT",
      notas_internas: `Mercado Pago no pudo crear preferencia: ${failure.error}`,
      updated_at: new Date().toISOString(),
    });

    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(recordCheckoutFailure(env, slug, failure));
    } else {
      await recordCheckoutFailure(env, slug, failure);
    }

    return jsonResponse(
      request,
      {
        error: "checkout_preference_failed",
        message:
          lang === "en"
            ? "Mercado Pago could not create the checkout. Please try again."
            : "Mercado Pago no pudo crear el checkout. Intentá de nuevo.",
      },
      error.status && error.status >= 400 && error.status < 500 ? 400 : 502,
    );
  }

  const checkoutUrl = preference.init_point || preference.sandbox_init_point;
  if (!checkoutUrl) {
    return jsonResponse(
      request,
      {
        error: "checkout_url_missing",
        message:
          lang === "en"
            ? "Mercado Pago did not return a checkout URL."
            : "Mercado Pago no devolvió URL de checkout.",
      },
      502,
    );
  }

  const savedCheckout = {
    ...checkout,
    status: "preference_created",
    external_reference: externalReference,
    preference_id: preference.id || null,
    checkout_url: checkoutUrl,
    shipping_summary: formatOrderAddress(order),
  };
  await env.VOTES.put(`checkout:${checkout.id}`, JSON.stringify(savedCheckout), {
    expirationTtl: CHECKOUT_RECORD_TTL_SECONDS,
  });
  await saveOrder(env, {
    ...order,
    mp_status: "preference_created",
    preference_id: preference.id || null,
    checkout_url: checkoutUrl,
    updated_at: new Date().toISOString(),
  });

  if (ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(sendCheckoutCreatedEmail(env, savedCheckout).catch(() => null));
  }

  return jsonResponse(request, {
    ok: true,
    id: checkout.id,
    order_id: orderId,
    product: checkout.product,
    price_usd: checkout.price_usd,
    price_cop: checkout.price_cop,
    currency: checkout.currency,
    talla: checkout.talla,
    checkout_url: checkoutUrl,
    provider: "mercadopago",
  });
}

function enabledInternationalCountries(env) {
  const configured = String(env.COUNTRIES_ENABLED || "")
    .split(",")
    .map((item) => normalizeCountryCode(item))
    .filter(Boolean);
  const list = configured.length ? configured : DEFAULT_ENABLED_COUNTRIES;
  return [...new Set(list.filter((code) => COUNTRY_NAMES[code]))];
}

function normalizeCountryCode(value) {
  const raw = cleanText(value, 80);
  if (!raw) return "";
  const upper = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
  if (COUNTRY_NAMES[upper]) return upper;

  const aliases = {
    COLOMBIA: "CO",
    "UNITED STATES": "US",
    USA: "US",
    US: "US",
    "ESTADOS UNIDOS": "US",
    MEXICO: "MX",
    "MÉXICO": "MX",
    CANADA: "CA",
    "CANADÁ": "CA",
    ESPANA: "ES",
    ESPAÑA: "ES",
    SPAIN: "ES",
    FRANCIA: "FR",
    FRANCE: "FR",
    ALEMANIA: "DE",
    GERMANY: "DE",
    ITALIA: "IT",
    ITALY: "IT",
    "PAISES BAJOS": "NL",
    "PAÍSES BAJOS": "NL",
    NETHERLANDS: "NL",
    HOLANDA: "NL",
    CHILE: "CL",
    PERU: "PE",
    "PERÚ": "PE",
    ECUADOR: "EC",
    PANAMA: "PA",
    "PANAMÁ": "PA",
  };
  return aliases[upper] || "";
}

function shippingUsdForCountry(env, countryCode) {
  const code = normalizeCountryCode(countryCode);
  if (!code) return null;
  const configured = Number(env[`SHIPPING_${code}`]);
  if (Number.isFinite(configured) && configured >= 0) return configured;
  return Object.prototype.hasOwnProperty.call(DEFAULT_SHIPPING_USD, code) ? DEFAULT_SHIPPING_USD[code] : null;
}

function internationalIncludedAddonUsdForCountry(env, countryCode) {
  const code = normalizeCountryCode(countryCode);
  if (!code) return null;
  const configured = Number(env[`INTERNATIONAL_INCLUDED_ADDON_${code}`]);
  if (Number.isFinite(configured) && configured >= 0) return configured;
  return Object.prototype.hasOwnProperty.call(DEFAULT_INTERNATIONAL_INCLUDED_ADDON_USD, code)
    ? DEFAULT_INTERNATIONAL_INCLUDED_ADDON_USD[code]
    : null;
}

function usdToCopRate(env) {
  const rate = Number(env.USD_TO_COP_RATE);
  return Number.isFinite(rate) && rate > 0 ? rate : 4150;
}

function internationalIncludedTotalForProduct(env, product, countryCode) {
  const addonUsd = internationalIncludedAddonUsdForCountry(env, countryCode);
  if (addonUsd === null) return null;
  const rate = usdToCopRate(env);
  const priceUsd = Number(product.priceUsd) || 0;
  const totalUsd = Number((priceUsd + addonUsd).toFixed(2));
  return {
    country_code: normalizeCountryCode(countryCode),
    country_name: COUNTRY_NAMES[normalizeCountryCode(countryCode)],
    total_usd_reference: totalUsd,
    total_cop_reference: Math.round(totalUsd * rate),
    usd_to_cop_rate: rate,
    currency: "USD",
    shipping_included: true,
    ddu: normalizeCountryCode(countryCode) !== "CO",
  };
}

function shippingEstimateForCountry(env, countryCode) {
  const code = normalizeCountryCode(countryCode);
  if (!code || !COUNTRY_NAMES[code]) return null;
  if (!enabledInternationalCountries(env).includes(code)) return null;
  const shippingUsd = shippingUsdForCountry(env, code);
  if (shippingUsd === null) return null;
  const rate = usdToCopRate(env);
  return {
    country_code: code,
    country_name: COUNTRY_NAMES[code],
    shipping_usd: shippingUsd,
    shipping_cop_reference: Math.round(shippingUsd * rate),
    usd_to_cop_rate: rate,
    currency: "USD",
    ddu: code !== "CO",
    note:
	      code === "CO"
	        ? "Envio nacional incluido en Colombia."
	        : "Estimado de referencia con envio incluido. El total definitivo se confirma por email antes del pago. Aranceles, impuestos o gastos de importacion se pagan en destino si la transportadora o aduana los cobra.",
  };
}

function formatCopPlain(amount) {
  const value = Math.round(Number(amount) || 0);
  return `COP ${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

async function handleShippingCost(request, env) {
  const url = new URL(request.url);
  const country = normalizeCountryCode(url.searchParams.get("country") || url.searchParams.get("pais"));
  const code = country || "CO";
  if (!enabledInternationalCountries(env).includes(code) || !COUNTRY_NAMES[code]) {
    return jsonResponse(
      request,
      {
        error: "pais_no_disponible",
        enabled_countries: enabledInternationalCountries(env),
      },
      400,
    );
  }

  return jsonResponse(request, {
    ok: true,
    estimate: {
      country_code: code,
      country_name: COUNTRY_NAMES[code],
      quote_mode: code === "CO" ? "domestic_included" : "international_total_included",
      shipping_included: true,
      ddu: code !== "CO",
      note:
        code === "CO"
          ? "Envio nacional incluido en Colombia."
          : "El cliente ve un total internacional con envio incluido. El total definitivo se confirma por email antes del pago.",
    },
    enabled_countries: enabledInternationalCountries(env).map((code) => ({
      code,
      name: COUNTRY_NAMES[code],
      quote_mode: code === "CO" ? "domestic_included" : "international_total_included",
    })),
  });
}

async function handleInternationalQuote(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, { error: "json_invalido" }, 400);
  }

  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const lang = body.lang === "en" ? "en" : "es";
  const product = CHECKOUT_PRODUCTS[slug];
  if (!product) {
    return jsonResponse(request, { error: "producto_invalido" }, 400);
  }

  if (!isCheckoutEnabled(env, product)) {
    return jsonResponse(
      request,
      {
        error: "checkout_no_disponible",
        message:
          lang === "en"
            ? "This piece is not open for checkout yet."
            : "Esta pieza todavía no tiene compra abierta.",
      },
      409,
    );
  }

  const soldOut = await isCheckoutSoldOut(env, product);
  if (soldOut) {
    return jsonResponse(
      request,
      {
        error: "checkout_agotado",
        message:
          lang === "en"
            ? "This edition is sold out for now."
            : "Esta edición está agotada por ahora.",
      },
      409,
    );
  }

  const orderInput = normalizeCheckoutOrderInput(body, lang);
  if (!orderInput.ok) {
    return jsonResponse(request, { error: orderInput.error, message: orderInput.message }, 400);
  }

  const countryCode = orderInput.shipping.country_code || normalizeCountryCode(orderInput.shipping.pais);
  if (!countryCode || countryCode === "CO") {
    return jsonResponse(
      request,
      {
        error: "pais_no_internacional",
        message:
          lang === "en"
            ? "For Colombia, you can use the direct Mercado Pago checkout."
            : "Para Colombia puedes usar el checkout directo de Mercado Pago.",
      },
      400,
    );
  }

  const estimate = shippingEstimateForCountry(env, countryCode);
  if (!estimate) {
    return jsonResponse(
      request,
      {
        error: "pais_no_disponible",
        message:
          lang === "en"
            ? "We are not quoting this country automatically yet. Please contact us."
            : "Todavia no cotizamos este pais automaticamente. Escribenos para revisarlo.",
      },
      400,
    );
  }

  const rateLimit = await takeRateLimitedSlot(
    env,
    request,
    "checkout:international_quote:rate",
    INTERNATIONAL_QUOTE_RATE_LIMIT_MAX,
    INTERNATIONAL_QUOTE_RATE_LIMIT_TTL_SECONDS,
  );
  if (!rateLimit.allowed) {
    return jsonResponse(
      request,
      {
        error: "rate_limited",
        message:
          lang === "en"
            ? "Too many international quote requests from this address. Please wait one hour."
            : "Demasiadas solicitudes internacionales desde esta direccion. Espera una hora.",
        retry_after: rateLimit.retryAfter,
      },
      429,
    );
  }

  const talla = cleanText(body.talla || body.size || body.variant, 80);
  if (product.sizes?.length && !product.sizes.includes(talla)) {
    return jsonResponse(
      request,
      {
        error: "talla_invalida",
        message:
          lang === "en"
            ? "Please choose a valid size before requesting an international quote."
            : "Elige una talla valida antes de solicitar la cotizacion internacional.",
      },
      400,
    );
  }

  const priceCop = resolveCheckoutPriceCop(env, product) || product.defaultPriceCop || 0;
  const publicTotal = internationalIncludedTotalForProduct(env, product, countryCode);
  if (!publicTotal) {
    return jsonResponse(
      request,
      {
        error: "pais_no_disponible",
        message:
          lang === "en"
            ? "We are not quoting this country automatically yet. Please contact us."
            : "Todavia no cotizamos este pais automaticamente. Escribenos para revisarlo.",
      },
      400,
    );
  }
  const totalCopReference = publicTotal.total_cop_reference;
  const totalUsdReference = publicTotal.total_usd_reference;
  const internalCostCopReference = priceCop + (Number(estimate.shipping_cop_reference) || 0);
  const internalCostUsdReference = Number((Number(product.priceUsd) + Number(estimate.shipping_usd || 0)).toFixed(2));
  const orderId = await createOrderId(env);
  const timestamp = new Date().toISOString();
  const quote = {
    id: crypto.randomUUID(),
    order_id: orderId,
    slug,
    product: product.name,
    title: product.title,
    price_usd: product.priceUsd,
    price_cop: priceCop,
    total_usd_reference: totalUsdReference,
    total_cop_reference: totalCopReference,
    shipping_included: true,
    internal_cost_usd_reference: internalCostUsdReference,
    internal_cost_cop_reference: internalCostCopReference,
    currency: "COP",
    talla: talla || null,
    lang,
    status: "international_quote_requested",
    timestamp,
    ip_hash: rateLimit.ipHash,
    customer_email: orderInput.customer.email,
    customer_name: orderInput.customer.nombre,
    customer_phone: orderInput.customer.telefono,
    shipping: {
      ...orderInput.shipping,
      country_code: countryCode,
      pais: COUNTRY_NAMES[countryCode],
    },
    shipping_estimate: publicTotal,
    internal_shipping_estimate: estimate,
    source_url: cleanText(body.source_url || body.sourceUrl || body.url, 500),
  };
  const order = {
    id: orderId,
    external_reference: `simio:${slug}:international:${quote.id}:${orderId}`,
    checkout_id: null,
    pieza: product.name,
    title: product.title,
    slug,
    talla: talla || null,
    tipo: "cotizacion_internacional",
    monto_usd: totalUsdReference,
    monto: totalCopReference,
    moneda: "COP",
    cliente_nombre: orderInput.customer.nombre,
    cliente_email: orderInput.customer.email,
    cliente_telefono: orderInput.customer.telefono,
    direccion: quote.shipping,
    lang,
    fecha: timestamp,
    mp_payment_id: null,
    mp_status: "quote_pending",
    estado_pago: "PENDIENTE_COTIZACION",
    estado_fulfillment: "PENDIENTE_PAGO",
    guia: "",
    transportadora: "DHL / por confirmar",
    fecha_envio: null,
    checklist: {
      producido: false,
      control_calidad: false,
      empacado: false,
      enviado: false,
    },
    notas_internas: `Cotizacion internacional solicitada. Total publico incluido: USD ${totalUsdReference} (${formatCopPlain(totalCopReference)} ref). Costo interno pieza + DHL: USD ${internalCostUsdReference} (${formatCopPlain(internalCostCopReference)} ref). DDU.`,
    updated_at: timestamp,
  };

  await saveOrder(env, order);
  await recordInternationalQuote(env, quote);

  const emailJob = sendInternationalQuoteEmails(env, quote).catch((error) => ({
    ok: false,
    error: error && (error.code || error.message) ? error.code || error.message : "unknown",
  }));
  if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(emailJob);
  else await emailJob;

  return jsonResponse(request, {
    ok: true,
    id: quote.id,
    order_id: orderId,
    product: quote.product,
    total_cop_reference: totalCopReference,
    total_usd_reference: totalUsdReference,
    shipping_included: true,
    country: {
      code: countryCode,
      name: COUNTRY_NAMES[countryCode],
    },
    message:
      lang === "en"
        ? "We received your international quote request. We will email the final total and payment link."
        : "Recibimos tu solicitud internacional. Te enviaremos por email el total definitivo y el link de pago.",
  });
}

async function handleCheckoutIssue(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, { error: "json_invalido" }, 400);
  }
  if (!body || typeof body !== "object") body = {};

  const slugInput = cleanText(body.slug || body.product_slug || body.sku, 80).toLowerCase();
  const baseProduct = CHECKOUT_PRODUCTS[slugInput] || null;
  const slug = baseProduct ? baseProduct.slug : slugInput || "unknown";
  const lang = body.lang === "en" ? "en" : "es";
  const email = cleanText(body.email, 200).toLowerCase();

  if (email && !EMAIL_RE.test(email)) {
    return jsonResponse(
      request,
      {
        error: "email_invalido",
        message:
          lang === "en"
            ? "That email does not look valid. You can leave it empty or correct it."
            : "Ese email no parece válido. Puedes dejarlo vacío o corregirlo.",
      },
      400,
    );
  }

  const rateLimit = await takeRateLimitedSlot(
    env,
    request,
    "checkout:issue:rate",
    CHECKOUT_ISSUE_RATE_LIMIT_MAX,
    CHECKOUT_ISSUE_RATE_LIMIT_TTL_SECONDS,
  );

  if (!rateLimit.allowed) {
    return jsonResponse(
      request,
      {
        error: "rate_limited",
        message:
          lang === "en"
            ? "Too many reports from this address. Please write us directly."
            : "Demasiados reportes desde esta dirección. Escribinos directamente.",
        retry_after: rateLimit.retryAfter,
      },
      429,
    );
  }

  const timestamp = new Date().toISOString();
  const issue = {
    id: crypto.randomUUID(),
    slug,
    product: baseProduct?.name || cleanText(body.product || body.product_name || "Producto no identificado", 120),
    email: email || null,
    lang,
    source: cleanText(body.source, 80),
    status: cleanText(body.status || body.payment_status || body.checkout_status, 80),
    message: cleanText(body.message, 500),
    url: cleanText(body.url || body.page_url || body.href, 500),
    payment_id: cleanText(body.payment_id || body.collection_id, 120),
    preference_id: cleanText(body.preference_id, 120),
    external_reference: cleanText(body.external_reference, 220),
    order_id: cleanText(body.order_id, 120),
    checkout_id: cleanText(body.checkout_id, 120),
    user_agent: cleanText(request.headers.get("User-Agent"), 240),
    ip_hash: rateLimit.ipHash,
    timestamp,
  };

  const total = await recordCheckoutIssue(env, issue);
  const emailJob = sendCheckoutIssueEmails(env, issue, total).catch((error) => ({
    ok: false,
    internal: false,
    customer: false,
    provider: null,
    errors: [error && (error.code || error.message) ? error.code || error.message : "unknown"],
  }));

  if (ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(emailJob);
  }

  const emails = ctx && typeof ctx.waitUntil === "function" ? { queued: true } : await emailJob;

  return jsonResponse(request, {
    ok: true,
    id: issue.id,
    slug: issue.slug,
    total,
    customer_email: Boolean(issue.email),
    emails,
  });
}

async function handleAnalyticsEvent(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, { error: "json_invalido" }, 400);
  }
  if (!body || typeof body !== "object") body = {};

  const name = normalizeAnalyticsEventName(body.event || body.name);
  if (!ANALYTICS_EVENT_SET.has(name)) {
    return jsonResponse(request, { error: "evento_invalido" }, 400);
  }

  const rateLimit = await takeRateLimitedSlot(
    env,
    request,
    "analytics:rate",
    ANALYTICS_RATE_LIMIT_MAX,
    ANALYTICS_RATE_LIMIT_TTL_SECONDS,
  );

  if (!rateLimit.allowed) {
    return jsonResponse(request, { error: "rate_limited", retry_after: rateLimit.retryAfter }, 429);
  }

  const slug = normalizeAnalyticsSlug(body.slug || body.product_slug || body.sku || body.content_id);
  const product = slug ? CHECKOUT_PRODUCTS[slug] || null : null;
  const timestamp = new Date().toISOString();
  const event = {
    id: crypto.randomUUID(),
    event: name,
    slug: product?.slug || slug || null,
    product: product?.name || cleanText(body.product || body.content_name, 120) || null,
    source: cleanText(body.source, 80) || null,
    path: normalizeAnalyticsPath(body.path || body.url || body.href),
    referrer: normalizeAnalyticsReferrer(body.referrer),
    lang: body.lang === "en" ? "en" : "es",
    session_id: cleanText(body.session_id, 80) || null,
    context: sanitizeAnalyticsContext(body.context || body.extra || {}),
    user_agent: cleanText(request.headers.get("User-Agent"), 180) || null,
    ip_hash: rateLimit.ipHash,
    timestamp,
  };

  await recordAnalyticsEvent(env, event);

  return jsonResponse(request, { ok: true });
}

function normalizeAnalyticsEventName(value) {
  return cleanText(value, 60)
    .toLowerCase()
    .replace(/[^a-z0-9_:-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeAnalyticsSlug(value) {
  const slug = cleanText(value, 100)
    .toLowerCase()
    .replace(/^wearables\//, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) return "";
  if (CHECKOUT_PRODUCTS[slug]) return slug;
  if (slug === "mini-fiodor") return "dostoiecito";
  if (slug === "kraken-florero") return "jarron";
  return slug;
}

function normalizeAnalyticsPath(value) {
  const text = cleanText(value, 500);
  if (!text) return "";
  try {
    const url = new URL(text, SITE_URL);
    return cleanText(`${url.pathname}${url.search ? url.search.slice(0, 120) : ""}`, 240);
  } catch {
    return cleanText(text.split("#")[0], 240);
  }
}

function normalizeAnalyticsReferrer(value) {
  const text = cleanText(value, 500);
  if (!text) return "";
  try {
    const url = new URL(text);
    return cleanText(url.hostname.replace(/^www\./, ""), 120);
  } catch {
    return cleanText(text, 120);
  }
}

function sanitizeAnalyticsContext(context) {
  if (!context || typeof context !== "object" || Array.isArray(context)) return {};
  const blocked = new Set([
    "email",
    "customer",
    "cliente",
    "shipping",
    "direccion",
    "address",
    "telefono",
    "phone",
    "nombre",
    "name",
  ]);
  const result = {};

  for (const [key, value] of Object.entries(context).slice(0, 12)) {
    const cleanKey = cleanText(key, 50)
      .toLowerCase()
      .replace(/[^a-z0-9_:-]+/g, "_");
    if (!cleanKey || blocked.has(cleanKey)) continue;
    if (typeof value === "number" || typeof value === "boolean") {
      result[cleanKey] = value;
    } else if (typeof value === "string") {
      result[cleanKey] = cleanText(value, 160);
    }
  }

  return result;
}

async function recordAnalyticsEvent(env, event) {
  const day = event.timestamp.slice(0, 10);
  const increments = [
    `analytics:${event.event}:total`,
    `analytics:daily:${day}:${event.event}:total`,
  ];

  if (event.slug) {
    increments.push(`analytics:${event.event}:${event.slug}:total`);
    increments.push(`analytics:daily:${day}:${event.event}:${event.slug}:total`);
  }

  await Promise.all(increments.map((key) => incrementCounter(env, key)));

  const recent = await readJsonArray(env, "analytics:recent");
  recent.push(event);
  await env.VOTES.put("analytics:recent", JSON.stringify(recent.slice(-ANALYTICS_RECENT_LIMIT)));
}

function normalizeCheckoutOrderInput(body, lang) {
  const customerSource = body.customer || body.cliente || {};
  const shippingSource = body.shipping || body.direccion || {};
  const customer = {
    nombre: cleanText(customerSource.nombre || customerSource.name || body.nombre, 120),
    email: cleanText(customerSource.email || body.email, 200).toLowerCase(),
    telefono: cleanText(customerSource.telefono || customerSource.phone || body.telefono, 60),
  };
  const shipping = {
    linea1: cleanText(shippingSource.linea1 || shippingSource.address || body.direccion, 220),
    ciudad: cleanText(shippingSource.ciudad || shippingSource.city || body.ciudad, 120),
    departamento: cleanText(
      shippingSource.departamento || shippingSource.state || shippingSource.region || body.departamento,
      120,
    ),
    pais: cleanText(shippingSource.pais || shippingSource.country || body.pais, 80),
    country_code: normalizeCountryCode(
      shippingSource.country_code || shippingSource.countryCode || shippingSource.iso2 || body.country_code,
    ),
    codigo_postal: cleanText(
      shippingSource.codigo_postal || shippingSource.postalCode || shippingSource.zip || body.codigo_postal,
      40,
    ),
    notas: cleanText(shippingSource.notas || shippingSource.notes || body.notas, 500),
  };
  if (!shipping.country_code) shipping.country_code = normalizeCountryCode(shipping.pais);
  if (shipping.country_code && COUNTRY_NAMES[shipping.country_code]) {
    shipping.pais = COUNTRY_NAMES[shipping.country_code];
  }

  if (!customer.email || !EMAIL_RE.test(customer.email)) {
    return {
      ok: false,
      error: "email_invalido",
      message:
        lang === "en"
          ? "We need a valid email to create the order."
          : "Necesitamos un email válido para crear la orden.",
    };
  }

  if (
    !customer.nombre ||
    !customer.telefono ||
    !shipping.linea1 ||
    !shipping.ciudad ||
    !shipping.departamento ||
    !shipping.pais
  ) {
    return {
      ok: false,
      error: "datos_envio_incompletos",
      message:
        lang === "en"
          ? "Please complete name, phone and shipping address before payment."
          : "Completá nombre, teléfono y dirección de envío antes del pago.",
    };
  }

  return { ok: true, customer, shipping };
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

async function createOrderId(env) {
  const year = new Date().getFullYear();
  const serial = await incrementCounter(env, `orders:${year}:counter`);
  return `SP-${year}-${String(serial).padStart(4, "0")}`;
}

function orderStore(env) {
  return env.SIMIO_ORDERS || env.VOTES;
}

async function saveOrder(env, order) {
  await orderStore(env).put(`orders:${order.id}`, JSON.stringify(order));
}

async function getOrder(env, orderId) {
  if (!orderId) return null;
  const raw = await orderStore(env).get(`orders:${orderId}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatOrderAddress(order) {
  const address = order?.direccion || {};
  return [
    address.linea1,
    [address.ciudad, address.departamento].filter(Boolean).join(", "),
    [address.pais, address.codigo_postal].filter(Boolean).join(" "),
    address.notas ? `Notas: ${address.notas}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
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
  const sizeLabel = preorderSizeLabel(preorder);
  const internalText = [
    `Producto: ${preorder.product}`,
    `Slug: ${preorder.slug}`,
    `Nombre: ${preorder.nombre || "(sin nombre)"}`,
    `Email: ${preorder.email}`,
    `Talla/edicion: ${sizeLabel}`,
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
  const sizeLabel = preorderSizeLabel(preorder);

  if (preorder.lang === "en") {
    return [
      preorder.nombre ? `Hi ${preorder.nombre},` : "Hi,",
      "",
      "Your pre-order was registered.",
      "",
      `Product: ${preorder.product}`,
      `Size/edition: ${sizeLabel}`,
      `Price: USD ${preorder.price}`,
      "",
      "When the drop closes, we will write to process payment through Mercado Pago.",
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
    `Talla/edicion: ${sizeLabel}`,
    `Precio: USD ${preorder.price}`,
    "",
    "Cuando el drop cierre, te escribimos para procesar el pago vía Mercado Pago.",
    "",
    "simioplateado.com",
  ].join("\n");
}

function preorderSizeLabel(preorder) {
  if (preorder.talla === "pieza-unica") {
    return preorder.lang === "en" ? "Unique piece" : "Pieza unica";
  }

  if (preorder.talla === "unitalla") {
    return preorder.lang === "en" ? "One size" : "Unitalla";
  }

  return preorder.talla;
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

  const messageIds = [];

  for (const recipient of message.to) {
    const email = new EmailMessage(
      message.from.email,
      recipient.email,
      buildRawEmail(message, recipient),
    );
    const result = await env.EMAIL.send(email);
    if (result && result.messageId) messageIds.push(result.messageId);
  }

  return { ok: true, provider: "cloudflare_email", messageId: messageIds.join(",") || null };
}

function buildRawEmail(message, recipient) {
  const headers = [
    `From: ${formatEmailAddress(message.from)}`,
    `To: ${formatEmailAddress(recipient)}`,
    `Subject: ${encodeHeader(message.subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
  ];

  return `${headers.join("\r\n")}\r\n\r\n${normalizeEmailBody(message.text)}`;
}

function formatEmailAddress(address) {
  const email = sanitizeHeader(address.email);
  const name = sanitizeHeader(address.name || "");
  return name ? `${encodeHeader(name)} <${email}>` : email;
}

function encodeHeader(value) {
  const clean = sanitizeHeader(value);
  if (/^[\x20-\x7E]*$/.test(clean)) return clean;

  const bytes = new TextEncoder().encode(clean);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `=?UTF-8?B?${btoa(binary)}?=`;
}

function sanitizeHeader(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function normalizeEmailBody(value) {
  return String(value || "").replace(/\r?\n/g, "\r\n");
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
  return takeRateLimitedSlot(env, request, "preorders:rate", RATE_LIMIT_MAX, RATE_LIMIT_TTL_SECONDS);
}

async function takeRateLimitedSlot(env, request, prefix, max, ttlSeconds) {
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown";
  const ipHash = await sha256(ip);
  const key = `${prefix}:${ipHash}`;
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
    bucket = { count: 0, resetAt: now + ttlSeconds * 1000 };
  }

  if (bucket.count >= max) {
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

  return { allowed: true, ipHash, remaining: max - bucket.count };
}

function isCheckoutEnabled(env, product) {
  if (product.enabled === true) return true;
  if (!product.enabledEnv) return false;
  return String(env[product.enabledEnv] || "").toLowerCase() === "true";
}

function resolveCheckoutPriceCop(env, product) {
  const envKey = `SIMIO_CHECKOUT_PRICE_COP_${product.slug.toUpperCase().replaceAll("-", "_")}`;
  const raw = env[envKey] || product.defaultPriceCop;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value);
}

async function isCheckoutSoldOut(env, product) {
  if (!Number.isFinite(product.stock) || product.stock <= 0) return false;
  const approved = parseInt((await env.VOTES.get(`checkout:${product.slug}:approved_total`)) || "0", 10);
  return Number.isFinite(approved) && approved >= product.stock;
}

async function createMercadoPagoPreference(env, product) {
  const siteUrl = normalizeBaseUrl(env.SIMIO_SITE_URL || SITE_URL);
  const apiUrl = normalizeBaseUrl(env.SIMIO_API_URL || API_URL);

  return mercadoPagoRequest(env, "/checkout/preferences", {
    method: "POST",
    body: {
      items: [
        {
          id: product.slug,
          title: product.title,
          description: product.description,
          quantity: 1,
          unit_price: product.priceCop,
          currency_id: "COP",
        },
      ],
      external_reference: product.externalReference,
      notification_url: `${apiUrl}/api/mercadopago/webhook`,
      payer: {
        name: product.customer?.nombre || undefined,
        email: product.customer?.email || undefined,
        phone: product.customer?.telefono
          ? { number: product.customer.telefono }
          : undefined,
        address: product.shipping?.linea1
          ? {
              street_name: product.shipping.linea1,
              zip_code: product.shipping.codigo_postal || undefined,
            }
          : undefined,
      },
      back_urls: {
        success: `${siteUrl}/gracias`,
        failure: `${siteUrl}/gracias`,
        pending: `${siteUrl}/gracias`,
      },
      auto_return: "approved",
      statement_descriptor: "SIMIOPLATEADO",
      metadata: {
        checkout_id: product.checkoutId,
        order_id: product.orderId,
        product_slug: product.slug,
        product_name: product.name,
        customer_email: product.customer?.email || null,
        size: product.talla || null,
        price_usd: product.priceUsd,
        price_cop: product.priceCop,
        stock_run: product.stock,
        language: product.lang,
      },
    },
  });
}

async function mercadoPagoRequest(env, path, options) {
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text.slice(0, 500) };
    }
  }

  if (!response.ok) {
    const error = new Error("mercadopago_request_failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function sendCheckoutCreatedEmail(env, checkout) {
  const text = [
    `Producto: ${checkout.product}`,
    `Slug: ${checkout.slug}`,
    `Orden: ${checkout.order_id || "(sin orden)"}`,
    `Checkout ID: ${checkout.id}`,
    `Cliente: ${checkout.customer_name || "(sin nombre)"}`,
    `Email cliente: ${checkout.customer_email || "(sin email)"}`,
    `Talla/variante: ${checkout.talla || "(no aplica)"}`,
    `Envio: ${checkout.shipping_summary || "(sin direccion)"}`,
    `Preferencia Mercado Pago: ${checkout.preference_id || "(sin id)"}`,
    `Precio visible: USD ${checkout.price_usd}`,
    `Cobro Mercado Pago: COP ${checkout.price_cop}`,
    `URL: ${checkout.checkout_url}`,
    `Fecha: ${checkout.timestamp}`,
  ].join("\n");

  return sendInternalEmail(env, `[SIMIO] Checkout iniciado · ${checkout.product}`, text, "Checkout Simio");
}

async function recordInternationalQuote(env, quote) {
  await orderStore(env).put(`international_quotes:${quote.timestamp}:${quote.id}`, JSON.stringify(quote), {
    expirationTtl: INTERNATIONAL_QUOTE_RECORD_TTL_SECONDS,
  });

  const recent = await readJsonArrayFromStore(orderStore(env), "international_quotes:recent");
  recent.push(quote);
  await orderStore(env).put("international_quotes:recent", JSON.stringify(recent.slice(-50)));
  await incrementCounter(env, "international_quotes:total");
  if (quote.slug) await incrementCounter(env, `checkout:${quote.slug}:international_quotes_total`);
}

async function sendInternationalQuoteEmails(env, quote) {
  const internal = await captureEmailResult(() => sendInternationalQuoteInternalEmail(env, quote));
  const customer = await captureEmailResult(() => sendInternationalQuoteCustomerEmail(env, quote));

  return {
    ok: internal.ok || customer.ok,
    internal: internal.ok,
    customer: customer.ok,
    provider: customer.provider || internal.provider || null,
    errors: [internal.error, customer.error].filter(Boolean),
  };
}

function internationalQuoteLines(quote) {
  const publicTotal = quote.shipping_estimate || {};
  const estimate = quote.internal_shipping_estimate || {};
  return [
    `Producto: ${quote.product}`,
    `Slug: ${quote.slug}`,
    `Orden: ${quote.order_id}`,
    `Solicitud: ${quote.id}`,
    `Cliente: ${quote.customer_name || "(sin nombre)"}`,
    `Email cliente: ${quote.customer_email}`,
    `Telefono: ${quote.customer_phone || "(sin telefono)"}`,
    `Talla/variante: ${quote.talla || "(no aplica)"}`,
    `Direccion: ${formatInternationalQuoteAddress(quote)}`,
    `Pais: ${publicTotal.country_name || quote.shipping?.pais || "(sin pais)"} (${publicTotal.country_code || quote.shipping?.country_code || "?"})`,
    `Precio producto: ${formatCopPlain(quote.price_cop)} / USD ${quote.price_usd || "ref"}`,
    `Total publico con envio incluido: USD ${quote.total_usd_reference || "por calcular"} / ${formatCopPlain(quote.total_cop_reference)} ref`,
    `Costo interno DHL referencia: USD ${estimate.shipping_usd} / ${formatCopPlain(estimate.shipping_cop_reference)} ref`,
    `Costo interno pieza + DHL: USD ${quote.internal_cost_usd_reference || "por calcular"} / ${formatCopPlain(quote.internal_cost_cop_reference)} ref`,
    "Condicion internacional: DDU. Aranceles/impuestos/gastos de importacion no incluidos.",
    `URL origen: ${quote.source_url || "(sin url)"}`,
    `Fecha: ${quote.timestamp}`,
  ];
}

function formatInternationalQuoteAddress(quote) {
  const address = quote.shipping || {};
  return [
    address.linea1,
    [address.ciudad, address.departamento].filter(Boolean).join(", "),
    [address.pais, address.codigo_postal].filter(Boolean).join(" "),
    address.notas ? `Notas: ${address.notas}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function sendInternationalQuoteInternalEmail(env, quote) {
  const text = [
    ...internationalQuoteLines(quote),
    "",
    "Siguiente paso recomendado:",
    "1. Confirmar tarifa real DHL con peso/volumen/seguro.",
    "2. Confirmar si aplica caja o proteccion especial.",
    "3. Crear link Bold multimoneda por el total internacional incluido definitivo.",
    "4. Si Bold no sirve para ese pais/cliente, usar Wise Business o PayPal como respaldo.",
    "5. Responder al cliente con total final, condicion DDU y link de pago.",
  ].join("\n");

  return sendTransactionalEmail(env, {
    to: [{ email: env.ADMIN_EMAIL || INTERNAL_EMAIL, name: "Juan" }],
    from: { email: env.EMAIL_FROM || "noreply@simioplateado.com", name: "Checkout Simio" },
    subject: `[SIMIO] Cotizacion internacional · ${quote.product} · ${quote.shipping_estimate?.country_code || ""}`,
    text,
  });
}

function internationalQuoteCustomerText(quote) {
  const estimate = quote.shipping_estimate || {};
  if (quote.lang === "en") {
    return [
      quote.customer_name ? `Hi ${quote.customer_name},` : "Hi,",
      "",
      "We received your international request for Simio Plateado.",
      "",
      `Piece: ${quote.product}`,
      `Country: ${estimate.country_name || quote.shipping?.pais}`,
      `Preliminary international total, shipping included: approx. USD ${quote.total_usd_reference} / ${formatCopPlain(quote.total_cop_reference)} COP`,
      "",
      "Before payment, we will review packaging, volume and international delivery conditions. We will email you the final total and payment link.",
      "Import duties, taxes or customs fees are not included and may be charged at destination by the carrier or customs.",
      "",
      "simioplateado.com",
    ].join("\n");
  }

  return [
    quote.customer_name ? `Hola ${quote.customer_name},` : "Hola,",
    "",
    "Recibimos tu solicitud internacional en Simio Plateado.",
    "",
    `Pieza: ${quote.product}`,
    `Pais: ${estimate.country_name || quote.shipping?.pais}`,
    `Total internacional preliminar, con envio incluido: aprox. USD ${quote.total_usd_reference} / ${formatCopPlain(quote.total_cop_reference)}`,
    "",
    "Antes de cobrar revisaremos empaque, volumen y condiciones de envio internacional. Te enviaremos por email el total definitivo y el link de pago.",
    "Aranceles, impuestos o gastos de importacion no estan incluidos y podrian ser cobrados en destino por la transportadora o aduana.",
    "",
    "simioplateado.com",
  ].join("\n");
}

function sendInternationalQuoteCustomerEmail(env, quote) {
  const subject =
    quote.lang === "en"
      ? `International quote request received · ${quote.product}`
      : `Recibimos tu solicitud internacional · ${quote.product}`;

  return sendTransactionalEmail(env, {
    to: [{ email: quote.customer_email, name: quote.customer_name || quote.customer_email }],
    from: { email: env.EMAIL_FROM || "noreply@simioplateado.com", name: "Simio Plateado" },
    subject,
    text: internationalQuoteCustomerText(quote),
  });
}

async function recordCheckoutIssue(env, issue) {
  await env.VOTES.put(`checkout:issues:${issue.timestamp}:${issue.id}`, JSON.stringify(issue), {
    expirationTtl: CHECKOUT_ISSUE_RECORD_TTL_SECONDS,
  });

  const recent = await readJsonArray(env, "checkout:issues:recent");
  recent.push(issue);
  await env.VOTES.put("checkout:issues:recent", JSON.stringify(recent.slice(-50)));

  const total = await incrementCounter(env, "checkout:issues:total");
  if (CHECKOUT_PRODUCTS[issue.slug]) {
    await incrementCounter(env, `checkout:${issue.slug}:issues_total`);
  }

  return total;
}

async function sendCheckoutIssueEmails(env, issue, total) {
  const internal = await captureEmailResult(() => sendCheckoutIssueInternalEmail(env, issue, total));
  const customer = issue.email
    ? await captureEmailResult(() => sendCheckoutIssueCustomerEmail(env, issue))
    : { ok: false, provider: null, error: null };

  return {
    ok: internal.ok || customer.ok,
    internal: internal.ok,
    customer: customer.ok,
    provider: customer.provider || internal.provider || null,
    errors: [internal.error, customer.error].filter(Boolean),
  };
}

function checkoutIssueContextLines(issue) {
  return [
    `Producto: ${issue.product || "(sin producto)"}`,
    `Slug: ${issue.slug}`,
    `Email cliente: ${issue.email || "(sin email)"}`,
    `Origen: ${issue.source || "(sin origen)"}`,
    `Estado reportado: ${issue.status || "(sin estado)"}`,
    `Mensaje visible: ${issue.message || "(sin mensaje)"}`,
    `URL: ${issue.url || "(sin URL)"}`,
    `Pago Mercado Pago: ${issue.payment_id || "(sin id)"}`,
    `Preferencia Mercado Pago: ${issue.preference_id || "(sin id)"}`,
    `Referencia externa: ${issue.external_reference || "(sin referencia)"}`,
    `Orden: ${issue.order_id || "(sin orden)"}`,
    `Checkout ID: ${issue.checkout_id || "(sin checkout)"}`,
    `IP hash: ${issue.ip_hash || "(sin hash)"}`,
    `User-Agent: ${issue.user_agent || "(sin user-agent)"}`,
    `Fecha: ${issue.timestamp}`,
  ];
}

function sendCheckoutIssueInternalEmail(env, issue, total) {
  const text = [
    ...checkoutIssueContextLines(issue),
    `Total reportes acumulados: ${total}`,
  ].join("\n");

  return sendInternalEmail(env, `[SIMIO] Cliente no pudo comprar · ${issue.product}`, text, "Checkout Simio");
}

function checkoutIssueCustomerText(issue) {
  if (issue.lang === "en") {
    return [
      "Hi,",
      "",
      "Sorry for the friction with your Simio Plateado purchase.",
      "",
      "We received your report and will review the payment flow. We will write to this email when checkout is working smoothly again.",
      "",
      `Product: ${issue.product}`,
      "",
      "You can also write to el@simioplateado.com if you prefer.",
      "",
      "simioplateado.com",
    ].join("\n");
  }

  return [
    "Hola,",
    "",
    "Perdón por la fricción con tu compra en Simio Plateado.",
    "",
    "Recibimos tu aviso y vamos a revisar el flujo de pago. Te escribiremos a este correo cuando puedas pagar sin problema.",
    "",
    `Producto: ${issue.product}`,
    "",
    "También puedes escribirnos a el@simioplateado.com si prefieres.",
    "",
    "simioplateado.com",
  ].join("\n");
}

function sendCheckoutIssueCustomerEmail(env, issue) {
  const subject =
    issue.lang === "en"
      ? `We received your checkout report · ${issue.product}`
      : `Recibimos tu aviso de compra · ${issue.product}`;

  return sendTransactionalEmail(env, {
    to: [{ email: issue.email, name: issue.email }],
    from: { email: "noreply@simioplateado.com", name: "Simio Plateado" },
    subject,
    text: checkoutIssueCustomerText(issue),
  });
}

async function handleMercadoPagoWebhook(request, env, ctx) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const url = new URL(request.url);
  const paymentId =
    body?.data?.id ||
    body?.id ||
    url.searchParams.get("data.id") ||
    url.searchParams.get("id");

  if (!paymentId) {
    return jsonResponse(request, { ok: true, ignored: "missing_payment_id" }, 200, false);
  }

  if (!env.MERCADOPAGO_ACCESS_TOKEN) {
    return jsonResponse(request, { ok: true, ignored: "missing_access_token" }, 200, false);
  }

  let payment;
  try {
    payment = await mercadoPagoRequest(env, `/v1/payments/${paymentId}`, { method: "GET" });
  } catch (error) {
    const failure = {
      payment_id: String(paymentId),
      error: error && (error.code || error.message) ? error.code || error.message : "unknown",
      status: error && error.status ? error.status : null,
      timestamp: new Date().toISOString(),
    };

    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(recordCheckoutFailure(env, "webhook", failure));
    } else {
      await recordCheckoutFailure(env, "webhook", failure);
    }

    return jsonResponse(request, { ok: true, pending: "payment_fetch_failed" }, 200, false);
  }

  const externalReference = payment.external_reference || "";
  if (!externalReference.startsWith("simio:")) {
    return jsonResponse(request, { ok: true, ignored: "external_reference" }, 200, false);
  }

  const processedKey = `checkout:mercadopago:payments:${paymentId}`;
  if (await env.VOTES.get(processedKey)) {
    return jsonResponse(request, { ok: true, duplicate: true }, 200, false);
  }

  const [, slug, checkoutId, orderIdFromReference] = externalReference.split(":");
  const orderId =
    orderIdFromReference ||
    (checkoutId ? await env.VOTES.get(`checkout:order:${checkoutId}`) : null) ||
    (await env.VOTES.get(`order:external:${externalReference}`));
  const paymentRecord = {
    payment_id: String(paymentId),
    checkout_id: checkoutId,
    order_id: orderId || null,
    slug,
    status: payment.status || null,
    status_detail: payment.status_detail || null,
    amount: payment.transaction_amount || null,
    currency: payment.currency_id || null,
    payer_email: payment.payer?.email || null,
    external_reference: externalReference,
    timestamp: new Date().toISOString(),
  };

  await env.VOTES.put(processedKey, JSON.stringify(paymentRecord), {
    expirationTtl: CHECKOUT_RECORD_TTL_SECONDS,
  });
  await env.VOTES.put(`checkout:${checkoutId}:payment`, JSON.stringify(paymentRecord), {
    expirationTtl: CHECKOUT_RECORD_TTL_SECONDS,
  });

  if (payment.status === "approved") {
    await incrementCounter(env, `checkout:${slug}:approved_total`);
  }

  const order = await applyPaymentToOrder(env, orderId, payment, paymentRecord);

  if (ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(sendPaymentNotificationEmail(env, paymentRecord, order).catch(() => null));
  }

  return jsonResponse(request, { ok: true }, 200, false);
}

async function applyPaymentToOrder(env, orderId, payment, paymentRecord) {
  const order = await getOrder(env, orderId);
  if (!order) return null;

  const now = new Date().toISOString();
  const status = payment.status || "unknown";
  const next = {
    ...order,
    mp_payment_id: String(paymentRecord.payment_id),
    mp_status: status,
    estado_pago: status === "approved" ? "PAGADO" : status.toUpperCase(),
    payment: paymentRecord,
    updated_at: now,
  };

  if (status === "approved" && (!next.estado_fulfillment || next.estado_fulfillment === "PENDIENTE_PAGO")) {
    next.estado_fulfillment = "PAGADO";
  }

  await saveOrder(env, next);
  return next;
}

async function sendPaymentNotificationEmail(env, paymentRecord, order) {
  const text = [
    `Orden: ${paymentRecord.order_id || "(sin orden)"}`,
    `Producto slug: ${paymentRecord.slug}`,
    `Checkout ID: ${paymentRecord.checkout_id}`,
    `Pago Mercado Pago: ${paymentRecord.payment_id}`,
    `Estado: ${paymentRecord.status || "(sin estado)"}`,
    `Detalle: ${paymentRecord.status_detail || "(sin detalle)"}`,
    `Monto: ${paymentRecord.currency || "COP"} ${paymentRecord.amount || "(sin monto)"}`,
    `Cliente: ${order?.cliente_nombre || "(no disponible)"}`,
    `Email comprador: ${order?.cliente_email || paymentRecord.payer_email || "(no disponible)"}`,
    `Telefono: ${order?.cliente_telefono || "(no disponible)"}`,
    `Talla/variante: ${order?.talla || "(no aplica)"}`,
    `Envio: ${order ? formatOrderAddress(order) : "(no disponible)"}`,
    `Fulfillment: ${order?.estado_fulfillment || "(sin estado)"}`,
    `Fecha: ${paymentRecord.timestamp}`,
  ].join("\n");

  return sendInternalEmail(
    env,
    `[SIMIO] Pago Mercado Pago · ${paymentRecord.status || "actualización"}`,
    text,
    "Checkout Simio",
  );
}

async function recordCheckoutFailure(env, slug, failure) {
  const key = `checkout:${slug}:failures`;
  const existing = await readJsonArray(env, key);
  existing.push(failure);
  await env.VOTES.put(key, JSON.stringify(existing.slice(-20)));
}

function checkoutFailureData(checkout, error) {
  return {
    id: checkout.id,
    slug: checkout.slug,
    product: checkout.product,
    error: error && (error.code || error.message) ? error.code || error.message : "unknown",
    status: error && error.status ? error.status : null,
    payload: error && error.payload ? error.payload : null,
    timestamp: new Date().toISOString(),
  };
}

function normalizeBaseUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}

async function incrementCounter(env, key) {
  const current = parseInt((await env.VOTES.get(key)) || "0", 10);
  const next = Number.isFinite(current) ? current + 1 : 1;
  await env.VOTES.put(key, String(next));
  return next;
}

async function handleCentral(request, env, ctx) {
  if (!isCentralAuthorized(request, env)) {
    return centralUnauthorized(request);
  }

  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const section = segments[2];
  const id = segments[3];
  const action = segments[4];

  if (request.method === "GET" && (!section || section === "orders") && !id) {
    const orders = await listOrders(env);
    return jsonResponse(request, { ok: true, count: orders.length, orders: orders.map(orderSummary) });
  }

  if (request.method === "GET" && section === "orders" && id && !action) {
    const order = await getOrder(env, id);
    if (!order) return jsonResponse(request, { error: "orden_no_encontrada" }, 404);
    return jsonResponse(request, { ok: true, order });
  }

  if (request.method === "POST" && section === "orders" && id && action === "status") {
    return updateCentralOrderStatus(request, env, ctx, id);
  }

  if (request.method === "GET" && section === "inventory") {
    const inventory = await buildCentralInventory(env);
    return jsonResponse(request, { ok: true, inventory });
  }

  if (request.method === "GET" && section === "analytics") {
    const analytics = await buildCentralAnalytics(env);
    return jsonResponse(request, { ok: true, analytics });
  }

  if (request.method === "GET" && section === "export") {
    const orders = await listOrders(env);
    return csvResponse(request, ordersToCsv(orders), "simio-central-orders.csv");
  }

  return jsonResponse(request, { error: "central_ruta_no_encontrada" }, 404);
}

function isCentralAuthorized(request, env) {
  const accessEmail = cleanText(request.headers.get("Cf-Access-Authenticated-User-Email"), 200).toLowerCase();
  const allowedEmails = String(env.CENTRAL_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const centralCode = String(env.CENTRAL_ACCESS_CODE || "").trim();
  const providedCode = cleanText(request.headers.get("X-Simio-Central-Code"), 200);

  if (allowedEmails.length && accessEmail && allowedEmails.includes(accessEmail)) return true;
  if (centralCode && providedCode && providedCode === centralCode) return true;

  return isAuthorized(request, env);
}

function centralUnauthorized(request) {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "WWW-Authenticate": 'Basic realm="Simio Central"',
      ...corsHeaders(request),
    },
  });
}

async function listOrders(env) {
  const orders = [];
  let cursor;

  do {
    const list = await orderStore(env).list({ prefix: "orders:SP-", cursor });

    for (const key of list.keys) {
      const order = await getOrder(env, key.name.slice("orders:".length));
      if (order) orders.push(order);
    }

    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  return orders.sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
}

function orderSummary(order) {
  return {
    id: order.id,
    pieza: order.pieza,
    title: order.title || order.pieza,
    slug: order.slug,
    talla: order.talla || "",
    cliente_nombre: order.cliente_nombre,
    cliente_email: order.cliente_email,
    cliente_telefono: order.cliente_telefono,
    ciudad: order.direccion?.ciudad || "",
    pais: order.direccion?.pais || "",
    monto_usd: order.monto_usd,
    monto: order.monto,
    moneda: order.moneda,
    estado_pago: order.estado_pago,
    mp_status: order.mp_status,
    estado_fulfillment: order.estado_fulfillment,
    mp_payment_id: order.mp_payment_id,
    transportadora: order.transportadora,
    guia: order.guia,
    fecha: order.fecha,
    updated_at: order.updated_at,
  };
}

async function updateCentralOrderStatus(request, env, ctx, orderId) {
  const order = await getOrder(env, orderId);
  if (!order) return jsonResponse(request, { error: "orden_no_encontrada" }, 404);

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, { error: "json_invalido" }, 400);
  }

  const status = cleanText(body.estado_fulfillment || body.status, 40).toUpperCase();
  if (!CENTRAL_FULFILLMENT_STATES.has(status)) {
    return jsonResponse(request, { error: "estado_invalido" }, 400);
  }

  const guia = cleanText(body.guia ?? order.guia, 120);
  const transportadora = cleanText(body.transportadora ?? order.transportadora, 120);

  if (status === "ENVIADO" && (!guia || !transportadora)) {
    return jsonResponse(
      request,
      { error: "envio_incompleto", message: "Para marcar como enviado hace falta guia y transportadora." },
      400,
    );
  }

  const now = new Date().toISOString();
  const wasSent = order.estado_fulfillment === "ENVIADO";
  const next = {
    ...order,
    estado_fulfillment: status,
    guia,
    transportadora,
    fecha_envio: status === "ENVIADO" ? order.fecha_envio || now : body.fecha_envio || order.fecha_envio || null,
    notas_internas: cleanText(body.notas_internas ?? order.notas_internas, 1000),
    checklist: normalizeChecklist(body.checklist, order.checklist),
    updated_at: now,
  };

  await saveOrder(env, next);

  if (status === "ENVIADO" && !wasSent && ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(sendShippingNotificationEmail(env, next).catch(() => null));
  } else if (status === "ENVIADO" && !wasSent) {
    await sendShippingNotificationEmail(env, next).catch(() => null);
  }

  return jsonResponse(request, { ok: true, order: next });
}

function normalizeChecklist(input, current = {}) {
  if (!input || typeof input !== "object") return current || {};

  return {
    producido: Boolean(input.producido ?? current.producido),
    control_calidad: Boolean(input.control_calidad ?? current.control_calidad),
    empacado: Boolean(input.empacado ?? current.empacado),
    enviado: Boolean(input.enviado ?? current.enviado),
  };
}

async function sendShippingNotificationEmail(env, order) {
  if (!order.cliente_email) return null;

  const text =
    order.lang === "en"
      ? [
          order.cliente_nombre ? `Hi ${order.cliente_nombre},` : "Hi,",
          "",
          `Your Simio Plateado piece is on its way: ${order.title || order.pieza}.`,
          `Carrier: ${order.transportadora}`,
          `Tracking: ${order.guia}`,
          "",
          "simioplateado.com",
        ].join("\n")
      : [
          order.cliente_nombre ? `Hola ${order.cliente_nombre},` : "Hola,",
          "",
          `Tu pieza de Simio Plateado ya va en camino: ${order.title || order.pieza}.`,
          `Transportadora: ${order.transportadora}`,
          `Guía: ${order.guia}`,
          "",
          "simioplateado.com",
        ].join("\n");

  return sendTransactionalEmail(env, {
    to: [{ email: order.cliente_email, name: order.cliente_nombre || order.cliente_email }],
    from: { email: "noreply@simioplateado.com", name: "Simio Plateado" },
    subject:
      order.lang === "en"
        ? `Your Simio Plateado order is on its way · ${order.id}`
        : `Tu orden Simio Plateado va en camino · ${order.id}`,
    text,
  });
}

async function buildCentralInventory(env) {
  const inventory = [];

  for (const product of Object.values(CHECKOUT_PRODUCTS)) {
    const approved = parseInt((await env.VOTES.get(`checkout:${product.slug}:approved_total`)) || "0", 10);
    const sold = Number.isFinite(approved) ? approved : 0;
    inventory.push({
      slug: product.slug,
      name: product.name,
      title: product.title,
      price_usd: product.priceUsd,
      price_cop: resolveCheckoutPriceCop(env, product),
      stock: product.stock,
      sold,
      available: Number.isFinite(product.stock) ? Math.max(0, product.stock - sold) : null,
      checkout_enabled: isCheckoutEnabled(env, product),
    });
  }

  return inventory;
}

async function buildCentralAnalytics(env) {
  const today = new Date().toISOString().slice(0, 10);
  const totals = {};
  const todayTotals = {};

  for (const event of ANALYTICS_EVENTS) {
    totals[event] = await readCounter(env, `analytics:${event}:total`);
    todayTotals[event] = await readCounter(env, `analytics:daily:${today}:${event}:total`);
  }

  const products = [];
  for (const product of Object.values(CHECKOUT_PRODUCTS)) {
    const row = {
      slug: product.slug,
      name: product.name,
      price_cop: resolveCheckoutPriceCop(env, product),
      stock: product.stock,
      checkout_enabled: isCheckoutEnabled(env, product),
      events: {},
      checkout: {
        approved: await readCounter(env, `checkout:${product.slug}:approved_total`),
        issues: await readCounter(env, `checkout:${product.slug}:issues_total`),
        failures: (await readJsonArray(env, `checkout:${product.slug}:failures`)).length,
      },
    };

    for (const event of ANALYTICS_EVENTS) {
      const total = await readCounter(env, `analytics:${event}:${product.slug}:total`);
      if (total > 0) row.events[event] = total;
    }
    products.push(row);
  }

  return {
    generated_at: new Date().toISOString(),
    date: today,
    totals,
    today: todayTotals,
    products,
    checkout_issues: {
      total: await readCounter(env, "checkout:issues:total"),
      recent: await readJsonArray(env, "checkout:issues:recent"),
    },
    recent_events: await readJsonArray(env, "analytics:recent"),
  };
}

async function readCounter(env, key) {
  const value = parseInt((await env.VOTES.get(key)) || "0", 10);
  return Number.isFinite(value) ? value : 0;
}

function ordersToCsv(orders) {
  const headers = [
    "id",
    "fecha",
    "pieza",
    "talla",
    "monto_usd",
    "monto_cop",
    "estado_pago",
    "estado_fulfillment",
    "cliente_nombre",
    "cliente_email",
    "cliente_telefono",
    "direccion",
    "ciudad",
    "departamento",
    "pais",
    "codigo_postal",
    "transportadora",
    "guia",
    "mp_payment_id",
    "notas_internas",
  ];
  const rows = orders.map((order) => [
    order.id,
    order.fecha,
    order.pieza,
    order.talla,
    order.monto_usd,
    order.monto,
    order.estado_pago,
    order.estado_fulfillment,
    order.cliente_nombre,
    order.cliente_email,
    order.cliente_telefono,
    order.direccion?.linea1,
    order.direccion?.ciudad,
    order.direccion?.departamento,
    order.direccion?.pais,
    order.direccion?.codigo_postal,
    order.transportadora,
    order.guia,
    order.mp_payment_id,
    order.notas_internas,
  ]);

  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function csvResponse(request, csv, filename) {
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...corsHeaders(request),
    },
  });
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

function corsResponse(request, methods = "POST, OPTIONS", headers = "Content-Type") {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      "Access-Control-Allow-Methods": methods,
      "Access-Control-Allow-Headers": headers,
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
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}
