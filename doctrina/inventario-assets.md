# Inventario visual de assets · Simio Plateado

Estado de los tres assets esenciales por pieza:

1. **Dibujo / texto** — nombre handwritten dibujado por Juan y procesado en `assets/processed/textos/`.
2. **Imagen sin fondo** — figurita del producto generada con AI + procesada en `assets/processed/piezas/` (o `assets/processed/planti/` para los PLANTI).
3. **Modelo 3D** — archivo `.glb` generado en Tripo / Meshy y guardado en `assets/models/`.

**Convenciones**: ✓ = existe procesado · — = no existe aún · ⚠ = existe pero pendiente de revisar.

---

## Actualización 2026-05-31 · nuevos físicos en galería

- `WU_TANG_OSITO.v01`, `VASIJA_ATLAS.v01` y `4_MONOS.v01` quedan visibles en galería como piezas gestándose, con foto real procesada en `assets/processed/piezas/nuevas/`, handwritten real en `assets/processed/textos/` y espejo público en `mockups/assets/`.
- `SUPERHOMBRESITO.v01` suma la variante rosa con caja (`nietzschesito-rosa-caja.jpg`) dentro de su perfil, sin reemplazar la ficha ni el modelo existente.
- `ESPON_G.v01` queda con handwritten procesado (`esponja-g.png`) pero sin ficha pública hasta tener imagen/curaduría final.
- Se probó conversión de `gotimonda.3mf` a GLB web y corrección de eje Z-up → Y-up, pero el resultado no corresponde visualmente a la pieza dorada fotografiada. No se conecta a la ficha pública.
- `VASIJA_ATLAS` y `4_MONOS` quedan foto-only hasta encontrar fuente 3D correcta; los GLB/STL disponibles no deben usarse como visor público si no empatan con la pieza real.

---

## Actualización 2026-05-30 · cierre técnico de operación

- Worker `simio-sondeo` publicado con binding dedicado `SIMIO_ORDERS` (`249ad5802df3450392255c1bffd57bb1`) para separar órdenes de votos/preorders.
- Verificación no destructiva de producción: `/api/checkout` responde CORS `204` en preflight, valida checkout con `400 email_invalido`, y `/api/central/orders` mantiene `401 unauthorized` sin credenciales.
- `planti s y xl plantas.heic` convertido a PNG procesado en `assets/processed/planti/planti-s-xl-plantas.png` y `mockups/assets/processed/planti/planti-s-xl-plantas.png`.
- QA producción desktop/mobile posterior a conversión: tienda, modal de `KRAKEN_FLORERO`, CTA de Mercado Pago, foco en formulario, imágenes y overflow horizontal revisados sin fallos bloqueantes.

---

## Actualización 2026-05-29 · limpieza curatorial de galería

Se hizo una pasada visual sobre la grilla pública para reducir aire interno y unificar presencia material sin cambiar la filosofía del sitio.

- Recortados por transparencia: textos de `ARTURITO_EMO`, `GRAMSCITO`, `SINTOMIN`, `CAPITAN_NAUSEA`, `KRAKEN_FLORERO`, `JARRON_PULPO` y `PRECIO_LANZAMIENTO`.
- Recortadas piezas de cola: `arturito.png`, `gramscito.png`, `lacanito.png` y `capitan-nausin.png`.
- Ajustada escala CSS de catálogo para piezas horizontales: `MINI_DEVENIRES`, `PARCHAO`, `MELISIMO` y audífonos imposibles.
- La página usa cachebusters `20260529-crop` / `20260529-curatorial` donde el navegador podía conservar assets previos.

---

## Actualización 2026-05-28 · fuente maestra iCloud

Fuente revisada:

`/Users/elmackinon/Library/Mobile Documents/com~apple~CloudDocs/ANTI/Assets SIMIO`

Estado de lectura: accesible desde Codex, 79 archivos detectados en `Assets SIMIO` + subcarpeta `ilustraciones/`. También existe `/Users/elmackinon/Library/Mobile Documents/com~apple~CloudDocs/ANTI/logos simio`.

### Integrado al repo y a la maqueta

| Asset fuente | Destino web | Uso actual |
|---|---|---|
| `Arturito emo texto.png` | `assets/processed/textos/arturito-emo.png` + `mockups/assets/processed/textos/arturito-emo.png` | Título handwritten de `ARTURITO_EMO.v01` en grilla y modal. |
| `lucha libre de clases texto.png` | `assets/processed/textos/gramscito.png` + `mockups/assets/processed/textos/gramscito.png` | Título handwritten de `GRAMSCITO.v01` / Lucha Libre de Clases en grilla y modal. |
| `Sintomin texto.png` | `assets/processed/textos/sintomin.png` + `mockups/assets/processed/textos/sintomin.png` | Título handwritten de `LACANCITO.v01` / Sintomin en grilla y modal. |
| `capitán nausea texto.png` | `assets/processed/textos/capitan-nausea.png` + `mockups/assets/processed/textos/capitan-nausea.png` | Título handwritten de `CAPITAN_NAUSEA.v01` en grilla y modal. |
| `Precio de lanzamiento .png` | `assets/processed/textos/precio-lanzamiento.png` + `mockups/assets/processed/textos/precio-lanzamiento.png` | Recurso disponible; no insertado en página para evitar ruido comercial. |

La página ya no usa texto digital temporal para los cuatro autores nuevos de GRANDES/MENTES. Se conserva la regla visual del brief: nombres dibujados reales cuando existen, texto digital solo como dato/código.

### Pendiente de curaduría antes de entrar a página

| Asset fuente | Estado | Decisión pendiente |
|---|---:|---|
| `Idealito.v01` | PNG sin extensión, legible | Confirmar nombre, familia, estado y si entra como nueva pieza o queda en cola. |
| `NIO 2 SIN FONDO.png` | PNG sin fondo | Confirmar nombre, ficha, precio/estado y relación con Drop 001. |
| `mondigotica sin fondo.png` / `mondigotica sin fondo frente.png` | PNG sin fondo | La ficha pública ya usa foto real; no conectar `mondigotica.glb` hasta validar que corresponda a la pieza. |
| `parejita real sin fondo` | PNG sin extensión | Confirmar si pertenece a ESPEJO Plateado, tienda personalizada o archivo de proceso. |
| `anti minis sin fondo.png` | PNG sin fondo | Definir si es producto, collage/archivo o recurso de sistema. |
| `ilustraciones/monda flex *.png` | PNGs de ilustración | Definir sección/uso; no mezclar con catálogo de piezas sin decisión curatorial. |
| `perfil simio.heic` / `portada simio` | HEIC | Convertir a PNG/WebP solo si se usan como perfil/portada pública. |
| `audifonos sin fondo.heic` / `parchao sin fondo.heic` | HEIC | Convertir a PNG si se vuelven fuente canónica; hoy existen variantes PNG ya usadas. |
| `planti s y xl plantas.heic` | HEIC + PNG procesado | Convertido como respaldo procesado; no conectado a página porque las variantes PLANTI canónicas ya existen. |
| `simiochi_assembly_preview_v01_fixed.stl` | STL | Definir si es pieza futura; si va a visor web, convertir/optimizar a GLB. |

### Pendientes técnicos reales tras esta actualización

1. Confirmar nomenclatura pública final de `GRAMSCITO.v01` vs. `LUCHA_LIBRE_DE_CLASES` y `LACANCITO.v01` vs. `SINTOMIN`.
2. Producir o conseguir GLB web-ready para `GRAMSCITO` y `CAPITAN_NAUSEA` si van a tener visor 3D; `LACANCITO/SINTOMIN` ya usa `sintomin.glb`.
3. Completar fuente 3D validada y ficha comercial para `WU_TANG_OSITO`, `VASIJA_ATLAS` y `4_MONOS`; ya entraron a galería como piezas gestándose con foto real y handwritten.
4. Decidir si `Idealito`, `NIO`, `Parejita`, `Anti Minis` y las ilustraciones `Monda Flex` entran al sitio o quedan como archivo interno.
5. Confirmar persistencia live de órdenes con una compra pagada: checkout, KV dedicado y Central están listos, pero falta validar webhook/estado final con pago aprobado.

---

## Actualización 2026-05-19 · assets integrados y faltantes

Se integraron modelos 3D optimizados para web en `mockups/assets/models/` y se completaron variantes visuales faltantes de PLANTI en `mockups/assets/processed/planti/`. También se procesó el texto handwritten de `SUPERHOMBRESITO` y la página ya no usa el texto de `nietzschito` para esa pieza.

### Piezas ya visibles en la página

| Pieza | Imagen web | Texto handwritten | 3D web | Faltante / nota |
|---|:---:|:---:|:---:|---|
| TUNI.v01.NEGRA | ✓ | ✓ | ✓ | Modelo actualizado desde GLB crudo y optimizado como `tuni-negra.glb` con compresión web-compatible. |
| TUNI.v01.BLANCA | ✓ | ✓ | ✓ | Modelo actualizado desde GLB crudo y optimizado como `tuni-blanca.glb` con compresión web-compatible. |
| TUNI.v01.ROSA | ✓ | ✓ | ✓ | Modelo actualizado desde GLB crudo y optimizado como `tuni-rosa.glb` con compresión web-compatible. |
| COPA_CHISTE_COLOMBIA.v0 | ✓ | ✓ | ✓ | Modelo actualizado desde `trofeo chiste colombia glb.glb` y optimizado con compresión web-compatible. |
| MARXITO.v01 | ✓ | ✓ | ✓ | STL fuente convertido y conectado como `mockups/assets/models/marxito.glb`. |
| SUPERHOMBRESITO.v01 | ✓ | ✓ | ✓ | Texto corregido a `superhombresito.png`; el modelo visible sigue como `nietzschito.glb`. |
| DIALOGUIN.v01 | ✓ | ✓ | ✓ | Modelo actualizado/optimizado desde `dialogin glb.glb` con compresión web-compatible. |
| TRAUMIN.v01 | ✓ | ✓ | ✓ | Modelo actualizado/optimizado desde `traumin glb.glb` con compresión web-compatible. |
| MINI_DEVENIRES.v01 | ✓ | ✓ | ✓ | Modelo actualizado/optimizado desde `mini+devenires+3d+excelente.glb` con compresión web-compatible. |
| PLANTI_PUNK.v01 | ✓ | ✓ | — | Ya están barro/obsidiana/silicona en assets públicos; falta GLB si se quiere visor 3D. |
| PLANTI_PUNK_XL.v01 | ✓ | ✓ | — | Ya están barro/obsidiana/silicona en assets públicos; falta GLB si se quiere visor 3D. |
| PLANTI_K.v01 | ✓ | ✓ | — | Ya están barro/obsidiana/silicona en assets públicos; falta GLB si se quiere visor 3D. |
| PLANTI_K_XL.v01 | ✓ | ✓ | — | Ya están barro/obsidiana/silicona en assets públicos; falta GLB si se quiere visor 3D. |
| Camiseta blanca | ✓ | ✓ | — | Falta modelo 3D si se quiere visor; producto puede funcionar bien solo con foto. |
| Camiseta negra | ✓ | ✓ | — | Falta modelo 3D si se quiere visor; producto puede funcionar bien solo con foto. |
| Gorra | ✓ | ✓ | — | Falta modelo 3D si se quiere visor; producto puede funcionar bien solo con foto. |
| PARCHAO.v01 | ✓ | ✓ | — | Falta GLB web-ready. No se encontró modelo 3D completo de PARCHAO en los nuevos assets. |
| MELISIMO.v01 | ✓ | ✓ | ✓ | Modelo actualizado/optimizado desde `GAFAS MELISIMO GLB.glb` con compresión web-compatible. |
| AUDIO.ANTROPOS.v02 | ✓ | ✓ | — | Exhibición digital; no requiere 3D salvo decisión futura. |
| AUDIO.NEO.v02 | ✓ | ✓ | — | Exhibición digital; no requiere 3D salvo decisión futura. |
| AUDIO.OIMIS.v02 | ✓ | ✓ | — | Exhibición digital; no requiere 3D salvo decisión futura. |

### Nuevos assets cargados en cola

| Asset / posible pieza | Imagen web | Texto handwritten | 3D / STL | Recomendación |
|---|:---:|:---:|:---:|---|
| ARTURITO.v01 | ✓ | ✓ | ✓ | Imagen ordenada como `processed/piezas/cola/arturito.png`, nombre procesado y GLB optimizado como `arturito.glb`; falta decisión de ficha/drop. |
| SINTOMIN.v01 / LACANCITO | ✓ | ✓ | ✓ | Imagen ordenada como `processed/piezas/cola/lacanito.png`, nombre procesado y GLB optimizado como `sintomin.glb`; falta decisión de ficha/drop. |
| LUCHA_LIBRE_DE_CLASES.v01 / GRAMSCITO | ✓ | ✓ | — | Imagen ordenada como `processed/piezas/cola/gramscito.png` y nombre procesado; falta GLB y decisión de ficha/drop. |
| CAPITAN_NAUSEA.v01 | ✓ | ✓ | — | Imagen ordenada como `processed/piezas/cola/capitan-nausin.png` y nombre procesado; falta GLB y decisión de estado. |
| WU_TANG_OSITO.v01 | ✓ | ✓ | ⚠ | Antes `GOTI_MONDA`; foto real integrada como `processed/piezas/nuevas/goti-monda-real.jpg` y texto como `processed/textos/osito-wu-tang.png`. El `gotimonda.3mf` convierte, pero no corresponde visualmente a esta pieza, así que no va como visor público. |
| VASIJA_ATLAS.v01 | ✓ | ✓ | ⚠ | Antes `MONDIGOTICA`; foto real integrada como `processed/piezas/nuevas/mondigotica-real.jpg` y texto como `processed/textos/vasija-atlas.png`. Los modelos disponibles quedan pendientes de validación visual antes de conectar visor. |
| ESPON_G.v01 / G_SPONJA | — | ✓ | ⚠ | Existe STL (`G sponja lista pa go.stl`) y texto procesado como `processed/textos/esponja-g.png`; falta PNG/foto de galería y, si va al visor web, conversión/optimización a GLB. |
| 4_MONOS.v01 | ✓ | ✓ | ⚠ | Antes `JUNTITOS`; foto real integrada como `processed/piezas/nuevas/juntitos-real.jpg` y texto como `processed/textos/juntitos.png`. El STL disponible no corresponde a los cuatro simios de la foto, por ahora ficha foto-only. |
| Elefante oscuro / nombre pendiente | ⚠ | — | — | Existe `F85C5309-D7C0-42D2-A149-85E836A859EF.jpeg`; falta nombre, texto handwritten, recorte/PNG transparente y 3D si se vuelve pieza. |

### Serie LITERATOS · incorporada 2026-05-29

| Pieza | Imagen web | Variantes visuales | 3D / STL | Recomendación |
|---|:---:|:---:|:---:|---|
| AGENTE_KAFKA.v01 | ✓ | — | — | Imagen web integrada; falta GLB si se decide ficha 3D propia. Revisar nombre/derechos antes de producción física. |
| BICHO_K.v01 | ✓ | — | ✓ | GLB optimizado como `literatos/bicho-k.glb` y STL fuente como `literatos/bicho-k.stl`; falta validar impresión física. |
| DOSTOIECITO.v01 | ✓ | ✓ | ✓ | GLB optimizado como `literatos/dostoiecito.glb`; estudio alterno `dostoiecito-gemini.png` integrado en modal. |
| GABITO.v01 | ✓ | — | ✓ | GLB optimizado como `literatos/gabito.glb`; revisar derechos de imagen/nombre antes de producción. |
| POESITO.v01 | ✓ | ✓ | ✓ | GLB optimizado como `literatos/poesito.glb`; variantes `poesito-lil.png` y `poemo.png` integradas en modal. |
| CRAFSITO.v01 | ✓ | — | ✓ | GLB optimizado como `literatos/crafsito.glb`; decidir si va solo o como dupla con `CTHULITO`. |
| CTHULITO.v01 | ✓ | — | ✓ | GLB optimizado como `literatos/cthulito.glb`; revisar fragilidad de alas/tentáculos si pasa a pieza física. |
| KOWSKITO.v01 | ✓ | — | — | Imagen web integrada; falta GLB y revisión de marcas/textos visibles. |

### Textos dibujados sin producto visible todavía

| Texto | Estado | Nota |
|---|:---:|---|
| `kemopev.png` | ✓ | Título/recurso doctrinal; no está asociado a una pieza de tienda. |
| `qmpev.png` | ✓ | Título/recurso doctrinal; no está asociado a una pieza de tienda. |
| `acentos-flotantes-hoja.png` | ✓ | Recurso auxiliar; no es producto individual visible. |
| `destruyelo-todo.png` | ✓ | Recurso de manifiesto/home. |
| `imposible.png` | ✓ | Sello/categoría para piezas digitales. |

Tipografía/dibujo canónico para nuevos nombres: **Boligrafos-Sanderling al 20% de grosor**, manteniendo el gesto handwritten de los assets actuales.

---

Las tablas históricas siguientes se conservan como trazabilidad del inventario creado el 2026-05-12. Para decisiones actuales, usar primero la actualización del 2026-05-19.

## Drop 001 · Piezas escultóricas

| Pieza                              | Texto handwritten | Imagen sin fondo | Modelo 3D | Notas                                            |
|-----------------------------------|:-----------------:|:----------------:|:---------:|--------------------------------------------------|
| TUNI.v01.ROSA                      | ✓                 | ✓                | ⚠         | texto handwritten compartido entre las 3 variantes; 3 copias crudas idénticas del GLB, falta optimizar/integrar |
| TUNI.v01.BLANCA                    | ✓                 | ✓                | —         | mismo texto handwritten que rosa                   |
| TUNI.v01.NEGRA                     | ✓                 | ✓                | —         | mismo texto handwritten que rosa                   |
| COPA_CHISTE_COLOMBIA.v0            | ✓                 | ✓                | —         |                                                  |
| MARXITO.v01                        | ✓                 | ✓                | —         |                                                  |
| SUPERHOMBRESITO.v01                | ✓                 | ✓                | ✓         | los dos crudos `nietzschito.glb` y `Meshy_AI...glb` son idénticos; producción usa versión optimizada |
| DIALOGUIN.v01                      | ✓                 | ✓                | ✓         |                                                  |
| TRAUMIN.v01                        | ✓                 | ✓                | ✓         |                                                  |
| MINI_DEVENIRES.v01                 | ✓                 | ✓                | ✓         |                                                  |
| PLANTI_PUNK.v01                    | ✓                 | ✓                | —         | 3 variantes de material (barro/obsidiana/silicona) |
| PLANTI_PUNK_XL.v01                 | ✓                 | ✓                | —         | 3 variantes de material                            |
| PLANTI_K.v01                       | ✓                 | ✓                | —         | 3 variantes de material                            |
| PLANTI_K_XL.v01                    | ✓                 | ✓                | —         | 3 variantes de material                            |

---

## Wearables

| Pieza                | Texto handwritten | Imagen sin fondo | Modelo 3D | Notas                                       |
|----------------------|:-----------------:|:----------------:|:---------:|---------------------------------------------|
| Camiseta blanca      | ✓                 | ✓                | —         | recortada de "camisetas blancas sin fondo"   |
| Camiseta negra       | ✓                 | ✓                | —         |                                             |
| Gorra                | ✓                 | ✓                | —         |                                             |
| PARCHAO.v01          | ✓                 | ✓                | —         |                                             |
| MELISIMO.v01         | ✓                 | ✓                | ✓         |                                             |

---

## Imposible · Audífonos (exhibición pura)

| Pieza                | Texto handwritten | Imagen sin fondo | Modelo 3D | Notas                          |
|----------------------|:-----------------:|:----------------:|:---------:|--------------------------------|
| AUDIO.ANTROPOS.v02   | ✓                 | ✓                | —         | (audífonos-tribu)               |
| AUDIO.NEO.v02        | ✓                 | ✓                | —         | (udifonos 1)                    |
| AUDIO.OIMIS.v02      | ✓                 | ✓                | —         | (audífonos-simio)               |

---

## Club de filósofos · En cola para drop futuro

Sub-categoría emergente (no entran en V0.10, esperan a tener 10-12 piezas para drop dedicado).

| Pieza                | Texto handwritten | Imagen sin fondo | Modelo 3D | Notas                                                          |
|----------------------|:-----------------:|:----------------:|:---------:|----------------------------------------------------------------|
| ARTURITO.v01 (Schopenhauer emo) | ✓      | ✓                | ✓         | Imagen, texto y `arturito.glb` ya están procesados e integrados en cola visual; falta decisión de ficha/drop |
| SCHOPITO.v01 (versión normal) | —        | —                | —         | concepto descartado a favor de ARTURITO emo                     |
| SINTOMIN.v01 / LACANCITO | ✓            | ✓                | ✓         | Imagen, texto y `sintomin.glb` ya están procesados e integrados; falta decisión de nombre/ficha/drop |
| LUCHA_LIBRE_DE_CLASES.v01 / GRAMSCITO | ✓ | ✓                | —         | Imagen y texto ya están procesados e integrados; falta fuente 3D real y decisión de nombre/ficha/drop |
| SARTRECITO.v01 (pirata) | —              | —                | —         | reemplaza versión pipa-y-náusea, prompt en cola                 |
| KANTITO.v01          | —                 | —                | —         | prompt listo, imagen no generada                                |
| FOUCAULTITO.v01      | —                 | —                | —         | prompt listo, imagen no generada                                |
| SOCRATITO.v01        | —                 | —                | —         | prompt listo, imagen no generada                                |

**Cuando se genere y procese cada imagen del club**: agregar entrada a este inventario + procesar texto handwritten cuando Juan lo dibuje + entrenar modelo 3D en Tripo si aplica.

---

## Elementos visuales auxiliares (no son piezas, son recursos del sitio)

| Elemento                      | Estado        | Path                                                          |
|-------------------------------|:-------------:|---------------------------------------------------------------|
| Logo Simio Plateado (master)  | ✓             | `assets/logo-simio-plateado-master.png`                       |
| Logo negativo                 | ✓             | `assets/logo-simio-plateado-negative.png`                     |
| Logo on paper                 | ✓             | `assets/logo-simio-plateado-on-paper.png`                     |
| Logo wordmark                 | ✓             | `assets/logo-simio-plateado-wordmark.png`                     |
| Logo cara (procesado)         | ✓             | `assets/processed/logo-cara.png`                              |
| Firma JDME                    | ✓             | `assets/processed/firma-jdme.png`                             |
| Sello IRREAL grueso           | ✓             | `assets/processed/sello-irreal-grueso.png`                    |
| Sello IRREAL medio            | ✓             | `assets/processed/sello-irreal-medio.png`                     |
| Sello IRREAL delgado          | ✓ canónico    | `assets/processed/sello-irreal-delgado.png`                   |
| Sello IMPOSIBLE               | ✓             | `assets/processed/textos/imposible.png`                       |
| Acentos flotantes (7 piezas)  | ✓             | `assets/processed/acentos/acento-01.png` ... `acento-07.png`  |
| Título "Destrúyelo todo"      | ✓             | `assets/processed/textos/destruyelo-todo.png`                 |
| Título "KEMOPEV"              | ✓             | `assets/processed/textos/kemopev.png`                         |
| Título "QMPEV"                | ✓             | `assets/processed/textos/qmpev.png`                           |

---

## Resumen estadístico

**Drop 001 escultórico** (13 piezas, contando 3 TUNI):
- Texto handwritten: 13/13 (100%)
- Imagen sin fondo: 13/13 (100%)
- Modelo 3D: 5/13 (38%) — falta TUNI blanca y negra, COPA, MARXITO, los 4 PLANTI

**Wearables** (5 piezas):
- Texto handwritten: 5/5 (100%)
- Imagen sin fondo: 5/5 (100%)
- Modelo 3D: 1/5 (20%) — solo MELISIMO

**Imposible · Audífonos** (3 piezas):
- Texto handwritten: 3/3 (100%)
- Imagen sin fondo: 3/3 (100%)
- Modelo 3D: 0/3 (0%)

**TOTAL Drop 001 + Wearables + Imposible**: 21 piezas confirmadas
- Texto handwritten: 21/21 (100%)
- Imagen sin fondo: 21/21 (100%)
- Modelo 3D: 6/21 (29%)

**Club de filósofos** (8 piezas en cola):
- Texto handwritten: 3/8 (37.5%) — ARTURITO, SINTOMIN/LACANCITO y LUCHA_LIBRE_DE_CLASES/GRAMSCITO ya tienen nombre procesado
- Imagen sin fondo: 3/8 (37.5%) — ARTURITO, SINTOMIN/LACANCITO y LUCHA_LIBRE_DE_CLASES/GRAMSCITO ya están procesados para web
- Modelo 3D: 2/8 (25%) — ARTURITO y SINTOMIN/LACANCITO ya tienen GLB optimizado e integrado

---

## Tareas pendientes derivadas de este inventario

1. **Modelos 3D faltantes** (prioridad para producción):
   - Generar 3D de TUNI variantes blanca y negra (o usar el modelo rosa con cambio de color de filamento); conservar solo una copia cruda del GLB rosa y optimizarla para producción
   - Generar 3D de COPA, MARXITO, los 4 PLANTI
   - Generar 3D de wearables: PARCHAO, GORRA, camisetas (las wearables 3D son complicadas, evaluar caso por caso si tiene sentido)
   - Generar 3D de los 3 audífonos IMPOSIBLE (aunque por ser exhibición pura, podrían quedar solo en imagen)

2. **Decisión SUPERHOMBRESITO**: los dos archivos crudos (`nietzschito.glb` y `Meshy_AI_Ubermensch_Mechanic_0510042713_generate.glb`) tienen el mismo hash, así que son duplicados exactos. Mantener uno como fuente y usar `mockups/assets/models/nietzschito.glb` como versión canónica de producción.

3. **ARTURITO**: ya tiene PNG, nombre handwritten y GLB integrado. Solo queda decidir si entra al Drop 001 o espera el drop de filósofos.

4. **SINTOMIN/LACANCITO y LUCHA_LIBRE_DE_CLASES/GRAMSCITO**: ya tienen imagen y nombre procesados. SINTOMIN/LACANCITO también tiene GLB; GRAMSCITO sigue sin fuente 3D real.

5. **Textos handwritten restantes del club de filósofos**: quedan pendientes los que aún no tienen nombre dibujado ni decisión de ficha, como SARTRECITO, KANTITO, FOUCAULTITO y SOCRATITO.

---

*Archivo creado 2026-05-12. Mantener actualizado a medida que se agreguen piezas / se procesen assets.*
