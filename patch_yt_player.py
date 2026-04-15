# patch_yt_player.py
# Agrega reproductor YouTube (3 botones + player oculto + timestamps) a M0-M7

import re, os

BASE = r"C:\Users\User\Desktop\proyectos\italianoperpiacere\entregablesFinales\A1"

# ─── Timestamps por modulo (start, end) en segundos para cada linea del dialogo ───
# None = linea AI-generada, sin audio real en el video
TIMESTAMPS = {
    'modulo_0': {
        'videoId': 'QRG6v-I5XUE',
        'lines': [(0,4),(4,7),(7,10),(10,21),(21,23),(23,30),(30,33),(33,38)]
    },
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
    'modulo_3': {  # dos dialogos
        'videoId': 'GdVkENlq8Zg',
        'lines_dial1': [(0,2),(2,4),(4,6),(6,7),
                        None,None,None,None,None,None],   # 4 reales + 6 AI
        'lines_dial2': [(7,10),(10,13),(13,15),(15,17),
                        None,None,None,None,None,None],   # 4 reales + 6 AI
    },
    'modulo_4': {
        'videoId': '9lMBKecejn4',
        # Solo primeras 2 lineas tienen audio real
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

# ─── CSS para los 3 botones y estados ─────────────────────────────────────────
YT_CSS = """
/* ── IPP YouTube Player Controls ── */
.yt-controls{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0 10px}
.yt-btn{padding:10px 20px;border:none;border-radius:8px;font-family:var(--fb);
  font-size:.88rem;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;
  align-items:center;gap:6px}
.yt-btn-conv{background:var(--mc);color:var(--white)}
.yt-btn-conv:hover{background:var(--mc-dk)}
.yt-btn-dial{background:var(--white);color:var(--mc);border:2px solid var(--mc)}
.yt-btn-dial:hover{background:var(--mc-bg,#faeae8)}
.yt-btn-stop{background:var(--cream-dk,#ddd9c8);color:var(--black,#1a1a18)}
.yt-btn-stop:hover{filter:brightness(.92)}
.yt-btn:disabled{opacity:.45;cursor:not-allowed}
.dial-line.yt-active{outline:3px solid var(--mc);border-radius:8px;
  background:var(--mc-bg,#faeae8);transition:background .3s}
.dial-line.yt-done{opacity:.7}
"""

# ─── JS compartido (se inserta una sola vez por archivo) ──────────────────────
YT_JS_VERSION = 'ipp-yt-v3'

YT_SHARED_JS = """
/* ── IPP YouTube Dialog Player — shared ipp-yt-v3 ── */
(function(){
  if(window.__ippYTinit) return;
  window.__ippYTinit = true;

  window._ippYT = {
    player: null, ready: false,
    mode: null,   // 'conv'|'dial'
    idx: 0, poll: null,
    lines: [],    // set per-dialog
    els: [],      // dial-line NodeList
  };

  /* Carga la API de YouTube una sola vez */
  if(!window.YT){
    var s=document.createElement('script');
    s.src='https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }

  window._ippYTinitPlayer = function(videoId, frameId){
    if(window._ippYT.player) return; // ya creado
    function tryCreate(){
      if(!window.YT||!window.YT.Player){ setTimeout(tryCreate,300); return; }
      window._ippYT.player = new YT.Player(frameId,{
        videoId: videoId,
        height:1, width:1,
        playerVars:{autoplay:0,controls:0,origin:location.origin||''},
        events:{
          onReady:function(){ window._ippYT.ready=true; }
        }
      });
    }
    tryCreate();
  };

  window.ippYT_detener = function(){
    var y=window._ippYT;
    if(y.poll){clearInterval(y.poll);y.poll=null;}
    if(y.player&&y.ready){ try{y.player.pauseVideo();}catch(e){} }
    y.mode=null;
    document.querySelectorAll('.yt-active')
      .forEach(function(el){el.classList.remove('yt-active');});
  };

  window.ippYT_conversacion = function(){
    var y=window._ippYT;
    if(!y.ready){alert('El reproductor aun se esta cargando...');return;}
    ippYT_detener();
    // Revelar todo el texto inmediatamente
    document.querySelectorAll('[data-yt-idx]').forEach(function(el){
      _ippYT_revealEl(el);
    });
    y.mode='conv';
    try{y.player.seekTo(0,true);y.player.playVideo();}catch(e){}
  };

  window.ippYT_dialogo = function(lineasCfg, dialSelector){
    var y=window._ippYT;
    if(!y.ready){alert('El reproductor aun se esta cargando...');return;}
    ippYT_detener();
    // Ocultar texto de todas las lineas
    var selector = dialSelector
      ? '.dial-container[data-yt-dial="'+dialSelector+'"] .dial-line[data-yt-idx]'
      : '[data-yt-idx]';
    y.els = Array.from(document.querySelectorAll(selector));
    y.lines = lineasCfg;
    y.idx = 0;
    y.mode = 'dial';
    // Reset visual
    y.els.forEach(function(el){
      el.classList.remove('yt-active','yt-done');
      _ippYT_hideEl(el);
    });
    _ippYT_playNext();
  };

  window._ippYT_playNext = function(){
    var y=window._ippYT;
    if(y.mode!=='dial') return;
    if(y.idx>=y.els.length){y.mode=null;return;}
    var el=y.els[y.idx];
    var ts=y.lines[y.idx];
    el.classList.add('yt-active');
    _ippYT_revealEl(el);
    el.scrollIntoView({behavior:'smooth',block:'nearest'});
    if(ts && ts[0]!==null){
      try{
        y.player.seekTo(ts[0],true);
        y.player.playVideo();
      }catch(e){}
      y.poll=setInterval(function(){
        if(y.mode!=='dial'){clearInterval(y.poll);return;}
        try{
          var ct=y.player.getCurrentTime();
          if(ct>=ts[1]){
            clearInterval(y.poll); y.poll=null;
            try{y.player.pauseVideo();}catch(e){}
            el.classList.remove('yt-active');el.classList.add('yt-done');
            y.idx++;
            setTimeout(window._ippYT_playNext,450);
          }
        }catch(e){clearInterval(y.poll);}
      },150);
    } else {
      // Sin timestamp: mostrar texto 2 segundos
      setTimeout(function(){
        el.classList.remove('yt-active');el.classList.add('yt-done');
        y.idx++;
        _ippYT_playNext();
      },2000);
    }
  };

  window._ippYT_revealEl = function(el){
    var t = el.getAttribute('data-text')||el.getAttribute('data-yt-text')||'';
    // dial-hidden/hidden-text/dial-bubble: M0-M3 (texto oculto revelado)
    // bubble-m/bubble-g: M4-M5/M7 (siempre visible, solo resaltamos)
    // line-it: M6 (solo resaltamos)
    var targets=['.dial-hidden','.hidden-text','.dial-bubble','.bubble-m','.bubble-g','.line-it'];
    for(var i=0;i<targets.length;i++){
      var h=el.querySelector(targets[i]);
      if(h){
        if(t && i<3) h.textContent=t; // solo sobreescribir en M0-M3
        h.style.opacity='1';h.style.visibility='visible';
        h.style.maxHeight='none';h.style.display='';
        return;
      }
    }
  };

  window._ippYT_hideEl = function(el){
    var targets=['.dial-hidden','.hidden-text','.dial-bubble','.bubble-m','.bubble-g','.line-it'];
    for(var i=0;i<targets.length;i++){
      var h=el.querySelector(targets[i]);
      if(h){ h.style.opacity='0'; h.style.visibility='hidden'; return; }
    }
  };
})();
"""

# ─── HTML del iframe oculto ───────────────────────────────────────────────────
def yt_frame_html(frame_id):
    return (
        f'\n<div id="{frame_id}" '
        'style="position:absolute;width:1px;height:1px;opacity:0;'
        'pointer-events:none;overflow:hidden"></div>\n'
    )

# ─── Bloque de 3 botones ──────────────────────────────────────────────────────
def yt_buttons_html(lines_json, dial_attr=''):
    dial_arg = f"'{dial_attr}'" if dial_attr else 'null'
    return (
        '<div class="yt-controls">\n'
        '  <button class="yt-btn yt-btn-conv" onclick="ippYT_conversacion()">&#9654; Reproducir conversaci\u00f3n</button>\n'
        f'  <button class="yt-btn yt-btn-dial" onclick="ippYT_dialogo({lines_json},{dial_arg})">&#9654; Reproducir di\u00e1logo</button>\n'
        '  <button class="yt-btn yt-btn-stop" onclick="ippYT_detener()">&#9646;&#9646; Detener</button>\n'
        '</div>\n'
    )

# ─── Serializa lista de timestamps a JS ──────────────────────────────────────
def ts_to_js(ts_list):
    parts = []
    for t in ts_list:
        if t is None:
            parts.append('null')
        else:
            parts.append(f'[{t[0]},{t[1]}]')
    return '[' + ','.join(parts) + ']'

# ─── Agrega data-yt-idx a cada .dial-line / .dialog-line en orden ────────────
def add_yt_idx(html, reset_at=None):
    """
    Devuelve html modificado con data-yt-idx en cada linea de dialogo.
    Soporta tanto 'dial-line' (M0-M3) como 'dialog-line' (M4-M7).
    """
    idx = [0]
    def replacer(m):
        full = m.group(0)
        if 'data-yt-idx' in full:
            return full
        new_tag = full.rstrip('>') + f' data-yt-idx="{idx[0]}">'
        idx[0] += 1
        return new_tag
    # Coincidir con todas las variantes: dial-line (M0-M3), dialog-line (M4-M5,M7), line id=lineN (M6)
    html = re.sub(r'<div class="(?:dial|dialog)-line(?:[^"]*)"(?:[^>]*)>', replacer, html)
    html = re.sub(r'(<div class="line"\s+id="line\d+")', replacer, html)
    return html

# ─── Parchea un modulo normal (un solo dialogo) ───────────────────────────────
def patch_single(html, cfg, frame_id='ippyt-frame'):
    lines_js = ts_to_js(cfg['lines'])

    # 1. CSS
    if 'yt-controls' not in html:
        html = html.replace('</style>', YT_CSS + '\n</style>', 1)

    # 2. Iframe oculto (antes de </body>)
    if frame_id not in html:
        html = html.replace('</body>', yt_frame_html(frame_id) + '\n</body>', 1)

    # 3. JS compartido (antes de </body>) — reemplazar si es version antigua
    if YT_JS_VERSION not in html:
        if '__ippYTinit' in html:
            # Reemplazar bloque JS antiguo
            html = re.sub(
                r'/\* ── IPP YouTube Dialog Player — shared.*?\}\)\(\);',
                YT_SHARED_JS.strip(),
                html, flags=re.DOTALL
            )
        else:
            html = html.replace('</body>',
                f'<script>{YT_SHARED_JS}</script>\n</body>', 1)

    # 4. JS init del player
    init_call = f"_ippYTinitPlayer('{cfg['videoId']}','{frame_id}');"
    if init_call not in html:
        html = html.replace('</body>',
            f'<script>{init_call}</script>\n</body>', 1)

    # 5. Botones — insertar antes del primer contenedor de dialogo
    buttons = yt_buttons_html(lines_js)
    if '<button class="yt-btn yt-btn-conv"' not in html:
        # Soportar dial-container (M0-M3) y dialog-wrap (M4-M7), o directo a la linea
        for pattern in [
            r'(<div class="dial-container")',
            r'(<div[^>]*class="dialog-wrap")',
            r'(<div class="dial-box")',
            r'(<div class="(?:dial|dialog)-line)',
            r'(<div class="line"\s+id="line\d+")',
        ]:
            m = re.search(pattern, html)
            if m:
                html = html[:m.start()] + buttons + html[m.start():]
                break

    # 6. data-yt-idx en cada .dial-line
    html = add_yt_idx(html)

    return html

# ─── Parchea M3 (dos dialogos separados) ────────────────────────────────────
def patch_m3(html, cfg, frame_id='ippyt-frame'):
    lines1_js = ts_to_js(cfg['lines_dial1'])
    lines2_js = ts_to_js(cfg['lines_dial2'])

    # 1. CSS
    if 'yt-controls' not in html:
        html = html.replace('</style>', YT_CSS + '\n</style>', 1)

    # 2. Iframe oculto
    if frame_id not in html:
        html = html.replace('</body>', yt_frame_html(frame_id) + '\n</body>', 1)

    # 3. JS compartido — reemplazar si es version antigua
    if YT_JS_VERSION not in html:
        if '__ippYTinit' in html:
            html = re.sub(
                r'/\* ── IPP YouTube Dialog Player — shared.*?\}\)\(\);',
                YT_SHARED_JS.strip(),
                html, flags=re.DOTALL
            )
        else:
            html = html.replace('</body>',
                f'<script>{YT_SHARED_JS}</script>\n</body>', 1)

    # 4. JS init
    init_call = f"_ippYTinitPlayer('{cfg['videoId']}','{frame_id}');"
    if init_call not in html:
        html = html.replace('</body>',
            f'<script>{init_call}</script>\n</body>', 1)

    # 5. Botones para dial1 (antes del primer dial-container con dial1)
    btn1 = yt_buttons_html(lines1_js)
    btn2 = yt_buttons_html(lines2_js)
    if '<button class="yt-btn yt-btn-conv"' not in html:
        # Insertar btn1 antes del primer dial-container
        m = re.search(r'<div class="dial-container">', html)
        if m:
            html = html[:m.start()] + btn1 + html[m.start():]
        # Insertar btn2 antes del segundo dial-container
        containers = list(re.finditer(r'<div class="dial-container">', html))
        if len(containers) >= 2:
            pos = containers[1].start()
            html = html[:pos] + btn2 + html[pos:]

    # 6. data-yt-idx: dial1 indices 0-9, dial2 indices 0-9 (independientes por dial)
    # Para dial1: dentro del primer dial-container
    # Para dial2: dentro del segundo dial-container
    # Usamos re.sub con contador manual
    idx = [0]
    def replacer(m):
        full = m.group(0)
        if 'data-yt-idx' in full:
            return full
        new_tag = full.rstrip('>') + f' data-yt-idx="{idx[0]}">'
        idx[0] += 1
        return new_tag

    # Separar los dos dial-containers
    containers = list(re.finditer(r'<div class="dial-container">', html))
    if len(containers) >= 2:
        # Procesar dial1
        s1, e1 = containers[0].start(), containers[1].start()
        idx[0] = 0
        chunk1 = re.sub(r'<div class="dial-line(?:[^"]*)"(?:[^>]*)>', replacer, html[s1:e1])
        # Procesar dial2
        idx[0] = 0
        chunk2 = re.sub(r'<div class="dial-line(?:[^"]*)"(?:[^>]*)>', replacer, html[e1:])
        html = html[:s1] + chunk1 + chunk2

    return html

# ─── MAIN ────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print('\nParcheando archivos HTML con YouTube Dialog Player...\n')

    for mod_key, cfg in TIMESTAMPS.items():
        path = os.path.join(BASE, mod_key, 'etapa2_descubrimiento.html')
        if not os.path.exists(path):
            print(f'  SKIP  {mod_key} — archivo no encontrado')
            continue

        with open(path, encoding='utf-8') as f:
            html = f.read()

        if mod_key == 'modulo_3':
            patched = patch_m3(html, cfg)
        else:
            patched = patch_single(html, cfg)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(patched)

        print(f'  OK   {mod_key}')

    print('\nListo.\n')
