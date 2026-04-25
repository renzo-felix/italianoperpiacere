const path = require("path");
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign, PageBreak
} = require("C:/Users/Renzo/AppData/Roaming/npm/node_modules/docx");

// ── Color palette ──────────────────────────────────────────────────────────
const TEAL   = "2E6B7B";
const LTEAL  = "D6EAF0";
const GREEN  = "1E7A3C";
const LGREEN = "D5F5E3";
const RED    = "8B1A1A";
const LRED   = "FAD7D7";
const LGRAY  = "F2F2F2";
const YELLOW = "FFF9C4";
const NAVY   = "1F3864";
const BLACK  = "000000";
const FONT   = "Arial";
const PW     = 9360; // content width DXA

const brd = (c = "CCCCCC") => ({ style: BorderStyle.SINGLE, size: 4, color: c });
const brd0 = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const borders = (c = "CCCCCC") => ({ top: brd(c), bottom: brd(c), left: brd(c), right: brd(c) });
const noBorders = () => ({ top: brd0, bottom: brd0, left: brd0, right: brd0 });

// ── Paragraph helpers ───────────────────────────────────────────────────────
function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before ?? 60, after: opts.after ?? 60 },
    children: [new TextRun({
      text, font: FONT,
      size: opts.size ?? 22,
      bold: opts.bold ?? false,
      italics: opts.italic ?? false,
      color: opts.color ?? BLACK,
    })],
  });
}
function blank() { return new Paragraph({ children: [new TextRun("")] }); }
function pgBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function h1(text) {
  return new Paragraph({
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, font: FONT, size: 32, bold: true, color: "FFFFFF" })],
    shading: { fill: TEAL, type: ShadingType.CLEAR },
  });
}
function h2(text) {
  return new Paragraph({
    spacing: { before: 280, after: 80 },
    children: [new TextRun({ text, font: FONT, size: 26, bold: true, color: TEAL })],
  });
}
function h3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, font: FONT, size: 22, bold: true, color: BLACK })],
  });
}

// ── Colored banner ─────────────────────────────────────────────────────────
function banner(lines, fill) {
  return new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: [PW],
    borders: { top: brd0, bottom: brd0, left: brd0, right: brd0, insideH: brd0, insideV: brd0 },
    rows: [new TableRow({ children: [new TableCell({
      borders: noBorders(),
      shading: { fill, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      width: { size: PW, type: WidthType.DXA },
      children: lines,
    })] })],
  });
}

function stageBanner(etapa, titulo) {
  return banner([
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: etapa, font: FONT, size: 20, color: "AAAAAA" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: titulo, font: FONT, size: 36, bold: true, color: "FFFFFF" })] }),
  ], NAVY);
}

function infoBanner(lines, fill = LTEAL, textColor = NAVY) {
  return banner(lines.map(l => new Paragraph({
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text: l, font: FONT, size: 20, color: textColor })],
  })), fill);
}

// ── Table cell helpers ──────────────────────────────────────────────────────
function tc(text, width, fill, bold = false, color = BLACK, italic = false) {
  return new TableCell({
    borders: borders(),
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    width: { size: width, type: WidthType.DXA },
    children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: 19, bold, color, italics: italic })] })],
  });
}
function tcIta(text, width, fill = "FFFFFF") {
  return new TableCell({
    borders: borders(),
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    width: { size: width, type: WidthType.DXA },
    children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: 20, bold: true, color: NAVY })] })],
  });
}

// ── Feedback table ──────────────────────────────────────────────────────────
function feedbackTable(rows) {
  const w = [3600, 1400, 4360];
  return new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: w,
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: [
      new TableRow({ children: [tc("Pregunta / Enunciado", w[0], LTEAL, true), tc("Resp. correcta", w[1], LTEAL, true), tc("Feedback al alumno", w[2], LTEAL, true)] }),
      ...rows.map(r => new TableRow({ children: [tc(r.q, w[0], "FFFFFF"), tc(r.a, w[1], LGREEN), tc(r.f, w[2], LGRAY)] })),
    ],
  });
}

// ── Vocab table (2 columns) ─────────────────────────────────────────────────
function vocabTable(items) {
  const cw = PW / 2;
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const sl = items.slice(i, i + 2);
    while (sl.length < 2) sl.push(["", ""]);
    rows.push(new TableRow({ children: sl.map(([ita, esp]) => new TableCell({
      borders: borders(),
      shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      width: { size: cw, type: WidthType.DXA },
      children: [
        new Paragraph({ spacing: { before: 20, after: 10 }, children: [new TextRun({ text: ita, font: FONT, size: 22, bold: true, color: NAVY })] }),
        new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: esp, font: FONT, size: 19, color: "666666" })] }),
      ],
    })) }));
  }
  return new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: [cw, cw],
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows,
  });
}

// ── Conjugation table ───────────────────────────────────────────────────────
function conjTable(verb, pairs) {
  const w = [1200, 2200, 5960];
  return new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: w,
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: [
      new TableRow({ children: [tc("Pronombre", w[0], NAVY, true, "FFFFFF"), tc(verb, w[1], NAVY, true, "FFFFFF"), tc("Traducción", w[2], NAVY, true, "FFFFFF")] }),
      ...pairs.map(([pro, form, tra]) => new TableRow({ children: [tc(pro, w[0], LGRAY), tcIta(form, w[1]), tc(tra, w[2], "FFFFFF", false, "666666")] })),
    ],
  });
}

// ── Dialogue table ──────────────────────────────────────────────────────────
function dialogTable(lines) {
  const w = [1600, 7760];
  return new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: w,
    borders: { top: brd0, bottom: brd0, left: brd0, right: brd0, insideH: brd(), insideV: brd0 },
    rows: lines.map(([sp, ita, esp]) => new TableRow({ children: [
      new TableCell({
        borders: { top: brd0, bottom: brd(), left: brd0, right: brd0 },
        shading: { fill: LTEAL, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        width: { size: w[0], type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: sp, font: FONT, size: 19, bold: true, color: NAVY })] })],
      }),
      new TableCell({
        borders: { top: brd0, bottom: brd(), left: brd0, right: brd0 },
        shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        width: { size: w[1], type: WidthType.DXA },
        children: [
          new Paragraph({ spacing: { before: 20, after: 10 }, children: [new TextRun({ text: ita, font: FONT, size: 20, bold: true, color: NAVY })] }),
          ...(esp ? [new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: esp, font: FONT, size: 18, italics: true, color: "666666" })] })] : []),
        ],
      }),
    ]})),
  });
}

// ── Two-col table ───────────────────────────────────────────────────────────
function twoCol(rows, w1 = 3500, w2 = 5860) {
  return new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: [w1, w2],
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: rows.map(([a, b]) => new TableRow({ children: [
      new TableCell({ borders: borders(), shading: { fill: LTEAL, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, width: { size: w1, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: a, font: FONT, size: 20, bold: true, color: NAVY })] })] }),
      new TableCell({ borders: borders(), shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, width: { size: w2, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: b, font: FONT, size: 20, color: "444444" })] })] }),
    ]})),
  });
}

// ══════════════════════════════════════════════════════════════════════════════
const ch = [];

// ─── PORTADA ──────────────────────────────────────────────────────────────────
ch.push(
  blank(), blank(),
  p("Italiano per Piacere", { size: 20, color: TEAL, align: AlignmentType.CENTER }),
  p("A1 — Módulo 5", { size: 20, color: "888888", align: AlignmentType.CENTER }),
  blank(),
  p("Módulo 5", { size: 52, bold: true, color: NAVY, align: AlignmentType.CENTER }),
  p("Al bar", { size: 36, bold: true, color: TEAL, align: AlignmentType.CENTER }),
  p("Ordenar, conversar e interactuar en el bar italiano", { size: 22, italic: true, color: "555555", align: AlignmentType.CENTER }),
  blank(),
  infoBanner([
    "ESTRUCTURA DEL MÓDULO",
    "",
    "  ETAPA 1 · Exploración    — Video del bar + comprensión V/F y selección múltiple",
    "  ETAPA 2 · Descubrimiento — Vocabulario, diálogo, días de la semana, fonética (le doppie)",
    "  ETAPA 3 · Gramática      — Artículos indeterminativos · Verbos modales · Preposiciones",
    "  ETAPA 4 · Ejercicios     — Repaso interactivo (Genially)",
  ]),
  blank(),
  p("Documento de presentación — incluye feedback de todos los ejercicios interactivos", { size: 18, italic: true, color: "888888", align: AlignmentType.CENTER }),
  pgBreak(),
);

// ══════════════════════════════════════════════════════════════════════════════
// ETAPA 1 — EXPLORACIÓN
// ══════════════════════════════════════════════════════════════════════════════
ch.push(
  stageBanner("ETAPA 1", "Exploración"),
  blank(),
  p("Al bar  ·  Ordenar, conversar e interactuar en el bar italiano", { italic: true, color: TEAL }),
  blank(),
  infoBanner([
    "Mientras ves el video, prestá atención a:",
    "  • ¿Qué pide la mujer para tomar? ¿Tiene hambre o no?",
    "  • ¿Qué pide el hombre para comer y para tomar?",
    "  • ¿Qué postres aparecen en la conversación?",
    "  • ¿Alguien recibe o hace una llamada? ¿A quién llaman?",
    "  • ¿Cuál es la frase final del video? ¿La entendés?",
  ], LGREEN, GREEN),
  blank(),
  p("▶  Video: «Al bar» — youtube.com/embed/2_VwcAlQUyU", { italic: true, color: "888888" }),
  blank(),
);

// Ejercicio 1 — V/F
ch.push(
  h2("Ejercicio 1 — Verdadero o Falso"),
  p("Mirá cada afirmación y decidí si es V (Verdadero) o F (Falso) según lo que viste en el video.", { italic: true }),
  blank(),
  feedbackTable([
    { q: "La signora ordina una panna cotta.", a: "V", f: "¡Correcto! La mujer sí pide panna cotta entre los pedidos." },
    { q: "Qualcuno risponde al telefono durante la scena.", a: "V", f: "¡Muy bien! Un personaje llama o atiende el teléfono en medio de la escena." },
    { q: "Il signore ordina una birra grande.", a: "F", f: "El hombre pide una birra piccola (pequeña), no grande." },
    { q: "La signora ha molta fame.", a: "F", f: "La señora dice que no tiene hambre — solo quiere una bebida." },
    { q: "Nella scena appare un tiramisù.", a: "V", f: "¡Muy bien! El tiramisù se menciona en los pedidos." },
    { q: "La frase finale è: «Che confusione!»", a: "V", f: "¡Perfecto! «Che confusione!» es exactamente la frase final del video." },
  ]),
  blank(),
);

// Ejercicio 2 — Selección múltiple
ch.push(
  h2("Ejercicio 2 — Selección múltiple"),
  p("Elegí la opción correcta para cada pregunta.", { italic: true }),
  blank(),
  feedbackTable([
    { q: "¿Qué pide la mujer para tomar?", a: "Una spremuta d'arancia", f: "¡Correcto! La mujer pide una spremuta d'arancia, prefiriendo arance rosse." },
    { q: "¿Qué pide el hombre para comer?", a: "Un tramezzino con prosciutto crudo e mozzarella", f: "¡Exacto! El hombre pide un tramezzino con prosciutto crudo e mozzarella." },
    { q: "¿A quién llaman por teléfono en la escena?", a: "A Valeria", f: "¡Muy bien! En medio de la escena alguien llama a Valeria por teléfono." },
    { q: "¿Qué postre NO se menciona en el video?", a: "Cannolo siciliano", f: "¡Correcto! El cannolo no aparece. Sí aparecen tiramisù, panna cotta y caffè decaffeinato." },
    { q: "¿Qué sucede al final del video?", a: "Hay confusión con los pedidos", f: "¡Perfecto! Hay confusión, de ahí la frase «Che confusione!»" },
  ]),
  blank(),
  pgBreak(),
);

// ══════════════════════════════════════════════════════════════════════════════
// ETAPA 2 — DESCUBRIMIENTO
// ══════════════════════════════════════════════════════════════════════════════
ch.push(
  stageBanner("ETAPA 2", "Descubrimiento"),
  blank(),
  p("Vocabulario, diálogo, días de la semana y fonética del módulo.", { italic: true, color: TEAL }),
  blank(),
);

// Vocabulario al bar
ch.push(
  h2("Vocabulario — Al bar: cosa si ordina"),
  p("Hacé clic en cada palabra para escucharla en italiano.", { italic: true, size: 20, color: "666666" }),
  blank(),
  vocabTable([
    ["caffè", "café (espresso)"],
    ["cappuccino", "capuchino"],
    ["cornetto", "medialuna / croissant"],
    ["tramezzino", "sándwich de molde"],
    ["birra", "cerveza"],
    ["acqua", "agua"],
    ["succo di frutta", "jugo de fruta"],
    ["spremuta", "jugo exprimido"],
    ["tè", "té"],
    ["arancata", "naranjada (gaseosa)"],
    ["tiramisù", "tiramisú"],
    ["panna cotta", "panna cotta"],
    ["panino", "sándwich / pancito"],
    ["sfogliatella", "hojaldre napolitano"],
    ["aperitivo", "aperitivo"],
  ]),
  blank(),
  infoBanner(["Tip cultural: En Italia, il bar sirve café, jugos y snacks — no es solo un bar nocturno.", "Un espresso al banco cuesta ~1 euro. ¡Sentado puede costar el triple!"]),
  blank(),
);

// Tipos de café
ch.push(
  h2("I tipi di caffè"),
  p("El café en Italia es un rito. Hacé clic en cada tipo para escuchar el nombre.", { italic: true, size: 20, color: "666666" }),
  blank(),
  twoCol([
    ["caffè espresso", "Pequeño y concentrado — el clásico"],
    ["caffè macchiato", "Espresso con gotita de leche"],
    ["caffè latte", "Mucha leche, poco café"],
    ["caffè corretto", "Con grappa o licor — ¡solo para adultos!"],
    ["caffè freddo", "Café frío, en vaso"],
    ["cappuccino", "Espresso + leche espumada"],
  ]),
  blank(),
  infoBanner([
    "Regola d'oro: «Un caffè» sin más = un espresso.",
    "Nadie toma cappuccino después de las 11 de la mañana.",
    "Si querés leche, pedilo específicamente: un caffè latte, un macchiato…",
  ], LRED, RED),
  blank(),
);

// Días de la semana
ch.push(
  h2("I giorni della settimana"),
  p("Los primeros cinco llevan acento en la última sílaba. En italiano, la semana empieza el lunedì.", { italic: true, size: 20, color: "666666" }),
  blank(),
  new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: [900, 2000, 6460],
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: [
      new TableRow({ children: [tc("#", 900, NAVY, true, "FFFFFF"), tc("Italiano", 2000, NAVY, true, "FFFFFF"), tc("Español", 6460, NAVY, true, "FFFFFF")] }),
      ...([
        ["1", "lunedì", "lunes"],
        ["2", "martedì", "martes"],
        ["3", "mercoledì", "miércoles"],
        ["4", "giovedì", "jueves"],
        ["5", "venerdì", "viernes"],
        ["6", "sabato", "sábado"],
        ["7", "domenica", "domingo"],
      ]).map(([n, ita, esp]) => new TableRow({ children: [tc(n, 900, LGRAY, true), tcIta(ita, 2000), tc(esp, 6460, "FFFFFF", false, "444444")] })),
    ],
  }),
  blank(),
  infoBanner(["Atención: Todos los días llevan minúscula en italiano (lunedì, martedì…), no mayúscula como en inglés."]),
  blank(),
);

// Diálogo
ch.push(
  h2("Il dialogo — Al bar"),
  p("Giulia (cliente) y Marco (cameriere) en un bar romano.", { italic: true, size: 20, color: "666666" }),
  blank(),
  dialogTable([
    ["Marco", "Buongiorno! Prego, cosa prende?", "¡Buenos días! Por favor, ¿qué va a tomar?"],
    ["Giulia", "Buongiorno! Io vorrei una spremuta d'arancia, per favore. Con le arance rosse, se possibile.", "¡Buenos días! Yo quisiera un jugo de naranja, por favor. Con naranjas rojas, si es posible."],
    ["Marco", "Certo, signora! E lei, signore?", "¡Por supuesto, señora! ¿Y usted, señor?"],
    ["Amico", "Per me un tramezzino con prosciutto crudo e mozzarella, e una birra piccola.", "Para mí un sándwich con jamón crudo y mozzarella, y una cerveza pequeña."],
    ["Marco", "E poi, volete anche il dolce?", "¿Y luego, quieren también el postre?"],
    ["Giulia", "Sì! Un tiramisù e una panna cotta, grazie.", "¡Sí! Un tiramisú y una panna cotta, gracias."],
    ["Giulia", "Quanto costa tutto?", "¿Cuánto cuesta todo?"],
    ["Marco", "Dodici euro e cinquanta, signora.", "Doce euros con cincuenta, señora."],
    ["Giulia", "Che confusione! Scusi, questo non è il mio caffè!", "¡Qué confusión! Perdone, ¡esto no es mi café!"],
    ["Marco", "Mi scusi tanto! Ecco il suo caffè macchiato freddo, signora.", "¡Discúlpeme! Aquí tiene su café macchiato frío, señora."],
    ["Giulia", "Grazie! Senta, ha anche dei biscotti? Ho un po' di fame.", "¡Gracias! Oiga, ¿tiene también galletitas? Tengo un poco de hambre."],
    ["Marco", "Certo! Abbiamo crostate, cornetti e biscotti alle mandorle. Cosa preferisce?", "¡Claro! Tenemos tartas, medialunas y galletitas de almendra. ¿Qué prefiere?"],
    ["Giulia", "Prendo due biscotti alle mandorle, grazie.", "Tomo dos galletitas de almendra, gracias."],
    ["Amico", "Scusi, posso avere anche il conto? Dobbiamo andare.", "Perdone, ¿puedo tener también la cuenta? Tenemos que irnos."],
    ["Marco", "Subito! In totale sono quindici euro e ottanta.", "¡Enseguida! En total son quince euros con ochenta."],
    ["Giulia", "Paghiamo metà per uno. Ecco sette euro e novanta.", "Pagamos mitad cada uno. Acá van siete euros con noventa."],
    ["Marco", "Perfetto. Grazie e arrivederci! Buona giornata!", "Perfecto. ¡Gracias y hasta luego! ¡Que tengan un buen día!"],
  ]),
  blank(),
);

// Frases para ordenar
ch.push(
  h2("Come si ordina al bar — Patrones clave"),
  p("Hacé clic en cada patrón para escucharlo.", { italic: true, size: 20, color: "666666" }),
  blank(),
  twoCol([
    ["Vorrei un caffè.", "Quisiera un café. (forma cortés)"],
    ["Prendo una birra.", "Tomo una cerveza. (forma directa)"],
    ["Per me un tramezzino.", "Para mí un sándwich."],
    ["Quanto costa?", "¿Cuánto cuesta?"],
    ["Il conto, per favore.", "La cuenta, por favor."],
    ["Posso avere il menù?", "¿Puedo tener el menú?"],
    ["Scusi, mi porta…?", "Perdone, ¿me trae…?"],
    ["Buongiorno! Prego?", "¡Buenos días! ¿Dígame? (el mozo)"],
  ]),
  blank(),
);

// Fonética — le doppie
ch.push(
  h2("Fonética — Le consonanti doppie"),
  p("En italiano, las consonantes dobles se pronuncian con una pequeña pausa — casi como si las 'detuvieras' antes de soltarlas. La duración cambia el significado.", { size: 20 }),
  blank(),
  infoBanner([
    "Ejemplo clave: pala (pala) ≠ palla (pelota). ¡La consonante doble marca la diferencia!",
    "Para practicar: caffè = caf·fè — detené la 'f' un instante antes de soltarla.",
  ], YELLOW, "666600"),
  blank(),
  new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: [2500, 3000, 3860],
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: [
      new TableRow({ children: [tc("Palabra", 2500, NAVY, true, "FFFFFF"), tc("Silabeo", 3000, NAVY, true, "FFFFFF"), tc("Dobles marcadas", 3860, NAVY, true, "FFFFFF")] }),
      ...([
        ["caffè", "caf-fè", "ff"],
        ["cappuccino", "cap-puc-ci-no", "pp, cc"],
        ["mozzarella", "moz-za-rel-la", "zz, ll"],
        ["panna cotta", "pan-na cot-ta", "nn, tt"],
        ["tiramisù", "ti-ra-mi-sù", "(sin doble — acento final)"],
        ["pizza", "piz-za", "zz"],
        ["prosciutto", "pros-ciut-to", "tt"],
        ["ammiro", "am-mi-ro", "mm"],
      ]).map(([w, s, d]) => new TableRow({ children: [tcIta(w, 2500), tc(s, 3000, "FFFFFF", false, "444444"), tc(d, 3860, LGRAY, false, TEAL)] })),
    ],
  }),
  blank(),
);

// Ejercicios Etapa 2
ch.push(
  h2("Ejercicio 1 — ¿Qué pedís?"),
  p("Elegí la opción correcta para completar cada frase.", { italic: true }),
  blank(),
  feedbackTable([
    { q: "Non ho fame, ma ho sete. Prendo ___.", a: "una spremuta", f: "¡Perfecto! Una spremuta es ideal para la sed. Un tramezzino o cornetto son para comer." },
    { q: "Voglio qualcosa di dolce. Prendo ___.", a: "un tiramisù", f: "¡Sí! Il tiramisù es el postre italiano por excelencia." },
  ]),
  blank(),
  h2("Ejercicio 2 — I giorni della settimana"),
  p("Completá el nombre del día según la pista.", { italic: true }),
  blank(),
  feedbackTable([
    { q: "Il primo giorno della settimana è il ___.", a: "lunedì", f: "¡Correcto! En Italia la semana empieza el lunedì (con acento)." },
    { q: "Dopo il mercoledì viene il ___.", a: "giovedì", f: "¡Bien! miércoles → giovedì (con acento en la última sílaba)." },
    { q: "Il giorno del fine settimana (sabato + ___).", a: "domenica", f: "¡Correcto! sabato y domenica forman el fine settimana." },
    { q: "Il giorno prima del sabato è ___.", a: "venerdì", f: "¡Perfecto! venerdì (viernes) viene antes del sabato." },
  ]),
  blank(),
  h2("Ejercicio 3 — Verbos modali al bar"),
  p("Elegí el verbo modal correcto para cada situación.", { italic: true }),
  blank(),
  feedbackTable([
    { q: "Giulia chiede permesso: «___ avere un po' d'acqua?»", a: "Posso", f: "¡Correcto! Posso = puedo (io). Se usa para pedir permiso cortésmente." },
    { q: "Marco dice a i clienti: «___ ordinare adesso.» (deben ordenar)", a: "Dovete", f: "¡Correcto! Dovete = debéis/deben (voi). Expresa obligación." },
  ]),
  blank(),
  pgBreak(),
);

// ══════════════════════════════════════════════════════════════════════════════
// ETAPA 3 — GRAMÁTICA
// ══════════════════════════════════════════════════════════════════════════════
ch.push(
  stageBanner("ETAPA 3", "Gramática"),
  blank(),
  p("Artículos indeterminativos · Verbos modales · Preposiciones de lugar.", { italic: true, color: TEAL }),
  blank(),
);

// Artículos indeterminativos
ch.push(
  h2("1 · Gli articoli indeterminativi"),
  p("El artículo indeterminativo (un/una) tiene cuatro formas en italiano. La elección depende del género y la letra inicial de la palabra.", { size: 20 }),
  blank(),
  new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: [1200, 3800, 4360],
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: [
      new TableRow({ children: [tc("Artículo", 1200, NAVY, true, "FFFFFF"), tc("Cuándo se usa", 3800, NAVY, true, "FFFFFF"), tc("Ejemplos", 4360, NAVY, true, "FFFFFF")] }),
      ...([
        ["un", "Masculino + consonante normal o vocal", "un caffè · un aperitivo"],
        ["uno", "Masculino + s+cons., z, gn, ps, x, y", "uno spuntino · uno zaino"],
        ["una", "Femenino + consonante", "una birra · una pizza"],
        ["un'", "Femenino + vocal (se elide)", "un'acqua · un'arancia"],
      ]).map(([art, uso, ej]) => new TableRow({ children: [tcIta(art, 1200, YELLOW), tc(uso, 3800, "FFFFFF", false, "444444"), tcIta(ej, 4360)] })),
    ],
  }),
  blank(),
  infoBanner([
    "Truco: Masculino + consonante complicada (sp, st, sc, z, gn…) → uno. Resto de masculinos → un.",
    "Femenino + vocal → un'. Femenino + consonante → una.",
  ], LGRAY),
  blank(),
);

ch.push(
  h3("Ejercicio 1 — Artículo correcto"),
  p("Elegí el artículo indeterminativo correcto para cada sustantivo.", { italic: true }),
  blank(),
  feedbackTable([
    { q: "___ cappuccino (m., empieza con c)", a: "un", f: "¡Correcto! Cappuccino es masculino y empieza con consonante normal → un." },
    { q: "___ acqua (f., empieza con vocal)", a: "un'", f: "¡Perfecto! Acqua es femenino y empieza con vocal → un'." },
    { q: "___ spremuta (f., empieza con consonante)", a: "una", f: "¡Correcto! Spremuta es femenino con consonante → una." },
    { q: "___ spuntino (m., empieza con sp-)", a: "uno", f: "¡Muy bien! Spuntino empieza con sp → uno (masculino especial)." },
  ]),
  blank(),
  h3("Ejercicio 2 — Completá con el artículo"),
  p("Escribí el artículo correcto: un / uno / una / un'", { italic: true }),
  blank(),
  feedbackTable([
    { q: "Vorrei ___ tiramisù.", a: "un", f: "Tiramisù es masculino, empieza con t → un tiramisù." },
    { q: "Prendo ___ panna cotta.", a: "una", f: "Panna cotta es femenino, empieza con p → una panna cotta." },
    { q: "Ho ___ idea!", a: "un'", f: "Idea es femenino, empieza con vocal → un'idea." },
    { q: "C'è ___ zaino sul tavolo.", a: "uno", f: "Zaino es masculino, empieza con z → uno zaino." },
  ]),
  blank(),
);

// Verbos modales
ch.push(
  h2("2 · I verbi modali — dovere · potere · volere"),
  p("Son verbos irregulares esenciales. Van siempre seguidos de un infinitivo.", { size: 20 }),
  blank(),
  infoBanner([
    "Estructura: Modal + Infinitivo",
    "  Voglio bere un caffè.   — Quiero beber un café.",
    "  Posso avere il conto?   — ¿Puedo tener la cuenta?",
    "  Devo andare adesso.     — Debo irme ahora.",
  ], LGREEN, GREEN),
  blank(),
  conjTable("dovere — deber", [
    ["io", "devo", "debo"],
    ["tu", "devi", "debés"],
    ["lui/lei", "deve", "debe"],
    ["noi", "dobbiamo", "debemos"],
    ["voi", "dovete", "deben (uds.)"],
    ["loro", "devono", "deben (ellos)"],
  ]),
  blank(),
  conjTable("potere — poder", [
    ["io", "posso", "puedo"],
    ["tu", "puoi", "podés"],
    ["lui/lei", "può", "puede"],
    ["noi", "possiamo", "podemos"],
    ["voi", "potete", "pueden (uds.)"],
    ["loro", "possono", "pueden (ellos)"],
  ]),
  blank(),
  conjTable("volere — querer", [
    ["io", "voglio", "quiero"],
    ["tu", "vuoi", "querés"],
    ["lui/lei", "vuole", "quiere"],
    ["noi", "vogliamo", "queremos"],
    ["voi", "volete", "quieren (uds.)"],
    ["loro", "vogliono", "quieren (ellos)"],
  ]),
  blank(),
);

ch.push(
  h3("Ejercicio 3 — Verbos modali, selección múltiple"),
  p("Elegí la forma correcta del verbo modal.", { italic: true }),
  blank(),
  feedbackTable([
    { q: "Giulia e Marco ___ ordinare subito. (deber)", a: "devono", f: "¡Correcto! Loro devono = ellos deben." },
    { q: "Io non ___ bere alcolici. (poder — negación)", a: "posso", f: "¡Exacto! Io posso = yo puedo (Non posso = no puedo)." },
    { q: "Voi cosa ___ mangiare? (querer)", a: "volete", f: "¡Bien! Voi volete = ustedes quieren." },
  ]),
  blank(),
  h3("Ejercicio 4 — Completá con el modal correcto"),
  p("Escribí la forma correcta del verbo entre paréntesis.", { italic: true }),
  blank(),
  feedbackTable([
    { q: "Io ___ un gelato. (volere)", a: "voglio", f: "io → voglio (volere)." },
    { q: "Tu ___ venire al bar? (potere)", a: "puoi", f: "tu → puoi (potere)." },
    { q: "Lui ___ pagare il conto. (dovere)", a: "deve", f: "lui/lei → deve (dovere)." },
    { q: "Noi ___ ordinare adesso. (potere)", a: "possiamo", f: "noi → possiamo (potere)." },
  ]),
  blank(),
);

// Preposizioni
ch.push(
  h2("3 · Le preposizioni di luogo — da · a · in"),
  p("Da, a e in son las preposiciones de lugar más usadas. Tienen matices distintos que se entienden mejor con ejemplos del bar.", { size: 20 }),
  blank(),
  new Table({
    width: { size: PW, type: WidthType.DXA },
    columnWidths: [1000, 3200, 5160],
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: [
      new TableRow({ children: [tc("Prep.", 1000, NAVY, true, "FFFFFF"), tc("Uso principal", 3200, NAVY, true, "FFFFFF"), tc("Ejemplo al bar", 5160, NAVY, true, "FFFFFF")] }),
      ...([
        ["da", "Lugar de alguien / origen / desde", "Vado da Mario. (Voy donde Mario / al bar de Mario)"],
        ["a", "Ciudad / lugar puntual / dirección", "Sono al bar. · Vado a Roma."],
        ["in", "Interior de un espacio / país / región", "Siamo in Italia. · Il tavolo è in fondo."],
      ]).map(([p, u, e]) => new TableRow({ children: [tcIta(p, 1000, YELLOW), tc(u, 3200, "FFFFFF", false, "444444"), tcIta(e, 5160)] })),
    ],
  }),
  blank(),
  infoBanner([
    "Atención con «al»: a + il = al (automático en italiano).",
    "Decimos: al bar · al ristorante · al mercato. Nunca «a il bar».",
    "Para ciudades siempre «a»: vado a Roma, sono a Venezia.",
    "Para países y regiones: in Italia · in Toscana · in Argentina.",
  ]),
  blank(),
);

ch.push(
  h3("Ejercicio 5 — Preposizioni di luogo"),
  p("Elegí la preposición correcta.", { italic: true }),
  blank(),
  feedbackTable([
    { q: "Giulia è ___ bar con un'amica.", a: "al", f: "¡Correcto! Al bar (a + il). Lugar puntual → a. A + il = al." },
    { q: "Domani andiamo ___ Roma.", a: "a", f: "¡Perfecto! Para ciudades, siempre a: vado a Roma, vivo a Milano." },
    { q: "Abitiamo ___ Italia da tre anni.", a: "in", f: "¡Correcto! In + país → in Italia, in Argentina." },
  ]),
  blank(),
  h3("Ejercicio 6 — Completá con da, a o in"),
  blank(),
  feedbackTable([
    { q: "Stasera vado ___ Giulia.", a: "da", f: "da = «donde alguien» — Vado da Giulia = voy donde Giulia." },
    { q: "Il bar è ___ centro.", a: "in", f: "in = interior de un espacio — il bar è in centro (en el centro)." },
    { q: "Andiamo ___ Venezia.", a: "a", f: "a + ciudad — Andiamo a Venezia." },
  ]),
  blank(),
);

// Ejercicios integradores
ch.push(
  h2("Ejercicios integradores"),
  p("Estos ejercicios mezclan artículos, modali y preposizioni. ¡El verdadero desafío!", { italic: true }),
  blank(),
  h3("Ejercicio 7 — «Al bar con amici»"),
  blank(),
  feedbackTable([
    { q: "Voglio ___ caffè, per favore.", a: "un", f: "Caffè es masculino, empieza con c → un caffè." },
    { q: "Noi ___ partire presto.", a: "dobbiamo", f: "noi + dovere → dobbiamo. Expresa obligación." },
    { q: "Sei ___ bar adesso?", a: "al", f: "al = a + il. Lugar puntual → a + il bar = al bar." },
  ]),
  blank(),
  h3("Ejercicio 8 — Traducción contextual"),
  blank(),
  feedbackTable([
    { q: "«Quiero una cerveza y un agua.»", a: "Voglio una birra e un'acqua.", f: "¡Perfecto! Birra (f, cons.) → una. Acqua (f, vocal) → un'." },
    { q: "«¿Podés venir al bar el viernes?»", a: "Puoi venire al bar venerdì?", f: "¡Correcto! Puoi = podés (tu). Al bar = a + il bar." },
  ]),
  blank(),
);

// Nota cultural
ch.push(
  h2("Nota cultural — Il bar italiano: un rito quotidiano"),
  blank(),
  banner([
    new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Il bar in Italia non è semplicemente un posto dove si beve. È un luogo di incontro, di conversazione, di pausa dalla vita frenetica.", font: FONT, size: 20, bold: true, color: NAVY })] }),
    new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Gli italiani vanno al bar la mattina per un caffè e un cornetto, a mezzogiorno per un panino veloce, e il pomeriggio per un aperitivo. Il caffè si beve quasi sempre al bancone — è più economico e più veloce. Sedersi ai tavolini costa di più, soprattutto nelle città turistiche.", font: FONT, size: 20, color: NAVY })] }),
  ], LTEAL),
  blank(),
  p("En español: El bar en Italia no es simplemente un lugar donde se bebe. Es un espacio de encuentro, conversación y pausa de la vida agitada. Los italianos van al bar por la mañana para tomar un café y un cornetto, al mediodía para un sándwich rápido, y por la tarde para un aperitivo. El café casi siempre se toma parado en el mostrador — es más económico y rápido. Sentarse en las mesas cuesta más, especialmente en ciudades turísticas.", { size: 19, color: "555555", italic: true }),
  blank(),
);

// ══════════════════════════════════════════════════════════════════════════════
// Build document
// ══════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children: ch,
  }],
});

const outPath = path.join(__dirname, "modulo6_al_bar.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("✓ Creado:", outPath);
}).catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
