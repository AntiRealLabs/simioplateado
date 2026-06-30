# Brief Codex · V0.12 · Vista Tienda + integración ESPEJO PLATEADO

*Brief de UI y flujos para la vista Tienda de simioplateado.com, incluyendo la sección de pedidos personalizables ESPEJO PLATEADO. Complemento del Brief V0.13 (integración de pagos) y de la doctrina `doctrina/espejo-plateado.md`.*

---

## 1 · Contexto y propósito

El sitio actual de simioplateado.com tiene **vista Galería** — una grilla curatorial de piezas con descripción y proceso de creación. Esa vista preserva el carácter editorial del catálogo pero NO permite comprar nada: el visitante ve, pero no transacciona.

Este brief agrega una **vista Tienda** paralela. La diferencia conceptual:

| Galería                              | Tienda                                  |
|--------------------------------------|-----------------------------------------|
| Curatorial · proceso · fases vacías  | Transaccional · stock · precio · compra |
| Muestra TODAS las piezas             | Muestra solo piezas comprables          |
| Sin botón de compra                  | Con botón "Comprar" o "AGOTADO"         |
| Tono editorial                       | Tono claro, accionable                  |

Las dos vistas coexisten. El visitante elige según intención.

La vista Tienda **además incluye** la sección **ESPEJO PLATEADO** — la línea de piezas personalizables donde el cliente envía su foto y elige un estilo del catálogo curado. Esa sección tiene su propio flujo de pedido con wizard y consentimiento.

---

## 2 · Decisiones pendientes · confirmar antes de implementar

Tres decisiones operativas que afectan la arquitectura. Cada una con recomendación, pero Juan decide:

### 2.1 · Ubicación del switch Galería ↔ Tienda

- **Opción A (recomendada)**: franja superior horizontal tipo tab, debajo del nav principal. Muy visible, se siente como dos "modos" del mismo catálogo.
- **Opción B**: dos enlaces dentro del nav superior, tratados como ítems de navegación cualquiera.

**Recomendación**: A. La diferencia conceptual entre las dos vistas es suficientemente importante para que merezca un switch visible, no un link más en el menú.

### 2.2 · Estructura de URLs

- **Opción A (recomendada)**: rutas separadas — `/galeria` y `/tienda` — cada una con su propio routing y meta tags.
- **Opción B**: una sola ruta `/` con parámetro de query `?vista=tienda`.

**Recomendación**: A. URLs separadas son mejor para SEO, social sharing y Open Graph (cada vista puede tener su propia preview en redes). Compatible con el `BRIEF_CODEX_NAVEGACION` ya existente.

### 2.3 · Detalle de pieza · modal o página

Cuando el visitante hace click en una pieza dentro de la vista Tienda, ¿se abre un modal flotante o navega a una página dedicada?

- **Opción A (recomendada)**: página dedicada `/tienda/[slug-pieza]`. Permite OG tags individuales, link compartible, scroll natural, mejor UX en mobile.
- **Opción B**: modal flotante encima del grid de Tienda.

**Recomendación**: A. Es más amable con el contenido (vista Tienda es donde la pieza protagoniza, no donde compite con la grilla).

---

## 3 · Arquitectura de URLs

Extensión del `BRIEF_CODEX_NAVEGACION.md` ya existente:

```
/                       → home / landing
/galeria                → vista Galería (catálogo curatorial sin compra)
/galeria/[slug]         → detalle de pieza en modo galería (con fases editoriales)
/tienda                 → vista Tienda (catálogo transaccional con stock + precio)
/tienda/[slug]          → detalle de pieza en modo tienda (con botón comprar)
/tienda/espejo          → landing de ESPEJO PLATEADO
/tienda/espejo/pedido   → wizard de pedido personalizable
/orden-confirmada       → post-checkout (de V0.13)
/legal/terminos         → T&C
/legal/privacidad       → política de privacidad
/legal/uso-imagen       → consentimiento de uso de imagen (para ESPEJO)
```

El switch superior Galería ↔ Tienda mantiene el slug de pieza si está en una vista detalle: si estás en `/galeria/superhombresito.v01` y haces click en "Tienda", navegas a `/tienda/superhombresito.v01` (la misma pieza, otra perspectiva).

---

## 4 · Vista Tienda · estructura visual

### 4.1 · Header

```
┌──────────────────────────────────────────────────────────┐
│  [logo handwritten Simio Plateado]              [≡ menú] │
│                                                          │
│   ┌────────────┬────────────┐                            │
│   │  GALERÍA   │   TIENDA   │  ← switch sticky          │
│   └────────────┴────────────┘                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

El switch es **sticky** (se queda arriba al hacer scroll). Activo en negrita / subrayado handwritten.

### 4.2 · Grid de piezas (orden sugerido)

La vista Tienda muestra las piezas en este orden (de arriba abajo):

1. **Piezas con stock** (de Drop 001 + Wearables) — las que se pueden comprar ya
2. **Sección ESPEJO PLATEADO** — banner destacado con CTA "Crea tu pieza"
3. **Piezas agotadas** (sello AGOTADO sobre la imagen) — todavía visibles para que la gente vea lo que era
4. **Piezas IMPOSIBLE** (audífonos, exhibición pura) — sello IMPOSIBLE, no compra

Cada celda del grid muestra:

```
┌─────────────────────────────┐
│                             │
│       [imagen de pieza]     │
│                             │
│                             │
├─────────────────────────────┤
│ [nombre handwritten]        │
│ USD 168 · Pieza única       │
│                             │
│ VISTO IMAGINADO DISEÑADO HE │  ← fases mini (3 o 4)
│        ⬜      ⬜      ⬜      │
└─────────────────────────────┘
```

Texto de stock varía según el tipo de pieza:
- Escultórica única: `USD 168 · Pieza única`
- Wearable disponible: `USD 34 · Disponible`
- Agotada: `USD 168 · Agotada` (con sello visual AGOTADO sobre imagen)
- IMPOSIBLE: `IMPOSIBLE` (sin precio)

Las mini-fases en cada celda son indicadores visuales: si tiene 4 columnas → ESPEJO, si tiene 3 → catálogo curado. Casillas vacías llevan sello IRREAL pequeño.

---

## 5 · Vista detalle de pieza · `/tienda/[slug]`

### 5.1 · Layout

```
┌──────────────────────────────────────────────────────────┐
│  ← Volver a Tienda                                       │
│                                                          │
│  [imagen grande de la pieza]                             │
│                                                          │
│  [nombre handwritten]                                    │
│  Pieza: SUPERHOMBRESITO · v01                            │
│  USD 168 · 3 disponibles                                 │
│                                                          │
│  ──── Proceso ────                                       │
│                                                          │
│  ┌──────────┬──────────┬──────────┐                      │
│  │IMAGINADO │ DISEÑADO │   HECHO  │   ← 3 fases (curado) │
│  │   ✓      │    ✓     │    ✓     │                      │
│  └──────────┴──────────┴──────────┘                      │
│                                                          │
│  ──── Descripción ────                                   │
│  [texto curatorial breve · 60-100 palabras]              │
│                                                          │
│  ──── Compra ────                                        │
│  [Botón PayPal Smart Button — ver V0.13 §4]              │
│                                                          │
│  Envío internacional incluido · 2-3 semanas              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 5.2 · Diferencia con vista Galería

En `/galeria/[slug]` la misma pieza aparece SIN sección "Compra", SIN precio, SIN stock. La galería es contemplativa; la tienda es accionable. Mismo contenido visual, distinto framing.

### 5.3 · Estados de stock · framing por tipo de pieza

Las piezas escultóricas son **únicas** (1 de 1). Los wearables son **producción reproducible** pero no exponemos contador al usuario. La UI refleja esta diferencia:

| Tipo       | Stock > 0                                      | Stock === 0 / SOLD                       |
|------------|------------------------------------------------|------------------------------------------|
| `unica`    | "Pieza única · disponible" + botón PayPal      | sello AGOTADO + CTA "¿Algo parecido?"    |
| `wearable` | "Disponible" (sin contador) + botón PayPal     | sello AGOTADO + CTA "¿Algo parecido?"    |
| `imposible`| sello IMPOSIBLE, sin precio ni botón. *"Pieza de exhibición. No está a la venta."* | mismo |

El CTA secundario en piezas agotadas es un `mailto:el@simioplateado.com` con asunto pre-llenado: *"Me gustaría una pieza similar a [nombre]"*.

**Importante para el framing visual de piezas únicas**: en lugar de "1 disponible" (que se siente escaso/transaccional), se usa "Pieza única · disponible" (que comunica el carácter curatorial). Después de venderse, no vuelve aparecer disponible a menos que Juan reimprima en un drop posterior y la registre como nueva pieza con sufijo de versión (`superhombresito.v02`).

### 5.4 · Pieza ESPEJO PLATEADO en detalle

Si el slug corresponde a una pieza ESPEJO ya hecha (ej. la pareja de Juan y Yuli, primera pieza ESPEJO), se muestra con **4 fases** (`VISTO · IMAGINADO · DISEÑADO · HECHO`) en lugar de 3. La fase VISTO muestra la foto original que envió el cliente (con consentimiento), no la generación AI. Esto hace visible la naturaleza de la línea.

---

## 6 · Las fases · regla de 3 vs 4

Implementación de la regla canónica de `doctrina/espejo-plateado.md`:

```js
// helper que decide cuántas fases mostrar
function getFases(pieza) {
  if (pieza.linea === 'espejo') {
    return ['VISTO', 'IMAGINADO', 'DISEÑADO', 'HECHO'];
  }
  return ['IMAGINADO', 'DISEÑADO', 'HECHO'];
}
```

### 6.1 · Cómo se renderiza cada fase

Cada fase es una celda con:

- **Etiqueta**: el nombre de la fase, en tipografía base
- **Contenido**: imagen o sello, según corresponda

| Estado de la fase                         | Render                                |
|-------------------------------------------|---------------------------------------|
| Completada (tiene imagen registrada)      | imagen real de esa fase               |
| Vacía (todavía no existe)                 | sello **IRREAL** delgado sobre cuadro vacío |
| Solo aplica a ESPEJO (fase VISTO en curado) | no se renderiza, no se muestra |

### 6.2 · Manifest de fases por pieza

Cada pieza en el manifest del repo declara:

```yaml
slug: superhombresito.v01
linea: curado         # o "espejo"
fases:
  imaginado: assets/processed/textos/superhombresito-imaginado.png
  diseñado: assets/processed/superhombresito-disegnado.png
  hecho: assets/processed/superhombresito-hecho.png
```

Para una pieza ESPEJO en curso:

```yaml
slug: cliente-001.centauro
linea: espejo
fases:
  visto: uploads/cliente-001/foto-original.jpg
  imaginado: uploads/cliente-001/ai-centauro.png
  diseñado: null      # todavía no
  hecho: null         # todavía no
```

Las fases con `null` se renderizan con sello IRREAL automáticamente.

---

## 7 · Integración con PayPal Smart Buttons

Detalle técnico vive en **`BRIEF_CODEX_V13_PAGOS_PAYPAL.md` §4**. Este brief solo define dónde van los botones:

- En `/tienda/[slug]` cuando `stock > 0` y la pieza no es IMPOSIBLE.
- En `/tienda/espejo/pedido` al final del wizard, una vez que el cliente confirmó foto + estilo + consentimiento.
- En `/tienda` mismo, NO hay botón compra (es solo grilla preview).

---

## 8 · ESPEJO PLATEADO · sección de personalización

### 8.1 · Landing `/tienda/espejo`

Página de presentación de la línea. Layout sugerido:

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   ESPEJO PLATEADO                                        │
│   (en tipografía handwritten grande)                     │
│                                                          │
│   Tu cara en clave Simio.                                │
│                                                          │
│   [hero image: pareja chibi de Juan y Yuli — primera     │
│    pieza ESPEJO, prueba de concepto]                     │
│                                                          │
│   ────────────────────────────────────────               │
│                                                          │
│   ¿Cómo funciona?                                        │
│                                                          │
│   1. Envíanos tu foto                                    │
│   2. Eliges un estilo del catálogo (18 opciones)         │
│   3. Te enviamos preview en 48h                          │
│   4. Aprobado el preview, imprimimos                     │
│   5. Recibes tu pieza física en 2-3 semanas              │
│                                                          │
│   ────────────────────────────────────────               │
│                                                          │
│   El catálogo                                            │
│                                                          │
│   [grilla de 18 estilos, agrupados en 3 familias:        │
│    MITOLOGÍA · BESTIARIO COTIDIANO · ART HISTORY]        │
│                                                          │
│   ────────────────────────────────────────               │
│                                                          │
│   Precios                                                │
│                                                          │
│   ESPEJO INDIVIDUAL ........ USD 128                     │
│   ESPEJO PAREJA ............. USD 198                    │
│   ESPEJO FAMILIAR ........... USD 268                    │
│   ESPEJO GRUPO (4-5) ........ USD 348                    │
│   Estilo CUSTOM ............. +USD 30                    │
│                                                          │
│   ────────────────────────────────────────               │
│                                                          │
│   [Botón gigante: Crear mi ESPEJO]                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

El botón "Crear mi ESPEJO" lleva al wizard en `/tienda/espejo/pedido`.

### 8.2 · Wizard de pedido · `/tienda/espejo/pedido`

Wizard de 5 pasos, cada uno es una vista navegable con back/next. Estado del wizard guardado en localStorage para sobrevivir refresh.

#### Paso 1 · Configuración base

```
¿Cuántas personas en la pieza?
  ○ 1 persona (ESPEJO INDIVIDUAL · USD 128)
  ○ 2 personas (ESPEJO PAREJA · USD 198)
  ○ 3 personas (ESPEJO FAMILIAR · USD 268)
  ○ 4-5 personas (ESPEJO GRUPO · USD 348)

Tu email:
  [_______________________]

Tu nombre:
  [_______________________]
```

#### Paso 2 · Subir fotos

```
Sube una foto de cada persona

Por cada slot configurado en paso 1:
  ┌─────────────────────────────────┐
  │                                 │
  │  + Subir foto persona 1         │
  │                                 │
  │  formato: JPG, PNG · max 10 MB  │
  │  encuadre: cara visible,        │
  │  buena luz, fondo neutro        │
  └─────────────────────────────────┘
```

**Validación cliente-side**:
- Tipo: `image/jpeg`, `image/png`, `image/webp`
- Tamaño máximo: 10 MB
- Resolución mínima: 800×800 px (recomendado 1500×1500)

**Validación server-side** (más estricta): el Worker rechaza si dimensiones bajas o si EXIF tiene contenido sospechoso. (Detalles del endpoint en §9.)

#### Paso 3 · Elegir estilo

```
Elige el estilo de tu pieza

(Tabs para alternar entre familias)

  [MITOLOGÍA]  BESTIARIO  ART HISTORY  CUSTOM

  Grilla de 6 thumbnails clickeables:
  CENTAURO · SIRENA · MINOTAURO · CANCERBERO · FAUNO · GORGONA

  Cada uno muestra:
  - ejemplo visual del estilo (genérico, no del cliente)
  - nombre handwritten
  - descripción de 1 línea
```

Si el usuario elige **CUSTOM**, en lugar de seleccionar de la grilla escribe libremente: *"Describe el estilo que quieres"*. Costo adicional USD 30 se suma al total visible.

#### Paso 4 · Consentimiento

```
Para procesar tu pedido necesitamos tu consentimiento

  ☐ Autorizo a Simio Plateado a procesar mi foto con
    inteligencia artificial para crear la pieza ESPEJO
    que pedí. Las fotos no se usan para nada más sin
    mi permiso explícito.

  ☐ Acepto los términos y la política de privacidad
    [link a /legal/terminos] [link a /legal/privacidad]

  ☐ (Opcional) Autorizo a Simio Plateado a usar mi
    pieza terminada (sin mi nombre) en redes sociales
    y catálogo público.

  → Solo los dos primeros son obligatorios. El tercero es opcional.
```

El consentimiento se firma con timestamp + IP hash + email. Se guarda en KV `SIMIO_CONSENTS` con copia inmutable.

#### Paso 5 · Confirmación y pago

```
Resumen de tu pedido

  ESPEJO PAREJA · estilo CENTAURO
  2 personas · 2 fotos cargadas
  Total: USD 198

  [Botón PayPal — cobra y dispara el flow de producción]
```

Una vez el pago se captura (vía PayPal Smart Buttons del V0.13), el flujo backend (§9) recibe el evento, guarda el pedido, sube las fotos a R2 (o equivalente), y notifica a Juan.

---

## 9 · Backend del pedido ESPEJO

### 9.1 · Endpoints adicionales en el Worker simioplateado-pagos

```
POST /api/espejo/upload-photo    → recibe archivo, valida, guarda en R2/storage
POST /api/espejo/submit-order    → recibe pedido completo (después de pago)
                                   guarda en KV, dispara emails
```

### 9.2 · Flujo de submit-order

```js
async function submitEspejoOrder(env, request) {
  const { orderID, espejoData } = await request.json();
  // espejoData = { numPersonas, fotos[], estilo, custom, consents, email, nombre }

  // 1. Verificar que orderID está pagado (consultar PayPal API)
  const orden = await getPayPalOrder(env, orderID);
  if (orden.status !== 'COMPLETED') {
    return new Response('Order not completed', { status: 400 });
  }

  // 2. Validar que el monto pagado corresponde al pedido ESPEJO
  const expectedAmount = calcEspejoPrice(espejoData);
  if (Number(orden.amount) !== expectedAmount) {
    return new Response('Amount mismatch', { status: 400 });
  }

  // 3. Guardar pedido ESPEJO en KV
  const espejoOrderId = `espejo-${orderID}`;
  await env.SIMIO_ORDERS.put(espejoOrderId, JSON.stringify({
    tipo: 'espejo',
    estilo: espejoData.estilo,
    custom: espejoData.custom,
    numPersonas: espejoData.numPersonas,
    fotosUrls: espejoData.fotosUrls,  // ya subidas en paso anterior
    consents: espejoData.consents,
    cliente: { email: espejoData.email, nombre: espejoData.nombre },
    fechaPedido: new Date().toISOString(),
    fase: 'VISTO',  // arranca en fase VISTO
    paypalOrderId: orderID,
  }));

  // 4. Email a Juan: "Pedido ESPEJO nuevo"
  await sendEspejoAlertToJuan(env, espejoOrderId);

  // 5. Email al cliente: "Recibimos tu pedido"
  await sendEspejoConfirmationToClient(env, espejoData.email, espejoOrderId);

  return new Response(JSON.stringify({ success: true, espejoOrderId }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 9.3 · Notificación a Juan

Email automático con:

- Resumen del pedido
- Estilo elegido + custom si aplica
- Links a las fotos subidas (URLs firmadas, expiran en 7 días)
- Copia del consentimiento firmado
- Link al panel admin (futuro) para actualizar fase a IMAGINADO/DISEÑADO/HECHO

Por ahora el panel admin no existe; Juan actualiza las fases editando manualmente el manifest del repo. Eso es para un brief siguiente (V0.14 · panel admin de pedidos).

---

## 10 · Estados visuales

| Estado          | Render                                                                  |
|-----------------|-------------------------------------------------------------------------|
| Cargando        | Skeleton con sello IRREAL pulsante en lugar de cada pieza               |
| Vacío (sin stock global) | Mensaje *"Pronto traemos más piezas. Mientras tanto, [revisa la Galería]."* |
| Error de red    | *"Algo se cayó. Recarga la página o escríbele a Juan."* + botón retry   |
| Pedido enviado  | Sello "PEDIDO RECIBIDO" handwritten + número de orden + email enviado   |

---

## 11 · Responsive · mobile

- Grid de piezas en Tienda: 2 columnas en mobile (< 768px), 3 en tablet, 4 en desktop
- Switch Galería ↔ Tienda: siempre visible, sticky top
- Wizard ESPEJO: stack vertical en mobile, cada paso ocupa pantalla completa
- Subida de fotos en mobile: input `accept="image/*" capture="environment"` para cámara directa
- Botones PayPal: ancho completo en mobile

---

## 12 · Tipografía y acentos

Consistente con `doctrina/notas-tipograficas.md`:

- Nombres de piezas: handwritten procesado (`assets/processed/textos/`)
- Precios y stock: tipografía base regular
- Sello IRREAL: variante delgada (`sello-irreal-delgado.png`) sobre fases vacías
- Sello AGOTADO: variante media, color tinta gris-oscuro
- Sello IMPOSIBLE: variante negra completa
- Acentos flotantes: distribuir 3-5 acentos del set `assets/processed/acentos/` en bordes del grid de Tienda (no sobre piezas, en márgenes)

---

## 13 · Acceptance criteria · pruebas que codex debe pasar

- [ ] Switch Galería ↔ Tienda visible y sticky en ambas vistas
- [ ] URLs `/galeria` y `/tienda` separadas, ambas con OG tags propios
- [ ] Pieza con `stock > 0` muestra botón PayPal funcional
- [ ] Pieza con `stock === 0` muestra sello AGOTADO sin botón
- [ ] Pieza ESPEJO (línea ESPEJO en manifest) muestra 4 fases incluyendo VISTO
- [ ] Pieza curada muestra 3 fases sin VISTO
- [ ] Fases vacías llevan sello IRREAL
- [ ] Landing `/tienda/espejo` carga con grilla de 18 estilos del catálogo
- [ ] Wizard de 5 pasos navegable con back/next, estado en localStorage
- [ ] Validación de fotos cliente-side (tipo, tamaño, dimensiones)
- [ ] Consentimiento legal obligatorio bloquea el paso 5 si no está marcado
- [ ] Pago PayPal en wizard ESPEJO dispara endpoint `/api/espejo/submit-order`
- [ ] Email a Juan con detalles del pedido se envía tras submit
- [ ] Email al cliente con confirmación se envía tras submit
- [ ] Mobile: grid 2 columnas, wizard vertical, botones full-width
- [ ] Estilo CUSTOM agrega USD 30 al total visible y al cobro real

---

## 14 · Pendientes que NO entran en este brief

Estas cosas se delegan a briefs posteriores:

- **V0.14 · Panel admin de pedidos**: Juan debe poder ver lista de pedidos pendientes, actualizar fase de cada uno, generar imagen IA del estilo elegido, descargar fotos del cliente.
- **V0.15 · Inglés**: traducción del sitio (sigue al BRIEF_CODEX_V11 pendiente).
- **V0.16 · Wompi integración**: para clientes colombianos que prefieren pagar en COP.
- **Doctrina · uso de imagen**: el texto legal exacto del consentimiento del paso 4 lo cubre `doctrina/consentimiento-uso-imagen.md` (Task #5, pendiente).

---

*Brief creado 2026-05-18. Acompaña a `BRIEF_CODEX_V10.md` (catálogo de piezas), `BRIEF_CODEX_V13_PAGOS_PAYPAL.md` (integración PayPal), `BRIEF_CODEX_NAVEGACION.md` (URLs limpias y OG tags), y `doctrina/espejo-plateado.md` (doctrina canónica de la línea personalizable).*
