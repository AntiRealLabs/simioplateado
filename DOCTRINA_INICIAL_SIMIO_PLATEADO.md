# Doctrina inicial · Simio Plateado · Kickoff

**Fecha de apertura del proyecto:** 2026-05-08
**Status:** Etapa de diseño y exploración conceptual. Sin código todavía.
**Carpeta de trabajo:** `/Users/elmackinon/Documents/ANTI Mackinon/Playground2/simio-plateado/`
**Doctrinas hermanas relevantes:** las de Colibri viven en la raíz de Playground2, pueden consultarse pero NO copiarse — Simio Plateado es otro mundo.

---

## Qué es este documento

Este es el **mensaje de apertura** del chat dedicado a Simio Plateado. Si recién abrís este proyecto sin contexto previo, leelo entero antes de tocar cualquier mockup, código, o asset. Está pensado para darte el contexto mínimo que un agente fresco necesita para trabajar con criterio.

Está escrito por Claude (otro Cowork chat, el que viene de trabajar con Juan en Colibri), por encargo explícito de Juan tras decidir abrir Simio Plateado como sub-marca con identidad propia.

---

## Quién es Simio Plateado

Simio Plateado es una **sub-marca de Anti Real Labs**, paralela a Colibri pero con identidad y registro emocional radicalmente distintos. Mientras Colibri es cálido, sofisticado, contemplativo, "biblioteca personal cíborg", Simio Plateado vive en otra órbita: punk-zine, anti-corporativo, irreverente, incómodo, sobrio, enigmático.

Es **mitad página/tienda, mitad galería web**. Eso significa que:
- Habrá piezas/obras curadas en exhibición (galería)
- Algunas (no necesariamente todas) estarán a la venta (tienda)
- El sitio funciona también como manifiesto estético del proyecto

No conocemos todavía:
- Qué tipo de piezas exactamente vende/exhibe (¿gráfica? ¿objetos físicos? ¿zines? ¿prints? ¿NFTs no, eso seguro que no)
- Cuál es el modelo de negocio detrás (ediciones limitadas, drops, suscripción, ventas regulares)
- Qué frecuencia de actualización tendrá
- Si hay otros colaboradores o solo Juan

**Estas preguntas son las primeras que el chat debe resolver con Juan en la primera sesión.** No asumas — preguntá.

---

## Relación con Anti Real Labs y Colibri

Anti Real Labs es la empresa-paraguas. Bajo ella viven varios productos/marcas:

- **Colibri** — biblioteca web personal, atelier de lectura cíborg (producto principal hoy)
- **PetAlo** — secundario (en pausa)
- **Simio Plateado** — sub-marca artística (este proyecto)
- Posiblemente otros en el futuro

Cada sub-marca tiene **identidad visual y tonal propia**. La doctrina de Colibri **no se aplica directamente** a Simio Plateado. El cream paper, los mandamientos de decoración hand-drawn que protegen la atmósfera contemplativa de Colibri, los guiños dorados de Modo Leyenda — nada de eso es canon en Simio Plateado.

Lo que SÍ se hereda de Colibri:
- **El método de trabajo**: doctrina escrita primero, mockup HTML para explorar, brief para Codex cuando hay que implementar, verificación visual antes de merge
- **El respeto por lo hand-drawn**: ambas marcas privilegian asset hand-drawn de Juan sobre genéricos digitales
- **El rigor con el copy**: ningún copy es decorativo, todo dice algo

Lo que NO se hereda:
- Paleta cálida (Simio Plateado es blanco crudo + negro)
- Tipografías sofisticadas (Crimson Pro, Spectral, etc. quedan para Colibri)
- Tono contemplativo (Simio Plateado es seco, directo, áspero)
- "Aposento amplio" como filosofía (Simio Plateado puede ser más denso o más vacío según pieza)

---

## Estética y tono

Las cinco palabras que Juan dio para describir Simio Plateado:

**Minimalista** — pocos elementos en pantalla. Mucho aire blanco. No saturación, no decoración accesoria. Lo que está, está porque tiene que estar.

**Incómodo** — el sitio no busca agradar. Las decisiones tipográficas, los espaciados, los crops pueden ser deliberadamente desafiantes. Texto demasiado grande o demasiado chico. Imágenes que no se acomodan al estándar. Un punk-rigor formal que rechaza la comodidad UX común.

**Irreverente** — anti-corporativo en su DNA. Cero stock photography, cero gradients tipo SaaS, cero pop-ups de newsletter, cero copy aspiracional. La voz es directa, a veces sarcástica, siempre adulta.

**Sobrio** — pero también disciplinado. La irreverencia no es caos. Hay rigor en cada decisión, simplemente el rigor es de otro lugar (zine, gallery, art-school) y no de la web corporativa.

**Enigmático** — el sitio no explica todo. Hay piezas sin descripción extensa. Hay categorías sin nombres obvios. Hay rincones que el usuario tiene que descubrir. Está bien si la primera visita deja preguntas sin resolver — eso atrae al tipo correcto de visitante.

---

## El logo

El logotipo de Simio Plateado es hand-drawn por Juan. Descripción del archivo que Juan adjuntará al chat:

- Una cara de simio/primate/máscara, con cuencas oculares dibujadas como espirales sueltas
- Trazo punk-zine, áspero, no pulido — se nota la mano que lo dibujó
- Debajo de la cara: el texto "SIMIO PLATEADO" hand-drawn en estilo similar, mayúsculas raras
- Tinta negra sobre fondo blanco. Sin color
- Hay una marca pequeña a la derecha (¿signo de pregunta? ¿slash?) que parece intencional
- Estética que recuerda a portadas de zine, tags de graffiti, cubiertas de discos punk de los 80, art brut

**Cuando Juan abra el nuevo chat:**
- Le pedís que adjunte el logo (lo guardaremos en `simio-plateado/assets/logo-simio-plateado-master.png`)
- Antes de cualquier mockup, hacés screenshot mental del logo y dejás que él guíe
- El logo es la única ancla visual canónica hoy. Todo lo demás se construye desde ahí

---

## Tipo de producto

**Página + tienda + galería** en un solo sitio. Estructura tentativa que el chat debe explorar con Juan:

1. **Home** — manifiesto del proyecto, posiblemente solo el logo y una frase enigmática. Como entrar a una galería: silencio antes de la pieza.

2. **Galería / Catálogo** — las piezas curadas. Vista en grid o lista o algo más radical (single-piece-per-scroll, por ejemplo). Cada pieza con su ficha: imagen, título, descripción mínima si la hay, precio si está a la venta, status.

3. **Pieza individual** — vista detalle de cada obra. Más imágenes, posiblemente proceso, posiblemente texto del autor.

4. **Tienda / Comprar** — si la pieza está a la venta, el flujo de compra. Probablemente Stripe Checkout o equivalente, integración mínima.

5. **About / Manifiesto** — quién es Simio Plateado, qué hace, por qué existe. Probablemente una sola página corta y enigmática.

6. **Contact** — email o formulario mínimo.

**Lo que Juan dijo explícitamente sobre el formato:** "como un bloc blanco donde están puestos asimismo las piezas y productos". Eso señala:
- Fondo dominantemente blanco crudo (no cream, no off-white tibio — blanco)
- Las piezas SE COLOCAN sobre el blanco, no se enmarcan
- Composición tipo gallery wall o pegado de zine artisanal
- Cada pieza respira en su propio rectángulo de aire

---

## Stack tentativo

Cuando llegue el momento de implementar (NO ahora):

- **Framework**: Astro o Next.js. Sitio mayormente estático, content-driven, no necesita auth complejo
- **Hosting**: Cloudflare Pages, Vercel, o Netlify
- **Tienda**: Stripe Checkout integrado mínimamente, sin carrito persistente complejo (cada pieza es directa)
- **CMS**: Markdown files en repo, o headless CMS liviano (Sanity, Contentful) si Juan quiere editar sin tocar código
- **Subdominio**: probablemente `simioplateado.com` independiente, o `simioplateado.antireallabs.com` como subdominio. Decidir después

Pero **esto es para después**. La primera fase es exploración visual.

---

## Inspiraciones a explorar

El chat debe investigar (vía WebFetch o WebSearch si es necesario) sitios que viven en este registro estético:

- **Berghain** — frialdad, oscuridad, autoridad, anti-glamour
- **Other Internet** — tipografía rigurosa, fondos blancos, ensayos densos
- **Are.na** — minimalismo de archivo, asociación libre
- **Nieves Books** — zines suizos minimalistas, blanco brutal
- **It's Nice That** vs **A Practice for Everyday Life** — segundo más cercano que primero
- **Obrist Hans Ulrich's site** o cualquier galería contemporánea con sensibilidad punk
- **Mexican Summer** o **Sub Pop** archivo viejo — sellos discográficos con estética sobria
- **Art-zines de los 80-90** — Raymond Pettibon, Black Flag flyers
- Cualquier Bandcamp page de un artista que NO use el template default

Lo que **no aplica**: Notion, Substack, Linear, Stripe, Apple, Webflow templates, anything with a "saas" gradient, anything with clearly "designed for engagement metrics".

---

## Preguntas abiertas para la primera sesión con Juan

Estas son las preguntas que el chat debe resolver con Juan ANTES de hacer cualquier mockup. Sin estas respuestas, cualquier mockup será una fantasía sin anclaje.

1. **¿Qué tipo de piezas vende/exhibe Simio Plateado?** Gráfica impresa, objetos físicos, zines, prints firmados, ediciones limitadas, otras categorías
2. **¿Hay piezas ya producidas o el sitio se construye antes de tener inventario?**
3. **¿Cuál es el modelo de negocio?** Drops periódicos, ventas continuas, ediciones limitadas, suscripción, todas las anteriores
4. **¿Quién compra?** Coleccionistas, amigos, comunidad punk/art, gente que viene de Colibri, otros
5. **¿Hay otros colaboradores o solo Juan?** Esto afecta el manifiesto y el about
6. **¿El sitio es solo escaparate o también tiene producción de contenido?** (blog, ensayos, registros de proceso, etc.)
7. **¿Qué frecuencia de actualización?** Mensual, semanal, irregular, no actualiza casi nunca
8. **¿Idiomas?** Solo español, español + inglés, otra combinación
9. **¿Quién recibe los pedidos físicamente?** Cómo se hace el envío
10. **¿Hay timeline?** Cuándo querés tener un primer mockup, cuándo el sitio en aire

---

## Cómo trabajar con Juan

Información del workflow que el chat necesita conocer para no perder tiempo:

**Juan es el founder y único decisor visual/estratégico.** Trabaja a tiempo completo en Anti Real Labs, está acostumbrado a iterar con agentes IA, sabe leer mockups HTML, puede dibujar a mano cuando hace falta, y tiene un ojo afinado para detectar regresiones visuales.

**El método que funciona** (probado en Colibri durante meses):
1. Discusión conceptual breve para alinear dirección
2. **Doctrina escrita primero** — antes de cualquier mockup, escribir las reglas. Si no hay reglas, hay improvisación
3. **Mockup HTML self-contained** — las propuestas viven como archivos `.html` en Playground2 con CSS inline. Juan los abre en navegador y da feedback visual
4. Iteración hasta que Juan dice "esto está"
5. **Brief para Codex** — cuando hay implementación, se escribe un brief técnico vinculante con declaración obligatoria de cumplimiento en el PR
6. Verificación en staging
7. Deploy o iteración

**Lo que Juan no tolera:**
- CSS-default que se siente como Bootstrap o template SaaS
- Decoración por decoración (puntos digitales sueltos, granular tipo varicela, etc.)
- Improvisar fuera de doctrina cuando la doctrina existe
- Ignorar cuando él identifica un problema visual

**Lo que Juan agradece:**
- Honestidad cuando algo no se sabe ("este mockup tiene este compromiso técnico, decime si te molesta")
- Rigor numérico (regla 27, mandamiento V, etc. — los números se respetan)
- Empatía cuando él está cansado o frustrado (es founder solo cargando mucho)
- Iteración rápida y específica sobre vaguedad

**Lo que Juan está descubriendo en este proyecto:**
Simio Plateado es nuevo terreno emocional para él. Es donde puede ser más oscuro, más punk, más raw que en Colibri. Si proponés algo que se siente "demasiado Colibri" para Simio Plateado (suave, contemplativo, dorado), él va a corregirte. Confiá en eso.

---

## Próximos pasos sugeridos para la primera sesión

1. **Pedirle a Juan que adjunte el logo** y guardarlo en `simio-plateado/assets/logo-simio-plateado-master.png`
2. **Hacer las preguntas abiertas** de arriba (al menos las 4-5 más críticas: 1, 2, 3, 7)
3. **Investigar 5-7 inspiraciones** vía web search y traerlas con captura o link para discutir
4. **Escribir un primer borrador de doctrina visual** con: paleta canónica, tipografías exploratorias, principios de layout, registro tonal
5. **Construir un primer mockup HTML mínimo de la home** — solo logo centrado, frase enigmática, link a galería
6. Iterar desde ahí

**No saltar a la galería completa todavía.** La home + el logo + una frase es suficiente para validar que el lenguaje visual está bien. Si la home está bien, el resto se construye encima.

---

## Archivos a crear conforme avanza el proyecto

Sugerencia de estructura para mantener organizado:

```
simio-plateado/
├── DOCTRINA_INICIAL_SIMIO_PLATEADO.md  (este archivo, kickoff)
├── DOCTRINA_VISUAL_SIMIO_PLATEADO.md   (después del primer pase)
├── DOCTRINA_TONAL_SIMIO_PLATEADO.md    (registro de voz, copy patterns)
├── assets/
│   ├── logo-simio-plateado-master.png
│   └── [piezas hand-drawn que Juan vaya entregando]
├── mockups/
│   ├── MOCKUP_HOME_V1.html
│   ├── MOCKUP_GALERIA_V1.html
│   └── ...
├── briefs/
│   └── [briefs para Codex cuando llegue el momento de implementar]
└── inspiraciones/
    └── [capturas o links de referencias visuales investigadas]
```

---

## Cierre

Simio Plateado es un proyecto chico pero con personalidad fuerte. No es Colibri y no debe parecerse. Si llegado un punto sentís que las decisiones se están alineando mucho con Colibri, pará y replanteá — Juan eligió hacer esta sub-marca SEPARADA precisamente para tener un lugar donde el registro pueda ser distinto.

Buena suerte. El primer movimiento es preguntar, no proponer.

— Mensaje preparado por Claude (Cowork Colibri) para Claude (Cowork Simio Plateado), por encargo de Juan, 2026-05-08
