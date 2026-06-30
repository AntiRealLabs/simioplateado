# Brief V0.24.1 - Handoff detallado - Simio Plateado

Fecha: 2026-06-28  
Proyecto: `simioplateado.com`  
Repo local: `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado`  
Tipo: brief operativo especifico para nuevo chat/agente.

Este es el segundo brief de migracion. Complementa el brief general:

`BRIEF_V24_HANDOFF_GENERAL_SIMIO_PLATEADO_2026-06-28.md`

El objetivo de este documento es que un nuevo chat pueda continuar con los detalles recientes, sin releer todo el historial y sin reiniciar el proyecto.

## 0. Orden de lectura recomendado

Antes de tocar archivos:

1. Leer `BRIEF_V24_HANDOFF_GENERAL_SIMIO_PLATEADO_2026-06-28.md`.
2. Leer este brief.
3. Revisar estado del repo:

```bash
cd "/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado"
git status --short
```

4. Revisar, como minimo:

```bash
mockups/index.html
mockups/assets/optimized/app.753508aced.js
workers/simio-sondeo/worker.js
workers/simio-sondeo/wrangler.toml
mockups/assets/
assets/
```

Regla de oro: no revertir cambios no propios. El arbol puede estar sucio y eso es normal.

## 1. Estado tecnico general

Frontend:

- App estatica en `mockups/`.
- Archivo principal desplegado:
  `mockups/index.html`
- Logica principal actual:
  `mockups/assets/optimized/app.753508aced.js`

Worker/API:

- Worker:
  `workers/simio-sondeo/worker.js`
- Config:
  `workers/simio-sondeo/wrangler.toml`
- Dominio API:
  `https://api.simioplateado.com`

Deploy Pages:

```bash
cd "/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado"
npx wrangler pages deploy mockups --project-name=simio-plateado --commit-dirty=true
```

Deploy Worker:

```bash
cd "/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado"
npx wrangler deploy --config workers/simio-sondeo/wrangler.toml
```

Checks minimos:

```bash
node --check mockups/assets/optimized/app.753508aced.js
git diff --check -- mockups/index.html mockups/assets/optimized/app.753508aced.js workers/simio-sondeo/worker.js workers/simio-sondeo/wrangler.toml
```

## 2. Variables actuales del Worker

No exponer secretos. Estas son variables publicas o nombres de secrets.

Variables de Tripo3D en `workers/simio-sondeo/wrangler.toml`:

```toml
TRIPO3D_API_URL = "https://openapi.tripo3d.ai/v3"
TRIPO3D_MODEL = "v3.1-20260211"
TRIPO3D_TEXTURE = "true"
TRIPO3D_PBR = "true"
TRIPO3D_TEXTURE_QUALITY = "standard"
TRIPO3D_IMAGE_AUTOFIX = "true"
TRIPO3D_ORIENTATION = "align_image"
MAX_MODELS_PER_EMAIL_PER_DAY = "6"
ENCARGOS_PREVIEW_RATE_LIMIT_MAX = "24"
```

Secret requerido:

```bash
TRIPO3D_API_KEY
```

La clave se guarda en Cloudflare con Wrangler. No escribir la clave en archivos.

Variables de precios para encargos:

```toml
PRICE_BASE_S = "120000"
PRICE_BASE_M = "160000"
PRICE_BASE_L = "190000"
PRICE_BASE_XL = "215000"
PRICE_PREMIUM_FINISH_ADDON = "20000"
PRICE_KEYCHAIN_ADDON = "35000"
PRICE_CASE_S = "30000"
PRICE_CASE_M = "40000"
PRICE_CASE_L = "50000"
PRICE_CASE_XL = "60000"
CASE_TEXT_MAX_CHARS = "20"
```

Colores:

```toml
COLORS_BASIC = "blanco,negro,translucido"
COLORS_PREMIUM = "dorado,plateado,rosado,plateado_mate"
GRAFFITI_OPTIONS = "negras,plateadas"
```

Descuentos por cantidad:

```toml
MULTIPLIER_PIECE_1 = "1.0"
MULTIPLIER_PIECE_2 = "0.80"
MULTIPLIER_PIECE_3 = "0.70"
MULTIPLIER_PIECE_4 = "0.60"
MULTIPLIER_PIECE_5_PLUS = "0.50"
```

Envios:

```toml
SHIPPING_MEDELLIN = "0"
SHIPPING_COLOMBIA = "15000"
USD_TO_COP_RATE = "4150"
COUNTRIES_ENABLED = "CO,US,MX,CA,ES,FR,DE,IT,NL,CL,PE,EC,PA"
```

Costos DHL / referencia interna:

```toml
SHIPPING_US = "130"
SHIPPING_MX = "130"
SHIPPING_CA = "140"
SHIPPING_ES = "230"
SHIPPING_FR = "230"
SHIPPING_DE = "230"
SHIPPING_IT = "230"
SHIPPING_NL = "230"
SHIPPING_CL = "120"
SHIPPING_PE = "120"
SHIPPING_EC = "115"
SHIPPING_PA = "115"
```

Add-on publico internacional incluido en total:

```toml
INTERNATIONAL_INCLUDED_ADDON_US = "70"
INTERNATIONAL_INCLUDED_ADDON_MX = "70"
INTERNATIONAL_INCLUDED_ADDON_CA = "80"
INTERNATIONAL_INCLUDED_ADDON_ES = "110"
INTERNATIONAL_INCLUDED_ADDON_FR = "110"
INTERNATIONAL_INCLUDED_ADDON_DE = "110"
INTERNATIONAL_INCLUDED_ADDON_IT = "110"
INTERNATIONAL_INCLUDED_ADDON_NL = "110"
INTERNATIONAL_INCLUDED_ADDON_CL = "65"
INTERNATIONAL_INCLUDED_ADDON_PE = "65"
INTERNATIONAL_INCLUDED_ADDON_EC = "60"
INTERNATIONAL_INCLUDED_ADDON_PA = "60"
```

Email:

```toml
ADMIN_EMAIL = "el@simioplateado.com"
EMAIL_FROM = "noreply@simioplateado.com"
```

Bindings:

- `VOTES`
- `SIMIO_ORDERS`
- `EMAIL`

Secrets relacionados:

- `TRIPO3D_API_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- Posibles secrets de MailChannels si se usa respaldo.

## 3. Endpoints actuales importantes

Worker:

```text
GET  /api/shipping-cost
POST /api/international-quote
POST /api/checkout
POST /api/checkout-issue
POST /api/encargos/intent
POST /api/encargos/preview
GET  /api/encargos/uploads/:token
HEAD /api/encargos/uploads/:token
GET  /api/encargos/tripo-task/:taskId
POST /api/encargos/request
GET  /api/encargos/request/:id
POST /api/encargos/request/:id/payment
POST /api/mercadopago/webhook
```

Frontend constants principales:

```js
ENCARGOS_INTENT_ENDPOINT = "https://api.simioplateado.com/api/encargos/intent"
ENCARGOS_PREVIEW_ENDPOINT = "https://api.simioplateado.com/api/encargos/preview"
ENCARGOS_TRIPO_TASK_ENDPOINT = "https://api.simioplateado.com/api/encargos/tripo-task"
ENCARGOS_REQUEST_ENDPOINT = "https://api.simioplateado.com/api/encargos/request"
SHIPPING_COST_ENDPOINT = "https://api.simioplateado.com/api/shipping-cost"
INTERNATIONAL_QUOTE_ENDPOINT = "https://api.simioplateado.com/api/international-quote"
```

## 4. Compras directas: estado actual

Checkout directo en Colombia:

- Usa Mercado Pago Checkout Pro.
- Endpoint:
  `POST https://api.simioplateado.com/api/checkout`
- Secret:
  `MERCADOPAGO_ACCESS_TOKEN`
- El precio se procesa en COP.
- En Colombia el envio nacional debe verse como incluido.

Compra internacional:

- No debe mostrar una linea donde el envio aparezca costando mas que la pieza.
- Debe mostrar total internacional con envio incluido.
- Antes de cobrar se confirma por email.
- El email interno recomienda:
  1. Confirmar tarifa real DHL con peso/volumen/seguro.
  2. Confirmar caja/proteccion especial.
  3. Crear link de pago por total internacional definitivo.
  4. Usar Bold/Wise/PayPal como alternativas si aplica.

Copys clave:

- `Total internacional con envio incluido`
- `Confirmamos el total definitivo por email antes de cobrar`
- `Aranceles, impuestos o gastos de importacion pueden aplicar en destino`
- `Figura + estuche de coleccion + ilustracion/tarjeta + preparacion de despacho`

No presentar internacional como "pieza + envio". Presentarlo como producto premium empacado con total internacional incluido.

## 5. Productos de compra directa actuales

Mapa de checkout en `app.753508aced.js`:

```js
marxito:         COP 250000 / USD 63
traumin:         COP 220000 / USD 55
superhombresito: COP 230000 / USD 58
cthulito:        COP 300000 / USD 75
quijotico:       COP 260000 / USD 65
gabito:          COP 240000 / USD 60
poesito:         COP 230000 / USD 58
dostoiecito:     COP 230000 / USD 58  // nombre publico: MINI_FIODOR.v01
acefalo:         COP 200000 / USD 50
jarron:          COP 220000 / USD 55
gorra:           COP 105600 / USD 26.4
camiseta-blanca: COP 81600 / USD 20.4
camiseta-negra:  COP 91200 / USD 22.8
```

Detalles por producto reciente:

### MINI_FIODOR.v01

- Slug/catalogo: `dostoiecito`
- Checkout slug: `dostoiecito`
- Precio: `COP 230.000`
- Medidas: `18 cm alto x 11 cm ancho x 11 cm profundo`
- Modelo: `assets/models/literatos/dostoiecito.glb`
- Imagen actual: `assets/optimized/processed/piezas/literatos/dostoiecito-humillado-real.fd0f1bf1e4.webp`
- Nota: el usuario pidio abandonar nombres tipo `Humillado y ofendido` y usar `Mini Fiodor`.

### ACEFALO.v01

- Slug/catalogo: `acefalo`
- Checkout slug: `acefalo`
- Precio: `COP 200.000`
- Medidas: `25 cm alto x 20 cm ancho x 5 cm profundo`
- Modelo: `assets/models/acefalo.glb`
- Imagen actual: `assets/optimized/processed/piezas/acefalo/acefalo-real.1c164f7a64.webp`
- Nota: esta unidad va sin caja.

### GABITO.v01

- Slug/catalogo: `gabito`
- Checkout slug: `gabito`
- Precio: `COP 240.000`
- Medidas en caja: `16 cm alto x 10 cm ancho x 10 cm profundo`
- Modelo: `assets/models/literatos/gabito.glb`
- Imagen real: `assets/optimized/processed/piezas/literatos/gabito-real.4bb99783a9.webp`
- Tiene handwritten: `assets/optimized/processed/textos/gabito.5ee18728ee.webp`

### POESITO.v01

- Slug/catalogo: `poesito`
- Checkout slug: `poesito`
- Precio: `COP 230.000`
- Medidas: `18 cm alto x 11 cm ancho x 11 cm profundo`
- Modelo: `assets/models/literatos/poesito.glb`
- Imagen real: `assets/optimized/processed/piezas/literatos/poesito-dorado-real.b5c4f4e1fb.webp`

### CTHULITO.v01

- Slug/catalogo: `cthulito`
- Checkout slug: `cthulito`
- Precio actual final: `COP 300.000`
- Medidas: `11 cm alto x 18,5 cm ancho x 16,5 cm profundo`
- Tirada inicial: `3`
- Modelo: `assets/models/literatos/cthulito.glb`
- Imagen real: `assets/optimized/processed/piezas/literatos/cthulito-dorado-real.9e06aeb454.webp`
- Tiene handwritten: `assets/optimized/processed/textos/cthulito.55e42ee11e.webp`
- Cuidado: ya hubo problemas de escala visual. Cthulito no debe verse mas pequeno que el Osito Wu Tang si esta junto a el.

### QUIJOTICO.v01

- Slug/catalogo: `quijotico`
- Checkout slug: `quijotico`
- Precio: `COP 260.000`
- Medidas finales: por confirmar antes de despacho.
- Modelo: `assets/models/literatos/quijotico.glb`
- Imagen real: `assets/optimized/processed/piezas/literatos/quijotico-real.b91f4030bf.webp`
- Tiene alto nivel de detalle y lanza fina.
- Marcado como diseno original.

## 6. Catalogo: familias y orden

La galeria esta organizada por familias, con separadores sutiles, no como ecommerce clasico. El usuario quedo feliz con ese orden.

Mantener:

- Todo el catalogo continuo, pero ordenado por subconjuntos/familias.
- Divisiones sutiles, sofisticadas, con mucho aire.
- Wearables al final.
- `Dialoguin` es Platon y debe estar en `Grandes/Mentes`, no en `Otros`.
- Los 4 monos no son `diseno original`.
- `IRREAL` solo para piezas sin desarrollo fisico real.

Familias visibles/relevantes:

- Literatos
- Grandes/Mentes
- Party Animals
- Simiugs
- Colombia
- Objetos
- Bocinas / sonido
- Wearables
- Otros, solo si realmente no encaja en familia mejor.

## 7. Nuevas piezas y estado de incorporacion

Hay varias piezas nuevas ya en assets/codigo o parcialmente incorporadas. Verificar antes de duplicar.

### Party Animals

Modelos:

```text
mockups/assets/models/party-animals/bunnivil.glb
mockups/assets/models/party-animals/felpi.glb
mockups/assets/models/party-animals/flow-eater.glb
mockups/assets/models/party-animals/flowlamar.glb
mockups/assets/models/party-animals/gorilla-bass.glb
mockups/assets/models/party-animals/slimmy.glb
```

Estado general:

- Muchos tienen ilustracion + GLB.
- Faltan varios handwritten.
- Deben verse con fondo blanco limpio.
- No cargar GLB eagerly.

### Simiugs

Modelos:

```text
mockups/assets/models/simiugs/copa-de-la-vida.glb
mockups/assets/models/simiugs/goticup.glb
mockups/assets/models/simiugs/kubikup.glb
mockups/assets/models/simiugs/surreal-cup.glb
```

Estado:

- Integrados como nueva linea.
- Revisar titulos handwritten pendientes.
- No todos deben ser disponibles.

### Bocinas / linea de sonido

Modelos:

```text
mockups/assets/models/bocinas/sonidos-del-alma.glb
mockups/assets/models/bocinas/sound-creature.glb
mockups/assets/models/bocinas/visual-sounds.glb
```

Pieza relacionada:

- `vida-y-pena`
- Modelo:
  `mockups/assets/models/objetos/vida-y-pena.glb`

Estado:

- Se pidio integrar 4 disenos completos de bocinas con imagen sin fondo y GLB.
- Tambien integrar estatua `Vida y pena`.
- Revisar que la boca de `Vida y pena` no tenga la bocina circular antigua si ya se actualizo el asset.
- Nombre visible sugerido: `VIDA_Y_PENA.v01`.

### Objetos recientes

Modelos:

```text
mockups/assets/models/objetos/sherk-buchon.glb
mockups/assets/models/objetos/mater-cuchilla.glb
mockups/assets/models/objetos/happensador.glb
mockups/assets/models/objetos/arcangelito.glb
```

Piezas:

- `Sherk Buchon`: usuario pidio ese nombre para el primero. Ojo: posible IP/parodia; no marcar como diseno original sin decision explicita.
- Virgen/Dolorosa: no usar `Mater Cuchilla` como nombre visible. El usuario rechazo ese tipo de nombre. Mejor conservar algo como `MATER_DOLOROSA.v01` o proponer un nombre mas fino.
- `Happensador`: estatua con carita feliz tipo pensador. Debe ir como pieza/estudio escultorico.
- `Arcangelito`: modelo cargado. Se pidio incorporar.

### Literatos y grandes mentes pendientes/ideas

Ya existen o se hablaron:

- Kafka
- Bicho K
- Poe
- Mini Fiodor
- Gabito
- Crafsito
- Cthulito
- Kowskito
- Quijotico

Ideas futuras pedidas:

- Cientificos: Einstein, Da Vinci, Galileo, Copernico.
- Filosofos: Spinoza, Descartes, Hegel, Hobbes.

No implementarlas sin assets/modelos concretos o instruccion directa. Pueden existir prompts previos, pero no son catalogo todavia.

## 8. Rutas y aliases utiles

La app tiene aliases de ruta para que productos abran con variaciones de nombre.

Ejemplos:

```text
/galeria/acefalo
/galeria/acéfalo
/galeria/gabito
/galeria/poesito
/galeria/poe
/galeria/cthulito
/galeria/quijotico
/galeria/quijote
/galeria/sherk-buchon
/galeria/mater-dolorosa
/galeria/happensador
/galeria/arcangelito
```

Si se cambia nombre visible, revisar tambien aliases para no romper enlaces ya publicados.

## 9. Encargos personalizados: estado y flujo

Rutas:

```text
/encargos
/encargos/crear
```

Landing actual:

- Kicker: `Impresion 3D a pedido`
- H1: `TRAE UNA IMAGEN. SAL CON UNA PIEZA.`
- Lead: `Sube una referencia, genera un modelo 3D preliminar y deja la solicitud lista para que revisemos escala, material, viabilidad y precio final. No pagas aqui: primero cotizamos con cuidado.`
- Boton/asset handwritten incorporado:
  `PEDIDO PERSONALIZADO`
- Confirmacion visual:
  `Cotizacion manual - produccion experimental - respuesta por email`

Flujo:

1. Email.
2. Imagen base.
3. Generacion Tripo/modelo y opciones.
4. Datos.
5. Listo.

El usuario ya confirmo una prueba exitosa:

- Pudo usar imagen del perrito.
- Lleno toda la informacion.
- Le llego correo con enlaces STL y GLB.
- Esto valida que Tripo + notificaciones + solicitud funcionan al menos en un caso real.

No obstante, hubo varios fallos previos:

- Mensaje de modelo aun procesandose.
- Rate limit por email.
- Frustracion por reintentos sin modelo.
- Necesidad de instrucciones claras: extraer solo el sujeto, jamas la imagen completa.

Por eso cualquier cambio futuro debe priorizar:

- Reintentos claros.
- Mensajes de error utiles.
- No consumir creditos sin guiar al usuario.
- Mostrar estado de procesamiento.
- Permitir continuar si el modelo es imperfecto.
- Guardar comentarios adicionales despues de ver el modelo.

## 10. Campo de instrucciones en encargos

Campo actual:

```text
Que quieres extraer de la imagen
```

Ayuda actual:

```text
Obligatorio. Minimo 8 caracteres: nombra el sujeto principal y lo que quieres excluir. Ej: solo el gato, sin silla ni celular.
```

Decision:

- Debe seguir siendo obligatorio, porque Tripo puede tomar la escena completa si no se le guia.
- Pero el copy debe ser claro, no hostil.
- No pedir un parrafo largo.
- Minimo razonable: nombrar sujeto y exclusiones.

Ejemplos validos:

```text
solo el perro, sin cama ni fondo
solo el vaso, sin mesa ni fondo
solo la persona, sin calle ni carros
```

## 11. Comentarios posteriores al modelo

El usuario pidio una seccion final de comentarios adicionales despues de ver el modelo generado.

Debe existir y debe guardarse/enviarse en la solicitud.

Copy sugerido:

```text
Comentarios sobre el modelo generado
Opcional. Dinos que quieres corregir, conservar o aclarar despues de ver esta vista preliminar.
```

Ejemplos:

```text
Conservar la pose, pero hacer la base mas pequena.
La cara esta bien, pero quiero menos textura en el cuerpo.
Quitar el objeto que aparece atras.
```

Verificar en futuros cambios que este campo:

- Sale en el email interno.
- Queda en el registro de `SIMIO_ORDERS` o KV correspondiente.
- No bloquea envio si esta vacio.

## 12. Tripo3D: notas tecnicas

Funcionamiento:

- Se sube imagen.
- Worker crea un upload temporal.
- Worker llama Tripo con prompt construido.
- Frontend consulta `GET /api/encargos/tripo-task/:taskId`.
- Cuando hay resultado, muestra modelo.

Prompt actual del Worker incluye:

```text
No se debe tomar la foto completa como escena; la pieza debe centrarse en el sujeto indicado por el cliente.
Tipo de pieza: ...
Objetivo: pieza fisica imprimible, aislada, revisable y ajustable antes de cotizar produccion final.
```

Riesgos:

- Si el usuario no indica sujeto, el resultado puede ser una escena completa.
- Si el archivo es muy pesado, falla por limite.
- Si el email ya uso muchas vistas, puede bloquear.
- Si Tripo responde lento, el usuario puede pensar que fallo.
- Si el modelo es raro, igual debe poder enviar solicitud con comentarios.

Limites actuales:

- `MAX_MODELS_PER_EMAIL_PER_DAY = 6`
- `ENCARGOS_PREVIEW_RATE_LIMIT_MAX = 24`
- `ENCARGOS_IMAGE_MAX_BYTES = 1_600_000` en Worker.
- `ENCARGOS_UPLOAD_MAX_BYTES = 8_000_000` en Worker.

Si el usuario vuelve a reportar "no funciona Tripo":

1. Revisar consola.
2. Revisar respuesta de `/api/encargos/preview`.
3. Revisar task id.
4. Consultar `/api/encargos/tripo-task/:taskId`.
5. Verificar que `TRIPO3D_API_KEY` exista en Cloudflare.
6. Verificar creditos API de Tripo.
7. Revisar si el error es rate limit por email.

## 13. Emails y notificaciones

Destino principal admin:

```text
el@simioplateado.com
```

Fallback/uso interno posible en Worker:

```text
numeros@simioplateado.com
```

From:

```text
noreply@simioplateado.com
```

Notificaciones que deben funcionar:

- Solicitud de encargo personalizada.
- Confirmacion al cliente.
- Solicitud de cotizacion internacional.
- Confirmacion al cliente de cotizacion internacional.
- Problema de checkout / "no pude realizar mi compra".
- Link de pago para encargo personalizado, si se genera desde endpoint.

Verificacion recomendada:

- Hacer una solicitud con email propio.
- Confirmar correo cliente.
- Confirmar correo admin.
- Revisar spam si no aparece.
- Revisar Cloudflare email routing / send binding.

## 14. Links de pago para encargos

Endpoint:

```text
POST /api/encargos/request/:id/payment
```

Uso:

- Toma solicitud ya registrada.
- Crea preferencia de Mercado Pago si existe `MERCADOPAGO_ACCESS_TOKEN`.
- Puede enviar link al cliente.

Regla:

- El cliente no paga al generar modelo.
- Primero se revisa viabilidad, escala, material, acabado y precio final.
- Luego Juan genera link de pago.

Si se automatiza mas:

- No saltarse revision manual.
- No mandar precio definitivo si se requiere validar peso, soporte, tiempo de impresion o envio internacional.

## 15. Internacional: filosofia comercial y estado

El usuario quiere abrir mercado internacional porque Colombia no ha convertido bien.

Decisiones importantes:

- No mostrar envio como una linea enorme.
- Mostrar total con envio incluido.
- No hacer que parezca que el envio vale mas que el objeto.
- Justificar valor premium: pieza + estuche + ilustracion/tarjeta + preparacion + despacho.
- Confirmar total definitivo por email antes de cobrar.
- Usar DDU: aranceles/impuestos/gastos de importacion en destino pueden aplicar.

Paises habilitados:

```text
CO, US, MX, CA, ES, FR, DE, IT, NL, CL, PE, EC, PA
```

Totales publicos internacionales usan:

```text
precio USD de pieza + INTERNATIONAL_INCLUDED_ADDON_<pais>
```

El Worker guarda tambien costo interno DHL de referencia:

```text
SHIPPING_<pais>
```

Esto permite que el usuario vea un total mas comercialmente tolerable, mientras Juan revisa internamente la viabilidad.

Pendiente clave:

- Probar flujo internacional end-to-end sin cobrar:
  - seleccionar pais no Colombia;
  - completar direccion;
  - enviar solicitud;
  - verificar email cliente;
  - verificar email admin;
  - verificar registro en KV;
  - generar link de pago si aplica.

## 16. Performance: estado y cuidados

Hubo una crisis fuerte de performance. La pagina llego a estar practicamente inutilizable.

Luego se optimizo y PageSpeed mostro:

- Mobile cerca de 99.
- FCP cerca de 1.1s.
- LCP cerca de 2.0s.
- CLS 0.

Esto fue una victoria importante. No romperlo.

Cuidados:

- No usar imagenes originales pesadas en frontend.
- No cargar todos los GLB al inicio.
- No meter scripts externos innecesarios.
- Mantener lazy loading.
- Evitar que el home cargue toda la galeria completa como LCP.
- Revisar PageSpeed despues de grandes integraciones.

Si PageSpeed cae:

1. Revisar LCP.
2. Revisar si alguna imagen nueva no esta optimizada.
3. Revisar si model-viewer se cargo demasiado temprano.
4. Revisar cache headers.
5. Revisar JS bloqueante.

## 17. Google Ads y pauta

El usuario empezo pauta en Google Ads, presupuesto aproximado:

```text
COP 10.000 / dia
```

Campana:

```text
Maximo rendimiento / Campaign #1
```

Problema visto:

- `Ad Strength`: deficiente.
- Faltaban temas de busqueda y senales de publico.

Temas recomendados:

```text
figuras coleccionables
figuras 3D personalizadas
impresion 3D personalizada
regalos personalizados
regalos para lectores
figuras de escritores
figuras de autores
arte coleccionable
decoracion original
esculturas pequenas
objetos de diseno
regalos originales
figuras literarias
figuras para escritorio
coleccionables artisticos
```

Evitar en esta campana:

- hardware
- tinyML
- microcontroladores
- electronica
- videojuegos

Copy de unicidad recomendado:

```text
Piezas de coleccion impresas en 3D, disenadas y terminadas en Medellin. Figuras de autores, criaturas y objetos raros que mezclan literatura, humor, memoria y fantasia material. Algunas son piezas disponibles; otras pueden nacer por encargo desde una imagen. Cuando aplica, cada figura viaja en estuche de coleccion con su grafica o tarjeta, preparada como objeto unico y no como mercancia generica.
```

## 18. Meta Pixel y eventos

Pixel fue instalado antes. Se debe revisar desde Meta Events Manager.

Eventos relevantes que deben existir o deberian rastrearse:

- PageView
- ViewContent/product view
- Click disponible
- Checkout iniciado
- Compra o redirect a Mercado Pago
- `shipping_cost_viewed`
- `international_quote_started`
- `international_quote_requested`
- `international_quote_error`
- `encargos_landing_view`
- `encargos_intent`
- `encargos_image_uploaded`
- `encargos_preview_started`
- `encargos_preview_ready`
- `encargos_preview_failed`
- `encargos_request_sent`

No asumir que Pixel equivale a ventas. Revisar embudo por eventos.

## 19. Assets: ubicacion y flujo

Fuentes:

```text
assets/
```

Servido por frontend:

```text
mockups/assets/
```

Optimizado:

```text
mockups/assets/optimized/
```

Textos handwritten:

```text
mockups/assets/processed/textos/
mockups/assets/optimized/processed/textos/
```

Modelos:

```text
mockups/assets/models/
```

Antes de decir "ya esta incorporado":

1. Confirmar asset fuente.
2. Confirmar copia servida en `mockups/assets`.
3. Confirmar version optimizada si es imagen.
4. Confirmar referencia en JS.
5. Confirmar ruta del producto.
6. Confirmar que abre en navegador.
7. Confirmar deploy si el usuario quiere verlo en produccion.

## 20. Modelos GLB actuales relevantes

Catalogo general:

```text
mockups/assets/models/acefalo.glb
mockups/assets/models/arturito.glb
mockups/assets/models/capitan-nausea-web.glb
mockups/assets/models/copa-chiste-colombia.glb
mockups/assets/models/dialoguin.glb
mockups/assets/models/esponja-g.glb
mockups/assets/models/goti-monda.glb
mockups/assets/models/jarron-pulpo.glb
mockups/assets/models/marxito.glb
mockups/assets/models/melisimo.glb
mockups/assets/models/mini-devenires.glb
mockups/assets/models/mondigotica.glb
mockups/assets/models/nietzschito.glb
mockups/assets/models/sintomin.glb
mockups/assets/models/traumin.glb
mockups/assets/models/tuni-blanca.glb
mockups/assets/models/tuni-negra.glb
mockups/assets/models/tuni-rosa.glb
```

Literatos:

```text
mockups/assets/models/literatos/bicho-k.glb
mockups/assets/models/literatos/crafsito.glb
mockups/assets/models/literatos/cthulito.glb
mockups/assets/models/literatos/dostoiecito.glb
mockups/assets/models/literatos/gabito.glb
mockups/assets/models/literatos/poesito.glb
mockups/assets/models/literatos/quijotico.glb
```

Objetos:

```text
mockups/assets/models/objetos/arcangelito.glb
mockups/assets/models/objetos/gotimonda.glb
mockups/assets/models/objetos/happensador.glb
mockups/assets/models/objetos/mater-cuchilla.glb
mockups/assets/models/objetos/sherk-buchon.glb
mockups/assets/models/objetos/vida-y-pena.glb
```

Party Animals:

```text
mockups/assets/models/party-animals/bunnivil.glb
mockups/assets/models/party-animals/felpi.glb
mockups/assets/models/party-animals/flow-eater.glb
mockups/assets/models/party-animals/flowlamar.glb
mockups/assets/models/party-animals/gorilla-bass.glb
mockups/assets/models/party-animals/slimmy.glb
```

Simiugs:

```text
mockups/assets/models/simiugs/copa-de-la-vida.glb
mockups/assets/models/simiugs/goticup.glb
mockups/assets/models/simiugs/kubikup.glb
mockups/assets/models/simiugs/surreal-cup.glb
```

Bocinas:

```text
mockups/assets/models/bocinas/sonidos-del-alma.glb
mockups/assets/models/bocinas/sound-creature.glb
mockups/assets/models/bocinas/visual-sounds.glb
```

## 21. Textos handwritten y titulos

El usuario ha detectado muchas veces:

- titulos pequenos;
- titulos mal puestos;
- textos cortados;
- fondos no blancos;
- imagenes con exceso de margen.

Reglas:

- Si hay handwritten real, usarlo.
- Si el handwritten no existe, dejar digital temporal sobrio.
- No reducir demasiado titulos handwritten en tarjetas.
- No cortar imagenes para forzar grilla.
- Mantener proporciones coherentes entre productos.

Piezas con especial cuidado:

- Cthulito: titulo y escala visual.
- Atlas: no confundir con Sisifo.
- Copa: se cortaba en movil.
- Capitan Nausea, Sintomin, Arturito: antes se veian pequenos en recuadro.
- Quijotico: lanza no debe cortarse.
- Acéfalo: brazos/antorcha/daga deben verse completos.

## 22. Nombres: decisiones y sensibilidades

Nombres confirmados o preferidos:

- `MINI_FIODOR.v01` en lugar de `Dostoiecito` o `Humillado y ofendido`.
- `Sherk Buchon` para la pieza verde.
- `Happensador` para la estatua del pensador con cara feliz.
- `QUIJOTICO.v01`
- `GABITO.v01`
- `POESITO.v01`
- `CTHULITO.v01`
- `ACEFALO.v01`

Nombres a evitar:

- `Mater Cuchilla` como visible principal.
- `Virgen cuchillera`.
- Nombres demasiado burdos para piezas religiosas/de dolor si el usuario no los aprueba.

Para la Virgen/Dolorosa:

- Usar provisionalmente `MATER_DOLOROSA.v01`.
- Si se propone alternativa, que sea sobria, fina y no morbosa.

## 23. Diseno original: regla precisa

Marcar `diseno original` solo si:

- El concepto es propio de Simio o una transformacion suficientemente propia.
- No depende de una marca/personaje vigente reconocible.
- No es copia directa de escultura religiosa/clasica/famosa.
- El usuario lo pidio explicitamente.

No marcar:

- 4 monos.
- Sherk Buchon, salvo decision juridica/artistica explicita.
- Michael Jackson.
- Figuras religiosas clasicas.
- Referencias con IP clara.

Si hay duda: dejar sin sello.

## 24. Legal/IP: criterio practico

Simio mezcla parodia, meme, literatura, cultura pop y objetos originales. Hay que cuidar la venta.

Riesgos altos:

- Disney, Pixar, Marvel, Nintendo.
- Personajes de TV/streaming vigentes.
- Marcas visibles.
- Musicos/personas vivas o herederos activos si se explota imagen comercial.

Riesgos medios:

- Autores de dominio publico con rasgos inspirados en retratos.
- Figuras religiosas/clasicas.
- Memes no marcarios.

Riesgo mas bajo:

- Criaturas originales.
- Piezas abstractas.
- Encargos personalizados del cliente, si el cliente aporta referencia y acepta responsabilidad.

No dar garantia legal absoluta. Si se va a pautar algo con IP evidente, advertir.

## 25. Estado de promocion y negocio

Contexto emocional/comercial importante:

- El usuario esta agotado y frustrado por inversion sin ventas.
- Se perdieron intentos de compra antes por botones/pagina.
- La seccion de encargos es vista como recurso urgente para flujo de caja.
- La apertura internacional es prioridad altisima.
- La pagina ya logro performance excelente y eso fue un alivio.
- No responder con teoria larga cuando el usuario pida accion: ejecutar.

Prioridades comerciales recientes:

1. Que pagos directos funcionen.
2. Que encargos con Tripo funcionen.
3. Que lleguen correos/admin notifications.
4. Que internacional capture solicitudes y no asuste con envio.
5. Que la pagina cargue rapido.
6. Que publicidad tenga destino claro.

## 26. Lo que hay que verificar antes de decir "listo"

Para compras directas Colombia:

- Abrir producto disponible.
- Ver precio correcto.
- Ver boton compra.
- Enviar checkout con datos de prueba si procede.
- Ver respuesta de API.
- Confirmar que Mercado Pago crea preferencia.

Para internacional:

- Cambiar pais a US/MX/ES u otro no CO.
- Ver copy de total internacional con envio incluido.
- No mostrar envio como linea mayor a la pieza.
- Solicitar cotizacion.
- Confirmar email cliente.
- Confirmar email admin.
- Confirmar registro en KV.

Para encargos:

- Abrir `/encargos`.
- CTA entra a `/encargos/crear`.
- Email funciona.
- Upload imagen funciona.
- Campo "que quieres extraer" obliga de forma clara.
- Tripo genera modelo.
- Modelo se visualiza.
- Opciones recalculan estimado.
- Comentarios finales se guardan.
- Solicitud envia.
- Email cliente/admin llega.
- Links STL/GLB llegan si Tripo los entrega.

Para performance:

- PageSpeed mobile.
- PageSpeed desktop.
- Lighthouse local si hay cambios grandes.
- Revisar que LCP no vuelva a ser una imagen enorme.

## 27. Bugs/riesgos recientes vistos

Tripo:

- A veces Tripo responde "processing" y el usuario reintenta.
- Hubo rate limit por email.
- Antes el sistema genero conceptual falso o mostraba imagen original; eso fue inaceptable.
- Ahora Tripo genero correctamente al menos una vez, pero hay que pulir errores.

Encargos UI:

- La seccion de ejemplos se desajusto despues de performance/asset changes.
- Imagenes de casos reales se veian mal cortadas o con columnas raras.
- El dibujito/asset handwritten de pedido personalizado se veia desalineado.

Checkout:

- Historicamente hubo fallos de boton de pago.
- No asumir que por "se ve" esta bien; probar.

Galeria:

- Titulos pequenos/mal puestos han sido recurrentes.
- Cthulito tuvo escala mal percibida.
- Copa se cortaba en movil.

Performance:

- Una mala optimizacion dejo la pagina "caida" o visualmente rota en una ocasion. Verificar visualmente despues de cambios.

## 28. Pendientes vivos recomendados

Alta prioridad:

1. Verificar flujo internacional completo con emails.
2. Robustecer mensajes de error/reintento de Tripo.
3. Confirmar que comentarios posteriores al modelo llegan al email/admin.
4. Revisar UI mobile de `/encargos`.
5. Revisar UI desktop de ejemplos en `/encargos`.
6. Verificar checkout directo Colombia.
7. Mantener PageSpeed alto tras cada asset nuevo.

Media prioridad:

1. Revisar nombres visibles de Virgen/Dolorosa.
2. Completar metadata de Sherk Buchon, Happensador, Arcangelito, Vida y Pena.
3. Revisar si Bocinas tienen familia propia clara.
4. Completar handwritten pendientes.
5. Generar tarjetas/certificados para Marxito, Freud, Poe y otras piezas.

Baja prioridad:

1. Consola/juegos con ESP32: pausar, no mezclar con Simio ahora.
2. Linea de cientificos: esperar assets.
3. Nuevas cucharitas/palitas: explorar aparte, cuidar materiales y uso.

## 29. Comandos utiles de inspeccion

Buscar endpoints:

```bash
rg -n "api/encargos|international-quote|shipping-cost|checkout" mockups/assets/optimized/app.753508aced.js workers/simio-sondeo/worker.js
```

Buscar productos:

```bash
rg -n "priceCop|checkoutSlug|cthulito|quijotico|gabito|poesito|acefalo|dostoiecito" mockups/assets/optimized/app.753508aced.js
```

Buscar rutas de modelos:

```bash
find mockups/assets/models -type f | sort
```

Buscar handwritten:

```bash
find mockups/assets/processed/textos mockups/assets/optimized/processed/textos -type f | sort
```

Validar JS:

```bash
node --check mockups/assets/optimized/app.753508aced.js
```

Validar whitespace:

```bash
git diff --check -- mockups/index.html mockups/assets/optimized/app.753508aced.js workers/simio-sondeo/worker.js workers/simio-sondeo/wrangler.toml
```

## 30. Reglas de respuesta al usuario

El usuario valora:

- Avance real.
- Respuestas en espanol.
- Claridad sobre que se hizo y que falta.
- Sensibilidad estetica.
- No prometer "listo" sin verificar.
- No volver generico un proyecto con alma.

Cuando algo falle:

- Reconocerlo rapido.
- Decir que se va a revisar.
- No culpar al usuario.
- No responder con teoria si hay que corregir codigo.

Cuando algo quede bien:

- Decirlo con calma.
- Mencionar verificaciones.
- Dar URL o archivo exacto.

## 31. Ruta recomendada para el proximo chat

Si el nuevo chat empieza desde cero, decirle:

1. Estoy en `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado`.
2. Lee `BRIEF_V24_HANDOFF_GENERAL_SIMIO_PLATEADO_2026-06-28.md`.
3. Lee `BRIEF_V24_1_HANDOFF_DETALLADO_SIMIO_PLATEADO_2026-06-28.md`.
4. No reinicies el proyecto.
5. No cambies el espiritu visual.
6. Prioridad actual: internacional + encargos Tripo + checkout + performance.

Primeras acciones recomendadas:

```bash
git status --short
node --check mockups/assets/optimized/app.753508aced.js
rg -n "TRIPO3D|international-quote|handleEncargosPaymentLink|checkoutSlug" workers/simio-sondeo/worker.js mockups/assets/optimized/app.753508aced.js
```

Despues, elegir solo una urgencia y resolverla completa.

## 32. Cierre

Simio Plateado no es una tienda comun. Es un objeto web vivo que ahora tambien debe vender. La continuidad tecnica debe cuidar tres cosas a la vez:

- la rareza visual;
- la confiabilidad comercial;
- la velocidad de carga.

Si una solucion mejora una y destruye otra, no esta lista.

