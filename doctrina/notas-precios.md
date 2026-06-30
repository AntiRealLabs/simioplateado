# Notas de precios · Simio Plateado

*Archivo de decisiones de precio pendientes de incorporar a la doctrina formal cuando se escriba la `DOCTRINA_VISUAL_SIMIO_PLATEADO.md` o un eventual `DOCTRINA_COMERCIAL.md`.*

Fecha de la decisión: 2026-05-10. Autor: Juan + Cowork.

---

## Actualización 2026-05-29 · moneda operativa

El documento conserva la escalera **USD** como memoria curatorial del Drop 001: sirve para comparar tiers, rareza y posición estética del catálogo. Desde la integración de Mercado Pago, las piezas con **compra abierta** se cobran operativamente en **COP**, porque Mercado Pago Colombia liquida en pesos colombianos.

Regla vigente:

- **Compra abierta**: COP como precio principal de checkout, con referencia USD aproximada cuando ayude a lectura internacional.
- **IRREAL / gestándose**: USD puede seguir funcionando como precio proyectado curatorial, no como cobro activo.
- **IMPOSIBLE**: sigue sin precio, solo raya `—`.

Esta actualización no invalida la lógica de tiers: traduce la capa transaccional al procesador real sin convertir la página en retail genérico.

---

## Principio rector

> "El precio es una pieza estética más de la página. Habla del producto, la calidad, la exclusividad. No de la avaricia ni del engreimiento." — Juan, 2026-05-10.

La posición correcta no es ni la del low-cost mass-market ni la del hype-tier (Supreme, KAWS Medicom, NFT-era). La referencia operativa es la franja del **coleccionable curado de tirada corta** — el mismo lugar donde se sitúan los artistas Pettibon-influenced que venden objeto hoy, Nieves Books con sus zines hand-bound, Sub Pop con sus tees hand-printed. Premium sin grift.

---

## Dos ejes de "punto de entrada" — no confundir

Una pieza puede ser **punto de entrada** en dos sentidos distintos, y a veces opuestos:

**Eje A · punto de entrada por precio** — la primera compra accesible del catálogo (dentro de cada tier). Responde a la economía del cliente. Pieza que cumple este rol en el Drop 001 (escultórico Tier 2): **COPA_CHISTE_COLOMBIA.v0 · USD 64**. Pieza que cumple ese rol dentro de Tier 4: **PLANTI pequeño · USD 168**.

**Eje B · punto de entrada por viabilidad** — la primera pieza que pasa de IRREAL a REAL. Responde a la viabilidad de producción. Piezas que cumplen este rol en el Drop 001: **TRAUMIN.v01** y **DIALOGUIN.v01** (las más realizables técnicamente, según evaluación de Juan 2026-05-10).

La dificultad técnica de una pieza **no debe bajar su precio** — debe subirlo, o expulsarla a la categoría IMPOSIBLE. Una pieza casi-imposible-de-fabricar barata es incoherente: la rareza es parte del valor estético.

---

## Tier por composición tecnológica (regla fundamental)

Una pieza no se cobra solo por mérito conceptual o trabajo artesanal — se cobra dentro del tier que su **composición material y tecnológica** le corresponde. Subir de tier exige cambio de composición, no solo de ambición.

| Tier | Composición                                                          | Franja USD  |
| ---- | -------------------------------------------------------------------- | ----------- |
| 1    | Wearables con estampado simple (camisetas, gorra)                    | 30 – 50     |
| 2    | Escultura 3D printed + hand-finishing, **sin electrónica**           | 50 – 150    |
| 3    | Wearables artesanales hand-painted (gafas)                           | 120 – 150   |
| 4    | Objetos con TinyML / parlante / microcontrolador                     | 160 – 240+  |
| 5    | IMPOSIBLE — exhibición pura                                          | `—`         |

**Regla operativa**: el techo natural de una escultura sin electrónica está cerca de $150. Para subir más, la pieza tiene que cargar componentes electrónicos reales. Sin TinyML, no hay licencia para entrar en Tier 4. Suposición de "complejidad técnica" no comunicada al cliente = sobrepreciado y engreído.

**Consecuencia para versiones futuras**: una pieza puede tener su versión base en Tier 2 (sin tech, ej. `TUNI.v01` a $96) y una versión hermana en Tier 4 (con TinyML, ej. `TUNI.v02.PARLA` a $176). Eso le da al catálogo profundidad vertical: el mismo concepto en dos materialidades distintas, con precios honestos para cada una.

---

## Reglas tipográficas del precio · capa curatorial

1. **Prefijo `USD` en mayúsculas**, no signo `$`, para precios proyectados, memoria curatorial y piezas no transaccionales. Convención de catálogo / subasta. Lee como obra, no como retail.
2. **Número entero sin centavos**. Nunca `$148.00`. Nunca `$147.99`. Cero trucos psicológicos.
3. **No usar números redondos corporativos** ($50, $100, $150, $200). Todos los precios ligeramente off-round — firma tipográfica de "cada uno fue decidido", no "se aplicó una fórmula".
4. **Cualificador de tirada**, no número exacto. `tirada corta` / `tirada muy corta` / `serie` en lugar de `ed. 8`. Vuelve legible la escasez como parte del precio (no oculta en letra chica) y no encierra logísticamente.
5. **Wearables sin tag de edición** (no son numeradas). Solo `USD 48`.
6. **IMPOSIBLE sin precio**: `—` (raya em). Silencio tipográfico. El sello IMPOSIBLE hace el trabajo.
7. **Estado IRREAL muestra precio** (proyectado, no transaccional hoy). Es un acto curatorial: "si esto se materializa, esto cuesta". Refuerza la doctrina de existencia digital — propone imaginar pagar por algo que todavía vive como posibilidad.
8. **Compra abierta en Mercado Pago muestra COP primero**. Cuando la pieza ya se puede comprar, el precio deja de ser solo signo curatorial y pasa a ser instrucción de pago. En ese caso COP manda, USD queda como referencia.

Formato canónico:

```
USD 148 · tirada corta
```

En el grid (`.pieza .meta .precio`) el precio queda solo (`USD 148`); el tag de edición va en `.nota` aparte si conviene visualmente, o se integra en una línea con punto medio. A criterio de Codex en la integración.

---

## Escalera de precios · Drop 001

### Piezas escultóricas Tier 2 — IRREAL · existencia digital · sin electrónica

Estatuas de autores y objetos-chiste — escultura 3D printed + hand-finishing, sin pantalla ni componentes.

| Pieza                                    | USD | Edición             |
| ---------------------------------------- | --- | ------------------- |
| COPA_CHISTE_COLOMBIA.v0                  |  64 | tirada corta     |
| TRAUMIN.v01                              |  84 | tirada corta     |
| MARXITO.v01                              | 108 | tirada corta     |
| SUPERHOMBRESITO.v01 (Nietzsche)          | 108 | tirada corta     |
| DIALOGUIN.v01 (Deleuze + Guattari)       | 132 | tirada muy corta |
| MINI_DEVENIRES.v01                       | 148 | tirada corta     |

**MINI_DEVENIRES.v01** queda como techo de Tier 2 (USD 148, viabilidad técnica confirmada por Meshy 2026-05-10). No sube más porque no tiene electrónica — la franja $160+ está reservada para Tier 4.

**SUPERHOMBRESITO.v01** y **MARXITO.v01** quedan igualados a USD 108 — hermanos conceptuales (Nietzsche y Marx, dos filósofos singulares clásicos en versión chibi). La igualdad declara curaduría: *los autores no compiten en valor de mercado entre sí, comparten un mismo nivel del catálogo*. Misma lógica que las tres variantes TUNI igualadas.

### Piezas con pantalla / TinyML — Tier 4 — IRREAL · existencia digital · con electrónica

Familias TUNI y PLANTI cargan pantalla como parte canónica del concepto. La pantalla no es decoración: es microcomponente embebido (TinyML + display + alimentación), y eso determina su tier por composición.

| Pieza                                    | USD | Edición             |
| ---------------------------------------- | --- | ------------------- |
| PLANTI_PUNK.v01 / PLANTI_K.v01 (pequeño) | 168 | tirada corta     |
| TUNI.v01 (rosa / blanca / negra)         | 188 | tirada corta     |
| PLANTI_PUNK_XL.v01 / PLANTI_K_XL.v01     | 218 | tirada muy corta |

Las tres variantes TUNI quedan igualadas a 188 — la diferencia es de tono, no de costo. Igualarlas evita la lectura "la negra es más cara porque es la cool" (que sería un cliché Supreme-tier).

PLANTI XL ($218) es el techo del Drop 001 — formato grande con pantalla, tirada muy corta.

### Versiones hermanas futuras dentro de Tier 4 — reservadas

Si en fases posteriores aparecen variantes con TinyML más expresivo (parlante exterior, interacción con voz, etc.), la zona alta del Tier 4 sigue abierta:

| Variante hipotética                     | USD | Composición                                                        |
| --------------------------------------- | --- | ------------------------------------------------------------------ |
| `.PARLA` simple                         | 198 | + parlante interno + frases pregrabadas                            |
| `.PARLA.INTERACTIVO`                    | 228 | + altavoz exterior + sensores + diálogo                            |

Estas variantes no existen aún. El precio se justifica por electrónica adicional sobre la base que ya carga pantalla.

### Wearables (futuras)

| Pieza             | USD |
| ----------------- | --- |
| Camiseta blanca   |  34 |
| Camiseta negra    |  38 |
| Gorra             |  44 |
| PARCHAO (gafas)   | 138 |
| MELISIMO (gafas)  | 138 |

Las camisetas se bajaron de 48/52 a 34/38 (decisión Juan 2026-05-10) por principio doctrinal: *no ser abusivo por la marca cuando la pieza es objetivamente simple — una camiseta con estampado screen-printed.* Cobrar tier-coleccionable por un tee con estampado simple, por más curado que sea, lee como hype-premium injustificado y rompe la doctrina punk de "Sub Pop tees al precio de Sub Pop tees".

La diferencia $4 entre camiseta blanca y negra es honesta: imprimir sobre negro cuesta más. El comprador con ojo lo lee y suma legitimidad. No es pricing engineering, es transparencia.

La gorra ($44) queda por encima de las camisetas porque el bordado es objetivamente más trabajo que un screen print simple. Lectura ordenada de menor a mayor trabajo: blanca → negra → gorra.

### IMPOSIBLE (exhibición pura)

| Pieza            | USD |
| ---------------- | --- |
| AUDIO.ANTROPOS   | `—` |
| AUDIO.NEO        | `—` |
| AUDIO.OIMIS      | `—` |

Solo raya em. Sin moneda, sin número. El sello IMPOSIBLE habla.

### ESPEJO PLATEADO (línea personalizable)

Piezas únicas (1 de 1) con foto del cliente. Se diferencian del catálogo curado en que tienen **4 fases** en la vista Tienda en lugar de 3 (incluyen la fase inicial `VISTO`, que es la foto del cliente).

| Configuración                                  | USD |
| ---------------------------------------------- | --- |
| ESPEJO INDIVIDUAL (1 persona, estilo catálogo) | 128 |
| ESPEJO PAREJA (2 personas, estilo catálogo)    | 198 |
| ESPEJO FAMILIAR (3 personas, estilo catálogo)  | 268 |
| ESPEJO GRUPO (4-5 personas, estilo catálogo)   | 348 |
| Adicional CUSTOM (estilo fuera del catálogo)   | +30 |

Lógica: cada persona adicional agrega ~USD 70. El estilo NO afecta el precio (el cliente elige libremente del catálogo de 18 estilos: 6 Mitología + 6 Bestiario + 6 Art History). Ver `espejo-plateado.md` para catálogo completo de estilos y flujo de pedido.

ESPEJO INDIVIDUAL queda en USD 128 — entre el techo Tier 2 ($148) y el piso Tier 4 ($168). El precio refleja que cada ESPEJO es **único** (no edición pequeña, 1 de 1) e incluye trabajo personalizado de adaptación a la foto + iteración con cliente.

---

## Cadencia numérica (lectura tabular)

```
 34   camiseta blanca                  ← Tier 1 · piso del catálogo
 38   camiseta negra                   ← Tier 1
 44   gorra                            ← Tier 1
 64   copa-chiste                      ← Tier 2 · entrada Eje A escultórico
 84   traumin                          ← Tier 2 · entrada Eje B viabilidad
108   marxito / superhombresito        ← Tier 2 · autores singulares igualados
128   ESPEJO INDIVIDUAL                ← línea personalizable · piso ESPEJO
132   dialoguin                        ← Tier 2 · entrada Eje B viabilidad
138   parchao / melisimo               ← Tier 3 · wearable hand-painted
148   mini-devenires                   ← Tier 2 · techo Tier 2
--- salto natural Tier 2 → Tier 4 ($20 de gap doctrinal) ---
168   planti pequeño                   ← Tier 4 · entrada Tier 4
188   tuni (3 colores)                 ← Tier 4
198   ESPEJO PAREJA                    ← línea personalizable · 2 personas
218   planti XL                        ← Tier 4 · techo Drop 001
268   ESPEJO FAMILIAR                  ← línea personalizable · 3 personas
348   ESPEJO GRUPO                     ← línea personalizable · 4-5 personas
--- zona reservada Tier 4 futura ---
198   .PARLA simple
228   .PARLA interactivo
```

Rango activo del Drop 001: $34–$218. Cero números redondos corporativos. Cero terminaciones `99` o `95`. Todos los precios off-round, dentro de una sola orden de magnitud (relación piso-techo ~1:6.4).

Piso ($34) honesto para una camiseta hand-printed con estampado simple — no abusivo por la marca.
Techo ($218) cubre PLANTI XL con pantalla y tirada muy corta — lo más caro del catálogo está justificado por composición material (formato grande + electrónica), no por elevación arbitraria.

**Sobre el gap $148 → $168 entre Tier 2 y Tier 4**: $20 deliberados. Una pieza escultórica excepcional sin electrónica (MINI_DEVENIRES, techo Tier 2) queda apenas por debajo de una pieza pequeña con pantalla (PLANTI pequeño, piso Tier 4). Lectura doctrinal: *la pantalla agrega valor, no valor infinito. La maestría escultórica compite con la electrónica básica.* Eso protege al catálogo de la trampa "tech siempre vale más" — depende de qué tech y de qué escultura.

---

## Pendientes a revisitar

- Cuando alguna pieza pase de IRREAL a REAL (disponible), revisar si el precio proyectado sigue siendo coherente con el costo real de producción + margen artístico digno. Si la diferencia es grande, ajustar — pero documentar el ajuste aquí.
- Si el público lee los precios como "altos para arte joven colombiano" o "bajos para arte conceptual internacional", ese ruido en sí mismo es información sobre la posición de la marca. Escuchar antes de mover.
- Revisar periódicamente si el COP de compra abierta conserva el margen real de producción, empaque, envío nacional y comisión Mercado Pago.
- Considerar si el footer del sitio debería incluir una micro-nota: *"Las compras abiertas se cobran en COP; los precios USD de piezas IRREAL son proyecciones curatoriales."* — esto explicita la doctrina de existencia digital para quien lo lea con atención y no demanda nada a quien no.

---

*Archivo creado 2026-05-10. Acompaña a `notas-tipograficas.md`.*
