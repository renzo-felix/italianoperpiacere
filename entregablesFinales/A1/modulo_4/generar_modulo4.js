const path = require("path");
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageBreak
} = require("C:/Users/Renzo/AppData/Roaming/npm/node_modules/docx");

// ── helpers ────────────────────────────────────────────────────────────────
const TEAL   = "2E6B7B";
const LTEAL  = "D6EAF0";
const GREEN  = "1E7A3C";
const LGREEN = "D5F5E3";
const RED    = "B22222";
const LRED   = "FAD7D7";
const LGRAY  = "F2F2F2";
const BLACK  = "000000";
const FONTS  = "Arial";
const PAGE_W = 9360; // A4 content width DXA (1 inch margins)

const brd = (color = "CCCCCC") => ({ style: BorderStyle.SINGLE, size: 4, color });
const borders = (color = "CCCCCC") => ({ top: brd(color), bottom: brd(color), left: brd(color), right: brd(color) });

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    shading: { fill: TEAL, type: ShadingType.CLEAR },
    children: [new TextRun({ text, font: FONTS, size: 32, bold: true, color: "FFFFFF" })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 80 },
    children: [new TextRun({ text, font: FONTS, size: 26, bold: true, color: TEAL })]
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, font: FONTS, size: 22, bold: true, color: BLACK })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: FONTS, size: 22, italic: opts.italic, bold: opts.bold, color: opts.color || BLACK })]
  });
}

function pMixed(runs) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: runs.map(r => new TextRun({ text: r.text, font: FONTS, size: 22, italic: r.italic, bold: r.bold, color: r.color || BLACK }))
  });
}

function note(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 360 },
    shading: { fill: LGRAY, type: ShadingType.CLEAR },
    children: [new TextRun({ text, font: FONTS, size: 20, color: "444444", italic: true })]
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "BBBBBB" } },
    children: []
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    borders: borders(opts.borderColor || "CCCCCC"),
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({ text, font: FONTS, size: opts.size || 20, bold: opts.bold, italic: opts.italic, color: opts.color || BLACK })]
    })]
  });
}

function row(cells) { return new TableRow({ children: cells }); }

function headerRow(labels, widths) {
  return row(labels.map((l, i) => cell(l, { fill: TEAL, bold: true, color: "FFFFFF", width: widths[i] })));
}

// ── Ejercicio V/F table ────────────────────────────────────────────────────
function vfTable(items) {
  const colW = [400, 5600, 1200, 2160]; // N / Afirmación / Resp. / Justificación
  const total = colW.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colW,
    rows: [
      headerRow(["N°", "Afirmación", "Respuesta", "Justificación"], colW),
      ...items.map((it, idx) => row([
        cell(String(idx + 1), { width: colW[0], bold: true }),
        cell(it.q, { width: colW[1] }),
        cell(it.a, { width: colW[2], fill: it.correct ? LGREEN : LRED, bold: true, color: it.correct ? GREEN : RED }),
        cell(it.j, { width: colW[3], italic: true })
      ]))
    ]
  });
}

// ── Ejercicio selección múltiple table ────────────────────────────────────
function smTable(items) {
  // items: [{ n, q, opts: [{text, correct}], j }]
  const children = [];
  items.forEach(it => {
    children.push(new Paragraph({ spacing: { before: 120, after: 40 },
      children: [new TextRun({ text: `${it.n}. ${it.q}`, font: FONTS, size: 21, bold: true })] }));
    const colW = [4680, 4680];
    const total = PAGE_W;
    const optsRows = it.opts.map(opt => row([
      cell(opt.correct ? `✓  ${opt.text}` : `    ${opt.text}`,
        { width: colW[0], fill: opt.correct ? LGREEN : undefined, color: opt.correct ? GREEN : BLACK, bold: opt.correct }),
      opt.correct ? cell(`← correcta`, { width: colW[1], italic: true, color: GREEN }) : cell("", { width: colW[1] })
    ]));
    children.push(new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: colW, rows: optsRows }));
    children.push(new Paragraph({ spacing: { before: 40, after: 80 },
      children: [new TextRun({ text: `Justificación: ${it.j}`, font: FONTS, size: 19, italic: true, color: "555555" })] }));
  });
  return children;
}

// ── Simple answer table ──────────────────────────────────────────────────
function answerTable(rows_data, colW) {
  const total = colW.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: colW,
    rows: rows_data.map(r => row(r.map((c, i) =>
      cell(c.text, { width: colW[i], fill: c.fill, bold: c.bold, color: c.color, italic: c.italic, size: 20 })
    )))
  });
}

// ══════════════════════════════════════════════════════════════════════════
//  DOCUMENT CONTENT
// ══════════════════════════════════════════════════════════════════════════
const children = [];

// ── Portada ───────────────────────────────────────────────────────────────
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 480, after: 160 },
  children: [new TextRun({ text: "MÓDULO 4 · A1", font: FONTS, size: 48, bold: true, color: TEAL })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 80 },
  children: [new TextRun({ text: "Che ore sono?  —  ¿Qué hora es?", font: FONTS, size: 28, italic: true, color: "555555" })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 480 },
  children: [new TextRun({ text: "Documento de revisión con respuestas correctas y justificaciones", font: FONTS, size: 20, color: "777777" })]
}));
children.push(divider());

// ══════════════════════════════════════════════════════════════════════════
// ETAPA 1 — EXPLORACIÓN
// ══════════════════════════════════════════════════════════════════════════
children.push(h1("ETAPA 1  ·  EXPLORACIÓN"));
children.push(pMixed([
  { text: "Tutti in piazza!  ", bold: true, italic: true },
  { text: "Una ", italic: false },
  { text: "barzelletta", italic: true },
  { text: " italiana — aprende a preguntar la hora", italic: false }
]));
children.push(p(""));
children.push(h3("🇮🇹  Sofía — tu guía"));
children.push(p("Hoy aprendemos a pedir la hora... ¡con una barzelletta! Una barzelletta es un chiste italiano. Este video es muy corto pero molto divertente — muy gracioso. Los italianos tienen una larga tradición de chistes contados con gestos y teatralidad. ¡Prepárate para reírte y aprender al mismo tiempo!"));
children.push(p(""));
children.push(h3("🎯  Mientras ves el video, prestá atención a..."));
children.push(p("1.  ¿Cómo pregunta la hora el hombre? ¿Qué palabras usa exactamente?"));
children.push(p("2.  ¿Qué horas menciona durante el chiste?"));
children.push(pMixed([
  { text: "3.  ¿Cuál es el chiste? ¿Qué hay debajo del burrito (" },
  { text: "il Ciuchino", italic: true },
  { text: ")?" }
]));
children.push(p(""));
children.push(h3("💡  ¿No entendiste el chiste?"));
children.push(pMixed([
  { text: "El segundo hombre dice que lee la hora en " },
  { text: '"le palle del Ciuchino"', italic: true },
  { text: " (las bolas del burrito). Cuando las levanta... ¡debajo hay un " },
  { text: "campanile", bold: true },
  { text: ", un campanario! Los campanarios en los pueblos italianos históricamente eran el reloj público de toda la comunidad. El absurdo cómico es que alguien lleve un campanario escondido ahí. ¡Ahora el chiste tiene mucha más gracia!" }
]));
children.push(p(""));

// ── Exploración: Ejercicio 1 — Verdadero o Falso ─────────────────────────
children.push(divider());
children.push(h2("Ejercicio 1  ·  Verdadero o Falso"));
children.push(p("Basado en la barzelletta que acabás de ver."));
children.push(p(""));

children.push(vfTable([
  {
    q: 'El hombre empieza con "Mi scusi" para llamar la atención.',
    a: "✓  VERDADERO",
    correct: true,
    j: 'La frase exacta del video es "Mi scusi, mi sa dire l\'ora per favore?" — empieza con esa cortesía formal.'
  },
  {
    q: "La primera hora que escucha el hombre son las 3:35.",
    a: "✗  FALSO",
    correct: false,
    j: 'La primera respuesta que da el personaje es "Le 5:35" (las 5:35). Las 3:35 no aparecen en la barzelletta.'
  },
  {
    q: 'Al final del chiste el hombre dice "sono le 7:15 spaccate".',
    a: "✓  VERDADERO",
    correct: true,
    j: 'Exactamente así finaliza el chiste: "Sono le 7:15 spaccate!" — esa es la gracia del campanile que marcaba esa hora.'
  },
  {
    q: "El segundo personaje lee la hora en un reloj de pulsera.",
    a: "✗  FALSO",
    correct: false,
    j: 'El segundo personaje no tiene reloj de pulsera: dice que lee la hora en "le palle del Ciuchino" (el burrito), debajo de las cuales hay un campanario.'
  },
  {
    q: "Debajo del burrito (il Ciuchino) hay un campanile.",
    a: "✓  VERDADERO",
    correct: true,
    j: 'Ese es el remate del chiste: "Sotto c\'è il campanile!" — el campanario que usa como reloj.'
  }
]));
children.push(p(""));

// ── Exploración: Ejercicio 2 — Selección múltiple ─────────────────────────
children.push(h2("Ejercicio 2  ·  Selección múltiple"));
children.push(p("Elegí la respuesta correcta para cada pregunta."));
children.push(p(""));

const smItems = [
  {
    n: 1,
    q: "¿Cómo pide la hora el hombre en la barzelletta?",
    opts: [
      { text: "Mi sa dire l'ora?", correct: true },
      { text: "Che lavoro fai?", correct: false },
      { text: "Come ti chiami?", correct: false },
      { text: "Dove sei?", correct: false }
    ],
    j: '"Mi sa dire l\'ora?" es la frase textual del video. Las otras opciones preguntan por el trabajo, el nombre y la ubicación, que no tienen nada que ver con pedir la hora.'
  },
  {
    n: 2,
    q: "¿Qué hora exacta dice el segundo hombre al final del chiste?",
    opts: [
      { text: "7:15", correct: true },
      { text: "5:35", correct: false },
      { text: "8:00", correct: false },
      { text: "9:00", correct: false }
    ],
    j: 'Al final dice "Sono le 7:15 spaccate!" — las 7:15 en punto. Las 5:35 es la primera hora mencionada, no la final.'
  },
  {
    n: 3,
    q: "¿Qué hay debajo de las palle del Ciuchino?",
    opts: [
      { text: "Un campanile (campanario)", correct: true },
      { text: "Un orologio (reloj)", correct: false },
      { text: "Una chiesa (iglesia)", correct: false },
      { text: "Un palazzo (palacio)", correct: false }
    ],
    j: 'El remate del chiste es precisamente "Sotto c\'è il campanile!" — el campanario escondido que usaba para saber la hora.'
  },
  {
    n: 4,
    q: 'En italiano, ¿qué significa "spaccate" al hablar de la hora?',
    opts: [
      { text: "En punto exacto", correct: true },
      { text: "Más o menos", correct: false },
      { text: "Y cuarto", correct: false },
      { text: "Y media", correct: false }
    ],
    j: '"Spaccate" = "en punto exacto" (literalmente: partidas/exactas). Sinónimo de "in punto". La forma informal que escuchás en la calle.'
  }
];

smTable(smItems).forEach(el => children.push(el));
children.push(p(""));

// ══════════════════════════════════════════════════════════════════════════
// ETAPA 2 — DESCUBRIMIENTO
// ══════════════════════════════════════════════════════════════════════════
children.push(pageBreak());
children.push(h1("ETAPA 2  ·  DESCUBRIMIENTO"));
children.push(pMixed([
  { text: "Che ore sono?", bold: true, italic: true },
  { text: "  —  Descubrí cómo los italianos preguntan y dicen la hora sin memorizar reglas." }
]));
children.push(p(""));
children.push(h3("👩‍🏫  Sofía · tu guía"));
children.push(p("¿Cuántas veces preguntamos la hora al día? En italiano hay formas muy específicas de decirla... y una forma muy divertida de aprenderlas: ¡con una barzelletta!"));
children.push(pMixed([
  { text: "En el video escuchamos " },
  { text: "«Mi sa dire l'ora?»", italic: true },
  { text: " y " },
  { text: "«Sono le sette e quindici spaccate!»", italic: true },
  { text: " — ¿notaste esas frases? En esta etapa las vamos a explorar juntos, pasito a pasito." }
]));
children.push(p("Ah, y si pensás que el chiste era sobre un burro y un campanario... pues sí. Y resulta que los italianos usaban los campanarios como relojes. ¡La historia es mejor de lo que parece! 🔔"));
children.push(p(""));

// ── 2. Frases reales ──────────────────────────────────────────────────────
children.push(h2("2  ·  Frases reales de la barzelletta"));
children.push(p("Estas son las frases exactas del video (el ▶ indica dónde hay audio en la versión digital):"));
children.push(p(""));

const frases = [
  { it: "Mi scusi, mi sa dire l'ora per favore?", es: "Disculpe, ¿me puede decir la hora por favor?", nota: "Cómo pedir la hora formalmente" },
  { it: "Le 5:35.", es: "Las 5:35.", nota: "Respuesta directa — solo la hora" },
  { it: "Ma è sicuro?", es: "¿Pero está seguro?", nota: "Duda graciosa del protagonista" },
  { it: "Senta, mi sa dire che ore sono?", es: "Oiga, ¿me puede decir qué hora es?", nota: "Otra forma de pedir la hora" },
  { it: "Sono le 7:15 spaccate!", es: "¡Son las 7 y cuarto en punto!", nota: "spaccate = exactas, en punto ✓" },
  { it: "Sotto c'è il campanile!", es: "¡Abajo está el campanario!", nota: "El remate del chiste" }
];

const frasesColW = [3200, 2800, 3360];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: frasesColW,
  rows: [
    headerRow(["Italiano (original)", "Español", "Nota"], frasesColW),
    ...frases.map(f => row([
      cell(f.it, { width: frasesColW[0], italic: true, bold: true }),
      cell(f.es, { width: frasesColW[1] }),
      cell(f.nota, { width: frasesColW[2], italic: true, color: "555555" })
    ]))
  ]
}));
children.push(p(""));
children.push(pMixed([
  { text: "Observá: ", bold: true },
  { text: "¿Hay dos formas de preguntar la hora? " },
  { text: "«mi sa dire l'ora»", italic: true },
  { text: " y " },
  { text: "«che ore sono»", italic: true },
  { text: " son las dos más comunes. Las irás usando naturalmente." }
]));
children.push(p(""));

// ── 3. El reloj ───────────────────────────────────────────────────────────
children.push(h2("3  ·  Il reloj — las horas en italiano"));
children.push(p("Cada número corresponde a una hora. Notá algo raro en el 1:"));
children.push(p(""));

const horasColW = [1200, 1600, 1200, 1600, 1200, 1600];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: horasColW,
  rows: [
    headerRow(["Num.", "En italiano", "Num.", "En italiano", "Num.", "En italiano"], horasColW),
    row([
      cell("1", { width: horasColW[0], bold: true }),
      cell("È l'una *", { width: horasColW[1], italic: true }),
      cell("5", { width: horasColW[2], bold: true }),
      cell("Sono le cinque", { width: horasColW[3], italic: true }),
      cell("9", { width: horasColW[4], bold: true }),
      cell("Sono le nove", { width: horasColW[5], italic: true })
    ]),
    row([
      cell("2", { width: horasColW[0], bold: true }),
      cell("Sono le due", { width: horasColW[1], italic: true }),
      cell("6", { width: horasColW[2], bold: true }),
      cell("Sono le sei", { width: horasColW[3], italic: true }),
      cell("10", { width: horasColW[4], bold: true }),
      cell("Sono le dieci", { width: horasColW[5], italic: true })
    ]),
    row([
      cell("3", { width: horasColW[0], bold: true }),
      cell("Sono le tre", { width: horasColW[1], italic: true }),
      cell("7", { width: horasColW[2], bold: true }),
      cell("Sono le sette", { width: horasColW[3], italic: true }),
      cell("11", { width: horasColW[4], bold: true }),
      cell("Sono le undici", { width: horasColW[5], italic: true })
    ]),
    row([
      cell("4", { width: horasColW[0], bold: true }),
      cell("Sono le quattro", { width: horasColW[1], italic: true }),
      cell("8", { width: horasColW[2], bold: true }),
      cell("Sono le otto", { width: horasColW[3], italic: true }),
      cell("12", { width: horasColW[4], bold: true }),
      cell("Sono le dodici", { width: horasColW[5], italic: true })
    ]),
    row([
      cell("☀️", { width: horasColW[0] }),
      cell("mezzogiorno", { width: horasColW[1], italic: true }),
      cell("🌙", { width: horasColW[2] }),
      cell("mezzanotte", { width: horasColW[3], italic: true }),
      cell("", { width: horasColW[4] }),
      cell("", { width: horasColW[5] })
    ])
  ]
}));
children.push(p(""));
children.push(pMixed([
  { text: "* ¿Lo notaste? ", bold: true },
  { text: "El 1 es especial: " },
  { text: "«È l'una»", italic: true },
  { text: " — usa " },
  { text: "È", bold: true },
  { text: " (singular) en vez de " },
  { text: "Sono", italic: true },
  { text: ". Igual que el mediodía y la medianoche. ¡El italiano ama los singulares especiales!" }
]));
children.push(p(""));

// ── 4. Cómo se construye ──────────────────────────────────────────────────
children.push(h2("4  ·  ¿Cómo se construye la hora?"));
children.push(p("Observá el patrón — no hay que memorizar reglas, se revela solo:"));
children.push(p(""));

const construcColW = [1200, 4000, 4160];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: construcColW,
  rows: [
    headerRow(["Hora", "En italiano", "Parte clave"], construcColW),
    row([cell("7:00", { width: construcColW[0], bold: true }), cell("Sono le sette", { width: construcColW[1], italic: true }), cell("Solo la hora", { width: construcColW[2] })]),
    row([cell("7:15", { width: construcColW[0], bold: true }), cell("Sono le sette e un quarto", { width: construcColW[1], italic: true }), cell("+ e un quarto", { width: construcColW[2] })]),
    row([cell("7:30", { width: construcColW[0], bold: true }), cell("Sono le sette e mezza", { width: construcColW[1], italic: true }), cell("+ e mezza", { width: construcColW[2] })]),
    row([cell("7:45", { width: construcColW[0], bold: true }), cell("Sono le otto meno un quarto", { width: construcColW[1], italic: true }), cell("hora siguiente − quarto", { width: construcColW[2] })]),
    row([cell("7:20", { width: construcColW[0], bold: true }), cell("Sono le sette e venti", { width: construcColW[1], italic: true }), cell("+ e + minutos", { width: construcColW[2] })])
  ]
}));
children.push(p(""));
children.push(pMixed([
  { text: "Patrón: ", bold: true },
  { text: "Primero va la hora (" },
  { text: "le sette", italic: true },
  { text: "), luego se agrega " },
  { text: "«e»", italic: true },
  { text: " + los minutos. Para la última parte de la hora, los italianos usan la hora siguiente con " },
  { text: "«meno»", italic: true },
  { text: " (menos). ¡Exactamente como en español informal!" }
]));
children.push(p(""));

// ── 5. Formal vs Informal ────────────────────────────────────────────────
children.push(h2("5  ·  Orario formale vs. informale"));
children.push(p("En una estación de tren o aeropuerto se usa el horario de 24h. En la calle, el informal:"));
children.push(p(""));

const fvfColW = [1200, 3600, 4560];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: fvfColW,
  rows: [
    headerRow(["Hora", "🏛 Formal (24h)", "🗣 Informal"], fvfColW),
    row([cell("14:00", { width: fvfColW[0], bold: true }), cell("le quattordici", { width: fvfColW[1], italic: true }), cell("le due del pomeriggio", { width: fvfColW[2], italic: true })]),
    row([cell("15:30", { width: fvfColW[0], bold: true }), cell("le quindici e trenta", { width: fvfColW[1], italic: true }), cell("le tre e mezza", { width: fvfColW[2], italic: true })]),
    row([cell("7:15",  { width: fvfColW[0], bold: true }), cell("le sette e quindici", { width: fvfColW[1], italic: true }), cell("le sette e un quarto", { width: fvfColW[2], italic: true })]),
    row([cell("20:45", { width: fvfColW[0], bold: true }), cell("le venti e quarantacinque", { width: fvfColW[1], italic: true }), cell("le nove meno un quarto", { width: fvfColW[2], italic: true })]),
    row([cell("12:00", { width: fvfColW[0], bold: true }), cell("le dodici", { width: fvfColW[1], italic: true }), cell("mezzogiorno", { width: fvfColW[2], italic: true })]),
    row([cell("0:00",  { width: fvfColW[0], bold: true }), cell("le zero / mezzanotte", { width: fvfColW[1], italic: true }), cell("mezzanotte", { width: fvfColW[2], italic: true })])
  ]
}));
children.push(p(""));

// ── 6. Saludos ────────────────────────────────────────────────────────────
children.push(h2("6  ·  Saluti della giornata — Saludos del día"));
children.push(p(""));
const saludosColW = [2400, 2400, 4560];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: saludosColW,
  rows: [
    headerRow(["Saludo", "Horario", "Uso"], saludosColW),
    row([cell("🌅 Buongiorno!",     { width: saludosColW[0], bold: true }), cell("6:00 – 12:00",   { width: saludosColW[1] }), cell("Buenos días — al llegar y al despedirse por la mañana", { width: saludosColW[2] })]),
    row([cell("☀️ Buon pomeriggio!", { width: saludosColW[0], bold: true }), cell("12:00 – 17:00",  { width: saludosColW[1] }), cell("Buenas tardes — menos común, más formal", { width: saludosColW[2] })]),
    row([cell("🌆 Buonasera!",      { width: saludosColW[0], bold: true }), cell("17:00 – 22:00",  { width: saludosColW[1] }), cell("Buenas tardes/noches — al llegar Y al marcharse por la tarde", { width: saludosColW[2] })]),
    row([cell("🌙 Buonanotte!",     { width: saludosColW[0], bold: true }), cell("22:00 – 6:00",   { width: saludosColW[1] }), cell("Buenas noches — SOLO al despedirse (antes de dormir)", { width: saludosColW[2] })]),
    row([cell("Salve!",             { width: saludosColW[0], bold: true }), cell("todo el día",    { width: saludosColW[1] }), cell("Hola (formal, a cualquier hora)", { width: saludosColW[2] })])
  ]
}));
children.push(note("⚠️  Buonanotte es SOLO para despedirse antes de dormir. Buonasera se usa también al marcharse de noche (igual que \"buenas noches\" al salir de un restorán a las 20:00 en Argentina)."));
children.push(p(""));

// ── 7. Diálogos (referencia) ──────────────────────────────────────────────
children.push(h2("7  ·  Diálogos en la calle (versión digital tiene audio)"));
children.push(p("Estos diálogos muestran cómo pedir la hora de forma natural, sin barzelletta:"));
children.push(p(""));
children.push(pMixed([{ text: "Diálogo 1 — Due uomini (escuchar, luego leer línea por línea)", bold: true }]));
children.push(pMixed([
  { text: "Uomo 1: ", bold: true }, { text: "Senta, mi sa dire l'ora?", italic: true }
]));
children.push(pMixed([
  { text: "Uomo 2: ", bold: true }, { text: "Sono le tre e un quarto.", italic: true }
]));
children.push(pMixed([
  { text: "Uomo 1: ", bold: true }, { text: "Grazie mille!", italic: true }
]));
children.push(pMixed([
  { text: "Uomo 2: ", bold: true }, { text: "Prego!", italic: true }
]));
children.push(p(""));
children.push(pMixed([{ text: "Diálogo 2 — Donna e Uomo", bold: true }]));
children.push(pMixed([
  { text: "Donna: ", bold: true }, { text: "Scusa, che ore sono?", italic: true }
]));
children.push(pMixed([
  { text: "Uomo: ", bold: true }, { text: "Sono le cinque meno un quarto.", italic: true }
]));
children.push(pMixed([
  { text: "Donna: ", bold: true }, { text: "Ah, grazie!", italic: true }
]));
children.push(pMixed([
  { text: "Uomo: ", bold: true }, { text: "Di niente!", italic: true }
]));
children.push(p(""));

// ── 8. ¿A qué hora? ──────────────────────────────────────────────────────
children.push(h2("8  ·  ¿A qué hora...? — Vita italiana"));
children.push(p("Horarios típicos en Italia (¡tienen su lógica cultural!):"));
children.push(p(""));
const vitaColW = [3600, 2160, 3600];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: vitaColW,
  rows: [
    headerRow(["Actividad", "Hora correcta", "Nota cultural"], vitaColW),
    row([cell("☕ Il bar apre alle...", { width: vitaColW[0] }), cell("7:00", { width: vitaColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("Los bares abren tempranísimo para el desayuno", { width: vitaColW[2], italic: true })]),
    row([cell("🍝 Il pranzo è a...", { width: vitaColW[0] }), cell("13:00", { width: vitaColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("El almuerzo es la comida principal del día", { width: vitaColW[2], italic: true })]),
    row([cell("🍽 La cena è a...", { width: vitaColW[0] }), cell("20:00", { width: vitaColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("La cena es tarde — más parecido a Argentina", { width: vitaColW[2], italic: true })]),
    row([cell("🏛 Il museo chiude alle...", { width: vitaColW[0] }), cell("18:00", { width: vitaColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("Muchos museos cierran antes que en otros países", { width: vitaColW[2], italic: true })]),
    row([cell("💼 L'ufficio apre alle...", { width: vitaColW[0] }), cell("9:00", { width: vitaColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("Horario estándar de oficinas", { width: vitaColW[2], italic: true })]),
    row([cell("💊 La farmacia è aperta fino alle...", { width: vitaColW[0] }), cell("19:30", { width: vitaColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("Aprox. — muchas cierran a esa hora", { width: vitaColW[2], italic: true })])
  ]
}));
children.push(p(""));

// ── 9. Espressioni di tempo ───────────────────────────────────────────────
children.push(h2("9  ·  Espressioni di tempo"));
children.push(p("Más allá de decir la hora exacta, los italianos usan estas expresiones constantemente:"));
children.push(p(""));
const exprColW = [2800, 6560];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: exprColW,
  rows: [
    headerRow(["Expresión", "Significado"], exprColW),
    row([cell("alle otto", { width: exprColW[0], italic: true }), cell("a las ocho", { width: exprColW[1] })]),
    row([cell("verso le dieci", { width: exprColW[0], italic: true }), cell("hacia las diez (aproximado) — muy común en Italia", { width: exprColW[1] })]),
    row([cell("dalle sette alle undici", { width: exprColW[0], italic: true }), cell("de las siete a las once", { width: exprColW[1] })]),
    row([cell("tra un'ora", { width: exprColW[0], italic: true }), cell("en una hora (en el futuro)", { width: exprColW[1] })]),
    row([cell("a mezzogiorno in punto", { width: exprColW[0], italic: true }), cell("al mediodía en punto", { width: exprColW[1] })]),
    row([cell("prima di cena", { width: exprColW[0], italic: true }), cell("antes de cenar", { width: exprColW[1] })]),
    row([cell("dopo pranzo", { width: exprColW[0], italic: true }), cell("después del almuerzo", { width: exprColW[1] })])
  ]
}));
children.push(note("💡 Tip cultural: «Verso le dieci» es clave en Italia. Los italianos raramente son puntuales al minuto — verso (hacia, alrededor de) es la palabra que suaviza todo compromiso de hora. ¡Adoptala!"));
children.push(p(""));

// ── 10. Fonética L / R ─────────────────────────────────────────────────────
children.push(h2("10  ·  Fonética: i suoni L e R"));
children.push(p("La L y la R en italiano suenan diferente al español. La R italiana es vibrante (rolada), como la R doble del español. Practicá estos pares:"));
children.push(p(""));
const fonColW = [2000, 2000, 640, 2000, 2720];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: fonColW,
  rows: [
    headerRow(["Con L", "Significa", "vs", "Con R", "Significa"], fonColW),
    row([cell("luna", { width: fonColW[0], italic: true, bold: true }), cell("luna", { width: fonColW[1] }), cell("vs", { width: fonColW[2] }), cell("runa", { width: fonColW[3], italic: true }), cell("(palabra de práctica)", { width: fonColW[4] })]),
    row([cell("letto", { width: fonColW[0], italic: true, bold: true }), cell("cama", { width: fonColW[1] }), cell("vs", { width: fonColW[2] }), cell("retto", { width: fonColW[3], italic: true }), cell("recto, derecho", { width: fonColW[4] })]),
    row([cell("lana", { width: fonColW[0], italic: true, bold: true }), cell("lana", { width: fonColW[1] }), cell("vs", { width: fonColW[2] }), cell("rana", { width: fonColW[3], italic: true }), cell("rana", { width: fonColW[4] })]),
    row([cell("luce", { width: fonColW[0], italic: true, bold: true }), cell("luz", { width: fonColW[1] }), cell("vs", { width: fonColW[2] }), cell("ruce", { width: fonColW[3], italic: true }), cell("(de práctica)", { width: fonColW[4] })]),
    row([cell("olio", { width: fonColW[0], italic: true, bold: true }), cell("aceite", { width: fonColW[1] }), cell("vs", { width: fonColW[2] }), cell("orario", { width: fonColW[3], italic: true }), cell("horario", { width: fonColW[4] })])
  ]
}));
children.push(p(""));

// ── 11. Articulitos ───────────────────────────────────────────────────────
children.push(h2("11  ·  ¿Notaste estas palabritas? — Los artículos"));
children.push(p("Mirá estas frases del módulo. ¿Ves esas palabritas antes de los sustantivos? «il campanile», «l'ora», «la piazza»... No son decoración — le dicen al italiano si la cosa es masculina o femenina, conocida o nueva."));
children.push(p("Hoy no memorizamos reglas. Solo notamos el patrón. ¿Listo para espiar?"));
children.push(p(""));

const artEjColW = [3200, 1400, 4760];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: artEjColW,
  rows: [
    headerRow(["Frase del módulo", "Artículo", "Patrón observado"], artEjColW),
    row([cell("Sotto c'è il campanile!", { width: artEjColW[0], italic: true }), cell("il", { width: artEjColW[1], bold: true }), cell("masculino, empieza con consonante", { width: artEjColW[2] })]),
    row([cell("Mi sa dire l'ora?", { width: artEjColW[0], italic: true }), cell("l'", { width: artEjColW[1], bold: true }), cell("vocal → el artículo se «come» la vocal", { width: artEjColW[2] })]),
    row([cell("Tutti in la piazza!", { width: artEjColW[0], italic: true }), cell("la", { width: artEjColW[1], bold: true }), cell("femenino, empieza con consonante", { width: artEjColW[2] })]),
    row([cell("Ho una riunione alle tre!", { width: artEjColW[0], italic: true }), cell("una", { width: artEjColW[1], bold: true }), cell("femenino indefinido (una reunión cualquiera)", { width: artEjColW[2] })]),
    row([cell("Vado al bar dopo il lavoro.", { width: artEjColW[0], italic: true }), cell("il", { width: artEjColW[1], bold: true }), cell("masculino, consonante — el trabajo", { width: artEjColW[2] })])
  ]
}));
children.push(p(""));
children.push(h3("¿Qué artículo le toca? — Ejercicio de observación"));
children.push(p("Basate en lo que observaste arriba (respuestas a la derecha):"));
children.push(p(""));

const artExercColW = [2800, 3200, 3360];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: artExercColW,
  rows: [
    headerRow(["Sustantivo", "Artículo correcto", "Por qué"], artExercColW),
    row([cell("___ treno (el tren — masc., consonante)", { width: artExercColW[0] }), cell("il treno ✓", { width: artExercColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("masc. + consonante → il", { width: artExercColW[2], italic: true })]),
    row([cell("___ amica (la amiga — fem., vocal)", { width: artExercColW[0] }), cell("l'amica ✓", { width: artExercColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("fem. + vocal → l'", { width: artExercColW[2], italic: true })]),
    row([cell("___ sera (la tarde — fem., consonante)", { width: artExercColW[0] }), cell("la sera ✓", { width: artExercColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("fem. + consonante → la", { width: artExercColW[2], italic: true })]),
    row([cell("___ amico (el amigo — masc., vocal)", { width: artExercColW[0] }), cell("l'amico ✓", { width: artExercColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("masc. + vocal → l'", { width: artExercColW[2], italic: true })]),
    row([cell("___ caffè (el café — masc., consonante)", { width: artExercColW[0] }), cell("il caffè ✓", { width: artExercColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("masc. + consonante → il", { width: artExercColW[2], italic: true })])
  ]
}));
children.push(p(""));
children.push(note("En la próxima etapa vas a ver las reglas completas, incluyendo «lo», «uno» y los plurales. Por ahora, ¡ya entrenaste el ojo!"));
children.push(p(""));

// ── Lectura cultural ──────────────────────────────────────────────────────
children.push(h2("🔔  Il campanile: l'orologio del villaggio"));
children.push(pMixed([{ text: "LECTURA CULTURAL (en italiano + traducción)", bold: true }]));
children.push(p("Prima degli orologi da polso, gli italiani usavano i rintocchi del campanile per sapere l'ora. Ogni paese aveva il suo campanile, e le campane suonavano per segnare le ore del giorno."));
children.push(p("Traducción: Antes de los relojes de pulsera, los italianos usaban los repiques del campanario para saber la hora. Cada pueblo tenía su campanario, y las campanas sonaban para marcar las horas del día."));
children.push(p("Curiosità: La parola campanile viene da campana. Il campanile più famoso del mondo è probabilmente quello di Pisa — la Torre pendente!"));
children.push(p(""));

// ══════════════════════════════════════════════════════════════════════════
// ETAPA 3 — GRAMÁTICA
// ══════════════════════════════════════════════════════════════════════════
children.push(pageBreak());
children.push(h1("ETAPA 3  ·  GRAMÁTICA"));
children.push(pMixed([
  { text: "Nomi · Verbos · Fonética  ", bold: true, italic: true },
  { text: "— Resumen de reglas + ejercicios con respuestas" }
]));
children.push(p(""));

// ── A. La hora ────────────────────────────────────────────────────────────
children.push(h2("A  ·  L'ora — El género de los sustantivos"));
children.push(p("Ejemplos con audio (en la versión digital). Resumen de las formas más importantes:"));
children.push(p(""));
const horaEjColW = [1400, 4360, 3600];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: horaEjColW,
  rows: [
    headerRow(["Hora", "En italiano", "Traducción"], horaEjColW),
    row([cell("1:15",  { width: horaEjColW[0], bold: true }), cell("È l'una e un quarto", { width: horaEjColW[1], italic: true }), cell("Es la una y cuarto", { width: horaEjColW[2] })]),
    row([cell("2:00",  { width: horaEjColW[0], bold: true }), cell("Sono le due", { width: horaEjColW[1], italic: true }), cell("Son las dos", { width: horaEjColW[2] })]),
    row([cell("3:20",  { width: horaEjColW[0], bold: true }), cell("Sono le tre e venti", { width: horaEjColW[1], italic: true }), cell("Son las tres y veinte", { width: horaEjColW[2] })]),
    row([cell("4:45",  { width: horaEjColW[0], bold: true }), cell("Sono le cinque meno un quarto", { width: horaEjColW[1], italic: true }), cell("Son las cinco menos cuarto", { width: horaEjColW[2] })]),
    row([cell("7:15",  { width: horaEjColW[0], bold: true }), cell("Sono le sette e un quarto", { width: horaEjColW[1], italic: true }), cell("Son las siete y cuarto", { width: horaEjColW[2] })]),
    row([cell("10:50", { width: horaEjColW[0], bold: true }), cell("Sono le undici meno dieci", { width: horaEjColW[1], italic: true }), cell("Son las once menos diez", { width: horaEjColW[2] })]),
    row([cell("12:00", { width: horaEjColW[0], bold: true }), cell("È mezzogiorno", { width: horaEjColW[1], italic: true }), cell("Es mediodía", { width: horaEjColW[2] })]),
    row([cell("0:00",  { width: horaEjColW[0], bold: true }), cell("È mezzanotte", { width: horaEjColW[1], italic: true }), cell("Es medianoche", { width: horaEjColW[2] })])
  ]
}));
children.push(p(""));
children.push(note("Expresiones clave: in punto / spaccate = en punto  ·  e mezza = y media  ·  e un quarto = y cuarto  ·  meno un quarto = menos cuarto  ·  circa / verso = aproximadamente"));
children.push(p(""));

// ── B. Orario ─────────────────────────────────────────────────────────────
children.push(h2("B  ·  Orario formale e informale"));
children.push(p("Orario formale (24h): trenes, aeropuertos, oficinas, horarios escritos. Solo minutos exactos."));
children.push(p("Orario informale (12h): conversación cotidiana. Se añade di mattina / di pomeriggio / di sera si hay ambigüedad."));
children.push(p(""));
const bColW = [1200, 3080, 5080];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: bColW,
  rows: [
    headerRow(["Hora", "Formal (24h)", "Informal (12h)"], bColW),
    row([cell("6:00",  { width: bColW[0], bold: true }), cell("le sei", { width: bColW[1], italic: true }), cell("le sei di mattina", { width: bColW[2], italic: true })]),
    row([cell("7:15",  { width: bColW[0], bold: true }), cell("le sette e quindici", { width: bColW[1], italic: true }), cell("le sette e un quarto", { width: bColW[2], italic: true })]),
    row([cell("14:30", { width: bColW[0], bold: true }), cell("le quattordici e trenta", { width: bColW[1], italic: true }), cell("le due e mezza (del pomeriggio)", { width: bColW[2], italic: true })]),
    row([cell("16:45", { width: bColW[0], bold: true }), cell("le sedici e quarantacinque", { width: bColW[1], italic: true }), cell("le cinque meno un quarto", { width: bColW[2], italic: true })]),
    row([cell("20:45", { width: bColW[0], bold: true }), cell("le venti e quarantacinque", { width: bColW[1], italic: true }), cell("le nove meno un quarto (di sera)", { width: bColW[2], italic: true })]),
    row([cell("22:00", { width: bColW[0], bold: true }), cell("le ventidue", { width: bColW[1], italic: true }), cell("le dieci di sera", { width: bColW[2], italic: true })])
  ]
}));
children.push(p(""));

// ── C. Saludos ─────────────────────────────────────────────────────────────
children.push(h2("C  ·  I saluti della giornata — Saludos del día"));
const cColW = [2400, 2000, 4960];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: cColW,
  rows: [
    headerRow(["Saludo", "Horario", "Uso"], cColW),
    row([cell("Buongiorno!",     { width: cColW[0], bold: true }), cell("6:00 – 12:00", { width: cColW[1] }), cell("Buenos días — al llegar y al despedirse por la mañana", { width: cColW[2] })]),
    row([cell("Buon pomeriggio!",{ width: cColW[0], bold: true }), cell("12:00 – 17:00",{ width: cColW[1] }), cell("Buenas tardes — menos común, más formal", { width: cColW[2] })]),
    row([cell("Buonasera!",      { width: cColW[0], bold: true }), cell("17:00 – 22:00",{ width: cColW[1] }), cell("Al llegar Y al marcharse por la tarde-noche", { width: cColW[2] })]),
    row([cell("Buonanotte!",     { width: cColW[0], bold: true }), cell("22:00 – 6:00", { width: cColW[1] }), cell("SOLO al despedirse antes de dormir", { width: cColW[2] })]),
    row([cell("Salve!",          { width: cColW[0], bold: true }), cell("todo el día",  { width: cColW[1] }), cell("Hola formal, a cualquier hora", { width: cColW[2] })])
  ]
}));
children.push(note("⚠️  Atención: buonasera se usa también para despedirse (igual que en Argentina decís \"buenas noches\" al salir de un restorán a las 20:00). Buonanotte es exclusivo para irse a dormir."));
children.push(p(""));

// ── D. Preposiciones ──────────────────────────────────────────────────────
children.push(h2("D  ·  Le preposizioni di tempo"));
const dColW = [1600, 3200, 4560];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: dColW,
  rows: [
    headerRow(["Preposición", "Uso", "Ejemplo"], dColW),
    row([cell("alle",       { width: dColW[0], bold: true, italic: true }), cell("a las (hora exacta)", { width: dColW[1] }), cell("Il treno parte alle otto.", { width: dColW[2], italic: true })]),
    row([cell("verso",      { width: dColW[0], bold: true, italic: true }), cell("hacia / alrededor de (aprox.)", { width: dColW[1] }), cell("Arrivo verso le dieci.", { width: dColW[2], italic: true })]),
    row([cell("fino alle",  { width: dColW[0], bold: true, italic: true }), cell("hasta las", { width: dColW[1] }), cell("Il negozio è aperto fino alle venti.", { width: dColW[2], italic: true })]),
    row([cell("dalle...alle",{ width: dColW[0], bold: true, italic: true }), cell("de... a... (horario)", { width: dColW[1] }), cell("Il museo è aperto dalle nove alle diciotto.", { width: dColW[2], italic: true })]),
    row([cell("tra",        { width: dColW[0], bold: true, italic: true }), cell("dentro de (tiempo futuro)", { width: dColW[1] }), cell("Ci vediamo tra un'ora.", { width: dColW[2], italic: true })]),
    row([cell("prima di",   { width: dColW[0], bold: true, italic: true }), cell("antes de", { width: dColW[1] }), cell("Mangio prima delle otto.", { width: dColW[2], italic: true })]),
    row([cell("dopo",       { width: dColW[0], bold: true, italic: true }), cell("después de", { width: dColW[1] }), cell("Vado al bar dopo il lavoro.", { width: dColW[2], italic: true })])
  ]
}));
children.push(p(""));

// ── E. Fonética ───────────────────────────────────────────────────────────
children.push(h2("E  ·  Fonética — i suoni L e R"));
children.push(p("En italiano la L se pronuncia con la lengua tocando el paladar, igual que en español. La R italiana es vibrante (como la \"r\" española en \"carro\"). ¡Escuchá y repetí!"));
children.push(p("(Ver tabla de pares en la Etapa 2 · sección 10)"));
children.push(p(""));
children.push(h3("¿L o R? — Ejercicio con respuestas"));
const fonAnswerColW = [2400, 3200, 3760];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: fonAnswerColW,
  rows: [
    headerRow(["Pista", "Respuesta correcta", "Justificación"], fonAnswerColW),
    row([cell("¿Qué letra? → ___etto (cama)", { width: fonAnswerColW[0] }), cell("L → letto ✓", { width: fonAnswerColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("letto = cama en italiano", { width: fonAnswerColW[2], italic: true })]),
    row([cell("¿Qué letra? → o___ologio (reloj)", { width: fonAnswerColW[0] }), cell("R → orologio ✓", { width: fonAnswerColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("orologio = reloj; lleva r vibrante", { width: fonAnswerColW[2], italic: true })]),
    row([cell("¿Qué letra? → ___una (luna)", { width: fonAnswerColW[0] }), cell("L → luna ✓", { width: fonAnswerColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("luna = luna (igual al español)", { width: fonAnswerColW[2], italic: true })]),
    row([cell("¿Qué letra? → cam___anile (campanario)", { width: fonAnswerColW[0] }), cell("R → campanile ✓", { width: fonAnswerColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("campanile lleva r vibrante (campa-nile)", { width: fonAnswerColW[2], italic: true })]),
    row([cell("¿Qué letra? → ___ana (lana — tejido)", { width: fonAnswerColW[0] }), cell("L → lana ✓", { width: fonAnswerColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("lana = lana; rana = rana (son pares mínimos)", { width: fonAnswerColW[2], italic: true })])
  ]
}));
children.push(p(""));

// ── F. Artículos ─────────────────────────────────────────────────────────
children.push(h2("F  ·  Articoli al singolare — Los artículos en singular"));
children.push(p("¿Qué es un artículo? Es la pequeña palabra que va antes del sustantivo. En italiano indica si la cosa es masculina o femenina, y si es conocida (determinativo) o nueva (indeterminativo)."));
children.push(p(""));
children.push(pMixed([{ text: "Articoli Determinativi — \"El / La\" (cosa conocida o específica)", bold: true }]));
const detColW = [1200, 4160, 4000];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: detColW,
  rows: [
    headerRow(["Artículo", "Cuando usarlo", "Ejemplos"], detColW),
    row([cell("il",  { width: detColW[0], bold: true, italic: true }), cell("Masc. sing. — consonante (excepto s+cons., z, gn, ps, x, y)", { width: detColW[1] }), cell("il treno, il bar, il campanile", { width: detColW[2], italic: true })]),
    row([cell("lo",  { width: detColW[0], bold: true, italic: true }), cell("Masc. sing. — s+cons., z, gn, ps, x, y", { width: detColW[1] }), cell("lo zaino, lo studente, lo gnocco", { width: detColW[2], italic: true })]),
    row([cell("l'",  { width: detColW[0], bold: true, italic: true }), cell("Masc. o Fem. sing. — empieza con vocal", { width: detColW[1] }), cell("l'ora, l'amico, l'amica", { width: detColW[2], italic: true })]),
    row([cell("la",  { width: detColW[0], bold: true, italic: true }), cell("Fem. sing. — empieza con consonante", { width: detColW[1] }), cell("la piazza, la sera, la donna", { width: detColW[2], italic: true })])
  ]
}));
children.push(note("Truco para recordar l': Cuando una palabra empieza con vocal, el italiano \"come\" la vocal del artículo para que suene fluido. la ora → l'ora. ¡Igual que \"el agua\" en español!"));
children.push(p(""));
children.push(pMixed([{ text: "Articoli Indeterminativi — \"Un / Una\" (cosa nueva, no específica)", bold: true }]));
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: detColW,
  rows: [
    headerRow(["Artículo", "Cuando usarlo", "Ejemplos"], detColW),
    row([cell("un",  { width: detColW[0], bold: true, italic: true }), cell("Masc. sing. — todos excepto s+cons., z, gn", { width: detColW[1] }), cell("un treno, un bar, un caffè", { width: detColW[2], italic: true })]),
    row([cell("uno", { width: detColW[0], bold: true, italic: true }), cell("Masc. sing. — s+cons., z, gn, ps, x, y", { width: detColW[1] }), cell("uno zaino, uno studente", { width: detColW[2], italic: true })]),
    row([cell("una", { width: detColW[0], bold: true, italic: true }), cell("Fem. sing. — empieza con consonante", { width: detColW[1] }), cell("una riunione, una sera, una piazza", { width: detColW[2], italic: true })]),
    row([cell("un'", { width: detColW[0], bold: true, italic: true }), cell("Fem. sing. — empieza con vocal", { width: detColW[1] }), cell("un'ora, un'amica, un'idea", { width: detColW[2], italic: true })])
  ]
}));
children.push(p(""));

// ── G. Conjunciones ───────────────────────────────────────────────────────
children.push(h2("G  ·  Congiunzioni coordinate — Las conjunciones"));
children.push(p("Las conjunciones conectan palabras u oraciones. En italiano son muy similares al español y ya las usaste."));
children.push(p(""));
const conjColW = [1400, 2400, 5560];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: conjColW,
  rows: [
    headerRow(["Conj.", "Significado", "Ejemplo"], conjColW),
    row([cell("e",      { width: conjColW[0], bold: true, italic: true }), cell("y — une dos elementos", { width: conjColW[1] }), cell("Sono le tre e un quarto.", { width: conjColW[2], italic: true })]),
    row([cell("o",      { width: conjColW[0], bold: true, italic: true }), cell("o — alternativas", { width: conjColW[1] }), cell("Arrivi alle otto o alle nove?", { width: conjColW[2], italic: true })]),
    row([cell("ma",     { width: conjColW[0], bold: true, italic: true }), cell("pero — contrasta ideas", { width: conjColW[1] }), cell("Voglio uscire, ma è tardi.", { width: conjColW[2], italic: true })]),
    row([cell("però",   { width: conjColW[0], bold: true, italic: true }), cell("sin embargo", { width: conjColW[1] }), cell("Il bar è aperto, però la cucina è chiusa.", { width: conjColW[2], italic: true })]),
    row([cell("quindi", { width: conjColW[0], bold: true, italic: true }), cell("entonces / así que", { width: conjColW[1] }), cell("È tardi, quindi devo sbrigarmi.", { width: conjColW[2], italic: true })]),
    row([cell("anche",  { width: conjColW[0], bold: true, italic: true }), cell("también", { width: conjColW[1] }), cell("Vengo anche io alle sette.", { width: conjColW[2], italic: true })])
  ]
}));
children.push(note("e → ed antes de vocal: «Sono le due ed è tardi». No es obligatorio pero se usa bastante."));
children.push(p(""));

// ── H. Ejercicios con respuestas ──────────────────────────────────────────
children.push(h2("H  ·  Esercizi — Ejercicios (con respuestas correctas)"));
children.push(p(""));

// Ejercicio 1
children.push(h3("Ejercicio 1 · Escribí la hora en palabras (forma informal)"));
const ej1ColW = [2000, 3200, 4160];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: ej1ColW,
  rows: [
    headerRow(["Hora", "Respuesta correcta", "Justificación"], ej1ColW),
    row([cell("3:00",  { width: ej1ColW[0], bold: true }), cell("Sono le tre", { width: ej1ColW[1], fill: LGREEN, italic: true, color: GREEN }), cell("Hora redonda: solo Sono le + nombre", { width: ej1ColW[2], italic: true })]),
    row([cell("7:15",  { width: ej1ColW[0], bold: true }), cell("Sono le sette e un quarto", { width: ej1ColW[1], fill: LGREEN, italic: true, color: GREEN }), cell("quarto = cuarto de hora (15 min)", { width: ej1ColW[2], italic: true })]),
    row([cell("12:00", { width: ej1ColW[0], bold: true }), cell("È mezzogiorno", { width: ej1ColW[1], fill: LGREEN, italic: true, color: GREEN }), cell("mediodía: usa È (singular), no Sono", { width: ej1ColW[2], italic: true })]),
    row([cell("2:30",  { width: ej1ColW[0], bold: true }), cell("Sono le due e mezza", { width: ej1ColW[1], fill: LGREEN, italic: true, color: GREEN }), cell("mezza (no mezzo): concuerda con «ora» fem.", { width: ej1ColW[2], italic: true })]),
    row([cell("9:45",  { width: ej1ColW[0], bold: true }), cell("Sono le dieci meno un quarto", { width: ej1ColW[1], fill: LGREEN, italic: true, color: GREEN }), cell("9:45 = 10:00 menos 15 min = dieci meno quarto", { width: ej1ColW[2], italic: true })])
  ]
}));
children.push(p(""));

// Ejercicio 2
children.push(h3("Ejercicio 2 · ¿Cómo se dice?"));
const ej2Items = [
  {
    n: 1, q: '¿Cómo se dice "son las 2 y media"?',
    opts: [
      { text: "sono le due mezza", correct: false },
      { text: "sono le due e mezza", correct: true },
      { text: "è le due e mezza", correct: false },
      { text: "è due e mezza", correct: false }
    ],
    j: "Se necesita «e» entre la hora y los minutos. Y son las 2 (plural) → Sono, no È."
  },
  {
    n: 2, q: '¿Cómo se dice "es la una en punto"?',
    opts: [
      { text: "è l'una in punto", correct: true },
      { text: "sono le una in punto", correct: false },
      { text: "è la una in punto", correct: false },
      { text: "sono l'una in punto", correct: false }
    ],
    j: "La 1:00 es singular → È (no Sono). Además: l'una (vocal → apóstrofe). «in punto» = en punto."
  },
  {
    n: 3, q: '¿Cuál expresa "aproximadamente las 3"?',
    opts: [
      { text: "alle tre in punto", correct: false },
      { text: "dalle tre", correct: false },
      { text: "verso le tre", correct: true },
      { text: "fino alle tre", correct: false }
    ],
    j: "verso = hacia/alrededor de. alle tre in punto = a las 3 en punto (exacto). dalle tre = desde las 3. fino alle tre = hasta las 3."
  }
];
smTable(ej2Items).forEach(el => children.push(el));
children.push(p(""));

// Ejercicio 3
children.push(h3("Ejercicio 3 · Completá con la preposición correcta"));
const ej3ColW = [3600, 2400, 3360];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: ej3ColW,
  rows: [
    headerRow(["Oración", "Respuesta ✓", "Por qué"], ej3ColW),
    row([cell("Il museo è aperto ___ 9 ___ 17.", { width: ej3ColW[0] }), cell("dalle 9 alle 17 ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("dalle...alle = de... a... (horario)", { width: ej3ColW[2], italic: true })]),
    row([cell("Il treno parte ___ le otto e mezza.", { width: ej3ColW[0] }), cell("alle ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("alle = a las (hora exacta de salida)", { width: ej3ColW[2], italic: true })]),
    row([cell("Ci vediamo ___ un'ora.", { width: ej3ColW[0] }), cell("tra ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("tra = dentro de (tiempo futuro)", { width: ej3ColW[2], italic: true })]),
    row([cell("Arrivo ___ le undici. (aprox.)", { width: ej3ColW[0] }), cell("verso ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("verso = hacia/aproximadamente", { width: ej3ColW[2], italic: true })])
  ]
}));
children.push(p(""));

// Ejercicio 4
children.push(h3("Ejercicio 4 · Completá el diálogo de la barzelletta"));
const ej4ColW = [400, 3200, 2400, 3360];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: ej4ColW,
  rows: [
    headerRow(["N°", "Espacio en el diálogo", "Respuesta ✓", "Justificación"], ej4ColW),
    row([cell("1", { width: ej4ColW[0], bold: true }), cell("Mi (1)___, mi sa dire l'ora... (disculpe)", { width: ej4ColW[1] }), cell("scusi ✓", { width: ej4ColW[2], fill: LGREEN, bold: true, color: GREEN }), cell("Mi scusi = disculpe (forma formal de escusa)", { width: ej4ColW[3], italic: true })]),
    row([cell("2", { width: ej4ColW[0], bold: true }), cell("mi sa (2)___ l'ora (decir)", { width: ej4ColW[1] }), cell("dire ✓", { width: ej4ColW[2], fill: LGREEN, bold: true, color: GREEN }), cell("dire = decir. fare = hacer, leggere = leer", { width: ej4ColW[3], italic: true })]),
    row([cell("3", { width: ej4ColW[0], bold: true }), cell("Le (3)___ (5:35)", { width: ej4ColW[1] }), cell("cinque e trentacinque ✓", { width: ej4ColW[2], fill: LGREEN, bold: true, color: GREEN }), cell("5:35 = le cinque e trentacinque (5 y 35 minutos)", { width: ej4ColW[3], italic: true })]),
    row([cell("4", { width: ej4ColW[0], bold: true }), cell("Ma è (4)___ ? (¿está seguro?)", { width: ej4ColW[1] }), cell("sicuro ✓", { width: ej4ColW[2], fill: LGREEN, bold: true, color: GREEN }), cell("sicuro = seguro. pronto = listo, certo = cierto", { width: ej4ColW[3], italic: true })]),
    row([cell("5", { width: ej4ColW[0], bold: true }), cell("Sono le 7:15 (5)___ ! (en punto exacto)", { width: ej4ColW[1] }), cell("spaccate ✓", { width: ej4ColW[2], fill: LGREEN, bold: true, color: GREEN }), cell("spaccate = en punto exacto (literalmente: partidas)", { width: ej4ColW[3], italic: true })])
  ]
}));
children.push(p(""));

// Ejercicio 5
children.push(h3("Ejercicio 5 · ¿Formal o Informal?"));
const ej5ColW = [4000, 2400, 2960];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: ej5ColW,
  rows: [
    headerRow(["Expresión", "Clasificación ✓", "Por qué"], ej5ColW),
    row([cell("le quattordici e trenta", { width: ej5ColW[0], italic: true }), cell("Formal (24h) ✓", { width: ej5ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("14:30 — usa hora 24h", { width: ej5ColW[2], italic: true })]),
    row([cell("le due e mezza", { width: ej5ColW[0], italic: true }), cell("Informal (12h) ✓", { width: ej5ColW[1], fill: LTEAL, bold: true, color: TEAL }), cell("2:30 pm — usa mezza (conversacional)", { width: ej5ColW[2], italic: true })]),
    row([cell("le venti e quarantacinque", { width: ej5ColW[0], italic: true }), cell("Formal (24h) ✓", { width: ej5ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("20:45 — usa hora 24h", { width: ej5ColW[2], italic: true })]),
    row([cell("le nove meno un quarto", { width: ej5ColW[0], italic: true }), cell("Informal (12h) ✓", { width: ej5ColW[1], fill: LTEAL, bold: true, color: TEAL }), cell("8:45 — usa meno y referencia de 12h", { width: ej5ColW[2], italic: true })]),
    row([cell("le diciassette e quindici", { width: ej5ColW[0], italic: true }), cell("Formal (24h) ✓", { width: ej5ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("17:15 — usa hora 24h", { width: ej5ColW[2], italic: true })]),
    row([cell("le cinque e un quarto di sera", { width: ej5ColW[0], italic: true }), cell("Informal (12h) ✓", { width: ej5ColW[1], fill: LTEAL, bold: true, color: TEAL }), cell("5:15 pm — usa quarto + di sera (clarificación)", { width: ej5ColW[2], italic: true })])
  ]
}));
children.push(p(""));

// Ejercicio 6
children.push(h3("Ejercicio 6 · ¿Qué saludo corresponde?"));
const ej6Items = [
  {
    n: 1, q: "Son las 9:00 de la mañana y llegás a la oficina. Decís:",
    opts: [
      { text: "Buongiorno!", correct: true },
      { text: "Buonanotte!", correct: false },
      { text: "Buonasera!", correct: false }
    ],
    j: "9:00 AM cae en el rango de Buongiorno (6:00-12:00). Buonasera es para la tarde/noche y Buonanotte solo para despedirse antes de dormir."
  },
  {
    n: 2, q: "Son las 19:30. Entrás a un restorán.",
    opts: [
      { text: "Buongiorno!", correct: false },
      { text: "Buon pomeriggio!", correct: false },
      { text: "Buonasera!", correct: true }
    ],
    j: "19:30 cae en el rango de Buonasera (17:00-22:00). También se usa al marcharse a esa hora."
  },
  {
    n: 3, q: "Son las 23:00. Te vas a dormir. Le decís a tu compañero:",
    opts: [
      { text: "Buonasera!", correct: false },
      { text: "Buonanotte!", correct: true },
      { text: "Buongiorno!", correct: false }
    ],
    j: "Buonanotte es EXCLUSIVO para despedirse antes de dormir. No se usa al llegar a ningún lugar."
  }
];
smTable(ej6Items).forEach(el => children.push(el));
children.push(p(""));

// Ejercicio 7
children.push(h3("Ejercicio 7 · Ordená las palabras"));
const ej7ColW = [3600, 5760];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: ej7ColW,
  rows: [
    headerRow(["Consigna", "Respuesta correcta ✓"], ej7ColW),
    row([cell("Formá la pregunta: '¿Me puede decir qué hora es?'", { width: ej7ColW[0] }), cell("Mi sa dire che ore sono? / Senta, mi sa dire l'ora per favore?", { width: ej7ColW[1], fill: LGREEN, italic: true, color: GREEN })]),
    row([cell("Formá la frase: 'El museo está abierto de 9 a 18.'", { width: ej7ColW[0] }), cell("Il museo è aperto dalle nove alle diciotto.", { width: ej7ColW[1], fill: LGREEN, italic: true, color: GREEN })])
  ]
}));
children.push(p(""));

// Ejercicio 8
children.push(h3("Ejercicio 8 · Formal → Informal"));
const ej8ColW = [3200, 3200, 2960];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: ej8ColW,
  rows: [
    headerRow(["Forma formal", "Forma informal ✓", "Justificación"], ej8ColW),
    row([cell("le tredici e trenta (13:30)", { width: ej8ColW[0], italic: true }), cell("l'una e mezza del pomeriggio ✓", { width: ej8ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("13:30 = 1:30 pm → l'una e mezza (la 1, singular)", { width: ej8ColW[2], italic: true })]),
    row([cell("le diciotto e quarantacinque (18:45)", { width: ej8ColW[0], italic: true }), cell("le sette meno un quarto di sera ✓", { width: ej8ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("18:45 = 7:00 menos 15 min = sette meno un quarto", { width: ej8ColW[2], italic: true })]),
    row([cell("le ventiquattro (24:00)", { width: ej8ColW[0], italic: true }), cell("mezzanotte ✓", { width: ej8ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("24:00 = medianoche → mezzanotte (no \"le zero\")", { width: ej8ColW[2], italic: true })])
  ]
}));
children.push(p(""));

// Ejercicio 9
children.push(h3("Ejercicio 9 · Mini diálogo — ¿a qué hora?"));
const ej9Items = [
  {
    n: 1, q: "— A che ora apre la farmacia? — Apre ___ le otto e mezza.",
    opts: [
      { text: "alle", correct: true },
      { text: "dalle", correct: false },
      { text: "fino alle", correct: false }
    ],
    j: "alle = a las (hora puntual de apertura). dalle indicaría desde qué hora. fino alle = hasta las."
  },
  {
    n: 2, q: "— Quando chiude la banca? — Chiude ___ le sedici.",
    opts: [
      { text: "alle", correct: true },
      { text: "verso", correct: false },
      { text: "fino alle", correct: false }
    ],
    j: "alle = a las (hora exacta de cierre). verso sería aproximado. fino alle = hasta las (cambiaría el significado)."
  },
  {
    n: 3, q: "— A che ora arrivi? — Arrivo ___ le tre, non sono sicuro.",
    opts: [
      { text: "alle", correct: false },
      { text: "verso", correct: true },
      { text: "fino alle", correct: false }
    ],
    j: "verso = hacia/alrededor de (aproximado). Lo confirma «non sono sicuro» = no estoy seguro."
  }
];
smTable(ej9Items).forEach(el => children.push(el));
children.push(p(""));

// Ejercicio 10
children.push(h3("Ejercicio 10 · Verdadero o Falso — reglas gramaticales"));
children.push(vfTable([
  {
    q: 'Para la 1:00 se dice "Sono l\'una".',
    a: "✗  FALSO",
    correct: false,
    j: 'FALSO — se dice "È l\'una" (singular). Solo la 1:00, mediodía y medianoche usan È en vez de Sono.'
  },
  {
    q: '"Verso le cinque" significa "alrededor de las 5".',
    a: "✓  VERDADERO",
    correct: true,
    j: 'Correcto. verso = hacia / alrededor de (expresión de tiempo aproximado, muy común en Italia).'
  },
  {
    q: '"Buonanotte" se puede usar al llegar a un lugar por la noche.',
    a: "✗  FALSO",
    correct: false,
    j: 'FALSO — Buonanotte es EXCLUSIVAMENTE para despedirse antes de dormir. Al llegar de noche se usa Buonasera.'
  },
  {
    q: 'El horario de 24h se usa en estaciones y aeropuertos.',
    a: "✓  VERDADERO",
    correct: true,
    j: 'Correcto. El orario formale (24h) se usa en transportes, aeropuertos, oficinas y horarios escritos.'
  },
  {
    q: '"Spaccate" y "in punto" significan lo mismo: en punto exacto.',
    a: "✓  VERDADERO",
    correct: true,
    j: 'Ambas expresiones significan "en punto exacto". spaccate es más coloquial/enfático; in punto es más neutro.'
  }
]));
children.push(p(""));

// Ejercicio 11
children.push(h3("Ejercicio 11 · Elegí el artículo determinativo (il / lo / l' / la)"));
const ej11ColW = [3200, 2000, 4160];
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: ej11ColW,
  rows: [
    headerRow(["Sustantivo", "Artículo ✓", "Regla aplicada"], ej11ColW),
    row([cell("___ treno (masc., consonante)", { width: ej11ColW[0] }), cell("il treno ✓", { width: ej11ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("masc. + consonante normal → il", { width: ej11ColW[2], italic: true })]),
    row([cell("___ ora (fem., vocal)", { width: ej11ColW[0] }), cell("l'ora ✓", { width: ej11ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("vocal → l' (il/la se apocopan)", { width: ej11ColW[2], italic: true })]),
    row([cell("___ studente (masc., empieza con st-)", { width: ej11ColW[0] }), cell("lo studente ✓", { width: ej11ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("s + consonante → lo (no il)", { width: ej11ColW[2], italic: true })]),
    row([cell("___ piazza (fem., consonante)", { width: ej11ColW[0] }), cell("la piazza ✓", { width: ej11ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("fem. + consonante → la", { width: ej11ColW[2], italic: true })]),
    row([cell("___ amico (masc., vocal)", { width: ej11ColW[0] }), cell("l'amico ✓", { width: ej11ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("vocal → l' (masc. o fem.)", { width: ej11ColW[2], italic: true })]),
    row([cell("___ sera (fem., consonante)", { width: ej11ColW[0] }), cell("la sera ✓", { width: ej11ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("fem. + consonante → la", { width: ej11ColW[2], italic: true })])
  ]
}));
children.push(p(""));

// Ejercicio 12
children.push(h3("Ejercicio 12 · Elegí el artículo indeterminativo (un / uno / una / un')"));
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: ej11ColW,
  rows: [
    headerRow(["Sustantivo", "Artículo ✓", "Regla aplicada"], ej11ColW),
    row([cell("___ caffè (masc., consonante)", { width: ej11ColW[0] }), cell("un caffè ✓", { width: ej11ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("masc. + consonante normal → un", { width: ej11ColW[2], italic: true })]),
    row([cell("___ riunione (fem., consonante)", { width: ej11ColW[0] }), cell("una riunione ✓", { width: ej11ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("fem. + consonante → una", { width: ej11ColW[2], italic: true })]),
    row([cell("___ zaino (masc., z)", { width: ej11ColW[0] }), cell("uno zaino ✓", { width: ej11ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("masc. + z → uno (igual que lo determinativo)", { width: ej11ColW[2], italic: true })]),
    row([cell("___ ora (fem., vocal)", { width: ej11ColW[0] }), cell("un'ora ✓", { width: ej11ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("fem. + vocal → un' (con apóstrofe)", { width: ej11ColW[2], italic: true })]),
    row([cell("___ amica (fem., vocal)", { width: ej11ColW[0] }), cell("un'amica ✓", { width: ej11ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("fem. + vocal → un'", { width: ej11ColW[2], italic: true })]),
    row([cell("___ bar (masc., consonante)", { width: ej11ColW[0] }), cell("un bar ✓", { width: ej11ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("masc. + consonante → un", { width: ej11ColW[2], italic: true })])
  ]
}));
children.push(p(""));

// Ejercicio G (Conjunciones)
children.push(h3("Ejercicio G · ¿Cuál conjunción va?"));
const ejGItems = [
  {
    n: 1, q: "Sono le tre ___ un quarto. (y cuarto)",
    opts: [
      { text: "e", correct: true },
      { text: "ma", correct: false },
      { text: "o", correct: false }
    ],
    j: "e = y. Sono le tre e un quarto = son las tres y cuarto."
  },
  {
    n: 2, q: "Voglio dormire, ___ devo lavorare. (pero)",
    opts: [
      { text: "e", correct: false },
      { text: "quindi", correct: false },
      { text: "ma", correct: true }
    ],
    j: "ma = pero (contrasta dormir vs. trabajar). quindi sería 'entonces'."
  },
  {
    n: 3, q: "È tardi, ___ corro! (entonces)",
    opts: [
      { text: "ma", correct: false },
      { text: "quindi", correct: true },
      { text: "anche", correct: false }
    ],
    j: "quindi = entonces / así que (consecuencia: es tarde → corro)."
  },
  {
    n: 4, q: "Arrivi alle otto ___ alle nove? (o)",
    opts: [
      { text: "o", correct: true },
      { text: "e", correct: false },
      { text: "però", correct: false }
    ],
    j: "o = o (alternativas). La pregunta presenta dos opciones de horario."
  }
];
smTable(ejGItems).forEach(el => children.push(el));
children.push(p(""));

// ── Lectura cultural final ─────────────────────────────────────────────────
children.push(divider());
children.push(h2("Il campanile — el reloj de todos (lectura de cierre)"));
children.push(p("El chiste de la barzelletta no es tan absurdo si conocés la historia italiana. Durante siglos, el campanile (campanario) fue el reloj público de cada pueblo y ciudad. Los rintocchi (repiques de campana) marcaban las horas y los momentos importantes del día — el inicio del trabajo, la hora del almuerzo, el angelus al atardecer."));
children.push(p("Hoy en día, muchos pueblos italianos siguen teniendo el campanile como símbolo central. Y los italianos son famosos por tener horarios muy específicos: la pausa pranzo (pausa del almuerzo) entre las 13:00 y las 15:00 hace que muchos negocios cierren. Nada de ir a comprar a las 13:30 — ¡il negozio è chiuso!"));
children.push(pMixed([
  { text: "Curiosidad: ", bold: true, italic: true },
  { text: "Italia tiene una larga tradición de ", italic: false },
  { text: "barzellette", italic: true },
  { text: " como género oral. Se cuentan en familia, en el bar, en el trabajo. El humor juega con situaciones cotidianas — como pedir la hora — y lo lleva al absurdo. ", italic: false },
  { text: "È un classico!", italic: true }
]));

// ══════════════════════════════════════════════════════════════════════════
const doc = new Document({
  styles: {
    default: { document: { run: { font: FONTS, size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: FONTS, color: "FFFFFF" },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: FONTS, color: TEAL },
        paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("D:/proyectos/italianoperpiacere/entregablesFinales/A1/modulo_4/modulo4_formateado.docx", buf);
  console.log("OK: modulo4_formateado.docx generado");
}).catch(e => { console.error("ERROR:", e.message); process.exit(1); });
