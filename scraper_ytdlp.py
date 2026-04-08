#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scraper de transcripciones con yt-dlp - Italiano Per Piacere
Ventajas sobre youtube-transcript-api:
  - Usa tus cookies reales del navegador (evita bloqueos de IP)
  - Mas robusto ante cambios de YouTube
  - Soporta mas formatos de subtitulos

Uso:
  python scraper_ytdlp.py              -> procesa todos los modulos
  python scraper_ytdlp.py 4 <url>      -> procesa solo ese modulo
"""

import re
import sys
import json
import subprocess
import time
import random
from pathlib import Path

BASE_DIR = Path("C:/Users/User/Desktop/proyectos/italianoperpiacere/entregablesFinales/A1")
LANG_PREFERENCE = ["it", "it-IT", "en"]

# Navegador del que tomar las cookies (Chrome, Firefox, Edge, Opera, Brave, Chromium)
COOKIE_BROWSER = "chrome"


def extract_video_id(url: str) -> str:
    patterns = [
        r"youtu\.be/([a-zA-Z0-9_-]{11})",
        r"youtube\.com/shorts/([a-zA-Z0-9_-]{11})",
        r"[?&]v=([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError(f"No se pudo extraer ID de: {url}")


def format_time(seconds: float) -> str:
    m = int(seconds // 60)
    s = int(seconds % 60)
    return f"{m:02d}:{s:02d}"


def fetch_transcript_ytdlp(video_id: str, use_cookies: bool = True):
    """Descarga subtitulos con yt-dlp y devuelve lista de (start, text)."""
    url = f"https://www.youtube.com/watch?v={video_id}"

    cmd = [
        "yt-dlp",
        "--skip-download",
        "--write-subs",
        "--write-auto-subs",
        "--sub-langs", ",".join(LANG_PREFERENCE),
        "--sub-format", "json3",
        "--output", "%(id)s",
        "--no-playlist",
        "--remote-components", "ejs:github",
        "--quiet",
        url
    ]

    if use_cookies:
        cmd += ["--cookies-from-browser", COOKIE_BROWSER]

    result = subprocess.run(cmd, capture_output=True, text=True)

    # Buscar el archivo generado
    for lang in LANG_PREFERENCE:
        for suffix in [f"{video_id}.{lang}.json3",
                       f"{video_id}.{lang}-orig.json3"]:
            p = Path(suffix)
            if p.exists():
                data = json.loads(p.read_text(encoding="utf-8"))
                p.unlink()  # limpiar archivo temporal
                entries = []
                for event in data.get("events", []):
                    start = event.get("tStartMs", 0) / 1000.0
                    segs = event.get("segs", [])
                    text = "".join(s.get("utf8", "") for s in segs).strip()
                    if text and text != "\n":
                        entries.append({"start": start, "text": text.replace("\n", " ")})
                return entries, lang

    raise RuntimeError(f"No se encontraron subtitulos. stderr: {result.stderr[:300]}")


def save_transcript(modulo_num: int, titulo: str, url: str, entries: list, lang: str):
    folder = BASE_DIR / f"modulo_{modulo_num}"
    folder.mkdir(parents=True, exist_ok=True)
    output_path = folder / "transcript.txt"

    lines = []
    lines.append(f"# TRANSCRIPCION - Modulo {modulo_num}: {titulo}")
    lines.append(f"# URL: {url}")
    lines.append(f"# Idioma: {lang}")
    lines.append(f"# Segmentos: {len(entries)}")
    lines.append("=" * 60)
    lines.append("")

    full_text = []
    for entry in entries:
        time_str = format_time(entry["start"])
        text = entry["text"].strip()
        lines.append(f"[{time_str}]  {text}")
        full_text.append(text)

    lines.append("")
    lines.append("=" * 60)
    lines.append("# TEXTO COMPLETO (sin timestamps):")
    lines.append("")
    lines.append(" ".join(full_text))

    output_path.write_text("\n".join(lines), encoding="utf-8")
    return output_path


def process_modulo(modulo_num: int, titulo: str, url: str):
    print(f"\n{'='*50}")
    print(f"  Modulo {modulo_num}: {titulo}")

    # Saltar si ya existe
    existing = BASE_DIR / f"modulo_{modulo_num}" / "transcript.txt"
    if existing.exists():
        print(f"  SALTADO - ya existe transcript.txt")
        return

    try:
        video_id = extract_video_id(url)
        print(f"  Video ID: {video_id}")
        print(f"  Descargando con yt-dlp (cookies de {COOKIE_BROWSER})...")

        entries, lang = fetch_transcript_ytdlp(video_id, use_cookies=True)
        print(f"  OK - {len(entries)} segmentos ({lang})")

        path = save_transcript(modulo_num, titulo, url, entries, lang)
        print(f"  Guardado: {path}")

    except Exception as e:
        print(f"  Intentando sin cookies...")
        try:
            video_id = extract_video_id(url)
            entries, lang = fetch_transcript_ytdlp(video_id, use_cookies=False)
            print(f"  OK - {len(entries)} segmentos ({lang})")
            path = save_transcript(modulo_num, titulo, url, entries, lang)
            print(f"  Guardado: {path}")
        except Exception as e2:
            print(f"  ERROR: {e2}")
            folder = BASE_DIR / f"modulo_{modulo_num}"
            folder.mkdir(parents=True, exist_ok=True)
            (folder / "transcript_ERROR.txt").write_text(
                f"# ERROR\n# Modulo {modulo_num}: {titulo}\n# URL: {url}\n# Error: {e2}\n",
                encoding="utf-8"
            )


# =====================================================
# LISTA DE MODULOS
# =====================================================
MODULOS = [
    # (0, "Come ti chiami?", ya hecho)
    (1,  "Di dove sei?",              "https://www.youtube.com/watch?v=tDESxMneCuM"),
    (2,  "Una notte a Roma",          "https://youtu.be/nJ0gKWX8mjM"),
    (3,  "Che ore sono?",             "https://www.youtube.com/watch?v=7mi5_TnIORo"),
    (4,  "Che lavoro fai?",           "https://youtu.be/VsEBjpQTlyY"),
    (5,  "Al bar",                    "https://youtu.be/2_VwcAlQUyU"),
    (6,  "La mia giornata",           "https://www.youtube.com/watch?v=-ECZVRh6sgk"),
    (7,  "In famiglia",               "https://youtu.be/mvl1hKoWWdM"),
    (8,  "In treno o in macchina?",   "https://youtu.be/nmtMdxkKHUo"),
    (9,  "Mi piace moltissimo!",      "https://youtu.be/7RXiaCyz7O8"),
    (10, "Il concerto è andato bene!","https://youtu.be/FpOEN93LX-E"),
    (11, "Ieri sera",                 "https://youtu.be/9A5gTgcgQ-I"),
]


if __name__ == "__main__":
    print("Scraper yt-dlp - Italiano Per Piacere")
    print(f"Carpeta base: {BASE_DIR}")

    if len(sys.argv) == 3:
        num = int(sys.argv[1])
        url = sys.argv[2]
        process_modulo(num, f"Modulo {num}", url)
    else:
        print(f"Modulos a procesar: {len(MODULOS)}")
        for i, (num, titulo, url) in enumerate(MODULOS):
            process_modulo(num, titulo, url)
            if i < len(MODULOS) - 1:
                delay = random.uniform(3, 6)
                print(f"  Pausa {delay:.1f}s...")
                time.sleep(delay)

    print(f"\nListo. Archivos en: {BASE_DIR}")
