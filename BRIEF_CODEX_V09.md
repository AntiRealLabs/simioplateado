# Brief Codex · V0.9 · Integración de títulos handwritten

**Para:** Codex CLI (mismo agente del deploy inicial)
**De:** Juan / Cowork Simio Plateado
**Fecha:** 2026-05-10
**Status del proyecto:** simioplateado.com está vivo con V0.8. Funciona, pero todavía usa JetBrains Mono (placeholder digital) para los nombres de las piezas. La doctrina canónica dice que los nombres deben ser **handwritten** (Boligrafos-Sanderling al 20% de grosor — interpretado por ahora como el dibujo a mano alzada hecho por Juan).

Los PNGs ya están procesados (alfa, recortados, negro forzado). Esta tarea es **un swap visual quirúrgico**: cambiar el texto digital por imágenes en los lugares correctos, sin romper nada más.

---

## Filosofía de esta versión

V0.9 es **conservadora**. No agrega piezas, no cambia copy, no toca el sondeo (eso va en `BRIEF_CODEX_SONDEO.md` aparte). Solo sustituye texto digital por handwritten en los puntos donde la doctrina ya lo exige:

1. **Códigos en el grid del drop** (cada tile tiene un código tipo `TUNI.v01.ROSA` que debe convertirse en imagen handwritten).
2. **Títulos grandes dentro de los modales explosionados** (`<h3 class="exp-titulo">`).
3. **Título de sección "Destrúyelo todo"** (`<h3>` dentro de `section.ensayo-destruyelo`).

Lo que NO se toca en V0.9:
- El badge `.codigo-pieza` arriba a la derecha de cada modal (eso es metadata técnica de breadcrumb, se queda en JetBrains Mono).
- Los sufijos de variante (`.ROSA`, `.BLANCA`, `.NEGRA`) — se conservan en pequeño abajo del nombre handwritten en un peso mono ligero, como "metadata".
- Los handlers JS de voto (`votarEmail`, `votarSilencio`) — esos van en el brief del sondeo.
- Cualquier copy escrito por Juan.
- La estructura del grid, número de piezas, modales, ensayos.
- El home (logo + frase ancla).

---

## Tarea 1 · Agregar regla CSS para imágenes-título

En el `<style>` del archivo deployado, agregar (cerca de las reglas `.pieza .meta .codigo` y `.exp-titulo`):

```css
/* === Títulos handwritten === */
.pieza .meta .codigo img.codigo-hand {
  display: block;
  height: 1.6rem;        /* equivalente visual al peso del JetBrains Mono que sustituye */
  width: auto;
  max-width: 100%;
  object-fit: contain;
  margin-bottom: 0.15rem;
}
.pieza .meta .codigo .variante {
  display: block;
  font-family: "JetBrains Mono", "Menlo", "Courier New", monospace;
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  opacity: 0.7;
  text-transform: uppercase;
}

.exp-titulo img.exp-titulo-hand {
  display: block;
  height: clamp(2.4rem, 5.5vw, 4rem);
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

/* Ajuste para que .exp-titulo no aplique font-size sobre la imagen */
.exp-titulo:has(img.exp-titulo-hand) {
  line-height: 1;
}

.titulo-handwritten-seccion {
  display: block;
  height: clamp(2.4rem, 5vw, 3.8rem);
  width: auto;
  max-width: 100%;
  object-fit: contain;
  margin-bottom: 1.5rem;
}

@media (max-width: 720px) {
  .pieza .meta .codigo img.codigo-hand {
    height: 1.4rem;
  }
}
```

Si las reglas existentes para `.codigo` o `.exp-titulo` aplican `font-size`, `font-family` o `letter-spacing` directamente sobre el contenido (y eso afecta a la imagen visualmente — no debería, pero por las dudas), revisar y dejar la imagen limpia.

---

## Tarea 2 · Reemplazos en el grid del drop

En el bloque `<div class="pieza-grid">` hay 9 tiles. En cada uno, el `<div class="codigo">XXXXX</div>` se reemplaza así:

| Tile actual (texto)          | Reemplazo                                                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `TUNI.v01.ROSA`              | `<img class="codigo-hand" src="assets/processed/textos/tuni.png" alt="Tuni"><span class="variante">.v01 · ROSA</span>`      |
| `TUNI.v01.BLANCA`            | `<img class="codigo-hand" src="assets/processed/textos/tuni.png" alt="Tuni"><span class="variante">.v01 · BLANCA</span>`   |
| `TUNI.v01.NEGRA`             | `<img class="codigo-hand" src="assets/processed/textos/tuni.png" alt="Tuni"><span class="variante">.v01 · NEGRA</span>`    |
| `COPA_CHISTE_COLOMBIA.v0`    | `<img class="codigo-hand" src="assets/processed/textos/copa-colombia.png" alt="Copa Colombia"><span class="variante">.v0</span>` |
| `MARXITO.v01`                | `<img class="codigo-hand" src="assets/processed/textos/marxito.png" alt="Marxito"><span class="variante">.v01</span>`      |
| `PLANTI_PUNK.v01`            | `<img class="codigo-hand" src="assets/processed/textos/planti-punk.png" alt="Planti Punk"><span class="variante">.v01</span>` |
| `PLANTI_PUNK_XL.v01`         | `<img class="codigo-hand" src="assets/processed/textos/planti-punk-xl.png" alt="Planti Punk XL"><span class="variante">.v01</span>` |
| `PLANTI_K.v01`               | `<img class="codigo-hand" src="assets/processed/textos/planti-k.png" alt="Planti K"><span class="variante">.v01</span>`    |
| `PLANTI_K_XL.v01`            | `<img class="codigo-hand" src="assets/processed/textos/planti-k-xl.png" alt="Planti K XL"><span class="variante">.v01</span>` |

**Nota importante**: las tres variantes de TUNI (rosa/blanca/negra) usan el **mismo** `tuni.png`. La diferenciación visual ya la da la imagen del piece dentro del frame, y el sufijo `.ROSA` / `.BLANCA` / `.NEGRA` queda como metadata pequeña debajo del nombre handwritten.

Mantener el resto del `.meta` (`.nota`, `.precio`, `.estado`) intacto.

---

## Tarea 3 · Reemplazos en los modales explosionados

Hay 7 modales (`#modal-tuni`, `#modal-copa`, `#modal-marxito`, `#modal-punk`, `#modal-punk-xl`, `#modal-k`, `#modal-k-xl`). En cada uno hay un `<h3 class="exp-titulo">XXX</h3>`. Reemplazar así:

| Modal           | `<h3 class="exp-titulo">` actual | Reemplazo                                                                                          |
| --------------- | ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `#modal-tuni`   | `TUNI.v01`                       | `<img class="exp-titulo-hand" src="assets/processed/textos/tuni.png" alt="TUNI.v01">`             |
| `#modal-copa`   | `COPA_CHISTE_COLOMBIA.v0`        | `<img class="exp-titulo-hand" src="assets/processed/textos/copa-colombia.png" alt="COPA_CHISTE_COLOMBIA.v0">` |
| `#modal-marxito`| `MARXITO.v01`                    | `<img class="exp-titulo-hand" src="assets/processed/textos/marxito.png" alt="MARXITO.v01">`       |
| `#modal-punk`   | `PLANTI_PUNK.v01`                | `<img class="exp-titulo-hand" src="assets/processed/textos/planti-punk.png" alt="PLANTI_PUNK.v01">` |
| `#modal-punk-xl`| `PLANTI_PUNK_XL.v01`             | `<img class="exp-titulo-hand" src="assets/processed/textos/planti-punk-xl.png" alt="PLANTI_PUNK_XL.v01">` |
| `#modal-k`      | `PLANTI_K.v01`                   | `<img class="exp-titulo-hand" src="assets/processed/textos/planti-k.png" alt="PLANTI_K.v01">`     |
| `#modal-k-xl`   | `PLANTI_K_XL.v01`                | `<img class="exp-titulo-hand" src="assets/processed/textos/planti-k-xl.png" alt="PLANTI_K_XL.v01">` |

El `<h3 class="exp-titulo">` se conserva como contenedor (mantiene el espaciado del layout); solo cambia su contenido de texto a `<img>`.

El `.codigo-pieza` del header del modal (arriba a la derecha) **se conserva en JetBrains Mono** — sigue siendo metadata técnica de navegación, no título artístico.

---

## Tarea 4 · Título de la sección "Destrúyelo todo"

En `<section class="ensayo-destruyelo">` el `<h3>Destrúyelo todo</h3>` se reemplaza por:

```html
<h3><img class="titulo-handwritten-seccion" src="assets/processed/textos/destruyelo-todo.png" alt="Destrúyelo todo"></h3>
```

El `<h3>` se conserva como wrapper para preservar la jerarquía semántica y el espaciado.

---

## Tarea 5 · Verificar que todos los PNGs existen en el repo

Antes de hacer push, confirmar que estos archivos están commiteados al repo:

```
assets/processed/textos/tuni.png
assets/processed/textos/copa-colombia.png
assets/processed/textos/marxito.png
assets/processed/textos/planti-punk.png
assets/processed/textos/planti-punk-xl.png
assets/processed/textos/planti-k.png
assets/processed/textos/planti-k-xl.png
assets/processed/textos/destruyelo-todo.png
```

Si alguno no estuviera trackeado por git (porque `assets/processed/` pudiera estar en `.gitignore`), agregarlo explícitamente:

```bash
git add -f assets/processed/textos/*.png
```

---

## Tarea 6 · Verificación visual

1. Local: abrir `index.html` en navegador.
2. Confirmar que en el grid se ven los 9 nombres handwritten en lugar de JetBrains Mono.
3. Confirmar que abajo de cada nombre handwritten aparece la variante en mono pequeño (`.v01`, `.v01 · ROSA`, etc.).
4. Click en cada pieza → modal abre → título grande es la imagen handwritten.
5. Bajar a la sección "Destrúyelo todo" → el título es imagen handwritten.
6. Mobile (devtools, viewport ~375px): los nombres no se ven gigantes ni recortados, las imágenes mantienen ratio.
7. No hay 404s en la consola por imágenes faltantes.

---

## Tarea 7 · Push y deploy

```bash
git add -A
git commit -m "V0.9: integrar títulos handwritten (grid + modales + Destrúyelo todo)"
git push origin main
```

Cloudflare Pages hace auto-deploy. Esperar ~1-2 minutos y verificar en `https://simioplateado.com`.

---

## Reportar a Juan al terminar

Mensaje breve con:
- ✅ confirmación de que el deploy quedó arriba
- captura (o descripción) de cómo se ve el grid con handwritten
- captura (o descripción) de cómo se ve un modal con título handwritten
- cualquier rareza visual (alturas, recortes, etc.)
- si hubo que ajustar valores de CSS más allá de lo sugerido, contar cuáles

---

## Si algo se rompe

- Si una imagen se ve gigante: bajar la `height` de la regla CSS correspondiente en pasos de 0.2rem.
- Si una imagen se ve cortada: revisar si el `<h3 class="exp-titulo">` o el `<div class="codigo">` tienen `overflow: hidden` o `max-height` heredados; si es así, eximir esas reglas para el caso `:has(img)`.
- Si el `aria-label` o estructura semántica importa: el `alt` ya está bien definido para cada imagen, no se pierde accesibilidad.
- Si hay duda razonable sobre algún reemplazo, **detenerse y preguntar a Juan** antes de avanzar — es preferible un push parcial bien hecho que un push completo dudoso.

---

## Lo que viene después (NO en este brief)

Para que Codex no se confunda: **no agregar piezas nuevas, no agregar sección Wearables, no agregar audífonos IMPOSIBLE, no distribuir acentos flotantes, no reemplazar nada del home, no tocar el footer**. Todo eso es V0.10+ y vendrá en briefs separados.

Esta versión hace UNA cosa: pone los nombres handwritten donde la doctrina ya lo pedía. Punto.
