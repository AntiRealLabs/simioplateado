# Brief V0.18 · Pixel de Meta + actualización de política de privacidad

*Brief autocontenido para un agente de Claude Code. Instala el Pixel de Meta en simioplateado.com para medir la efectividad de los anuncios y entender el embudo, y actualiza la política de privacidad para reflejar honestamente lo que se está haciendo. Versión 1.0 · 2026-05-29.*

---

## 0 · Contexto y por qué

Juan está pagando publicidad en Instagram/Facebook sin saber si los clics que recibe están convirtiendo en compras. Hoy los anuncios son **ciegos** — el algoritmo no tiene señales de conversión, así que no puede aprender a quién mostrarlos. Resultado: gasto sub-óptimo.

La solución estándar es el **Pixel de Meta** (fragmento de JS en el sitio) que envía eventos a Meta cuando el visitante hace cosas relevantes (ver producto, iniciar checkout, completar compra). Con esos datos, Meta optimiza la entrega y Juan puede medir conversiones reales.

Decisión tomada: implementar el Pixel **navegador-side básico**, sin Advanced Matching (no se envían datos de identidad como email/teléfono al Pixel; solo eventos anónimos), y actualizar la política de privacidad para disclosure honesto.

**Fase 2 futura (no en este brief):** Conversions API (CAPI) desde el Worker para complementar el Pixel con eventos servidor-side. Mejora precisión cuando el navegador bloquea cookies. Se hace cuando la base esté estable.

---

## 1 · Lo que necesita Juan tener listo (manual, antes de pegarle a Claude Code)

1. Ir a `business.facebook.com/events_manager`.
2. Crear un nuevo Pixel/Dataset llamado `Simio Plateado`.
3. Tipo: **Solo Pixel** (no conectar partner integrations en v1).
4. Copiar el **Pixel ID** (un número de ~15 dígitos).
5. Pasarle ese Pixel ID al agente.

(El agente NO crea el Pixel en Meta — eso es cuenta personal de Juan. El agente solo lo integra al código.)

---

## 2 · Decisiones de diseño (no negociables)

1. **Pixel base + 4 eventos.** Ni más ni menos en v1: `PageView`, `ViewContent`, `InitiateCheckout`, `Purchase`. Suficiente para que el algoritmo aprenda y para medir el embudo.

2. **Sin Advanced Matching.** El Pixel NO envía email, teléfono, nombre ni ningún PII al servidor de Meta — solo eventos anónimos + el cookie que Meta ya tiene de su propia red. Esto es lo que mantiene el espíritu de la marca: medimos comportamiento, no entregamos identidades.

3. **Pixel ID como variable de entorno**, no hardcoded. En el frontend lo recibe vía una variable inyectada al build o vía un atributo `data-` en el HTML que el script lee. Tener un solo lugar donde cambiarlo.

4. **Carga asíncrona y no bloqueante.** El script de Meta NO debe bloquear la renderización ni romper la página si Meta no responde. Si el visitante tiene un ad-blocker que bloquea el Pixel, el sitio sigue funcionando perfecto.

5. **Eventos disparados desde puntos ya existentes del código**, no inventar nuevos handlers. Anclar al flujo ya construido:
   - `ViewContent` cuando se abre el modal o se navega a `/tienda/<slug>`.
   - `InitiateCheckout` cuando `iniciarCompra()` recibe el clic (antes del `fetch`).
   - `Purchase` cuando el usuario llega a la página de confirmación con `?checkout=success` o el equivalente.

6. **Política de privacidad actualizada en el mismo PR.** Código y disclosure suben juntos — no se mergea uno sin el otro.

---

## 3 · Implementación paso a paso

### Paso 1 · Snippet base del Pixel

En `mockups/index.html`, antes del cierre de `</head>`:

```html
<!-- Meta Pixel -->
<script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'PIXEL_ID_AQUI');  // ← reemplazar con el Pixel ID real de Juan
  fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none" 
       src="https://www.facebook.com/tr?id=PIXEL_ID_AQUI&ev=PageView&noscript=1"/>
</noscript>
<!-- End Meta Pixel -->
```

Reemplazar `PIXEL_ID_AQUI` (en los dos lugares) con el ID que pasó Juan.

### Paso 2 · Eventos en el JS existente

En `mockups/index.html`, en el bloque `<script>` principal:

**`ViewContent`** — disparar cuando se abre la ficha de una pieza. Hay dos puntos según el flujo:

- En `abrirModal(slug)`, al final de la función:
  ```js
  if (typeof fbq === 'function') {
    fbq('track', 'ViewContent', {
      content_ids: [slug],
      content_name: slug,
      content_type: 'product',
      currency: 'COP'
    });
  }
  ```

- En la lógica de navegación a `/tienda/<slug>` (donde sea que se renderice esa vista), mismo evento, mismo payload. Si el SPA carga la Tienda como ruta separada del modal, asegurarse de que también dispare ahí.

**`InitiateCheckout`** — al INICIO de `iniciarCompra(event, slug)`, ANTES del `fetch`:

```js
if (typeof fbq === 'function') {
  fbq('track', 'InitiateCheckout', {
    content_ids: [slug],
    content_type: 'product',
    currency: 'COP'
  });
}
```

(Importante: ANTES del `fetch` para que se registre incluso si el endpoint falla — eso ayuda a detectar embudos rotos en el futuro.)

**`Purchase`** — en la página/vista que se muestra cuando el query string trae `checkout=success`. El usuario regresa de Mercado Pago con `?checkout=success` después de pagar. Detectar en `DOMContentLoaded` (o equivalente del SPA):

```js
const params = new URLSearchParams(window.location.search);
if (params.get('checkout') === 'success' && typeof fbq === 'function') {
  // Idealmente leer el monto/pieza desde el query o desde la respuesta del Worker
  // /api/order/:ref. En v1, si no está disponible, enviarlo sin valor exacto:
  fbq('track', 'Purchase', {
    value: parseFloat(params.get('value') || '0'),
    currency: 'COP',
    content_ids: [params.get('pieza') || 'unknown']
  });
}
```

Sería ideal que el back_url de Mercado Pago incluya `&pieza=...&value=...` para que el Purchase tenga datos reales. Si requiere cambio en el Worker (donde se construyen `back_urls`), hacerlo: ajustar `createMercadoPagoPreference` para que `back_urls.success` incluya esos query params.

### Paso 3 · Eventos en la página de Tienda (URLs limpias)

Si la página `/tienda/<slug>` se sirve como ruta del SPA y el `PageView` solo se dispara una vez al cargar (cosa común en SPAs), agregar un `fbq('track', 'PageView')` adicional cuando el router del SPA cambia de ruta — para que cada vista cuente como página vista. Esto es opcional pero recomendado.

### Paso 4 · Actualizar política de privacidad

Editar `doctrina/legal-privacidad.md` con los cambios del **Apéndice A** de este brief (al final). Los cambios:

- §3.2 (datos recolectados automáticamente): agregar fila para eventos del Pixel.
- §4 (con quién compartimos): agregar fila para Meta.
- §8 (cookies): reemplazar la línea "No usamos cookies de publicidad de terceros…" con la nueva sección honesta que sí menciona el Pixel.

Ajustar la versión: bumpear a 1.1 y la fecha a la del PR.

### Paso 5 · Probar localmente

```bash
cd mockups
python3 -m http.server 8000
```

Abrir Chrome con la extensión **Meta Pixel Helper** instalada (disponible gratis en Chrome Web Store). Navegar por el sitio. Verificar:

- En la home: el Helper detecta el Pixel y muestra el `PageView`.
- Al hacer clic en una pieza y abrir el modal: muestra `ViewContent` con el `content_ids` correcto.
- Al llenar el formulario y hacer clic en COMPRAR AHORA: muestra `InitiateCheckout`.
- (Purchase solo se prueba con un pago real de prueba en sandbox/live.)

Si el Pixel Helper no detecta el ID o muestra errores, revisar consola del navegador.

### Paso 6 · Commit + push

Mensaje sugerido:

```
Integrar Meta Pixel + actualizar política de privacidad

- Pixel base + eventos PageView, ViewContent, InitiateCheckout, Purchase
- Sin Advanced Matching (solo eventos anónimos)
- Pixel ID como variable, no hardcoded
- Política de privacidad refleja el uso real del píxel
```

---

## 4 · Quien hace qué

**Juan (antes y después):**

- [ ] Crear el Pixel en `business.facebook.com/events_manager`.
- [ ] Pasarle el Pixel ID al agente.
- [ ] Después del deploy: ir a Events Manager y confirmar que llegan eventos (debería aparecer "PageView" en los próximos minutos).
- [ ] En 24-48h: confirmar que los anuncios activos empiezan a optimizar por conversión, no solo por clic.

**Agente Claude Code:**

- [ ] Pixel base en `mockups/index.html`.
- [ ] 4 eventos integrados en los puntos correctos del JS.
- [ ] Ajustar `back_urls.success` del Worker para incluir `&pieza=...&value=...` si no las incluye ya.
- [ ] Actualizar `doctrina/legal-privacidad.md` con el Apéndice A.
- [ ] Probar local con Pixel Helper.
- [ ] Commit + push.

---

## 5 · Fase 2 (no implementar ahora, solo dejar nota)

**Conversions API (CAPI) desde el Worker.** Cuando el webhook de MercadoPago confirma una compra, el Worker manda el evento `Purchase` server-side a Meta también. Beneficios:

- Funciona aunque el visitante tenga ad-blocker que bloquee el Pixel del navegador.
- Mucho más confiable: el evento se manda desde el Worker con datos reales del pago, no depende del cliente.
- Permite "deduplicación" cuando ambos (Pixel y CAPI) reportan el mismo evento.

Esto es plus, no urgente. Se hace cuando ya haya datos suficientes para que valga la pena el ajuste.

---

## Apéndice A · Cambios al `doctrina/legal-privacidad.md`

### A.1 · En la sección §3.2 (Datos que se recolectan automáticamente)

Agregar una fila a la tabla:

| Eventos de navegación (página vista, ver producto, inicio de checkout, compra) | Visita al sitio | Medir efectividad de campañas publicitarias y mejorar la experiencia |

### A.2 · En la sección §4 (Con quién compartimos tus datos)

Agregar una fila a la tabla:

| **Meta (Facebook / Instagram)** | Eventos de navegación anónimos (no incluye nombre, email ni teléfono) | Medir efectividad de anuncios y optimizar la entrega | facebook.com/privacy/policy |

### A.3 · Reemplazar la sección §8 completa con:

```markdown
## 8 · Cookies y tecnologías similares

simioplateado.com usa el mínimo posible de tecnologías de rastreo:

| Tipo de cookie         | Uso                                              | ¿Esencial? |
|------------------------|--------------------------------------------------|------------|
| Cookies de sesión      | Mantener el carrito o sesión activa              | Sí         |
| Preferencias           | Recordar idioma o configuración                  | Sí         |
| Analítica agregada     | Conteo de visitas (sin identificarte)            | No         |
| **Pixel de Meta**      | Medir efectividad de nuestros anuncios en Instagram/Facebook · envía eventos anónimos a Meta (página vista, ver producto, inicio de checkout, compra) sin compartir tu nombre, email ni teléfono | No |

**Sobre el Pixel de Meta:** lo usamos porque pautamos anuncios en Instagram y Facebook y necesitamos saber cuáles funcionan, sin lo cual la inversión publicitaria es ciega. El Pixel solo registra eventos de navegación, no tu identidad. No usamos otros píxeles de redes sociales, ni cookies de publicidad de terceros adicionales, ni trackers cross-site.

Si prefieres no ser rastreado por Meta en general, puedes ajustar tus preferencias publicitarias en `facebook.com/ads/preferences` o usar un bloqueador de anuncios; el sitio seguirá funcionando con normalidad.

Si en el futuro implementáramos analítica adicional, te lo informaríamos y te daríamos opción de optar por no participar.
```

### A.4 · En el pie del documento

Cambiar:

```
*Política creada 2026-05-18. Versión 1.0. …*
```

A:

```
*Política creada 2026-05-18 · Última actualización 2026-05-29. Versión 1.1. El cambio principal: declaración del uso del Pixel de Meta para medir efectividad publicitaria sin rastreo de identidad. …*
```

---

*Brief creado 2026-05-29 · Versión 1.0. Acompaña a V0.16 (watchdog), V0.17 (páginas legales) y V0.15 (MercadoPago). Si hay contradicción entre este brief y el código actual, prioriza el código y comenta la diferencia al final del PR.*
