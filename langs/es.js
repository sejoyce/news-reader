// Spanish language pack. Registers window.LANGS.es.
(function () {
"use strict";
window.LANGS = window.LANGS || {};

function strip(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, ""); }

// ---------- Cognates ----------
// Spanish words that look like English ones but mean something different (written without accents).
var FALSE_FRIENDS = new Set(("actual actuales actualmente eventual eventuales eventualmente embarazada embarazadas embarazo embarazos " +
  "exito exitos sensible sensibles realizar realiza realizan realizo realizado realizada introducir introduce introducen asistir asiste asisten " +
  "soportar soporta soportan libreria librerias lectura lecturas carpeta carpetas molestar molesta molestan fabrica fabricas " +
  "pretender pretende pretenden decepcion decepciones disgusto disgustos suceso sucesos carta cartas contestar contesta contestan " +
  "demanda demandas demandar demanda ignorar ignora ignoran colegio colegios largo larga largos largas rato asignatura asignaturas " +
  "excitado excitada constipado preservativo preservativos compromiso compromisos firma firmas fastidiar sopa campo campos " +
  "argumento argumentos jubilado jubilada jubilarse parientes pariente tuna lujuria bizarro bizarra gripe resumir resumen " +
  "ambicion arena arenas billon billones cura curas dato datos decente decentes educado educada hora horas librar mesa mesas " +
  "ropa sano sana sanos sanas sentencia sentencias simpatico simpatica terrific tremendo tremenda").split(" "));

var NOUN_SUFFIX = [
  ["izacion","ization"],["ificacion","ification"],["cion","tion"],["sion","sion"],["idad","ity"],["dad","ty"],["ia","y"],
  ["ismo","ism"],["ista","ist"],["ico","ic"],["ica","ic"],["ico","ical"],["ica","ical"],["ico","y"],["oso","ous"],["osa","ous"],
  ["ivo","ive"],["iva","ive"],["ario","ary"],["aria","ary"],["ura","ure"],["eria","ery"],["ncia","nce"],["ante","ant"],["ente","ent"],
  ["able","able"],["ible","ible"],["al","al"],["ar","ar"],["or","or"],["ora","or"],["logia","logy"],["grafia","graphy"],["io","y"],
  ["izar","ize"],["ificar","ify"],["mento","ment"],["ismo","ism"],["ancia","ance"],["encia","ence"],["ud","ude"],["ez","ity"]
];
var VERB_ENDINGS = ["aron","aban","aran","aria","arian","ando","ado","ada","ados","adas","aba","ara","amos","ar","an","as","a","o","en","es","e",
  "ieron","iendo","ido","ida","idos","idas","ian","ia","ir","er","io"];

function candidates(w) {
  var out = {};
  function add(c) { if (c.length >= 4) out[c] = 1; }
  var forms = [w];
  if (/s$/.test(w)) forms.push(w.slice(0, -1));
  if (/es$/.test(w)) forms.push(w.slice(0, -2));
  forms.forEach(function (f) {
    add(f);
    NOUN_SUFFIX.forEach(function (p) { if (f.slice(-p[0].length) === p[0]) add(f.slice(0, -p[0].length) + p[1]); });
    if (/[oa]$/.test(f)) { add(f.slice(0, -1)); add(f.slice(0, -1) + "e"); }      // directo -> direct, simple -> simple
  });
  if (/mente$/.test(w)) {                                                          // finalmente -> finally
    var s0 = w.slice(0, -5);
    add(s0 + "ly");
    if (/a$/.test(s0)) add(s0.slice(0, -1) + "ely");
    if (/ica$/.test(s0)) add(s0.slice(0, -1) + "ally");
  }
  VERB_ENDINGS.forEach(function (E) {
    if (w.slice(-E.length) !== E) return;
    var stem = w.slice(0, -E.length);
    if (stem.length < 3) return;
    add(stem); add(stem + "e"); add(stem + "ate");
    if (/i$/.test(stem)) add(stem.slice(0, -1) + "y");                              // variar -> vary
  });
  return Object.keys(out);
}

function cognateCandidates(raw) {
  var base = strip(raw);
  var variants = [base];
  if (/^es[^aeiou]/.test(base)) variants.push(base.slice(1));                      // especial -> special
  if (/^inm/.test(base)) variants.push("imm" + base.slice(3));                     // inmenso -> immense
  if (base.indexOf("f") !== -1) variants.push(base.replace(/f/g, "ph"));           // fotografia -> photography
  var out = [];
  variants.forEach(function (v) { candidates(v).forEach(function (c) { out.push(c); }); });
  return out;
}

// ---------- Guessing the infinitive of an inflected form ----------
var GUESS = [["aron","ar"],["ó","ar"],["ado","ar"],["ada","ar"],["ados","ar"],["adas","ar"],["ando","ar"],["aba","ar"],["aban","ar"],
  ["ará","ar"],["arán","ar"],["aría","ar"],["arían","ar"],["amos","ar"],["an","ar"],["as","ar"],["a","ar"],["e","ar"],["en","ar"],["es","ar"],
  ["é","ar"],["ieron","er"],["ieron","ir"],["ió","er"],["ió","ir"],["ido","er"],["ido","ir"],["ida","er"],["ida","ir"],["idos","er"],
  ["idos","ir"],["idas","er"],["idas","ir"],["iendo","er"],["iendo","ir"],["ía","er"],["ía","ir"],["ían","er"],["ían","ir"],["erá","er"],
  ["irá","ir"],["erán","er"],["irán","ir"],["ería","er"],["iría","ir"],["en","er"],["en","ir"],["e","er"],["e","ir"],["es","er"],["es","ir"],
  ["o","ar"],["o","er"],["o","ir"],["emos","er"],["imos","ir"]];
function guessLemmas(w) {
  var out = [];
  GUESS.forEach(function (p) {
    if (w.length > p[0].length + 2 && w.slice(-p[0].length) === p[0]) out.push(w.slice(0, -p[0].length) + p[1]);
  });
  return out;
}

// ---------- Paywall, login and promo lines that sit inside the article body ----------
var BOILERPLATE = [
  /suscr[ií]be(te)?\b/i, /inicia(r)? sesi[óo]n/i, /reg[ií]strate/i, /solo (para )?suscriptores/i, /exclusivo para suscriptores/i,
  /ya (soy|eres) suscriptor/i, /art[ií]culo (exclusivo|reservado|de pago)/i, /hazte (con )?(una )?suscripci[óo]n/i,
  /^(lee tambi[ée]n|lea tambi[ée]n|te puede interesar|ver m[aá]s|publicidad|compartir|newsletter|leer m[aá]s tarde|comentarios?|seguir leyendo|contin[uú]a leyendo)\b/i
];
var LOGIN_WORDS = /(suscr[ií]bete|suscripci[óo]n|inicia sesi[óo]n|iniciar sesi[óo]n|reg[ií]strate|solo suscriptores|ya soy suscriptor|newsletter)/i;

// ---------- Fixed expressions: verb forms and adverbs allowed after a verb ----------
var NEG = "(?:\\s+(?:nunca|jamás|siempre|ya|también|aún|todavía|incluso|además|más|bien|solo|sólo|apenas|casi))?";
var VERB_FORMS = {
  "ser": "(?:ser|es|son|soy|eres|somos|era|eran|eras|fue|fueron|fui|será|serán|sería|serían|sea|sean|siendo|sido)",
  "estar": "(?:estar|est\\p{L}*)",
  "haber": "(?:haber|h[ae]\\p{L}*|hay|hab\\p{L}*|hub\\p{L}*)",
  "hacer": "(?:hacer|hac\\p{L}*|hag\\p{L}*|hiz\\p{L}*|hic\\p{L}*|hech\\p{L}*|har\\p{L}*)",
  "tener": "(?:tener|ten\\p{L}*|tien\\p{L}*|tuv\\p{L}*|tend\\p{L}*|teng\\p{L}*)",
  "dar": "(?:dar|d[aeo][ns]?|damos|dan|doy|di[oe]\\p{L}*|dad\\p{L}*|dand\\p{L}*|dar\\p{L}*|dé)",
  "poner": "(?:poner|pon\\p{L}*|pus\\p{L}*|pues\\p{L}*|pond\\p{L}*|pong\\p{L}*)",
  "ir": "(?:ir|va|vas|van|voy|vamos|vaya\\p{L}*|iba\\p{L}*|fue\\p{L}*|ido|yendo|ir\\p{L}*)",
  "venir": "(?:venir|ven\\p{L}*|vien\\p{L}*|vin\\p{L}*|vend\\p{L}*|veng\\p{L}*)",
  "decir": "(?:decir|dic\\p{L}*|dij\\p{L}*|dir\\p{L}*|dich\\p{L}*|dec\\p{L}*|dig\\p{L}*)",
  "ver": "(?:ver|ve|ven|vi\\p{L}*|vem\\p{L}*|ver\\p{L}*)",
  "poder": "(?:poder|pued\\p{L}*|pod\\p{L}*|pud\\p{L}*)",
  "querer": "(?:querer|quier\\p{L}*|quer\\p{L}*|quis\\p{L}*)",
  "salir": "(?:salir|sal\\p{L}*|sald\\p{L}*|salg\\p{L}*)",
  "volver": "(?:volver|volv\\p{L}*|vuelv\\p{L}*|vuelt\\p{L}*)",
  "seguir": "(?:seguir|sig\\p{L}*|segu\\p{L}*)",
  "pedir": "(?:pedir|ped\\p{L}*|pid\\p{L}*)",
  "cobrar": "(?:cobrar|cobr\\p{L}*)",
  "tirar": "(?:tirar|tir\\p{L}*)",
  "sacar": "(?:sacar|sac\\p{L}*|saqu\\p{L}*)",
  "jugar": "(?:jugar|jueg\\p{L}*|jug\\p{L}*|jugu\\p{L}*)",
  "mover": "(?:mover|mov\\p{L}*|muev\\p{L}*)",
  "cerrar": "(?:cerrar|cerr\\p{L}*|cierr\\p{L}*)",
  "sentar": "(?:sentar|sent\\p{L}*|sient\\p{L}*)",
  "perder": "(?:perder|perd\\p{L}*|pierd\\p{L}*)",
  "entrar": "(?:entrar|entr\\p{L}*)",
  "llegar": "(?:llegar|lleg\\p{L}*)",
  "alcanzar": "(?:alcanzar|alcanz\\p{L}*|alcanc\\p{L}*)",
  "echar": "(?:echar|ech\\p{L}*)",
  "llevar": "(?:llevar|llev\\p{L}*)",
  "tomar": "(?:tomar|tom\\p{L}*)",
  "dejar": "(?:dejar|dej\\p{L}*)",
  "romper": "(?:romper|romp\\p{L}*|rot\\p{L}*)",
  "caer": "(?:caer|ca[ey]\\p{L}*|caig\\p{L}*|cay\\p{L}*|caid\\p{L}*)",
  "correr": "(?:correr|corr\\p{L}*)",
  "tender": "(?:tender|tend\\p{L}*|tiend\\p{L}*)",
  "arrojar": "(?:arrojar|arroj\\p{L}*)",
  "desempeñar": "(?:desempeñar|desempeñ\\p{L}*)",
  "marcar": "(?:marcar|marc\\p{L}*|marqu\\p{L}*)",
  "ganar": "(?:ganar|gan\\p{L}*)",
  "abrir": "(?:abrir|abr\\p{L}*|abier\\p{L}*)",
  "allanar": "(?:allanar|allan\\p{L}*)",
  "verse": "(?:ver|ve|ven|vi\\p{L}*|vem\\p{L}*|ver\\p{L}*)"
};

var SAMPLE_ES = {
  title: "Las ciudades buscan frenar el alza de los alquileres antes del invierno",
  dek: "A raíz del aumento sostenido de los precios, varios ayuntamientos ponen en marcha medidas para contener el alquiler en las zonas más tensionadas.",
  credit: "Texto de ejemplo · Sociedad",
  paras: [
    "El alcalde de la localidad, Andrés Molina, admite que la situación se ha agravado en los últimos años y que el consistorio llegó tarde a un problema que afecta, sobre todo, a los jóvenes. Según los datos municipales, el precio medio del alquiler ha subido casi un treinta por ciento desde 2021, un ritmo que los salarios no han podido seguir.",
    "En el marco de un plan aprobado el pasado mes, el ayuntamiento prevé destinar parte de las viviendas vacías a alquiler asequible, siempre que los propietarios acepten ceder temporalmente su gestión. Sin embargo, la iniciativa no está exenta de polémica: las asociaciones de propietarios advierten de que la medida podría desincentivar la oferta y poner en entredicho la seguridad jurídica.",
    "Los inquilinos, por su parte, reprochan a las administraciones haber tardado en reaccionar. «Llevamos años pidiendo que se tomen medidas y todavía hay que esperar», lamenta una vecina del barrio. A medida que se acerca el invierno, muchas familias temen no poder hacer frente a las subidas, pese a los ajustes salariales que algunas empresas han anunciado.",
    "Cabe destacar que, de momento, se trata de un proyecto piloto que se llevará a cabo durante dos años. Los responsables municipales aseguran que tendrán en cuenta las críticas, aunque sin renunciar al objetivo de garantizar un acceso digno a la vivienda a lo largo de toda la década."
  ]
};

window.LANGS.es = {
  code: "es",
  label: "Español",
  name: "Spanish",
  by: "Por",
  wikt: "es",
  words: "data/es_words.txt",
  exprs: "data/es_expressions.json",
  placeholder: "https://elpais.com/...",
  knownMax: 9000, b2Max: 25000, minLen: 5,
  token: /\p{L}+(?:-\p{L}+)*/gu,
  norm: function (t) { return t.toLowerCase(); },
  falseFriends: FALSE_FRIENDS,
  cognateCandidates: cognateCandidates,
  guessLemmas: guessLemmas,
  boilerplate: BOILERPLATE,
  loginWords: LOGIN_WORDS,
  exprNeg: NEG,
  verbForms: VERB_FORMS,
  infEnding: /(ar|er|ir|ír)$/,
  tokenMap: { de: "(?:del|de)", a: "(?:al|a)" },
  sample: SAMPLE_ES,
  sampleLabel: "Texto de ejemplo escrito para este prototipo"
};
})();
