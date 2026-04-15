const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak
} = require('docx');
const fs = require('fs');

// ─── All module dialogs ───────────────────────────────────────────────────────

const modules = [
  {
    number: 0,
    title: 'Come ti chiami?',
    lines: [
      { speaker: 'Graziana', text: 'Ciao! Mi chiamo Graziana. E tu, come ti chiami?' },
      { speaker: 'Marco',    text: 'Ciao! Piacere! Mi chiamo Marco.' },
      { speaker: 'Graziana', text: 'Bello! Come si scrive il tuo nome?' },
      { speaker: 'Marco',    text: 'M come Milano, A come Ancona, R come Roma, C come Como, O come Otranto. Marco!' },
      { speaker: 'Graziana', text: 'Perfetto! E tu, come si scrive il mio nome?' },
      { speaker: 'Marco',    text: 'Mmm\u2026 G come Genova, R come Roma, A come Ancona, Z come Zara, I come Imola, A come Ancona. Graziana! Giusto?' },
      { speaker: 'Graziana', text: 'Bravissimo! Arrivederci, Marco!' },
      { speaker: 'Marco',    text: 'A presto, Graziana! Buonasera!' },
    ]
  },
  {
    number: 1,
    title: 'Di dove sei?',
    lines: [
      { speaker: 'Giulia', text: 'Quali sono secondo te le citt\u00e0 pi\u00f9 famose d\u2019Italia?' },
      { speaker: 'Marco',  text: 'Roma, Venezia, Milano e Napoli, credo. Anche Firenze, ovviamente.' },
      { speaker: 'Giulia', text: 'E Venezia? Perch\u00e9 \u00e8 cos\u00ec famosa?' },
      { speaker: 'Marco',  text: 'Venezia \u00e8 la citt\u00e0 dell\u2019acqua. Ci sono le gondole e non si trovano automobili. \u00c8 unica al mondo!' },
      { speaker: 'Giulia', text: 'E Roma? Perch\u00e9 \u00e8 famosa Roma?' },
      { speaker: 'Marco',  text: 'Roma \u00e8 la capitale d\u2019Italia. Il Colosseo, Piazza Navona, il Vaticano... \u00e8 la storia del mondo!' },
      { speaker: 'Giulia', text: 'E tu, di dove sei, Marco?' },
      { speaker: 'Marco',  text: 'Io sono di Torino. E tu, Giulia? Di dove sei?' },
      { speaker: 'Giulia', text: 'Io sono di Firenze! Michelangelo, gli Uffizi, il Ponte Vecchio... un museo a cielo aperto!' },
      { speaker: 'Marco',  text: 'Bellissima citt\u00e0! Hai il numero di telefono di quella guida turistica?' },
      { speaker: 'Giulia', text: 'S\u00ec, aspetta. Il suo numero \u00e8 zero cinque quattro tre, due sette otto, novanta.' },
      { speaker: 'Marco',  text: 'Grazie mille, Giulia!' },
      { speaker: 'Giulia', text: 'Prego! Buon viaggio a Roma!' },
    ]
  },
  {
    number: 2,
    title: 'Mi dai il tuo numero?',
    lines: [
      { speaker: 'Giulia',       text: 'Buongiorno, come posso esservi utile?' },
      { speaker: 'Sig. Baldini', text: 'Abbiamo prenotato una camera a nome Baldini.' },
      { speaker: 'Giulia',       text: 'Buongiorno signori Baldini, benvenuti al Casalunga Golf Resort. Il mio nome \u00e8 Giulia. \u00c8 andato bene il viaggio?' },
      { speaker: 'Sig. Baldini', text: 'S\u00ec, grazie. Non abbiamo trovato traffico.' },
      { speaker: 'Giulia',       text: 'Che fortuna! Abbiamo riservato per voi una junior suite per due notti con trattamento camera e colazione. Abbiamo aggiunto una culla per vostro figlio.' },
      { speaker: 'Sig. Baldini', text: 'Grazie. Ci ricorda il prezzo, gentilmente?' },
      { speaker: 'Giulia',       text: 'Certamente. Il prezzo \u00e8 di centocinquanta euro a notte, comprensivo di prima colazione. \u00c8 da aggiungere l\u2019imposta di soggiorno di tre euro al giorno a persona, naturalmente solo per gli adulti.' },
      { speaker: 'Giulia',       text: 'Cortesemente, potrei avere i vostri documenti?' },
      { speaker: 'Sig. Baldini', text: 'S\u00ec, certamente. Ecco qua. C\u2019\u00e8 anche la carta d\u2019identit\u00e0 di nostro figlio.' },
      { speaker: 'Giulia',       text: 'Se necessario, disponiamo di un garage custodito ventiquattro ore su ventiquattro, con un supplemento di quindici euro al giorno. Potete tranquillamente lasciare l\u00ec la macchina.' },
      { speaker: 'Sig. Baldini', text: 'Va bene, s\u00ec.' },
      { speaker: 'Giulia',       text: 'Signor Baldini, avrete bisogno di una firma per il trattamento dei dati personali.' },
      { speaker: 'Sig. Baldini', text: 'Certamente.' },
      { speaker: 'Sig. Baldini', text: '\u00c8 necessario pagare tutto ora?' },
      { speaker: 'Giulia',       text: 'Non si preoccupi. Potete pagare tutto alla vostra partenza.' },
      { speaker: 'Giulia',       text: 'Ecco a voi le vostre chiavi, insieme alla welcome card con le informazioni sui nostri servizi. La camera \u00e8 la numero milleuno.' },
      { speaker: 'Sig.ra Baldini', text: 'Fino a che ora servite la colazione?' },
      { speaker: 'Giulia',       text: 'Serviamo la colazione dalle sette alle undici. Su richiesta possiamo servire anche la colazione in camera.' },
      { speaker: 'Giulia',       text: 'Vi auguro un buon soggiorno! Per qualsiasi cosa chiamate in portineria, tasto nove.' },
      { speaker: 'Sig. Baldini', text: 'Grazie mille!' },
    ]
  },
  {
    number: 3,
    title: 'Tutti in piazza!',
    dialogs: [
      {
        label: 'Di\u00e1logo 1',
        lines: [
          { speaker: 'Uomo 1', text: 'Scusi, mi sa dire che ore sono?' },
          { speaker: 'Uomo 2', text: 'Certo! Sono le dieci e mezza.' },
          { speaker: 'Uomo 1', text: 'Grazie mille!' },
          { speaker: 'Uomo 2', text: 'Prego, buona giornata!' },
        ]
      },
      {
        label: 'Di\u00e1logo 2',
        lines: [
          { speaker: 'Donna', text: 'Mi scusi, sa dirmi l\u2019ora per favore?' },
          { speaker: 'Uomo',  text: 'S\u00ec, certo! Sono le tre e un quarto.' },
          { speaker: 'Donna', text: 'Perfetto, grazie!' },
          { speaker: 'Uomo',  text: 'Figurati!' },
        ]
      }
    ]
  },
  {
    number: 4,
    title: 'Che lavoro fai?',
    lines: [
      { speaker: 'Giulia', text: 'Ciao Marco! Che lavoro fai?' },
      { speaker: 'Marco',  text: 'Sono ingegnere. Lavoro in un\u2019azienda di informatica. E tu?' },
      { speaker: 'Giulia', text: 'Io sono insegnante. Insegno italiano a stranieri.' },
      { speaker: 'Marco',  text: 'Interessante! Ti piace il tuo lavoro?' },
      { speaker: 'Giulia', text: 'S\u00ec, mi piace molto! Preferisco lavorare con le persone. E la tua uniforme, di che colore \u00e8?' },
      { speaker: 'Marco',  text: 'Non ho un\u2019uniforme. Di solito porto una camicia bianca e pantaloni grigi. E tu?' },
      { speaker: 'Giulia', text: 'Io preferisco i vestiti colorati! Oggi ho una gonna verde e una giacca gialla.' },
      { speaker: 'Marco',  text: 'Molto bella! Sei una vera italiana \u2014 colorata e allegra!' },
      { speaker: 'Giulia', text: 'Grazie! E tu sei un vero milanese \u2014 elegante e puntuale!' },
      { speaker: 'Giulia', text: 'A che ora cominci a lavorare di solito?' },
      { speaker: 'Marco',  text: 'Comincio alle nove. Ma a volte lavoro fino alle sette di sera... \u00c8 stressante!' },
      { speaker: 'Giulia', text: 'Capisco! E hai colleghi simpatici?' },
      { speaker: 'Marco',  text: 'S\u00ec, il mio capo \u00e8 molto bravo. Abbiamo anche una mensa aziendale \u2014 mangiamo tutti insieme a mezzogiorno.' },
      { speaker: 'Giulia', text: 'Che convenienza! Io invece mangio un panino in classe tra una lezione e l\u2019altra.' },
      { speaker: 'Marco',  text: 'E in futuro, vorresti fare un altro lavoro?' },
      { speaker: 'Giulia', text: 'Forse! Mi piace anche la traduzione. E tu, hai altri sogni professionali?' },
      { speaker: 'Marco',  text: 'Vorrei diventare direttore tecnico un giorno. Ma prima devo imparare ancora molto!' },
    ]
  },
  {
    number: 5,
    title: 'Che ore sono?',
    lines: [
      { speaker: 'Marco \u2014 cameriere', text: 'Buongiorno! Prego, cosa prende?' },
      { speaker: 'Giulia \u2014 cliente',  text: 'Buongiorno! Io vorrei una spremuta d\u2019arancia, per favore. Con le arance rosse, se possibile.' },
      { speaker: 'Marco \u2014 cameriere', text: 'Certo, signora! E lei, signore?' },
      { speaker: 'Amico di Giulia',       text: 'Per me un tramezzino con prosciutto crudo e mozzarella, e una birra piccola.' },
      { speaker: 'Marco \u2014 cameriere', text: 'E poi, volete anche il dolce?' },
      { speaker: 'Giulia \u2014 cliente',  text: 'S\u00ec! Un tiramiS\u00f9 e una panna cotta, grazie.' },
      { speaker: 'Giulia \u2014 cliente',  text: 'Quanto costa tutto?' },
      { speaker: 'Marco \u2014 cameriere', text: 'Dodici euro e cinquanta, signora.' },
      { speaker: 'Giulia \u2014 cliente',  text: 'Che confusione! Scusi, questo non \u00e8 il mio caff\u00e8!' },
      { speaker: 'Marco \u2014 cameriere', text: 'Mi scusi tanto! Ecco il suo caff\u00e8 macchiato freddo, signora.' },
      { speaker: 'Giulia \u2014 cliente',  text: 'Grazie! Senta, ha anche dei biscotti? Ho un po\u2019 di fame.' },
      { speaker: 'Marco \u2014 cameriere', text: 'Certo! Abbiamo crostate, cornetti e biscotti alle mandorle. Cosa preferisce?' },
      { speaker: 'Giulia \u2014 cliente',  text: 'Prendo due biscotti alle mandorle, grazie.' },
      { speaker: 'Amico di Giulia',       text: 'Scusi, posso avere anche il conto? Dobbiamo andare.' },
      { speaker: 'Marco \u2014 cameriere', text: 'Subito! In totale sono quindici euro e ottanta.' },
      { speaker: 'Giulia \u2014 cliente',  text: 'Paghiamo met\u00e0 per uno. Ecco sette euro e novanta.' },
      { speaker: 'Marco \u2014 cameriere', text: 'Perfetto. Grazie e arrivederci! Buona giornata!' },
    ]
  },
  {
    number: 6,
    title: 'A tavola!',
    lines: [
      { speaker: 'Giulia', text: 'Marco, a che ora ti svegli di solito?' },
      { speaker: 'Marco',  text: 'Di solito mi sveglio alle sette e mi alzo subito. Non riesco a restare a letto!' },
      { speaker: 'Giulia', text: 'Anch\u2019io! Prima mi lavo la faccia, poi mi vesto e faccio colazione.' },
      { speaker: 'Marco',  text: 'Io faccio colazione al bar, spesso con un cappuccino e un cornetto.' },
      { speaker: 'Giulia', text: 'Che bello! Io invece mangio a casa. A mezzogiorno pranzo con i colleghi.' },
      { speaker: 'Marco',  text: 'La sera, quando torno a casa, mi rilasso un po\u2019. A volte leggo, a volte ascolto musica.' },
      { speaker: 'Giulia', text: 'Anch\u2019io mi rilasso la sera. E il weekend? Ti piace dormire fino a tardi?' },
      { speaker: 'Marco',  text: 'S\u00ec! Il sabato non metto la sveglia. Di solito vado al mercato e poi corro al parco.' },
      { speaker: 'Giulia', text: 'La domenica invece incontro gli amici o visito una mostra. E la sera vado a pranzo dalla famiglia!' },
      { speaker: 'Marco',  text: 'E tu, la domenica sera, come la passi?' },
      { speaker: 'Giulia', text: 'Di solito cucino qualcosa di speciale! Mi piace sperimentare ricette nuove.' },
      { speaker: 'Marco',  text: 'Brava! Io invece guardo una serie italiana. In questo periodo sto vedendo Il commissario Montalbano.' },
      { speaker: 'Giulia', text: 'Lo conosco! \u00c8 bellissimo. Sei gi\u00e0 alla terza stagione?' },
      { speaker: 'Marco',  text: 'S\u00ec! E dopo la serie mi addormento sempre sul divano. La vita perfetta!' },
      { speaker: 'Giulia', text: 'Uguale a me! Vivere cos\u00ec \u00e8 un lusso. Per\u00f2 domani dobbiamo alzarci presto...' },
      { speaker: 'Marco',  text: 'Hai ragione. Ma per stanotte, goditi il divano e la serie!' },
    ]
  },
  {
    number: 7,
    title: 'Com\u2019\u00e8 il tempo?',
    lines: [
      { speaker: 'Marco',  text: 'Giulia, hai fratelli o sorelle?' },
      { speaker: 'Giulia', text: 'S\u00ec! Ho un fratello e una sorella. Mio fratello si chiama Luca e ha ventidue anni.' },
      { speaker: 'Marco',  text: 'E tua sorella, come si chiama?' },
      { speaker: 'Giulia', text: 'Si chiama Elena. Ha diciotto anni e studia all\u2019universit\u00e0. I miei genitori sono molto orgogliosi di lei!' },
      { speaker: 'Marco',  text: 'E i nonni? Li vedi spesso?' },
      { speaker: 'Giulia', text: 'S\u00ec, ogni domenica andiamo a pranzo da mia nonna materna. Lei abita a venti minuti da casa nostra.' },
      { speaker: 'Marco',  text: 'Bello! E tuo nonno paterno, abita lontano?' },
      { speaker: 'Giulia', text: 'S\u00ec, purtroppo. Mio nonno abita in Toscana. Lo vediamo solo d\u2019estate e a Natale.' },
      { speaker: 'Marco',  text: 'Hai anche zii o cugini?' },
      { speaker: 'Giulia', text: 'Eccome! Mia zia Carla ha tre figli \u2014 due maschi e una femmina. Sono i miei cugini preferiti!' },
      { speaker: 'Marco',  text: 'E i tuoi genitori, che lavoro fanno?' },
      { speaker: 'Giulia', text: 'Mio padre \u00e8 medico e mia madre \u00e8 architetta. Lavorano tantissimo ma sono molto presenti!' },
      { speaker: 'Marco',  text: 'La tua famiglia si incontra spesso tutta insieme?' },
      { speaker: 'Giulia', text: 'S\u00ec! A Natale siamo sempre tutti riuniti \u2014 i nonni, gli zii, i cugini... siamo in venti!' },
      { speaker: 'Marco',  text: 'Che bella famiglia numerosa! Nella mia siamo solo in quattro.' },
      { speaker: 'Giulia', text: 'Piccola ma unita, di sicuro! Qual \u00e8 la tua tradizione preferita?' },
      { speaker: 'Marco',  text: 'Le vacanze estive in Sicilia! Andiamo ogni anno, \u00e8 una tradizione da vent\u2019anni.' },
      { speaker: 'Giulia', text: 'Che meraviglia! Anche noi andiamo al mare d\u2019estate \u2014 ma in Sardegna. Il mare \u00e8 incredibile!' },
    ]
  },
  {
    number: 8,
    title: 'In treno o in macchina?',
    lines: [
      { speaker: 'Sofia', text: 'Scusi, mi sa dire come arrivo al Colosseo da qui?' },
      { speaker: 'Luca',  text: 'Certo! Prenda la metropolitana linea B, direzione Laurentina.' },
      { speaker: 'Sofia', text: 'E dove prendo la metro? \u00c8 lontano da qui?' },
      { speaker: 'Luca',  text: 'No, \u00e8 vicinissimo! Vada dritto, poi giri a sinistra. La fermata \u00e8 l\u00ec, davanti alla farmacia.' },
      { speaker: 'Sofia', text: 'Capito! E ci vuole molto per arrivare al Colosseo?' },
      { speaker: 'Luca',  text: 'No, ci vuole circa dieci minuti con la metro. Scendi alla fermata Colosseo, \u00e8 sulla linea B.' },
      { speaker: 'Sofia', text: 'Perfetto! E il biglietto, dove si compra?' },
      { speaker: 'Luca',  text: 'Alla biglietteria automatica, proprio qui in stazione. Oppure puoi comprarlo dal tabaccaio.' },
      { speaker: 'Sofia', text: 'Grazie mille, \u00e8 stato gentilissimo!' },
      { speaker: 'Luca',  text: 'Prego! Buona visita al Colosseo!' },
      { speaker: 'Sofia', text: 'Aspetti! Sa anche dove posso mangiare vicino al Colosseo? Ho una fame!' },
      { speaker: 'Luca',  text: 'Certo! Vicino alla fermata ci sono tanti ristoranti. Ma attenzione ai prezzi \u2014 zona turistica!' },
      { speaker: 'Sofia', text: 'Ha una raccomandazione? Preferisco qualcosa di tipico romano.' },
      { speaker: 'Luca',  text: 'Vada in Via dei Serpenti \u2014 l\u00ec ci sono trattorie genuine. Provi la pasta cacio e pepe!' },
      { speaker: 'Sofia', text: 'Cacio e pepe! \u00c8 gi\u00e0 il mio piatto preferito. E per tornare, prendo di nuovo la metro?' },
      { speaker: 'Luca',  text: 'S\u00ec, oppure c\u2019\u00e8 l\u2019autobus numero 75. Passa ogni dieci minuti.' },
      { speaker: 'Sofia', text: 'Perfetto! Tante grazie, \u00e8 stato di grande aiuto!' },
      { speaker: 'Luca',  text: 'Di niente! Benvenuta a Roma \u2014 \u00e8 una citt\u00e0 meravigliosa. Buona permanenza!' },
    ]
  },
  {
    number: 9,
    title: 'Mi piace moltissimo!',
    lines: [
      { speaker: 'Giulia', text: 'Che noia! Stiamo sempre a casa...' },
      { speaker: 'Marco',  text: 'Hai ragione. Ma oggi \u00e8 sabato! Dobbiamo fare qualcosa.' },
      { speaker: 'Giulia', text: 'S\u00ec! Ti piace andare al cinema?' },
      { speaker: 'Marco',  text: 'Mmm, non molto. Mi piace di pi\u00f9 fare una passeggiata. E a te?' },
      { speaker: 'Giulia', text: 'A me piace moltissimo uscire! Mi piacciono anche i mercati all\u2019aperto.' },
      { speaker: 'Marco',  text: 'Ottima idea! Gli piace andare al mercato anche alla mia sorella.' },
      { speaker: 'Giulia', text: 'Perfetto! E dopo andiamo al parco? Mi piace tanto passeggiare.' },
      { speaker: 'Marco',  text: 'Certo! Preferisco stare all\u2019aria aperta che restare sul divano.' },
      { speaker: 'Giulia', text: 'Allora, ci piace la stessa cosa! Andiamo!' },
      { speaker: 'Marco',  text: 'Aspetta! Al mercato compriamo qualcosa per il pranzo?' },
      { speaker: 'Giulia', text: 'S\u00ec! Mi piacciono molto i formaggi del mercato. E anche le olive! E a te, cosa ti piace comprare?' },
      { speaker: 'Marco',  text: 'A me piacciono le verdure fresche. E il pane artigianale \u2014 mi piace moltissimo!' },
      { speaker: 'Giulia', text: 'Perfetto! E dopo il parco, che facciamo? Ti piace cucinare insieme?' },
      { speaker: 'Marco',  text: 'Mi piace moltissimo! Preferisco cucinare con gli amici che da solo. \u00c8 pi\u00f9 divertente!' },
      { speaker: 'Giulia', text: 'Allora decidiamo: mercato, parco, e poi cena a casa mia. Ti va?' },
      { speaker: 'Marco',  text: 'Mi va benissimo! Questa \u00e8 la giornata perfetta. Andiamo!' },
    ]
  },
  {
    number: 10,
    title: 'Il concerto \u00e8 andato bene!',
    lines: [
      { speaker: 'Davide', text: 'Chiara! Com\u2019\u00e8 andato il concerto ieri sera?' },
      { speaker: 'Chiara', text: '\u00c8 andato benissimo! \u00c8 stato un concerto incredibile!' },
      { speaker: 'Davide', text: 'Davvero? Dove avete comprato i biglietti?' },
      { speaker: 'Chiara', text: 'Li abbiamo comprati online, una settimana fa. Abbiamo aspettato due ore in fila per entrare!' },
      { speaker: 'Davide', text: 'Due ore? E poi ne \u00e8 valsa la pena?' },
      { speaker: 'Chiara', text: 'S\u00ec, tantissimo! Ho visto il mio cantante preferito dal vivo. Ha cantato tutte le canzoni pi\u00f9 belle!' },
      { speaker: 'Davide', text: 'Avete ballato e cantato anche voi?' },
      { speaker: 'Chiara', text: 'Certo! Tutta la folla ha cantato insieme. \u00c8 stata un\u2019emozione unica! Siamo tornati a casa tardissimo.' },
      { speaker: 'Davide', text: 'Che bello! La prossima volta vengo anch\u2019io!' },
      { speaker: 'Chiara', text: 'S\u00ec, assolutamente! La prossima volta compriamo i biglietti insieme \u2014 tu e io!' },
      { speaker: 'Davide', text: 'Volentieri! E dopo il concerto, dove siete andati?' },
      { speaker: 'Chiara', text: 'Abbiamo trovato una pizzeria aperta fino alle due di notte. Ho mangiato la pizza pi\u00f9 buona della mia vita!' },
      { speaker: 'Davide', text: 'Che invidia! E con chi sei andata? Con le amiche del lavoro?' },
      { speaker: 'Chiara', text: 'Con Marta e Claudio. Siamo andati insieme anche l\u2019anno scorso, a Napoli.' },
      { speaker: 'Davide', text: 'Napoli! Quanto ci siete stati?' },
      { speaker: 'Chiara', text: 'Una settimana, in luglio. Abbiamo visitato tutto \u2014 il Vesuvio, Pompei, Capri... \u00c8 stato un viaggio indimenticabile!' },
    ]
  },
  {
    number: 11,
    title: 'Ieri sera',
    lines: [
      { speaker: 'Anna',    text: 'Roberto, ti va di andare al cinema sabato sera?' },
      { speaker: 'Roberto', text: 'Sabato sera non posso, ho gi\u00e0 un impegno. Purtroppo!' },
      { speaker: 'Anna',    text: 'Ah, capito. Che ne dici di domenica pomeriggio allora?' },
      { speaker: 'Roberto', text: 'Domenica pomeriggio va benissimo! A che ora?' },
      { speaker: 'Anna',    text: 'Verso le quattro? Ci troviamo davanti al cinema.' },
      { speaker: 'Roberto', text: 'Perfetto! E dopo il cinema andiamo a mangiare qualcosa?' },
      { speaker: 'Anna',    text: 'S\u00ec, volentieri! Conosco un bel posto qui vicino.' },
      { speaker: 'Roberto', text: 'Ottimo! D\u2019accordo allora, ci vediamo domenica.' },
      { speaker: 'Anna',    text: 'Perfetto! Hai gi\u00e0 visto qualcosa di buono al cinema ultimamente?' },
      { speaker: 'Roberto', text: 'S\u00ec! La settimana scorsa ho visto un film italiano bellissimo \u2014 \u201cLa grande bellezza\u201d.' },
      { speaker: 'Anna',    text: 'L\u2019ho sentito nominare! Di cosa parla esattamente?' },
      { speaker: 'Roberto', text: '\u00c8 la storia di un uomo a Roma che riflette sulla sua vita. Ha vinto l\u2019Oscar come miglior film straniero!' },
      { speaker: 'Anna',    text: 'Che bello! Allora domenica vediamo quel film. Sei d\u2019accordo?' },
      { speaker: 'Roberto', text: 'D\u2019accordo! Ti mando sabato sera l\u2019orario degli spettacoli.' },
      { speaker: 'Anna',    text: 'Perfetto! Ci vediamo domenica alle quattro davanti al cinema, allora.' },
      { speaker: 'Roberto', text: 'A domenica! Non vedo l\u2019ora!' },
    ]
  },
];

// ─── Build document paragraphs ────────────────────────────────────────────────

function dialogParagraphs(lines) {
  return lines.map(({ speaker, text }) =>
    new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [
        new TextRun({ text: speaker + ': ', bold: true, font: 'Arial', size: 22 }),
        new TextRun({ text: text, font: 'Arial', size: 22 }),
      ]
    })
  );
}

const children = [];

modules.forEach((mod, idx) => {
  // Page break between modules (except first)
  if (idx > 0) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // Module heading
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: `M\u00f3dulo ${mod.number} \u2014 ${mod.title}`,
          bold: true, font: 'Arial', size: 32, color: '1a1a18'
        })
      ]
    })
  );

  if (mod.lines) {
    // Single dialog
    children.push(...dialogParagraphs(mod.lines));
  } else if (mod.dialogs) {
    // Multiple sub-dialogs (M3)
    mod.dialogs.forEach((dl, di) => {
      if (di > 0) {
        children.push(new Paragraph({ spacing: { before: 120, after: 60 }, children: [] }));
      }
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 100 },
          children: [new TextRun({ text: dl.label, bold: true, font: 'Arial', size: 24, color: '444444' })]
        })
      );
      children.push(...dialogParagraphs(dl.lines));
    });
  }
});

// ─── Create and save document ─────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 22 } }
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial', color: '1a1a18' },
        paragraph: { spacing: { before: 0, after: 200 }, outlineLevel: 0 }
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial', color: '444444' },
        paragraph: { spacing: { before: 120, after: 100 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  const out = 'C:\\Users\\User\\Desktop\\proyectos\\italianoperpiacere\\guiones.docx';
  fs.writeFileSync(out, buf);
  console.log('Saved: ' + out);
});
