# patch_dialogs_yt.py
# Aplica el mismo diseño de dialogo YT que M0 a los modulos M1-M7.
# - Texto difuminado hasta apretar ▶
# - Boton ▶/⏸ por linea → reproduce el segmento YouTube
# - "Reproducir conversacion" + "Detener" centrados arriba
# - Sin TTS en el dialogo

import re, os

BASE = r"C:\Users\User\Desktop\proyectos\italianoperpiacere\entregablesFinales\A1"

# ─── Timestamps por modulo ────────────────────────────────────────────────────
TIMESTAMPS = {
    'modulo_1': {
        'videoId': 'OqOh7Ss5ULE',
        'lines': [(0,4),(4,11),(11,14),(14,21),(21,25),(25,33),(33,35),
                  (35,39),(39,48),(48,53),(53,62),(62,64),(64,68)]
    },
    'modulo_2': {
        'videoId': 'YXFZ63W1ezQ',
        'lines': [(0,3),(3,6),(6,15),(15,18),(18,30),(30,33),(33,48),
                  (48,51),(51,57),(57,69),(69,71),(71,77),(77,80),(77,80),
                  (80,83),(83,95),(95,97),(97,106),(106,112),(112,116)]
    },
    'modulo_3': {
        'videoId': 'GdVkENlq8Zg',
        'lines_dial1': [(0,2),(2,4),(4,6),(6,7),None,None,None,None,None,None],
        'lines_dial2': [(7,10),(10,13),(13,15),(15,17),None,None,None,None,None,None],
    },
    'modulo_4': {
        'videoId': '9lMBKecejn4',
        'lines': [(0,2),(2,7),None,None,None,None,None,None,None,
                  None,None,None,None,None,None,None,None]
    },
    'modulo_5': {
        'videoId': '0g08cNpAibE',
        'lines': [(0,3),(3,10),(10,13),(13,18),(18,21),(21,25),(25,27),
                  (27,30),(30,34),(34,38),(38,43),(43,50),(50,53),(53,59),
                  (55,62),(62,66),(66,72)]
    },
    'modulo_6': {
        'videoId': 'XTUf8PCdgog',
        'lines': [(0,2),(2,8),(8,13),(13,18),(18,23),(23,30),(30,35),
                  (35,43),(40,52),(47,52),(52,57),(57,64),(64,68),
                  (68,75),(73,83),(78,85)]
    },
    'modulo_7': {
        'videoId': 'XdJK-OLCiic',
        'lines': [(0,2.5),(2.5,9.2),(9.2,11.4),(11.4,19.2),(19.2,21.6),
                  (21.6,28),(28,33.3),(33.3,40.4),(40.4,42.7),(42.7,50.6),
                  (50.6,53.1),(53.1,60.7),(60.7,64),(64,72.2),(72.2,76.5),
                  (76.5,81.6),(81.6,87.6),(87.6,96)]
    },
}

def ts_to_js(ts_list):
    parts = []
    for t in ts_list:
        if t is None:
            parts.append('null')
        else:
            parts.append(f'[{t[0]},{t[1]}]')
    return '[' + ','.join(parts) + ']'

# ─── CSS (identico a M0, para todos los modulos) ──────────────────────────────
DIALOG_CSS = """
    /* ── YT Dialog Controls (per-line) ── */
    .yt-top-controls{display:flex;gap:12px;justify-content:center;margin-bottom:20px;flex-wrap:wrap}
    .blurred{filter:blur(7px);opacity:.25;user-select:none;pointer-events:none;
      transition:filter .45s ease,opacity .45s ease}
    .dial-line-ctrl{display:flex;gap:6px;margin-top:7px;align-items:center}
    .yt-lbtn{width:32px;height:32px;border-radius:50%;
      border:1.8px solid var(--mc-dk,#c8940a);background:none;color:var(--mc-dk,#c8940a);
      cursor:pointer;font-size:.72rem;display:flex;align-items:center;justify-content:center;
      transition:all .2s;flex-shrink:0}
    .yt-lbtn:hover{background:var(--mc-bg,#faeee8)}
    .yt-lbtn.stop{border-color:var(--red,#cc4736);color:var(--red,#cc4736)}
    .yt-lbtn.stop:hover{background:#faeaea}
    .yt-lbtn.teal{border-color:var(--teal,#78a6ba);color:var(--teal,#78a6ba)}
    .yt-lbtn.teal:hover{background:#e5f1f5}
"""

# ─── JS por linea (plantilla) ─────────────────────────────────────────────────
def make_per_line_js(line_times_js, video_id):
    return f"""
<script>
/* ── IPP Per-line YT playback ── */
(function(){{
  var LINE_TIMES = {line_times_js};
  var _activeLine = -1;
  var _linePoll   = null;

  function _lineEl(idx){{ return document.querySelector('[data-yt-idx="'+idx+'"]'); }}

  function _bubbleEl(el){{
    // Intenta encontrar el elemento burbuja en distintas estructuras de modulo
    var sels = ['.dial-bubble','.f-bubble','.m-bubble','.dialog-bubble',
                '.bubble-m','.bubble-g','.bubble-f','.bubble-wrap'];
    for(var i=0;i<sels.length;i++){{
      var b=el.querySelector(sels[i]); if(b) return b;
    }}
    return el; // fallback
  }}

  function _setButtons(idx, playing){{
    var el=_lineEl(idx); if(!el) return;
    var pb=el.querySelector('.yt-lbtn.play');
    var sb=el.querySelector('.yt-lbtn.stop');
    if(pb) pb.style.display=playing?'none':'';
    if(sb) sb.style.display=playing?'':'none';
    el.classList.toggle('yt-playing',playing);
  }}

  window.ippYT_stopLine=function(){{
    if(_linePoll){{clearInterval(_linePoll);_linePoll=null;}}
    var y=window._ippYT;
    if(y&&y.ready){{try{{y.player.pauseVideo();}}catch(e){{}}}}
    if(_activeLine>=0){{_setButtons(_activeLine,false);_activeLine=-1;}}
  }};

  window.ippYT_playLine=function(idx){{
    ippYT_stopLine();
    var y=window._ippYT;
    if(!y||!y.ready){{alert('El reproductor aún se está cargando...');return;}}
    var ts=LINE_TIMES[idx];
    if(!ts)return;
    var el=_lineEl(idx);
    if(el){{ var b=_bubbleEl(el); if(b) b.classList.remove('blurred'); }}
    _activeLine=idx;
    _setButtons(idx,true);
    try{{y.player.seekTo(ts[0],true);y.player.playVideo();}}catch(e){{}}
    _linePoll=setInterval(function(){{
      try{{
        var ct=y.player.getCurrentTime();
        if(ct>=ts[1]){{
          clearInterval(_linePoll);_linePoll=null;
          try{{y.player.pauseVideo();}}catch(e){{}}
          _setButtons(idx,false);_activeLine=-1;
        }}
      }}catch(e){{clearInterval(_linePoll);}}
    }},150);
  }};

  // Sobrescribir conversacion: quita blur de todo y reproduce
  var _origConv=window.ippYT_conversacion;
  window.ippYT_conversacion=function(){{
    ippYT_stopLine();
    document.querySelectorAll('.blurred').forEach(function(b){{b.classList.remove('blurred');}});
    if(_origConv) _origConv();
  }};

  // Sobrescribir detener
  var _origStop=window.ippYT_detener;
  window.ippYT_detener=function(){{
    ippYT_stopLine();
    if(_origStop) _origStop();
  }};
}})();
</script>
"""

# ─── Encontrar el cierre de un elemento <div> (nivel 0) ───────────────────────
def find_div_close(html, start):
    """Retorna el indice justo despues del </div> que cierra el <div> abierto en start."""
    depth = 0
    i = start
    while i < len(html):
        if html[i:i+4] == '<div' and (i+4 >= len(html) or html[i+4] in ' \t\n\r>'):
            depth += 1
            i += 4
        elif html[i:i+6] == '</div>':
            depth -= 1
            if depth == 0:
                return i + 6
            i += 6
        else:
            i += 1
    return len(html)

# ─── Controles por linea ──────────────────────────────────────────────────────
def make_ctrl(idx, teal=False):
    cls = 'yt-lbtn teal' if teal else 'yt-lbtn'
    return (
        f'\n          <div class="dial-line-ctrl">'
        f'<button class="{cls} play" onclick="ippYT_playLine({idx})" title="Escuchar">&#9654;</button>'
        f'<button class="yt-lbtn stop" onclick="ippYT_stopLine()" title="Detener" style="display:none">&#9646;&#9646;</button>'
        f'</div>'
    )

# ─── Procesa cada linea de dialogo ────────────────────────────────────────────
def process_line_element(content, idx, bubble_sels, teal=False):
    """
    Dentro del contenido de un elemento linea:
    1. Agrega 'blurred' a la primera burbuja encontrada
    2. Elimina botones TTS
    3. Agrega el control ▶/⏸ al final
    """
    # Limpiar cualquier 'blurred' mal puesto de ejecuciones anteriores
    # Forma incorrecta: class="..." blurred>  →  class="...">
    content = re.sub(r'(\s+blurred)(?=\s*>)', '', content)
    # Forma correcta pero duplicada: ... blurred blurred"  →  ... blurred"
    content = re.sub(r'(\s+blurred)+(")', r' blurred\2', content)
    # Quitar blurred de clases (reset limpio)
    content = re.sub(r'\s+blurred(?=")', '', content)

    # 1. Agregar blurred a la primera burbuja (con regex corregida)
    for sel_class in bubble_sels:
        # Grupo 2 = clases SIN comilla cierre; grupo 3 = comilla; grupo 4 = resto hasta >
        pattern = r'(<div\s+class=")((?:[^"]*\s)?' + re.escape(sel_class) + r'(?:\s[^"]*)?)(")([^>]*>)'
        def add_blur(m, _sel=sel_class):
            classes = m.group(2)
            if 'blurred' not in classes:
                classes = classes + ' blurred'
            return m.group(1) + classes + m.group(3) + m.group(4)
        new_content = re.sub(pattern, add_blur, content, count=1)
        if new_content != content:
            content = new_content
            break

    # 2. Eliminar botones TTS (btn-line-play)
    content = re.sub(
        r'\s*<button[^>]*(?:btn-line-play|onclick="playLine)[^>]*>[\s\S]*?</button>',
        '', content
    )

    # 3. Eliminar cualquier dial-line-ctrl existente (prevenir duplicados)
    content = re.sub(r'\s*<div class="dial-line-ctrl">[\s\S]*?</div>', '', content)

    # 4. Insertar control al final (antes del ultimo </div> del elemento)
    ctrl = make_ctrl(idx, teal)
    last = content.rfind('</div>')
    if last >= 0:
        content = content[:last] + ctrl + '\n        ' + content[last:]

    return content

# ─── Parchear un modulo (tipo A: dial-line) ───────────────────────────────────
def patch_dial_line_module(html, timestamps, is_m3=False):
    """
    M1, M2, M3 — usan <div class="dial-line">.
    Burbujas: dial-bubble, f-bubble, m-bubble, hidden-text, dial-hidden
    """
    BUBBLE_SELS = ['hidden-text', 'dial-hidden', 'dial-bubble', 'f-bubble', 'm-bubble']

    results = []
    search_start = 0

    for m in re.finditer(r'<div\s+class="dial-line(?:[^"]*)"[^>]*data-yt-idx="(\d+)"[^>]*>', html):
        idx = int(m.group(1))
        div_start = m.start()
        div_end = find_div_close(html, div_start)
        full = html[div_start:div_end]

        # Determinar si la linea es "derecha" (bubla teal)
        teal = 'right' in m.group(0) or 'gender="m"' in m.group(0)

        processed = process_line_element(full, idx, BUBBLE_SELS, teal)
        results.append((div_start, div_end, processed))

    # Aplicar reemplazos de atras hacia adelante
    for start, end, replacement in reversed(results):
        html = html[:start] + replacement + html[end:]

    return html

# ─── Parchear un modulo (tipo B: dialog-line) ────────────────────────────────
def patch_dialog_line_module(html, timestamps):
    """
    M4, M5, M7 — usan <div class="dialog-line">.
    Burbujas: dialog-bubble, bubble-m, bubble-g, bubble-f, bubble-wrap
    """
    BUBBLE_SELS = ['dialog-bubble', 'bubble-m', 'bubble-g', 'bubble-f', 'bubble-wrap']

    results = []

    for m in re.finditer(r'<div\s+class="dialog-line(?:[^"]*)"[^>]*data-yt-idx="(\d+)"[^>]*>', html):
        idx = int(m.group(1))
        div_start = m.start()
        div_end = find_div_close(html, div_start)
        full = html[div_start:div_end]

        teal = 'data-speaker="F"' in full or 'gender="f"' in full or 'avatar-g' in full

        processed = process_line_element(full, idx, BUBBLE_SELS, teal)
        results.append((div_start, div_end, processed))

    for start, end, replacement in reversed(results):
        html = html[:start] + replacement + html[end:]

    return html

# ─── Parchear M6 (div.line id="lineN") ───────────────────────────────────────
def patch_m6_lines(html):
    """
    M6 — usa <div class="line" id="lineN">.
    Burbujas: f-bubble, m-bubble
    """
    BUBBLE_SELS = ['f-bubble', 'm-bubble']

    results = []

    for m in re.finditer(r'<div\s+class="line"\s+id="line\d+"[^>]*data-yt-idx="(\d+)"[^>]*>', html):
        idx = int(m.group(1))
        div_start = m.start()
        div_end = find_div_close(html, div_start)
        full = html[div_start:div_end]

        teal = 'f-bubble' in full or 'class="line-speaker f"' in full

        # Para M6 tambien eliminar el boton dentro del speaker
        full = re.sub(r'\s*<button[^>]*(?:btn-line-play|playLine)[^>]*>[\s\S]*?</button>', '', full)

        processed = process_line_element(full, idx, BUBBLE_SELS, teal)
        results.append((div_start, div_end, processed))

    for start, end, replacement in reversed(results):
        html = html[:start] + replacement + html[end:]

    return html

# ─── Reemplazar controles superiores ────────────────────────────────────────
def replace_top_controls(html):
    """
    Reemplaza el bloque .yt-controls existente por .yt-top-controls centrado
    (solo Conv + Detener). Si no existe .yt-controls, lo inserta antes del
    primer elemento de dialogo.
    """
    new_top = (
        '\n      <div class="yt-top-controls">\n'
        '        <button class="yt-btn yt-btn-conv" onclick="ippYT_conversacion()">&#9654; Reproducir conversaci\u00f3n</button>\n'
        '        <button class="yt-btn yt-btn-stop" onclick="ippYT_detener()">&#9646;&#9646; Detener</button>\n'
        '      </div>\n'
    )

    # Eliminar bloque yt-controls existente (con los 3 botones viejos)
    m = re.search(r'\s*<div class="yt-controls">[\s\S]*?</div>\s*\n', html)
    if m:
        html = html[:m.start()] + '\n' + new_top + html[m.end():]
    else:
        # Insertar antes del primer dial-line / dialog-line / div.line
        for pattern in [r'<div class="dial-line', r'<div class="dialog-line', r'<div class="line" id="line']:
            mp = re.search(pattern, html)
            if mp:
                html = html[:mp.start()] + new_top + html[mp.start():]
                break

    # Eliminar botones listen-all / btn-play-all
    html = re.sub(r'\s*<button[^>]*(?:listen-all-btn|btn-play-all)[^>]*>[\s\S]*?</button>', '', html)

    return html

# ─── Agregar CSS ─────────────────────────────────────────────────────────────
def add_css(html):
    if 'yt-top-controls' not in html:
        html = html.replace('</style>', DIALOG_CSS + '\n    </style>', 1)
    return html

# ─── Agregar JS por linea ─────────────────────────────────────────────────────
def add_per_line_js(html, line_times_js, video_id):
    marker = '/* ── IPP Per-line YT playback ── */'
    # Eliminar version anterior si existe (para actualizar LINE_TIMES)
    if marker in html:
        html = re.sub(
            r'\s*<script>\s*/\* ── IPP Per-line YT playback ── \*/[\s\S]*?</script>',
            '', html
        )
    js = make_per_line_js(line_times_js, video_id)
    html = html.replace('</body>', js + '\n</body>', 1)
    return html

# ─── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print('\nParcheando dialogos YT (M1-M7)...\n')

    MODULOS = ['modulo_1','modulo_2','modulo_3','modulo_4','modulo_5','modulo_6','modulo_7']

    for mod in MODULOS:
        path = os.path.join(BASE, mod, 'etapa2_descubrimiento.html')
        if not os.path.exists(path):
            print(f'  SKIP  {mod}')
            continue

        cfg = TIMESTAMPS.get(mod, {})
        with open(path, encoding='utf-8') as f:
            html = f.read()

        # 1. CSS
        html = add_css(html)

        # 2. Procesar lineas de dialogo segun el tipo
        if mod in ('modulo_1','modulo_2'):
            html = patch_dial_line_module(html, cfg)
        elif mod == 'modulo_3':
            html = patch_dial_line_module(html, cfg, is_m3=True)
        elif mod in ('modulo_4','modulo_5','modulo_7'):
            html = patch_dialog_line_module(html, cfg)
        elif mod == 'modulo_6':
            html = patch_m6_lines(html)

        # 3. Controles superiores
        html = replace_top_controls(html)

        # 4. JS por linea
        if mod == 'modulo_3':
            # M3 tiene dos dialogos, combinar ambas listas
            all_lines = (cfg.get('lines_dial1', []) or []) + (cfg.get('lines_dial2', []) or [])
            lt_js = ts_to_js(all_lines)
        else:
            lt_js = ts_to_js(cfg.get('lines', []))

        html = add_per_line_js(html, lt_js, cfg.get('videoId', ''))

        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)

        print(f'  OK    {mod}')

    print('\nListo. Prueba en http://127.0.0.1:8080/\n')
