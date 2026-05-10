#!/usr/bin/env python3
"""
QMPEV · Qué Momento Para Estar Vivo
Procesador de capítulos · Simio Plateado / Anti Real Labs

Toma una carpeta con fotos capturadas en una expedición y genera un
capítulo en formato Markdown con tres explicaciones por foto, dirigidas
a humanos de 1525, 3000 a.C., y 50.000 a.C.

Uso básico:
    python3 qmpev_processor.py --inputs ../inputs/cap01-supermercado \\
                               --output ../outputs/cap01-supermercado.md \\
                               --titulo "Una mañana en el supermercado"

Requiere:
    pip install anthropic --break-system-packages
    export ANTHROPIC_API_KEY="sk-ant-..."

Autor: Claude (Cowork Simio Plateado) para Juan / Anti Real Labs
"""

import os
import sys
import base64
import argparse
import datetime
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("ERROR: necesitás instalar la librería oficial de Claude.")
    print("Corré: pip install anthropic --break-system-packages")
    sys.exit(1)


# ─── PROMPT CANÓNICO ────────────────────────────────────────────────
# Este es el corazón de QMPEV. Si lo cambiás, cambia el tono del proyecto.

PROMPT_QMPEV = """Mirá esta imagen con atención. Identificá el objeto principal o la
situación más característica que aparece. Después explicame ese objeto
o situación desde tres distancias temporales distintas, como si tuvieras
que hacérselo entender a alguien de cada época.

Reglas para las tres explicaciones:
- Sumergite en la mentalidad de cada época. Usá solo conceptos que
  estarían disponibles para esa persona.
- No expliques con metáforas modernas ("es como un teléfono pero...").
  Empezá desde cero, desde su mundo.
- Tono: directo, conversacional, en primera persona, casi místico.
  Como si estuvieras frente a esa persona y le pasaras el objeto.
- Que se sienta el asombro mutuo: el de la persona antigua frente a
  algo imposible, y el tuyo recordando que vivís rodeado de magia
  cotidiana.
- 70-100 palabras por explicación. No más.

╭──────────────────────────────────────────────────────────╮
│ 1. PARA ALGUIEN DE 1525 (modernidad temprana europea)    │
│                                                            │
│ Conoce: imprenta, relojes mecánicos, pólvora, ruedas,    │
│ papel, agua corriente en algunas ciudades, navegación    │
│ transoceánica reciente, Reforma protestante en marcha.    │
│ NO conoce: electricidad, motor de combustión, fotografía. │
╰──────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────╮
│ 2. PARA ALGUIEN DE 3000 A.C. (antigüedad mesopotámica)   │
│                                                            │
│ Conoce: escritura cuneiforme, agricultura intensiva,      │
│ rueda recién inventada, bronce, irrigación, ciudades,    │
│ astronomía básica, religión politeísta, comercio fluvial. │
│ NO conoce: hierro procesado, papel, cero matemático,     │
│ alfabeto fonético.                                         │
╰──────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────╮
│ 3. PARA ALGUIEN DE 50.000 A.C. (paleolítico superior)    │
│                                                            │
│ Conoce: fuego, herramientas de piedra tallada, lanzas,   │
│ arte rupestre, lenguaje hablado, organización tribal,    │
│ entierros con flores y ofrendas, cuevas como vivienda.   │
│ NO conoce: agricultura, metales, escritura, rueda,       │
│ cualquier construcción permanente.                          │
╰──────────────────────────────────────────────────────────╯

Devuelve la respuesta en este formato exacto, sin texto adicional:

OBJETO: [una línea identificando qué es]

---

PARA 1525:
[explicación de 70-100 palabras]

---

PARA 3000 A.C.:
[explicación de 70-100 palabras]

---

PARA 50.000 A.C.:
[explicación de 70-100 palabras]
"""


# ─── PROCESAMIENTO ──────────────────────────────────────────────────


def encode_imagen_base64(ruta: Path) -> tuple[str, str]:
    """Lee una imagen y la encodea como base64 con su mime type correcto."""
    suffix = ruta.suffix.lower().lstrip(".")
    if suffix in ("jpg", "jpeg"):
        media_type = "image/jpeg"
    elif suffix == "png":
        media_type = "image/png"
    elif suffix == "webp":
        media_type = "image/webp"
    elif suffix == "gif":
        media_type = "image/gif"
    else:
        raise ValueError(f"Formato no soportado: {suffix}")
    with open(ruta, "rb") as f:
        encoded = base64.standard_b64encode(f.read()).decode("utf-8")
    return encoded, media_type


def procesar_imagen(client, imagen_path: Path, model: str = "claude-opus-4-6") -> str:
    """Llama a Claude con visión. Devuelve el texto formateado de la respuesta."""
    encoded, media_type = encode_imagen_base64(imagen_path)
    response = client.messages.create(
        model=model,
        max_tokens=2048,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": encoded,
                        },
                    },
                    {"type": "text", "text": PROMPT_QMPEV},
                ],
            }
        ],
    )
    return response.content[0].text


def parsear_respuesta(texto: str) -> dict:
    """Parsea la respuesta de Claude en sus partes."""
    out = {"objeto": "", "1525": "", "3000ac": "", "50000ac": ""}
    bloques = texto.split("---")
    for b in bloques:
        b = b.strip()
        if b.startswith("OBJETO:"):
            out["objeto"] = b.replace("OBJETO:", "").strip()
        elif b.startswith("PARA 1525:"):
            out["1525"] = b.replace("PARA 1525:", "").strip()
        elif b.startswith("PARA 3000 A.C.:"):
            out["3000ac"] = b.replace("PARA 3000 A.C.:", "").strip()
        elif b.startswith("PARA 50.000 A.C.:") or b.startswith("PARA 50000 A.C.:"):
            out["50000ac"] = (
                b.replace("PARA 50.000 A.C.:", "")
                .replace("PARA 50000 A.C.:", "")
                .strip()
            )
    return out


def construir_markdown(
    titulo: str,
    fecha: str,
    capitulo_num: str,
    items: list[dict],
) -> str:
    """Genera el markdown del capítulo completo."""
    lines = []
    lines.append(f"# QMPEV / Capítulo {capitulo_num} — {titulo}")
    lines.append("")
    lines.append(f"*{fecha} · {len(items)} objetos capturados*")
    lines.append("")
    lines.append(
        "*Qué Momento Para Estar Vivo es un proyecto continuo de Simio Plateado. "
        "Cada capítulo es una expedición donde se capturan objetos y situaciones "
        "del mundo cotidiano, y se intenta explicarlos a humanos de tres épocas "
        "anteriores. Es un ejercicio de extrañamiento, una manera de recordar "
        "que vivimos rodeados de magia.*"
    )
    lines.append("")
    lines.append("---")
    lines.append("")

    for i, item in enumerate(items, start=1):
        num = f"{i:02d}"
        lines.append(f"## {num} · {item['parsed']['objeto']}")
        lines.append("")
        lines.append(f"![{item['parsed']['objeto']}]({item['imagen_relativa']})")
        lines.append("")
        lines.append("**Para alguien de 1525**")
        lines.append("")
        lines.append(item["parsed"]["1525"])
        lines.append("")
        lines.append("**Para alguien de 3000 a.C.**")
        lines.append("")
        lines.append(item["parsed"]["3000ac"])
        lines.append("")
        lines.append("**Para alguien de 50.000 a.C.**")
        lines.append("")
        lines.append(item["parsed"]["50000ac"])
        lines.append("")
        lines.append("---")
        lines.append("")

    lines.append("")
    lines.append("*Fin del capítulo. Procesado con Claude vía API local. "
                 "Ningún dato persona ni metadato se transmitió fuera de "
                 "tu sesión. Las fotos viven en tu disco.*")
    lines.append("")
    lines.append("*Anti Real Labs · Simio Plateado · 2026*")

    return "\n".join(lines)


# ─── MAIN ──────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="QMPEV · procesar un capítulo de fotos",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--inputs",
        required=True,
        help="Carpeta con las fotos capturadas (.jpg/.png)",
    )
    parser.add_argument(
        "--output",
        required=True,
        help="Archivo .md de salida",
    )
    parser.add_argument(
        "--titulo",
        required=True,
        help='Título del capítulo, ej: "Una mañana en el supermercado"',
    )
    parser.add_argument(
        "--num",
        default=None,
        help='Número del capítulo en dos dígitos, ej: "01" (default: timestamp)',
    )
    parser.add_argument(
        "--model",
        default="claude-opus-4-6",
        help="Modelo de Claude a usar",
    )
    args = parser.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: definí la variable de entorno ANTHROPIC_API_KEY")
        print('  export ANTHROPIC_API_KEY="sk-ant-..."')
        sys.exit(1)

    inputs_dir = Path(args.inputs).expanduser().resolve()
    if not inputs_dir.is_dir():
        print(f"ERROR: la carpeta {inputs_dir} no existe")
        sys.exit(1)

    output_path = Path(args.output).expanduser().resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Listar imágenes
    extensiones = {".jpg", ".jpeg", ".png", ".webp"}
    imagenes = sorted(
        [p for p in inputs_dir.iterdir() if p.suffix.lower() in extensiones]
    )
    if not imagenes:
        print(f"No encontré imágenes en {inputs_dir}")
        sys.exit(1)

    fecha = datetime.date.today().isoformat()
    capitulo_num = args.num or datetime.datetime.now().strftime("%Y%m%d")

    print(f"\nQMPEV · procesando {len(imagenes)} imágenes")
    print(f"Modelo: {args.model}")
    print(f"Capítulo: {capitulo_num} — {args.titulo}")
    print()

    client = anthropic.Anthropic(api_key=api_key)

    items = []
    for i, img in enumerate(imagenes, start=1):
        print(f"  [{i}/{len(imagenes)}] {img.name} ... ", end="", flush=True)
        try:
            texto = procesar_imagen(client, img, args.model)
            parsed = parsear_respuesta(texto)
            items.append(
                {
                    "imagen_path": img,
                    "imagen_relativa": img.name,
                    "raw_text": texto,
                    "parsed": parsed,
                }
            )
            print(f"OK · {parsed['objeto'][:40]}")
        except Exception as e:
            print(f"ERROR · {e}")

    if not items:
        print("\nNingún ítem procesado correctamente.")
        sys.exit(1)

    # Generar markdown
    md = construir_markdown(args.titulo, fecha, capitulo_num, items)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(md)

    print(f"\n✓ Capítulo guardado en {output_path}")
    print(f"✓ {len(items)} objetos procesados, {len(imagenes) - len(items)} fallaron")
    print()
    print("Próximo paso: copiá las imágenes a la misma carpeta del .md")
    print("para que las referencias relativas funcionen al abrirlo.")


if __name__ == "__main__":
    main()
