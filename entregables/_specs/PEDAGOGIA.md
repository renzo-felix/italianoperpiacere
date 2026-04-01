# PEDAGOGÍA — Marco de Referencia para Generación de Módulos
## Italiano Per Piacere · Nivel A1

---

## 1. Marco Didáctico — Unidad Didáctica (Prof. Valerio Giacalone)

### FASE 1 — EXPLORACIÓN (= Etapa 1)
**Qué es:** Primer contacto con el input auténtico.
**Qué tiene:**
- Motivación: pregunta o reflexión previa que activa conocimiento previo
- Presentación del input (video embed / audio embed / imagen / letra de canción)
- Tarea "mientras mirás/escuchás": 1-3 puntos de atención
- Actividades de comprensión POST-INPUT:
  - Verdadero/Falso (mínimo 4-5 ítems) SOBRE el contenido del input
  - Selección múltiple (mínimo 3-4 preguntas) SOBRE el contenido del input
  - Actividad de asociación (letra-ciudad, personaje-frase, imagen-palabra)

**Regla crítica:** Las preguntas deben ser SOBRE el contenido del input, no sobre gramática.

---

### FASE 2 — DESCUBRIMIENTO (= Etapa 2)
**Qué es:** Trabajo sobre el texto del input. El alumno descubre las reglas sin que se las den.
**Qué tiene:**
- Referencia explícita al input de Etapa 1 ("En el video escuchamos…", "En la canción dice…")
- Actividades que usan el vocabulario/frases del input:
  - Completar fragmentos del input con palabras dadas
  - Identificar patrones en ejemplos extraídos del input
  - Completar tabla de conjugación/regla con los datos que el alumno ya vio
- Mini diálogo con audio (Web Speech API, it-IT) que usa el vocabulario de la unidad
  - Audio primero (texto borroso), luego revelar
  - Preguntas de comprensión del diálogo

**Regla crítica:** NUNCA dar la regla gramatical explícita aquí. El alumno la deduce.
**Regla crítica:** TODOS los ejemplos deben venir del input de Etapa 1.

---

### FASE 3 — GRAMÁTICA (= Etapa 3)
**Qué es:** Exposición explícita de las reglas. El alumno ya las descubrió; aquí las confirma y amplía.
**Qué tiene:**
- Tablas de conjugación completas (todos los pronombres)
- Reglas de pronunciación si aplica
- Tablas de vocabulario
- Grids de números, colores, etc.
- Botones de audio (Web Speech API) en expresiones útiles
- **Mínimo 10 ejercicios interactivos** distribuidos en secciones A/B/C/D/E/F…
- Nota cultural (culture strip) AL FINAL, no en medio
- Sticky nav interna para saltar entre secciones

**Regla crítica:** CSS 100% IPP brand (ver sección CSS). NUNCA usar variables diferentes.

---

### FASE 4 — EJERCICIOS (= Etapa 4)
**Formato:** Markdown (.md) — se copia a plantillas de la plataforma.
**Qué tiene:**
- Mínimo 5-8 ejercicios variados
- Tipos: completar, V/F, ordenar, traducir, crear oración propia
- Sección RISPOSTA (respuestas) al final
- El vocabulario debe coincidir 100% con lo visto en la unidad

---

## 2. Estructura de Archivos por Módulo

```
modulo_N/
  etapa1_exploracion.html    ← VIDEO/AUDIO/IMAGEN embed + comprensión
  etapa2_descubrimiento.html ← descubrimiento desde el input
  etapa3_gramatica.html      ← reglas explícitas + ejercicios
  etapa4_ejercicios.md       ← markdown para plantillas
```

**Navegación entre etapas:** Cada HTML tiene:
1. Hero header con color del módulo
2. Stage nav (1→2→3→4) con etapas completadas marcadas con ✓
3. Sticky nav interna (solo Etapa 3)
4. CTA al final para ir a la siguiente etapa

---

## 3. Sistema de Colores IPP

```css
:root {
  --cream:    #e9e6d5;
  --cream-dk: #ddd9c8;
  --gold:     #EFCF7F;
  --amber:    #e5ab07;
  --amber-dk: #c8940a;
  --red:      #cc4736;
  --teal:     #78a6ba;
  --green:    #528e74;
  --black:    #1a1a18;
  --white:    #ffffff;
  --fh: 'Playfair Display', Georgia, serif;
  --fb: 'Outfit', system-ui, sans-serif;
}
```

### Color por módulo (--mc / --mc-dk / --mc-text / --mc-bg)
| Módulos | Color | --mc | --mc-dk | --mc-text | --mc-bg |
|---------|-------|------|---------|-----------|---------|
| 0,4,8,12,16 | amber | #e5ab07 | #c8940a | #7a5500 | #fdf3d0 |
| 1,5,9,13    | red   | #cc4736 | #a8382a | #7a1f14 | #fbeae8 |
| 2,6,10,14   | teal  | #78a6ba | #5a8ea0 | #2d5f72 | #e5f1f5 |
| 3,7,11,15   | green | #528e74 | #3d6b58 | #2d4d3c | #e8f4ef |

### Reglas críticas de diseño
- ⚠️ NUNCA fondo negro. `--black` SOLO para `color:` (texto)
- ⚠️ Fondo del body: `var(--cream)` siempre
- ⚠️ Burbujas de diálogo (.sofia-bubble, dial-text): `background: var(--cream-dk)` o `var(--white)` NUNCA negro
- ⚠️ Culture strip: `background: linear-gradient(135deg, var(--mc-bg), var(--cream-dk))` + `border-top: 3px solid var(--mc)`
- Google Fonts: Playfair Display (títulos, italic) + Outfit (cuerpo)

---

## 4. Componentes Reutilizables

### Sofia (mascota)
```html
<div class="sofia-row">
  <div class="sofia-col">
    <div class="sofia-avatar">👩‍🏫</div>
    <div class="sofia-name">Sofia</div>
  </div>
  <div class="sofia-bubble">
    Texto con <strong>negritas en color módulo</strong> y <em>itálicas en rojo</em>.
  </div>
</div>
```

### Audio Web Speech API (para diálogos y expresiones)
```javascript
function speak(text, rate = 0.82) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'it-IT';
  utt.rate = rate;
  const voices = speechSynthesis.getVoices();
  const itVoice = voices.find(v => v.lang.startsWith('it'));
  if (itVoice) utt.voice = itVoice;
  speechSynthesis.speak(utt);
}
if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
```

### Audio Google Drive (para tracks del libro Domani 1)
```html
<audio controls>
  <source src="https://drive.google.com/uc?export=download&id=FILE_ID" type="audio/mpeg">
</audio>
```
Carpeta Drive con audios: https://drive.google.com/drive/folders/1xrMS8r0k97BUPbUYWpcGlBGQkie-TNk1

### Stage nav
```html
<nav class="stage-nav">
  <a class="stage-link done"   href="etapa1_exploracion.html"><span class="sn">1</span>Exploración</a>
  <a class="stage-link active" href="etapa2_descubrimiento.html"><span class="sn">2</span>Descubrimiento</a>
  <a class="stage-link"        href="etapa3_gramatica.html"><span class="sn">3</span>Gramática</a>
  <a class="stage-link"        href="etapa4_ejercicios.html"><span class="sn">4</span>Ejercicios</a>
</nav>
```

---

## 5. Tipos de Input por Unidad (ciclo)
- Unidad 0,4,8,12,16: **Video** (YouTube embed)
- Unidad 1,5,9,13:    **Canción** (YouTube embed + letra visible)
- Unidad 2,6,10,14:   **Imagen** (img tag con descripción guiada)
- Unidad 3,7,11,15:   **Audio** (Google Drive embed o Web Speech)

---

## 6. Proceso de Generación en Paralelo

Para generar un módulo en paralelo en conversación futura:
1. Leer `_specs/modulo_NN_spec.md` del módulo a generar
2. Leer `_specs/PEDAGOGIA.md` (este archivo)
3. Leer `modulo_0/etapa1_exploracion.html` como referencia de estructura HTML
4. Generar los 4 archivos del módulo respetando:
   - Hilo conductor: TODO debe venir del input de Etapa 1
   - CSS: variables IPP del módulo correspondiente
   - Ejercicios: mínimo 10 en Etapa 3, mínimo 5 en Etapa 4
   - Audio: Web Speech API para diálogos, Drive para tracks reales
