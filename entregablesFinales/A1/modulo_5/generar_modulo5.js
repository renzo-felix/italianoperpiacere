const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageBreak
} = require("C:/Users/Renzo/AppData/Roaming/npm/node_modules/docx");

const TEAL   = "2E6B7B";
const LTEAL  = "D6EAF0";
const GREEN  = "1E7A3C";
const LGREEN = "D5F5E3";
const RED    = "B22222";
const LRED   = "FAD7D7";
const LGRAY  = "F2F2F2";
const BLACK  = "000000";
const FONTS  = "Arial";
const PAGE_W = 9360;

const brd  = (c = "CCCCCC") => ({ style: BorderStyle.SINGLE, size: 4, color: c });
const bors = (c = "CCCCCC") => ({ top: brd(c), bottom: brd(c), left: brd(c), right: brd(c) });

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
    children: [new TextRun({ text, font: FONTS, size: 22, bold: true })]
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
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    borders: bors(opts.bc || "CCCCCC"),
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({ text, font: FONTS, size: opts.sz || 20, bold: opts.bold, italic: opts.italic, color: opts.color || BLACK })]
    })]
  });
}
function row(cells) { return new TableRow({ children: cells }); }
function hrow(labels, widths) {
  return row(labels.map((l, i) => cell(l, { fill: TEAL, bold: true, color: "FFFFFF", width: widths[i] })));
}

// ── V/F table ──────────────────────────────────────────────────────────────
function vfTable(items) {
  const cw = [400, 5200, 1200, 2560];
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(["N°", "Afirmación", "Respuesta", "Justificación"], cw),
      ...items.map((it, i) => row([
        cell(String(i + 1), { width: cw[0], bold: true }),
        cell(it.q, { width: cw[1] }),
        cell(it.a, { width: cw[2], fill: it.ok ? LGREEN : LRED, bold: true, color: it.ok ? GREEN : RED }),
        cell(it.j, { width: cw[3], italic: true })
      ]))
    ]
  });
}

// ── Selección múltiple ────────────────────────────────────────────────────
function smItems(items) {
  const out = [];
  items.forEach(it => {
    out.push(new Paragraph({ spacing: { before: 120, after: 40 },
      children: [new TextRun({ text: `${it.n}. ${it.q}`, font: FONTS, size: 21, bold: true })] }));
    const cw = [5040, 4320];
    out.push(new Table({
      width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
      rows: it.opts.map(o => row([
        cell(o.ok ? `✓  ${o.text}` : `    ${o.text}`,
          { width: cw[0], fill: o.ok ? LGREEN : undefined, color: o.ok ? GREEN : BLACK, bold: o.ok }),
        o.ok ? cell("← correcta", { width: cw[1], italic: true, color: GREEN }) : cell("", { width: cw[1] })
      ]))
    }));
    out.push(new Paragraph({ spacing: { before: 40, after: 80 },
      children: [new TextRun({ text: `Justificación: ${it.j}`, font: FONTS, size: 19, italic: true, color: "555555" })] }));
  });
  return out;
}

// ══════════════════════════════════════════════════════════════════════════
const ch = [];

// ── Portada ───────────────────────────────────────────────────────────────
ch.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 480, after: 160 },
  children: [new TextRun({ text: "MÓDULO 5 · A1", font: FONTS, size: 48, bold: true, color: TEAL })]
}));
ch.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
  children: [new TextRun({ text: "Che lavoro fai?  —  ¿A qué te dedicás?", font: FONTS, size: 28, italic: true, color: "555555" })]
}));
ch.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 0, after: 480 },
  children: [new TextRun({ text: "Documento de revisión con respuestas correctas y justificaciones", font: FONTS, size: 20, color: "777777" })]
}));
ch.push(divider());

// ══════════════════════════════════════════════════════════════════════════
// ETAPA 1 — EXPLORACIÓN
// ══════════════════════════════════════════════════════════════════════════
ch.push(h1("ETAPA 1  ·  EXPLORACIÓN · Video"));
ch.push(h3("👩‍🏫  Sofía — tu guía"));
ch.push(p("¡Benvenuti! En este módulo entramos a un mundo muy italiano: el trabajo y las profesiones. El video transcurre en un Centro per l'Impiego — la oficina de empleo pública italiana, equivalente a nuestras bolsas de trabajo. Vas a conocer a Samira, una mujer extranjera que busca trabajo en Italia por primera vez. Prestale mucha atención porque vas a escuchar vocabulario muy útil: documentos oficiales, profesiones, y cómo hablar de lo que sabés hacer. ¡Es una situación muy real!"));
ch.push(p(""));
ch.push(h3("🏛️  Contexto cultural: il Centro per l'Impiego"));
ch.push(pMixed([
  { text: "El Centro per l'Impiego es una oficina pública italiana donde las personas desocupadas pueden registrarse, buscar trabajo y acceder a subsidios. Para inscribirse es obligatorio presentar: " },
  { text: "carta d'identità", italic: true },
  { text: " (DNI italiano), " },
  { text: "codice fiscale", italic: true },
  { text: " (equivalente al CUIL/CUIT argentino), y para extranjeros el " },
  { text: "permesso di soggiorno", italic: true },
  { text: " (permiso de residencia). Al finalizar se firma una " },
  { text: "dichiarazione di immediata disponibilità al lavoro", italic: true },
  { text: " — declaración de disponibilidad para trabajar de inmediato." }
]));
ch.push(p(""));
ch.push(h3("🎯  Mientras ves el video, fijate en..."));
ch.push(p("1.  ¿Qué documentos le piden a Samira? ¿Podés identificarlos en italiano?"));
ch.push(p("2.  ¿Samira tiene experiencia laboral previa? ¿Qué dice exactamente?"));
ch.push(p("3.  ¿Qué tipo de trabajo le gustaría hacer? ¿Con quiénes le gusta trabajar?"));
ch.push(p("4.  ¿Qué firma Samira al final de la entrevista?"));
ch.push(p("5.  ¿Qué palabras en italiano relacionadas con el trabajo podés reconocer?"));
ch.push(p(""));

// ── Ejercicio 1: V/F ──────────────────────────────────────────────────────
ch.push(divider());
ch.push(h2("Ejercicio 1  ·  Vero o Falso — Verdadero o Falso"));
ch.push(p("¿Qué tan bien entendiste el video? Contestá cada afirmación."));
ch.push(p(""));
ch.push(vfTable([
  {
    q: "La escena transcurre en una oficina pública llamada Centro per l'Impiego.",
    a: "✓  VERDADERO", ok: true,
    j: "El contexto del video es exactamente ese: Samira se presenta en el Centro per l'Impiego para registrarse como desocupada y buscar trabajo."
  },
  {
    q: "Samira ya tiene mucha experiencia laboral en Italia.",
    a: "✗  FALSO", ok: false,
    j: "Samira llega por primera vez a buscar trabajo en Italia. No tiene experiencia laboral previa en el país, por eso se registra como desocupada."
  },
  {
    q: "Entre los documentos pedidos aparece la carta d'identità.",
    a: "✓  VERDADERO", ok: true,
    j: "La carta d'identità (DNI italiano) es uno de los documentos obligatorios para inscribirse en el Centro per l'Impiego."
  },
  {
    q: "A Samira le gusta cuidar a personas mayores y a niños.",
    a: "✓  VERDADERO", ok: true,
    j: "Samira menciona que quiere trabajar en assistenza alla persona — campo que incluye el cuidado de ancianos y niños, que es lo que ella expresa que le gusta."
  },
  {
    q: "La funcionaria de la oficina es un hombre.",
    a: "✗  FALSO", ok: false,
    j: "La empleada del Centro per l'Impiego que atiende a Samira es una mujer (una funcionaria). El enunciado dice 'un hombre', lo cual es incorrecto."
  },
  {
    q: "Al final, Samira firma un documento de disponibilidad para trabajar.",
    a: "✓  VERDADERO", ok: true,
    j: "Al terminar la inscripción, Samira firma la dichiarazione di immediata disponibilità al lavoro — declaración estándar del proceso de registro."
  }
]));
ch.push(p(""));

// ── Ejercicio 2: Selección múltiple ──────────────────────────────────────
ch.push(h2("Ejercicio 2  ·  Scelta multipla — Selección múltiple"));
ch.push(p("Elegí la opción correcta para cada pregunta sobre el video."));
ch.push(p(""));

smItems([
  {
    n: 1, q: "¿Qué es el codice fiscale en Italia?",
    opts: [
      { text: "Una contraseña bancaria", ok: false },
      { text: "Un número de identificación tributaria", ok: true },
      { text: "El número de pasaporte", ok: false },
      { text: "Un permiso de residencia", ok: false }
    ],
    j: "El codice fiscale es el número tributario italiano — equivalente exacto al CUIL/CUIT argentino. Se usa para cualquier trámite oficial, laboral o fiscal."
  },
  {
    n: 2, q: "¿Cuál es la situación de Samira respecto al trabajo cuando llega a la oficina?",
    opts: [
      { text: "Viene a renunciar a su trabajo actual", ok: false },
      { text: "No ha trabajado antes en Italia y busca empleo", ok: true },
      { text: "Es funcionaria del centro", ok: false },
      { text: "Viene a cobrar un subsidio", ok: false }
    ],
    j: "Samira llega al Centro per l'Impiego como persona desocupada que busca trabajo por primera vez en Italia. Se inscribe para recibir asistencia en la búsqueda."
  },
  {
    n: 3, q: "Además de la carta d'identità, ¿qué otro documento se menciona para extranjeros?",
    opts: [
      { text: "El pasaporte", ok: false },
      { text: "El certificato di nascita", ok: false },
      { text: "El permesso di soggiorno", ok: true },
      { text: "La tessera sanitaria", ok: false }
    ],
    j: "El permesso di soggiorno (permiso de residencia) es el documento obligatorio para extranjeros que quieren trabajar legalmente en Italia. Sin él no pueden inscribirse."
  },
  {
    n: 4, q: "¿Qué tipo de actividades menciona Samira que le gustan o sabe hacer?",
    opts: [
      { text: "Trabajar con computadoras", ok: false },
      { text: "Cocinar en un restaurante", ok: false },
      { text: "Cuidar a personas mayores y a niños", ok: true },
      { text: "Enseñar en escuelas", ok: false }
    ],
    j: "Samira expresa su interés por la assistenza alla persona — cuidado de ancianos y niños. Ese es el campo laboral que menciona durante la entrevista."
  },
  {
    n: 5, q: "¿Cómo se llama el documento que Samira firma al final?",
    opts: [
      { text: "Un contratto di lavoro", ok: false },
      { text: "Una dichiarazione di immediata disponibilità al lavoro", ok: true },
      { text: "Un curriculum vitae", ok: false },
      { text: "Una lettera di referenze", ok: false }
    ],
    j: "La dichiarazione di immediata disponibilità al lavoro es el documento estándar del proceso de registro en el Centro per l'Impiego — declara que la persona está lista para trabajar."
  }
]).forEach(el => ch.push(el));
ch.push(p(""));

// ══════════════════════════════════════════════════════════════════════════
// ETAPA 2 — DESCUBRIMIENTO
// ══════════════════════════════════════════════════════════════════════════
ch.push(pageBreak());
ch.push(h1("ETAPA 2  ·  DESCUBRIMIENTO"));
ch.push(pMixed([
  { text: "Che lavoro fai?", bold: true, italic: true },
  { text: "  —  Vocabulario de profesiones, colores y el verbo FARE." }
]));
ch.push(p(""));
ch.push(h3("👩‍🏫  Sofía · tu guía"));
ch.push(p("En el video viste a Samira buscando trabajo en el Centro per l'Impiego. La funcionaria le pide documentos, le pregunta sobre su experiencia y juntas descubren que Samira quiere trabajar en el campo de la assistenza alla persona. Ahora vamos a explorar el vocabulario que apareció ahí y mucho más — las profesiones, los colores, cómo expresar a qué te dedicás en italiano."));
ch.push(p(""));

// ── Le professioni ─────────────────────────────────────────────────────────
ch.push(h2("Le professioni — Las profesiones"));
ch.push(p("Los nombres de las profesiones y oficios (el ▶ indica audio en la versión digital):"));
ch.push(p(""));
const profColW = [3200, 3200, 2960];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: profColW,
  rows: [
    hrow(["Italiano", "Español", "Nota"], profColW),
    row([cell("il medico", { width: profColW[0], italic: true, bold: true }), cell("el/la médico/a", { width: profColW[1] }), cell("invariable: il / la medico", { width: profColW[2], italic: true })]),
    row([cell("l'infermiere / l'infermiera", { width: profColW[0], italic: true }), cell("el enfermero / la enfermera", { width: profColW[1] }), cell("dos formas: M/F", { width: profColW[2], italic: true })]),
    row([cell("l'insegnante", { width: profColW[0], italic: true }), cell("el/la docente / maestro/a", { width: profColW[1] }), cell("invariable: solo cambia artículo", { width: profColW[2], italic: true })]),
    row([cell("l'avvocato / l'avvocatessa", { width: profColW[0], italic: true }), cell("el abogado / la abogada", { width: profColW[1] }), cell("dos formas", { width: profColW[2], italic: true })]),
    row([cell("l'ingegnere", { width: profColW[0], italic: true }), cell("el/la ingeniero/a", { width: profColW[1] }), cell("invariable", { width: profColW[2], italic: true })]),
    row([cell("il cuoco / la cuoca", { width: profColW[0], italic: true }), cell("el cocinero / la cocinera", { width: profColW[1] }), cell("dos formas", { width: profColW[2], italic: true })]),
    row([cell("il cameriere / la cameriera", { width: profColW[0], italic: true }), cell("el mozo / la moza", { width: profColW[1] }), cell("dos formas", { width: profColW[2], italic: true })]),
    row([cell("il commesso / la commessa", { width: profColW[0], italic: true }), cell("el vendedor / la vendedora", { width: profColW[1] }), cell("dos formas", { width: profColW[2], italic: true })]),
    row([cell("l'impiegato / l'impiegata", { width: profColW[0], italic: true }), cell("el/la empleado/a de oficina", { width: profColW[1] }), cell("dos formas", { width: profColW[2], italic: true })]),
    row([cell("il parrucchiere / la parrucchiera", { width: profColW[0], italic: true }), cell("el peluquero / la peluquera", { width: profColW[1] }), cell("dos formas", { width: profColW[2], italic: true })]),
    row([cell("il meccanico", { width: profColW[0], italic: true }), cell("el mecánico", { width: profColW[1] }), cell("invariable en sing.", { width: profColW[2], italic: true })]),
    row([cell("il poliziotto / la poliziotta", { width: profColW[0], italic: true }), cell("el policía / la policía", { width: profColW[1] }), cell("dos formas", { width: profColW[2], italic: true })]),
    row([cell("l'architetto", { width: profColW[0], italic: true }), cell("el/la arquitecto/a", { width: profColW[1] }), cell("invariable", { width: profColW[2], italic: true })]),
    row([cell("il giornalista / la giornalista", { width: profColW[0], italic: true }), cell("el/la periodista", { width: profColW[1] }), cell("invariable: cambia artículo", { width: profColW[2], italic: true })]),
    row([cell("il badante / la badante", { width: profColW[0], italic: true }), cell("el/la cuidador/a de ancianos", { width: profColW[1] }), cell("invariable", { width: profColW[2], italic: true })]),
    row([cell("il programmatore / la programmatrice", { width: profColW[0], italic: true }), cell("el programador / la programadora", { width: profColW[1] }), cell("dos formas", { width: profColW[2], italic: true })])
  ]
}));
ch.push(note("💡 Nota gramatical: En italiano, muchas profesiones tienen forma M/F. Algunas como insegnante o giornalista son invariables — solo cambia el artículo: il giornalista / la giornalista."));
ch.push(p(""));

// ── I colori ──────────────────────────────────────────────────────────────
ch.push(h2("I colori — Los colores"));
ch.push(p(""));
const colColW = [2000, 2000, 640, 2000, 2720];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: colColW,
  rows: [
    hrow(["Italiano", "Español", "", "Italiano", "Español"], colColW),
    row([cell("rosso", { width: colColW[0], italic: true }), cell("rojo", { width: colColW[1] }), cell("", { width: colColW[2] }), cell("grigio", { width: colColW[3], italic: true }), cell("gris", { width: colColW[4] })]),
    row([cell("blu", { width: colColW[0], italic: true }), cell("azul oscuro", { width: colColW[1] }), cell("", { width: colColW[2] }), cell("marrone", { width: colColW[3], italic: true }), cell("marrón / café", { width: colColW[4] })]),
    row([cell("azzurro", { width: colColW[0], italic: true }), cell("celeste", { width: colColW[1] }), cell("", { width: colColW[2] }), cell("bianco", { width: colColW[3], italic: true }), cell("blanco", { width: colColW[4] })]),
    row([cell("verde", { width: colColW[0], italic: true }), cell("verde", { width: colColW[1] }), cell("", { width: colColW[2] }), cell("nero", { width: colColW[3], italic: true }), cell("negro", { width: colColW[4] })]),
    row([cell("giallo", { width: colColW[0], italic: true }), cell("amarillo", { width: colColW[1] }), cell("", { width: colColW[2] }), cell("arancione", { width: colColW[3], italic: true }), cell("naranja", { width: colColW[4] })])
  ]
}));
ch.push(p(""));

// ── Diálogo referencia ────────────────────────────────────────────────────
ch.push(h2("Dialogo — Giulia e Marco parlano di lavoro"));
ch.push(p("Giulia es de Roma, Marco es de Milano. Se conocen en un corso di italiano. (El ▶ indica audio en la versión digital)"));
ch.push(p("El diálogo completo aparece en la sección de Gramática con todas sus líneas. En esta etapa se usa para explorar el vocabulario de profesiones y el verbo FARE de forma natural."));
ch.push(p(""));

// ── Il verbo FARE ─────────────────────────────────────────────────────────
ch.push(h2("Il verbo FARE — el verbo hacer / tener (trabajo)"));
ch.push(p("FARE es un verbo irregular muy usado. Sus usos más importantes:"));
ch.push(p(""));
const fareColW = [3600, 3200, 2560];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: fareColW,
  rows: [
    hrow(["Frase en italiano", "Traducción / uso", "Nota"], fareColW),
    row([cell("Che lavoro fai?", { width: fareColW[0], italic: true, bold: true }), cell("¿A qué te dedicás? / ¿Qué trabajo hacés?", { width: fareColW[1] }), cell("Pregunta principal del módulo", { width: fareColW[2], italic: true })]),
    row([cell("Faccio il medico.", { width: fareColW[0], italic: true }), cell("Soy médico. (lit. \"hago el médico\")", { width: fareColW[1] }), cell("FARE + il/la + professione", { width: fareColW[2], italic: true })]),
    row([cell("Fa la cuoca in un ristorante.", { width: fareColW[0], italic: true }), cell("Ella es cocinera en un restaurante.", { width: fareColW[1] }), cell("3ª persona singular", { width: fareColW[2], italic: true })]),
    row([cell("Cosa fate nel tempo libero?", { width: fareColW[0], italic: true }), cell("¿Qué hacen en el tiempo libre?", { width: fareColW[1] }), cell("2ª persona plural (voi)", { width: fareColW[2], italic: true })]),
    row([cell("Facciamo una pausa!", { width: fareColW[0], italic: true }), cell("¡Hacemos una pausa!", { width: fareColW[1] }), cell("Expresión muy usada en el trabajo", { width: fareColW[2], italic: true })]),
    row([cell("Non fa niente.", { width: fareColW[0], italic: true }), cell("No importa. / No hay nada.", { width: fareColW[1] }), cell("Expresión idiomática frecuente", { width: fareColW[2], italic: true })])
  ]
}));
ch.push(p(""));

// ── I suoni SC ────────────────────────────────────────────────────────────
ch.push(h2("I suoni: sk e ʃ — Los sonidos de SC"));
ch.push(p("Dos sonidos importantes relacionados con la letra SC:"));
ch.push(p(""));
const scColW = [1600, 3360, 4400];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: scColW,
  rows: [
    hrow(["Combinación", "Regla", "Ejemplos"], scColW),
    row([
      cell("/sk/", { width: scColW[0], bold: true, fill: LTEAL, color: TEAL }),
      cell("SC ante A, O, U o consonante → /sk/ como en 'escuchar'", { width: scColW[1] }),
      cell("scuola, disco, scarpa, schiena", { width: scColW[2], italic: true })
    ]),
    row([
      cell("/ʃ/", { width: scColW[0], bold: true, fill: LGREEN, color: GREEN }),
      cell("SC ante E, I → /ʃ/ como la 'sh' inglesa o la 'll' porteña", { width: scColW[1] }),
      cell("scena, pesce, uscire, lasciare", { width: scColW[2], italic: true })
    ]),
    row([
      cell("SCH", { width: scColW[0], bold: true }),
      cell("SCH ante E, I → siempre /sk/ (la H protege el sonido duro)", { width: scColW[1] }),
      cell("scheda, schema, schiavo, maschio", { width: scColW[2], italic: true })
    ])
  ]
}));
ch.push(p(""));
ch.push(note("Practicá con palabras del módulo: conoscere /ʃ/ · capisce /ʃ/ · fresco /sk/ · lavorisco /sk/"));
ch.push(p(""));

// ── Ejercicios Descubrimiento ─────────────────────────────────────────────
ch.push(h2("Ejercicio 1 (Descubrimiento)  ·  ¿Qué profesión es?"));
ch.push(p("Elegí la opción correcta para cada descripción:"));
ch.push(p(""));
const profEjColW = [3600, 2400, 3360];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: profEjColW,
  rows: [
    hrow(["Descripción", "Respuesta ✓", "Justificación"], profEjColW),
    row([
      cell("Lavora in ospedale e cura i malati. È...", { width: profEjColW[0] }),
      cell("il medico ✓", { width: profEjColW[1], fill: LGREEN, bold: true, color: GREEN }),
      cell("medico = médico. Trabaja en hospital y cura enfermos — definición exacta.", { width: profEjColW[2], italic: true })
    ]),
    row([
      cell("Insegna ai bambini a leggere e scrivere. È...", { width: profEjColW[0] }),
      cell("l'insegnante ✓", { width: profEjColW[1], fill: LGREEN, bold: true, color: GREEN }),
      cell("insegnante = docente/maestro/a. Enseñar a leer y escribir = función del maestro de primaria.", { width: profEjColW[2], italic: true })
    ]),
    row([
      cell("Porta il cibo ai clienti al ristorante. È...", { width: profEjColW[0] }),
      cell("il cameriere ✓", { width: profEjColW[1], fill: LGREEN, bold: true, color: GREEN }),
      cell("cameriere = mozo/camarero. Lleva la comida a los clientes en el restaurante.", { width: profEjColW[2], italic: true })
    ])
  ]
}));
ch.push(p(""));

ch.push(h2("Ejercicio 2 (Descubrimiento)  ·  I colori — ¿De qué color es?"));
ch.push(p("Asociá el color correcto (respuestas con justificación):"));
ch.push(p(""));
const colorEjColW = [3200, 2400, 3760];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: colorEjColW,
  rows: [
    hrow(["Pregunta", "Respuesta ✓", "Justificación"], colorEjColW),
    row([
      cell("La bandiera italiana è verde, ___ e rossa.", { width: colorEjColW[0] }),
      cell("bianca ✓", { width: colorEjColW[1], fill: LGREEN, bold: true, color: GREEN }),
      cell("La bandera italiana es verde, BLANCA y roja (tricolor). bianca = blanca (fem., concuerda con bandiera).", { width: colorEjColW[2], italic: true })
    ]),
    row([
      cell("Il cielo di notte è ___.", { width: colorEjColW[0] }),
      cell("nero ✓", { width: colorEjColW[1], fill: LGREEN, bold: true, color: GREEN }),
      cell("El cielo de noche es negro. nero = negro (masc., concuerda con cielo).", { width: colorEjColW[2], italic: true })
    ]),
    row([
      cell("L'erba del parco è ___.", { width: colorEjColW[0] }),
      cell("verde ✓", { width: colorEjColW[1], fill: LGREEN, bold: true, color: GREEN }),
      cell("El pasto/hierba es verde. verde es invariable (no cambia entre M y F).", { width: colorEjColW[2], italic: true })
    ])
  ]
}));
ch.push(p(""));

// ── Lectura cultural ──────────────────────────────────────────────────────
ch.push(h2("🇮🇹  Il lavoro in Italia — lectura cultural"));
ch.push(p("In Italia, il lavoro è spesso parte dell'identità personale. Quando gli italiani si presentano, spesso dicono \"Faccio il medico\" o \"Sono insegnante\" — il lavoro definisce chi sei."));
ch.push(p("Traducción: En Italia, el trabajo es muchas veces parte de la identidad personal. Cuando los italianos se presentan, suelen decir \"Soy médico\" o \"Soy docente\" — el trabajo define quién sos."));
ch.push(p("Il mercato del lavoro italiano è complesso: da un lato ci sono grandi aziende e professioni prestigiose, dall'altro molti giovani faticano a trovare lavoro stabile. Il Centro per l'Impiego aiuta i disoccupati a cercare lavoro e a ricevere sussidi. Per gli stranieri, avere il permesso di soggiorno è essenziale per lavorare legalmente in Italia."));
ch.push(p("Traducción: El mercado laboral italiano es complejo: por un lado hay grandes empresas y profesiones prestigiosas, por el otro muchos jóvenes tienen dificultades para encontrar trabajo estable. El Centro per l'Impiego ayuda a los desocupados a buscar trabajo y recibir subsidios. Para los extranjeros, tener el permeso di soggiorno es esencial para trabajar legalmente en Italia."));
ch.push(p(""));

// ══════════════════════════════════════════════════════════════════════════
// ETAPA 3 — GRAMÁTICA
// ══════════════════════════════════════════════════════════════════════════
ch.push(pageBreak());
ch.push(h1("ETAPA 3  ·  GRAMÁTICA"));
ch.push(pMixed([
  { text: "Artículos determinativos · Verbos en -isco · FARE · Concordanza", bold: true }
]));
ch.push(p(""));

// ── 1. Artículos determinativos ───────────────────────────────────────────
ch.push(h2("1  ·  Gli articoli determinativi — Los artículos determinados"));
ch.push(p("Equivalente a \"el, la, los, las\" en español. En italiano hay 7 formas distintas según género, número y letra inicial:"));
ch.push(p(""));
const artColW = [1200, 2000, 3000, 3160];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: artColW,
  rows: [
    hrow(["Número", "Artículo", "Cuándo usarlo", "Ejemplos"], artColW),
    row([cell("Singular M", { width: artColW[0] }), cell("il", { width: artColW[1], bold: true, italic: true }), cell("masc. + consonante común", { width: artColW[2] }), cell("il medico, il cuoco, il lavoro", { width: artColW[3], italic: true })]),
    row([cell("Singular M", { width: artColW[0] }), cell("lo", { width: artColW[1], bold: true, italic: true }), cell("masc. + s+cons., z, gn, ps, x", { width: artColW[2] }), cell("lo studente, lo zaino, lo gnocco", { width: artColW[3], italic: true })]),
    row([cell("Singular F", { width: artColW[0] }), cell("la", { width: artColW[1], bold: true, italic: true }), cell("fem. + consonante", { width: artColW[2] }), cell("la cuoca, la dottoressa, la sera", { width: artColW[3], italic: true })]),
    row([cell("Sing. M/F vocal", { width: artColW[0] }), cell("l'", { width: artColW[1], bold: true, italic: true }), cell("masc. o fem. + vocal", { width: artColW[2] }), cell("l'ingegnere, l'avvocato, l'infermiera", { width: artColW[3], italic: true })]),
    row([cell("Plural M", { width: artColW[0] }), cell("i", { width: artColW[1], bold: true, italic: true }), cell("plural de il", { width: artColW[2] }), cell("i medici, i cuochi, i treni", { width: artColW[3], italic: true })]),
    row([cell("Plural M", { width: artColW[0] }), cell("gli", { width: artColW[1], bold: true, italic: true }), cell("plural de lo y l' (masc.)", { width: artColW[2] }), cell("gli studenti, gli ingegneri, gli uomini", { width: artColW[3], italic: true })]),
    row([cell("Plural F", { width: artColW[0] }), cell("le", { width: artColW[1], bold: true, italic: true }), cell("plural de la y l' (fem.)", { width: artColW[2] }), cell("le cuoche, le insegnanti, le donne", { width: artColW[3], italic: true })])
  ]
}));
ch.push(p(""));
ch.push(h3("Ejercicio 1  ·  Elegí el artículo correcto (il / lo / la / l' / i / gli / le)"));
ch.push(p(""));
const ej1ColW = [3200, 2000, 4160];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: ej1ColW,
  rows: [
    hrow(["Sustantivo", "Artículo ✓", "Regla aplicada"], ej1ColW),
    row([cell("___ avvocato (sing. masc., empieza con vocal)", { width: ej1ColW[0] }), cell("l'avvocato ✓", { width: ej1ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("vocal → l' (masc. o fem.)", { width: ej1ColW[2], italic: true })]),
    row([cell("___ studenti (plural, s+consonante → erano 'lo')", { width: ej1ColW[0] }), cell("gli studenti ✓", { width: ej1ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("plural de lo → gli", { width: ej1ColW[2], italic: true })]),
    row([cell("___ infermiera (sing. fem., empieza con vocal)", { width: ej1ColW[0] }), cell("l'infermiera ✓", { width: ej1ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("vocal → l' (masc. o fem.)", { width: ej1ColW[2], italic: true })]),
    row([cell("___ cuoche (plural femenino de la cuoca)", { width: ej1ColW[0] }), cell("le cuoche ✓", { width: ej1ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("plural de la → le", { width: ej1ColW[2], italic: true })])
  ]
}));
ch.push(p(""));
ch.push(h3("Ejercicio 2  ·  Completá con el artículo correcto"));
ch.push(p(""));
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: ej1ColW,
  rows: [
    hrow(["Oración", "Artículo ✓", "Regla aplicada"], ej1ColW),
    row([cell("___ medico lavora in ospedale. (masc., consonante)", { width: ej1ColW[0] }), cell("Il medico ✓", { width: ej1ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("masc. + consonante → il", { width: ej1ColW[2], italic: true })]),
    row([cell("___ insegnanti sono brave. (fem. plural)", { width: ej1ColW[0] }), cell("Le insegnanti ✓", { width: ej1ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("fem. plural → le", { width: ej1ColW[2], italic: true })]),
    row([cell("Conosco ___ avvocato di mia madre. (masc., vocal)", { width: ej1ColW[0] }), cell("l'avvocato ✓", { width: ej1ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("vocal → l'", { width: ej1ColW[2], italic: true })]),
    row([cell("___ zaino di Marco è rosso. (masc., z)", { width: ej1ColW[0] }), cell("Lo zaino ✓", { width: ej1ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("z → lo (igual que los que empiezan en s+cons.)", { width: ej1ColW[2], italic: true })])
  ]
}));
ch.push(p(""));

// ── 2. Verbos -isco ───────────────────────────────────────────────────────
ch.push(h2("2  ·  Verbi in -isco — Verbos con morfema -ISC-"));
ch.push(p("Algunos verbos de la 3ª conjugación (-ire) insertan -ISC- en las formas del singular (io, tu, lui/lei) y en la 3ª persona plural (loro). Las formas noi y voi son regulares."));
ch.push(p(""));
const iscColW = [2000, 2000, 2000, 3360];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: iscColW,
  rows: [
    hrow(["Pronombre", "CAPIRE", "FINIRE", "PREFERIRE"], iscColW),
    row([cell("io",       { width: iscColW[0], bold: true }), cell("capisco",     { width: iscColW[1], italic: true }), cell("finisco",     { width: iscColW[2], italic: true }), cell("preferisco",     { width: iscColW[3], italic: true })]),
    row([cell("tu",       { width: iscColW[0], bold: true }), cell("capisci",     { width: iscColW[1], italic: true }), cell("finisci",     { width: iscColW[2], italic: true }), cell("preferisci",     { width: iscColW[3], italic: true })]),
    row([cell("lui / lei",{ width: iscColW[0], bold: true }), cell("capisce",     { width: iscColW[1], italic: true }), cell("finisce",     { width: iscColW[2], italic: true }), cell("preferisce",     { width: iscColW[3], italic: true })]),
    row([cell("noi ★",   { width: iscColW[0], bold: true }), cell("capiamo",     { width: iscColW[1], italic: true }), cell("finiamo",     { width: iscColW[2], italic: true }), cell("preferiamo",     { width: iscColW[3], italic: true })]),
    row([cell("voi ★",   { width: iscColW[0], bold: true }), cell("capite",      { width: iscColW[1], italic: true }), cell("finite",      { width: iscColW[2], italic: true }), cell("preferite",      { width: iscColW[3], italic: true })]),
    row([cell("loro",     { width: iscColW[0], bold: true }), cell("capiscono",   { width: iscColW[1], italic: true }), cell("finiscono",   { width: iscColW[2], italic: true }), cell("preferiscono",   { width: iscColW[3], italic: true })])
  ]
}));
ch.push(note("★ noi y voi son regulares (sin -isc-). El patrón es predecible: si aprendés uno, podés conjugar todos estos verbos."));
ch.push(p(""));
ch.push(h3("Ejercicio 3  ·  Completá con el verbo correcto"));
const ej3ColW = [3200, 2400, 3760];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: ej3ColW,
  rows: [
    hrow(["Oración", "Respuesta ✓", "Justificación"], ej3ColW),
    row([cell("Io non ___ bene l'inglese. (capire)", { width: ej3ColW[0] }), cell("capisco ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("io + -isco → capisco", { width: ej3ColW[2], italic: true })]),
    row([cell("Lei ___ il lavoro alle sei. (finire)", { width: ej3ColW[0] }), cell("finisce ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("lei + -isce → finisce", { width: ej3ColW[2], italic: true })]),
    row([cell("Noi ___ lavorare di mattina. (preferire)", { width: ej3ColW[0] }), cell("preferiamo ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("noi = forma regular (sin -isc-) → preferiamo", { width: ej3ColW[2], italic: true })]),
    row([cell("I bambini ___ subito! (capire)", { width: ej3ColW[0] }), cell("capiscono ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("loro + -iscono → capiscono", { width: ej3ColW[2], italic: true })]),
    row([cell("Voi ___ a che ora? (finire)", { width: ej3ColW[0] }), cell("finite ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("voi = forma regular (sin -isc-) → finite", { width: ej3ColW[2], italic: true })])
  ]
}));
ch.push(p(""));
ch.push(h3("Ejercicio 4  ·  ¿Cuál es correcto? (verbos -isco)"));
smItems([
  {
    n: 1, q: "Tu ___ il problema? (capire)",
    opts: [
      { text: "capisce", ok: false },
      { text: "capisci", ok: true },
      { text: "capisco", ok: false }
    ],
    j: "tu → siempre termina en -i en los verbos -isc-: capisci. capisce = lui/lei; capisco = io."
  },
  {
    n: 2, q: "Loro ___ di lavorare il sabato. (preferire)",
    opts: [
      { text: "preferisce", ok: false },
      { text: "preferiamo", ok: false },
      { text: "preferiscono", ok: true }
    ],
    j: "loro → -iscono: preferiscono. preferisce = lui/lei; preferiamo = noi."
  },
  {
    n: 3, q: "Noi ___ il corso tra una settimana. (finire)",
    opts: [
      { text: "finiamo", ok: true },
      { text: "finiscono", ok: false },
      { text: "finite", ok: false }
    ],
    j: "noi es forma REGULAR (sin -isc-): finiamo. finiscono = loro; finite = voi."
  }
]).forEach(el => ch.push(el));
ch.push(p(""));

// ── 3. FARE ───────────────────────────────────────────────────────────────
ch.push(h2("3  ·  Il verbo FARE — presente indicativo"));
ch.push(p("Verbo irregular fundamental — uno de los más usados del italiano:"));
ch.push(p(""));
const fareConj = [1600, 1600, 2400, 3760];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: fareConj,
  rows: [
    hrow(["Pronombre", "FARE", "Traducción AR", "Usos / ejemplos"], fareConj),
    row([cell("io",       { width: fareConj[0], bold: true }), cell("faccio",  { width: fareConj[1], italic: true }), cell("hago",    { width: fareConj[2] }), cell("Faccio il medico. / Faccio colazione.", { width: fareConj[3], italic: true })]),
    row([cell("tu",       { width: fareConj[0], bold: true }), cell("fai",     { width: fareConj[1], italic: true }), cell("hacés",   { width: fareConj[2] }), cell("Che lavoro fai?", { width: fareConj[3], italic: true })]),
    row([cell("lui / lei",{ width: fareConj[0], bold: true }), cell("fa",      { width: fareConj[1], italic: true }), cell("hace",    { width: fareConj[2] }), cell("Fa la cuoca. / Non fa niente.", { width: fareConj[3], italic: true })]),
    row([cell("noi",      { width: fareConj[0], bold: true }), cell("facciamo",{ width: fareConj[1], italic: true }), cell("hacemos", { width: fareConj[2] }), cell("Facciamo una pausa!", { width: fareConj[3], italic: true })]),
    row([cell("voi",      { width: fareConj[0], bold: true }), cell("fate",    { width: fareConj[1], italic: true }), cell("hacéis",  { width: fareConj[2] }), cell("Cosa fate nel tempo libero?", { width: fareConj[3], italic: true })]),
    row([cell("loro",     { width: fareConj[0], bold: true }), cell("fanno",   { width: fareConj[1], italic: true }), cell("hacen",   { width: fareConj[2] }), cell("Fanno i cuochi. / Fanno una riunione.", { width: fareConj[3], italic: true })])
  ]
}));
ch.push(p(""));
ch.push(note("Fórmula clave: FARE + articolo + professione = Faccio il cuoco / Faccio la parrucchiera / Fa l'avvocato. También: ESSERE + professione (sin artículo): Sono medico. Sei infermiera."));
ch.push(p(""));
ch.push(h3("Ejercicio 5  ·  Completá con FARE"));
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: ej3ColW,
  rows: [
    hrow(["Oración", "Respuesta ✓", "Justificación"], ej3ColW),
    row([cell("Io ___ il cameriere in un ristorante.", { width: ej3ColW[0] }), cell("faccio ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("io → faccio (forma irregular)", { width: ej3ColW[2], italic: true })]),
    row([cell("Che lavoro ___ tuo fratello?", { width: ej3ColW[0] }), cell("fa ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("lui/lei → fa (3ª persona singular)", { width: ej3ColW[2], italic: true })]),
    row([cell("Voi ___ i programmatori?", { width: ej3ColW[0] }), cell("fate ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("voi → fate", { width: ej3ColW[2], italic: true })]),
    row([cell("Loro ___ i cuochi nel ristorante di famiglia.", { width: ej3ColW[0] }), cell("fanno ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("loro → fanno (forma irregular)", { width: ej3ColW[2], italic: true })]),
    row([cell("Noi ___ colazione insieme ogni mattina.", { width: ej3ColW[0] }), cell("facciamo ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("noi → facciamo", { width: ej3ColW[2], italic: true })])
  ]
}));
ch.push(p(""));
ch.push(h3("Ejercicio 6  ·  FARE o ESSERE — ¿cuál usarías?"));
smItems([
  {
    n: 1, q: "Para decir \"Soy abogada\" usando FARE...",
    opts: [
      { text: "Sono avvocatessa.", ok: false },
      { text: "Faccio l'avvocatessa.", ok: true }
    ],
    j: "Con FARE la estructura es: faccio + l' + avvocatessa. Sono avvocatessa es con ESSERE (sin artículo) — ambas correctas, pero el ejercicio pide FARE."
  },
  {
    n: 2, q: "\"Él trabaja como mecánico\" con FARE es...",
    opts: [
      { text: "Fa il meccanico.", ok: true },
      { text: "Lavora come meccanico.", ok: false },
      { text: "È meccanico.", ok: false }
    ],
    j: "Fa il meccanico = hace de mecánico (usa FARE + il + professione). Las otras opciones son correctas gramaticalmente pero no usan FARE."
  }
]).forEach(el => ch.push(el));
ch.push(p(""));

// ── 4. Concordanza ─────────────────────────────────────────────────────────
ch.push(h2("4  ·  Concordanza articolo-nome-aggettivo"));
ch.push(p("En italiano, el artículo, el sustantivo y el adjetivo deben concordar en género y número — ¡los tres juntos!"));
ch.push(p(""));
const concColW = [2400, 2400, 4560];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: concColW,
  rows: [
    hrow(["Caso", "Ejemplo", "Patrón"], concColW),
    row([cell("Masc. sing.", { width: concColW[0] }), cell("il medico bravo", { width: concColW[1], italic: true }), cell("artículo M sg + sustantivo M + adjetivo M sg", { width: concColW[2] })]),
    row([cell("Fem. sing.", { width: concColW[0] }), cell("la cuoca brava", { width: concColW[1], italic: true }), cell("artículo F sg + sustantivo F + adjetivo F sg", { width: concColW[2] })]),
    row([cell("Masc. pl.", { width: concColW[0] }), cell("i medici bravi", { width: concColW[1], italic: true }), cell("artículo M pl + sustantivo M pl + adjetivo M pl", { width: concColW[2] })]),
    row([cell("Fem. pl.", { width: concColW[0] }), cell("le cuoche brave", { width: concColW[1], italic: true }), cell("artículo F pl + sustantivo F pl + adjetivo F pl", { width: concColW[2] })])
  ]
}));
ch.push(p(""));
ch.push(note("Adjetivos invariables M/F: gentile, grande, intelligente, interessante — solo cambian en el plural (-i). Adjetivos con dos formas: bravo/brava, italiano/italiana, rosso/rossa."));
ch.push(p(""));
ch.push(h3("Ejercicio 7  ·  Completá la concordanza"));
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: ej3ColW,
  rows: [
    hrow(["Oración", "Adjetivo ✓", "Regla"], ej3ColW),
    row([cell("La parrucchiera è molto ___ (bravo). [fem. sing.]", { width: ej3ColW[0] }), cell("brava ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("la parrucchiera es femenino singular → brava", { width: ej3ColW[2], italic: true })]),
    row([cell("Gli ingegneri sono molto ___ (intelligente). [masc. pl.]", { width: ej3ColW[0] }), cell("intelligenti ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("intelligente es 'invariable' en sing. pero hace -i en plural → intelligenti", { width: ej3ColW[2], italic: true })]),
    row([cell("Il cameriere porta una camicia ___ (bianco). [camicia = fem. sing.]", { width: ej3ColW[0] }), cell("bianca ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("camicia = fem. sing. → bianca (concuerda con camicia, no con cameriere)", { width: ej3ColW[2], italic: true })]),
    row([cell("Le avvocatesse sono molto ___ (preparato). [fem. pl.]", { width: ej3ColW[0] }), cell("preparate ✓", { width: ej3ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("le avvocatesse = fem. plural → preparate", { width: ej3ColW[2], italic: true })])
  ]
}));
ch.push(p(""));
ch.push(h3("Ejercicio 8  ·  ¿Cuál es la frase correcta?"));
smItems([
  {
    n: 1, q: "\"El mecánico nuevo\" en italiano es...",
    opts: [
      { text: "il meccanico nuova", ok: false },
      { text: "il meccanico nuovo", ok: true },
      { text: "i meccanici nuovo", ok: false }
    ],
    j: "il meccanico es masc. sing. → el adjetivo debe ser masc. sing. → nuovo. nuova sería fem. y i meccanici sería plural."
  },
  {
    n: 2, q: "\"Las enfermeras italianas\" es...",
    opts: [
      { text: "le infermiere italiana", ok: false },
      { text: "le infermiere italiano", ok: false },
      { text: "le infermiere italiane", ok: true }
    ],
    j: "le infermiere = artículo F pl + sustantivo F pl → el adjetivo debe ser fem. pl. → italiane. italiana = sing., italiano = masc."
  },
  {
    n: 3, q: "Para describir \"una abogada seria\" se dice...",
    opts: [
      { text: "un'avvocatessa seria", ok: true },
      { text: "un'avvocatessa serio", ok: false },
      { text: "un'avvocatessa seri", ok: false }
    ],
    j: "avvocatessa = fem. sing. → el adjetivo concuerda: seria (fem. sing.). serio = masc. sing.; seri = masc. pl."
  }
]).forEach(el => ch.push(el));
ch.push(p(""));

// ── Set integrador ─────────────────────────────────────────────────────────
ch.push(h2("Set integrador — Tutto insieme!"));
ch.push(p("Estos ejercicios mezclan artículos, verbos -isco, FARE y concordanza. ¡Es el momento de mostrar todo lo que aprendiste!"));
ch.push(p(""));
ch.push(h3("Ejercicio 9  ·  Completá el párrafo"));
ch.push(p("\"Mi chiamo Lucia e faccio ___ infermiera. Lavoro in un ospedale ___ (grande). I miei colleghi sono ___ (bravo, pl.). Io ___ (preferire) lavorare di mattina. Il turno di notte ___ (finire) alle otto.\""));
ch.push(p(""));
const ej9ColW = [2400, 2400, 4560];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: ej9ColW,
  rows: [
    hrow(["Espacio", "Respuesta ✓", "Justificación"], ej9ColW),
    row([cell("faccio ___ infermiera", { width: ej9ColW[0] }), cell("l'infermiera ✓", { width: ej9ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("FARE + l' + infermiera (vocal → l')", { width: ej9ColW[2], italic: true })]),
    row([cell("un ospedale ___ (grande)", { width: ej9ColW[0] }), cell("grande ✓", { width: ej9ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("grande es invariable en sing. (no cambia M/F)", { width: ej9ColW[2], italic: true })]),
    row([cell("colleghi sono ___ (bravo, pl.)", { width: ej9ColW[0] }), cell("bravi ✓", { width: ej9ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("colleghi = masc. plural → bravi (pl. masc.)", { width: ej9ColW[2], italic: true })]),
    row([cell("Io ___ (preferire)", { width: ej9ColW[0] }), cell("preferisco ✓", { width: ej9ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("io + preferire (verbo -isco) → preferisco", { width: ej9ColW[2], italic: true })]),
    row([cell("Il turno di notte ___ (finire)", { width: ej9ColW[0] }), cell("finisce ✓", { width: ej9ColW[1], fill: LGREEN, bold: true, color: GREEN }), cell("lui (il turno) + finire → finisce", { width: ej9ColW[2], italic: true })])
  ]
}));
ch.push(p(""));
ch.push(h3("Ejercicio 10  ·  Preguntas y respuestas sobre trabajo"));
smItems([
  {
    n: 1, q: "\"Che lavoro fai?\" — ¿Cuál es una respuesta correcta?",
    opts: [
      { text: "Faccio lavorare.", ok: false },
      { text: "Faccio il cuoco.", ok: true },
      { text: "Io lavoro cuoco.", ok: false }
    ],
    j: "La estructura correcta es FARE + il + professione: Faccio il cuoco. «Faccio lavorare» significa 'hago trabajar' (causativo). «Io lavoro cuoco» no es correcto gramaticalmente."
  },
  {
    n: 2, q: "\"Preferisci lavorare la mattina o la sera?\" — ¿Cuál es gramaticalmente correcta?",
    opts: [
      { text: "Io preferio la mattina.", ok: false },
      { text: "Preferisco la mattina.", ok: true },
      { text: "Preferite la mattina.", ok: false }
    ],
    j: "preferisco = io (verbo -isco, 1ª persona). preferio no existe en italiano. preferite = voi (plural)."
  },
  {
    n: 3, q: "¿Cuál de estas frases tiene concordanza correcta?",
    opts: [
      { text: "il infermiera brava", ok: false },
      { text: "la ingegnere bravo", ok: false },
      { text: "l'infermiera brava", ok: true }
    ],
    j: "l'infermiera brava ✓: l' (fem. vocal) + infermiera (fem. sing.) + brava (fem. sing.) — todo concuerda. il infermiera usa artículo masc. para sustantivo fem. La ingegnere bravo mezcla fem. con adjetivo masc."
  }
]).forEach(el => ch.push(el));
ch.push(p(""));

// ── Il dialogo completo ───────────────────────────────────────────────────
ch.push(h2("Il dialogo completo — Giulia e Marco parlano di lavoro"));
ch.push(p("Seguí la conversación entre Giulia (Roma) y Marco (Milano) sobre sus trabajos. En la versión digital hay audio para cada línea:"));
ch.push(p(""));
const dialColW = [1200, 8160];
ch.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: dialColW,
  rows: [
    hrow(["", "Línea del diálogo"], dialColW),
    row([cell("Giulia", { width: dialColW[0], bold: true, fill: LTEAL }), cell("Ciao Marco! Che lavoro fai?", { width: dialColW[1], italic: true })]),
    row([cell("Marco",  { width: dialColW[0], bold: true }), cell("Faccio il programmatore. E tu?", { width: dialColW[1], italic: true })]),
    row([cell("Giulia", { width: dialColW[0], bold: true, fill: LTEAL }), cell("Faccio l'insegnante. Insegno italiano.", { width: dialColW[1], italic: true })]),
    row([cell("Marco",  { width: dialColW[0], bold: true }), cell("Che bello! Ti piace?", { width: dialColW[1], italic: true })]),
    row([cell("Giulia", { width: dialColW[0], bold: true, fill: LTEAL }), cell("Sì, molto. Mi piacciono i bambini. E il tuo lavoro?", { width: dialColW[1], italic: true })]),
    row([cell("Marco",  { width: dialColW[0], bold: true }), cell("È interessante ma a volte è stressante.", { width: dialColW[1], italic: true })]),
    row([cell("Giulia", { width: dialColW[0], bold: true, fill: LTEAL }), cell("Capisco. Anch'io finisco tardi spesso.", { width: dialColW[1], italic: true })]),
    row([cell("Marco",  { width: dialColW[0], bold: true }), cell("A che ora finisci di solito?", { width: dialColW[1], italic: true })]),
    row([cell("Giulia", { width: dialColW[0], bold: true, fill: LTEAL }), cell("Finisco alle cinque e mezza.", { width: dialColW[1], italic: true })]),
    row([cell("Marco",  { width: dialColW[0], bold: true }), cell("Preferisci lavorare di mattina o di pomeriggio?", { width: dialColW[1], italic: true })]),
    row([cell("Giulia", { width: dialColW[0], bold: true, fill: LTEAL }), cell("Preferisco la mattina. Sono più produttiva.", { width: dialColW[1], italic: true })])
  ]
}));
ch.push(p(""));
ch.push(note("Este diálogo integra: FARE (faccio, fa), verbos -isco (finisco, finisci, finisce, preferisco, preferisci, capisco), artículos y concordanza. ¡Buscá cada forma mientras lees!"));
ch.push(p(""));

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
    children: ch
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("D:/proyectos/italianoperpiacere/entregablesFinales/A1/modulo_5/modulo5_formateado.docx", buf);
  console.log("OK: modulo5_formateado.docx generado");
}).catch(e => { console.error("ERROR:", e.message); process.exit(1); });
