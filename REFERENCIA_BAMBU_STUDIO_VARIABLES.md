# Referencia · Variables de Bambu Studio para Bambu Lab A1

*Inventario completo de variables del slicer Bambu Studio, organizadas por pestaña, con nombres exactos en español, valores por defecto, descripción breve y tres presets para distintos tipos de pieza. Versión 1.0 · 2026-06-09. Basado en perfil 0.16mm Optimal @BBL A1.*

---

## Estructura general del panel "Process"

El panel "Process" en Bambu Studio tiene 5 pestañas principales:

1. **Quality** (Calidad)
2. **Strength** (Fuerza)
3. **Speed** (Velocidad)
4. **Support** (Soporte)
5. **Others** (Otros)

Cada una agrupa variables relacionadas. El toggle **"Advanced"** arriba debe estar **activado** para ver TODAS las variables (muchas se ocultan en modo básico).

---

## 1 · Pestaña QUALITY (Calidad)

### Layer height (Altura de capa)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Layer height | `Layer height` | 0.16 mm | Altura de cada capa impresa. Más bajo = más detalle, más tiempo. |
| Initial layer height | `Initial layer height` | 0.2 mm | Altura de la primera capa. Más gruesa ayuda a la adhesión a la cama. |
| Mixed color sublayer | `Mixed color sublayer` | OFF | Para impresión multicolor avanzada. Dejar OFF para impresión mono. |

### Line width (Ancho de línea)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Default | `Default` | 0.42 mm | Ancho de línea base para todo lo no especificado. |
| Initial layer | `Initial layer` | 0.5 mm | Líneas más gruesas en la primera capa = mejor adhesión. |
| Outer wall | `Outer wall` | 0.42 mm | Pared exterior visible. No tocar si el diámetro de boquilla es 0.4 mm. |
| Inner wall | `Inner wall` | 0.45 mm | Paredes internas (refuerzo estructural). |
| Top surface | `Top surface` | 0.42 mm | Capa superior visible (techo). |
| Sparse infill | `Sparse infill` | 0.45 mm | Líneas del relleno parcial. |
| Internal solid infill | `Internal solid infill` | 0.42 mm | Líneas del relleno sólido interno. |
| Support | `Support` | 0.42 mm | Líneas del material de soporte. |

### Seam (Costura)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Seam position | `Seam position` | Aligned | Dónde queda la "cicatriz" de cada capa. **Aligned** = alineada en una línea vertical. **Random** = dispersa. **Back** = atrás de la pieza. |
| Seam placement away from overhangs (experimental) | `Seam placement away from overhangs` | OFF | Coloca la costura lejos de voladizos. Útil para piezas con detalles delicados. |
| Smart scarf seam application | `Smart scarf seam application` | ON | Aplica costura "scarf" (en diagonal) automáticamente. |
| Scarf application angle threshold | `Scarf application angle threshold` | 155° | Umbral para aplicar costura scarf. |
| Scarf around entire wall | `Scarf around entire wall` | ON | Aplica scarf en toda la pared. |
| Scarf steps | `Scarf steps` | 10 | Cantidad de pasos en la transición scarf. |
| Scarf joint for inner walls | `Scarf joint for inner walls` | ON | Aplica scarf también en paredes internas. |

### Precision (Precisión — sub-sección de Advanced)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| X-Y hole compensation | `X-Y hole compensation` | 0 mm | Compensación de tamaño para huecos. Negativo si los huecos salen muy chicos. |
| X-Y contour compensation | `X-Y contour compensation` | 0 mm | Compensación de tamaño para contornos externos. |
| Auto circle contour-hole compensation | `Auto circle contour-hole compensation` | OFF | Bambu calcula compensación automáticamente. |
| Elephant foot compensation | `Elephant foot compensation` | 0.075 mm | Compensa el "pie de elefante" (primera capa más ancha por compresión). |
| Precise Z height | `Precise Z height` | OFF | Z exacta capa por capa. Útil para piezas de muy alta precisión. |

### Ironing (Planchado)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Ironing Type | `Ironing Type` | No ironing | Activa el "planchado" de la superficie superior. Opciones: No ironing, Top surfaces, Topmost surface, All solid layers. |

### Wall generator (Generador de paredes)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Wall generator | `Wall generator` | Classic | **Classic** o **Arachne**. Arachne es más inteligente con paredes de grosor variable, mejor para piezas detalladas. |

### Advanced (Quality)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Order of walls | `Order of walls` | inner/outer | Orden en que imprime paredes. `inner/outer` da mejor calidad superficial. |
| Print infill first | `Print infill first` | OFF | Si ON, imprime relleno antes que paredes. Generalmente dejarlo OFF. |
| Bridge flow | `Bridge flow` | 1 | Multiplicador de flujo en zonas-puente. |
| Thick bridges | `Thick bridges` | OFF | Engrosa las líneas en puentes. Útil para puentes largos. |
| Only one wall on top surfaces | `Only one wall on top surfaces` | Top surfaces | Reduce a 1 pared en superficies superiores para mejor acabado plano. |
| Only one wall on first layer | `Only one wall on first layer` | OFF | Reduce a 1 pared en la primera capa. |
| Smooth speed discontinuity area | `Smooth speed discontinuity area` | ON | Suaviza cambios bruscos de velocidad. |
| Smooth coefficient | `Smooth coefficient` | 80 | Coeficiente de suavizado de velocidad (0-100). |
| Avoid crossing wall | `Avoid crossing wall` | OFF | Evita que el extrusor cruce paredes durante travel (reduce stringing). |
| Smoothing wall speed along Z (experimental) | `Smoothing wall speed along Z` | OFF | Suaviza variaciones de velocidad de paredes según altura Z. |

---

## 2 · Pestaña STRENGTH (Fuerza)

### Walls (Paredes)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Wall loops | `Wall loops` | 2-3 | **CRÍTICA.** Cantidad de paredes externas. Más = más rígida y opaca. Menos = más translúcida y rápida. |
| Alternate extra wall | `Alternate extra wall` | OFF | Pared extra alternada cada N capas. |
| Embedding the wall into the infill | `Embedding the wall into the infill` | OFF | Embebe pared en el relleno (mejora resistencia en puntos críticos). |
| Detect thin wall | `Detect thin wall` | OFF | Detecta paredes delgadas y las imprime como línea única. |

### Top/bottom shells (Capas superior/inferior)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Top surface pattern | `Top surface pattern` | Hilbert Curves | Patrón de la capa superior. Hilbert es más estético. **Monotonic** para acabado uniforme. |
| Top surface density | `Top surface density` | 100% | Densidad del techo. **0%** = sin techo (cascarón). |
| Top shell layers | `Top shell layers` | 4-5 | **CRÍTICA.** Capas sólidas en el techo. **0** = sin techo. |
| Top shell thickness | `Top shell thickness` | 1 mm | Espesor mínimo en mm. Se bloquea cuando `Top shell layers = 0`. |
| Top paint penetration layers | `Top paint penetration layers` | 0 | Profundidad de pintura/textura superficial. |
| Bottom surface pattern | `Bottom surface pattern` | Monotonic | Patrón de la base. Monotonic da acabado más uniforme. |
| Bottom surface density | `Bottom surface density` | 100% | Densidad de la base. **10%** acelera pero deja la base más débil. |
| Bottom shell layers | `Bottom shell layers` | 4-6 | **CRÍTICA.** Capas sólidas en la base. Más = base más rígida. |
| Bottom shell thickness | `Bottom shell thickness` | 0-0.8 mm | Espesor mínimo de base. |
| Bottom paint penetration layers | `Bottom paint penetration layers` | 4 | Capas que reciben "pintura" multicolor en la base. |
| Internal solid infill pattern | `Internal solid infill pattern` | Rectilinear | Patrón del relleno sólido interno. |

### Sparse infill (Relleno parcial)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Sparse infill density | `Sparse infill density` | 15% | **CRÍTICA.** Densidad del relleno interno. **0%** = hueco. **5-10%** decorativo. **20%+** estructural. |
| Sparse infill pattern | `Sparse infill pattern` | Gyroid / Grid | Patrón del relleno. **Gyroid** = más eficiente. **Cubic** = isotrópico. **Honeycomb** = más resistente. |

### Advanced (Strength)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Infill/Wall overlap | `Infill/Wall overlap` | 15% | Solapamiento entre relleno y paredes. |
| Infill direction | `Infill direction` | 45° | Ángulo del patrón de relleno. |
| Bridge direction | `Bridge direction` | 0° | Dirección de impresión de puentes. |
| Detect narrow internal solid infill | `Detect narrow internal solid infill` | ON | **IMPORTANTE.** Detecta zonas estrechas y agrega relleno sólido. Si está ON, puede generar "paredes internas" en cascarones huecos. |
| Ensure vertical shell thickness | `Ensure vertical shell thickness` | Enabled | Garantiza grosor mínimo en paredes verticales. **Disabled** evita capas extra fantasma en piezas huecas. |
| Detect floating vertical shells | `Detect floating vertical shells` | ON | Detecta paredes verticales "flotantes" y las soporta. **OFF** evita paredes internas no deseadas. |

---

## 3 · Pestaña SPEED (Velocidad)

### Initial layer speed (Velocidad primera capa)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Initial layer | `Initial layer` | 50 mm/s | Velocidad de las paredes de la primera capa. Lento = mejor adhesión. |
| Initial layer infill | `Initial layer infill` | 105 mm/s | Velocidad del relleno de la primera capa. |

### Other layers speed (Resto de capas)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Outer wall | `Outer wall` | 200 mm/s | **CRÍTICA para acabado.** Bajar (60-100 mm/s) mejora visiblemente la superficie. |
| Inner wall | `Inner wall` | 300 mm/s | Velocidad de paredes internas. |
| Small perimeters | `Small perimeters` | 50% mm/s o % | Velocidad de perímetros chicos (curvas cerradas). |
| Small perimeter threshold | `Small perimeter threshold` | 0 mm | Tamaño por debajo del cual aplica `Small perimeters`. |
| Sparse infill | `Sparse infill` | 330 mm/s | Velocidad de relleno parcial. |
| Internal solid infill | `Internal solid infill` | 300 mm/s | Velocidad de relleno sólido interno. |
| Top surface | `Top surface` | 200 mm/s | Velocidad del techo. |

### Overhang (Voladizos)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Slow down for overhangs | `Slow down for overhangs` | ON | Baja velocidad en voladizos. |
| Overhang speed @ 10% | `Overhang speed` (10%) | 60 mm/s | Velocidad en voladizos de hasta 10% de la línea. |
| Overhang speed @ 25% | `Overhang speed` (25%) | 30 mm/s | Velocidad en voladizos hasta 25%. |
| Overhang speed @ 50% | `Overhang speed` (50%) | 10 mm/s | Velocidad en voladizos hasta 50%. |
| Overhang speed @ 75% | `Overhang speed` (75%) | 10 mm/s | Velocidad en voladizos hasta 75%. |
| Overhang speed @ 100% | `Overhang speed` (100%) | 10 mm/s | Velocidad en voladizos extremos. |
| Slow down by height | `Slow down by height` | OFF | Baja velocidad según altura Z. |
| Bridge | `Bridge` | 50 mm/s | Velocidad de impresión en puentes. |
| Gap infill | `Gap infill` | 300 mm/s | Velocidad de relleno de huecos pequeños. |
| Support | `Support` | 150 mm/s | Velocidad de impresión de soportes. |
| Support interface | `Support interface` | 80 mm/s | Velocidad de la "tapa" del soporte (donde toca la pieza). |

### Travel speed (Velocidad de viaje)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Travel | `Travel` | 700 mm/s | Velocidad cuando el extrusor se mueve sin imprimir. |

### Acceleration (Aceleración)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Normal printing | `Normal printing` | 6000 mm/s² | Aceleración general. |
| Travel | `Travel` | 10000 mm/s² | Aceleración en viajes. |
| Initial layer travel | `Initial layer travel` | 6000 mm/s² | Aceleración de viajes en primera capa. |
| Initial layer | `Initial layer` | 500 mm/s² | Aceleración de impresión en primera capa. |
| Outer wall | `Outer wall` | 5000 mm/s² | Aceleración en paredes externas. |
| Inner wall | `Inner wall` | 0 mm/s² | 0 = usa default. |
| Top surface | `Top surface` | 2000 mm/s² | Aceleración del techo. |
| Sparse infill | `Sparse infill` | 100% mm/s² o % | Aceleración del relleno parcial. |

---

## 4 · Pestaña SUPPORT (Soporte)

### Support básico

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Enable support | `Enable support` | OFF | Activa la generación de soportes. |
| Type | `Type` | normal(auto) | **normal(auto)** = soporte tradicional. **tree(auto)** = soporte árbol (más eficiente). |
| Style | `Style` | Snug / Default | **Snug** = ajustado a la pieza. **Default**, **Tree Slim**, **Tree Strong**, **Tree Hybrid**, **Tree Organic**. |
| Threshold angle | `Threshold angle` | 30° | **CRÍTICA.** Ángulo mínimo para considerar voladizo. **45-50°** ahorra material. |
| On build plate only | `On build plate only` | OFF | Si ON, soportes solo desde la cama (no flotantes). |
| Support critical regions only | `Support critical regions only` | OFF | Solo soportes en regiones críticas. Reduce material. |
| Remove small overhangs | `Remove small overhangs` | ON | Elimina soportes innecesarios en voladizos pequeños. |

### Raft (Balsa)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Raft layers | `Raft layers` | 0 | Capas de balsa entre cama y pieza. **0** = sin balsa (recomendado en A1). |

### Filament for Supports

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Support/raft base | `Support/raft base` | Default | Filamento usado en base del soporte. |
| Support/raft interface | `Support/raft interface` | Default | Filamento usado en interface (donde toca la pieza). |

### Advanced (Support)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Initial layer density | `Initial layer density` | 90% | Densidad de la primera capa del soporte. Bajar a 65-70% ahorra material. |
| Initial layer expansion | `Initial layer expansion` | -1 mm | Expansión de la primera capa del soporte. |
| Support wall loops | `Support wall loops` | -1 | -1 = auto. Cantidad de paredes en cada rama de soporte. |
| Top Z distance | `Top Z distance` | 0.2 mm | **CRÍTICA para marcas.** Distancia vertical entre soporte y pieza. **0.25-0.30** = menos marcas. |
| Bottom Z distance | `Bottom Z distance` | 0.16 mm | Distancia vertical inferior. |
| Base pattern | `Base pattern` | Default | Patrón de la base del soporte. |
| Base pattern spacing | `Base pattern spacing` | 2.5 mm | Espaciado del patrón base. |
| Pattern angle | `Pattern angle` | 0° | Ángulo del patrón del soporte. |
| Top interface layers | `Top interface layers` | 2 | **CRÍTICA.** Capas de "tapa" del soporte. 3 = más limpio, 2 = más económico. |
| Bottom interface layers | `Bottom interface layers` | 0 | Capas de interface en la base del soporte. |
| Interface pattern | `Interface pattern` | Default | Patrón de la interface. **Concentric** deja menos marca que **Rectilinear**. |
| Top interface spacing | `Top interface spacing` | 0.5 mm | Espaciado entre líneas de la interface. |
| Normal Support expansion | `Normal Support expansion` | 0 mm | Expansión horizontal de soportes normales. |
| Support/object xy distance | `Support/object xy distance` | 0.35 mm | **CRÍTICA.** Distancia horizontal entre soporte y pieza. 0.8-1.0 mm = sin marcas laterales. |
| Z overrides X/Y | `Z overrides X/Y` | OFF | Prioriza Z sobre X/Y en cálculo de distancia. |
| Support/object first layer gap | `Support/object first layer gap` | 0.2 mm | Gap entre soporte y pieza en primera capa. |
| Don't support bridges | `Don't support bridges` | OFF | No genera soporte bajo zonas tipo puente. |
| Independent support layer height | `Independent support layer height` | ON | Permite que soportes tengan altura de capa distinta a la pieza. |

### Tree Support (sub-sección visible solo con Type=tree)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Branch distance | `Branch distance` | 5 mm | Distancia entre ramas del árbol. |
| Branch diameter | `Branch diameter` | 2-5 mm | Grosor de cada rama. 2.5 mm = balance economía/estabilidad. |
| Branch angle | `Branch angle` | 40° | Ángulo de inclinación de las ramas. 50° = ramas más eficientes. |
| Branch diameter angle | `Branch diameter angle` | 5° | Variación de diámetro de la rama según altura. |
| Tree branch tip diameter | `Tree branch tip diameter` | 1.0 mm | Diámetro de la punta de cada rama (donde toca la pieza). 0.8 mm = menos marca. |

---

## 5 · Pestaña OTHERS (Otros)

### Bed adhesion (Adhesión a la cama)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Skirt loops | `Skirt loops` | 1 | Vueltas de "skirt" (perímetro de calentamiento) alrededor de la pieza. **0** = sin skirt. |
| Skirt height | `Skirt height` | 1 layers | Altura del skirt en capas. |
| Brim type | `Brim type` | No-brim / Auto-brim | **Auto-brim** automático según necesidad. **Outer brim only** solo alrededor. **Inner-outer** dentro y fuera. |
| Brim width | `Brim width` | 5 mm | Ancho del brim. 5 mm para piezas verticales, 3 mm para horizontales. |
| Brim-object gap | `Brim-object gap` | 0.1 mm | Distancia entre brim y pieza. 0 = pegado total, 0.2 = más fácil de despegar. |

### Prime tower (Torre de purga)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Enable | `Enable` | OFF | **CRÍTICA solo si multicolor.** Activar solo cuando hay 2+ filamentos en uso. |

### Purge options (Opciones de purga, solo aplica si Prime tower está ON)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Purge into objects' infill | `Purge into objects' infill` | ON | Usa la purga como relleno interno. **Ahorra muchísimo material.** |
| Purge into objects' support | `Purge into objects' support` | ON | Usa la purga como material de soporte. |

### Special mode (Modo especial)

| Variable | Nombre exacto | Default | Descripción |
|---|---|---|---|
| Slicing Mode | `Slicing Mode` | Regular | **Regular** = laminado normal. **Vase** = jarrón (un solo perímetro espiral, sin techo). |
| Print sequence | `Print sequence` | By layer | **By layer** = todas las piezas capa por capa. **By object** = pieza completa antes de pasar a la siguiente. |
| Spiral vase | `Spiral vase` | OFF | Modo jarrón: imprime un solo perímetro en espiral continua. Solo para piezas tipo vaso. |
| Timelapse | `Timelapse` | Traditional | Modo de captura de timelapse de la impresora. |
| Fuzzy Skin | `Fuzzy Skin` | None | Aplica textura "fuzzy" (rugosa) a la superficie. Útil para acabados orgánicos. |
| Fuzzy skin generator mode | `Fuzzy skin generator mode` | Displacement | Modo de generación del fuzzy. |
| Fuzzy skin noise type | `Fuzzy skin noise type` | Classic | Tipo de ruido del fuzzy. |
| Fuzzy skin point distance | `Fuzzy skin point distance` | 0.8 mm | Distancia entre puntos fuzzy. |
| Fuzzy skin thickness | `Fuzzy skin thickness` | 0.3 mm | Profundidad del fuzzy. |
| Apply fuzzy skin to first layer | `Apply fuzzy skin to first layer` | OFF | Aplica fuzzy a la primera capa. |

---

## PRESETS · Configuraciones por tipo de pieza

### PRESET 1 · Cascarón hueco (lámparas, contenedores para electrónica, huevo de balanceo)

**Objetivo:** pieza completamente hueca, paredes sólidas finas, sin techo, lista para insertar componentes.

**Quality:**
- Layer height: **0.16 mm**
- Initial layer height: 0.2 mm

**Strength:**
- Wall loops: **3** (4 si querés más rigidez)
- Top surface density: **0%**
- Top shell layers: **0**
- Top shell thickness: **0 mm**
- Bottom shell layers: **5-6** (base sólida para pegar a la cama)
- Bottom surface density: **100%**
- Sparse infill density: **0%**
- Detect narrow internal solid infill: **OFF**
- Ensure vertical shell thickness: **Disabled**
- Detect floating vertical shells: **OFF**

**Speed:**
- Outer wall: **80-100 mm/s** (mejor acabado)
- Resto: defaults

**Support:**
- Enable support: **OFF** (cascarón abierto arriba no necesita)

**Others:**
- Brim type: **Auto-brim**, Brim width: **5 mm**
- Prime tower: **OFF** (si imprimís con un solo filamento)
- Spiral vase: **OFF** (a menos que sea jarrón puro de un perímetro)

---

### PRESET 2 · Pieza decorativa estética (figura, trofeo, escultura)

**Objetivo:** balance entre calidad visible, tiempo razonable y ahorro de material.

**Quality:**
- Layer height: **0.12-0.16 mm** (más fino para detalles)
- Initial layer height: 0.2 mm

**Strength:**
- Wall loops: **3**
- Top shell layers: **4**
- Bottom shell layers: **4**
- Sparse infill density: **10%**
- Sparse infill pattern: **Gyroid**
- Detect narrow internal solid infill: ON

**Speed:**
- Outer wall: **60-80 mm/s** (acabado visible)
- Resto: defaults

**Support:**
- Enable support: **ON** (si hay voladizos)
- Type: **tree(auto)**
- Style: **Tree Slim**
- Threshold angle: **45-50°**
- Support critical regions only: **ON**
- Top Z distance: **0.25 mm**
- Top interface layers: **3**
- Interface pattern: **Concentric**

**Others:**
- Brim type: **Auto-brim**, Brim width: **5 mm**

---

### PRESET 3 · Pieza estructural/funcional (engranaje, soporte, abrazadera)

**Objetivo:** resistencia mecánica, rapidez, acabado secundario.

**Quality:**
- Layer height: **0.20 mm** (rápido, suficiente para piezas funcionales)
- Initial layer height: 0.2 mm

**Strength:**
- Wall loops: **4-5** (mucha rigidez en paredes)
- Top shell layers: **5**
- Bottom shell layers: **5**
- Sparse infill density: **25-40%**
- Sparse infill pattern: **Cubic** o **Honeycomb**

**Speed:**
- Defaults (velocidad máxima)

**Support:**
- Solo si es estrictamente necesario
- Type: **normal(auto)** (más confiable para piezas funcionales)

**Others:**
- Brim type: **Auto-brim** si la base es chica
- Sin fuzzy skin, sin ornamentos

---

## CHECKLIST DE PRIMERA IMPRESIÓN (para verificar antes de Print plate)

1. **Filamento correcto cargado** y asignado al objeto.
2. **Perfil de calidad** seleccionado (0.12 / 0.16 / 0.20 mm).
3. **Wall loops** acorde al uso de la pieza.
4. **Sparse infill density** ajustado.
5. **Support** activado solo si es necesario.
6. **Brim** ajustado según base de la pieza.
7. **Prime tower OFF** si imprimís con un solo filamento.
8. **Bed limpia** con isopropanol.
9. **Slice plate** ejecutado y revisado el preview capa por capa.
10. **Tiempo y material** estimados aceptables.

---

## VARIABLES CRÍTICAS POR FRECUENCIA DE USO

**Las que tocás SIEMPRE en cada pieza:**
- `Wall loops`
- `Sparse infill density`
- `Sparse infill pattern`
- `Enable support` + `Style` (si aplica)
- `Brim type` + `Brim width`
- `Layer height` (en el dropdown del perfil)

**Las que tocás A VECES (según necesidad):**
- `Top shell layers` (0 para cascarones)
- `Top surface density` (0 para cascarones)
- `Threshold angle` (45-50 para ahorrar soporte)
- `Top Z distance` (0.25-0.30 para piezas estéticas)
- `Outer wall speed` (60-80 para acabados premium)

**Las que tocás RARA VEZ (casos especiales):**
- Variables de Speed/Acceleration (defaults suelen estar bien)
- Variables de Seam (defaults suelen estar bien)
- Variables de Fuzzy Skin (solo para texturas especiales)
- Variables de Spiral vase (solo para jarrones de un perímetro)

---

## NOTAS IMPORTANTES SOBRE LA IMPRESORA BAMBU LAB A1

- **Diámetro de boquilla por defecto:** 0.4 mm. Si usás boquilla distinta, hay que ajustar `Default` line width.
- **Placa de impresión recomendada:** PEI texturada (la que viene de fábrica). Adhesión natural fuerte.
- **Temperatura cama PLA:** 60-65°C.
- **Temperatura boquilla PLA:** 200-220°C (depende del filamento).
- **Velocidad máxima segura:** 500 mm/s con aceleración 10000 mm/s². Bajar para piezas con detalle.
- **AMS (multicolor):** soportado solo en versión A1 con accesorio AMS Lite (4 filamentos). Sin AMS, monocolor.
- **PLA se ablanda a:** 60°C. Cuidado con luz solar directa y autos en verano.

---

*Documento creado 2026-06-09. Inventario hecho a partir de capturas de Bambu Studio v2.x con perfil 0.16mm Optimal @BBL A1. Actualizar si Bambu Lab cambia nombres en futuras versiones.*
