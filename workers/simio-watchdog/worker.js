import { EmailMessage } from "cloudflare:email";

const DEFAULT_HEALTH_URL = "https://api.simioplateado.com/api/health";
const DEFAULT_FAIL_THRESHOLD = 2;
const DEFAULT_ALERT_COOLDOWN_SECONDS = 60 * 60 * 4;
const DEFAULT_HISTORY_SIZE = 50;
const DEFAULT_ADMIN_EMAIL = "el@simioplateado.com";
const DEFAULT_EMAIL_FROM = "noreply@simioplateado.com";

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runWatchdog(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/status") {
      return json({
        ok: true,
        service: "simio-watchdog",
        state: await kvGetJson(env, "watchdog:state"),
        history: (await kvGetJson(env, "watchdog:history")) || [],
        config: publicConfig(env),
      });
    }

    return new Response("simio-watchdog", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};

async function runWatchdog(env) {
  const config = publicConfig(env);
  const previous = (await kvGetJson(env, "watchdog:state")) || {};
  const result = await fetchHealth(config.healthUrl);
  const passed = Boolean(result.ok);
  const failureStreak = passed ? 0 : Number(previous.failureStreak || 0) + 1;
  const now = Date.now();
  let alertedAt = Number(previous.alertedAt || 0);
  let alert = null;

  if (!passed && failureStreak >= config.failThreshold) {
    const canAlert = !alertedAt || now - alertedAt >= config.alertCooldownSeconds * 1000;
    if (canAlert) {
      alert = await sendAlert(env, "caida", result, failureStreak, config);
      alertedAt = now;
    }
  }

  if (passed && Number(previous.failureStreak || 0) >= config.failThreshold) {
    alert = await sendAlert(env, "recuperado", result, 0, config);
    alertedAt = 0;
  }

  const state = {
    ok: passed,
    failureStreak,
    alertedAt,
    lastAlert: alert,
    lastCheck: result,
    updatedAt: new Date().toISOString(),
  };

  await kvPutJson(env, "watchdog:state", state);
  await appendHistory(env, state, config.historySize);
  return state;
}

async function fetchHealth(healthUrl) {
  const startedAt = Date.now();
  try {
    const response = await fetch(healthUrl, {
      signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined,
    });
    const text = await response.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { raw: text.slice(0, 500) };
    }
    return {
      ok: response.ok && payload?.ok === true,
      httpStatus: response.status,
      payload,
      durationMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ok: false,
      httpStatus: null,
      error: error?.message || "health_fetch_failed",
      durationMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    };
  }
}

async function appendHistory(env, state, maxSize) {
  const history = (await kvGetJson(env, "watchdog:history")) || [];
  history.unshift({
    ok: state.ok,
    failureStreak: state.failureStreak,
    httpStatus: state.lastCheck?.httpStatus ?? null,
    checks: state.lastCheck?.payload?.checks || null,
    updatedAt: state.updatedAt,
  });
  await kvPutJson(env, "watchdog:history", history.slice(0, maxSize));
}

async function sendAlert(env, type, result, failureStreak, config) {
  const isRecovery = type === "recuperado";
  const subject = isRecovery
    ? "[SIMIO] Checkout recuperado"
    : `[SIMIO] ALERTA checkout caido (${failureStreak})`;
  const checks = result.payload?.checks
    ? Object.entries(result.payload.checks)
        .map(([key, value]) => `- ${key}: ${value ? "ok" : "fallo"}`)
        .join("\n")
    : "- sin checks detallados";
  const text = [
    isRecovery ? "El health check de Simio volvió a responder OK." : "El health check de Simio está fallando.",
    "",
    `URL: ${config.healthUrl}`,
    `HTTP: ${result.httpStatus ?? "sin respuesta"}`,
    `Racha de fallos: ${failureStreak}`,
    `Duración: ${result.durationMs} ms`,
    "",
    "Checks:",
    checks,
    "",
    result.error ? `Error: ${result.error}` : "",
    `Fecha: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const email = await sendEmail(env, {
      to: [{ email: config.adminEmail, name: "Juan" }],
      from: { email: config.emailFrom, name: "Simio Watchdog" },
      subject,
      text,
    });
    return { ok: true, provider: email.provider, sentAt: new Date().toISOString() };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || "alert_email_failed",
      sentAt: new Date().toISOString(),
    };
  }
}

async function sendEmail(env, message) {
  if (env.EMAIL && typeof env.EMAIL.send === "function") {
    const ids = [];
    for (const recipient of message.to) {
      const email = new EmailMessage(message.from.email, recipient.email, rawEmail(message, recipient));
      const result = await env.EMAIL.send(email);
      if (result?.messageId) ids.push(result.messageId);
    }
    return { provider: "cloudflare_email", messageId: ids.join(",") || null };
  }

  if (!env.MAILCHANNELS_API_KEY) {
    throw new Error("email_provider_missing");
  }

  const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": env.MAILCHANNELS_API_KEY,
    },
    body: JSON.stringify({
      personalizations: [{ to: message.to }],
      from: message.from,
      subject: message.subject,
      content: [{ type: "text/plain", value: message.text }],
    }),
  });

  if (!response.ok) throw new Error(`mailchannels_${response.status}`);
  return { provider: "mailchannels" };
}

function rawEmail(message, recipient) {
  return [
    `From: ${message.from.name} <${message.from.email}>`,
    `To: ${recipient.name || recipient.email} <${recipient.email}>`,
    `Subject: ${message.subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    message.text,
  ].join("\r\n");
}

function publicConfig(env) {
  return {
    healthUrl: env.HEALTH_URL || DEFAULT_HEALTH_URL,
    failThreshold: readPositiveInt(env.FAIL_THRESHOLD, DEFAULT_FAIL_THRESHOLD),
    alertCooldownSeconds: readPositiveInt(env.ALERT_COOLDOWN_SECONDS, DEFAULT_ALERT_COOLDOWN_SECONDS),
    historySize: readPositiveInt(env.HISTORY_SIZE, DEFAULT_HISTORY_SIZE),
    adminEmail: env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
    emailFrom: env.EMAIL_FROM || DEFAULT_EMAIL_FROM,
    kvBound: Boolean(env.WATCHDOG),
    emailBound: Boolean(env.MAILCHANNELS_API_KEY || env.EMAIL),
  };
}

function readPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function kvGetJson(env, key) {
  try {
    const raw = await env.WATCHDOG?.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function kvPutJson(env, key, value) {
  if (!env.WATCHDOG?.put) return;
  await env.WATCHDOG.put(key, JSON.stringify(value));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
