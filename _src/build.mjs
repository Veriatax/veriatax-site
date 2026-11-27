// Veriatax-Website: gemeinsame Bausteine in alle Seiten schreiben.
//
//   node _src/build.mjs           schreibt alle Bausteine neu in die Seiten
//   node _src/build.mjs --check   prueft nur; Exit-Code 1, wenn eine Seite veraltet ist
//
// Die Seiten bleiben normales HTML. Ein Baustein steht zwischen zwei Markierungen:
//
//   <!-- gemeinsam:fusszeile -->            (in CSS und JS:  /* gemeinsam:name */)
//   ... wird von diesem Skript geschrieben ...
//   <!-- /gemeinsam:fusszeile -->
//
// Hinter dem Namen duerfen Schalter stehen, z. B. <!-- gemeinsam:fusszeile ohne-social flach -->.
// Alles ausserhalb der Markierungen gehoert der Seite selbst und wird nie angefasst.
// Den Inhalt zwischen den Markierungen nicht von Hand aendern, sondern hier.
// Benoetigt nur Node.js (ab Version 18), keine Pakete.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');

// ------------------------------------------------------------------ Inhalte

const NAVIGATION = [            // [Ziel auf der Startseite, Schluessel, englischer Text]
  ['', 'nav.home', 'Home'],
  ['#games', 'nav.games', 'Games'],
  ['#music', 'nav.music', 'Music'],
  ['#tools', null, 'Tools'],    // heisst in beiden Sprachen gleich
  ['#about', 'nav.about', 'About'],
];

const RECHTLICHES = [           // Fusszeile, erste Reihe
  ['', 'footer.home', 'Home'],
  ['privacy/', 'footer.privacy', 'Privacy'],
  ['impressum/', null, 'Impressum'],
  ['licenses/', 'footer.licenses', 'Open-source licenses'],
];

const SOCIAL = [                // Fusszeile, zweite Reihe
  ['Spotify', 'https://open.spotify.com/artist/7hwHYyhlmqEi4v1PnidxcT'],
  ['Apple Music', 'https://music.apple.com/de/artist/veriatax-interactive/1875692825'],
  ['Amazon Music', 'https://music.amazon.de/artists/B0GMD7WFGG'],
  ['Instagram', 'https://www.instagram.com/veriataxinteractive/'],
  ['YouTube', 'https://youtube.com/@veriataxinteractive'],
];

// Texte, die auf allen Unterseiten gleich sind (die Startseite nutzt js/i18n.js)
const TEXTE = {
  de: {
    'nav.home': 'Startseite', 'nav.games': 'Spiele', 'nav.music': 'Musik', 'nav.about': 'Über uns',
    'footer.home': 'Startseite', 'footer.privacy': 'Datenschutz', 'footer.licenses': 'Open-Source-Lizenzen',
    'footer.notrack': 'Es werden keine Tracking- oder Werbe-Cookies verwendet.',
    'footer.rights': 'Alle Rechte vorbehalten.', 'skip': 'Zum Inhalt springen',
  },
  en: {
    'nav.home': 'Home', 'nav.games': 'Games', 'nav.music': 'Music', 'nav.about': 'About',
    'footer.home': 'Home', 'footer.privacy': 'Privacy', 'footer.licenses': 'Open-source licenses',
    'footer.notrack': 'No tracking or advertising cookies are used.',
    'footer.rights': 'All rights reserved.', 'skip': 'Skip to content',
  },
};

// Schriften vom eigenen Server (SIL OFL 1.1, Lizenztexte in fonts/)
const SCHRIFTEN = [['Rajdhani', 'rajdhani', [400, 500, 600, 700]], ['Exo 2', 'exo-2', [300, 400, 500, 600, 700]]];
const UNICODE = {
  'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
  'latin': 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
};
const VORLADEN = ['exo-2-latin-400-normal.woff2', 'rajdhani-latin-700-normal.woff2'];

// ---------------------------------------------------------------- Bausteine
// Jeder Baustein bekommt { p: Pfad zur Wurzel, schalter: Set } und liefert Zeilen.

const esc = s => s.replace(/&/g, '&amp;');
const i18n = k => (k ? ` data-i18n="${k}"` : '');

const BAUSTEINE = {
  navigation({ p, schalter }) {
    const start = schalter.has('startseite');
    const ziel = z => (start ? (z || '#') : p + z);
    const klick = z => (start && !z ? ' onclick="scrollToTop(event)"' : '');
    return [
      '<header class="navbar" id="navbar">',
      '    <div class="nav-inner">',
      `        <a href="${ziel('')}" class="logo"${klick('')}>`,
      `            <img src="${p}images/logo-120.webp" alt="Veriatax Interactive" class="logo-img" width="38" height="38">`,
      '            <span class="logo-text">VERIATAX</span>',
      '        </a>',
      '        <nav class="nav-links" id="navLinks">',
      ...NAVIGATION.map(([z, k, t]) => `            <a href="${ziel(z)}" class="nav-link"${klick(z)}${i18n(k)}>${t}</a>`),
      '            <button class="lang-toggle" id="langToggle" onclick="toggleLang()" title="Sprache / Language">DE</button>',
      '        </nav>',
      '        <button class="nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false" aria-controls="navLinks">',
      '            <span></span><span></span><span></span>',
      '        </button>',
      '    </div>',
      '</header>',
    ];
  },

  fusszeile({ p, schalter }) {
    const z = [
      `<footer class="site-footer${schalter.has('flach') ? ' flach' : ''}">`,
      '    <div class="site-footer-brand">',
      `        <img src="${p}images/logo-120.webp" alt="Veriatax" width="24" height="24">`,
      '        <span>VERIATAX INTERACTIVE</span>',
      '    </div>',
      '    <div class="site-footer-row">',
      ...RECHTLICHES.map(([ziel, k, t]) => `        <a href="${p}${ziel}"${i18n(k)}>${t}</a>`),
      '    </div>',
    ];
    if (!schalter.has('ohne-social')) {
      z.push('    <div class="site-footer-row social">',
        ...SOCIAL.map(([t, u]) => `        <a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`),
        '    </div>');
    }
    z.push(`    <p>&copy; ${new Date().getFullYear()} Veriatax Interactive. <span data-i18n="footer.rights">${TEXTE.en['footer.rights']}</span></p>`,
      `    <p>&#128274; <span data-i18n="footer.notrack">${TEXTE.en['footer.notrack']}</span></p>`,
      '</footer>');
    return z;
  },

  'fusszeile-css'() {
    return [
      '.site-footer { border-top: 1px solid rgba(255,255,255,0.04); padding: 32px 24px; margin-top: 60px; text-align: center; }',
      '.site-footer.flach { margin-top: 0; }',
      '.site-footer-brand { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 16px; }',
      '.site-footer-brand img { border-radius: 4px; }',
      ".site-footer-brand span { font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; background: linear-gradient(135deg, #f0a030, #ff3090); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }",
      '.site-footer-row { display: flex; gap: 20px; justify-content: center; margin-bottom: 10px; flex-wrap: wrap; }',
      '.site-footer-row a { font-size: 12px; color: rgba(238,242,247,0.5); text-decoration: none; }',
      '.site-footer-row a:hover { color: #f0a030; text-decoration: none; }',
      '.site-footer-row.social { gap: 16px; margin-bottom: 16px; }',
      '.site-footer p { font-size: 11px; color: rgba(238,242,247,0.5); margin: 0; }',
      '.site-footer p + p { margin-top: 6px; }',
    ];
  },

  // Handy-Menue wie auf der Startseite: Eintraege linksbuendig ueber die volle Breite,
  // Hintergrund deckend. Der Weichzeichner der Leiste liess das offene Menue sonst durchscheinen.
  'menue-css'() {
    return [
      '@media (max-width: 640px) {',
      '    .nav-links { align-items: stretch; }',
      '    .navbar:has(.nav-links.open) { backdrop-filter: none; -webkit-backdrop-filter: none; background: rgba(6,8,15,0.97); }',
      '}',
    ];
  },

  'sprunglink-css'() {
    return [
      '.skip-link { position: absolute; left: 12px; top: -60px; z-index: 10000; padding: 10px 18px; border-radius: 8px; background: #f0a030; color: #0a0a0a; font-size: 14px; font-weight: 700; text-decoration: none; transition: top 0.2s ease; }',
      '.skip-link:focus { top: 12px; }',
      'main:focus { outline: none; }',
    ];
  },

  schriften({ p }) {
    const z = [];
    for (const [fam, ordner, staerken] of SCHRIFTEN) for (const w of staerken) for (const sub of ['latin-ext', 'latin']) {
      z.push(`@font-face{font-family:'${fam}';font-style:normal;font-display:swap;font-weight:${w};src:url(${p}fonts/${ordner}-${sub}-${w}-normal.woff2) format('woff2');unicode-range:${UNICODE[sub]}}`);
    }
    return z;
  },

  'schriften-vorladen'({ p }) {
    return VORLADEN.map(f => `<link rel="preload" href="${p}fonts/${f}" as="font" type="font/woff2" crossorigin>`);
  },

  texte() {
    const zeile = l => '    ' + l + ': ' + JSON.stringify(TEXTE[l]).replace(/":"/g, '": "').replace(/","/g, '", "') + ',';
    return ['const COMMON_TRANS = {', zeile('de'), zeile('en'), '};'];
  },

  statistik() {
    return ['<script data-goatcounter="https://veriatax.goatcounter.com/count"', '        async src="//gc.zgo.at/count.js"></script>'];
  },
};

// ----------------------------------------------------------------- Ablauf

function pfadZurWurzel(datei) {
  const rel = path.relative(ROOT, datei).split(path.sep);
  if (rel.length === 1 && rel[0] === '404.html') return '/';   // 404 wird unter jeder Adresse gezeigt
  return '../'.repeat(rel.length - 1);
}

function dateien(dir = ROOT, liste = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name.startsWith('_') || e.name === 'node_modules') continue;
    const voll = path.join(dir, e.name);
    if (e.isDirectory()) dateien(voll, liste);
    else if (/\.(html|css)$/.test(e.name)) liste.push(voll);
  }
  return liste;
}

const MARKE = /^([ \t]*)(<!--|\/\*) gemeinsam:([a-z-]+)((?: [a-z-]+)*) (-->|\*\/)\n([\s\S]*?)^([ \t]*)(<!--|\/\*) \/gemeinsam:\3 (-->|\*\/)$/gm;

let geaendert = 0, bausteine = 0;
const fehler = [];
for (const datei of dateien()) {
  const alt = fs.readFileSync(datei, 'utf8');
  if (!alt.includes('gemeinsam:')) continue;
  const p = pfadZurWurzel(datei);
  const neu = alt.replace(MARKE, (ganz, einzug, auf, name, schalterText, zu, _innen, einzug2, auf2, zu2) => {
    const fn = BAUSTEINE[name];
    if (!fn) { fehler.push(`${path.relative(ROOT, datei)}: unbekannter Baustein "${name}"`); return ganz; }
    bausteine++;
    const schalter = new Set(schalterText.trim().split(/\s+/).filter(Boolean));
    const zeilen = fn({ p, schalter }).map(l => (l ? einzug + l : l));
    return `${einzug}${auf} gemeinsam:${name}${schalterText} ${zu}\n${zeilen.join('\n')}\n${einzug}${auf2} /gemeinsam:${name} ${zu2}`;
  });
  const offen = (neu.match(/gemeinsam:[a-z-]+/g) || []).length - 2 * ((neu.match(/\/gemeinsam:[a-z-]+/g) || []).length);
  if (offen !== 0) fehler.push(`${path.relative(ROOT, datei)}: Markierung ohne Gegenstueck`);
  if (neu !== alt) {
    geaendert++;
    if (CHECK) fehler.push(`${path.relative(ROOT, datei)}: veraltet, bitte "node _src/build.mjs" ausfuehren`);
    else fs.writeFileSync(datei, neu);
  }
}

if (fehler.length) { console.error(fehler.join('\n')); process.exit(1); }
console.log(CHECK ? `Alles aktuell (${bausteine} Bausteine geprueft).` : `${bausteine} Bausteine geschrieben, ${geaendert} Dateien geaendert.`);
