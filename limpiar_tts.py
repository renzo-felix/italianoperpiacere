# limpiar_tts.py
# Elimina toda la funcionalidad TTS de los HTML de etapa2 (M0-M7)
# y deja solo el reproductor de YouTube.

import re, os

BASE = r"C:\Users\User\Desktop\proyectos\italianoperpiacere\entregablesFinales\A1"

MODULOS = [f"modulo_{i}" for i in range(8)]

# ─── Patrones HTML a eliminar (multilinea) ────────────────────────────────────

HTML_REMOVE = [
    # Boton "Escuchar todo el dialogo" (M0-M3)
    (r'<button\s+class="listen-all-btn"[^>]*>[\s\S]*?</button>', ''),
    # Boton "btn-play-all" (M3+)
    (r'<button\s+class="btn-play-all"[^>]*>[\s\S]*?</button>', ''),
    # div.dial-actions con boton ▶ Escuchar (M0-M3)
    (r'<div\s+class="dial-actions">[\s\S]*?</div>', ''),
    # button.btn-line-play (M4-M7)
    (r'<button\s+class="btn-line-play"[^>]*>[\s\S]*?</button>', ''),
    # div.tts-note
    (r'<div\s+class="tts-note"[^>]*>[\s\S]*?</div>', ''),
    # button.alfa-speak (vocabulario con TTS)
    (r'<button\s+class="alfa-speak"[^>]*>[\s\S]*?</button>', ''),
    # Lineas sueltas con solo onclick="ippAudio(...)"
    (r'<button[^>]*onclick="ippAudio\([^)]*\)"[^>]*>[\s\S]*?</button>', ''),
]

# ─── Bloques JS a eliminar (comentario de seccion + funcion) ─────────────────

JS_BLOCKS_REMOVE = [
    # IPP Voice Preloader block completo
    r'// ── IPP Voice Preloader ──[\s\S]*?}\s*\n',
    # Bloque de TTS con comentario
    r'/\* ═+\s*TTS[\s\S]*?═+ \*/[\s\S]*?(?=\n\s*/\* ═)',
    # function ippAudio
    r'function ippAudio\([\s\S]*?\n  \}',
    # function ippAudioGendered
    r'function ippAudioGendered\([\s\S]*?\n  \}',
    # DIAL_LINES_DATA
    r'const DIAL_LINES_DATA = \[[\s\S]*?\];\s*\n',
    # _dialogTimer
    r'var _dialogTimer = null;\s*\n',
    # function playLine
    r'function playLine\([\s\S]*?\n  \}',
    # function speakAllDialog
    r'function speakAllDialog\([\s\S]*?\n  \}',
    # function playAllDialog (M3-M7)
    r'function playAllDialog\([\s\S]*?\n  \}',
    # function playLineAudio / playDialogLine (variantes en otros modulos)
    r'function playLine\w*\([\s\S]*?\n  \}',
]

# ─── CSS a eliminar ───────────────────────────────────────────────────────────

CSS_REMOVE = [
    r'\.alfa-speak\s*\{[^}]*\}',
    r'\.alfa-speak:hover\s*\{[^}]*\}',
    r'\.alfa-speak\.playing\s*\{[^}]*\}',
    r'\.listen-all-btn[^{]*\{[^}]*\}',
    r'\.dial-play-btn[^{]*\{[^}]*\}',
    r'\.btn-play-all[^{]*\{[^}]*\}',
    r'\.btn-line-play[^{]*\{[^}]*\}',
    r'\.tts-note\s*\{[^}]*\}',
]


def limpiar(html):
    # 1. Eliminar elementos HTML
    for pattern, repl in HTML_REMOVE:
        html = re.sub(pattern, repl, html, flags=re.DOTALL)

    # 2. Eliminar bloques JS
    for pattern in JS_BLOCKS_REMOVE:
        html = re.sub(pattern, '', html, flags=re.DOTALL)

    # 3. Eliminar reglas CSS
    for pattern in CSS_REMOVE:
        html = re.sub(pattern, '', html, flags=re.DOTALL)

    # 4. Asegurar que el texto del dialogo siempre sea visible
    #    (quitar cualquier opacity:0 / visibility:hidden inline que haya quedado)
    #    Los spans dial-sub deben ser visibles por defecto
    html = re.sub(r'(\.dial-sub\s*\{[^}]*?)opacity\s*:\s*0([^}]*\})', r'\1opacity:1\2', html)

    # 5. Limpiar lineas en blanco multiples (mas de 2 seguidas)
    html = re.sub(r'\n{3,}', '\n\n', html)

    return html


if __name__ == '__main__':
    print('\nLimpiando TTS de etapa2_descubrimiento.html (M0-M7)...\n')
    for mod in MODULOS:
        path = os.path.join(BASE, mod, 'etapa2_descubrimiento.html')
        if not os.path.exists(path):
            print(f'  SKIP  {mod}')
            continue
        with open(path, encoding='utf-8') as f:
            html = f.read()
        html_limpio = limpiar(html)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html_limpio)
        print(f'  OK    {mod}')
    print('\nListo.\n')
