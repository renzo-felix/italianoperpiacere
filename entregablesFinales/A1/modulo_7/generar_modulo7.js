const path = require("path");
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign, PageBreak
} = require("C:/Users/Renzo/AppData/Roaming/npm/node_modules/docx");

const TEAL = "2E6B7B"; const LTEAL = "D6EAF0"; const GREEN = "1E7A3C";
const LGREEN = "D5F5E3"; const LRED = "FAD7D7"; const LGRAY = "F2F2F2";
const YELLOW = "FFF9C4"; const NAVY = "1F3864"; const BLACK = "000000";
const FONT = "Arial"; const PW = 9360;

const brd = (c = "CCCCCC") => ({ style: BorderStyle.SINGLE, size: 4, color: c });
const brd0 = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const borders = () => ({ top: brd(), bottom: brd(), left: brd(), right: brd() });
const noBorders = () => ({ top: brd0, bottom: brd0, left: brd0, right: brd0 });

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before ?? 60, after: opts.after ?? 60 },
    children: [new TextRun({ text, font: FONT, size: opts.size ?? 22, bold: opts.bold ?? false, italics: opts.italic ?? false, color: opts.color ?? BLACK })],
  });
}
function blank() { return new Paragraph({ children: [new TextRun("")] }); }
function pgBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function banner(lines, fill) {
  return new Table({
    width: { size: PW, type: WidthType.DXA }, columnWidths: [PW],
    borders: { top: brd0, bottom: brd0, left: brd0, right: brd0, insideH: brd0, insideV: brd0 },
    rows: [new TableRow({ children: [new TableCell({
      borders: noBorders(), shading: { fill, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      width: { size: PW, type: WidthType.DXA }, children: lines,
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
  return banner(lines.map(l => new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: l, font: FONT, size: 20, color: textColor })] })), fill);
}

function tc(text, width, fill, bold = false, color = BLACK, italic = false) {
  return new TableCell({ borders: borders(), shading: { fill, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, width: { size: width, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: 19, bold, color, italics: italic })] })] });
}
function tcIta(text, width, fill = "FFFFFF") {
  return new TableCell({ borders: borders(), shading: { fill, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, width: { size: width, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: 20, bold: true, color: NAVY })] })] });
}

function feedbackTable(rows) {
  const w = [3600, 1400, 4360];
  return new Table({
    width: { size: PW, type: WidthType.DXA }, columnWidths: w,
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: [
      new TableRow({ children: [tc("Pregunta / Enunciado", w[0], LTEAL, true), tc("Resp. correcta", w[1], LTEAL, true), tc("Feedback al alumno", w[2], LTEAL, true)] }),
      ...rows.map(r => new TableRow({ children: [tc(r.q, w[0], "FFFFFF"), tc(r.a, w[1], LGREEN), tc(r.f, w[2], LGRAY)] })),
    ],
  });
}

function vocabTable(items) {
  const cw = PW / 2;
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const sl = items.slice(i, i + 2); while (sl.length < 2) sl.push(["", ""]);
    rows.push(new TableRow({ children: sl.map(([ita, esp]) => new TableCell({ borders: borders(), shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: cw, type: WidthType.DXA }, children: [new Paragraph({ spacing: { before: 20, after: 10 }, children: [new TextRun({ text: ita, font: FONT, size: 22, bold: true, color: NAVY })] }), new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: esp, font: FONT, size: 19, color: "666666" })] })] })) }));
  }
  return new Table({ width: { size: PW, type: WidthType.DXA }, columnWidths: [cw, cw], borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() }, rows });
}

function conjTable(verb, pairs) {
  const w = [1200, 2800, 5360];
  return new Table({
    width: { size: PW, type: WidthType.DXA }, columnWidths: w,
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: [
      new TableRow({ children: [tc("Pronombre", w[0], NAVY, true, "FFFFFF"), tc(verb, w[1], NAVY, true, "FFFFFF"), tc("Ejemplo / Traducción", w[2], NAVY, true, "FFFFFF")] }),
      ...pairs.map(([pro, form, tra]) => new TableRow({ children: [tc(pro, w[0], LGRAY), tcIta(form, w[1]), tc(tra, w[2], "FFFFFF", false, "666666")] })),
    ],
  });
}

function dialogTable(lines) {
  const w = [1600, 7760];
  return new Table({
    width: { size: PW, type: WidthType.DXA }, columnWidths: w,
    borders: { top: brd0, bottom: brd0, left: brd0, right: brd0, insideH: brd(), insideV: brd0 },
    rows: lines.map(([sp, ita, esp]) => new TableRow({ children: [
      new TableCell({ borders: { top: brd0, bottom: brd(), left: brd0, right: brd0 }, shading: { fill: LTEAL, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, width: { size: w[0], type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: sp, font: FONT, size: 19, bold: true, color: NAVY })] })] }),
      new TableCell({ borders: { top: brd0, bottom: brd(), left: brd0, right: brd0 }, shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, width: { size: w[1], type: WidthType.DXA }, children: [new Paragraph({ spacing: { before: 20, after: 10 }, children: [new TextRun({ text: ita, font: FONT, size: 20, bold: true, color: NAVY })] }), ...(esp ? [new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: esp, font: FONT, size: 18, italics: true, color: "666666" })] })] : [])] }),
    ]})),
  });
}

function twoCol(rows, w1 = 3500, w2 = 5860) {
  return new Table({
    width: { size: PW, type: WidthType.DXA }, columnWidths: [w1, w2],
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: rows.map(([a, b]) => new TableRow({ children: [
      new TableCell({ borders: borders(), shading: { fill: LTEAL, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, width: { size: w1, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: a, font: FONT, size: 20, bold: true, color: NAVY })] })] }),
      new TableCell({ borders: borders(), shading: { fill: "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, width: { size: w2, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: b, font: FONT, size: 20, color: "444444" })] })] }),
    ]})),
  });
}

// ══════════════════════════════════════════════════════════════════════════════
const ch = [];

// PORTADA
ch.push(
  blank(), blank(),
  p("Italiano per Piacere", { size: 20, color: TEAL, align: AlignmentType.CENTER }),
  p("A1 — Módulo 6", { size: 20, color: "888888", align: AlignmentType.CENTER }),
  blank(),
  p("Módulo 6", { size: 52, bold: true, color: NAVY, align: AlignmentType.CENTER }),
  p("La mia giornata", { size: 36, bold: true, color: TEAL, align: AlignmentType.CENTER }),
  p("Verbos reflexivos · Rutina diaria · Partes del día", { size: 22, italic: true, color: "555555", align: AlignmentType.CENTER }),
  blank(),
  infoBanner([
    "ESTRUCTURA DEL MÓDULO",
    "",
    "  ETAPA 1 · Exploración    — Video: La mia giornata + V/F y selección múltiple",
    "  ETAPA 2 · Descubrimiento — Vocabulario reflexivo, días, diálogo, anche/neanche, fonética",
    "  ETAPA 3 · Gramática      — Verbos reflexivos · Artículos con días · Posesivos · Anche/Neanche",
    "  ETAPA 4 · Ejercicios     — Repaso interactivo (Genially)",
  ]),
  blank(),
  p("Documento de presentación — incluye feedback de todos los ejercicios interactivos", { size: 18, italic: true, color: "888888", align: AlignmentType.CENTER }),
  pgBreak(),
);

// ══ ETAPA 1 ══════════════════════════════════════════════════════════════════
ch.push(
  stageBanner("ETAPA 1", "Exploración"),
  blank(),
  p("La mia giornata  ·  Verbos reflexivos · Rutina diaria · Partes del día", { italic: true, color: TEAL }),
  blank(),
  infoBanner([
    "Mientras ves el video, prestá atención a:",
    "  • Verbos reflexivos — escuchá frases con mi, ti, si antes del verbo (mi sveglio, si alza)",
    "  • Rutina del día — ¿qué hace Giovanni por la mañana? ¿y Sofia?",
    "  • Partes del día — la mattina · il pomeriggio · la sera · la notte",
    "  • Fin de semana — ¿cambia la rutina el sábado y domingo?",
    "  • Frecuencia — ¿escuchás: sempre, spesso, a volte?",
  ], LGREEN, GREEN),
  blank(),
  p("▶  Video: «La mia giornata» — youtube.com/embed/-ECZVRh6sgk", { italic: true, color: "888888" }),
  blank(),
  new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [new TextRun({ text: "Ejercicio 1 — Verdadero o Falso", font: FONT, size: 26, bold: true, color: TEAL })],
  }),
  p("Leé cada afirmación y decidí si es Verdadero (V) o Falso (F) según el video.", { italic: true }),
  blank(),
  feedbackTable([
    { q: "Giovanni se despierta a las 7 de la mañana.", a: "V", f: "¡Exacto! Giovanni dice que di solito si sveglia alle sette." },
    { q: "En el video se menciona la rutina del fin de semana.", a: "V", f: "¡Correcto! Hablan del weekend: el mercado, el parque, los amigos..." },
    { q: "Giovanni nunca trabaja desde casa.", a: "F", f: "¡Bien! El video no afirma eso — «nunca» es demasiado absoluto." },
    { q: "Sofia se lava los dientes antes de preparar el desayuno.", a: "V", f: "¡Correcto! La rutina incluye lavarsi i denti antes de la colazione." },
    { q: "El fin de semana no ponen el despertador.", a: "V", f: "¡Muy bien! Dicen «non mettere la sveglia» el fin de semana." },
    { q: "Por las noches, Giovanni va a correr al parque.", a: "F", f: "¡Bien! Correr al parque se menciona para el fin de semana, no de noche." },
  ]),
  blank(),
  new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: "Ejercicio 2 — Selección múltiple", font: FONT, size: 26, bold: true, color: TEAL })],
  }),
  p("Elegí la opción correcta para cada pregunta sobre el video.", { italic: true }),
  blank(),
  feedbackTable([
    { q: "¿Qué verbo reflexivo usa Giovanni para decir que se despierta?", a: "svegliarsi", f: "¡Correcto! Svegliarsi = despertarse. El reflexivo si indica que la acción recae sobre uno mismo." },
    { q: "¿Cuál de estas acciones NO se menciona en la rutina matutina?", a: "andare in palestra", f: "Correcto — el gimnasio no aparece. La mañana incluye lavarse, desayunar y vestirse." },
    { q: "¿Qué hace Sofia por la tarde para relajarse?", a: "Si rilassa — legge o ascolta musica", f: "¡Perfecto! Por las tardes se relaja: si rilassa, lee o escucha música." },
    { q: "¿A dónde van el fin de semana para ver arte o cultura?", a: "A visitare una mostra", f: "¡Muy bien! Visitare una mostra = visitar una exposición de arte." },
    { q: "¿Cuál es la última actividad del día que mencionan?", a: "Andare a letto", f: "¡Exacto! Andare a letto = ir a la cama. Con eso cierra el ciclo de la giornata." },
  ]),
  blank(),
  pgBreak(),
);

// ══ ETAPA 2 ══════════════════════════════════════════════════════════════════
ch.push(
  stageBanner("ETAPA 2", "Descubrimiento"),
  blank(),
  p("Vocabulario, diálogo, días de la semana, anche/neanche y fonética.", { italic: true, color: TEAL }),
  blank(),
);

// Vocabulario — rutina
ch.push(
  new Paragraph({ spacing: { before: 280, after: 80 }, children: [new TextRun({ text: "La routine quotidiana — Verbos reflexivos y acciones del día", font: FONT, size: 26, bold: true, color: TEAL })] }),
  p("Hacé clic en cada chip para escuchar la pronunciación.", { italic: true, size: 20, color: "666666" }),
  blank(),
  vocabTable([
    ["svegliarsi", "despertarse"],
    ["alzarsi", "levantarse"],
    ["lavarsi la faccia", "lavarse la cara"],
    ["lavarsi i denti", "lavarse los dientes"],
    ["vestirsi", "vestirse"],
    ["fare colazione", "desayunar"],
    ["uscire di casa", "salir de casa"],
    ["andare al lavoro", "ir al trabajo"],
    ["pranzare", "almorzar"],
    ["tornare a casa", "volver a casa"],
    ["rilassarsi", "relajarse"],
    ["cucinare la cena", "cocinar la cena"],
    ["lavare i piatti", "lavar los platos"],
    ["leggere", "leer"],
    ["ascoltare musica", "escuchar música"],
    ["andare a letto", "irse a la cama"],
  ]),
  blank(),
);

// Adverbios de frecuencia
ch.push(
  new Paragraph({ spacing: { before: 280, after: 80 }, children: [new TextRun({ text: "Avverbi di frequenza — ¿Con qué frecuencia?", font: FONT, size: 26, bold: true, color: TEAL })] }),
  blank(),
  twoCol([
    ["sempre", "siempre"],
    ["spesso", "a menudo"],
    ["a volte", "a veces"],
    ["qualche volta", "alguna vez"],
    ["raramente", "raramente"],
    ["non … mai", "nunca"],
  ]),
  blank(),
  infoBanner([
    "Negación doble: en italiano «nunca» se forma con non + mai:",
    "  Non mangio mai la pasta fredda. (Nunca como pasta fría)",
    "¡No es un error — es la estructura correcta del italiano!",
  ], YELLOW, "666600"),
  blank(),
);

// Partes del día
ch.push(
  new Paragraph({ spacing: { before: 280, after: 80 }, children: [new TextRun({ text: "Le parti del giorno", font: FONT, size: 26, bold: true, color: TEAL })] }),
  blank(),
  new Table({
    width: { size: PW, type: WidthType.DXA }, columnWidths: [3000, 3000, 3360],
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: [
      new TableRow({ children: [tc("Italiano", 3000, NAVY, true, "FFFFFF"), tc("Español", 3000, NAVY, true, "FFFFFF"), tc("Nota", 3360, NAVY, true, "FFFFFF")] }),
      ...([
        ["la mattina", "la mañana", "🌅 Hasta el mediodía"],
        ["il pomeriggio", "la tarde", "☀️ Del mediodía al anochecer"],
        ["la sera", "la noche (temprano)", "🌇 Del anochecer hasta dormir"],
        ["la notte", "la noche (tarde)", "🌙 Cuando todos duermen"],
        ["mezzogiorno", "mediodía", "🕛 Las 12:00"],
        ["mezzanotte", "medianoche", "🕛 Las 00:00"],
      ]).map(([i, e, n]) => new TableRow({ children: [tcIta(i, 3000), tc(e, 3000, "FFFFFF", false, "444444"), tc(n, 3360, LGRAY, false, "666666")] })),
    ],
  }),
  blank(),
);

// Diálogo
ch.push(
  new Paragraph({ spacing: { before: 280, after: 80 }, children: [new TextRun({ text: "Il dialogo — La routine di ogni giorno", font: FONT, size: 26, bold: true, color: TEAL })] }),
  p("Giulia y Marco hablan de cómo es su día típico.", { italic: true, size: 20, color: "666666" }),
  blank(),
  dialogTable([
    ["Giulia", "Marco, a che ora ti svegli di solito?", "Marco, ¿a qué hora te despertás habitualmente?"],
    ["Marco", "Di solito mi sveglio alle sette e mi alzo subito. Non riesco a restare a letto!", "Habitualmente me despierto a las siete y me levanto enseguida. ¡No puedo quedarme en la cama!"],
    ["Giulia", "Anch'io! Prima mi lavo la faccia, poi mi vesto e faccio colazione.", "¡Yo también! Primero me lavo la cara, luego me visto y desayuno."],
    ["Marco", "Io faccio colazione al bar, spesso con un cappuccino e un cornetto.", "Yo desayuno en el bar, a menudo con un cappuccino y un croissant."],
    ["Giulia", "Che bello! Io invece mangio a casa. A mezzogiorno pranzo con i colleghi.", "¡Qué lindo! Yo en cambio como en casa. Al mediodía almuerzo con los colegas."],
    ["Marco", "La sera, quando torno a casa, mi rilasso un po'. A volte leggo, a volte ascolto musica.", "Por la tarde, cuando vuelvo a casa, me relajo un rato. A veces leo, a veces escucho música."],
    ["Giulia", "Anch'io mi rilasso la sera. E il weekend? Ti piace dormire fino a tardi?", "Yo también me relajo por la tarde. ¿Y el fin de semana? ¿Te gusta dormir hasta tarde?"],
    ["Marco", "Sì! Il sabato non metto la sveglia. Di solito vado al mercato e poi corro al parco.", "¡Sí! El sábado no pongo el despertador. Habitualmente voy al mercado y después corro en el parque."],
    ["Giulia", "La domenica invece incontro gli amici o visito una mostra. E la sera vado a pranzo dalla famiglia!", "El domingo me junto con amigos o visito una exposición. ¡Y a la tarde voy a almorzar con la familia!"],
    ["Marco", "E tu, la domenica sera, come la passi?", "¿Y vos, el domingo a la noche, cómo lo pasás?"],
    ["Giulia", "Di solito cucino qualcosa di speciale! Mi piace sperimentare ricette nuove.", "Habitualmente cocino algo especial. ¡Me gusta experimentar recetas nuevas!"],
    ["Marco", "Brava! Io invece guardo una serie italiana. In questo periodo sto vedendo Montalbano.", "¡Qué bien! Yo en cambio miro una serie italiana. En este período estoy viendo Montalbano."],
    ["Giulia", "Lo conosco! È bellissimo. Sei già alla terza stagione?", "¡Lo conozco! Es precioso. ¿Ya estás en la tercera temporada?"],
    ["Marco", "Sì! E dopo la serie mi addormento sempre sul divano. La vita perfetta!", "¡Sí! Y después de la serie siempre me duermo en el sofá. ¡La vida perfecta!"],
    ["Giulia", "Uguale a me! Però domani dobbiamo alzarci presto...", "¡Igual que yo! Pero mañana tenemos que levantarnos temprano..."],
    ["Marco", "Hai ragione. Ma per stanotte, goditi il divano e la serie!", "Tenés razón. ¡Pero por esta noche, disfrutá el sofá y la serie!"],
  ]),
  blank(),
);

// Patrones clave
ch.push(
  new Paragraph({ spacing: { before: 280, after: 80 }, children: [new TextRun({ text: "Patrones clave — Dire quando si fa una cosa", font: FONT, size: 26, bold: true, color: TEAL })] }),
  blank(),
  twoCol([
    ["Di solito mi sveglio alle sette.", "Habitualmente + verbo reflexivo + hora"],
    ["A volte faccio colazione al bar.", "A veces + acción"],
    ["La sera mi rilasso sul divano.", "Parte del día + verbo reflexivo + lugar"],
    ["Il lunedì vado al lavoro alle otto.", "Artículo + día + acción + hora (= los lunes)"],
    ["Spesso pranzo con i colleghi.", "Adverbio de frecuencia + acción"],
    ["Quando torno a casa, mi rilasso.", "Cuando + acción → consecuencia"],
  ]),
  blank(),
);

// Anche / Neanche
ch.push(
  new Paragraph({ spacing: { before: 280, after: 80 }, children: [new TextRun({ text: "Anche / Neanche — Yo también / Yo tampoco", font: FONT, size: 26, bold: true, color: TEAL })] }),
  blank(),
  new Table({
    width: { size: PW, type: WidthType.DXA }, columnWidths: [4680, 4680],
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: [
      new TableRow({ children: [tc("Anche (también) — oraciones afirmativas", 4680, LGREEN, true, GREEN), tc("Neanche (tampoco) — oraciones negativas", 4680, LRED, true, "8B1A1A")] }),
      ...([
        ["— Mi piace il caffè.\n— Anch'io!", "— Non mi piace alzarmi presto.\n— Neanche io!"],
        ["— Leggo ogni sera.\n— Anch'io leggo ogni sera.", "— Non faccio mai sport.\n— Neanche io guardo la TV."],
        ["— Vado spesso al mercato.\n— Anche Marco va al mercato!", "— Marco non cucina mai.\n— Neanche Giulia cucina!"],
      ]).map(([a, b]) => new TableRow({ children: [tc(a, 4680, "FFFFFF", false, "333333"), tc(b, 4680, "FFFFFF", false, "333333")] })),
    ],
  }),
  blank(),
  infoBanner([
    "Regla: Anche acompaña oraciones afirmativas. Neanche acompaña oraciones negativas.",
    "Anch'io (también yo) — la e final se elide antes de io: anch'io.",
    "Neanche io — sin elisión: siempre se escribe separado.",
  ]),
  blank(),
);

// Fonética
ch.push(
  new Paragraph({ spacing: { before: 280, after: 80 }, children: [new TextRun({ text: "Fonética — Gli e Gn: los sonidos ʎ y ɲ", font: FONT, size: 26, bold: true, color: TEAL })] }),
  blank(),
  new Table({
    width: { size: PW, type: WidthType.DXA }, columnWidths: [1000, 1200, 2200, 4960],
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: [
      new TableRow({ children: [tc("IPA", 1000, NAVY, true, "FFFFFF"), tc("Grafía", 1200, NAVY, true, "FFFFFF"), tc("Ejemplo", 2200, NAVY, true, "FFFFFF"), tc("Equivalente aproximado", 4960, NAVY, true, "FFFFFF")] }),
      ...([
        ["ʎ", "gli", "famiglia", "Como la 'll' del rioplatense (yeísta)"],
        ["ʎ", "gli", "moglie", "La 'gl' se pronuncia junta — suena 'li'"],
        ["ʎ", "gli", "luglio", "luglio = julio — mismo sonido"],
        ["ɲ", "gn", "bagno", "Igual que la 'ñ' española — ¡ya la sabés!"],
        ["ɲ", "gn", "gnocchi", "Ñoqui — la palabra que ya conocés"],
        ["ɲ", "gn", "compagno", "Compañero — el gn siempre suena como ñ"],
      ]).map(([ipa, gr, ej, eq]) => new TableRow({ children: [tc(ipa, 1000, LGRAY, false, TEAL), tcIta(gr, 1200, YELLOW), tcIta(ej, 2200), tc(eq, 4960, "FFFFFF", false, "444444")] })),
    ],
  }),
  blank(),
  infoBanner(["Practicá con: famiglia · moglie · bagno · gnocchi · compagno · luglio"]),
  blank(),
);

// Ejercicios Etapa 2
ch.push(
  new Paragraph({ spacing: { before: 280, after: 80 }, children: [new TextRun({ text: "Ejercicio A — ¿Qué va primero? (Orden de la rutina)", font: FONT, size: 22, bold: true, color: TEAL })] }),
  blank(),
  feedbackTable([
    { q: "¿Cuál es el orden correcto de la mañana?", a: "svegliarsi → alzarsi → lavarsi → vestirsi", f: "¡Correcto! El orden natural: despertarse → levantarse → lavarse → vestirse." },
    { q: "¿Qué se hace normalmente dopo pranzo?", a: "Tornare al lavoro o rilassarsi", f: "¡Exacto! Después del almuerzo se vuelve al trabajo o, si se puede, un riposino." },
    { q: "¿Qué adverbio va mejor? «___ faccio colazione al bar.» (frecuente)", a: "Spesso", f: "¡Bien! Spesso = a menudo, indica algo frecuente. Mai = nunca; raramente = poco frecuente." },
  ]),
  blank(),
  new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: "Ejercicio B — Anche o Neanche", font: FONT, size: 22, bold: true, color: TEAL })] }),
  blank(),
  feedbackTable([
    { q: "— Mi alzo presto ogni giorno. — ___!", a: "Anch'io!", f: "¡Correcto! La oración es afirmativa → usamos Anch'io." },
    { q: "— Non mi piace cucinare la cena. — ___!", a: "Neanche io!", f: "¡Perfecto! La oración es negativa (non) → usamos Neanche io." },
    { q: "— Leggo sempre prima di dormire. — ___!", a: "Anch'io!", f: "¡Muy bien! Afirmativa → Anch'io. ¡Los que leen antes de dormir son la mejor compañía!" },
  ]),
  blank(),
  new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: "Ejercicio C — Completá con la parte del giorno", font: FONT, size: 22, bold: true, color: TEAL })] }),
  blank(),
  feedbackTable([
    { q: "Mi sveglio ___ alle sette.", a: "la mattina", f: "¡Correcto! Nos despertamos por la mañana — la mattina." },
    { q: "___ guardo un film sul divano.", a: "La sera", f: "¡Perfecto! La sera es el momento de relajarse en el sofá." },
    { q: "___ vado al parco a correre.", a: "Il pomeriggio / la mattina", f: "¡Bien! Correr al parque es actividad de mattina o pomeriggio." },
  ]),
  blank(),
  pgBreak(),
);

// ══ ETAPA 3 ══════════════════════════════════════════════════════════════════
ch.push(
  stageBanner("ETAPA 3", "Gramática"),
  blank(),
  p("Verbos reflexivos · Artículos con días · Posesivos · Anche/Neanche.", { italic: true, color: TEAL }),
  blank(),
);

// 1 — Verbos reflexivos
ch.push(
  new Paragraph({ spacing: { before: 280, after: 120 }, children: [new TextRun({ text: "1 · I verbi riflessivi", font: FONT, size: 28, bold: true, color: "FFFFFF" })], shading: { fill: TEAL, type: ShadingType.CLEAR } }),
  blank(),
  p("Los verbos reflexivos son aquellos donde el sujeto realiza y recibe la acción. En italiano se conjugan con un pronombre reflexivo delante del verbo conjugado.", { size: 20 }),
  blank(),
  infoBanner([
    "Pronombres reflexivos: mi (yo) · ti (vos/tú) · si (él/ella) · ci (nosotros) · vi (vosotros) · si (ellos)",
    "El pronombre va ANTES del verbo conjugado: mi sveglio (me despierto).",
    "En el infinitivo el reflexivo va DESPUÉS y pegado: svegliar-si, alzar-si, vestir-si.",
  ]),
  blank(),
);

const reflexivos = [
  ["svegliarsi — despertarse", [["io", "mi sveglio", "me despierto"], ["tu", "ti svegli", "te despertás"], ["lui/lei", "si sveglia", "se despierta"], ["noi", "ci svegliamo", "nos despertamos"], ["voi", "vi svegliate", "se despiertan (uds.)"], ["loro", "si svegliano", "se despiertan (ellos)"]]],
  ["lavarsi — lavarse", [["io", "mi lavo", "me lavo"], ["tu", "ti lavi", "te lavás"], ["lui/lei", "si lava", "se lava"], ["noi", "ci laviamo", "nos lavamos"], ["voi", "vi lavate", "se lavan (uds.)"], ["loro", "si lavano", "se lavan (ellos)"]]],
  ["vestirsi — vestirse", [["io", "mi vesto", "me visto"], ["tu", "ti vesti", "te vestís"], ["lui/lei", "si veste", "se viste"], ["noi", "ci vestiamo", "nos vestimos"], ["voi", "vi vestite", "se visten (uds.)"], ["loro", "si vestono", "se visten (ellos)"]]],
];
reflexivos.forEach(([verb, pairs]) => {
  ch.push(conjTable(verb, pairs), blank());
});

ch.push(
  new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: "Ejercicio 1a — Conjugá el verbo reflexivo", font: FONT, size: 22, bold: true, color: TEAL })] }),
  p("Escribí la forma correcta del verbo reflexivo entre paréntesis.", { italic: true }),
  blank(),
  feedbackTable([
    { q: "Lui ___ (alzarsi) alle sette.", a: "si alza", f: "¡Correcto! lui → si alza. Lui usa el pronombre si." },
    { q: "Noi ___ (lavarsi) i denti.", a: "ci laviamo", f: "¡Perfecto! noi → ci laviamo. Noi usa ci." },
    { q: "Tu ___ (vestirsi) in fretta?", a: "ti vesti", f: "¡Bien! tu → ti vesti. Tu usa ti." },
    { q: "Loro ___ (rilassarsi) la sera.", a: "si rilassano", f: "¡Muy bien! loro → si rilassano. Loro usa si." },
  ]),
  blank(),
  new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: "Ejercicio 1b — Elegí la forma correcta", font: FONT, size: 22, bold: true, color: TEAL })] }),
  blank(),
  feedbackTable([
    { q: "Giovanni ___ sveglia alle sette di mattina.", a: "si", f: "¡Correcto! Giovanni es tercera persona singular → pronombre si." },
    { q: "Io ___ alzo subito dopo il caffè.", a: "mi", f: "¡Perfecto! Io (yo) → pronombre reflexivo mi." },
    { q: "Voi ___ vestite velocemente?", a: "vi", f: "¡Bien! Voi (ustedes) → pronombre vi." },
    { q: "Sofia e Marco ___ rilassano sul divano.", a: "si", f: "¡Correcto! Loro (ellos) → pronombre si." },
  ]),
  blank(),
);

// 2 — Artículos con días
ch.push(
  new Paragraph({ spacing: { before: 280, after: 120 }, children: [new TextRun({ text: "2 · Gli articoli con i giorni della settimana", font: FONT, size: 28, bold: true, color: "FFFFFF" })], shading: { fill: TEAL, type: ShadingType.CLEAR } }),
  blank(),
  p("Con artículo (il / la + día) = costumbre habitual. Sin artículo = día específico.", { size: 20, bold: true }),
  blank(),
  new Table({
    width: { size: PW, type: WidthType.DXA }, columnWidths: [1800, 4000, 3560],
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: [
      new TableRow({ children: [tc("Día", 1800, NAVY, true, "FFFFFF"), tc("Con artículo (habitual)", 4000, NAVY, true, "FFFFFF"), tc("Sin artículo (específico)", 3560, NAVY, true, "FFFFFF")] }),
      ...([
        ["lunedì", "Il lunedì vado in palestra. (los lunes)", "Lunedì vado al medico. (este lunes)"],
        ["mercoledì", "Il mercoledì lavoro da casa. (los miércoles)", "Mercoledì ho una riunione. (este miércoles)"],
        ["sabato", "Il sabato vado al mercato. (los sábados)", "Sabato vado a Roma. (este sábado)"],
        ["domenica", "La domenica pranzo con la famiglia. (los domingos)", "Domenica vado a Venezia. (este domingo)"],
      ]).map(([d, con, sin]) => new TableRow({ children: [tcIta(d, 1800, YELLOW), tc(con, 4000, LGREEN, false, "333333"), tc(sin, 3560, "FFFFFF", false, "333333")] })),
    ],
  }),
  blank(),
  infoBanner([
    "Clave: artículo + día = costumbre semanal (los lunes, los domingos).",
    "Sin artículo = ocasión puntual (este lunes, el próximo sábado).",
    "Domenica es femenino → la domenica. Los demás días son masculinos → il lunedì, il sabato…",
  ]),
  blank(),
  new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: "Ejercicio 2a — ¿Con o sin artículo?", font: FONT, size: 22, bold: true, color: TEAL })] }),
  blank(),
  feedbackTable([
    { q: "___ domenica (cada domingo) vado a pranzo dalla nonna.", a: "La domenica", f: "¡Correcto! «Cada domingo» es habitual → La domenica." },
    { q: "___ sabato (este sábado concreto) ho un matrimonio.", a: "Sabato (sin artículo)", f: "¡Bien! Es un sábado específico → sin artículo: Sabato." },
    { q: "___ lunedì (los lunes en general) mi sveglio alle sei.", a: "Il lunedì", f: "¡Perfecto! Costumbre de todos los lunes → Il lunedì." },
  ]),
  blank(),
  new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: "Ejercicio 2b — Completá con el artículo correcto", font: FONT, size: 22, bold: true, color: TEAL })] }),
  blank(),
  feedbackTable([
    { q: "___ venerdì faccio yoga. (los viernes)", a: "Il", f: "¡Correcto! Il venerdì — masculino, habitual." },
    { q: "___ domenica vado al mare. (este domingo)", a: "— (sin artículo)", f: "¡Correcto! Sin artículo — es un domingo específico." },
    { q: "___ domenica pranzo sempre con la famiglia. (los domingos)", a: "La", f: "¡Bien! La domenica — femenino, habitual." },
  ]),
  blank(),
);

// 3 — Posesivos
ch.push(
  new Paragraph({ spacing: { before: 280, after: 120 }, children: [new TextRun({ text: "3 · I pronomi possessivi", font: FONT, size: 28, bold: true, color: "FFFFFF" })], shading: { fill: TEAL, type: ShadingType.CLEAR } }),
  blank(),
  p("Los posesivos en italiano concuerdan con la cosa poseída (no con el poseedor). Casi siempre llevan artículo.", { size: 20 }),
  blank(),
  new Table({
    width: { size: PW, type: WidthType.DXA }, columnWidths: [1400, 2000, 2000, 2000, 1960],
    borders: { top: brd(), bottom: brd(), left: brd(), right: brd(), insideH: brd(), insideV: brd() },
    rows: [
      new TableRow({ children: [tc("Poseedor", 1400, NAVY, true, "FFFFFF"), tc("Masc. sing.", 2000, NAVY, true, "FFFFFF"), tc("Fem. sing.", 2000, NAVY, true, "FFFFFF"), tc("Masc. pl.", 2000, NAVY, true, "FFFFFF"), tc("Fem. pl.", 1960, NAVY, true, "FFFFFF")] }),
      ...([
        ["io", "il mio libro", "la mia routine", "i miei amici", "le mie chiavi"],
        ["tu", "il tuo lavoro", "la tua mattina", "i tuoi colleghi", "le tue scarpe"],
        ["lui/lei", "il suo caffè", "la sua giornata", "i suoi amici", "le sue abitudini"],
        ["noi", "il nostro ritmo", "la nostra pausa", "i nostri piani", "le nostre serate"],
      ]).map(([pr, ms, fs, mp, fp]) => new TableRow({ children: [tc(pr, 1400, LGRAY, true), tcIta(ms, 2000), tcIta(fs, 2000), tcIta(mp, 2000), tcIta(fp, 1960)] })),
    ],
  }),
  blank(),
  infoBanner([
    "Excepción: con parientes en SINGULAR se omite el artículo:",
    "  mia madre · mio padre · mio fratello · mia sorella",
    "Pero en plural sí va artículo: i miei fratelli · le mie sorelle.",
  ], YELLOW, "666600"),
  blank(),
  new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: "Ejercicio 3a — Elegí el posesivo correcto", font: FONT, size: 22, bold: true, color: TEAL })] }),
  blank(),
  feedbackTable([
    { q: "Questa è la ___ routine mattutina. (di Giulia — ella)", a: "sua", f: "¡Correcto! Giulia = lei → sua. La routine es femenino → la sua routine." },
    { q: "I ___ colleghi sono simpatici. (di Marco — lui)", a: "suoi", f: "¡Bien! Marco = lui → suoi. Colleghi es masc. plural → i suoi colleghi." },
    { q: "Dove sono le ___ chiavi? (le mie chiavi — io)", a: "mie", f: "¡Perfecto! Chiavi es femenino plural → le mie chiavi." },
  ]),
  blank(),
  new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: "Ejercicio 3b — Completá con el posesivo", font: FONT, size: 22, bold: true, color: TEAL })] }),
  blank(),
  feedbackTable([
    { q: "(io) La ___ mattina inizia alle sei.", a: "mia", f: "¡Correcto! La mattina (fem.) + io → la mia mattina." },
    { q: "(tu) Il ___ caffè è già freddo!", a: "tuo", f: "¡Muy bien! Il caffè (masc.) + tu → il tuo caffè." },
    { q: "(lui) I ___ amici sono tutti sportivi.", a: "suoi", f: "¡Excelente! Gli amici (masc. pl.) + lui → i suoi amici." },
  ]),
  blank(),
);

// 4 — Anche / Neanche (gramática)
ch.push(
  new Paragraph({ spacing: { before: 280, after: 120 }, children: [new TextRun({ text: "4 · Anche / Neanche — Gramática", font: FONT, size: 28, bold: true, color: "FFFFFF" })], shading: { fill: TEAL, type: ShadingType.CLEAR } }),
  blank(),
  new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: "Ejercicio 4a — Anche o Neanche", font: FONT, size: 22, bold: true, color: TEAL })] }),
  blank(),
  feedbackTable([
    { q: "— Faccio sempre colazione a casa. — ___!", a: "Anch'io!", f: "¡Correcto! Oración afirmativa → Anch'io." },
    { q: "— Non mi sveglio mai prima delle otto. — ___!", a: "Neanche io!", f: "¡Perfecto! Oración negativa (non … mai) → Neanche io." },
    { q: "— Mi rilasso sempre con un libro. — ___!", a: "Anch'io!", f: "¡Bien! Afirmativa → Anch'io." },
  ]),
  blank(),
  new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: "Ejercicio 4b — Completá el diálogo", font: FONT, size: 22, bold: true, color: TEAL })] }),
  blank(),
  feedbackTable([
    { q: "— Spesso cucino io la cena. — ___!", a: "Anch'io", f: "¡Correcto! Afirmativa → Anch'io." },
    { q: "— Non esco mai di casa prima delle sette. — ___!", a: "Neanche io", f: "¡Perfecto! Negativa (non … mai) → Neanche io." },
    { q: "— Vado sempre a correre il sabato. — ___!", a: "Anch'io", f: "¡Muy bien! Afirmativa → Anch'io." },
  ]),
  blank(),
);

// Ejercicios integradores
ch.push(
  new Paragraph({ spacing: { before: 280, after: 120 }, children: [new TextRun({ text: "5 · Ejercicios integradores", font: FONT, size: 28, bold: true, color: "FFFFFF" })], shading: { fill: TEAL, type: ShadingType.CLEAR } }),
  blank(),
  new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: "Integratore 1 — Corregí los errores", font: FONT, size: 22, bold: true, color: TEAL })] }),
  blank(),
  feedbackTable([
    { q: "«La sabato mi sveglio tardi.» — ¿Cuál es la corrección?", a: "La sabato → Il sabato", f: "¡Correcto! Sabato es masculino → Il sabato mi sveglio tardi." },
    { q: "«Io si sveglio alle sette.» — ¿Cuál es el error?", a: "Pronombre: si → mi", f: "¡Bien visto! Io (yo) → pronombre reflexivo mi. Correcto: Io mi sveglio alle sette." },
    { q: "«— Non mi piace cucinare. — Anche io!» — ¿Está bien?", a: "No — debe ser Neanche io", f: "¡Exacto! La oración es negativa (non) → la respuesta correcta es Neanche io!" },
  ]),
  blank(),
  new Paragraph({ spacing: { before: 200, after: 60 }, children: [new TextRun({ text: "Integratore 2 — Traducí al italiano", font: FONT, size: 22, bold: true, color: TEAL })] }),
  blank(),
  feedbackTable([
    { q: "«Los domingos me relajo con mi familia.» (habitual)", a: "La domenica mi rilasso con la mia famiglia.", f: "¡Perfecto! La domenica + mi rilasso + la mia famiglia." },
    { q: "«¿A qué hora te despertás vos?»", a: "A che ora ti svegli?", f: "¡Muy bien! A che ora ti svegli? — reflexivo en segunda persona." },
    { q: "«Yo tampoco voy al trabajo los sábados.»", a: "Neanche io vado al lavoro il sabato.", f: "¡Excelente! Neanche io vado al lavoro il sabato." },
  ]),
  blank(),
);

// Nota cultural
ch.push(
  new Paragraph({ spacing: { before: 280, after: 80 }, children: [new TextRun({ text: "Nota cultural — Il ritmo della vita italiana", font: FONT, size: 26, bold: true, color: TEAL })] }),
  blank(),
  banner([
    new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "In Italia, la giornata ha un ritmo tutto suo. La mattina si inizia spesso al bar con un caffè veloce — pochi minuti in piedi al bancone, non seduti come in Argentina.", font: FONT, size: 20, bold: true, color: NAVY })] }),
    new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: "Il pranzo è ancora oggi un momento importante: molte famiglie e aziende si fermano tra mezzogiorno e le due. La sera, prima di cena, c'è l'aperitivo — un momento sociale tra amici o colleghi. E dopo cena, la classica passeggiata per le strade del centro è una tradizione viva in molte città.", font: FONT, size: 20, color: NAVY })] }),
  ], LTEAL),
  blank(),
  p("En español: En Italia, el día tiene su propio ritmo. La mañana empieza a menudo en el bar con un café rápido de pie en el mostrador. El almuerzo sigue siendo importante — muchas familias y empresas hacen pausa entre el mediodía y las dos. Por la tarde está el aperitivo entre amigos, y después de cenar el clásico paseo por el centro.", { size: 19, color: "555555", italic: true }),
  blank(),
);

const doc = new Document({
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    children: ch,
  }],
});

const outPath = path.join(__dirname, "modulo7_la_mia_giornata.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("✓ Creado:", outPath);
}).catch(err => { console.error("Error:", err.message); process.exit(1); });
