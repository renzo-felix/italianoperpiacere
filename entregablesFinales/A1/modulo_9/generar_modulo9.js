const path = require("path");
const fs   = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageBreak
} = require("C:/Users/Renzo/AppData/Roaming/npm/node_modules/docx");

// ── Palette ──────────────────────────────────────────────────────────────────
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

// ── Border helpers ────────────────────────────────────────────────────────────
const brd  = (c = "CCCCCC") => ({ style: BorderStyle.SINGLE, size: 4, color: c });
const bors = (c = "CCCCCC") => ({ top: brd(c), bottom: brd(c), left: brd(c), right: brd(c) });

// ── Basic paragraph ───────────────────────────────────────────────────────────
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    alignment: opts.center ? AlignmentType.CENTER : undefined,
    children: [new TextRun({
      text, font: FONTS, size: opts.sz || 22,
      italic: opts.italic, bold: opts.bold, color: opts.color || BLACK
    })]
  });
}

function blank() { return p(""); }

function pgBreak() { return new Paragraph({ children: [new PageBreak()] }); }

// ── Cell + Row helpers ────────────────────────────────────────────────────────
function tc(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    borders: bors(opts.bc || "CCCCCC"),
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({
        text, font: FONTS, size: opts.sz || 20,
        bold: opts.bold, italic: opts.italic, color: opts.color || BLACK
      })]
    })]
  });
}

function tcIta(text, opts = {}) { return tc(text, { ...opts, italic: true }); }

function tr(cells) { return new TableRow({ children: cells }); }

function hrow(labels, widths) {
  return tr(labels.map((l, i) => tc(l, { fill: TEAL, bold: true, color: "FFFFFF", width: widths[i] })));
}

// ── Banner helpers ────────────────────────────────────────────────────────────
function banner(line1, line2) {
  const rows = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: line1, font: FONTS, size: 40, bold: true, color: "FFFFFF" })]
    })
  ];
  if (line2) rows.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [new TextRun({ text: line2, font: FONTS, size: 26, italic: true, color: "FFFFFF" })]
  }));
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    rows: [tr([new TableCell({
      shading: { fill: TEAL, type: ShadingType.CLEAR },
      borders: bors(TEAL),
      margins: { top: 200, bottom: 200, left: 300, right: 300 },
      children: rows
    })])]
  });
}

function stageBanner(stage, subtitle) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    rows: [tr([new TableCell({
      shading: { fill: "1A4A57", type: ShadingType.CLEAR },
      borders: bors("1A4A57"),
      margins: { top: 160, bottom: 160, left: 300, right: 300 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: stage, font: FONTS, size: 36, bold: true, color: "FFFFFF" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: subtitle, font: FONTS, size: 24, italic: true, color: "D6EAF0" })]
        })
      ]
    })])]
  });
}

function infoBanner(...lines) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    rows: [tr([new TableCell({
      shading: { fill: LTEAL, type: ShadingType.CLEAR },
      borders: bors(TEAL),
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: lines.map(l => new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: l, font: FONTS, size: 20, color: "1A4A57" })]
      }))
    })])]
  });
}

// ── Feedback table (V/F / selection with answer + feedback) ──────────────────
// rows: [{q, ans, fb}]
function feedbackTable(rows) {
  const cw = [5000, 1800, 2560];
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(["Enunciado / Pregunta", "Respuesta", "Retroalimentacion"], cw),
      ...rows.map(r => tr([
        tc(r.q,   { width: cw[0] }),
        tc(r.ans, { width: cw[1], fill: LGREEN, bold: true, color: GREEN }),
        tc(r.fb,  { width: cw[2], italic: true })
      ]))
    ]
  });
}

// ── Vocab table (2 cols: Italian / Spanish) ───────────────────────────────────
function vocabTable(items) {
  const cw = [4680, 4680];
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(["Italiano", "Espanol"], cw),
      ...items.map(([ita, esp]) => tr([
        tcIta(ita, { width: cw[0] }),
        tc(esp,    { width: cw[1] })
      ]))
    ]
  });
}

// ── Conj table ────────────────────────────────────────────────────────────────
function conjTable(verbTitle, rows) {
  const cw = [1800, 3200, 4360];
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow([verbTitle, "Italiano", "Espanol"], cw),
      ...rows.map(([pro, ita, esp]) => tr([
        tc(pro, { width: cw[0], bold: true }),
        tcIta(ita, { width: cw[1] }),
        tc(esp, { width: cw[2] })
      ]))
    ]
  });
}

// ── Dialog table ──────────────────────────────────────────────────────────────
function dialogTable(lines) {
  // lines: [{speaker, ita, esp}]
  const cw = [1400, 3980, 3980];
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(["Personaje", "Italiano", "Espanol"], cw),
      ...lines.map((l, i) => tr([
        tc(l.speaker, { width: cw[0], bold: true, fill: i % 2 === 0 ? LTEAL : undefined }),
        tcIta(l.ita,  { width: cw[1] }),
        tc(l.esp,     { width: cw[2] })
      ]))
    ]
  });
}

// ── Two-column table ──────────────────────────────────────────────────────────
function twoCol(items, h1 = "A", h2 = "B") {
  const cw = [4680, 4680];
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow([h1, h2], cw),
      ...items.map(([a, b]) => tr([
        tcIta(a, { width: cw[0] }),
        tc(b,    { width: cw[1] })
      ]))
    ]
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT BODY
// ══════════════════════════════════════════════════════════════════════════════
const ch = [];

// ── PORTADA ───────────────────────────────────────────────────────────────────
ch.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 480, after: 80 },
  children: [new TextRun({ text: "Italiano per Piacere", font: FONTS, size: 52, bold: true, color: TEAL })]
}));
ch.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 },
  children: [new TextRun({ text: "A1 — Modulo 8", font: FONTS, size: 30, bold: true, color: "555555" })]
}));
ch.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 },
  children: [new TextRun({ text: "Modulo 8", font: FONTS, size: 26, color: "777777" })]
}));
ch.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 },
  children: [new TextRun({ text: "In treno o in macchina?", font: FONTS, size: 34, bold: true, italic: true, color: TEAL })]
}));
ch.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 },
  children: [new TextRun({ text: "Transporte, ciudad, indicaciones y gramatica esencial", font: FONTS, size: 22, italic: true, color: "666666" })]
}));

ch.push(infoBanner(
  "Etapa 1 — Video + checklist + V/F + seleccion multiple",
  "Etapa 2 — Vocabulario: transportes, ciudad, adverbios; dialogo, stare+gerundio, ordinales, imperativo, demostrativos",
  "Etapa 3 — Gramatica: ordinales, stare+gerundio, pronome ci, imperativo, questo/quello, pronomi diretti, fonetica"
));
ch.push(blank());

// ══════════════════════════════════════════════════════════════════════════════
// ETAPA 1 — EXPLORACIÓN
// ══════════════════════════════════════════════════════════════════════════════
ch.push(stageBanner("ETAPA 1", "Exploracion"));
ch.push(blank());

// Checklist predicción
ch.push(infoBanner(
  "Antes de ver, ?que medios de transporte crées que aparecen?",
  "la bicicletta · il treno · il vaporetto · l'autobus · la macchina · il traghetto · la gondola · l'aereo"
));
ch.push(blank());
ch.push(p("Video: https://www.youtube.com/embed/nmtMdxkKHUo", { color: "0000CC" }));
ch.push(blank());

// Ejercicio 1 — Vero o Falso
ch.push(p("Ejercicio 1 — Vero o Falso", { bold: true, sz: 24 }));
ch.push(feedbackTable([
  { q: "In Italia si va sempre in macchina.",                               ans: "FALSO",  fb: "!Correcto! Italia tiene muchos medios de transporte." },
  { q: "A Venezia gli autobus viaggiano sull'acqua.",                       ans: "VERO",   fb: "!Correcto! Los vaporetti son los 'colectivos' acuaticos de Venezia." },
  { q: "Il Frecciarossa va da Milano a Roma in due ore e mezza.",           ans: "VERO",   fb: "!Correcto! El Frecciarossa hace Milano-Roma en 2,5 horas." },
  { q: "Le piste ciclabili sono strade per le macchine.",                   ans: "FALSO",  fb: "!Correcto! Le piste ciclabili son carriles para bicicletas." },
  { q: "L'Autostrada del Sole va da nord a sud.",                           ans: "VERO",   fb: "!Correcto! L'Autostrada del Sole conecta el norte con el sur de Italia." }
]));
ch.push(blank());

// Ejercicio 2 — Selección múltiple
ch.push(p("Ejercicio 2 — Seleccion multiple", { bold: true, sz: 24 }));
ch.push(feedbackTable([
  { q: "?Como se llama el tren de alta velocidad del video?",   ans: "Frecciarossa",                    fb: "!Esatto! El Frecciarossa (Flecha Roja) conecta Milano con Roma en 2,5 horas." },
  { q: "?Que medios usa la gente en Venezia?",                  ans: "Vaporetti, gondole y motoscafi",  fb: "!Benissimo! En Venezia se usan vaporetti (colectivos de agua), motoscafi y gondole." }
]));
ch.push(blank());

// ══════════════════════════════════════════════════════════════════════════════
// ETAPA 2 — DESCUBRIMIENTO
// ══════════════════════════════════════════════════════════════════════════════
ch.push(pgBreak());
ch.push(stageBanner("ETAPA 2", "Descubrimiento"));
ch.push(blank());

// I mezzi di trasporto
ch.push(p("I mezzi di trasporto", { bold: true, sz: 26, color: TEAL }));
ch.push(vocabTable([
  ["la bicicletta",   "la bicicleta"],
  ["il treno",        "el tren"],
  ["l'autobus",       "el colectivo"],
  ["il tram",         "el tranvia"],
  ["la metropolitana","el subterraneo"],
  ["il taxi",         "el taxi"],
  ["la macchina",     "el auto"],
  ["il traghetto",    "el ferry"],
  ["il vaporetto",    "colectivo acuatico"],
  ["la gondola",      "la gondola"],
  ["l'aereo",         "el avion"],
  ["la moto",         "la moto"],
  ["lo scooter",      "el scooter"],
  ["a piedi",         "a pie / caminando"]
]));
ch.push(blank());

// La città — Vocabulario urbano
ch.push(p("La citta — Vocabulario urbano", { bold: true, sz: 26, color: TEAL }));
ch.push(vocabTable([
  ["la via",          "la calle"],
  ["il viale",        "la avenida arbolada"],
  ["la piazza",       "la plaza"],
  ["il corso",        "la avenida principal"],
  ["il largo",        "la plazoleta"],
  ["l'incrocio",      "la interseccion"],
  ["il semaforo",     "el semaforo"],
  ["la fermata",      "la parada"],
  ["la stazione",     "la estacion"],
  ["il binario",      "el anden / via"],
  ["l'aeroporto",     "el aeropuerto"]
]));
ch.push(blank());

// Avverbi di luogo
ch.push(p("Avverbi di luogo", { bold: true, sz: 26, color: TEAL }));
ch.push(twoCol([
  ["qui / qua",       "aqui / aca"],
  ["li / la",         "alli / alla"],
  ["vicino",          "cerca"],
  ["lontano",         "lejos"],
  ["sopra",           "arriba / encima"],
  ["sotto",           "abajo / debajo"],
  ["davanti",         "delante / enfrente"],
  ["dietro",          "detras"],
  ["a destra",        "a la derecha"],
  ["a sinistra",      "a la izquierda"],
  ["dritto / diritto","recto / derecho"]
], "Italiano", "Espanol"));
ch.push(blank());

// Diálogo — In stazione
ch.push(p("Dialogo — In stazione", { bold: true, sz: 26, color: TEAL }));
ch.push(dialogTable([
  { speaker: "Sofia", ita: "Scusi, mi sa dire come arrivo al Colosseo da qui?",                                                                           esp: "Disculpe, ?me podria decir como llego al Colosseo desde aca?" },
  { speaker: "Luca",  ita: "Certo! Prenda la metropolitana linea B, direzione Laurentina.",                                                               esp: "!Claro! Toma el subterraneo linea B, direccion Laurentina." },
  { speaker: "Sofia", ita: "E dove prendo la metro? E lontano da qui?",                                                                                   esp: "?Y donde tomo el subte? ?Esta lejos de aca?" },
  { speaker: "Luca",  ita: "No, e vicinissimo! Vada dritto, poi giri a sinistra. La fermata e li, davanti alla farmacia.",                                esp: "!No, esta cerquisima! Anda recto, despues gira a la izquierda. La parada esta alli, frente a la farmacia." },
  { speaker: "Sofia", ita: "Capito! E ci vuole molto per arrivare al Colosseo?",                                                                          esp: "!Entendido! ?Y lleva mucho para llegar al Colosseo?" },
  { speaker: "Luca",  ita: "No, ci vuole circa dieci minuti con la metro. Scendi alla fermata Colosseo, e sulla linea B.",                                esp: "No, lleva unos diez minutos en subte. Bajas en la parada Colosseo, en la linea B." },
  { speaker: "Sofia", ita: "Perfetto! E il biglietto, dove si compra?",                                                                                   esp: "!Perfecto! ?Y el boleto, donde se compra?" },
  { speaker: "Luca",  ita: "Alla biglietteria automatica, proprio qui in stazione. Oppure puoi comprarlo dal tabaccaio.",                                 esp: "En la boleteria automatica, aca mismo. O podes comprarlo en el kiosco de tabaco." },
  { speaker: "Sofia", ita: "Grazie mille, e stato gentilissimo!",                                                                                         esp: "!Muchisimas gracias, fue muy amable!" },
  { speaker: "Luca",  ita: "Prego! Buona visita al Colosseo!",                                                                                            esp: "!De nada! !Que disfrutes la visita al Colosseo!" },
  { speaker: "Sofia", ita: "Aspetti! Sa anche dove posso mangiare vicino al Colosseo? Ho una fame!",                                                      esp: "!Espere! ?Sabe tambien donde puedo comer cerca del Colosseo? !Tengo un hambre!" },
  { speaker: "Luca",  ita: "Certo! Vicino alla fermata ci sono tanti ristoranti. Ma attenzione ai prezzi — zona turistica!",                             esp: "!Claro! Cerca de la parada hay muchos restaurantes. !Pero cuidado con los precios, zona turistica!" },
  { speaker: "Sofia", ita: "Ha una raccomandazione? Preferisco qualcosa di tipico romano.",                                                               esp: "?Tiene alguna recomendacion? Prefiero algo tipico romano." },
  { speaker: "Luca",  ita: "Vada in Via dei Serpenti — li ci sono trattorie genuine. Provi la pasta cacio e pepe!",                                       esp: "Vaya a Via dei Serpenti, alli hay trattorias genuinas. !Pruebe la pasta cacio e pepe!" },
  { speaker: "Sofia", ita: "Cacio e pepe! E gia il mio piatto preferito. E per tornare, prendo di nuovo la metro?",                                       esp: "!Cacio e pepe! Ya es mi plato preferido. ?Y para volver, tomo de nuevo el subte?" },
  { speaker: "Luca",  ita: "Si, oppure c'e l'autobus numero 75. Passa ogni dieci minuti.",                                                               esp: "Si, o tambien esta el autobus numero 75. Pasa cada diez minutos." },
  { speaker: "Sofia", ita: "Perfetto! Tante grazie, e stato di grande aiuto!",                                                                            esp: "!Perfecto! Muchas gracias, fue de gran ayuda." },
  { speaker: "Luca",  ita: "Di niente! Benvenuta a Roma — e una citta meravigliosa. Buona permanenza!",                                                  esp: "!De nada! Bienvenida a Roma. !Que disfrutes la estadia!" }
]));
ch.push(blank());

// Stare + gerundio
ch.push(p("Stare + gerundio", { bold: true, sz: 26, color: TEAL }));
ch.push(conjTable("stare + gerundio", [
  ["io",       "sto camminando",          "Estoy caminando"],
  ["tu",       "stai aspettando il treno","Estas esperando el tren"],
  ["lui/lei",  "sta prendendo la metro",  "Esta tomando el subte"],
  ["noi",      "stiamo viaggiando",       "Estamos viajando"],
  ["voi",      "state guardando la mappa","Estan mirando el mapa"],
  ["loro",     "stanno partendo adesso",  "Estan saliendo ahora"]
]));
ch.push(blank());
ch.push(infoBanner(
  "Formula: stare (conjugado) + gerundio.  -ARE → -ando.  -ERE/-IRE → -endo.",
  "Ej: camminare→camminando · prendere→prendendo · partire→partendo"
));
ch.push(blank());

// Numeri ordinali
ch.push(p("Numeri ordinali", { bold: true, sz: 26, color: TEAL }));
ch.push(vocabTable([
  ["primo",   "primero/a"],
  ["secondo", "segundo/a"],
  ["terzo",   "tercero/a"],
  ["quarto",  "cuarto/a"],
  ["quinto",  "quinto/a"],
  ["sesto",   "sexto/a"],
  ["settimo", "septimo/a"],
  ["ottavo",  "octavo/a"],
  ["nono",    "noveno/a"],
  ["decimo",  "decimo/a"]
]));
ch.push(blank());
ch.push(infoBanner(
  "Del 1° al 10° son formas especiales — hay que memorizarlas.",
  "Del 11° en adelante: numero + '-esimo/a' (undicesimo, dodicesimo...)."
));
ch.push(blank());

// Imperativo informale
ch.push(p("Imperativo informale (tu)", { bold: true, sz: 26, color: TEAL }));
ch.push(twoCol([
  ["Prendi il treno!",       "!Toma el tren! (prendere → prendi)"],
  ["Vai dritto!",            "!Anda recto! (andare → vai irregolare)"],
  ["Aspetta qui!",           "!Espera aca! (aspettare → aspetta)"],
  ["Gira a destra!",         "!Gira a la derecha! (girare → gira)"],
  ["Scendi alla prossima!",  "!Baja en la proxima! (scendere → scendi)"],
  ["Segui la strada!",       "!Segui la calle! (seguire → segui)"],
  ["Compra il biglietto!",   "!Compra el boleto! (comprare → compra)"],
  ["Vieni con me!",          "!Veni conmigo! (venire → vieni irregolare)"]
], "Imperativo", "Traduccion + nota"));
ch.push(blank());

// Pronomi dimostrativi
ch.push(p("Pronomi dimostrativi — questo / quello", { bold: true, sz: 26, color: TEAL }));
{
  const cw = [4680, 4680];
  ch.push(new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(["QUESTO (cerca)", "QUELLO (lontano)"], cw),
      tr([tcIta("questo treno (masc. sing.)",  { width: cw[0] }), tcIta("quel treno (masc. sing.)",  { width: cw[1] })]),
      tr([tcIta("questa fermata (fem. sing.)", { width: cw[0] }), tcIta("quella fermata (fem. sing.)",{ width: cw[1] })]),
      tr([tcIta("questi treni (masc. plur.)",  { width: cw[0] }), tcIta("quei treni (masc. plur.)",  { width: cw[1] })]),
      tr([tcIta("queste strade (fem. plur.)",  { width: cw[0] }), tcIta("quelle strade (fem. plur.)",{ width: cw[1] })])
    ]
  }));
}
ch.push(blank());
ch.push(infoBanner(
  "Questo = este/esta (cerca de mi). Quello = ese/aquel (lejos de mi).",
  "Concuerdan en genero y numero con el sustantivo."
));
ch.push(blank());

// Nota cultural — Il Frecciarossa
ch.push(p("Nota cultural — Il Frecciarossa", { bold: true, sz: 26, color: TEAL }));
ch.push(infoBanner(
  "Il Frecciarossa e il treno ad alta velocita piu famoso d'Italia. Collega Milano e Roma in circa due ore e mezza, viaggiando a oltre 300 km/h. In Italia, il treno e spesso piu conveniente e piu veloce dell'aereo per le tratte interne."
));
ch.push(p("El Frecciarossa es el tren de alta velocidad mas famoso de Italia. Conecta Milan con Roma en alrededor de dos horas y media, a mas de 300 km/h. En Italia, el tren suele ser mas economico y rapido que el avion en los trayectos internos.", { italic: true }));
ch.push(blank());

// ══════════════════════════════════════════════════════════════════════════════
// ETAPA 3 — GRAMÁTICA
// ══════════════════════════════════════════════════════════════════════════════
ch.push(pgBreak());
ch.push(stageBanner("ETAPA 3", "Gramatica"));
ch.push(blank());

// ── 1 · Numeri ordinali ───────────────────────────────────────────────────────
ch.push(p("1 · Numeri ordinali", { bold: true, sz: 26, color: TEAL }));
{
  const cw = [800, 3400, 3400, 1760];
  ch.push(new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(["#", "Italiano masc.", "Italiano fem.", "Espanol"], cw),
      ...([
        ["1°","primo","prima","primero / primera"],
        ["2°","secondo","seconda","segundo / segunda"],
        ["3°","terzo","terza","tercero / tercera"],
        ["4°","quarto","quarta","cuarto / cuarta"],
        ["5°","quinto","quinta","quinto / quinta"],
        ["6°","sesto","sesta","sexto / sexta"],
        ["7°","settimo","settima","septimo / septima"],
        ["8°","ottavo","ottava","octavo / octava"],
        ["9°","nono","nona","noveno / novena"],
        ["10°","decimo","decima","decimo / decima"]
      ].map(([n, m, f, e]) => tr([
        tc(n, { width: cw[0], bold: true }),
        tcIta(m, { width: cw[1] }),
        tcIta(f, { width: cw[2] }),
        tc(e, { width: cw[3] })
      ])))
    ]
  }));
}
ch.push(blank());
ch.push(p("Ejercicios — Numeri ordinali", { bold: true }));
ch.push(feedbackTable([
  { q: "?Como se dice 'quinta parada'?",           ans: "quinta fermata",  fb: "!Esatto! quinta fermata." },
  { q: "'Prendo il ___ autobus.' (el segundo)",    ans: "secondo",         fb: "!Si! secondo = segundo." },
  { q: "?Cual es el ordinal de 7?",                ans: "settimo",         fb: "!Correcto! settimo = septimo." }
]));
ch.push(blank());

// ── 2 · Stare + gerundio ──────────────────────────────────────────────────────
ch.push(p("2 · Stare + gerundio", { bold: true, sz: 26, color: TEAL }));
{
  const cw = [1400, 1200, 3380, 3380];
  ch.push(new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(["Pronome", "Stare", "Gerundio -are", "Gerundio -ere/-ire"], cw),
      tr([tc("io",       {width:cw[0],bold:true}), tcIta("sto",    {width:cw[1]}), tcIta("camminando", {width:cw[2]}), tcIta("prendendo",  {width:cw[3]})]),
      tr([tc("tu",       {width:cw[0],bold:true}), tcIta("stai",   {width:cw[1]}), tcIta("aspettando", {width:cw[2]}), tcIta("scendendo",  {width:cw[3]})]),
      tr([tc("lui/lei",  {width:cw[0],bold:true}), tcIta("sta",    {width:cw[1]}), tcIta("viaggiando", {width:cw[2]}), tcIta("partendo",   {width:cw[3]})]),
      tr([tc("noi",      {width:cw[0],bold:true}), tcIta("stiamo", {width:cw[1]}), tcIta("guardando",  {width:cw[2]}), tcIta("bevendo",    {width:cw[3]})]),
      tr([tc("voi",      {width:cw[0],bold:true}), tcIta("state",  {width:cw[1]}), tcIta("parlando",   {width:cw[2]}), tcIta("scrivendo",  {width:cw[3]})]),
      tr([tc("loro",     {width:cw[0],bold:true}), tcIta("stanno", {width:cw[1]}), tcIta("arrivando",  {width:cw[2]}), tcIta("dormendo",   {width:cw[3]})])
    ]
  }));
}
ch.push(blank());
ch.push(p("Ejercicios — Stare + gerundio", { bold: true }));
ch.push(feedbackTable([
  { q: "?Como se dice 'Estamos viajando en tren'?",           ans: "Stiamo viaggiando in treno.", fb: "!Perfetto! stiamo + gerundio -ando." },
  { q: "?Cual es el gerundio de 'partire'?",                  ans: "partendo",                   fb: "!Correcto! partire → partendo." },
  { q: "'Sofia ___ guardando la mappa.' (ella)",              ans: "sta",                        fb: "!Si! sta = lui/lei." }
]));
ch.push(blank());

// ── 3 · Il pronome di luogo ci ────────────────────────────────────────────────
ch.push(p("3 · Il pronome di luogo ci", { bold: true, sz: 26, color: TEAL }));
ch.push(infoBanner("Ci reemplaza a 'a + lugar' o 'in + lugar'. Va antes del verbo."));
ch.push(blank());
ch.push(twoCol([
  ["Vado a Roma ogni anno. →",            "Ci vado ogni anno. (ci = a Roma)"],
  ["Sei mai stato a Venezia? →",          "Si, ci sono stato. (ci = a Venezia)"],
  ["Andiamo in stazione. →",              "Ci andiamo a piedi. (ci = in stazione)"]
], "Original", "Con ci"));
ch.push(blank());
ch.push(infoBanner("Ci vuole / Ci vogliono — para indicar tiempo: Ci vuole un'ora. / Ci vogliono due ore."));
ch.push(blank());
ch.push(p("Ejercicios — Pronome ci", { bold: true }));
ch.push(feedbackTable([
  { q: "'Vado spesso in centro.' → Con ci: '___ vado spesso.'",          ans: "Ci vado spesso.",          fb: "!Esatto! Ci vado spesso." },
  { q: "?Cuanto tiempo lleva? '___ vuole circa mezz'ora.'",              ans: "Ci vuole circa mezz'ora.", fb: "!Correcto! Ci vuole circa mezz'ora." },
  { q: "'Non sono mai andato a Napoli.' → 'Non ___ sono mai andato.'",  ans: "ci",                       fb: "!Perfetto! ci si mette prima del verbo ausiliare." }
]));
ch.push(blank());

// ── 4 · Imperativo informale ──────────────────────────────────────────────────
ch.push(p("4 · Imperativo informale (tu)", { bold: true, sz: 26, color: TEAL }));
{
  const cw = [1900, 1600, 3400, 2460];
  ch.push(new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(["Infinito", "Imperativo", "Ejemplo", "Nota"], cw),
      ...([
        ["guardare",    "guarda!",   "Guarda a destra!",     "regular"],
        ["aspettare",   "aspetta!",  "Aspetta qui!",          "regular"],
        ["girare",      "gira!",     "Gira a sinistra!",      "regular"],
        ["prendere",    "prendi!",   "Prendi il treno!",      "regular"],
        ["scendere",    "scendi!",   "Scendi alla prossima!", "regular"],
        ["partire",     "parti!",    "Parti subito!",         "regular"],
        ["seguire",     "segui!",    "Segui la strada!",      "regular"],
        ["andare",      "vai!",      "Vai dritto!",           "irregolare"],
        ["venire",      "vieni!",    "Vieni con me!",         "irregolare"],
        ["fare",        "fai!",      "Fai attenzione!",       "irregolare"]
      ].map(([inf, imp, ej, nota]) => tr([
        tcIta(inf,  { width: cw[0] }),
        tcIta(imp,  { width: cw[1], bold: true }),
        tcIta(ej,   { width: cw[2] }),
        tc(nota,    { width: cw[3], italic: true, color: nota === "irregolare" ? RED : "555555" })
      ])))
    ]
  }));
}
ch.push(blank());
ch.push(infoBanner(
  "-ARE: imperativo = 3a persona singular del presente (guarda, aspetta, gira).",
  "-ERE/-IRE: imperativo = 2a persona singular del presente (prendi, scendi, parti).",
  "Irregolari: andare→vai, venire→vieni, fare→fai."
));
ch.push(blank());
ch.push(p("Ejercicios — Imperativo informale", { bold: true }));
ch.push(feedbackTable([
  { q: "?Como le decis a un amigo '!Toma el metro!'?",                             ans: "Prendi la metro!",  fb: "!Si! prendi es el imperativo de prendere." },
  { q: "?Cual es el imperativo de 'andare' para vos?",                             ans: "vai",               fb: "!Correcto! vai es la forma irregolare de andare." },
  { q: "Tu amigo busca la stazione. Le decis: '___ dritto e poi ___ a sinistra.'", ans: "Vai / gira",        fb: "!Perfetto! vai (andare irreg.) + gira (-are regular)." }
]));
ch.push(blank());

// ── 5 · Pronomi dimostrativi: questo / quello ─────────────────────────────────
ch.push(p("5 · Pronomi dimostrativi: questo / quello", { bold: true, sz: 26, color: TEAL }));
{
  const cw = [2000, 1700, 1700, 1900, 1960];
  ch.push(new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(["Tipo", "Masc.sing", "Fem.sing", "Masc.plur", "Fem.plur"], cw),
      tr([
        tc("QUESTO (cerca)", { width: cw[0], bold: true, fill: LTEAL }),
        tcIta("questo",  { width: cw[1] }), tcIta("questa", { width: cw[2] }),
        tcIta("questi",  { width: cw[3] }), tcIta("queste", { width: cw[4] })
      ]),
      tr([
        tc("QUELLO (lontano)", { width: cw[0], bold: true }),
        tcIta("quello / quel", { width: cw[1] }), tcIta("quella", { width: cw[2] }),
        tcIta("quelli / quei", { width: cw[3] }), tcIta("quelle", { width: cw[4] })
      ])
    ]
  }));
}
ch.push(blank());
ch.push(infoBanner(
  "Antes de sustantivo, quello sigue el patron del articulo:",
  "quel treno, quello zaino, quell'aereo, quella macchina, quei treni, quegli autobus, quelle strade."
));
ch.push(blank());
ch.push(p("Ejercicios — questo / quello", { bold: true }));
ch.push(feedbackTable([
  { q: "El boleto esta cerca de vos. '___ biglietto e mio.' (masc. sing., cerca)", ans: "Questo biglietto e mio.",  fb: "!Si! questo porque esta cerca y es masculino." },
  { q: "Senalas una estacion a lo lejos: '___ stazione e bellissima.'",            ans: "Quella stazione e bellissima.", fb: "!Correcto! quella = lejano + femenino." },
  { q: "?Como se dice 'esos trenes' (lejos, masculino plural)?",                   ans: "quei treni",             fb: "!Si! quei treni = esos trenes (lejos, masc. plur.)." }
]));
ch.push(blank());

// ── 6 · Pronomi diretti ───────────────────────────────────────────────────────
ch.push(p("6 · Pronomi diretti: lo, la, li, le", { bold: true, sz: 26, color: TEAL }));
ch.push(twoCol([
  ["lo (masc. sing.)", "Prendo il biglietto → Lo prendo."],
  ["la (fem. sing.)",  "Aspetto la fermata → La aspetto."],
  ["li (masc. plur.)", "Compro i biglietti → Li compro."],
  ["le (fem. plur.)",  "Aspetto le ragazze → Le aspetto."]
], "Pronome", "Ejemplo"));
ch.push(blank());
ch.push(infoBanner(
  "El pronome diretto va ANTES del verbo conjugado: Lo prendo, La vedo.",
  "Con infinitivo va PEGADO al final (sin -e): Devo prenderlo. (Debo tomarlo.)"
));
ch.push(blank());
ch.push(p("Ejercicios — Pronomi diretti", { bold: true }));
ch.push(feedbackTable([
  { q: "'Aspetto il treno.' → Con pronome: '___ aspetto.'",   ans: "Lo aspetto.",   fb: "!Esatto! il treno → lo (masc. sing.)." },
  { q: "'Compro le valigie.' → '___ compro.'",               ans: "Le compro.",    fb: "!Correcto! le valigie → le (fem. plur.)." },
  { q: "'Devo comprare il biglietto.' → 'Devo comprar___'",  ans: "comprarlo",     fb: "!Si! comprare – e + lo = comprarlo." }
]));
ch.push(blank());

// ── 7 · Fonetica — Coppie minime ─────────────────────────────────────────────
ch.push(p("7 · Fonetica — Coppie minime", { bold: true, sz: 26, color: TEAL }));
{
  const cw = [1200, 4080, 4080];
  ch.push(new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: cw,
    rows: [
      hrow(["Coppia", "Palabra 1", "Palabra 2"], cw),
      tr([tc("v / b", {width:cw[0],bold:true}), tcIta("vino (vino)", {width:cw[1]}),   tcIta("bino (anden)",           {width:cw[2]})]),
      tr([tc("p / b", {width:cw[0],bold:true}), tcIta("panca (banco de iglesia)", {width:cw[1]}), tcIta("banca (banco)", {width:cw[2]})]),
      tr([tc("v / f", {width:cw[0],bold:true}), tcIta("vino (vino)", {width:cw[1]}),   tcIta("fino (hasta / fino)",    {width:cw[2]})]),
      tr([tc("t / d", {width:cw[0],bold:true}), tcIta("tetto (techo)", {width:cw[1]}), tcIta("detto (dicho)",          {width:cw[2]})])
    ]
  }));
}
ch.push(blank());
ch.push(infoBanner("Coppie minime = dos palabras que se diferencian solo por un sonido. Practicar estas diferencias mejora la pronunciacion."));
ch.push(blank());
ch.push(p("Ejercicios — Fonetica", { bold: true }));
ch.push(feedbackTable([
  { q: "?Que sonido inicial tiene 'bino'?",                          ans: "Sonido /b/ (como 'bello')",            fb: "!Correcto! b es oclusivo bilabial — ambos labios juntos." },
  { q: "?Cual es la diferencia entre 'tetto' y 'detto'?",           ans: "La consonante inicial: t vs. d",      fb: "!Si! t/d: tetto empieza con t (sorda) y detto con d (sonora)." }
]));
ch.push(blank());

// ══════════════════════════════════════════════════════════════════════════════
// BUILD DOCUMENT
// ══════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  styles: {
    default: { document: { run: { font: FONTS, size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: FONTS, color: "FFFFFF" },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 }
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

const outPath = path.join(__dirname, "modulo9_in_treno.docx");
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("OK: " + outPath);
}).catch(e => { console.error("ERROR:", e.message); process.exit(1); });
