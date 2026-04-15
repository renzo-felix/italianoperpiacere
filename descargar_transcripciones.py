# ─────────────────────────────────────────────────────────────────────────────
# descargar_transcripciones.py
# Descarga la transcripcion de YouTube con timestamps y la guarda en la
# carpeta del modulo como "transcripcion_dialogo.txt"
#
# Formato de salida:
#   [mm:ss]  texto del fragmento
# ─────────────────────────────────────────────────────────────────────────────

import re
import os
import sys
from youtube_transcript_api import YouTubeTranscriptApi

# Forzar UTF-8 en stdout para evitar errores de encoding en Windows
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE = r"C:\Users\User\Desktop\proyectos\italianoperpiacere\entregablesFinales\A1"

MODULOS = [
    {
        "titulo":  "Modulo 0 - Come ti chiami?",
        "url":     "https://youtu.be/QRG6v-I5XUE",
        "carpeta": os.path.join(BASE, "modulo_0"),
    },
    {
        "titulo":  "Modulo 1 - Di dove sei?",
        "url":     "https://youtu.be/OqOh7Ss5ULE",
        "carpeta": os.path.join(BASE, "modulo_1"),
    },
    {
        "titulo":  "Modulo 2 - Mi dai il tuo numero?",
        "url":     "https://youtu.be/YXFZ63W1ezQ",
        "carpeta": os.path.join(BASE, "modulo_2"),
    },
    {
        "titulo":  "Modulo 3 - Tutti in piazza!",
        "url":     "https://youtu.be/GdVkENlq8Zg",
        "carpeta": os.path.join(BASE, "modulo_3"),
    },
    {
        "titulo":  "Modulo 4 - Che lavoro fai?",
        "url":     "https://youtu.be/9lMBKecejn4",
        "carpeta": os.path.join(BASE, "modulo_4"),
    },
    {
        "titulo":  "Modulo 5 - Che ore sono?",
        "url":     "https://youtu.be/0g08cNpAibE",
        "carpeta": os.path.join(BASE, "modulo_5"),
    },
    {
        "titulo":  "Modulo 6 - A tavola!",
        "url":     "https://youtu.be/XTUf8PCdgog",
        "carpeta": os.path.join(BASE, "modulo_6"),
    },
]

IDIOMAS_PREF = ["it", "es", "en"]


def extraer_video_id(url: str) -> str:
    patrones = [
        r"youtu\.be/([A-Za-z0-9_-]{11})",
        r"youtube\.com/watch\?.*v=([A-Za-z0-9_-]{11})",
        r"youtube\.com/shorts/([A-Za-z0-9_-]{11})",
        r"youtube\.com/embed/([A-Za-z0-9_-]{11})",
    ]
    for p in patrones:
        m = re.search(p, url)
        if m:
            return m.group(1)
    raise ValueError(f"No se pudo extraer video_id de: {url}")


def seg_a_timestamp(segundos: float) -> str:
    """Convierte segundos en formato [mm:ss]."""
    total = int(segundos)
    hh = total // 3600
    mm = (total % 3600) // 60
    ss = total % 60
    if hh > 0:
        return f"[{hh:02d}:{mm:02d}:{ss:02d}]"
    return f"[{mm:02d}:{ss:02d}]"


def obtener_fragmentos(api, video_id: str):
    """
    Devuelve lista de fragmentos raw (con start, duration, text).
    Prioridad: it > es > en > cualquier idioma.
    """
    tl = api.list(video_id)
    transcripts = list(tl)

    if not transcripts:
        raise Exception("No hay transcripciones disponibles")

    for lang in IDIOMAS_PREF:
        for t in transcripts:
            if t.language_code == lang:
                return list(api.fetch(video_id, languages=[lang])), lang

    lang_code = transcripts[0].language_code
    return list(api.fetch(video_id, languages=[lang_code])), lang_code


def formatear_con_timestamps(fragmentos) -> str:
    """
    Genera texto con una linea por fragmento:
      [mm:ss]  texto
    """
    lineas = []
    for f in fragmentos:
        texto = f.text.strip()
        texto = re.sub(r"\s+", " ", texto)
        if not texto:
            continue
        ts = seg_a_timestamp(f.start)
        lineas.append(f"{ts}  {texto}")
    return "\n".join(lineas)


def guardar(carpeta: str, titulo: str, contenido: str, idioma: str, total: int):
    os.makedirs(carpeta, exist_ok=True)
    ruta = os.path.join(carpeta, "transcripcion_dialogo.txt")
    separador = "=" * 60
    texto_final = (
        f"{separador}\n"
        f"{titulo}\n"
        f"Idioma: {idioma}  |  Fragmentos: {total}\n"
        f"{separador}\n\n"
        f"{contenido}\n"
    )
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(texto_final)
    print(f"  OK  {total} fragmentos  ->  {ruta}")


# ─── MAIN ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\nDescargando transcripciones con timestamps...\n")

    api = YouTubeTranscriptApi()
    errores = []

    for mod in MODULOS:
        print(f">> {mod['titulo']}")
        try:
            vid_id = extraer_video_id(mod["url"])
            print(f"   video_id: {vid_id}")
            fragmentos, idioma = obtener_fragmentos(api, vid_id)
            contenido = formatear_con_timestamps(fragmentos)
            guardar(mod["carpeta"], mod["titulo"], contenido, idioma, len(fragmentos))
        except Exception as e:
            msg = str(e)
            print(f"  ERR  {msg}")
            errores.append((mod["titulo"], msg))
        print()

    print("-" * 60)
    if errores:
        print(f"\nTerminado con {len(errores)} error(es):")
        for titulo, msg in errores:
            print(f"   - {titulo}: {msg}")
    else:
        print("OK  Todas las transcripciones descargadas correctamente.")
    print()
