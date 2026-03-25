const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, PageBreak, HeadingLevel, LevelFormat,
  ImageRun, ExternalHyperlink
} = require('docx');
const fs = require('fs');

// ── Brand Colors (IPP) ──────────────────────────────────────────────
const C = {
  amber:    'E5AB07',
  amberPale:'FEF9E8',
  gold:     'EFCF7F',
  goldPale: 'FEF0C0',
  red:      'CC4736',
  redPale:  'FDE4E1',
  teal:     '78A6BA',
  tealPale: 'DEEEF5',
  green:    '528E74',
  greenPale:'C8E8DE',
  cream:    'E9E6D5',
  creamDk:  'DDD9C8',
  black:    '1A1A18',
  white:    'FFFFFF',
  navyBlue: '17365D',
};

// Unit colors cycle: amber, red, teal, green
const unitColors = [
  { main: C.amber,  pale: C.amberPale,  text: C.black },
  { main: C.red,    pale: C.redPale,    text: C.white },
  { main: C.teal,   pale: C.tealPale,   text: C.black },
  { main: C.green,  pale: C.greenPale,  text: C.white },
  { main: C.amber,  pale: C.amberPale,  text: C.black },
  { main: C.red,    pale: C.redPale,    text: C.white },
  { main: C.teal,   pale: C.tealPale,   text: C.black },
  { main: C.green,  pale: C.greenPale,  text: C.white },
  { main: C.amber,  pale: C.amberPale,  text: C.black },
  { main: C.red,    pale: C.redPale,    text: C.white },
];

// ── Unit Data ───────────────────────────────────────────────────────
const units = [
  {
    n: 1, emoji: '✈', title: "All'aeroporto",
    objetivo: "Entender el entorno del aeropuerto y familiarizarse con vocabulario básico de viaje.",
    vocabulario: "Aeropuerto, salida (uscita), pasaporte, carteles y anuncios.",
    gramatica: "Presente de indicativo (ser/estar), artículos determinados e indeterminados singulares.",
    comunicacion: "Entender el entorno del aeropuerto, preguntar direcciones (\"Dov'è l'uscita?\"), presentar documentos.",
    fonetica: "Pronunciación de la 'c' y 'g' ante a, o, u y e, i.",
    juego: "Escape Room: Desbloquea la salida del aeropuerto encontrando las palabras clave en los carteles.",
    produccion: "Completar y leer un pasaporte ficticio; lectura de anuncios reales.",
    tip: "Cómo son los controles de seguridad y aduana en Italia.",
    frases: ["Dov'è l'uscita?", "Ecco il mio passaporto.", "Dove si ritira il bagaglio?"],
    ciudad: "Roma",
  },
  {
    n: 2, emoji: '🛫', title: "In aereo",
    objetivo: "Interactuar con el personal de vuelo y comprender el vocabulario de a bordo.",
    vocabulario: "Objetos y personas en el avión, agua, malestar físico.",
    gramatica: "Verbos modales (volere), expresiones de cortesía, presente de verbos regulares.",
    comunicacion: "Interactuar con el personal de vuelo, pedir algo por favor, expresar necesidades básicas.",
    fonetica: "Sonidos de 'gn' (como en 'bagno') y 'gl' (como en 'figli').",
    juego: "Tablero interactivo: Asocia imágenes de objetos del avión con su nombre en italiano.",
    produccion: "Grabación de un mini diálogo simulando una interacción con el asistente de vuelo.",
    tip: "Bebidas y costumbres típicas en los vuelos italianos.",
    frases: ["Vorrei dell'acqua, per favore.", "Mi sento male.", "Scusi, posso passare?"],
    ciudad: "Milán",
  },
  {
    n: 3, emoji: '🛃', title: "Finalmente in Italia",
    objetivo: "Completar los trámites de aduana y reconocer los medios de transporte público.",
    vocabulario: "Medios de transporte, migraciones, motivo del viaje, duración de la estancia.",
    gramatica: "Preposiciones de lugar (a, in, da), interrogativos (quante, dove).",
    comunicacion: "Responder preguntas en aduana y migraciones, identificar medios de transporte público.",
    fonetica: "Diferencia entre vocales abiertas y cerradas.",
    juego: "Misión: Responde correctamente a las preguntas del oficial de aduanas para entrar al país.",
    produccion: "Escritura: Armar respuestas propias para una entrevista de entrada al país.",
    tip: "Normas de comportamiento ante la policía de fronteras.",
    frases: ["Sono in vacanza.", "Mi fermo per dieci giorni.", "Ho niente da dichiarare."],
    ciudad: "Nápoles",
  },
  {
    n: 4, emoji: '🚄', title: "Alla stazione",
    objetivo: "Comprar pasajes, leer horarios y navegar la red ferroviaria italiana.",
    vocabulario: "Andén (binario), boleto (biglietto), validación (convalida), tipos de trenes (Regionale, Frecciarossa).",
    gramatica: "Números del 1 al 100, la hora y horarios ferroviarios.",
    comunicacion: "Sacar un pasaje, preguntar por cambios de andén, validar el boleto.",
    fonetica: "Pronunciación de la 'z' sorda y sonora (stazione, grazie).",
    juego: "Simulador de compra: Selecciona el tren correcto y el horario en una máquina virtual.",
    produccion: "Escucha: Identificar información de partidas y cambios de vía en audios de estación.",
    tip: "¡No te olvides de convalidar el boleto antes de subir al tren!",
    frases: ["Un biglietto per Firenze, per favore.", "Da che binario parte il treno?", "Devo fare il cambio?"],
    ciudad: "Florencia",
  },
  {
    n: 5, emoji: '🗺', title: "In città",
    objetivo: "Orientarse en una ciudad italiana, pedir y dar direcciones con soltura.",
    vocabulario: "Direcciones (derecha, izquierda, derecho), museo, plazas, semáforo, puente.",
    gramatica: "Imperativo formal (direcciones), preposiciones articuladas.",
    comunicacion: "Pedir indicaciones, orientarse con un mapa, leer carteles callejeros.",
    fonetica: "Combinaciones de 'sc' (pesce, scusa).",
    juego: "Mapa interactivo: Sigue las instrucciones de audio para llegar a un monumento famoso.",
    produccion: "Circuito turístico: Responder preguntas basadas en un recorrido por una ciudad real.",
    tip: "Organización urbanística de las ciudades italianas (el centro histórico).",
    frases: ["Scusi, dov'è il Colosseo?", "Giri a destra, poi vada dritto.", "È lontano da qui?"],
    ciudad: "Venecia",
  },
  {
    n: 6, emoji: '☕', title: "Al bar",
    objetivo: "Pedir y pagar en la barra italiana, dominando el ritual del café.",
    vocabulario: "Café (espresso, macchiato), cornetto, bebidas, aperitivo, barra, cuenta.",
    gramatica: "Verbo 'piacere', presente de verbos irregulares (bere), uso de 'ci vuole'.",
    comunicacion: "Pedir y pagar en la barra, diferenciar tipos de café, pedir algo para llevar.",
    fonetica: "Diptongos y sonidos de 'qu' (aquí, este).",
    juego: "Menú virtual: Arrastra los ingredientes para preparar los distintos tipos de café italiano.",
    produccion: "Simulación: Armar un pedido completo de desayuno o aperitivo.",
    tip: "El ritual del café en la barra y el concepto del aperitivo.",
    frases: ["Un caffè, per favore.", "Quanto costa?", "Un cornetto con la crema, grazie."],
    ciudad: "Bolonia",
  },
  {
    n: 7, emoji: '🍝', title: "Al ristorante",
    objetivo: "Reservar mesa, pedir platos y manejarse con el menú italiano de principio a fin.",
    vocabulario: "Menú (antipasto, primo, secondo, contorno), reserva, cuenta, propina, cubierto (coperto).",
    gramatica: "Condicional de cortesía (vorrei), partitivos (un poco de), plurales de sustantivos.",
    comunicacion: "Reservar una mesa, pedir sugerencias al camarero, pagar con tarjeta.",
    fonetica: "Sonido de 'gh' (spaghetti).",
    juego: "Cena virtual: Ordena los platos de un menú típico italiano en la secuencia correcta.",
    produccion: "Escritura: Redactar un correo electrónico para reservar mesa o simular una reserva telefónica.",
    tip: "Significado del 'coperto' y costumbres sobre las propinas en Italia.",
    frases: ["Vorrei prenotare un tavolo.", "Cosa mi consiglia?", "Il conto, per favore."],
    ciudad: "Turín",
  },
  {
    n: 8, emoji: '🏨', title: "In albergo",
    objetivo: "Gestionar el check-in, describir el alojamiento y resolver imprevistos en el hotel.",
    vocabulario: "Check-in, reservación, habitación (singola, doppia), ducha, impuestos turísticos.",
    gramatica: "Posesivos (mio, tuo, suo), adjetivos para describir problemas (roto, ruidoso).",
    comunicacion: "Realizar el registro de entrada, reportar que algo no funciona (ej. la ducha).",
    fonetica: "Acentos gráficos y tónicos.",
    juego: "Recepcionista por un día: Completa los formularios de los huéspedes con la información que escuchas.",
    produccion: "Completar un formulario de check-in con datos personales.",
    tip: "Impuestos turísticos municipales y el típico desayuno de hotel.",
    frases: ["Ho una prenotazione a nome...", "La doccia non funziona.", "A che ora è la colazione?"],
    ciudad: "Palermo",
  },
  {
    n: 9, emoji: '🚨', title: "Imprevisti",
    objetivo: "Reaccionar ante emergencias, describir síntomas y pedir ayuda en situaciones inesperadas.",
    vocabulario: "Emergencia, farmacia, síntomas (fiebre, náuseas), médico, pérdida/robo.",
    gramatica: "Pasado próximo (acciones finalizadas), interrogativos complejos.",
    comunicacion: "Expresar una emergencia, pedir ayuda médica, describir síntomas físicos en la farmacia.",
    fonetica: "Entonación en frases exclamativas de urgencia.",
    juego: "Trivia de emergencias: ¿A qué número llamas? Asocia el problema con el servicio correcto.",
    produccion: "Repaso general: Responder a situaciones de imprevistos presentadas en tarjetas.",
    tip: "Números de emergencia (112, 113, 118) y funcionamiento de farmacias de turno.",
    frases: ["Ho bisogno di un medico.", "Mi hanno rubato il portafoglio.", "Ho la febbre alta."],
    ciudad: "Bari",
  },
  {
    n: 10, emoji: '🛍', title: "L'ultima serata",
    objetivo: "Hacer compras, negociar precios y llevarse lo mejor del Made in Italy.",
    vocabulario: "Shopping, tallas (taglia), precios, descuentos, Made in Italy, mercados.",
    gramatica: "Comparativos (más/menos que), demostrativos (questo/quello).",
    comunicacion: "Preguntar por tallas y colores, pedir un descuento, preguntar si se puede probar una prenda.",
    fonetica: "Consonantes dobles.",
    juego: "Shopping Tour: Encuentra productos 'Made in Italy' auténticos en un mercado virtual.",
    produccion: "Actividad final: Simulación de compras en una feria típica como Campo de' Fiori.",
    tip: "El valor del 'Made in Italy' y cómo reconocer productos auténticos.",
    frases: ["Quanto costa questo?", "Ce l'ha in taglia M?", "Posso provarlo?"],
    ciudad: "toda Italia",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────
const cellBorder = (color) => ({ style: BorderStyle.SINGLE, size: 1, color });
const noBorder   = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

function hdCell(text, bgColor, textColor, widthDXA, bold = true, fontSize = 22) {
  return new TableCell({
    width: { size: widthDXA, type: WidthType.DXA },
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 160, right: 160 },
    borders: { top: cellBorder('CCCCCC'), bottom: cellBorder('CCCCCC'), left: cellBorder('CCCCCC'), right: cellBorder('CCCCCC') },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text, bold, color: textColor, font: 'Georgia', size: fontSize })]
    })]
  });
}

function dataCell(lines, bgColor, textColor, widthDXA, bold = false) {
  const children = [];
  if (Array.isArray(lines)) {
    lines.forEach((line, i) => {
      children.push(new Paragraph({
        spacing: { after: i < lines.length - 1 ? 60 : 0 },
        children: [new TextRun({ text: line, color: textColor, font: 'Calibri', size: 18, bold })]
      }));
    });
  } else {
    children.push(new Paragraph({
      children: [new TextRun({ text: lines, color: textColor, font: 'Calibri', size: 18, bold })]
    }));
  }
  return new TableCell({
    width: { size: widthDXA, type: WidthType.DXA },
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 160, right: 160 },
    borders: { top: cellBorder('CCCCCC'), bottom: cellBorder('CCCCCC'), left: cellBorder('CCCCCC'), right: cellBorder('CCCCCC') },
    children
  });
}

// ── Build Document ───────────────────────────────────────────────────
const children = [];

// ═══════════════════════════════════════════════
// COVER PAGE
// ═══════════════════════════════════════════════
children.push(new Paragraph({
  pageBreakBefore: false,
  alignment: AlignmentType.CENTER,
  spacing: { before: 2880, after: 120 },
  children: [new TextRun({ text: 'VIAJEROS', font: 'Georgia', size: 96, bold: true, color: C.amber, italics: true })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 240 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.gold, space: 6 } },
  children: [new TextRun({ text: 'Cuadernillo de Italiano para Turistas', font: 'Calibri', size: 32, color: C.black })]
}));
children.push(new Paragraph({ spacing: { before: 480, after: 120 } }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 240, after: 120 },
  children: [new TextRun({ text: 'Un viaje por las ciudades de Italia', font: 'Georgia', size: 28, italics: true, color: C.black })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 120, after: 1200 },
  children: [new TextRun({ text: '10 unidades · Nivel A1 · Escape room didáctico', font: 'Calibri', size: 22, color: '888888' })]
}));

// City strip (cover decorative table)
const coverCities = ['Roma','Milán','Nápoles','Florencia','Venecia','Bolonia','Turín','Palermo','Bari','toda Italia'];
const coverColors = [C.amber, C.red, C.teal, C.green, C.amber, C.red, C.teal, C.green, C.amber, C.red];
const coverTextC  = [C.black, C.white, C.black, C.white, C.black, C.white, C.black, C.white, C.black, C.white];
const cW = 936; // 9360 / 10
children.push(new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: Array(10).fill(cW),
  rows: [new TableRow({
    children: coverCities.map((city, i) => new TableCell({
      width: { size: cW, type: WidthType.DXA },
      shading: { fill: coverColors[i], type: ShadingType.CLEAR },
      margins: { top: 100, bottom: 100, left: 60, right: 60 },
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `${i + 1}`, font: 'Georgia', size: 24, bold: true, color: coverTextC[i], break: 0 }),
          new TextRun({ text: city, font: 'Calibri', size: 14, color: coverTextC[i], break: 1 }),
        ]
      })]
    }))
  })]
}));

children.push(new Paragraph({ spacing: { before: 1440, after: 120 } }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Italiano Per Piacere', font: 'Georgia', size: 20, italics: true, color: C.amber })]
}));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ═══════════════════════════════════════════════
// PAGE 2: CONCEPT + OVERVIEW
// ═══════════════════════════════════════════════
children.push(new Paragraph({
  spacing: { before: 480, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.gold, space: 4 } },
  children: [
    new TextRun({ text: '¿Cómo funciona ', font: 'Georgia', size: 36, bold: true, italics: true, color: C.black }),
    new TextRun({ text: 'Viajeros', font: 'Georgia', size: 36, bold: true, italics: true, color: C.amber }),
    new TextRun({ text: '?', font: 'Georgia', size: 36, bold: true, italics: true, color: C.black }),
  ]
}));
children.push(new Paragraph({
  spacing: { before: 280, after: 180 },
  children: [new TextRun({
    text: 'Este cuadernillo está diseñado como un escape room didáctico. Cada unidad es una etapa de un viaje real por Italia: empezás en el aeropuerto y terminás comprando recuerdos en un mercado. A medida que avanzás, desbloqueás nuevas ciudades y competencias lingüísticas.',
    font: 'Calibri', size: 22, color: C.black
  })]
}));
children.push(new Paragraph({
  spacing: { before: 100, after: 280 },
  children: [new TextRun({
    text: 'Cada unidad integra vocabulario específico, frases clave, actividades interactivas en Genially, un ejercicio de producción y un tip cultural que te ayuda a moverte con soltura en el contexto local.',
    font: 'Calibri', size: 22, color: C.black
  })]
}));

// Overview table
children.push(new Paragraph({
  spacing: { before: 360, after: 200 },
  children: [new TextRun({ text: 'Mapa del viaje', font: 'Georgia', size: 28, bold: true, italics: true, color: C.black })]
}));

const overviewRows = [
  new TableRow({
    tableHeader: true,
    children: [
      hdCell('N°',    C.black, C.white, 500,  true, 18),
      hdCell('Unidad',C.black, C.white, 2500, true, 18),
      hdCell('Ciudad',C.black, C.white, 1500, true, 18),
      hdCell('Objetivo',C.black, C.white, 4860, true, 18),
    ]
  }),
  ...units.map((u, i) => new TableRow({
    children: [
      hdCell(`${u.n}`,     unitColors[i].pale, C.black, 500,  false, 18),
      hdCell(`${u.emoji} ${u.title}`, unitColors[i].pale, C.black, 2500, true,  18),
      hdCell(u.ciudad,     C.white, C.black, 1500, false, 18),
      dataCell(u.objetivo, C.white, C.black, 4860),
    ]
  }))
];

children.push(new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [500, 2500, 1500, 4860],
  rows: overviewRows
}));

children.push(new Paragraph({ children: [new PageBreak()] }));

// ═══════════════════════════════════════════════
// UNIT PAGES
// ═══════════════════════════════════════════════
units.forEach((u, idx) => {
  const col  = unitColors[idx];
  const W    = 9360;
  const LBL  = 2800; // label column
  const VAL  = W - LBL; // value column

  // Unit header
  children.push(new Paragraph({
    spacing: { before: 0, after: 0 },
    children: [new TextRun({ text: `  UNIDAD ${u.n}  `, font: 'Calibri', size: 18, bold: true, color: col.text === C.white ? C.white : C.black, highlight: undefined })]
  }));

  children.push(new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: col.main, type: ShadingType.CLEAR },
        margins: { top: 200, bottom: 200, left: 280, right: 280 },
        borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
        children: [
          new Paragraph({
            spacing: { before: 0, after: 80 },
            children: [new TextRun({ text: `UNIDAD ${u.n}`, font: 'Calibri', size: 20, bold: true, color: col.text === C.white ? C.white : '555555' })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [new TextRun({ text: `${u.emoji}  ${u.title}`, font: 'Georgia', size: 48, bold: true, italics: true, color: col.text === C.white ? C.white : C.black })]
          }),
          new Paragraph({
            children: [new TextRun({ text: `Ciudad: ${u.ciudad}`, font: 'Calibri', size: 20, italics: true, color: col.text === C.white ? 'EEEEEE' : '555555' })]
          }),
        ]
      })]
    })]
  }));

  // Objetivo
  children.push(new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: col.pale, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 280, right: 280 },
        borders: { top: noBorder, bottom: { style: BorderStyle.SINGLE, size: 2, color: col.main }, left: noBorder, right: noBorder },
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'Objetivo: ', font: 'Calibri', size: 20, bold: true, color: C.black }),
            new TextRun({ text: u.objetivo, font: 'Calibri', size: 20, color: C.black }),
          ]
        })]
      })]
    })]
  }));

  // Spacer
  children.push(new Paragraph({ spacing: { before: 120, after: 0 } }));

  // Main content table
  const rows = [
    ['📚  Vocabulario',    u.vocabulario,    C.white],
    ['📖  Gramática',      u.gramatica,      col.pale],
    ['💬  Comunicación',   u.comunicacion,   C.white],
    ['🔊  Fonética',       u.fonetica,       col.pale],
    ['🎮  Juego Genially', u.juego,          C.white],
    ['✍   Producción',     u.produccion,     col.pale],
  ];

  children.push(new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [LBL, VAL],
    rows: rows.map(([label, value, bg]) => new TableRow({
      children: [
        new TableCell({
          width: { size: LBL, type: WidthType.DXA },
          shading: { fill: col.pale, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 200, right: 160 },
          borders: { top: cellBorder('CCCCCC'), bottom: cellBorder('CCCCCC'), left: noBorder, right: cellBorder(col.main) },
          verticalAlign: VerticalAlign.TOP,
          children: [new Paragraph({
            children: [new TextRun({ text: label, font: 'Calibri', size: 20, bold: true, color: C.black })]
          })]
        }),
        new TableCell({
          width: { size: VAL, type: WidthType.DXA },
          shading: { fill: bg, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 200, right: 200 },
          borders: { top: cellBorder('CCCCCC'), bottom: cellBorder('CCCCCC'), left: noBorder, right: noBorder },
          verticalAlign: VerticalAlign.TOP,
          children: [new Paragraph({
            children: [new TextRun({ text: value, font: 'Calibri', size: 20, color: C.black })]
          })]
        }),
      ]
    }))
  }));

  // Frases clave
  children.push(new Paragraph({ spacing: { before: 200, after: 80 } }));
  children.push(new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    rows: [
      new TableRow({
        children: [new TableCell({
          width: { size: W, type: WidthType.DXA },
          shading: { fill: col.main, type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 240, right: 240 },
          borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
          children: [new Paragraph({
            children: [new TextRun({ text: 'Frases clave', font: 'Georgia', size: 22, bold: true, italics: true, color: col.text === C.white ? C.white : C.black })]
          })]
        })]
      }),
      new TableRow({
        children: [new TableCell({
          width: { size: W, type: WidthType.DXA },
          shading: { fill: col.pale, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 240, right: 240 },
          borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
          children: u.frases.map(f => new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
              new TextRun({ text: '» ', font: 'Calibri', size: 20, color: col.main }),
              new TextRun({ text: f, font: 'Georgia', size: 22, italics: true, bold: true, color: C.black }),
            ]
          }))
        })]
      })
    ]
  }));

  // Tip cultural
  children.push(new Paragraph({ spacing: { before: 200, after: 80 } }));
  children.push(new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { fill: C.goldPale, type: ShadingType.CLEAR },
        margins: { top: 160, bottom: 160, left: 280, right: 280 },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: C.amber },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: C.amber },
          left: { style: BorderStyle.SINGLE, size: 12, color: C.amber },
          right: noBorder
        },
        children: [
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: '🇮🇹  Tip Cultural', font: 'Calibri', size: 22, bold: true, color: '7a5500' })]
          }),
          new Paragraph({
            children: [new TextRun({ text: u.tip, font: 'Calibri', size: 20, color: C.black })]
          }),
        ]
      })]
    })]
  }));

  // Page break (except last)
  if (idx < units.length - 1) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }
});

// ═══════════════════════════════════════════════
// FINAL PAGE: Next steps
// ═══════════════════════════════════════════════
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(new Paragraph({
  spacing: { before: 1440, after: 400 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: '¡Benvenuto in Italia!', font: 'Georgia', size: 52, bold: true, italics: true, color: C.amber })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 200 },
  children: [new TextRun({ text: 'Completaste el recorrido de Viajeros.', font: 'Calibri', size: 26, color: C.black })]
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 120, after: 480 },
  children: [new TextRun({ text: 'Ahora estás listo/a para tu próximo viaje a Italia.', font: 'Georgia', size: 24, italics: true, color: '555555' })]
}));

// Skills earned table
const skills = [
  ['✈', 'Aeropuerto y vuelo'],
  ['🚄', 'Trenes y ciudad'],
  ['☕', 'Bar y restaurante'],
  ['🏨', 'Alojamiento'],
  ['🚨', 'Emergencias'],
  ['🛍', 'Shopping'],
];
children.push(new Table({
  width: { size: 6000, type: WidthType.DXA },
  columnWidths: [600, 2400, 600, 2400],
  rows: [
    new TableRow({
      children: skills.slice(0,2).map(([e, s]) => [
        hdCell(e, C.gold, C.black, 600, false, 28),
        dataCell(s, C.amberPale, C.black, 2400, true),
      ]).flat()
    }),
    new TableRow({
      children: skills.slice(2,4).map(([e, s]) => [
        hdCell(e, C.gold, C.black, 600, false, 28),
        dataCell(s, C.amberPale, C.black, 2400, true),
      ]).flat()
    }),
    new TableRow({
      children: skills.slice(4,6).map(([e, s]) => [
        hdCell(e, C.gold, C.black, 600, false, 28),
        dataCell(s, C.amberPale, C.black, 2400, true),
      ]).flat()
    }),
  ]
}));

children.push(new Paragraph({ spacing: { before: 600, after: 120 }, alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.gold } } }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 160 },
  children: [new TextRun({ text: 'Italiano Per Piacere  ·  italianoperpiacere.com', font: 'Calibri', size: 18, color: '999999', italics: true })]
}));

// ═══════════════════════════════════════════════
// ASSEMBLE DOC
// ═══════════════════════════════════════════════
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 22, color: C.black } }
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: 'Georgia', size: 36, bold: true, italics: true, color: C.black },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 }
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } // 2cm margins
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.gold, space: 4 } },
          children: [
            new TextRun({ text: 'VIAJEROS  ', font: 'Georgia', size: 16, italics: true, color: C.amber }),
            new TextRun({ text: '·  Italiano Per Piacere', font: 'Calibri', size: 16, color: '999999' }),
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: C.creamDk, space: 4 } },
          children: [
            new TextRun({ text: 'Página ', font: 'Calibri', size: 16, color: '999999' }),
            new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 16, color: '999999' }),
          ]
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('C:/Users/User/Desktop/VIAJEROS_IPP.docx', buffer);
  console.log('✅ VIAJEROS_IPP.docx creado en el Escritorio');
}).catch(err => {
  console.error('Error:', err.message);
});
