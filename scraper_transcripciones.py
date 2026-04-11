#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scraper de transcripciones de YouTube - Italiano Per Piacere
Uso:
  python scraper_transcripciones.py              -> procesa todos los modulos de la lista
  python scraper_transcripciones.py 1 <url>      -> procesa solo ese modulo con esa URL

Para cada modulo:
  - Crea la carpeta entregablesFinales/A1/modulo_N/ si no existe
  - Descarga la transcripcion del video de YouTube
  - Guarda transcript.txt con timestamps y texto completo
"""

import re
import os
import sys
import time
import random
from pathlib import Path

try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
    print("Instalando youtube-transcript-api...")
    os.system("pip install youtube-transcript-api -q")
    from youtube_transcript_api import YouTubeTranscriptApi


BASE_DIR = Path("C:/Users/User/Desktop/proyectos/italianoperpiacere/entregablesFinales/A1")
LANG_PREFERENCE = ["it", "it-IT", "en", "es"]


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
    raise ValueError(f"No se pudo extraer el ID del video de: {url}")


def format_time(seconds: float) -> str:
    m = int(seconds // 60)
    s = int(seconds % 60)
    return f"{m:02d}:{s:02d}"


def fetch_transcript(video_id: str):
    api = YouTubeTranscriptApi()
    transcript_list = api.list(video_id)

    for lang in LANG_PREFERENCE:
        try:
            t = transcript_list.find_transcript([lang])
            entries = t.fetch()
            return entries, lang
        except Exception:
            continue

    # Fallback: primer idioma disponible
    t = next(iter(transcript_list))
    entries = t.fetch()
    return entries, t.language_code


def save_transcript(modulo_num: int, titulo: str, url: str, entries, lang: str):
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

    full_text_parts = []
    for entry in entries:
        time_str = format_time(entry.start)
        text = entry.text.replace("\n", " ").strip()
        lines.append(f"[{time_str}]  {text}")
        full_text_parts.append(text)

    lines.append("")
    lines.append("=" * 60)
    lines.append("# TEXTO COMPLETO (sin timestamps):")
    lines.append("")
    lines.append(" ".join(full_text_parts))

    output_path.write_text("\n".join(lines), encoding="utf-8")
    return output_path


def process_modulo(modulo_num: int, titulo: str, url: str):
    print(f"\n{'='*50}")
    print(f"  Modulo {modulo_num}: {titulo}")
    print(f"  URL: {url}")

    # Saltar si ya existe transcript.txt
    existing = BASE_DIR / f"modulo_{modulo_num}" / "transcript.txt"
    if existing.exists():
        print(f"  SALTADO - ya existe: {existing}")
        return

    try:
        video_id = extract_video_id(url)
        print(f"  Video ID: {video_id}")

        print(f"  Descargando transcripcion...")
        entries, lang = fetch_transcript(video_id)
        print(f"  OK - {len(entries)} segmentos en idioma: {lang}")

        path = save_transcript(modulo_num, titulo, url, entries, lang)
        print(f"  Guardado en: {path}")

    except Exception as e:
        print(f"  ERROR: {e}")
        folder = BASE_DIR / f"modulo_{modulo_num}"
        folder.mkdir(parents=True, exist_ok=True)
        err_path = folder / "transcript_ERROR.txt"
        err_path.write_text(
            f"# ERROR al descargar transcripcion\n# Modulo {modulo_num}: {titulo}\n# URL: {url}\n# Error: {e}\n",
            encoding="utf-8"
        )
        print(f"  Log de error en: {err_path}")


# =====================================================
# LISTA DE MODULOS - editar aqui con tus videos
# Formato: (numero_modulo, "Titulo", "URL_YouTube")
# =====================================================
MODULOS = [
    (1,  "Di dove sei?",               "https://youtu.be/s7MBSo0E71o?si=rjFi6Lvw0J5IpOrK"),
# (2,  "Una notte a Roma",           "https://youtu.be/nJ0gKWX8mjM"),
# (3,  "Che ore sono?",              "https://www.youtube.com/watch?v=7mi5_TnIORo"),
# (4,  "Che lavoro fai?",            "https://youtu.be/VsEBjpQTlyY"),
# (5,  "Al bar",                     "https://youtu.be/2_VwcAlQUyU"),
# (6,  "La mia giornata",            "https://www.youtube.com/watch?v=-ECZVRh6sgk"),
# (7,  "In famiglia",                "https://youtu.be/mvl1hKoWWdM"),
# (8,  "In treno o in macchina?",    "https://youtu.be/nmtMdxkKHUo"),
# (9,  "Mi piace moltissimo!",       "https://youtu.be/7RXiaCyz7O8"),
# (10, "Il concerto è andato bene!", "https://youtu.be/FpOEN93LX-E"),  
# (11, "Ieri sera",                  "https://youtu.be/9A5gTgcgQ-I"),

]


if __name__ == "__main__":
    print("Scraper de Transcripciones - Italiano Per Piacere")
    print(f"Carpeta base: {BASE_DIR}")

    if len(sys.argv) == 3:
        # Modo: procesar un solo modulo pasado como argumento
        try:
            num = int(sys.argv[1])
            url = sys.argv[2]
            process_modulo(num, f"Modulo {num}", url)
        except (ValueError, IndexError):
            print("Uso: python scraper_transcripciones.py <numero_modulo> <url>")
    else:
        # Modo: procesar todos los modulos de la lista
        print(f"Modulos a procesar: {len(MODULOS)}")
        for i, (num, titulo, url) in enumerate(MODULOS):
            process_modulo(num, titulo, url)
            if i < len(MODULOS) - 1:
                delay = random.uniform(4, 8)
                print(f"  Esperando {delay:.1f}s antes del siguiente...")
                time.sleep(delay)

    print(f"\nListo. Archivos en: {BASE_DIR}")
