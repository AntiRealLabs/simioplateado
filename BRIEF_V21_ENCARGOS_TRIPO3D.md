# Brief V0.21 · Sección "Imprimo tu idea" · Encargos personalizados con Tripo3D API

*Brief autocontenido para un agente de Claude Code / Codex. Construye una nueva sección de `simioplateado.com` con landing explicativo de intención, captura de email obligatoria, límite de 2 modelados/día por email, generación de modelo 3D vía Tripo3D API, opciones de personalización con precio estimado en tiempo real (incluye add-on mini llavero +$35k y descuentos acumulativos por cantidad), y flujo de cotización manual por parte de Juan. **Prioridad: ALTA — flujo de caja inmediato.** Versión 1.2 · 2026-06-12.*

---

## 0 · Contexto (léelo antes de tocar nada)

Simio Plateado vende piezas de catálogo curado. La inversión en producción + marketing aún no genera retorno. Mientras el catálogo construye marca a mediano plazo, Juan necesita **flujo de caja en el corto plazo** mediante un servicio paralelo: **impresión 3D a pedido**, donde el cliente trae su propia idea/imagen y Juan la convierte en pieza física.

Juan tiene **suscripción activa a Tripo3D** (su herramienta principal). Cada generación consume créditos pagos, así que el flujo debe **filtrar intención real** antes de gastar una sola generación.

**Decisiones estratégicas clave:**

1. **NO se cobra al enviar la solicitud.** La cotización es manual (Juan revisa cada caso) porque algunos pedidos pueden ser imposibles de imprimir, demasiado caros, o de contenido rechazable.
2. **Filtro de intención + email antes de Tripo3D.** El visitante curioso ve una landing explicativa con ejemplos. Solo después de hacer click en "INICIAR COTIZACIÓN" llega al formulario donde el **primer paso es ingresar su email**. Solo después puede subir imagen y gastar una generación de Tripo3D.
3. **Límite estricto de 2 modelados por email por día.** Esto controla el abuso de la API Tripo3D y vincula cada generación a una identidad real recuperable.
4. **Modelo en color genérico.** El preview 3D que muestra Tripo3D es en color neutral. El cliente NO ve el modelo en su color final personalizado. Se aclara explícitamente.
5. **Precio mostrado es ESTIMADO**, no definitivo. El precio final lo confirma Juan en email tras revisión manual.
6. **Add-on de mini llavero opcional** (+$35.000 COP) como cross-sell en el Paso de opciones.
7. **Descuentos acumulativos por cantidad**: pieza 1 al 100%, pieza 2 al 80%, pieza 3 al 70%, pieza 4 al 60%, pieza 5+ al 50%. Cap en 50% para evitar abuso; cantidades mayores a 6 piezas se cotizan aparte como mayoreo.

El flujo es: **landing explicativo → cliente da click intención → carga imagen → ve modelo 3D → selecciona opciones → ve precio estimado → completa datos → envía solicitud → Juan revisa y cotiza por email → cliente paga via MercadoPago → Juan produce**.

Lo que ya existe en el repo:

- `mockups/index.html` — SPA con router client-side.
- `workers/simio-sondeo/worker.js` — Worker con varios endpoints existentes.
- MailChannels configurado (`env.MAILCHANNELS_API_KEY`).
- `<model-viewer>` ya cargado (`unpkg.com/@google/model-viewer@4.2.0`).
- Tripo3D API: [https://platform.tripo3d.ai/docs](https://platform.tripo3d.ai/docs).

---

## 1 · Objetivo

Construir un flujo end-to-end donde:

1. El cliente entra a `/encargos` y ve una **landing explicativa** con:
   - Descripción breve del servicio.
   - Ejemplos visuales: imagen 2D → preview 3D → pieza impresa real.
   - Botón "INICIAR COTIZACIÓN".
2. Al hacer click en el botón, se registra un evento de intención en KV (para telemetría) y se navega a `/encargos/crear`.
3. En `/encargos/crear`, el cliente sube su imagen y Tripo3D genera el modelo 3D.
4. Cliente ve el modelo en `<model-viewer>` en color genérico, con disclaimer claro.
5. Cliente selecciona opciones de personalización (tamaño, color, cantidad, acabado, ciudad de envío). El **precio estimado se actualiza en tiempo real** según las opciones.
6. Cliente completa sus datos.
7. Cliente envía solicitud.
8. Juan recibe email instantáneo con detalles completos y botones de acción.
9. Cliente recibe email de confirmación de recepción.
10. Juan cotiza manualmente, envía link de pago MercadoPago.

---

## 2 · Decisiones de diseño (no negociables)

### 2.1 · Dos rutas separadas: `/encargos` (landing) y `/encargos/crear` (formulario)

**`/encargos`** — Landing explicativa pública. NO requiere intención previa, cualquiera puede verla. Contiene la información, los ejemplos, y el botón "INICIAR COTIZACIÓN".

**`/encargos/crear`** — El formulario real donde se gasta una generación de Tripo3D. Solo se accede después de hacer click en el botón de la landing (que registra el evento de intención antes de navegar).

Esta separación protege los créditos de Tripo3D y educa al cliente antes de generar expectativas.

### 2.2 · UI multi-step en `/encargos/crear` (NO formulario monolítico)

El proceso de creación se divide en **5 pasos** visualmente claros:

- **Paso 1:** Ingresá tu email (filtro de seriedad antes de gastar crédito Tripo3D).
- **Paso 2:** Subí tu imagen.
- **Paso 3:** Vista previa 3D + opciones de personalización + precio estimado en tiempo real.
- **Paso 4:** Tus datos completos + observaciones + aceptación de términos.
- **Paso 5:** Resumen y confirmación.

Progress indicator visible arriba en todo momento.

El **Paso 1 (email)** debe ser amable, no intimidante. Copy sugerido:

> *"Para empezar, contanos tu email. Es donde te llegará la cotización exacta. No spam, no listas, solo tu cotización."*

Después de ingresar email, mostrar mensaje:

> *"Tenés 2 modelados por día disponibles. Aprovechalos: elegí una imagen clara, con buen contraste, donde la pieza se vea completa."*

Si el email ya tiene 2 modelados usados ese día, se muestra:

> *"Este email ya usó sus 2 modelados de hoy. Podés enviar tu solicitud con uno de los modelos que ya generaste, o volver mañana a las 00:00 GMT-5 para más intentos."*

### 2.3 · Tripo3D API se llama desde el Worker, NUNCA desde el frontend

La API key de Tripo3D solo vive en env vars del Worker. Toda llamada a Tripo3D pasa por el Worker.

Flujo:
1. Frontend sube la imagen a `POST /api/encargos/upload` (Worker la guarda en R2).
2. Worker llama a Tripo3D API.
3. Worker hace polling al status.
4. Cuando la tarea está completa, devuelve URL del GLB al frontend.
5. Frontend muestra el GLB en `<model-viewer>`.

### 2.4 · No se procesa pago al enviar la solicitud

El cliente NO paga al hacer click en "ENVIAR SOLICITUD". El cobro viene después, vía link de MercadoPago que Juan envía manualmente por email.

### 2.5 · Imágenes y solicitudes se almacenan en Cloudflare R2 + KV

- **R2:** las imágenes subidas (jpg/png) van a un bucket R2 (`simio-encargos-images`).
- **KV (`ENCARGOS`):** metadatos de solicitudes + eventos de telemetría + contadores.

Si R2 no está habilitado en el plan, fallback: base64 en KV con límite 1 MB.

### 2.6 · Rate limiting estricto (en dos dimensiones: IP y email)

**Por IP:**
- **3 solicitudes completadas por IP por día.**
- **5 uploads de imagen por IP por hora.**
- **1 evento de "intención iniciada" por IP por hora.**

**Por email (más importante para controlar abuso de Tripo3D):**
- **2 modelados (uploads que disparan generación Tripo3D) por email por día.** Cap duro. Si gasta los 2, no puede generar más hasta el día siguiente (reset a las 00:00 GMT-5).
- El contador se mantiene en KV con clave `email_models:<email>:<YYYY-MM-DD>`, TTL 36 horas.

**Visualización para el cliente:**
- Antes del primer upload del día: *"Tenés 2 modelados disponibles hoy."*
- Después del primer upload: *"Te queda 1 modelado disponible hoy."*
- Después del segundo: *"Ya usaste tus 2 modelados de hoy. Volvé mañana a las 00:00 GMT-5 para más."*

Si el cliente intenta subir un tercer imagen el mismo día con el mismo email, el frontend BLOQUEA antes de hacer request al Worker. Mensaje claro + opción de "Enviar solicitud con un modelo ya generado" si tiene alguno.

### 2.7 · Términos específicos para encargos

Antes de enviar, el cliente acepta 3 checkboxes:

- *"Confirmo que tengo los derechos de uso de la imagen que estoy subiendo, o que la imagen es de uso libre."*
- *"Entiendo que el precio mostrado es ESTIMADO y será confirmado por email tras revisión manual. Simio Plateado puede rechazar mi solicitud sin obligación."*
- *"Acepto los [términos y condiciones](#)."*

Se actualiza `doctrina/legal-terminos.md` con sección sobre encargos personalizados.

### 2.8 · Email a Juan debe ser accionable

El email que llega a Juan al recibir una solicitud completa incluye:

- Datos del cliente.
- Imagen original (embebida).
- Link al preview 3D del modelo Tripo3D.
- Opciones seleccionadas + **precio estimado mostrado al cliente**.
- Observaciones.
- ID único (`ENC-2026-XXXX`).
- Botones "ACEPTAR Y COTIZAR" y "RECHAZAR" con tokens únicos.

### 2.9 · Telemetría de intención + resumen diario (NO email por cada click)

Cuando alguien hace click en "INICIAR COTIZACIÓN" en la landing, se registra evento en KV pero **NO se envía email a Juan**. Esto evita saturación.

En su lugar, un cron Worker envía a Juan un **email resumen diario a las 9 AM** con métricas:

- *"Últimas 24 horas: X personas iniciaron cotización, Y subieron imagen, Z completaron solicitud, conversión: X→Z = Z%."*

Esto le da telemetría útil a Juan para entender si el funnel funciona, sin spam.

### 2.10 · Matriz de precios estimados visible en tiempo real

Los precios se calculan en el frontend con una matriz configurada en env vars del Worker (para que Juan los ajuste sin redeploy de código). Los precios fueron calibrados según costos reales (material + tiempo de modelado + impresión + acabado + empaque) con margen sano del 40-50 %.

**Rango de tamaño:** **mínimo 10 cm, máximo 20 cm** (altura). Para piezas fuera de ese rango, el form muestra mensaje: *"Para piezas más pequeñas que 10 cm o más grandes que 20 cm, contactanos por email para cotización personalizada."*

**Tamaños base (escala no lineal con incremento marginal decreciente para motivar tamaños grandes):**

| Tamaño | Rango altura | Precio base COP | Incremento vs anterior |
|---|---|---|---|
| S | 10-12 cm | $120.000 | (base) |
| M | 12-15 cm | $160.000 | +$40.000 |
| L | 15-18 cm | $190.000 | +$30.000 |
| XL | 18-20 cm | $215.000 | +$25.000 |

**Lógica comercial:** el cliente percibe que subir de L a XL cuesta solo $25k más, lo cual es proporcionalmente menos que el incremento de S a M. Esto motiva elegir piezas más grandes, que también dan mejor margen al productor.

**Importante: TODAS las piezas vienen lijadas decentemente como parte del precio base.** No hay opción de "sin lijar" — es parte del servicio mínimo. Se comunica claramente en el copy para que el cliente no tenga expectativas raras: *"Tu pieza viene lijada con cuidado. No es necesario que pidas lijado aparte."*

**Colores y acabados:**

**Colores básicos (precio base, sin recargo):**

| Color | Recargo |
|---|---|
| Blanco | $0 |
| Negro | $0 |
| Translúcido natural | $0 |

**Acabados premium (+$20.000 fijos, no multiplicador):**

| Acabado | Recargo |
|---|---|
| Dorado | +$20.000 |
| Plateado | +$20.000 |
| Rosado | +$20.000 |
| Plateado mate | +$20.000 |

El recargo es FIJO de $20.000 independiente del tamaño de la pieza, porque el costo de filamento ya está incluido en el precio base de cada tamaño. Esto hace los premium muy accesibles (alguien con presupuesto justo se anima a ir al dorado por solo $20k extra, gran motivador).

**Add-on gratuito · Manchas de graffiti (checkbox combinable con cualquier color):**

> *"☐ Agregale manchas de graffiti (gratis) — Detalles pintados en negro o plateado que dan textura urbana a tu pieza. Elegí el color de las manchas:"*
>
> - ☐ Manchas graffiti negras
> - ☐ Manchas graffiti plateadas

Solo se permite seleccionar UNA de las dos opciones. Es completamente gratis, pensado como motivador estético para que el cliente vea valor agregado.

**Descuentos acumulativos por cantidad (POR PIEZA ORDINAL, no por unidad):**

Cada pieza adicional recibe un descuento mayor que la anterior. Aplica por pieza individual al precio base ya multiplicado por acabado y color.

| Pieza # | Precio relativo | Descuento acumulado |
|---|---|---|
| 1ra | 100% | 0% |
| 2da | 80% | 20% |
| 3ra | 70% | 30% |
| 4ta | 60% | 40% |
| 5ta y posteriores | 50% | 50% (cap) |

**Cap importante:** las piezas 6, 7, 8, etc. siguen al 50%. Si el cliente quiere más de 6 unidades, se le sugiere contactar para cotización de mayoreo.

**Add-ons opcionales (cross-sell)**

Dos checkbox independientes en el Paso 3 (opciones):

**Add-on 1 · Mini llavero**

> *"☐ Agregar versión mini llavero (+$35.000 COP) — Una versión de 5-7 cm de tu pieza, perfecta para llevar contigo."*

Si está marcado, se suma $35.000 COP fijo al total. Independiente de cantidad y descuentos.

**Add-on 2 · Estuche personalizado**

> *"☐ Empaque en estuche personalizado de colección — Caja de cartón resistente con foami a medida, ventana de acetato, etiqueta exterior con nombre de la pieza y número de edición. (Estilo Bearbrick / Kidrobot)."*

Precio del estuche según tamaño de la pieza principal:

| Tamaño pieza | Precio estuche |
|---|---|
| S (10-12 cm) | +$30.000 |
| M (12-15 cm) | +$40.000 |
| L (15-18 cm) | +$50.000 |
| XL (18-20 cm) | +$60.000 |

Si el cliente pide múltiples piezas Y marca el estuche, se cobra **1 estuche por cada pieza** (no por pedido). Esto se aclara explícitamente en el copy del checkbox.

**Sub-add-on gratuito si seleccionó estuche · Texto personalizado tallado**

Si el cliente marca el checkbox del estuche, aparece automáticamente un campo de texto adicional:

> *"✏ Texto personalizado en el estuche (gratis) — Lo tallamos en la tapa de la caja. Máximo 20 caracteres."*
>
> [Input de texto, maxlength=20, opcional]

Ejemplos de uso que el cliente puede llenar: nombre del destinatario ("MARÍA · 2026"), fecha especial ("DICIEMBRE 25"), apodo ("CACO"), frase corta ("ETERNO"), etc.

Este sub-add-on es **completamente gratis** y solo aparece si seleccionó el estuche. Sirve como motivador potente para inclinar al cliente a agregar el estuche (que sí tiene costo).

Si el cliente pide múltiples piezas con estuche, puede ingresar **un texto distinto por cada estuche** (campo dinámico que aparece tantas veces como piezas haya). Si deja todos los campos vacíos, los estuches van sin texto.

**Envío:**

- **Medellín / Bello / Envigado / Itagüí / Sabaneta / La Estrella / Caldas / Copacabana (Área Metropolitana):** GRATIS.
- **Resto de Colombia:** +$15.000 COP.
- **Internacional:** "cotizar aparte" — bloqueado en este flujo, Juan responde manualmente.

**Fórmula completa:**

```
precio_pieza_base = tamaño_base + (premium_addon si es_color_premium else 0)
// graffiti es gratis, no afecta cálculo

total_piezas = 0
for n in range(1, cantidad+1):
  if n == 1: multiplicador = 1.0
  elif n == 2: multiplicador = 0.80
  elif n == 3: multiplicador = 0.70
  elif n == 4: multiplicador = 0.60
  else: multiplicador = 0.50  // pieza 5 en adelante
  total_piezas += precio_pieza_base × multiplicador

precio_estuche_unitario = lookup_estuche(tamaño)
total_estuches = (precio_estuche_unitario × cantidad) si marcado_estuche else 0

total_llavero = 35000 si marcado_mini_llavero else 0

total_estimado = total_piezas + total_estuches + total_llavero + envío
```

**Ejemplos concretos:**

**Ejemplo 1 — 1 pieza M dorada, Medellín:**
- Base M: $160.000
- + Premium dorado: $20.000
- Pieza 1: $180.000 × 1.0 = $180.000
- + Envío Medellín: $0
- **Total: $180.000 COP**

**Ejemplo 2 — 1 pieza M dorada + estuche con texto + mini llavero, Medellín:**
- Base M: $160.000
- + Premium dorado: $20.000
- Pieza 1: $180.000
- + Estuche M (con texto gratis): $40.000
- + Mini llavero: $35.000
- + Envío Medellín: $0
- **Total: $255.000 COP**

**Ejemplo 3 — 3 piezas M doradas + 3 estuches con texto + mini llavero, Medellín:**
- Base por pieza: $180.000
- Pieza 1: $180.000 × 1.0 = $180.000
- Pieza 2: $180.000 × 0.80 = $144.000
- Pieza 3: $180.000 × 0.70 = $126.000
- Subtotal piezas: $450.000
- + 3 estuches M con texto gratis: $120.000
- + Mini llavero: $35.000
- + Envío Medellín: $0
- **Total: $605.000 COP**

**Ejemplo 4 — 5 piezas L plateadas + estuches + graffiti gratis, otra ciudad de Colombia:**
- Base por pieza: $190.000 + $20.000 (plateado premium) = $210.000
- Pieza 1: $210.000 × 1.0 = $210.000
- Pieza 2: $210.000 × 0.80 = $168.000
- Pieza 3: $210.000 × 0.70 = $147.000
- Pieza 4: $210.000 × 0.60 = $126.000
- Pieza 5: $210.000 × 0.50 = $105.000
- Subtotal piezas: $756.000
- + 5 estuches L: $250.000
- + Graffiti negras: $0 (gratis)
- + Envío Colombia: $15.000
- **Total: $1.021.000 COP**

**Ejemplo 5 — 1 pieza S blanca básica + graffiti negras, Medellín (mínimo posible):**
- Base S: $120.000
- + Color blanco básico: $0
- + Graffiti negras: $0
- + Envío Medellín: $0
- **Total: $120.000 COP**

**Display:** el precio se actualiza en tiempo real al cambiar cualquier opción. Mostrar **desglose por pieza + add-ons** para que el cliente entienda el descuento aplicado:

```
Pieza 1 (M dorada): $180.000
Pieza 2 (M dorada): $144.000 (20% off)
Pieza 3 (M dorada): $126.000 (30% off)
Estuches personalizados (3) con texto gratis: $120.000
Mini llavero: $35.000
Envío Medellín: GRATIS
─────────────
Total estimado: $605.000 COP
⚠ PRECIO ESTIMADO · sujeto a confirmación tras revisión manual
```

### 2.11 · Política de envío visible en el Paso 2

El cliente debe seleccionar su ciudad (lista corta de ciudades de Antioquia / "otra ciudad en Colombia" / "internacional"). Esto se usa para calcular el envío del precio estimado.

Si selecciona "internacional", se muestra mensaje: *"Para envíos internacionales, tras enviar tu solicitud te coticamos el envío DHL Express por email. No incluido en el estimado."*

### 2.12.0 · Sistema de cupones de descuento

Para motivar las primeras compras y construir viralidad, el flujo soporta cupones de descuento. **El descuento se aplica EXCLUSIVAMENTE sobre el subtotal de las piezas (modelos)**, NUNCA sobre estuches, mini llavero ni envío.

**Cupones iniciales del lanzamiento:**

| Código | Descuento | Aplica a | Por email | Total | Vigencia |
|---|---|---|---|---|---|
| `PRIMERA10` | 10 % sobre piezas | Cualquier tamaño | 1 uso | 100 usos | 30 días |
| `GRANDE15` | 15 % sobre piezas | Solo L o XL | 1 uso | 50 usos | 30 días |
| `VIRAL15` | 15 % sobre piezas | Cualquier tamaño | 1 uso | 30 usos (distribución manual) | 60 días |

**Reglas comunes:**

1. **Un solo cupón por solicitud.** No se pueden acumular.
2. **Un solo uso por email** (el sistema bloquea segundas aplicaciones del mismo email).
3. **No descuenta add-ons ni envío.** Solo el subtotal de las piezas.
4. **El descuento se aplica después de los descuentos por cantidad** (pieza 2 al 80%, pieza 3 al 70%, etc.) sobre el subtotal final de piezas.
5. **Si el cupón no es válido** (caducado, agotado, no aplica al tamaño, ya usado por ese email), el frontend muestra mensaje claro: *"Este cupón no es válido para tu solicitud. Verificá el código o el tamaño elegido."*

**Almacenamiento:** los cupones se guardan en KV con clave `coupon:<CODE>`, valor estructura JSON:

```json
{
  "code": "PRIMERA10",
  "type": "percent",
  "value": 10,
  "appliesTo": "model_only",
  "validForSizes": ["S", "M", "L", "XL"],
  "validFrom": "2026-06-12T00:00:00Z",
  "validUntil": "2026-07-12T23:59:59Z",
  "maxUses": 100,
  "maxUsesPerEmail": 1,
  "currentUses": 0,
  "description": "10% off en tu primera compra"
}
```

Los usos por email se guardan en `coupon_uses:<CODE>:<email>` para validación rápida.

**UI en el frontend:**

En el Paso 3 (opciones), agregar sección colapsable:

```html
<details class="cupon-seccion">
  <summary>¿Tenés un cupón de descuento?</summary>
  <div class="cupon-form">
    <input type="text" id="cupon-input" placeholder="Ej. PRIMERA10" maxlength="20">
    <button id="cupon-aplicar" type="button">APLICAR</button>
    <p id="cupon-feedback" class="cupon-feedback"></p>
  </div>
</details>
```

Al hacer click en APLICAR, llama a `POST /api/encargos/validar-cupon` con el código + el tamaño + el email. La respuesta indica si es válido y el monto del descuento. Si es válido, el precio estimado se recalcula mostrando línea de descuento en el desglose.

**Ejemplo de display con cupón aplicado:**

```
Pieza 1 (M dorada): $180.000
Pieza 2 (M dorada): $144.000 (20% off)
Pieza 3 (M dorada): $126.000 (30% off)
Subtotal piezas: $450.000
Descuento PRIMERA10 (10%): -$45.000
─────────────
Subtotal piezas con cupón: $405.000
Estuches personalizados (3): $120.000
Mini llavero: $35.000
Envío Medellín: GRATIS
─────────────
Total estimado: $560.000 COP
⚠ PRECIO ESTIMADO · sujeto a confirmación tras revisión manual
```

### 2.12 · Mensaje "ESTIMADO" en cada punto crítico

Para evitar disputas futuras, el carácter estimado se repite en:

- Paso 2: junto al precio, leyenda *"PRECIO ESTIMADO · final por confirmar"*.
- Paso 4 (resumen): banner *"Este es un precio estimado. Tras revisar tu solicitud, te enviaremos el precio definitivo + link de pago por email."*.
- Email de confirmación al cliente: párrafo *"El monto que viste es estimado. El precio definitivo te llega por email en menos de 24 horas, junto con el link de pago de MercadoPago."*.
- T&C: sección dedicada al carácter no vinculante del estimado.

### 2.13 · Mensaje sobre el color del preview 3D

En el Paso 2, junto al `<model-viewer>`, banner permanente:

> *"El preview 3D se muestra en color neutro. Tu pieza final será del color que elijas abajo (dorado, bronce, blanco, etc.). Tripo3D no soporta visualización de materiales custom."*

Esto previene la confusión de "yo pedí dorado pero el preview era gris".

---

## 3 · Implementación paso a paso

### Paso 1 · Variables de entorno y bindings en `wrangler.toml`

Agregar:

```toml
[vars]
TRIPO3D_API_URL = "https://api.tripo3d.ai/v2/openapi"

# Matriz de precios — Juan puede editar estos valores sin redeploy de código
# Calibrados según costos reales (material + tiempo + lijado + empaque básico) con margen 40-50%
# Rango de tamaño: mínimo 10 cm, máximo 20 cm
# Todas las piezas vienen lijadas como parte del precio base.

PRICE_BASE_S = "120000"   # 10-12 cm
PRICE_BASE_M = "160000"   # 12-15 cm
PRICE_BASE_L = "190000"   # 15-18 cm
PRICE_BASE_XL = "215000"  # 18-20 cm

# Acabado premium (recargo fijo, no multiplicador)
PRICE_PREMIUM_FINISH_ADDON = "20000"

# Colores básicos disponibles (sin recargo)
COLORS_BASIC = "blanco,negro,translucido"

# Colores/acabados premium (con recargo)
COLORS_PREMIUM = "dorado,plateado,rosado,plateado_mate"

# Opciones de graffiti gratis (combinable con cualquier color)
GRAFFITI_OPTIONS = "negras,plateadas"

# Descuentos por pieza ordinal (aplicado por cada pieza individualmente)
MULTIPLIER_PIECE_1 = "1.0"
MULTIPLIER_PIECE_2 = "0.80"
MULTIPLIER_PIECE_3 = "0.70"
MULTIPLIER_PIECE_4 = "0.60"
MULTIPLIER_PIECE_5_PLUS = "0.50"

# Add-on mini llavero (fijo independiente de cantidad)
PRICE_KEYCHAIN_ADDON = "35000"

# Add-on estuche personalizado (por unidad, varía por tamaño)
PRICE_CASE_S = "30000"
PRICE_CASE_M = "40000"
PRICE_CASE_L = "50000"
PRICE_CASE_XL = "60000"

# Texto personalizado en estuche (gratis, máximo caracteres)
CASE_TEXT_MAX_CHARS = "20"

# Límite estricto de modelados por email por día
MAX_MODELS_PER_EMAIL_PER_DAY = "2"

# Cupones iniciales del lanzamiento (se cargan al KV vía script de bootstrap)
# Ver sección 2.12.0 del brief para tabla completa
COUPONS_ENABLED = "true"

SHIPPING_MEDELLIN = "0"
SHIPPING_COLOMBIA = "15000"

CITIES_MEDELLIN_FREE = "medellin,bello,envigado,itagui,sabaneta,la estrella,caldas,copacabana"

ADMIN_EMAIL = "el@simioplateado.com"
EMAIL_FROM = "noreply@simioplateado.com"

[[kv_namespaces]]
binding = "ENCARGOS"
id = "<crear y reemplazar>"

[[r2_buckets]]
binding = "IMAGES"
bucket_name = "simio-encargos-images"

[triggers]
crons = ["0 9 * * *"]  # 9 AM diariamente para resumen
```

Secrets:

```bash
wrangler secret put TRIPO3D_API_KEY
```

### Paso 2 · Frontend · Ruta `/encargos` (landing)

```html
<main class="page-encargos-landing">
  <header>
    <h1>Imprimo tu idea</h1>
    <p class="subtitle">Subí una imagen de lo que querés crear. Generamos un modelo 3D, lo imprimimos, te lo enviamos.</p>
  </header>

  <section class="proceso">
    <h2>Cómo funciona</h2>
    <div class="pasos">
      <div class="paso">
        <img src="/assets/encargos-ejemplo-1.jpg" alt="Imagen 2D">
        <h3>1. Subís tu imagen</h3>
        <p>Una foto, screenshot o dibujo de lo que tenés en mente.</p>
      </div>
      <div class="paso">
        <img src="/assets/encargos-ejemplo-2.jpg" alt="Modelo 3D">
        <h3>2. Generamos el modelo 3D</h3>
        <p>Nuestra IA convierte tu imagen en un modelo tridimensional que podés rotar y revisar.</p>
      </div>
      <div class="paso">
        <img src="/assets/encargos-ejemplo-3.jpg" alt="Pieza impresa">
        <h3>3. Imprimimos la pieza</h3>
        <p>Tras tu aprobación y pago, producimos la pieza física y la enviamos a tu casa.</p>
      </div>
    </div>
  </section>

  <section class="que-puedes-pedir">
    <h2>¿Qué podés pedir?</h2>
    <p>Figuras decorativas, regalos personalizados, prototipos, miniaturas, esculturas, recreaciones de personajes, objetos artísticos. Cualquier cosa que se pueda imprimir en 3D — nosotros evaluamos y te cotizamos.</p>
  </section>

  <section class="cta">
    <p>Tiempo de respuesta: <strong>menos de 24 horas</strong>.</p>
    <p>Envío gratis en Medellín y área metropolitana. Resto de Colombia: +$15.000 COP.</p>

    <button id="iniciar-cotizacion" class="btn-primario-grande">
      INICIAR COTIZACIÓN →
    </button>
  </section>

  <section class="advertencia">
    <p><small>El precio mostrado en el siguiente paso es <strong>estimado</strong>. El precio definitivo se confirma vía email tras revisión manual. Simio Plateado se reserva el derecho de rechazar solicitudes.</small></p>
  </section>
</main>
```

JavaScript:

```js
document.getElementById('iniciar-cotizacion').addEventListener('click', async () => {
  // Registrar intención (no bloquea si falla)
  fetch('https://api.simioplateado.com/api/encargos/intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'landing_button' })
  }).catch(() => {});

  // Navegar al formulario
  window.location.href = '/encargos/crear';
});
```

### Paso 3 · Frontend · Ruta `/encargos/crear` (formulario multi-step)

Esta es la implementación de los 4 pasos detallada anteriormente (subir imagen → preview + opciones + precio estimado en tiempo real → datos cliente → confirmación).

**Diferencias clave respecto a versión anterior:**

- En el Paso 2, debajo del `<model-viewer>`, banner permanente:

```html
<div class="aviso-color">
  <p>⚠ El preview se muestra en color neutro. Tu pieza final será del color que elijas abajo.</p>
</div>
```

- En el Paso 2, panel lateral con precio estimado actualizándose en tiempo real:

```html
<aside class="precio-estimado">
  <h3>Precio estimado</h3>
  <p class="precio-grande" id="precio-display">$0 COP</p>
  <p class="precio-aclaracion">+ envío: <span id="envio-display">$0</span></p>
  <p class="precio-total"><strong>Total estimado: <span id="total-display">$0</span></strong></p>
  <p class="precio-disclaimer"><small>⚠ PRECIO ESTIMADO · sujeto a confirmación tras revisión manual</small></p>
</aside>
```

JavaScript de cálculo:

```js
async function calcularPrecio() {
  const tamaño = document.querySelector('[name="tamaño"]').value;
  const acabado = document.querySelector('[name="acabado"]').value;
  const color = document.querySelector('[name="color"]').value;
  const cantidad = parseInt(document.querySelector('[name="cantidad"]').value);
  const ciudad = document.querySelector('[name="ciudad"]').value;

  const res = await fetch('https://api.simioplateado.com/api/encargos/calcular-precio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tamaño, acabado, color, cantidad, ciudad })
  });

  const { unidad, envio, total } = await res.json();

  document.getElementById('precio-display').textContent = `$${unidad.toLocaleString('es-CO')} × ${cantidad}`;
  document.getElementById('envio-display').textContent = envio === 0 ? 'GRATIS' : `$${envio.toLocaleString('es-CO')}`;
  document.getElementById('total-display').textContent = `$${total.toLocaleString('es-CO')} COP`;
}

['tamaño', 'acabado', 'color', 'cantidad', 'ciudad'].forEach(name => {
  document.querySelector(`[name="${name}"]`).addEventListener('change', calcularPrecio);
});
```

### Paso 4 · Backend · endpoints en el Worker

Endpoints a implementar:

#### 4.1 · `POST /api/encargos/intent`

Registra evento de intención en KV con TTL de 7 días. Rate limit: 1 por IP por hora.

```js
if (url.pathname === '/api/encargos/intent' && request.method === 'POST') {
  const ip = request.headers.get('cf-connecting-ip');
  const todayKey = new Date().toISOString().slice(0, 10);
  const recentKey = `intent:recent:${ip}`;

  // Rate limit: 1 evento por IP por hora
  const recent = await env.ENCARGOS.get(recentKey);
  if (recent) {
    return jsonResponse({ ok: true, skipped: 'recently_logged' });
  }
  await env.ENCARGOS.put(recentKey, '1', { expirationTtl: 3600 });

  // Incrementar contador del día
  const dayKey = `metrics:intent:${todayKey}`;
  const count = parseInt(await env.ENCARGOS.get(dayKey) || '0');
  await env.ENCARGOS.put(dayKey, String(count + 1), { expirationTtl: 86400 * 30 });

  return jsonResponse({ ok: true });
}
```

#### 4.2 · `POST /api/encargos/upload`

Recibe imagen, guarda en R2, llama a Tripo3D, devuelve taskId. Incrementa contador de uploads del día.

```js
// (... lógica similar a versión anterior, más ...)

// Incrementar métrica
const todayKey = new Date().toISOString().slice(0, 10);
const uploadKey = `metrics:upload:${todayKey}`;
const uploadCount = parseInt(await env.ENCARGOS.get(uploadKey) || '0');
await env.ENCARGOS.put(uploadKey, String(uploadCount + 1), { expirationTtl: 86400 * 30 });
```

#### 4.3 · `GET /api/encargos/task/{taskId}`

(Sin cambios respecto a versión anterior.)

#### 4.3.5 · `POST /api/encargos/validar-cupon`

Valida si un cupón es aplicable a una solicitud y devuelve el descuento calculado.

```js
if (url.pathname === '/api/encargos/validar-cupon' && request.method === 'POST') {
  const { code, email, tamaño, subtotalPiezas } = await request.json();

  if (!code || !email || !tamaño || !subtotalPiezas) {
    return jsonResponse({ ok: false, error: 'missing_fields' }, 400);
  }

  const couponCode = code.toUpperCase().trim();
  const couponData = await env.ENCARGOS.get(`coupon:${couponCode}`, 'json');

  if (!couponData) {
    return jsonResponse({ ok: false, error: 'coupon_not_found', message: 'Este cupón no existe.' });
  }

  // Validar vigencia
  const now = new Date().toISOString();
  if (now < couponData.validFrom || now > couponData.validUntil) {
    return jsonResponse({ ok: false, error: 'coupon_expired', message: 'Este cupón está caducado o no está vigente.' });
  }

  // Validar usos totales
  if (couponData.currentUses >= couponData.maxUses) {
    return jsonResponse({ ok: false, error: 'coupon_exhausted', message: 'Este cupón ya alcanzó su límite de usos.' });
  }

  // Validar tamaño
  if (!couponData.validForSizes.includes(tamaño.toUpperCase())) {
    return jsonResponse({
      ok: false,
      error: 'coupon_wrong_size',
      message: `Este cupón solo aplica para tamaños: ${couponData.validForSizes.join(', ')}. Elegí uno de esos tamaños o probá otro cupón.`
    });
  }

  // Validar usos por email
  const userUsageKey = `coupon_uses:${couponCode}:${email.toLowerCase()}`;
  const userUses = parseInt(await env.ENCARGOS.get(userUsageKey) || '0');
  if (userUses >= couponData.maxUsesPerEmail) {
    return jsonResponse({ ok: false, error: 'coupon_already_used', message: 'Ya usaste este cupón antes con este email.' });
  }

  // Calcular descuento
  let descuento = 0;
  if (couponData.type === 'percent') {
    descuento = Math.round(subtotalPiezas * (couponData.value / 100));
  } else if (couponData.type === 'fixed') {
    descuento = couponData.value;
  }

  return jsonResponse({
    ok: true,
    code: couponCode,
    descuento,
    description: couponData.description,
    type: couponData.type,
    value: couponData.value
  });
}
```

**Nota:** este endpoint **NO incrementa el contador de usos**. Solo valida. El contador se incrementa cuando la solicitud se envía exitosamente en `/api/encargos/submit`, después de verificar el cupón otra vez (revalidación server-side por seguridad).

#### 4.4 · `POST /api/encargos/calcular-precio`

Calcula precio según matriz de env vars. Lógica simplificada: precio base + ($20k si premium) + descuentos por pieza ordinal + add-ons.

```js
if (url.pathname === '/api/encargos/calcular-precio' && request.method === 'POST') {
  const { tamaño, color, cantidad, ciudad, miniLlavero, estuche, graffiti } = await request.json();
  // graffiti es un boolean o el color de las manchas — no afecta cálculo, solo se registra

  // Lookup base por tamaño
  const base = parseInt(env[`PRICE_BASE_${tamaño.toUpperCase()}`]);

  // Recargo por color premium
  const coloresPremium = env.COLORS_PREMIUM.split(',').map(c => c.trim());
  const esPremium = coloresPremium.includes(color);
  const premiumAddon = esPremium ? parseInt(env.PRICE_PREMIUM_FINISH_ADDON) : 0;

  const precioPiezaBase = base + premiumAddon;

  // Aplicar descuento por pieza ordinal
  const desglose = [];
  let totalPiezas = 0;
  for (let n = 1; n <= cantidad; n++) {
    let mult;
    if (n === 1) mult = parseFloat(env.MULTIPLIER_PIECE_1);
    else if (n === 2) mult = parseFloat(env.MULTIPLIER_PIECE_2);
    else if (n === 3) mult = parseFloat(env.MULTIPLIER_PIECE_3);
    else if (n === 4) mult = parseFloat(env.MULTIPLIER_PIECE_4);
    else mult = parseFloat(env.MULTIPLIER_PIECE_5_PLUS);

    const precioPieza = Math.round(precioPiezaBase * mult);
    const descuentoPct = Math.round((1 - mult) * 100);
    desglose.push({ pieza: n, precio: precioPieza, descuento: descuentoPct });
    totalPiezas += precioPieza;
  }

  // Add-on mini llavero (fijo)
  const llaveroAddon = miniLlavero ? parseInt(env.PRICE_KEYCHAIN_ADDON) : 0;

  // Add-on estuche personalizado (por unidad, según tamaño)
  let estucheUnitario = 0;
  if (estuche) {
    estucheUnitario = parseInt(env[`PRICE_CASE_${tamaño.toUpperCase()}`]);
  }
  const estuchesTotal = estucheUnitario * cantidad;

  // Envío
  const freeCities = env.CITIES_MEDELLIN_FREE.split(',').map(c => c.trim().toLowerCase());
  let envio;
  if (freeCities.includes((ciudad || '').toLowerCase())) envio = 0;
  else if ((ciudad || '').toLowerCase() === 'internacional') envio = null; // cotizar aparte
  else envio = parseInt(env.SHIPPING_COLOMBIA);

  // Aplicar cupón si se pasó uno y es válido
  let descuentoCupon = 0;
  let cuponAplicado = null;
  if (body.cuponCode) {
    const couponData = await env.ENCARGOS.get(`coupon:${body.cuponCode.toUpperCase()}`, 'json');
    if (couponData) {
      const now = new Date().toISOString();
      const userUsageKey = `coupon_uses:${body.cuponCode.toUpperCase()}:${(body.email || '').toLowerCase()}`;
      const userUses = parseInt(await env.ENCARGOS.get(userUsageKey) || '0');
      const isValid = (
        now >= couponData.validFrom &&
        now <= couponData.validUntil &&
        couponData.currentUses < couponData.maxUses &&
        couponData.validForSizes.includes(tamaño.toUpperCase()) &&
        userUses < couponData.maxUsesPerEmail
      );
      if (isValid && couponData.type === 'percent') {
        descuentoCupon = Math.round(totalPiezas * (couponData.value / 100));
        cuponAplicado = { code: body.cuponCode.toUpperCase(), percent: couponData.value, descuento: descuentoCupon };
      }
    }
  }

  const totalPiezasConDescuento = totalPiezas - descuentoCupon;

  const total = (envio === null)
    ? totalPiezasConDescuento + llaveroAddon + estuchesTotal
    : totalPiezasConDescuento + llaveroAddon + estuchesTotal + envio;

  return jsonResponse({
    desglose,
    totalPiezas,
    descuentoCupon,
    cuponAplicado,
    totalPiezasConDescuento,
    premiumAddon: esPremium ? premiumAddon : 0,
    esPremium,
    llaveroAddon,
    estucheUnitario,
    estuchesTotal,
    envio,
    total,
    cotizarInternacional: envio === null
  });
}
```

**Respuesta de ejemplo (3 piezas M doradas + 3 estuches con texto + mini llavero, Medellín):**

```json
{
  "desglose": [
    { "pieza": 1, "precio": 180000, "descuento": 0 },
    { "pieza": 2, "precio": 144000, "descuento": 20 },
    { "pieza": 3, "precio": 126000, "descuento": 30 }
  ],
  "totalPiezas": 450000,
  "premiumAddon": 20000,
  "esPremium": true,
  "llaveroAddon": 35000,
  "estucheUnitario": 40000,
  "estuchesTotal": 120000,
  "envio": 0,
  "total": 605000,
  "cotizarInternacional": false
}
```

El frontend usa el `desglose` para mostrar el detalle por pieza con descuentos visibles, más las líneas de add-ons.

**Importante:** los textos personalizados de los estuches (si los hay) NO afectan el cálculo de precio. Solo se guardan en el payload de la solicitud para que Juan los vea al cotizar y para impresión final.

#### 4.5 · `POST /api/encargos/submit`

(Implementación similar a versión anterior, agregando precio estimado al payload guardado y al email.)

Incluir en email a Juan el **precio estimado que el cliente vio**, para que sepa qué ancla psicológica tiene:

```html
<h3>Precio estimado mostrado al cliente</h3>
<p><strong>$${total_estimado} COP</strong> (este es el monto que el cliente vio. Tu cotización final puede ser mayor o menor.)</p>
```

#### 4.6 · `GET /api/encargos/<id>/accept` y `/reject`

(Sin cambios respecto a versión anterior.)

### Paso 5 · Cron handler · Resumen diario a Juan

```js
export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(sendDailyMetricsEmail(env));
  },
  // ... fetch handler
};

async function sendDailyMetricsEmail(env) {
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const intentCount = parseInt(await env.ENCARGOS.get(`metrics:intent:${yesterday}`) || '0');
  const uploadCount = parseInt(await env.ENCARGOS.get(`metrics:upload:${yesterday}`) || '0');
  const submitCount = parseInt(await env.ENCARGOS.get(`metrics:submit:${yesterday}`) || '0');

  const conversionRate = intentCount > 0 ? Math.round((submitCount / intentCount) * 100) : 0;

  const html = `
    <h2>Resumen Encargos · ${yesterday}</h2>
    <p>Métricas del funnel de encargos en las últimas 24 horas:</p>
    <ul>
      <li><strong>Iniciaron cotización (click en botón):</strong> ${intentCount}</li>
      <li><strong>Subieron imagen (gastaron crédito Tripo3D):</strong> ${uploadCount}</li>
      <li><strong>Completaron solicitud:</strong> ${submitCount}</li>
      <li><strong>Conversión inicio→completado:</strong> ${conversionRate}%</li>
    </ul>
    <p>Si la conversión está baja (&lt;10%), revisar friction en el formulario o claridad del proceso.</p>
  `;

  await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': env.MAILCHANNELS_API_KEY },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: env.ADMIN_EMAIL }] }],
      from: { email: env.EMAIL_FROM, name: 'Métricas Simio Plateado' },
      subject: `Resumen Encargos · ${yesterday}`,
      content: [{ type: 'text/html', value: html }]
    })
  });
}
```

### Paso 6 · Botón visible en la home

En `mockups/index.html` (home `/`), agregar un botón discreto pero visible que lleve a `/encargos`. Sugerencia: esquina superior derecha del header o un CTA secundario debajo del dibujo del simio.

```html
<a href="/encargos" class="btn-encargos-cta">
  <span>+</span> Imprimo tu idea
</a>
```

### Paso 7 · Actualizar términos y condiciones

En `doctrina/legal-terminos.md`, agregar sección sobre encargos (sin cambios respecto a brief anterior, ya estaba).

Agregar adicionalmente subsección sobre carácter estimado:

```markdown
### Carácter estimado del precio

El precio mostrado durante el proceso de cotización es ESTIMADO y se calcula automáticamente según una matriz de precios pública. El precio definitivo se confirma manualmente por Simio Plateado vía email, tras revisión del modelo 3D generado y de la imagen original. Simio Plateado se reserva el derecho de ajustar el precio si la complejidad de la pieza, el tiempo de impresión real o el material requerido difieren del cálculo automático. El cliente NO tiene obligación de pago hasta recibir el precio definitivo y el link de pago.
```

### Paso 8 · Crear assets de ejemplo para la landing

Tres imágenes que muestren el proceso. Si Juan no las tiene aún:

- `encargos-ejemplo-1.jpg`: Una foto/dibujo simple (puede ser una de las imágenes ya generadas para Manus o Especímenes).
- `encargos-ejemplo-2.jpg`: Screenshot del modelo 3D generado por Tripo3D.
- `encargos-ejemplo-3.jpg`: Foto real de una pieza impresa (Juan tiene ejemplos: Cor Cogitans, copa FLA, etc.).

Las imágenes van en `public/assets/`.

---

## 4 · Criterios de aceptación

Antes de hacer merge:

- [ ] Ruta `/encargos` renderiza la landing con ejemplos visuales y botón "INICIAR COTIZACIÓN".
- [ ] Click en el botón registra evento en KV y navega a `/encargos/crear`.
- [ ] Rate limit del evento intent: 1 por IP por hora.
- [ ] Ruta `/encargos/crear` renderiza el form multi-step de **5 pasos** (email → imagen → preview+opciones → datos → confirmación).
- [ ] **Paso 1 captura email obligatoriamente** antes de permitir upload de imagen.
- [ ] **Límite de 2 modelados por email por día** funcional: el frontend muestra el contador y bloquea el tercer upload con mensaje claro.
- [ ] Subir imagen activa Tripo3D y muestra preview 3D.
- [ ] Banner permanente sobre color neutro del preview.
- [ ] **Precio estimado se actualiza en tiempo real con descuentos acumulativos por pieza ordinal.** El desglose por pieza es visible.
- [ ] **Add-on mini llavero (+$35.000) funcional** como checkbox opcional.
- [ ] **Add-on estuche personalizado funcional** como checkbox opcional, con precio que varía por tamaño de la pieza (S $30k, M $40k, L $50k, XL $60k) y se cobra por unidad cuando hay múltiples piezas.
- [ ] **Sub-add-on texto personalizado en estuche** aparece solo si se marcó el estuche, máximo 20 caracteres, gratis. Si hay múltiples piezas con estuche, un campo de texto por estuche.
- [ ] **Colores básicos disponibles (blanco/negro/translúcido)** sin recargo y **acabados premium (dorado/plateado/rosado/plateado mate)** con recargo fijo de +$20k.
- [ ] **Add-on graffiti gratis** disponible como sub-checkbox combinable con cualquier color, con opción de elegir entre manchas negras o plateadas.
- [ ] **Lijado básico incluido en precio base** — no aparece como opción separada. Mensaje en el frontend: "Tu pieza viene lijada con cuidado".
- [ ] **Sistema de cupones funcional**: campo en Paso 3 (colapsable), endpoint de validación, descuento aplicado SOLO al subtotal de piezas (NO a add-ons NO a envío).
- [ ] **3 cupones iniciales cargados al KV**: `PRIMERA10` (10% cualquier tamaño, 100 usos), `GRANDE15` (15% solo L/XL, 50 usos), `VIRAL15` (15% cualquier tamaño, 30 usos).
- [ ] **Reglas de cupón validadas server-side**: vigencia, usos totales, tamaño elegible, usos por email.
- [ ] **Contador de cupón se incrementa SOLO al enviar la solicitud exitosamente** (no al validar).
- [ ] **Tamaños fuera del rango 10-20 cm** muestran mensaje de "cotización personalizada por email" sin permitir avanzar en el flujo automatizado.
- [ ] Disclaimer "ESTIMADO" visible en Paso 3 y 5 + email.
- [ ] Política de envío: Medellín área metropolitana gratis, Colombia +$15k, internacional bloqueado con mensaje.
- [ ] Email instantáneo a Juan al enviar solicitud completa, con desglose de precio estimado mostrado al cliente Y si pidió mini llavero.
- [ ] Email de confirmación al cliente.
- [ ] Cron diario a las 9 AM envía resumen de métricas (intent / upload / submit / conversión + uso de modelados por email).
- [ ] T&C actualizados con sección de encargos + carácter estimado + descuentos acumulativos + límite de modelados.
- [ ] Botón visible en la home llevando a `/encargos`.
- [ ] Endpoints accept/reject validan token.

---

## 5 · Verificación post-deploy (responsabilidad del agente)

Reportar a Juan con capturas:

1. Captura de la landing `/encargos`.
2. Captura del flujo completo de 4 pasos en `/encargos/crear`.
3. Captura del preview 3D funcionando.
4. Captura del precio estimado actualizándose con diferentes combinaciones.
5. Captura del email instantáneo que recibe Juan.
6. Captura del email de confirmación del cliente.
7. Output del primer cron diario (a las 9 AM siguiente al deploy).
8. Output de `curl` simulando el flujo end-to-end.

---

## 6 · Lo que NO hace este brief

- **No automatiza cotización final.** Juan decide manualmente el precio definitivo. Posible V0.22.
- **No procesa pago al envío de solicitud.** Siempre POSTERIOR.
- **No visualiza el modelo 3D en el color personalizado del cliente.** Tripo3D no lo soporta. El cliente ve color neutro y elige el color final por separado.
- **No agrega dashboard de admin.** El email + KV son suficientes por ahora. Dashboard puede venir en V0.23 si el volumen lo justifica.
- **No habilita pedidos internacionales automáticamente.** El cliente puede marcar "internacional" pero el flujo se pausa hasta cotización manual de Juan.
- **No traduce al inglés.** Brief V0.11 separado.

---

## 7 · Notas finales para el agente

- **Email correcto:** `el@simioplateado.com`. NO uses `juan@simioplateado.com`.
- **No autoejecutes deploy a main.** PR listo, esperá aprobación de Juan.
- **TRIPO3D_API_KEY es secreto absoluto.** Solo env vars del Worker.
- **Las matrices de precios deben ser editables sin redeploy.** Por eso van en env vars, no hardcoded.
- **La lista de ciudades de Medellín gratis (CITIES_MEDELLIN_FREE) debe ser editable.** Si Juan después amplía o reduce el área de cobertura gratuita, solo cambia esa env var.
- **El cron de resumen diario se desactiva temporalmente si se nota spam o el volumen es muy bajo.** Juan decide.
- **Si Tripo3D rechaza una imagen** (poca resolución, demasiado abstracta), el frontend debe mostrar mensaje útil y NO descontar crédito al rate limit del usuario (es injusto si el sistema falló).
- **Imágenes de ejemplo para la landing** las provee Juan o el agente las puede tomar de los renders ya generados (Cor Cogitans, Fatum et Dolor, copa FLA, etc.).
- **Si una preview de Tripo3D tarda más de 90 segundos**, mostrar mensaje *"Esto está tomando más tiempo del usual. Te enviamos email cuando esté listo y podrás continuar desde el link."* — y guardar el estado para que el cliente pueda retomar.

---

*Brief V0.21 versión 1.5 creado 2026-06-12. Cambios respecto a v1.4: agregado sistema de cupones de descuento (PRIMERA10 generico 10%, GRANDE15 solo L/XL 15%, VIRAL15 distribuido manualmente 15%), descuento aplicado SOLO al subtotal de piezas (NO add-ons ni envío), endpoint /api/encargos/validar-cupon, integración en calculadora de precio, una pieza ordinal por email por cupón. Cambios respecto a v1.3: precios base redondeados a números amigables, estuches más accesibles, eliminado lijado como opción separada, estructura simplificada de colores básicos vs acabados premium +$20k, add-on graffiti gratis, sub-add-on texto en estuche. Cambios respecto a v1.2: precios base recalibrados según costos reales, rango de tamaños 10-20 cm con escala no lineal motivadora. Cambios respecto a v1.1: email obligatorio en Paso 1, límite de 2 modelados por email/día, mini llavero +$35k, descuentos acumulativos por pieza ordinal, flujo de 5 pasos. Acompaña a Brief V0.20 (checkout internacional). Depende de V0.19, V0.19.1, V0.19.2 en producción. Implementación estimada: 5 días de codex/Claude Code.*
