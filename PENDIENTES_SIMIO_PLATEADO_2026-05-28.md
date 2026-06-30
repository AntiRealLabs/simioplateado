# Pendientes Simio Plateado · 2026-05-28

Fuente maestra revisada: `/Users/elmackinon/Library/Mobile Documents/com~apple~CloudDocs/ANTI/Assets SIMIO`.

## Integrado hoy

- Títulos handwritten reales en la página para `ARTURITO_EMO.v01`, `GRAMSCITO.v01`, `LACANCITO.v01 / SINTOMIN` y `CAPITAN_NAUSEA.v01`.
- Assets copiados a `assets/processed/textos/` y `mockups/assets/processed/textos/`.
- `Precio de lanzamiento` quedó disponible como asset procesado, pero no insertado en UI para no romper el tono de galería.
- Inventario doctrinal actualizado en `doctrina/inventario-assets.md`.
- Pasada curatorial 2026-05-29: recorte de aire transparente en nombres nuevos, piezas de cola y `KRAKEN_FLORERO`; escala puntual para piezas horizontales del catálogo.
- Página publicada en Cloudflare Pages tras cada tanda visual aprobada.
- QA producción 2026-05-29: rutas limpias, filtros, cambio Galería/Tienda, modales representativos, validación de checkout y móvil revisados sin fallos bloqueantes.
- Doctrina/legal 2026-05-29: términos, privacidad, protocolo de despacho, notas de precios y ESPEJO alineados con Mercado Pago/COP como flujo transaccional vigente.
- Worker/Central 2026-05-29: auditoría no destructiva OK (`/api/checkout` CORS, error controlado, Central 401 sin credenciales, secretos críticos presentes, `wrangler deploy --dry-run` exitoso).
- `MARXITO.v01` 2026-05-29: STL fuente convertido a GLB web-ready, validado, conectado al modal y publicado en producción.
- Serie `LITERATOS` 2026-05-29: `AGENTE_KAFKA`, `BICHO_K`, `DOSTOIECITO`, `GABITO`, `POESITO`, `CRAFSITO`, `CTHULITO` y `KOWSKITO` procesados como assets web, incorporados a galería con filtro propio y modal curatorial común.
- Modelos 3D literarios 2026-05-29: `BICHO_K`, `DOSTOIECITO`, `GABITO`, `POESITO`, `CRAFSITO` y `CTHULITO` optimizados como GLB web-ready y conectados al modal; `DOSTOIECITO` y `POESITO` suman estudios visuales alternos. `LACANCITO/SINTOMIN` también queda conectado a visor 3D.
- Ajuste visual 2026-05-30: `KRAKEN_FLORERO` verificado en galería/tienda, `CAPITAN_NAUSEA` gana presencia en su recuadro, y la cabecera de Tienda queda sin cruce entre título y texto.
- Conversión 2026-05-30: tienda reduce fricción hacia pago; los botones `Comprar ahora` llevan directo al formulario, los modales comprables suman CTA superior a Mercado Pago y Meta Pixel mide `ViewContent`, `AddToCart`, `InitiateCheckout`, retorno de checkout y `Purchase` cuando hay retorno exitoso con sesión previa.
- Operación 2026-05-30: Worker publicado con KV dedicado `SIMIO_ORDERS`; checkout y Central mantienen CORS/autorización correctos, y `planti s y xl plantas.heic` quedó convertido a PNG procesado en `assets/` y `mockups/assets/`.
- QA producción 2026-05-30: desktop y móvil revisados en `simioplateado.com/tienda`; tienda → `KRAKEN_FLORERO` → formulario funciona, sin errores de consola, sin imágenes rotas y sin overflow horizontal.
- Nuevos físicos 2026-05-31: `WU_TANG_OSITO.v01`, `VASIJA_ATLAS.v01` y `4_MONOS.v01` quedan en galería como piezas gestándose, con foto real procesada, handwritten real y modal de interés; los slugs viejos (`goti-monda`, `mondigotica`, `juntitos`) se conservan como alias.
- Handwritten 2026-05-31: `ESPON_G.v01` queda procesado en assets como texto listo, pero sin ficha pública hasta tener foto/curaduría final.
- `SUPERHOMBRESITO.v01` 2026-05-31: se suma foto de variante rosa con caja dentro de su perfil, como versión más del objeto.
- Revisión 3D 2026-05-31: `gotimonda.3mf` se pudo convertir a GLB web, pero el modelo no corresponde visualmente a la pieza dorada publicada; se deja fuera de la ficha pública para evitar un visor falso.

## Pendientes prioritarios

1. Confirmar nombres públicos finales: `GRAMSCITO` vs. `LUCHA_LIBRE_DE_CLASES`; `LACANCITO` vs. `SINTOMIN`.
2. Verificar Central/KV con una orden real pagada: checkout abre Mercado Pago y `SIMIO_ORDERS` ya está enlazado, pero falta confirmar persistencia visible, webhook completo y evento post-pago real con pago aprobado.
3. Generar/optimizar GLB para `GRAMSCITO`, `CAPITAN_NAUSEA`, `WU_TANG_OSITO`, `VASIJA_ATLAS`, `4_MONOS` y `ESPON_G` solo con fuente 3D validada; no publicar modelos que no correspondan a la foto real.
4. Definir curaduría/comercialización de `LITERATOS`: nombres finales, derechos de imagen, textos visibles, marcas, prioridad de pieza física y decisión sobre `AGENTE_KAFKA` / `KOWSKITO` sin GLB.
5. Completar ficha comercial, precio y decisión de venta/preorder para `WU_TANG_OSITO`, `VASIJA_ATLAS` y `4_MONOS`; definir si `ESPON_G` entra a galería cuando tenga foto pública.
6. Decidir curaduría de nuevos assets no publicados: `Idealito.v01`, `NIO 2`, `Parejita`, `Anti Minis`, `Monda Flex`.

## No hacer sin decisión curatorial

- No meter todos los assets de iCloud al catálogo por volumen.
- No convertir ilustraciones en productos sin ficha.
- No usar `Precio de lanzamiento` como sticker visible si vuelve la página más comercial de lo que pide el brief.
- No renombrar slugs del Worker hasta confirmar nomenclatura final.
