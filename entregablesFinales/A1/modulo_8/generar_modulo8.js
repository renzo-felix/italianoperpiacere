const path = require("path");
const fs   = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageBreak
} = require("C:/Users/Renzo/AppData/Roaming/npm/node_modules/docx");

// ── Palette ────────────────────────────────────────────────────────────────
const TEAL   = "2E6B7B";
const LTEAL  = "D6EAF0";
const GREEN  = "1E7A3C";
const LGREEN = "D5F5E3";
const RED    = "B22222";
const LRED   = "FAD7D7";
const YELLOW = "FFF3CD";
const LGRAY  = "F2F2F2";
const BLACK  = "000000";
const FONTS  = "Arial";
const PAGE_W = 9360;

// ── Border helpers ─────────────────────────────────────────────────────────
const brd  = (c = "CCCCCC") => ({ style: BorderStyle.SINGLE, size: 4, color: c });
const bors = (c = "CCCCCC") => ({ top: brd(c), bottom: brd(c), left: brd(c), right: brd(c) });

// ── Paragraph helpers ──────────────────────────────────────────────────────
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [new TextRun({ text, font: FONTS, size: opts.sz || 22,
      italic: opts.italic, bold: opts.bold, color: opts.color || BLACK })]
  });
}

function blank() {
  return new Paragraph({ spacing: { before: 40, after: 40 }, children: [] });
}

function pgBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 80 },
    children: [new TextRun({ text, font: FONTS, size: 26, bold: true, color: TEAL })]
  });
}

// ── Banner helpers ─────────────────────────────────────────────────────────
function banner(line1, line2) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: [PAGE_W],
    rows: [new TableRow({ children: [new TableCell({
      shading: { fill: TEAL, type: ShadingType.CLEAR },
      borders: bors(TEAL),
      margins: { top: 160, bottom: 160, left: 240, right: 240 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: line1, font: FONTS, size: 40, bold: true, color: "FFFFFF" })
        ]}),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: line2, font: FONTS, size: 26, color: "DDDDDD" })
        ]})
      ]
    })})]})
  });
}

function stageBanner(stage, title) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: [PAGE_W],
    rows: [new TableRow({ children: [new TableCell({
      shading: { fill: TEAL, type: ShadingType.CLEAR },
      borders: bors(TEAL),
      margins: { top: 120, bottom: 120, left: 240, right: 240 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: stage, font: FONTS, size: 32, bold: true, color: "FFFFFF" })
        ]}),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: title, font: FONTS, size: 24, color: "DDDDDD", italic: true })
        ]})
      ]
    })})]})
  });
}

function infoBanner(lines, fill = LTEAL, textColor = TEAL) {
  const paraLines = Array.isArray(lines) ? lines : [lines];
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: [PAGE_W],
    rows: [new TableRow({ children: [new TableCell({
      shading: { fill, type: ShadingType.CLEAR },
      borders: bors(textColor),
      margins: { top: 100, bottom: 100, left: 200, right: 200 },
      children: paraLines.map(line => new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: line, font: FONTS, size: 20, color: textColor, italic: true })]
      }))
    })})]})
  });
}

// ── Cell / Row helpers ─────────────────────────────────────────────────────
function tc(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    borders: bors(opts.bc || "CCCCCC"),
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({ text, font: FONTS, size: opts.sz || 20,
        bold: opts.bold, italic: opts.italic, color: opts.color || BLACK })]
    })]
  });
}

function tcIta(text, opts = {}) { return tc(text, { ...opts, italic: true }); }

function hrow(labels, widths) {
  return new TableRow({ children: labels.map((l, i) =>
    tc(l, { fill: TEAL, bold: true, color: "FFFFFF", width: widths[i] })
  )});
}

// ── feedbackTable ──────────────────────────────────────────────────────────
// items: [{q, a, fb}]  — col widths: #, question, answer, feedback
function feedbackTable(items, opts = {}) {
  const cw = opts.cw || [400, 3800, 1800, 3360];
  const headers = opts.headers || ["N°", "Enunciado", "Respuesta", "Retroalimentación"];
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(headers, cw),
      ...items.map((it, i) => new TableRow({ children: [
        tc(String(i + 1), { width: cw[0], bold: true }),
        tc(it.q, { width: cw[1] }),
        tc(it.a, { width: cw[2], fill: LGREEN, bold: true, color: GREEN }),
        tc(it.fb, { width: cw[3], italic: true })
      ]}))
    ]
  });
}

// ── vocabTable ─────────────────────────────────────────────────────────────
// items: [{ita, esp}]
function vocabTable(items, opts = {}) {
  const cw = opts.cw || [3600, 5760];
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(["Italiano", "Español"], cw),
      ...items.map(it => new TableRow({ children: [
        tcIta(it.ita, { width: cw[0], bold: true }),
        tc(it.esp, { width: cw[1] })
      ]}))
    ]
  });
}

// ── conjTable ─────────────────────────────────────────────────────────────
// Generic conjugation / grammar table with custom headers and rows
function conjTable(headers, rows, widths) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: widths,
    rows: [
      hrow(headers, widths),
      ...rows.map(r => new TableRow({ children: r.map((cell, i) =>
        tc(cell, { width: widths[i], italic: i > 0 })
      )}))
    ]
  });
}

// ── dialogTable ───────────────────────────────────────────────────────────
// items: [{speaker, ita, esp}]
function dialogTable(items) {
  const cw = [1200, 4080, 4080];
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(["Hablante", "Italiano", "Español"], cw),
      ...items.map(it => {
        const isFem = it.speaker === "Giulia";
        return new TableRow({ children: [
          tc(it.speaker, { width: cw[0], bold: true, fill: isFem ? LTEAL : LGRAY }),
          tcIta(it.ita, { width: cw[1] }),
          tc(it.esp, { width: cw[2], italic: true, color: "444444" })
        ]});
      })
    ]
  });
}

// ── twoCol ─────────────────────────────────────────────────────────────────
// items: [{ita, esp}]
function twoCol(items, opts = {}) {
  const cw = opts.cw || [4680, 4680];
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(["Italiano", "Español"], cw),
      ...items.map(it => new TableRow({ children: [
        tcIta(it.ita, { width: cw[0] }),
        tc(it.esp, { width: cw[1] })
      ]}))
    ]
  });
}

// ══════════════════════════════════════════════════════════════════════════
// BUILD DOCUMENT
// ══════════════════════════════════════════════════════════════════════════
const ch = [];

// ── COVER ─────────────────────────────────────────────────────────────────
ch.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 480, after: 80 },
  children: [new TextRun({ text: "Italiano per Piacere", font: FONTS, size: 44, bold: true, color: TEAL })] }));
ch.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
  children: [new TextRun({ text: "A1 — Módulo 7", font: FONTS, size: 28, italic: true, color: "555555" })] }));
ch.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
  children: [new TextRun({ text: "Módulo 7", font: FONTS, size: 32, bold: true, color: TEAL })] }));
ch.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
  children: [new TextRun({ text: "In famiglia", font: FONTS, size: 36, bold: true, color: BLACK })] }));
ch.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240 },
  children: [new TextRun({ text: "La familia italiana", font: FONTS, size: 26, italic: true, color: "777777" })] }));

ch.push(infoBanner([
  "Etapa 1 — Video + V/F + selección múltiple",
  "Etapa 2 — Vocabulario: familia y objetos, diálogo, c'è/ci sono, números",
  "Etapa 3 — Gramática: possessivi, c'è/ci sono, numeri >1000"
]));
ch.push(blank());

// ══════════════════════════════════════════════════════════════════════════
// ETAPA 1 — EXPLORACIÓN
// ══════════════════════════════════════════════════════════════════════════
ch.push(pgBreak());
ch.push(stageBanner("ETAPA 1", "Exploración"));
ch.push(blank());
ch.push(p("Video: youtube.com/embed/mvl1hKoWWdM", { bold: true }));
ch.push(p("Una famiglia italiana — Michele, Stella e i loro tre figli", { italic: true }));
ch.push(blank());

// Ejercicio 1 — Vero o Falso
ch.push(h2("Ejercicio 1 — Vero o Falso"));
ch.push(blank());
ch.push(feedbackTable([
  { q: "La familia tiene tres hijos.",
    a: "V — Verdadero",
    fb: "¡Correcto! Luisa (6), Anna (4) y Lorenzo (2): tre figli!" },
  { q: "El padre se llama Michele.",
    a: "V — Verdadero",
    fb: "¡Sí! El padre se llama Michele." },
  { q: "La madre Stella es de Toscana.",
    a: "F — Falso",
    fb: "¡Correcto! Stella es de Sicilia, de Siracusa. Michele es el toscano." },
  { q: "La familia desayuna normalmente a las 8 de la mañana.",
    a: "F — Falso",
    fb: "¡Exacto! Se despiertan a las 6:15 cuando Lorenzo los despierta." },
  { q: "Los fines de semana a veces van a visitar a los abuelos.",
    a: "V — Verdadero",
    fb: "¡Sí! Hacen 'girate fuori porta' o visitan nonni en Toscana o Siracusa." },
  { q: "Michele considera que son una familia típica italiana.",
    a: "F — Falso",
    fb: "¡Correcto! Ellos mismos dicen que no son familia típica por tener 3 hijos." }
], { cw: [400, 3200, 1600, 4160] }));
ch.push(blank());

// Ejercicio 2 — Selección múltiple
ch.push(h2("Ejercicio 2 — Selección múltiple"));
ch.push(blank());
ch.push(feedbackTable([
  { q: "¿Cuántos años tiene Michele?",
    a: "38 años",
    fb: "¡Perfecto! Michele dice que tiene 38 años." },
  { q: "¿De qué región italiana es Michele?",
    a: "Toscana",
    fb: "¡Exacto! Michele es toscano. Por eso van a Toscana a ver a los nonni paterni." },
  { q: "¿A qué hora se despierta la familia?",
    a: "A las 6:15",
    fb: "¡Correcto! Lorenzo, el más chico, los despierta a las 6:15." },
  { q: "¿Qué hacen Stella y Michele a la mañana?",
    a: "Preparan el desayuno con música",
    fb: "¡Perfecto! Preparan el desayuno con música — un hermoso ritual familiar." },
  { q: "¿Qué crítica hace la familia sobre Italia?",
    a: "Que faltan servicios públicos para las familias",
    fb: "¡Exacto! Critican la falta de servicios públicos para las familias." }
], { cw: [400, 3000, 2400, 3560] }));
ch.push(blank());

// ══════════════════════════════════════════════════════════════════════════
// ETAPA 2 — DESCUBRIMIENTO
// ══════════════════════════════════════════════════════════════════════════
ch.push(pgBreak());
ch.push(stageBanner("ETAPA 2", "Descubrimiento"));
ch.push(blank());

// La famiglia — vocabTable
ch.push(h2("La famiglia — Árbol genealógico"));
ch.push(blank());
ch.push(vocabTable([
  { ita: "bisnonno", esp: "bisabuelo" },
  { ita: "bisnonna", esp: "bisabuela" },
  { ita: "nonno", esp: "abuelo" },
  { ita: "nonna", esp: "abuela" },
  { ita: "zio", esp: "tío" },
  { ita: "zia", esp: "tía" },
  { ita: "padre · papà", esp: "padre · papá" },
  { ita: "madre · mamma", esp: "madre · mamá" },
  { ita: "moglie", esp: "esposa" },
  { ita: "marito", esp: "esposo" },
  { ita: "figlio · fratello", esp: "hijo · hermano" },
  { ita: "figlia · sorella", esp: "hija · hermana" },
  { ita: "cugino", esp: "primo" },
  { ita: "cugina", esp: "prima" },
  { ita: "nipote (m)", esp: "sobrino · nieto" },
  { ita: "nipote (f)", esp: "sobrina · nieta" }
]));
ch.push(blank());

// Plurali e collettivi
ch.push(h2("Plurali e collettivi"));
ch.push(blank());
ch.push(vocabTable([
  { ita: "i genitori", esp: "los padres" },
  { ita: "i parenti", esp: "los parientes" },
  { ita: "i nonni", esp: "los abuelos" },
  { ita: "i figli", esp: "los hijos" },
  { ita: "i fratelli", esp: "los hermanos" },
  { ita: "la famiglia", esp: "la familia" }
]));
ch.push(blank());

// Oggetti personali
ch.push(h2("Oggetti personali"));
ch.push(blank());
ch.push(vocabTable([
  { ita: "lo zaino", esp: "la mochila" },
  { ita: "il portafoglio", esp: "la billetera" },
  { ita: "le chiavi", esp: "las llaves" },
  { ita: "il cellulare", esp: "el celular" },
  { ita: "gli occhiali", esp: "los anteojos" },
  { ita: "la borsa", esp: "la cartera" },
  { ita: "l'agenda", esp: "la agenda" },
  { ita: "l'ombrello", esp: "el paraguas" },
  { ita: "il passaporto", esp: "el pasaporte" }
]));
ch.push(blank());

// Diálogo
ch.push(h2("Diálogo — La mia famiglia"));
ch.push(blank());
ch.push(dialogTable([
  { speaker: "Marco",  ita: "Giulia, hai fratelli o sorelle?", esp: "Giulia, ¿tenés hermanos o hermanas?" },
  { speaker: "Giulia", ita: "Sì! Ho un fratello e una sorella. Mio fratello si chiama Luca e ha ventidue anni.", esp: "¡Sí! Tengo un hermano y una hermana. Mi hermano se llama Luca y tiene 22 años." },
  { speaker: "Marco",  ita: "E tua sorella, come si chiama?", esp: "¿Y tu hermana, cómo se llama?" },
  { speaker: "Giulia", ita: "Si chiama Elena. Ha diciotto anni e studia all'università. I miei genitori sono molto orgogliosi di lei!", esp: "Se llama Elena. Tiene 18 años y estudia en la universidad. ¡Mis padres están muy orgullosos de ella!" },
  { speaker: "Marco",  ita: "E i nonni? Li vedi spesso?", esp: "¿Y los abuelos? ¿Los ves seguido?" },
  { speaker: "Giulia", ita: "Sì, ogni domenica andiamo a pranzo da mia nonna materna. Lei abita a venti minuti da casa nostra.", esp: "Sí, cada domingo vamos a almorzar donde mi abuela materna. Ella vive a 20 minutos de casa." },
  { speaker: "Marco",  ita: "Bello! E tuo nonno paterno, abita lontano?", esp: "¡Qué lindo! ¿Y tu abuelo paterno vive lejos?" },
  { speaker: "Giulia", ita: "Sì, purtroppo. Mio nonno abita in Toscana. Lo vediamo solo d'estate e a Natale.", esp: "Sí, lamentablemente. Mi abuelo vive en Toscana. Lo vemos solo en verano y en Navidad." },
  { speaker: "Marco",  ita: "Hai anche zii o cugini?", esp: "¿Tenés también tíos o primos?" },
  { speaker: "Giulia", ita: "Eccome! Mia zia Carla ha tre figli — due maschi e una femmina. Sono i miei cugini preferiti!", esp: "¡Y cómo! Mi tía Carla tiene tres hijos — dos varones y una mujer. ¡Son mis primos favoritos!" },
  { speaker: "Marco",  ita: "E i tuoi genitori, che lavoro fanno?", esp: "¿Y tus padres, a qué se dedican?" },
  { speaker: "Giulia", ita: "Mio padre è medico e mia madre è architetta. Lavorano tantissimo ma sono molto presenti!", esp: "Mi padre es médico y mi madre es arquitecta. ¡Trabajan muchísimo pero están muy presentes!" },
  { speaker: "Marco",  ita: "La tua famiglia si incontra spesso tutta insieme?", esp: "¿Tu familia se reúne seguido toda junta?" },
  { speaker: "Giulia", ita: "Sì! A Natale siamo sempre tutti riuniti — i nonni, gli zii, i cugini... siamo in venti!", esp: "¡Sí! En Navidad siempre estamos todos reunidos — abuelos, tíos, primos... ¡somos veinte!" },
  { speaker: "Marco",  ita: "Che bella famiglia numerosa! Nella mia siamo solo in quattro.", esp: "¡Qué linda familia numerosa! En la mía somos solo cuatro." },
  { speaker: "Giulia", ita: "Piccola ma unita, di sicuro! Qual è la tua tradizione preferita?", esp: "¡Pequeña pero unida, seguro! ¿Cuál es tu tradición favorita?" },
  { speaker: "Marco",  ita: "Le vacanze estive in Sicilia! Andiamo ogni anno, è una tradizione da vent'anni.", esp: "¡Las vacaciones de verano en Sicilia! Vamos cada año, es una tradición de 20 años." },
  { speaker: "Giulia", ita: "Che meraviglia! Anche noi andiamo al mare d'estate — ma in Sardegna.", esp: "¡Qué maravilla! Nosotros también vamos al mar en verano — pero a Cerdeña." }
]));
ch.push(blank());

// Nota gramatical
ch.push(infoBanner([
  "Los possessivi con nomi di parentela van SIN artículo en singular: mio fratello, tua sorella, mio nonno.",
  "Pero en plural llevan artículo: i miei genitori, i miei cugini."
]));
ch.push(blank());

// C'è / Ci sono
ch.push(h2("C'è / Ci sono"));
ch.push(blank());
ch.push(twoCol([
  { ita: "C'è un padre, una madre e tre figli.", esp: "Hay un padre, una madre y tres hijos." },
  { ita: "Ci sono tre bambini in famiglia.", esp: "Hay tres chicos en la familia." },
  { ita: "C'è tua sorella a casa?", esp: "¿Está tu hermana en casa?" },
  { ita: "Non ci sono nonni vicini.", esp: "No hay abuelos cerca." },
  { ita: "Ci sono le chiavi nel zaino?", esp: "¿Están las llaves en la mochila?" },
  { ita: "Non c'è uno zio in questa famiglia.", esp: "No hay ningún tío en esta familia." }
]));
ch.push(blank());
ch.push(infoBanner("Clave: C'è (singular) / Ci sono (plural). Mirá siempre el sustantivo que sigue."));
ch.push(blank());

// Numeri oltre 1000
ch.push(h2("Numeri oltre 1000"));
ch.push(blank());
const numCw = [1600, 2800, 4960];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: numCw,
  rows: [
    hrow(["Número", "Italiano", "Regla"], numCw),
    new TableRow({ children: [
      tc("1.000",   { width: numCw[0], bold: true }),
      tcIta("mille",  { width: numCw[1] }),
      tc("Singular: siempre \"mille\", nunca \"un mille\"", { width: numCw[2] })
    ]}),
    new TableRow({ children: [
      tc("2.000",   { width: numCw[0], bold: true }),
      tcIta("duemila", { width: numCw[1] }),
      tc("Plural: due + mila (no \"due mille\")", { width: numCw[2] })
    ]}),
    new TableRow({ children: [
      tc("3.500",   { width: numCw[0], bold: true }),
      tcIta("tremilacinquecento", { width: numCw[1] }),
      tc("tre + mila + cinquecento", { width: numCw[2] })
    ]}),
    new TableRow({ children: [
      tc("10.000",  { width: numCw[0], bold: true }),
      tcIta("diecimila", { width: numCw[1] }),
      tc("dieci + mila", { width: numCw[2] })
    ]}),
    new TableRow({ children: [
      tc("100.000", { width: numCw[0], bold: true }),
      tcIta("centomila", { width: numCw[1] }),
      tc("cento + mila", { width: numCw[2] })
    ]}),
    new TableRow({ children: [
      tc("1.000.000", { width: numCw[0], bold: true }),
      tcIta("un milione", { width: numCw[1] }),
      tc("Sustantivo + \"di\": un milione di persone", { width: numCw[2] })
    ]})
  ]
}));
ch.push(blank());
ch.push(infoBanner("Milione es sustantivo → necesita 'di' antes del contado: un milione di persone, due milioni di euro."));
ch.push(blank());

// Come parlare della famiglia
ch.push(h2("Come parlare della famiglia"));
ch.push(blank());
ch.push(twoCol([
  { ita: "Hai fratelli?", esp: "¿Tenés hermanos?" },
  { ita: "Quanti siete in famiglia?", esp: "¿Cuántos son en la familia?" },
  { ita: "Siamo in quattro / cinque.", esp: "Somos cuatro / cinco." },
  { ita: "Ho una famiglia numerosa.", esp: "Tengo una familia numerosa." },
  { ita: "Perché non andiamo dai nonni?", esp: "¿Por qué no vamos a lo de los abuelos?" },
  { ita: "Ti va di venire con noi?", esp: "¿Te copa venir con nosotros?" }
]));
ch.push(blank());

// Ejercicios Etapa 2
ch.push(h2("Ejercicios Etapa 2"));
ch.push(blank());
ch.push(p("Ejercicio 1 — Chi è?", { bold: true }));
ch.push(blank());
ch.push(feedbackTable([
  { q: "El padre de tu padre o de tu madre.",
    a: "il nonno",
    fb: "¡Correcto! Il nonno es el abuelo." },
  { q: "La hermana de tu padre o de tu madre.",
    a: "la zia",
    fb: "¡Exacto! La zia es la tía." },
  { q: "El hijo de tu tío o tía.",
    a: "il cugino",
    fb: "¡Perfecto! Il cugino es el primo." },
  { q: "¿Cómo se dice 'los padres' (padre y madre juntos)?",
    a: "i genitori",
    fb: "¡Correcto! I genitori es padre y madre juntos." }
], { cw: [400, 3400, 1800, 3760] }));
ch.push(blank());

// ══════════════════════════════════════════════════════════════════════════
// ETAPA 3 — GRAMÁTICA
// ══════════════════════════════════════════════════════════════════════════
ch.push(pgBreak());
ch.push(stageBanner("ETAPA 3", "Gramática"));
ch.push(blank());

// 1 · Gli aggettivi possessivi
ch.push(h2("1 · Gli aggettivi possessivi"));
ch.push(blank());

const possCw = [1560, 1800, 1800, 1800, 2400];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: possCw,
  rows: [
    hrow(["Persona", "Masc. sing.", "Fem. sing.", "Masc. plur.", "Fem. plur."], possCw),
    new TableRow({ children: [
      tc("io",      { width: possCw[0], bold: true }),
      tcIta("il mio",   { width: possCw[1] }),
      tcIta("la mia",   { width: possCw[2] }),
      tcIta("i miei",   { width: possCw[3] }),
      tcIta("le mie",   { width: possCw[4] })
    ]}),
    new TableRow({ children: [
      tc("tu",      { width: possCw[0], bold: true }),
      tcIta("il tuo",   { width: possCw[1] }),
      tcIta("la tua",   { width: possCw[2] }),
      tcIta("i tuoi",   { width: possCw[3] }),
      tcIta("le tue",   { width: possCw[4] })
    ]}),
    new TableRow({ children: [
      tc("lui/lei", { width: possCw[0], bold: true }),
      tcIta("il suo",   { width: possCw[1] }),
      tcIta("la sua",   { width: possCw[2] }),
      tcIta("i suoi",   { width: possCw[3] }),
      tcIta("le sue",   { width: possCw[4] })
    ]}),
    new TableRow({ children: [
      tc("noi",     { width: possCw[0], bold: true }),
      tcIta("il nostro", { width: possCw[1] }),
      tcIta("la nostra", { width: possCw[2] }),
      tcIta("i nostri",  { width: possCw[3] }),
      tcIta("le nostre", { width: possCw[4] })
    ]}),
    new TableRow({ children: [
      tc("voi",     { width: possCw[0], bold: true }),
      tcIta("il vostro", { width: possCw[1] }),
      tcIta("la vostra", { width: possCw[2] }),
      tcIta("i vostri",  { width: possCw[3] }),
      tcIta("le vostre", { width: possCw[4] })
    ]}),
    new TableRow({ children: [
      tc("loro",    { width: possCw[0], bold: true }),
      tcIta("il loro",  { width: possCw[1] }),
      tcIta("la loro",  { width: possCw[2] }),
      tcIta("i loro",   { width: possCw[3] }),
      tcIta("le loro",  { width: possCw[4] })
    ]})
  ]
}));
ch.push(blank());
ch.push(infoBanner([
  "Con nomi di parentela SINGOLARE → SIN artículo: mio padre, mia madre, tua sorella.",
  "Excepción: 'loro' siempre lleva artículo: il loro padre, la loro sorella.",
  "En plural SIEMPRE lleva artículo: i miei fratelli, le tue sorelle.",
  "Con adjetivo vuelve el artículo: il mio fratello maggiore, la mia cara nonna."
], YELLOW, "7D5A00"));
ch.push(blank());

// Ej 1A
ch.push(p("Ejercicio 1A — Scegli il possessivo", { bold: true }));
ch.push(blank());
ch.push(feedbackTable([
  { q: "Giulia habla de su hermano: '___ fratello si chiama Luca.'",
    a: "Mio",
    fb: "¡Correcto! Giulia habla de sí misma → mio, sin artículo (parentela singolare)." },
  { q: "Marco le pregunta a Giulia: 'E ___ sorella, come si chiama?'",
    a: "tua",
    fb: "¡Perfecto! Marco habla con Giulia (tu) → tua, sin artículo." },
  { q: "'___ genitori sono di Milano.' (los de él)",
    a: "I suoi",
    fb: "¡Correcto! Plural → lleva artículo. Sus padres = i suoi genitori." },
  { q: "'___ nonna materna abita a venti minuti.' (Giulia)",
    a: "Mia",
    fb: "¡Correcto! mia sin artículo — nonna es parentela singolare." }
], { cw: [400, 3800, 1400, 3760] }));
ch.push(blank());

// Ej 1B
ch.push(p("Ejercicio 1B — Completá", { bold: true }));
ch.push(blank());
ch.push(feedbackTable([
  { q: "Ho una sorella. ___ sorella si chiama Elena. (yo)",
    a: "mia",
    fb: "mia — parentela singolare, yo → mia." },
  { q: "Giulia ha due cugini. ___ cugini abitano a Roma. (yo)",
    a: "i miei",
    fb: "Plural → lleva artículo: i miei cugini." },
  { q: "Marco chiede: 'Come si chiama ___ padre?' (vos)",
    a: "tuo",
    fb: "tuo — parentela singolare, vos → tuo." },
  { q: "È bellissima! ___ cara nonna fa la pasta. (yo, con adjetivo cara)",
    a: "la mia",
    fb: "Con adjetivo vuelve el artículo: la mia cara nonna." },
  { q: "Michele e Stella portano i bambini. ___ figli vanno all'asilo. (loro)",
    a: "i loro",
    fb: "loro siempre lleva artículo: i loro figli." }
], { cw: [400, 3800, 1400, 3760] }));
ch.push(blank());

// 2 · C'è / Ci sono — In profondità
ch.push(h2("2 · C'è / Ci sono — In profondità"));
ch.push(blank());

const ceCw = [1600, 1600, 1800, 4360];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: ceCw,
  rows: [
    hrow(["Forma", "Número", "Uso", "Ejemplo"], ceCw),
    new TableRow({ children: [
      tcIta("C'è",        { width: ceCw[0], bold: true }),
      tc("Singular",      { width: ceCw[1] }),
      tc("Un elemento",   { width: ceCw[2] }),
      tcIta("C'è un bambino che piange — Hay un niño que llora.", { width: ceCw[3] })
    ]}),
    new TableRow({ children: [
      tcIta("Ci sono",    { width: ceCw[0], bold: true }),
      tc("Plural",        { width: ceCw[1] }),
      tc("Dos o más",     { width: ceCw[2] }),
      tcIta("Ci sono tre figli in questa famiglia — Hay tres hijos.", { width: ceCw[3] })
    ]}),
    new TableRow({ children: [
      tcIta("Non c'è",    { width: ceCw[0], bold: true }),
      tc("Singular neg.", { width: ceCw[1] }),
      tc("Ausencia",      { width: ceCw[2] }),
      tcIta("Non c'è abbastanza aiuto per le famiglie.", { width: ceCw[3] })
    ]}),
    new TableRow({ children: [
      tcIta("Non ci sono",{ width: ceCw[0], bold: true }),
      tc("Plural neg.",   { width: ceCw[1] }),
      tc("Ausencia",      { width: ceCw[2] }),
      tcIta("Non ci sono servizi pubblici adeguati.", { width: ceCw[3] })
    ]}),
    new TableRow({ children: [
      tcIta("C'è…?",      { width: ceCw[0], bold: true }),
      tc("Pregunta sing.", { width: ceCw[1] }),
      tc("¿Hay…?",        { width: ceCw[2] }),
      tcIta("C'è tua madre a casa?", { width: ceCw[3] })
    ]}),
    new TableRow({ children: [
      tcIta("Ci sono…?",  { width: ceCw[0], bold: true }),
      tc("Pregunta plur.", { width: ceCw[1] }),
      tc("¿Hay…?",        { width: ceCw[2] }),
      tcIta("Ci sono i nonni oggi?", { width: ceCw[3] })
    ]})
  ]
}));
ch.push(blank());

// Ej 2A
ch.push(p("Ejercicio 2A — C'è o Ci sono", { bold: true }));
ch.push(blank());
ch.push(feedbackTable([
  { q: "'___ una festa in famiglia questo weekend?'",
    a: "C'è",
    fb: "Una festa es singular → c'è." },
  { q: "'Non ___ abbastanza tempo per la famiglia in Italia.'",
    a: "c'è",
    fb: "Tempo es singular → non c'è." },
  { q: "'In questa città ___ molti parchi per i bambini?'",
    a: "ci sono",
    fb: "Molti parchi es plural → ci sono." },
  { q: "'Nel video ___ una famiglia siciliana e toscana insieme.'",
    a: "c'è",
    fb: "Una famiglia es singular → c'è." }
], { cw: [400, 3600, 1600, 3760] }));
ch.push(blank());

// Ej 2B
ch.push(p("Ejercicio 2B — Completá", { bold: true }));
ch.push(blank());
ch.push(feedbackTable([
  { q: "___ tre bambini nella famiglia di Stella.",
    a: "ci sono",
    fb: "Tre bambini es plural → ci sono." },
  { q: "A Siracusa ___ i nonni materni di Luisa.",
    a: "ci sono",
    fb: "I nonni es plural → ci sono." },
  { q: "In Italia ___ abbastanza asili nido pubblici.",
    a: "non ci sono",
    fb: "Negación + plural → non ci sono." },
  { q: "___ un parco vicino a casa loro?",
    a: "c'è",
    fb: "Un parco es singular → c'è." }
], { cw: [400, 3600, 1600, 3760] }));
ch.push(blank());

// Ej 2C
ch.push(p("Ejercicio 2C — Traducí al italiano", { bold: true }));
ch.push(blank());
ch.push(feedbackTable([
  { q: "Hay cuatro personas en mi familia.",
    a: "ci sono quattro persone nella mia famiglia",
    fb: "¡Correcto!" },
  { q: "¿Hay un abuelo en tu familia?",
    a: "c'è un nonno nella tua famiglia",
    fb: "¡Correcto!" },
  { q: "No hay servicios para las familias.",
    a: "non ci sono servizi per le famiglie",
    fb: "¡Correcto!" }
], { cw: [400, 3200, 2600, 3160] }));
ch.push(blank());

// 3 · Numeri oltre 1000 (repeated in grammar stage)
ch.push(h2("3 · Numeri oltre 1000"));
ch.push(blank());
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: numCw,
  rows: [
    hrow(["Número", "Italiano", "Regla"], numCw),
    new TableRow({ children: [
      tc("1.000",   { width: numCw[0], bold: true }),
      tcIta("mille",  { width: numCw[1] }),
      tc("Singular: siempre \"mille\", nunca \"un mille\"", { width: numCw[2] })
    ]}),
    new TableRow({ children: [
      tc("2.000",   { width: numCw[0], bold: true }),
      tcIta("duemila", { width: numCw[1] }),
      tc("Plural: due + mila (no \"due mille\")", { width: numCw[2] })
    ]}),
    new TableRow({ children: [
      tc("3.500",   { width: numCw[0], bold: true }),
      tcIta("tremilacinquecento", { width: numCw[1] }),
      tc("tre + mila + cinquecento", { width: numCw[2] })
    ]}),
    new TableRow({ children: [
      tc("10.000",  { width: numCw[0], bold: true }),
      tcIta("diecimila", { width: numCw[1] }),
      tc("dieci + mila", { width: numCw[2] })
    ]}),
    new TableRow({ children: [
      tc("100.000", { width: numCw[0], bold: true }),
      tcIta("centomila", { width: numCw[1] }),
      tc("cento + mila", { width: numCw[2] })
    ]}),
    new TableRow({ children: [
      tc("1.000.000", { width: numCw[0], bold: true }),
      tcIta("un milione", { width: numCw[1] }),
      tc("Sustantivo + \"di\": un milione di persone", { width: numCw[2] })
    ]})
  ]
}));
ch.push(blank());

// Ej 3A
ch.push(p("Ejercicio 3A — Come si dice", { bold: true }));
ch.push(blank());
ch.push(feedbackTable([
  { q: "¿Cómo se dice 2.000?",
    a: "duemila",
    fb: "¡Correcto! duemila — el plural de mille es siempre mila." },
  { q: "¿Cómo se dice 'un millón de habitantes'?",
    a: "un milione di abitanti",
    fb: "¡Perfecto! Con milione se usa 'di' antes del sustantivo." },
  { q: "¿Cómo se escribe 15.000?",
    a: "quindicimila",
    fb: "¡Exacto! quindici + mila = quindicimila." }
], { cw: [400, 3400, 2000, 3560] }));
ch.push(blank());

// Ej 3B
ch.push(p("Ejercicio 3B — Scrivi il numero", { bold: true }));
ch.push(blank());
ch.push(feedbackTable([
  { q: "3.000 →",
    a: "tremila",
    fb: "¡Correcto!" },
  { q: "1.200 →",
    a: "milleduecento",
    fb: "¡Correcto!" },
  { q: "50.000 →",
    a: "cinquantamila",
    fb: "¡Correcto!" },
  { q: "'Hay 2.000.000 de turistas.' Ci sono ___ di turisti.",
    a: "due milioni",
    fb: "¡Correcto! Plural: due milioni di turisti." }
], { cw: [400, 3400, 2000, 3560] }));
ch.push(blank());

// 4 · Set Integrador
ch.push(h2("4 · Set Integrador — Tutto insieme"));
ch.push(blank());

// Ej 4A
ch.push(p("Ejercicio 4A — Tutto insieme", { bold: true }));
ch.push(blank());
ch.push(feedbackTable([
  { q: "Nella famiglia di Giulia ___ cinque persone.",
    a: "ci sono",
    fb: "Plural → ci sono." },
  { q: "___ madre si chiama Anna. (yo)",
    a: "mia",
    fb: "Parentela singolare + io → mia." },
  { q: "E ___ fratello si chiama Luca. (yo)",
    a: "mio",
    fb: "Parentela singolare + io → mio." },
  { q: "I nonni abitano a ___ chilometri di distanza.",
    a: "tremila",
    fb: "3.000 → tremila." }
], { cw: [400, 3600, 1600, 3760] }));
ch.push(blank());

// Ej 4B
ch.push(p("Ejercicio 4B — Preguntas sobre el video", { bold: true }));
ch.push(blank());
ch.push(feedbackTable([
  { q: "'Los abuelos maternos de Luisa' → ¿cómo lo expresarías?",
    a: "i suoi nonni",
    fb: "¡Correcto! I suoi nonni = los de ella. Plural → lleva artículo." },
  { q: "'En la familia del video, hay tres hijos.' ¿Cómo se dice?",
    a: "Ci sono tre figli.",
    fb: "¡Perfecto! Tre figli = plural → ci sono." },
  { q: "Michele: en Italia no hay suficientes servicios para las familias.",
    a: "Non ci sono servizi per le famiglie.",
    fb: "¡Exacto! Servizi es plural → non ci sono." }
], { cw: [400, 3600, 2000, 3360] }));
ch.push(blank());

// Nota cultural
ch.push(h2("Nota cultural — La famiglia è il cuore di tutto"));
ch.push(blank());
ch.push(p("In Italia, la famiglia è ancora oggi il pilastro fondamentale della società. Non si tratta solo dei genitori e dei figli: la famiglia italiana è spesso molto estesa, e include nonni, zii, cugini e parenti lontani che si frequentano con regolarità. Il pranzo domenicale è un rituale sacro: tutta la famiglia si riunisce a tavola, spesso a casa dei nonni."));
ch.push(blank());
ch.push(p("En Italia, la familia sigue siendo hoy el pilar fundamental de la sociedad. La familia italiana suele ser muy extensa, e incluye abuelos, tíos, primos y parientes lejanos que se ven con regularidad. El almuerzo dominical es un ritual sagrado: toda la familia se reúne en la mesa, generalmente en casa de los abuelos.", { italic: true }));
ch.push(blank());

// ══════════════════════════════════════════════════════════════════════════
// ASSEMBLE DOCUMENT
// ══════════════════════════════════════════════════════════════════════════
const doc = new Document({
  styles: {
    default: { document: { run: { font: FONTS, size: 22 } } },
    paragraphStyles: [
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
    children: ch
  }]
});

const outPath = path.join(__dirname, "modulo8_in_famiglia.docx");
Packer.toBuffer(doc)
  .then(buf => {
    fs.writeFileSync(outPath, buf);
    console.log("OK: modulo8_in_famiglia.docx generado en", outPath);
  })
  .catch(e => {
    console.error("ERROR:", e.message);
    process.exit(1);
  });
