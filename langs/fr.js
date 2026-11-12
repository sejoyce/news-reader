// French language pack. Registers window.LANGS.fr.
(function () {
"use strict";
window.LANGS = window.LANGS || {};

var FALSE_FRIENDS = new Set(("actuel actuelle actuels actuelles actuellement eventuel eventuelle eventuels eventuelles eventuellement " +
  "sensible sensibles librairie assister assiste assistent pretendre pretend pretendent supporter supporte supportent " +
  "deception deceptions location locations large larges blesse blessee blesses blessure blessures coin coins journee journees " +
  "ignorer ignore ignoree ignores ignorent attendre attend attendent achever acheve achevent chance chances formidable formidables " +
  "prejudice prejudices rester reste restent sale salement agenda agendas gentil gentille figure figures lecture lectures " +
  "demander demande demandent injure injures versatile resumer resume resument preservatif").split(" "));

var NOUN_SUFFIX = [["isation","ization"],["isation","ation"],["tion","tion"],["sion","sion"],["ique","ic"],["ique","ical"],["ique","y"],["iques","ics"],["aire","ary"],
  ["eur","or"],["eur","er"],["euse","er"],["ite","ity"],["isme","ism"],["iste","ist"],["ive","ive"],["if","ive"],["aux","al"],
  ["el","al"],["elle","al"],["ence","ence"],["ance","ance"],["ment","ment"],["ement","ely"],["oire","ory"],["ie","y"],["ier","er"],
  ["ain","an"],["aine","an"],["eux","ous"],["euse","ous"],["ure","ure"],["age","age"],["ant","ant"],["ent","ent"],["ible","ible"],["able","able"]];
var VERB_ENDINGS = ["iser","ier","er","ent","ons","ez","ees","ee","es","e","ant","ie","ies","s"];

function strip(s) { return s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

function candidates(w) {
  var out = {};
  function add(c) {
    if (c.length < 4) return;
    out[c] = 1;
    if (c.indexOf("ou") !== -1) out[c.replace("ou", "o")] = 1;   // approuver -> approve
  }
  var forms = [w];
  if (/s$/.test(w)) forms.push(w.slice(0, -1));
  if (/es$/.test(w)) forms.push(w.slice(0, -2));
  if (/e$/.test(w)) forms.push(w.slice(0, -1));
  forms.forEach(function (f) {
    add(f); add(f + "e");
    NOUN_SUFFIX.forEach(function (p) { if (f.slice(-p[0].length) === p[0]) add(f.slice(0, -p[0].length) + p[1]); });
  });
  VERB_ENDINGS.forEach(function (E) {
    if (w.slice(-E.length) !== E) return;
    var stem = w.slice(0, -E.length);
    if (stem.length < 3) return;
    add(stem); add(stem + "e"); add(stem + "ate"); add(stem + "y");
    if (E === "iser" || /s$/.test(stem)) add(stem.slice(0, -1) + "ze");  // organiser -> organize
    if (E === "iser") add(stem + "e");
  });
  return Object.keys(out);
}


// English words that a French word probably descends from, used to hide cognates.
function cognateCandidates(raw) {
  var variants = [raw];
  var circ = raw.replace(/ê/g, "es").replace(/ô/g, "os").replace(/â/g, "as").replace(/î/g, "is").replace(/û/g, "us");  // forêt -> forest
  if (circ !== raw) variants.push(circ);
  if (raw.charAt(0) === "é") variants.push("s" + raw.slice(1));                                                       // étrange -> strange
  var out = [];
  variants.forEach(function (v) { candidates(strip(v)).forEach(function (c) { out.push(c); }); });
  return out;
}

// Last-resort guesses at the infinitive from the ending of an inflected form.
function guessLemmas(w) {
  var ends = [["ées","er"],["ée","er"],["és","er"],["é","er"],["ent","er"],["es","er"],["e","er"],["ons","er"],["ez","er"],["ant","er"],
              ["issent","ir"],["issant","ir"],["ies","ir"],["ie","ir"],["is","ir"],["i","ir"],
              ["ues","re"],["ue","re"],["us","re"],["u","re"],["ites","ire"],["ite","ire"],["its","ire"],["it","ire"]];
  var out = [];
  ends.forEach(function (p) {
    if (w.length > p[0].length + 2 && w.slice(-p[0].length) === p[0]) out.push(w.slice(0, -p[0].length) + p[1]);
  });
  return out;
}


// Paywall, login and promo lines that sit inside the article body.
var BOILERPLATE = [
  /cet article vous est offert/i, /pour lire gratuitement/i, /r[ée]serv[ée] aux abonn[ée]s/i, /vous n['’]?[êe]tes pas inscrit/i,
  /inscrivez-vous gratuitement/i, /connectez-vous/i, /d[ée]j[àa] abonn[ée]/i, /accepter et continuer/i,
  /^(se connecter|s['’]abonner|abonnez-vous|s['’]inscrire|inscrivez-vous|lire plus tard|partager|r[ée]utiliser ce contenu|ajouter aux favoris|offrir cet article|voir plus|lire la suite|lire aussi|lire également|à lire aussi|sur le même sujet|publicit[ée]|newsletter|contribuer)\b/i
];
var LOGIN_WORDS = /(connectez-vous|se connecter|abonnez-vous|s['’]abonner|inscrivez-vous|s['’]inscrire|r[ée]serv[ée] aux abonn|cet article vous est offert|lecture (offerte|r[ée]serv)|newsletter)/i;

// Expression matching: verb forms and the adverbs that may sit between a verb and the rest of a phrase.
var NEG = "(?:\\s+(?:pas|plus|jamais|guère|toujours|déjà|encore|aussi|bien|même|souvent|également))?";
var VERB_FORMS = {
  "être": "(?:être|est|es|sont|sommes|êtes|était|étaient|étais|été|étant|sera|seront|serait|seraient|soit|soient|fut|furent|suis|fût)",
  "avoir": "(?:avoir|a|as|ai|avons|avez|ont|avait|avaient|avais|aura|auront|aurait|auraient|eu|eue|eus|eues|ayant|eut|eurent|aie|aient|ait)",
  "faire": "(?:faire|fai\\p{L}*|fait|font|fais|fer\\p{L}*|fit|firent|fass\\p{L}*)",
  "aller": "(?:aller|all\\p{L}*|vais|vas|va|vont|ir\\p{L}*|aill\\p{L}*)",
  "prendre": "(?:prendr\\p{L}*|pren\\p{L}*|pris\\p{L}*|prit|prirent)",
  "mettre": "(?:mettr\\p{L}*|mett\\p{L}*|met|mets|mis\\p{L}*|mit|mirent)",
  "tenir": "(?:tenir|ten\\p{L}*|tien\\p{L}*|tint|tinrent|tiendr\\p{L}*|tenu\\p{L}*)",
  "venir": "(?:venir|ven\\p{L}*|vien\\p{L}*|vint|vinrent|viendr\\p{L}*|venu\\p{L}*)"
};

var SAMPLE_FR = {
  title: "Dans les Alpes, les stations de ski misent sur l’été pour survivre au réchauffement",
  dek: "Faute d’un enneigement suffisant, plusieurs communes de montagne repensent leur modèle économique et peinent à convaincre leurs habitants.",
  credit: "Texte d’exemple · Société",
  paras: [
    "Depuis trois hivers, le constat est sans appel : la neige se fait de plus en plus rare à basse altitude. À Saint-Aubin-des-Cimes, petite station de Haute-Savoie, la moitié des remontées mécaniques est restée à l’arrêt durant la dernière saison. Le maire, Étienne Marchand, reconnaît que la commune a longtemps sous-estimé l’ampleur du phénomène.",
    "« Nous avons trop tardé à diversifier notre offre », admet-il. Le conseil municipal a donc approuvé un plan de reconversion qui prévoit l’aménagement de sentiers de randonnée, d’un parc d’accrobranche et d’un centre de bien-être. Les premiers travaux devraient s’achèver d’ici l’an prochain, à condition que les subventions promises par la région soient bel et bien versées.",
    "Ce virage ne fait pas l’unanimité. Certains commerçants redoutent que la clientèle estivale, moins dépensière, ne compense jamais le manque à gagner de l’hiver. D’autres reprochent aux élus d’avoir ignoré trop longtemps les alertes des scientifiques. « On nous a rassurés pendant des années, alors que les chiffres étaient inquiétants », déplore une hôtelière.",
    "Reste une inconnue de taille : l’attitude des touristes eux-mêmes. Selon une enquête menée auprès de 2 000 visiteurs, une majorité se dit prête à venir en été, mais seulement si les prix demeurent abordables. Pour les élus, l’enjeu est désormais de préserver l’équilibre fragile entre attractivité et respect de l’environnement."
  ]
};

window.LANGS.fr = {
  code: "fr",
  label: "Français",
  name: "French",
  by: "Par",
  wikt: "fr",
  words: "data/fr_words.txt",
  exprs: "data/fr_expressions.json",
  placeholder: "https://www.lemonde.fr/...",
  knownMax: 9000, b2Max: 25000, minLen: 5,
  token: /aujourd['’]hui|\p{L}+(?:-\p{L}+)*/gu,
  norm: function (t) { return t.toLowerCase().replace(/’/g, "'"); },
  falseFriends: FALSE_FRIENDS,
  cognateCandidates: cognateCandidates,
  guessLemmas: guessLemmas,
  boilerplate: BOILERPLATE,
  loginWords: LOGIN_WORDS,
  exprNeg: NEG,
  verbForms: VERB_FORMS,
  infEnding: /(er|ir|re)$/,
  tokenMap: { de: "(?:des|du|de|d['’])" },
  sample: SAMPLE_FR,
  sampleLabel: "Sample article written for this prototype"
};
})();
