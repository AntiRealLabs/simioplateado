# QMPEV · Qué Momento Para Estar Vivo

**Proyecto continuo de Simio Plateado / Anti Real Labs**

QMPEV es la operación filosófica fundamental del proyecto materializada en dispositivo. Una cámara captura objetos y situaciones del mundo cotidiano. Un script procesa cada captura con Claude (visión) y genera tres explicaciones: para alguien de 1525, para alguien de 3000 a.C., y para alguien de 50.000 a.C.

El resultado es un reportaje recurrente del asombro. Cada capítulo es una expedición. Cada objeto es una invitación a recordar que vivimos rodeados de magia.

> *"Este proyecto literaliza el logo de Simio Plateado. El simio es la cámara. La cámara es el simio observando nuestro mundo desde fuera del tiempo. Nosotros somos los humanos antiguos a quienes hay que explicarles las cosas."*

---

## Estructura de carpetas

```
qmpev/
├── README.md           ← este archivo
├── scripts/
│   └── qmpev_processor.py    ← el procesador
├── inputs/
│   ├── cap01-supermercado/   ← fotos de cada expedición, una carpeta por capítulo
│   ├── cap02-centro/
│   └── ...
└── outputs/
    ├── cap01-supermercado.md ← capítulo procesado, listo para publicar
    ├── cap02-centro.md
    └── ...
```

---

## Cómo se hace una expedición QMPEV

### 1. Salir a mirar

Llevás la cámara (ESP32-CAM en cajita portable) cuando estás en un contexto interesante. Disparás cuando algo te llama la atención. La cámara guarda en microSD.

### 2. Volver a casa y pasar las fotos

Conectás la microSD al Mac. Copiás las fotos a una carpeta nueva dentro de `qmpev/inputs/` con nombre descriptivo:

```
qmpev/inputs/cap01-supermercado/
  ├── img001.jpg
  ├── img002.jpg
  └── ...
```

### 3. Procesar el capítulo

Primero, una sola vez, instalá la librería de Claude:

```bash
pip install anthropic --break-system-packages
```

Definí tu API key en la terminal (creás una en console.anthropic.com → API Keys):

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

(Para que se guarde permanente, agregá esa línea a `~/.zshrc` o `~/.bash_profile`).

Después corré el procesador:

```bash
cd /Users/elmackinon/Documents/ANTI\ Mackinon/Playground2/simio-plateado/qmpev
python3 scripts/qmpev_processor.py \
    --inputs inputs/cap01-supermercado \
    --output outputs/cap01-supermercado.md \
    --titulo "Una mañana en el supermercado" \
    --num 01
```

El script imprime el progreso, una imagen por línea. Tarda ~10-15 segundos por imagen (depende de Claude y de internet).

### 4. Revisar y publicar

Abrí el `.md` resultante con cualquier editor (VS Code, Obsidian, Typora). Las imágenes deben estar en la misma carpeta que el `.md`, así que copialas:

```bash
cp inputs/cap01-supermercado/*.jpg outputs/
```

Si alguna explicación quedó floja, podés:
- Editarla a mano
- Volver a procesar solo esa imagen con un prompt distinto
- Borrar el ítem entero del capítulo

Cuando estés contento con el capítulo, lo subís al sitio Simio Plateado en la sección QMPEV.

---

## Costos aproximados

Claude Opus 4.6 vía API cuesta ~$0.015-0.025 USD por imagen procesada (depende del tamaño y complejidad). Una expedición de 30 fotos cuesta ~$0.50-0.75 USD.

Si querés ahorrar, cambiá al modelo más barato (Claude Haiku 4.5) editando `--model claude-haiku-4-5-20251001` al correr el script. Calidad menor pero ~10× más barato.

---

## Filosofía del proyecto

QMPEV se inscribe en la tradición filosófica del **extrañamiento** (*ostranenie* en formalismo ruso, *Verfremdungseffekt* en Brecht). La función del arte, según Shklovsky, es hacer extraño lo familiar para que volvamos a verlo.

QMPEV aplica esto con dispositivo: la cámara extraña, el LLM traduce, el lector recuerda. Un teléfono visto por alguien del paleolítico es un objeto mágico. Verlo así, aunque sea por un párrafo, devuelve el asombro a lo cotidiano.

No es un producto. Es un proyecto continuo. Como *Destrúyelo todo* es manifiesto, QMPEV es práctica. Los dos son texto-anclas de Simio Plateado.

---

## Privacidad y datos

QMPEV usa Claude vía API. Anthropic recibe las imágenes durante el procesamiento pero no las guarda para entrenamiento (política de API). Las imágenes y los textos viven en tu disco local. Ningún dato personal se transmite intencionalmente.

Si las fotos contienen rostros de otras personas, considerá borrarlas o desenfocarlas antes de publicar el capítulo. La doctrina del proyecto es anti-vigilancia.

---

*Anti Real Labs · Simio Plateado · 2026*
