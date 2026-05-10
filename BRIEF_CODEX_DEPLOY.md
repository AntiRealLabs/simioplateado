# Brief de contexto + deploy inicial · Simio Plateado

**Para:** Codex CLI (agente nuevo dedicado a Simio Plateado)
**De:** Juan David Mackinnon Espitia (founder, Anti Real Labs) — vía Cowork principal y Cowork Simio Plateado
**Fecha:** 2026-05-10
**Status:** Dominio `simioplateado.com` registrado en Namecheap, nameservers en Cloudflare, propagación DNS en curso. Repo `github.com/AntiRealLabs/simioplateado` recién creado. Mockup local listo. Falta deploy.

**Versión:** Final unificada — reemplaza cualquier `BRIEF_CODEX_DEPLOY.md` anterior. Combina el brief de contexto preparado por Cowork principal + las precisiones técnicas de Cowork Simio Plateado.

---

## Antes que nada — quién sos y a quién hablás

Sos un agente Codex/CLI con acceso al sistema de archivos de Juan y al terminal de macOS. Tu tarea inmediata es deployar el sitio Simio Plateado a producción. Pero antes de tocar archivos, leé este brief entero — necesitás contexto que un agente sin historia no tiene, y operar sin ese contexto te va a hacer cometer decisiones equivocadas que después hay que revertir.

**Juan David Mackinnon Espitia** es el founder de Anti Real Labs. Es el único decisor estratégico, visual y de copy del proyecto. No tiene equipo humano; trabaja solo orquestando varios agentes IA en paralelo. Su Mac tiene credenciales activas para GitHub (logueado como `AntiRealLabs`) y Cloudflare (cuenta `Admin@antireallabs.com` con sesión abierta en Chrome).

---

## El ecosistema Anti Real Labs

Anti Real Labs es la empresa-paraguas. Bajo ella conviven cuatro productos en distintas etapas. Cada uno tiene su propio carácter, su propio chat de Codex/Cowork, y su propia doctrina visual. **Vos sos responsable solo de Simio Plateado**, pero conocer el ecosistema completo te ayuda a no contaminar tonos.

| Producto | Carácter | Stack | Status hoy |
|---|---|---|---|
| **Colibri** | Biblioteca web personal cíborg-académica para PDFs. Cálido, hand-drawn, contemplativo, con cinco atmósferas visuales (Editorial / Legendaria / Bloc / Pétalo / Veritas). Producto principal. | Cloudflare Workers + D1 + R2 + KV | Activo, staging desplegado, preparando lanzamiento |
| **PetAlo** | Producto secundario en pausa | — | Pausado |
| **Simio Plateado** | Sub-marca artística punk-zine. Galería + tienda. Estética opuesta a Colibri: blanco crudo, anti-corporativa, irreverente, austera. **Vos lo manejás.** | HTML estático en Cloudflare Pages (por ahora; eventualmente Astro) | Iniciando deploy hoy |
| **RITMEDALLO** | Producto terciario en concepción (mapa musical de Medellín) | AWS planeado | Concept stage |

Los chats hermanos en el ecosistema (con quienes podrías necesitar coordinarte alguna vez):
- **Cowork principal** (Claude) — orquesta Colibri Consumer y cross-canal
- **Cowork Simio Plateado** (Claude) — viene trabajando este mockup local con Juan y escribió las precisiones técnicas de este brief
- **Codex chat A "Colibri PDF .com"** — implementa Consumer web
- **Codex Verse "Colibri VERSE"** — implementa app iPad nativa
- **Chat C "C VERITAS"** — atiende canal institucional B2B

**Vos NO te coordinas con esos chats directamente.** Si surge algo que te exceda (ej. dudas sobre coherencia con Colibri), pausá y le avisás a Juan. Nunca tomes decisiones cross-producto solo.

---

## Quién es Simio Plateado

Sub-marca artística de Anti Real Labs. **Mitad galería web, mitad tienda**. Curaduría de piezas de arte, objetos, prints, ediciones limitadas. Algunas piezas existen físicamente, otras son prototipos o conceptos que Juan quiere validar con la audiencia antes de fabricar.

**Cinco palabras canónicas que describen su carácter** (registradas en `simio-plateado/DOCTRINA_INICIAL_SIMIO_PLATEADO.md`):

1. **Minimalista** — pocos elementos en pantalla, mucho aire blanco
2. **Incómodo** — el sitio no busca agradar, decisiones tipográficas pueden ser desafiantes
3. **Irreverente** — anti-corporativo en su DNA. Cero stock photography, gradients SaaS, pop-ups newsletter
4. **Sobrio** — disciplinado, no caótico
5. **Enigmático** — no explica todo, atrae al tipo correcto de visitante

**Logo:** hand-drawn por Juan. Una cara de simio/máscara con cuencas oculares en espirales sueltas, trazo punk-zine, y debajo el texto "SIMIO PLATEADO" en mayúsculas raras. Tinta negra sobre blanco. Estética Raymond Pettibon meets art brut meets cubierta de zine.

**Modelo de negocio** (en construcción):

Las piezas viven en estados visuales canónicos. La doctrina actual reconoce tres:
- **REAL · disponible** — pieza física en stock, se compra
- **IRREAL · sondeo silencioso** — concepto/prototipo digital, vota por que se haga real
- **IRREAL · pieza de exhibición** (categoría reciente) — vive solo digital, no se va a fabricar, su valor está en su imposibilidad

Y una mecánica única que Juan quiere implementar (no en el deploy de hoy, en futuro):
- Botón **"Querer que exista"** sobre piezas IRREAL
- Al apretar despliega dos opciones: dejar email para ser notificado cuando esté disponible, o solo manifestar deseo anónimo (incrementa contador interno)
- Permite validar demanda antes de fabricar

**Lo que el sitio NO es:**
- No es Colibri. Cero crossover de tono cálido/cíborg/dorado/handwriting cariñoso
- No es Substack ni Notion ni Webflow template
- No es portfolio de freelance
- No tiene blog (por ahora; tiene "ensayos" que es distinto)
- No tiene newsletter forzado

**Inspiraciones tonales** (para que sepas cuándo algo NO es Simio):
- Berghain (frialdad, oscuridad, autoridad)
- Other Internet (tipografía rigurosa, fondos blancos, ensayos densos)
- Are.na (minimalismo de archivo)
- Nieves Books (zines suizos minimalistas)
- Sub Pop archivo viejo (sello discográfico con estética sobria)
- Art-zines de los 80-90 (Raymond Pettibon, Black Flag flyers)

Si en algún momento sentís impulso de agregar algo que se parezca a Notion / Linear / Stripe / Apple landing page → ese impulso es señal de error.

---

## El método de trabajo Anti Real Labs

Juan trabaja con un patrón consistente que conviene que conozcas:

1. **Doctrina escrita primero.** Las decisiones (visuales, de copy, de pricing, de feature) viven en archivos `DOCTRINA_*.md`. Antes de implementar algo, hay doctrina escrita. Si te pide algo que no está en doctrina y te parece importante, pedí que lo registremos antes de ejecutar.

2. **Mockup HTML para validar.** Antes de implementar en código de producción, suele haber un mockup `MOCKUP_*.html` autocontenido que se itera hasta aprobación. **El mockup es el spec.** Si te pasan un mockup, copiá las decisiones tal cual.

3. **Brief para ejecución.** Cuando algo está listo para código real, llega un brief `BRIEF_*_CODEX.md` que incluye:
   - Contexto y razón
   - Reglas duras (numeradas, no ambiguas)
   - Acceptance criteria checklist
   - Declaración obligatoria que tenés que escribir en el PR antes de merge

4. **Verificación antes de merge.** PR no merge sin la declaración escrita confirmando que leíste la doctrina, hiciste squint test, etc.

5. **Squint test.** Mirar la pantalla con los ojos entrecerrados. Si algún elemento parece sarpullido, cliché SaaS, ornamento genérico de stock — falla. Hay que rehacerlo.

Para el deploy de hoy NO hay mockup nuevo (ya existe el del proyecto local) ni brief nuevo de Codex. **Este documento ES el brief.**

---

## Reglas duras heredadas (aplican a TODO Anti Real Labs, incluido Simio)

1. **Naming snake-case con guiones medios** en archivos: `imagen-pieza-1.png`, no `Imagen Pieza 1.png` ni `ImagenPieza1.png`. Excepción: archivos que ya existen con espacios (Juan los nombró con espacios desde Finder) NO se renombran sin pedirle permiso primero — los assets ya integrados al mockup pueden tener referencias rotas si los renombrás.
2. **Cero trackers de terceros** (Google Analytics, Facebook Pixel, Hotjar, Intercom, etc.). Si Cloudflare Web Analytics está disponible y se puede activar con un click, OK — nada más
3. **Cero pop-ups invasivos** rogando newsletter, descuento, bookmark
4. **Cero dark patterns** — botones engañosos, opt-outs ocultos, casillas pre-marcadas, "solo por hoy" mentiroso
5. **Performance importa** — Cloudflare Pages es perfecto para HTML estático, no agregar bundlers innecesarios
6. **Producción intocada hasta validación** — todo cambio se prueba primero en preview/staging
7. **No improvises tono ni copy** — las decisiones de contenido están tomadas. Si algo te parece raro, preguntá antes de cambiar

---

## Mapa de carpetas relevantes en el sistema de Juan

Antes de tocar nada, dejá explícito en tu mente este mapa:

```
/Users/elmackinon/Documents/ANTI Mackinon/Playground2/
├── simio-plateado/                    ← ESTE es el proyecto del que hablamos
│   ├── mockups/                        (versions HTML del sitio, V0.1 a V0.8)
│   ├── assets/                         (logo, sellos, fotos de piezas, hand-drawn)
│   ├── textos/                         (copy canónico: destruyelo-todo.md, planti.md, etc.)
│   ├── qmpev/                          (script Python para procesar capítulos cámara)
│   ├── doctrina/                       (notas tipográficas y decisiones)
│   ├── inventario_componentes/         (referencia, no para deploy)
│   ├── BRIEF_CODEX.md                  (brief para migración futura a Astro)
│   ├── BRIEF_CODEX_DEPLOY.md           (este archivo)
│   └── DOCTRINA_INICIAL_SIMIO_PLATEADO.md
│
└── pdf-resumidor-cloudflare-web/      ← OTRO proyecto (Colibri PDF), NO TOCAR
    ├── assets/manual/
    ├── migrations/
    ├── scripts/build-optical-scales.js
    ├── src/html-v3-*
    ├── wrangler.corporate-temp.jsonc
    └── ...
```

**Tu único playground es `simio-plateado/`. La carpeta `pdf-resumidor-cloudflare-web/` es Colibri, está fuera de tu alcance, ni la abras.**

---

## ERROR CONFIRMADO QUE HAY QUE CORREGIR

Juan ejecutó comandos git desde la carpeta equivocada — estaba en `pdf-resumidor-cloudflare-web/` (Colibri PDF) en lugar de en `simio-plateado/`. Es muy probable que el repo `github.com/AntiRealLabs/simioplateado` ahora contenga archivos de Colibri (estructura tipo `assets/manual/`, `migrations/`, `scripts/build-optical-scales.js`, `src/html-v3-*`, `wrangler.corporate-temp.jsonc`, etc.) en lugar de los archivos de Simio Plateado.

**Tu primera tarea es verificar esto y limpiar antes de subir lo correcto.**

---

## Lo que tenés que hacer ahora · Deploy local → Cloudflare Pages

**Objetivo:** `simioplateado.com` online sirviendo el mockup HTML actual (`mockups/MOCKUP_HOME_V0_8.html` o la versión más reciente que encuentres en `mockups/`) en menos de una hora vía Cloudflare Pages conectado a GitHub.

### Paso 1 · Verificar y limpiar el repo de contenido incorrecto · prioritario

Verificá explícitamente qué hay en el repo remoto:

```bash
cd /tmp
git clone https://github.com/AntiRealLabs/simioplateado.git simio-verificacion
cd simio-verificacion
ls -la
```

**Señales de que el contenido está MAL** (es del proyecto Colibri, no Simio Plateado):
- Existen carpetas tipo `assets/manual/`, `assets/numeros/`, `migrations/`, `scripts/build-optical-scales.js`
- Existen archivos tipo `src/html-v3-*`, `wrangler.corporate-temp.jsonc`, `src/generated/icon-optical-scales.js`
- NO existen las carpetas `mockups/`, `qmpev/`, `textos/`, `doctrina/`
- NO existen archivos como `BRIEF_CODEX.md`, `BRIEF_CODEX_DEPLOY.md`, `DOCTRINA_INICIAL_SIMIO_PLATEADO.md`

Si el contenido está mal (es lo más probable), **resetear el repo remoto** completamente:

```bash
cd /tmp/simio-verificacion
git rm -rf .
git commit -m "limpieza: contenido incorrecto (era de Colibri PDF)"
git push origin main --force
```

Si el repo aparece vacío (solo `.git`, `README.md` o nada), saltá este paso de limpieza.

**Verificá también que no se haya creado un `.git` accidental dentro de la carpeta de Colibri** (que pueda causar problemas a futuro):

```bash
ls -la "/Users/elmackinon/Documents/ANTI Mackinon/Playground2/pdf-resumidor-cloudflare-web/.git" 2>/dev/null && echo "OJO: hay un .git en la carpeta de Colibri que puede ser del error de Juan"
```

Si existe ese `.git` y NO debería estar (Colibri tiene su propio repositorio en otro remote, posiblemente `github.com/AntiRealLabs/colibri` o similar — Juan puede confirmar), **preguntale a Juan antes de tocar nada** — Colibri es proyecto independiente y borrar su `.git` puede tener consecuencias graves.

### Paso 2 · Subir el contenido correcto del proyecto Simio Plateado

El proyecto vive en:
```
/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado
```

**Antes de empezar, verificá que estás en la carpeta correcta:**

```bash
cd "/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado"
pwd  # debe imprimir la ruta exacta de simio-plateado
ls   # debe listar: mockups/, assets/, textos/, qmpev/, doctrina/, BRIEF_CODEX.md, BRIEF_CODEX_DEPLOY.md, DOCTRINA_INICIAL_SIMIO_PLATEADO.md, etc.
```

Si `ls` muestra archivos del tipo Colibri (`migrations/`, `src/html-v3-*`, etc.), **estás en la carpeta equivocada — no continúes hasta confirmar que estás en simio-plateado**.

**Si la carpeta `simio-plateado` ya tiene una carpeta `.git` de un intento anterior** (porque Juan corrió `git init` por error), borrá ese `.git` antes de re-inicializar:

```bash
ls -la .git  # verifica si existe
rm -rf .git  # solo si existe Y querés re-inicializar limpio
```

Después push correctamente:

```bash
git init
git add .
git commit -m "initial commit · drop 001"
git branch -M main
git remote add origin https://github.com/AntiRealLabs/simioplateado.git
git push -u origin main --force
```

(El `--force` resuelve cualquier conflicto si el remote tenía algo subido por error. Es seguro porque ya verificamos que el contenido remoto era incorrecto en Paso 1.)

**Verificá que se subió bien:**

```bash
git log --oneline -5
```

Debe mostrar el commit "initial commit · drop 001" como HEAD. Y refrescando `https://github.com/AntiRealLabs/simioplateado` en navegador, deben verse las carpetas `mockups`, `assets`, `textos`, `qmpev`, `doctrina`, etc.

### Paso 3 · `.gitignore` apropiado

Si todavía no existe, agregar al repo:

```
.DS_Store
node_modules/
dist/
.env
.env.local
*.log
```

Commit y push.

### Paso 4 · Configurar Cloudflare Pages

Cuenta Cloudflare: `Admin@antireallabs.com`. Sesión activa en Chrome de Juan.

1. Cloudflare Dashboard → **Workers & Pages** → **Create application** → tab **Pages**
2. **Connect to Git** → autorizar GitHub si no está autorizado → seleccionar repo `simioplateado`
3. Configurar build:
   - **Project name**: `simio-plateado`
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build command**: vacío
   - **Build output directory**: `mockups`
   - **Environment variables**: ninguna
4. **Save and Deploy**

Cloudflare hace el primer deploy y entrega URL pública tipo `simio-plateado.pages.dev`.

### Paso 5 · Configurar dominio personalizado

Tras primer deploy exitoso:

1. Proyecto en Cloudflare Pages → tab **Custom domains**
2. **Set up a custom domain** → `simioplateado.com` → Continue
3. **Activate domain**

Cloudflare detecta que el dominio ya está en su DNS (nameservers cambiados) y configura CNAME records + SSL automáticamente.

### Paso 6 · Configurar `index.html`

Cloudflare Pages busca `index.html` en el output directory. Como el archivo se llama `MOCKUP_HOME_V0_8.html` (o la versión más reciente que encuentres en `mockups/`), dos opciones:

**Opción A (recomendada):** copiar el último mockup a `index.html` dentro de `mockups/`:

```bash
cp mockups/MOCKUP_HOME_V0_8.html mockups/index.html
git add mockups/index.html
git commit -m "add index.html para Cloudflare Pages"
git push
```

**Opción B:** mover el contenido de `mockups/` al root del repo, renombrar, y cambiar Build output directory a `/`. Más limpio pero más invasivo.

**Voto: Opción A.** Mantiene la carpeta `mockups/` con el historial de versiones intacto.

### Paso 7 · Verificar deploy

Tras segundo deploy (después del cambio de index):

- `https://simio-plateado.pages.dev` → debe cargar el mockup
- `https://simioplateado.com` → debe cargar el mockup (puede tardar 1-2 min extra de propagación tras configurar Custom domain)

### Paso 8 · Reportar a Juan

Mensaje de confirmación con:

- URL Cloudflare Pages
- URL custom (`https://simioplateado.com`)
- Resumen de archivos subidos al repo
- Cualquier problema encontrado y cómo se resolvió
- Si descubriste algo del estado de la carpeta de Colibri (existencia de `.git` accidental), reportalo aparte

---

## Lo que NO debés hacer

- **No tocar el contenido HTML del mockup.** Si algo se ve raro, no arregles vos. Reportá y Juan/Cowork deciden
- **No reescribir copy ni meta tags** que no existen — agregar `<!-- TODO: Juan debe escribir esta meta description -->` está bien, inventar no
- **No migrar a Astro todavía.** Eso es para iteración futura (existe `BRIEF_CODEX.md` separado para esa fase)
- **No instalar dependencias** ni `package.json` ni nada — el sitio es HTML estático puro hoy
- **No agregar Google Analytics, Facebook Pixel, ni ningún tracker.** Cloudflare Web Analytics está OK si se activa con un click
- **No improvisar archivos nuevos.** Si necesitás algo que no está, pedile a Juan
- **No tocar otros proyectos del workspace.** Tu único playground es `simio-plateado/`. La carpeta `pdf-resumidor-cloudflare-web/` (Colibri PDF) está fuera de tu alcance
- **No renombrar archivos existentes** sin permiso de Juan — los assets pueden estar referenciados desde el HTML del mockup con sus nombres actuales (espacios incluidos), y renombrarlos rompe el sitio

---

## Información práctica para autenticación

- **GitHub:** Juan logueado como `AntiRealLabs` en su Mac. Autenticación funciona vía gh CLI o keychain
- **Cloudflare:** cuenta `Admin@antireallabs.com` con sesión abierta en Chrome
- **2FA:** si surge una verificación 2FA que solo Juan puede completar, pausá y avisá qué necesitás exactamente

---

## Cuando termines

Confirmá a Juan con la URL final funcionando + cualquier nota relevante. Devolvele el control. Tu siguiente trabajo (cuando llegue) será otro brief específico.

**Tiempo estimado:** 30-60 minutos de tu trabajo, 0 minutos del tiempo de Juan si todo va bien.

---

**Última nota:** Anti Real Labs trabaja despacio y bien. La velocidad importa menos que la calidad. Si encontrás algo que requiere decisión, parar y preguntar es siempre mejor que improvisar.

— Brief preparado conjuntamente por Cowork principal (Claude) y Cowork Simio Plateado (Claude) por encargo de Juan, 2026-05-10. Reemplaza todas las versiones anteriores.
