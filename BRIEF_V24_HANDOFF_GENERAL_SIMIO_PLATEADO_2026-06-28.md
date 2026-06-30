# Brief V0.24 · Handoff general · Simio Plateado

Fecha: 2026-06-28  
Proyecto: `simioplateado.com`  
Repo local: `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado`  
Destino: nuevo chat Codex / Claude / agente tecnico que continue sin reiniciar el proyecto.

Este documento existe para migrar el trabajo a un chat nuevo sin perder el hilo tecnico, estetico, comercial ni emocional de Simio Plateado. Es el brief general. Debe leerse antes de tocar archivos, desplegar o proponer cambios grandes.

## 1. Que es Simio Plateado

Simio Plateado es una galeria web, portal, tienda y laboratorio de objetos de Anti Real Labs S.A.S. No debe sentirse como una tienda generica ni como un ecommerce de plantilla. Debe sentirse como una obra navegable que tambien permite comprar objetos reales, encargar piezas personalizadas y mirar una coleccion en expansion.

Manifiesto base:

> Simio Plateado es una linea de fuga estetico-material hacia la proliferacion de nuevas fugas y multiplicidades. Es un chiste. Es una galeria web. Son ceros y unos. Existe esporadicamente pero con intensidad y pasion en todo tiempo espacio posible. Es un meme con palabras raras. Para los que necesitan respirar. Un aire nuevo.

Contacto publico:

`el@simioplateado.com`

Principio central: las imagenes, los objetos, los modelos 3D y los textos escritos a mano hablan primero. El texto digital debe ser minimo, preciso y con personalidad. La pagina debe sentirse humana, rara, cuidada, directa y ligeramente absurda sin parecer improvisada.

## 2. Filosofia visual y material

- Base visual: blanco, negro, lineas finas, bordes rectos, mucho aire, grilla de galeria.
- El sitio no debe volverse corporativo, genericamente tecnologico, ni ecommerce convencional.
- Evitar tarjetas comerciales innecesarias, gradientes decorativos, sombras blandas de plantilla, botones "bonitos" genericos y copies de marketing inflados.
- Los productos se presentan como piezas de una galeria, no como articulos de marketplace masivo.
- Los textos de titulos de piezas deben ser assets escritos a mano por Juan cuando existan. No usar fuentes "handwritten" falsas para simularlos.
- Si falta handwritten, usar texto digital neutro temporal y mantenerlo como pendiente.
- Mantener `object-fit: contain` en imagenes de producto. No cortar sombras, lanzas, cajas, plantas, copas, figuras, sellos ni bordes.
- Los productos disponibles deben verse con escala coherente entre si. No hacer que una pieza grande parezca mas pequena que una pieza menor por exceso de margen o mal recorte.
- El sitio debe sostener la tension entre galeria de existencias digitales, objetos fisicos reales y piezas posibles.
- Menos explicacion, mas presencia.

## 3. Estados de producto

Los estados son parte de la doctrina del proyecto, no solo inventario.

- `DISPONIBLE`: pieza real comprable ahora.
- `GESTANDOSE`: pieza en desarrollo, produccion o preventa futura.
- `IRREAL`: existencia digital o pieza conceptual que puede volverse fisica despues, pero no esta disponible ahora.
- `IMPOSIBLE`: pieza exclusivamente digital/de exhibicion.

Reglas ya decididas:

- El sello o lenguaje de `IRREAL` debe quedar solo para productos sin desarrollo fisico real, especialmente Tunni y Planti cuando aplique.
- Para piezas no irreales pero todavia no disponibles, preferir `quiero tenerlo` antes que `quiero que exista`.
- No llamar "diseno original" a piezas derivadas de IP, referencias muy reconocibles, figuras religiosas clasicas o memes/personajes que no son propios, salvo decision explicita de Juan.
- Si una pieza es original, exclusiva o propia de Simio, puede usar el sello de `diseno original`.

Terminos a evitar:

- `sondeo silencioso`
- `intencion de compra`
- `edicion pequena`

Terminos preferidos:

- `existencia digital`
- `compra abierta`
- `compra directa`
- `tirada inicial`
- `intervenido a mano`
- `terminado a mano`
- `pre-order` solo cuando aplique realmente

## 4. Arquitectura actual

Frontend principal:

- `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/mockups/index.html`
- SPA estatica en Cloudflare Pages.
- El sitio esta desplegado en `https://simioplateado.com`.
- El catalogo, rutas, textos y logica principal viven en el JS optimizado:
  `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/mockups/assets/optimized/app.753508aced.js`
- El HTML raiz y el JS optimizado suelen necesitar cambios juntos. Revisar ambos antes de tocar catalogo, rutas, checkout, encargos o textos.

Worker/API:

- `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/workers/simio-sondeo/worker.js`
- Config:
  `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/workers/simio-sondeo/wrangler.toml`
- Dominio API:
  `https://api.simioplateado.com`

Assets:

- Fuentes maestras y nuevos materiales:
  `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/assets`
- Copia servida por el frontend:
  `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/mockups/assets`
- Imagenes optimizadas:
  `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/mockups/assets/optimized`
- Modelos GLB:
  `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/mockups/assets/models`
- Textos handwritten:
  `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/mockups/assets/processed/textos`

No asumir que un asset nuevo en `assets/` ya esta incorporado al frontend. Siempre revisar fuente, copia a `mockups/assets`, version optimizada y referencia en el catalogo.

## 5. Deploy y verificacion

Deploy habitual a Cloudflare Pages:

```bash
cd "/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado"
npx wrangler pages deploy mockups --project-name=simio-plateado --commit-dirty=true
```

Checks minimos antes de deploy:

```bash
node --check mockups/assets/optimized/app.753508aced.js
git diff --check -- mockups/index.html mockups/assets/optimized/app.753508aced.js workers/simio-sondeo/worker.js workers/simio-sondeo/wrangler.toml
```

Si se toca Worker:

```bash
npx wrangler deploy --config workers/simio-sondeo/wrangler.toml
```

Verificaciones recomendadas:

- Abrir `https://simioplateado.com`.
- Probar una ruta directa de producto, por ejemplo `/galeria/quijotico`.
- Probar `/encargos` y `/encargos/crear`.
- Revisar consola del navegador.
- Verificar que los assets nuevos respondan `200`.
- En cambios de performance, volver a medir con PageSpeed/Lighthouse.

## 6. Performance: regla de oro

Performance ya fue una crisis real. PageSpeed mobile llego a estar alrededor de 30-35 con cargas de 30-45 segundos, lo que estaba destruyendo el embudo. Luego se hizo una optimizacion fuerte y se llego a resultados cercanos a 99 mobile, con FCP cercano a 1s y LCP cercano a 2s.

No revertir esa arquitectura.

Reglas:

- Usar imagenes optimizadas WebP/AVIF cuando existan.
- No servir imagenes gigantes sin necesidad.
- No cargar modelos 3D antes de que el usuario los necesite.
- `<model-viewer>` debe cargarse de forma diferida/lazy.
- Las imagenes above-the-fold deben ser livianas, con dimensiones y prioridad correcta.
- Las imagenes below-the-fold deben ir lazy.
- Cuidado con añadir librerias externas, pixels, widgets o scripts en el head.
- No sacrificar la estetica, pero tampoco volver a un payload inmanejable.

## 7. Pagos y compras directas

Camino actual:

- Mercado Pago Checkout Pro para compras directas en Colombia.
- Endpoint principal:
  `POST https://api.simioplateado.com/api/checkout`
- Webhook Mercado Pago:
  `https://api.simioplateado.com/api/mercadopago/webhook`
- Secret en Cloudflare:
  `MERCADOPAGO_ACCESS_TOKEN`

Reglas:

- No exponer tokens en chat ni en codigo.
- Colombia: envio nacional incluido en el precio publicado.
- El precio de piezas empacadas debe entenderse como figura + estuche de coleccion + ilustracion/tarjeta + preparacion de despacho.
- Para internacional, no mostrar que el envio cuesta mas que la pieza. Mostrar total internacional con envio incluido y confirmar el definitivo por email antes de cobrar.
- Para internacional, el flujo no debe empujar pago inmediato si no esta cerrado logisticamente. Debe registrar solicitud/cotizacion y permitir enviar link de pago despues.
- Aranceles, impuestos o gastos de importacion en destino pueden aplicar segun pais. Hay que decirlo sin asustar ni esconderlo.

Bold, Wise y otros medios han sido considerados para pagos internacionales, pero no reemplazan automaticamente el flujo actual. La ruta operativa segura hoy es: solicitud internacional, cotizacion final por email, link de pago cuando Juan confirme.

## 8. Encargos personalizados con Tripo3D

La seccion `A PEDIDO` / `/encargos` es estrategica para flujo de caja. El cliente trae una imagen y Simio genera un modelo preliminar con Tripo3D, selecciona opciones, recibe estimado y envia solicitud. Juan revisa manualmente antes de cobrar.

Rutas:

- `/encargos`: landing de servicio.
- `/encargos/crear`: flujo multi-step.

Endpoints principales:

- `POST /api/encargos/intent`
- `POST /api/encargos/preview`
- `GET /api/encargos/tripo-task/:taskId`
- `POST /api/encargos/request`
- `POST /api/encargos/request/:id/payment`

Secret:

- `TRIPO3D_API_KEY` en Cloudflare Worker.

Variables relevantes en `wrangler.toml`:

- `TRIPO3D_API_URL`
- `TRIPO3D_MODEL`
- `TRIPO3D_TEXTURE`
- `TRIPO3D_PBR`
- `TRIPO3D_TEXTURE_QUALITY`
- `TRIPO3D_IMAGE_AUTOFIX`
- `TRIPO3D_ORIENTATION`

Reglas comerciales:

- No se cobra al generar.
- El precio mostrado es estimado.
- La cotizacion definitiva llega por email tras revision manual.
- Hay limites de uso para proteger creditos de Tripo3D.
- El usuario debe indicar claramente que sujeto quiere extraer de la imagen. No debe generarse el fondo completo.
- Debe existir un campo final de comentarios adicionales para aclaraciones posteriores al modelo generado.
- Si Tripo falla, el mensaje debe ser util y no humillante. El sistema debe permitir reintentar sin volverse disfuncional.

## 9. Publicidad, analitica y Pixel

Meta Pixel fue instalado y revisado. Google Ads tambien empezo a usarse. El objetivo no es solo medir compras, sino entender el embudo: visitas, clicks a disponible, inicio de encargo, preview generado, solicitud enviada, pago/cotizacion.

Reglas:

- No disparar `AddToCart` si no hay carrito real.
- Para compras aprobadas, el evento correcto es `Purchase`.
- Para encargos, medir eventos de intencion, preview y solicitud.
- No confiar solo en Pixel para diagnosticar ventas. Revisar performance, logs del Worker, emails, KV/ordenes y flujo real.

## 10. Catalogo y familias

La galeria esta organizada por familias/subtemas, no solo en una grilla plana. La navegacion debe permitir recorrer todo el catalogo de forma continua y con divisiones sutiles.

Familias importantes:

- Tuni
- Planti
- Grandes/Mentes
- Literatos
- Party Animals
- Simiugs
- Colombia
- Wearables
- Audio / bocinas
- Objetos
- Otros
- Encargos / piezas personalizadas como caso aparte

Los wearables deben ir de ultimos cuando se ordena la galeria por familias.

El catalogo ha crecido mucho. Antes de agregar piezas, revisar:

- Si ya existe imagen procesada.
- Si ya existe handwritten.
- Si ya existe GLB.
- Si la pieza es disponible, gestandose, irreal o imposible.
- Si tiene precio.
- Si debe tener `diseno original`.
- Si corresponde a una familia existente o requiere nueva seccion.

## 11. Voz y copy

La voz debe ser rara, humana, sobria e inteligente. No convertir Simio Plateado en una marca motivacional ni en una tienda de gadgets.

Textos ya importantes:

- Leyenda de galeria:
  `Galeria web. Entre lo vivo y lo irreal. Con objetos disponibles, en gestacion y en el imaginario colectivo. Todo puede existir si asi lo deseas; solo dale vida con un click.`

- Encargos:
  `Trae una imagen. Sal con una pieza.`

- Pedido personalizado:
  La entrada visual principal usa un asset handwritten llamado `pedido-personalizado`.

Para piezas disponibles, conviene reforzar:

- pieza intervenida/terminada a mano
- tirada inicial
- estuche de coleccion cuando aplique
- ilustracion/tarjeta incluida cuando aplique
- envio nacional incluido
- total internacional con envio incluido, sujeto a confirmacion

## 12. Operacion y cuidado del proyecto

Juan viene invirtiendo mucho tiempo, energia y dinero en Simio Plateado. El proyecto ya tuvo crisis importantes: botones de pago que no funcionaban, ausencia de ventas pese a trafico, Tripo fallando al inicio, performance colapsada, dudas con envios internacionales y anuncios. El agente nuevo debe trabajar con cuidado: ejecutar, verificar y no dar falsas certezas.

Actitud esperada:

- No reiniciar el proyecto.
- No redisenar desde cero.
- No cambiar el espiritu visual.
- No borrar assets porque parezcan redundantes sin confirmar.
- No romper performance por agregar contenido.
- No asumir que "ya quedo" sin probar.
- Si se toca checkout, probar flujo y explicar exactamente que se verifico.
- Si se toca Tripo, probar generacion real o indicar claramente si no se pudo por creditos, rate limit o API.
- Si se toca publicidad/analytics, distinguir entre configuracion, medicion y ventas reales.

## 13. Prioridades actuales de alto nivel

1. Mantener el sitio rapido y estable.
2. Mantener compras directas nacionales funcionando.
3. Hacer que encargos personalizados con Tripo3D sean confiables y promocionables.
4. Abrir internacional sin mostrar envios como linea que devalua la pieza: usar totales con envio incluido y cotizacion final por email.
5. Seguir incorporando piezas nuevas sin desordenar catalogo ni romper escalas visuales.
6. Mejorar conversion sin traicionar la estetica.
7. Mantener orden interno para pedidos, emails, links de pago, modelos GLB/STL y seguimiento.

## 14. Primeros archivos a revisar en un chat nuevo

Antes de hacer cambios:

```bash
cd "/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado"
sed -n '1,220p' BRIEF_V24_HANDOFF_GENERAL_SIMIO_PLATEADO_2026-06-28.md
sed -n '1,220p' BRIEF_MIGRACION_SIMIO_PLATEADO_2026-05-28.md
sed -n '1,220p' BRIEF_V21_ENCARGOS_TRIPO3D.md
sed -n '1,220p' BRIEF_V22_PERFORMANCE_AUDIT.md
sed -n '1,220p' BRIEF_V20_CHECKOUT_INTERNACIONAL.md
git status --short
```

Luego revisar segun tarea:

- Catalogo/UI:
  `mockups/index.html`
  `mockups/assets/optimized/app.753508aced.js`

- Worker/API:
  `workers/simio-sondeo/worker.js`
  `workers/simio-sondeo/wrangler.toml`

- Assets:
  `assets/`
  `mockups/assets/`
  `mockups/assets/optimized/`

## 15. Advertencia final

Simio Plateado no necesita un agente que lo "mejore" hacia lo generico. Necesita continuidad, precision, sensibilidad visual, verificacion tecnica y sentido comercial. Cada cambio debe proteger la rareza del proyecto y al mismo tiempo hacerlo mas comprable, mas confiable y mas rapido.

