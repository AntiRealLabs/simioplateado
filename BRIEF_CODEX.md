# Brief técnico para Codex · Migración Simio Plateado a producción

**Para:** Codex / Cursor / Claude Code / GitHub Copilot — el agente que vaya a hacer la implementación pesada de código.

**De:** Claude (Cowork Simio Plateado), por encargo de Juan David Mackinnon Espitia (founder, Anti Real Labs).

**Fecha:** 2026-05-10
**Status:** Mockup HTML estático funcional + dominio comprado, listo para migración a producción.

---

## Resumen ejecutivo

El proyecto **Simio Plateado** existe hoy como un mockup HTML monolítico funcional (`mockups/MOCKUP_HOME_V0_8.html`, ~19 MB con todas las imágenes inlinied como base64). Tu tarea es convertirlo a un **proyecto Astro estático**, deployable en **Cloudflare Pages**, conectado al dominio recién comprado **simioplateado.com**.

**No es trabajo conceptual** — todas las decisiones de diseño, paleta, tipografía, doctrina tonal, estructura de páginas, contenido y comportamiento están YA tomadas y documentadas. Tu trabajo es 100% implementación: extraer, modularizar, optimizar.

**No improvises tono editorial ni copy** — todo el copy del sitio está en archivos `textos/*.md` o dentro del HTML del mockup. Tu trabajo es **mover bits**, no escribirlos.

---

## Inputs disponibles

Estructura de carpeta del proyecto en `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/`:

```
simio-plateado/
├── DOCTRINA_INICIAL_SIMIO_PLATEADO.md   ← contexto del proyecto, leélo primero
├── BRIEF_CODEX.md                        ← este archivo
├── README.md                              ← ojo, puede no existir aún, créalo
├── mockups/
│   ├── MOCKUP_HOME_V0_8.html             ← mockup canónico actual (limpieza profunda)
│   ├── MOCKUP_HOME_V0_7.html             ← versiones anteriores, solo referencia
│   └── ...
├── assets/                                ← assets originales sin procesar
│   ├── logo-simio-plateado-master.png
│   ├── logo-simio-plateado-negative.png
│   ├── tuni rosa sin fondo.png
│   ├── marxito sin fondo.png
│   ├── copa carton colombia sin fondo.png
│   └── ...
├── assets/processed/                      ← assets procesados, recortados, listos
│   ├── logo-cara.png
│   ├── sello-irreal-delgado.png
│   ├── firma-jdme.png
│   ├── tuni-rosa.png
│   ├── tuni-blanca.png
│   ├── tuni-negra.png
│   ├── marxito.png
│   ├── copa-colombia.png
│   ├── planti/
│   │   ├── punk-regular-barro.png
│   │   ├── punk-regular-silicona.png
│   │   ├── ... (12 variantes)
│   ├── textos/                            ← nombres-código hand-drawn de Juan
│   │   ├── tuni.png
│   │   ├── marxito.png
│   │   ├── superhombresito.png
│   │   ├── dialoguin.png
│   │   ├── mini-devenires.png
│   │   ├── traumin.png
│   │   ├── copa-colombia.png
│   │   ├── planti-punk.png
│   │   ├── planti-punk-xl.png
│   │   ├── planti-k.png
│   │   ├── planti-k-xl.png
│   │   ├── parchao.png
│   │   ├── melisimo.png
│   │   ├── camiseta-blanca.png
│   │   ├── camiseta-negra.png
│   │   ├── gorra.png
│   │   ├── audifonos-tribu.png            (AUDIO.ANTROPOS.v02)
│   │   ├── audifonos-neo.png              (AUDIO.NEO.v02)
│   │   ├── audifonos-simio.png            (AUDIO.OIMIS.v02)
│   │   ├── destruyelo-todo.png
│   │   ├── imposible.png                  ← sello para piezas exhibición
│   │   ├── kemopev.png
│   │   └── qmpev.png
│   ├── acentos/                           ← garabatos hand-drawn pequeños
│   │   ├── acento-01.png
│   │   ├── ... (7 acentos)
│   └── models/
│       └── nietzschito.glb                ← modelo 3D para visor model-viewer
├── textos/                                ← copy canónico del sitio
│   ├── destruyelo-todo.md                ← manifiesto-video con transcripción
│   ├── tuni-la-gotica.md                  ← callouts y descripción de TUNI
│   ├── trofeos-mundial.md                 ← Copa Colombia
│   └── planti.md                          ← familia PLANTI
├── doctrina/
│   ├── notas-tipograficas.md              ← decisión: Boligrafos-Sanderling 20%
│   └── (DOCTRINA_VISUAL_SIMIO_PLATEADO.md pendiente — no esperar a que esté)
└── qmpev/
    ├── README.md                          ← explicación del proyecto QMPEV
    └── scripts/
        └── qmpev_processor.py             ← script Python para procesar capítulos
```

---

## Stack técnico recomendado

```
Framework:       Astro 4.x (HTML-first, óptimo para sitios estáticos con islas)
Hosting:         Cloudflare Pages (gratis hasta 500 builds/mes)
Imágenes:        Componente <Image /> de Astro con optimización automática
3D viewer:       <model-viewer> via CDN (lo que ya usamos)
Fuentes:         Helvetica Neue system stack + JetBrains Mono (Google Fonts)
                 + Boligrafos-Sanderling cuando Juan provea archivo
Formularios:     Cloudflare Workers + KV (para sondeo silencioso del IRREAL)
                 ALTERNATIVA simple: Formspree o Netlify Forms
Analytics:       Cloudflare Web Analytics (gratis, sin cookies, anti-vigilancia
                 — coherente con doctrina anti-corporativa del proyecto)
Repo:            GitHub (público sugerido, punk-transparente)
CI/CD:           Auto-deploy de Cloudflare Pages al push a `main`
```

NO USAR:
- Tailwind CSS (el sitio tiene CSS específico y minimalista, Tailwind agrega peso innecesario)
- React (overkill para este sitio)
- Vercel (Cloudflare es preferido por la doctrina anti-Big-Tech del proyecto)
- Google Fonts cargado completo (solo JetBrains Mono, ya está)

---

## Estructura de páginas a generar

```
src/pages/
├── index.astro                  → Home (logo + frase ancla + nav)
├── drop/
│   └── 001.astro               → Drop 001 (grid asimétrico de piezas)
├── pieza/
│   └── [slug].astro            → Página individual de cada pieza con explosionado
├── wearables/
│   └── index.astro             → Sección Wearables (grid limpio)
├── wearable/
│   └── [slug].astro            → Página individual de wearable
├── ensayos/
│   ├── index.astro             → Listado de ensayos
│   └── destruyelo-todo.astro   → El manifiesto-video con transcripción
├── qmpev/
│   ├── index.astro             → Manifiesto + listado de capítulos
│   └── [capitulo].astro        → Capítulo individual (lee del .md generado por el script)
├── kemopev/
│   └── index.astro             → Manifiesto KEMOPEV (placeholder hasta que existan capítulos)
└── about.astro                  → Manifiesto / qué es esto
```

---

## Componentes Astro a crear

```
src/components/
├── Nav.astro                    → Header sticky con logo cara + links
├── Footer.astro                 → Footer con catálogo / lectura / tienda / idioma
├── PiezaCard.astro              → Tile de pieza para el grid del drop
│                                  Props: slug, codigo, nota, precio, estado,
│                                  imagen, irreal: bool, exhibicion: bool
├── Modal.astro                  → Modal fullscreen genérico (reutilizado por
│                                  todas las piezas)
├── Explosionado.astro           → Bloque de explosionado con flechas SVG +
│                                  callouts
│                                  Props: imagen, callouts: [{nota, texto, posicion}]
├── VotarBloque.astro            → Botón "Querer que exista" con panel email
│                                  + silencio
│                                  Props: codigo, exhibicion: bool (cambia el
│                                  texto y comportamiento)
├── SelectorVariante.astro       → Toggle de variantes cromáticas (PLANTI)
├── Visor3D.astro                → Wrapper de <model-viewer> con loading state
├── HandDrawn.astro              → Renderiza una imagen hand-drawn con tamaño
│                                  responsive
├── AcentoFlotante.astro         → Posiciona un garabato hand-drawn en posición
│                                  absoluta
└── ToggleIdioma.astro           → ES / EN (EN pendiente, dejar placeholder)
```

---

## Migración del HTML actual paso a paso

1. **Leer `mockups/MOCKUP_HOME_V0_8.html`** completo. Es el mockup canónico.

2. **Extraer las paletas y variables CSS** del bloque `<style>` y crearlas como variables globales en `src/styles/globals.css`.

3. **Migrar el HTML de cada sección a su componente Astro** correspondiente:
   - Sección Home → `src/pages/index.astro`
   - Sección Drop → `src/pages/drop/001.astro` + `PiezaCard.astro`
   - Modales explosionados → `src/pages/pieza/[slug].astro` (cada pieza es su propia ruta)
   - Sección ensayos → `src/pages/ensayos/index.astro` + `destruyelo-todo.astro`
   - Sección about → `src/pages/about.astro`

4. **Las imágenes que están como base64 en el HTML monolítico**, reemplazarlas por archivos servidos desde `public/assets/...`. Usá el componente `<Image />` de Astro para optimización automática (WebP, sizes, lazy loading).

5. **El JavaScript inline** del HTML monolítico (función `abrirModal`, `votarEmail`, etc.) hay que migrarlo a `src/scripts/` o como `<script>` en cada componente correspondiente.

6. **El sello IRREAL** que vive como CSS `::after` con `background-image` se mantiene igual, pero la URL apunta al archivo en `public/assets/processed/sello-irreal-delgado.png`.

7. **Sumar el sello IMPOSIBLE** (nuevo): para piezas con prop `exhibicion: true`, mostrar el sello hand-drawn `imposible.png` en lugar del IRREAL. Mismo patrón CSS, distinto archivo.

8. **Sumar la sección Wearables** que NO está en el V0.8 todavía. Estructura simple, grid regular, modal sin explosionado conceptual (solo galería + variantes + comprar/votar).

9. **Sumar piezas nuevas que aparecen en hand-drawn pero no en V0.8**:
   - `DIALOGUIN.v01` (Platón)
   - `MINI_DEVENIRES.v01` (Deleuze-Guattari)
   - `TRAUMIN.v01` (Freud)
   - `AUDIO.ANTROPOS.v02` (audífonos tribu)
   - `AUDIO.NEO.v02` (audífonos cyberpunk)
   - `AUDIO.OIMIS.v02` (audífonos cráneo simio)

10. **Aplicar nombres-código hand-drawn**: en cada `PiezaCard.astro` y modal title, reemplazar la fuente JetBrains Mono digital por la imagen hand-drawn correspondiente desde `assets/processed/textos/`. Mantener fallback a JetBrains Mono por si la imagen falla en cargar.

11. **Distribuir acentos flotantes**: 7 garabatos en `assets/processed/acentos/` se posicionan con `<AcentoFlotante>` en lugares específicos del sitio (decisión visual de Juan, sugerir 1 acento por sección).

---

## Doctrina visual canónica (resumen)

```
PALETA:
  --paper:  #FFFFFF (blanco puro, no cream)
  --ink:    #000000 (negro puro, no charcoal)
  --rule:   #000000

TIPOGRAFÍA:
  Cuerpo:      "Helvetica Neue", Helvetica, Arial, sans-serif
  Datos/code:  "JetBrains Mono", "Menlo", monospace
  Títulos:     hand-drawn imágenes (Boligrafos-Sanderling 20% pendiente
               de archivo de Juan)

REGLA INVIOLABLE:
  Cero gradientes, cero stock photography, cero pop-ups newsletter,
  cero copy IA-generated. Todo el copy es de Juan, hand-drawn o canónico.
```

---

## Tres estados de pieza · doctrina formalizada

Cada pieza del catálogo cae en uno de tres estados que cambian su tratamiento visual y funcional:

```
1. REAL · disponible
   - Sin sello sobre el frame
   - Botón "Comprar"
   - Stock contable, edición numerada
   - Ej: piezas físicas que ya existen

2. IRREAL · sondeo silencioso
   - Sello "IRREAL" hand-drawn delgado sobre el frame, rotado
   - Botón "Querer que exista" con panel email/anónimo
   - El backend cuenta votos
   - Ej: TUNI, PLANTI, MARXITO, TRAUMIN, DIALOGUIN, MINI_DEVENIRES,
     COPA, PARCHAO, MELISIMO, CAMISETAS, GORRA

3. IRREAL · pieza de exhibición pura (NUEVO)
   - Sello "IMPOSIBLE" hand-drawn sobre el frame
   - Sin botón de votar (o con botón "Anotar contemplación" que solo
     registra que alguien la miró)
   - La pieza vive solo digital, no hay promesa de fabricación
   - Ej: AUDIO.ANTROPOS, AUDIO.NEO, AUDIO.OIMIS (los audífonos)
```

---

## Backend mínimo necesario

Para el sondeo silencioso del IRREAL (botón "Querer que exista"), necesitás un endpoint chiquito. Opciones por simplicidad:

**Opción A · Cloudflare Worker + KV (recomendada, dentro del ecosistema)**

- Endpoint `POST /api/sondeo` que recibe `{slug, email?: string}`
- Guarda en KV: `votes:[slug]:total` (incrementa) y opcionalmente
  `votes:[slug]:emails:[email]` (sin duplicados)
- Endpoint `GET /api/admin/sondeo` (con auth) devuelve totales para Juan

**Opción B · Formspree (más simple, externo)**

- Cada pieza tiene un form HTML que apunta a Formspree
- Formspree manda email a Juan con cada voto + lista en su dashboard
- Sin necesidad de programar backend

Para arrancar, **usá Opción B (Formspree)** — Juan puede empezar sin programar backend. Cuando el proyecto crezca, migrás a Opción A.

---

## SEO y meta tags

Por cada página, generar meta tags básicos:

```html
<title>SIMIO PLATEADO · [PIEZA / SECCIÓN]</title>
<meta name="description" content="[descripción curada, no IA-generated, pedirle a Juan]">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="[ruta al PNG de la pieza si aplica]">
<meta property="og:url" content="https://simioplateado.com/...">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/processed/logo-cara.png">
```

**No descripción IA-generated.** Si no hay descripción curada por Juan para una página, dejarla con un placeholder claro tipo `<!-- TODO: Juan debe escribir esta meta description -->` y avisar.

---

## Pasos de deploy a Cloudflare Pages

Asumiendo que Juan ya hizo la conexión Namecheap → Cloudflare DNS:

1. Crear repo GitHub `simio-plateado` (público)
2. Inicializar Astro: `npm create astro@latest -- --template minimal`
3. Migrar contenido siguiendo la guía arriba
4. Push a GitHub
5. Cloudflare Dashboard → Workers & Pages → Create → Connect to Git
6. Configurar build:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
7. Deploy
8. Custom domain: `simioplateado.com` y `www.simioplateado.com`

Cloudflare auto-detecta los DNS y genera certificado SSL.

---

## Lo que NO debes hacer

- **No reescribir el copy.** Todo el texto está en archivos `.md` de `textos/` o en el HTML del mockup. Si una frase suena rara, NO la reescribas — pregúntale a Juan.
- **No agregar features no pedidas** (animaciones cool, gradientes, efectos hover elaborados, modo oscuro). El sitio es deliberadamente austero.
- **No simplificar la doctrina** para que el código sea más fácil. La asimetría del grid, los offsets verticales, el sello rotado, todo eso es DELIBERADO.
- **No mover el video Vimeo a YouTube.** Si Juan eventualmente migra a auto-hosting con archivo .mp4, lo decide él, no tú.
- **No usar fuentes web pesadas.** Solo JetBrains Mono via Google Fonts (~30 KB) y system stack de Helvetica.
- **No agregar tracking de Facebook Pixel, Google Analytics, etc.** Cloudflare Web Analytics es lo único permitido por la doctrina anti-vigilancia del proyecto.

---

## Lo que debes hacer al final

1. Sitio funcional en `simioplateado.com` con SSL
2. README.md en el repo explicando cómo correr local + deployar
3. Commit final con mensaje descriptivo
4. Reportar a Juan: qué hiciste, qué quedó pendiente, qué sugerirías para V1.1

---

## Pendientes que NO son tu responsabilidad

Estos quedan para Juan o Claude (Cowork) a futuro, no los implementes:

- Versión EN del sitio (traducción literaria, requiere humano)
- Doctrina visual `DOCTRINA_VISUAL_SIMIO_PLATEADO.md` (Claude la escribirá cuando esté listo)
- Capítulos QMPEV reales (cuando llegue la cámara y Juan haga expediciones)
- Backend KEMOPEV (cuando los audífonos sean físicos)
- Integración Stripe Checkout para piezas REAL (cuando exista alguna pieza real)

---

## Contacto y dudas

Si en algún momento tenés una duda conceptual sobre el proyecto, **NO improvises** — preguntale a Juan directamente. El proyecto tiene doctrina muy específica y vale la pena mantenerla.

Si tenés una duda técnica (cómo hacer X en Astro, cómo conectar Y a Cloudflare), resolvé tú con tu propia investigación.

---

**Tiempo estimado total**: 4-8 horas de trabajo concentrado para el primer deploy funcional. Las iteraciones siguientes (V0.9 con hand-drawn aplicado, V0.10 con QMPEV, etc.) son trabajo adicional, no incluido en este brief.

— Claude (Cowork Simio Plateado), 2026-05-10
