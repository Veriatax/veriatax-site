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

// ------------------------------------------------------------------ Musik
// Alle Songs stehen in _src/musik.json. Daraus entstehen die Songseiten (music/<slug>/),
// die Uebersicht (music/), der Musikbereich der Startseite und die Sitemap.

const fehler = [];
const MUSIK = JSON.parse(fs.readFileSync(path.join(ROOT, '_src/musik.json'), 'utf8'));
for (const s of MUSIK) {
  for (const f of ['slug', 'titel', 'titelZusatz', 'datum', 'genre', 'text']) if (!s[f]) fehler.push(`musik.json: "${s.slug || '?'}" ohne ${f}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.datum || '')) fehler.push(`musik.json: "${s.slug}" Datum bitte als JJJJ-MM-TT`);
  if (!s.spotify && !s.vormerken) fehler.push(`musik.json: "${s.slug}" braucht "spotify" oder "vormerken"`);
  for (const b of [`images/${s.slug}.jpg`, `images/thumbs/${s.slug}.jpg`, `images/share/${s.slug}.jpg`]) {
    if (!fs.existsSync(path.join(ROOT, b))) fehler.push(`musik.json: Bild fehlt: ${b}`);
  }
}
// neueste zuerst; bei gleichem Datum gilt die Reihenfolge in der Datei
const SONGS = MUSIK.map((s, i) => ({ ...s, _i: i })).sort((a, b) => b.datum.localeCompare(a.datum) || a._i - b._i);
const STARTSEITE_GROSS = 2, STARTSEITE_KLEIN = 4;           // so viele Songs zeigt die Startseite
const ANZAHL = { spiele: 3, tools: 1 };                     // Zahlen in "Ueber uns" (Musik zaehlt das Skript)
const STAND_MUSIK = '2026-11-27';                          // letzte Aenderung an den Musik-Vorlagen

const MONATE = {
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const datumText = (iso, lang) => {
  const [j, m, t] = iso.split('-').map(Number);
  return lang === 'de' ? `${t}. ${MONATE.de[m - 1]} ${j}` : `${t} ${MONATE.en[m - 1]} ${j}`;
};
const datumZeile = (s, lang) => s.vormerken
  ? (lang === 'de' ? `Erscheint am ${datumText(s.datum, 'de')}` : `Out ${datumText(s.datum, 'en')}`) + ' · Veriatax Interactive'
  : (lang === 'de' ? `Veröffentlicht: ${datumText(s.datum, 'de')}` : `Released: ${datumText(s.datum, 'en')}`) + ' · Veriatax Interactive';
const kurztext = (s, lang) => (s.kurz && s.kurz[lang]) || s.text[lang].split(/(?<=[.!?])\s/)[0];

const html = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const js = s => JSON.stringify(String(s)).slice(1, -1);
const vorlage = n => fs.readFileSync(path.join(ROOT, '_src/vorlagen', n), 'utf8');
const ICON = { spotify: vorlage('icon-spotify.svg').trim(), apple: vorlage('icon-apple.svg').trim() };
const fuellen = (text, werte) => text.replace(/\{\{([A-Z_]+)\}\}/g, (g, k) => {
  if (!(k in werte)) { fehler.push(`Vorlage: Platzhalter {{${k}}} ohne Wert`); return g; }
  return werte[k];
});
const KUENSTLER = { '@type': 'MusicGroup', name: 'Veriatax Interactive', url: 'https://veriatax.com/', sameAs: SOCIAL.map(([, u]) => u) };

function songseite(s) {
  const ein = '            ';
  const hoeren = s.vormerken ? [
    `${ein}<div class="listen-buttons">`,
    `${ein}    <a href="${html(s.vormerken)}" target="_blank" rel="noopener" class="btn-presave">`,
    `${ein}        ${ICON.spotify}`,
    `${ein}        <span data-i18n="presave">Pre-Save on Spotify</span>`,
    `${ein}    </a>`,
    `${ein}</div>`,
    `${ein}<p class="presave-note" data-i18n="presave.note">Pre-save now and the track lands in your library the moment it drops.</p>`,
  ] : [
    `${ein}<div class="listen-buttons">`,
    `${ein}    <a href="${html(s.spotify)}" target="_blank" rel="noopener" class="btn-spotify">`,
    `${ein}        ${ICON.spotify}`,
    `${ein}        <span data-i18n="play">Play on Spotify</span>`,
    `${ein}    </a>`,
    ...(s.apple ? [
      `${ein}    <a href="${html(s.apple)}" target="_blank" rel="noopener" class="btn-apple">`,
      `${ein}        ${ICON.apple}`,
      `${ein}        <span data-i18n="apple">Listen on Apple Music</span>`,
      `${ein}    </a>`] : []),
    `${ein}</div>`,
  ];
  // "Mehr": erst die aehnlichen Songs, dann alle uebrigen, neueste zuerst
  const vorne = (s.aehnlich || []).filter(x => x !== s.slug && SONGS.some(o => o.slug === x));
  const rest = SONGS.map(o => o.slug).filter(x => x !== s.slug && !vorne.includes(x));
  const mehr = [...vorne, ...rest].map(x => SONGS.find(o => o.slug === x)).map(o =>
    `            <a href="../${o.slug}/" class="more-item"><img src="../../images/thumbs/${o.slug}.jpg" alt="" width="48" height="48" loading="lazy"><span>${html(o.titel)}</span></a>`);
  const ld = {
    '@context': 'https://schema.org', '@type': 'MusicRecording', name: s.titel,
    url: `https://veriatax.com/music/${s.slug}/`, image: `https://veriatax.com/images/${s.slug}.jpg`,
    genre: s.genre.en, description: s.text.en, inLanguage: 'en', byArtist: KUENSTLER,
    datePublished: s.datum, sameAs: [s.spotify, s.apple].filter(Boolean),
  };
  return fuellen(vorlage('musik-song.html'), {
    SLUG: s.slug, TITEL: html(s.titel), TITEL_ZUSATZ: html(s.titelZusatz), TEXT_EN: html(s.text.en), GENRE_EN: html(s.genre.en),
    DATUM_ZEILE_EN: html(datumZeile(s, 'en')), JSON_LD: JSON.stringify(ld, null, 2), HOEREN: hoeren.join('\n'), MEHR: mehr.join('\n'),
    JS_GENRE_DE: js(s.genre.de), JS_TEXT_DE: js(s.text.de), JS_DATUM_ZEILE_DE: js(datumZeile(s, 'de')),
    JS_GENRE_EN: js(s.genre.en), JS_TEXT_EN: js(s.text.en), JS_DATUM_ZEILE_EN: js(datumZeile(s, 'en')),
  });
}

function uebersicht() {
  const intro = {
    de: `Elektronische Musik von Veriatax Interactive — Tropical House, Melodic Chill, Synthwave & Neon-EDM. Bisher ${SONGS.length} Singles, die neueste zuerst.`,
    en: `Electronic music by Veriatax Interactive — tropical house, melodic chill, synthwave & neon-lit EDM. ${SONGS.length} singles so far, newest first.`,
  };
  const karten = SONGS.map((s, i) => [
    `        <a class="release-card" href="${s.slug}/">`,
    `            <img src="../images/${s.slug}.jpg" alt="" width="600" height="600"${i === 0 ? ' fetchpriority="high"' : i < 4 ? '' : ' loading="lazy"'}>`,
    `            <span class="release-title">${html(s.titel)}</span>`,
    `            <span class="release-genre" data-i18n="g.${s.slug}">${html(s.genre.en)}</span>`,
    `            <span class="release-date" data-i18n="d.${s.slug}">${html(s.vormerken ? 'Out ' + datumText(s.datum, 'en') : datumText(s.datum, 'en'))}</span>`,
    '        </a>'].join('\n'));
  const texte = lang => SONGS.flatMap(s => [
    `        "g.${s.slug}": "${js(s.genre[lang])}",`,
    `        "d.${s.slug}": "${js(s.vormerken ? (lang === 'de' ? 'Erscheint am ' : 'Out ') + datumText(s.datum, lang) : datumText(s.datum, lang))}",`]).join('\n');
  const ld = {
    '@context': 'https://schema.org', '@type': 'MusicGroup', name: 'Veriatax Interactive', url: 'https://veriatax.com/music/',
    sameAs: SOCIAL.map(([, u]) => u),
    track: SONGS.map(s => ({ '@type': 'MusicRecording', name: s.titel, url: `https://veriatax.com/music/${s.slug}/`, datePublished: s.datum })),
  };
  return fuellen(vorlage('musik-uebersicht.html'), {
    NEUESTER: SONGS[0].slug, INTRO_EN: html(intro.en), JS_INTRO_DE: js(intro.de), JS_INTRO_EN: js(intro.en),
    KARTEN: karten.join('\n'), JS_KARTEN_DE: texte('de'), JS_KARTEN_EN: texte('en'),
    ICON_SPOTIFY: ICON.spotify, ICON_APPLE: ICON.apple, JSON_LD: JSON.stringify(ld, null, 2),
  });
}

// Musikbereich und Zahlen der Startseite
Object.assign(BAUSTEINE, {
  'musik-startseite'() {
    const gross = SONGS.slice(0, STARTSEITE_GROSS), klein = SONGS.slice(STARTSEITE_GROSS, STARTSEITE_GROSS + STARTSEITE_KLEIN);
    const z = ['<!-- Neueste Releases -->', '<div class="music-featured">'];
    gross.forEach((s, i) => z.push(
      `    <a class="music-card-featured glass" href="music/${s.slug}/">`,
      '        <div class="music-cover">',
      `            <img src="images/${s.slug}.jpg" alt="${html(s.titel)}" width="600" height="600" loading="lazy">`,
      '            <div class="music-cover-play">&#9654;</div>',
      '        </div>',
      '        <div class="music-info">',
      `            <span class="music-label" data-i18n="${i === 0 ? 'music.latest' : 'music.previous'}">${i === 0 ? 'Latest Release' : 'Previous Release'}</span>`,
      `            <h3 class="music-title">${html(s.titel)}</h3>`,
      `            <p class="music-genre" data-i18n="m.${s.slug}.genre">${html(s.genre.en)}</p>`,
      `            <p class="music-desc" data-i18n="m.${s.slug}.kurz">${html(kurztext(s, 'en'))}</p>`,
      s.vormerken ? '            <span class="music-platform" data-i18n="music.presave">Pre-save now &rarr;</span>'
                  : '            <span class="music-platform" data-i18n="music.listen">Listen now &rarr;</span>',
      '        </div>',
      '    </a>'));
    z.push('</div>', '', '<!-- Weitere Releases -->', '<h3 class="music-grid-heading" data-i18n="music.more">More Releases</h3>', '<div class="music-grid">');
    for (const s of klein) z.push(
      `    <a class="music-card-compact glass" href="music/${s.slug}/">`,
      `        <img src="images/thumbs/${s.slug}.jpg" alt="${html(s.titel)}" class="music-thumb" width="200" height="200" loading="lazy">`,
      '        <div class="music-card-text">',
      `            <h4>${html(s.titel)}</h4>`,
      `            <p data-i18n="m.${s.slug}.genre">${html(s.genre.en)}</p>`,
      '        </div>',
      '        <span class="music-card-arrow">&rarr;</span>',
      '    </a>');
    z.push('</div>', '<div class="music-all">',
      `    <a href="music/" class="btn btn-ghost" data-i18n="music.all">View all ${SONGS.length} releases &rarr;</a>`, '</div>');
    return z;
  },
  // Texte dazu in js/i18n.js
  'musik-texte'({ schalter }) {
    const lang = schalter.has('de') ? 'de' : 'en';
    const z = [];
    for (const s of SONGS.slice(0, STARTSEITE_GROSS + STARTSEITE_KLEIN)) z.push(`"m.${s.slug}.genre": "${js(s.genre[lang])}",`);
    for (const s of SONGS.slice(0, STARTSEITE_GROSS)) z.push(`"m.${s.slug}.kurz": "${js(kurztext(s, lang))}",`);
    z.push(`"music.all": "${lang === 'de' ? `Alle ${SONGS.length} Releases ansehen →` : `View all ${SONGS.length} releases →`}",`);
    return z;
  },
  zahlen() {
    const karte = (wert, ziel, k, t) => ['<div class="stat-card glass">',
      `    <div class="stat-value"${ziel ? ` data-target="${wert}"` : ''}>${wert}</div>`,
      `    <div class="stat-label" data-i18n="${k}">${t}</div>`, '</div>'];
    return [...karte(ANZAHL.spiele, true, 'stat.games', 'Games'), ...karte(SONGS.length, true, 'stat.music', 'Music Releases'),
      ...karte(ANZAHL.tools, false, 'stat.tools', 'Tool'), ...karte('∞', false, 'stat.ideas', 'Ideas in the Queue')];
  },
});

// Sitemap: feste Seiten mit Stand und Gewicht; Musikseiten kommen aus musik.json
const SITEMAP = [
  ['', '2026-11-27', '1.0'],
  ['games/flame-leap-lion/', '2026-11-27', '0.9'],
  ['tools/meter-scout/', '2026-11-27', '0.8'],
  ['games/mindforge/', '2026-11-27', '0.8'],
  ['music/', null, '0.8'],
  ['privacy/', '2026-11-27', '0.4'],
  ['licenses/', '2026-11-27', '0.3'],
  ['impressum/', '2026-11-27', '0.4'],
];
function sitemap() {
  const max = (...d) => d.filter(Boolean).sort().pop();
  const neuester = SONGS[0].datum;
  const eintraege = [];
  for (const [p, stand, prio] of SITEMAP) {
    if (p === 'music/') {
      eintraege.push([p, max(STAND_MUSIK, neuester), prio]);
      SONGS.forEach((s, i) => eintraege.push([`music/${s.slug}/`, max(STAND_MUSIK, s.datum), i < 3 ? '0.8' : '0.7']));
    } else eintraege.push([p, p === '' ? max(stand, neuester) : stand, prio]);
  }
  return ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...eintraege.flatMap(([p, d, pr]) => ['    <url>', `        <loc>https://veriatax.com/${p}</loc>`, `        <lastmod>${d}</lastmod>`, `        <priority>${pr}</priority>`, '    </url>']),
    '</urlset>', ''].join('\n');
}

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
    else if (/\.(html|css|js)$/.test(e.name)) liste.push(voll);
  }
  return liste;
}

const MARKE = /^([ \t]*)(<!--|\/\*) gemeinsam:([a-z-]+)((?: [a-z-]+)*) (-->|\*\/)\n([\s\S]*?)^([ \t]*)(<!--|\/\*) \/gemeinsam:\3 (-->|\*\/)$/gm;
let bausteine = 0;

function bausteineEinsetzen(text, datei) {
  const p = pfadZurWurzel(datei);
  const neu = text.replace(MARKE, (ganz, einzug, auf, name, schalterText, zu, _innen, einzug2, auf2, zu2) => {
    const fn = BAUSTEINE[name];
    if (!fn) { fehler.push(`${path.relative(ROOT, datei)}: unbekannter Baustein "${name}"`); return ganz; }
    bausteine++;
    const schalter = new Set(schalterText.trim().split(/\s+/).filter(Boolean));
    const zeilen = fn({ p, schalter }).map(l => (l ? einzug + l : l));
    return `${einzug}${auf} gemeinsam:${name}${schalterText} ${zu}\n${zeilen.join('\n')}\n${einzug}${auf2} /gemeinsam:${name} ${zu2}`;
  });
  const offen = (neu.match(/gemeinsam:[a-z-]+/g) || []).length - 2 * ((neu.match(/\/gemeinsam:[a-z-]+/g) || []).length);
  if (offen !== 0) fehler.push(`${path.relative(ROOT, datei)}: Markierung ohne Gegenstueck`);
  if (/\/gemeinsam:[a-z-]+ (?!-->|\*\/)/.test(neu)) fehler.push(`${path.relative(ROOT, datei)}: Schlussmarkierung bitte ohne Schalter, z. B. <!-- /gemeinsam:fusszeile -->`);
  return neu;
}

// Ergebnis je Datei: erzeugte Seiten ganz aus Vorlagen, alle anderen nur ihre Bausteine
const ergebnis = new Map();
if (!fehler.length) {
  for (const s of SONGS) {
    const d = path.join(ROOT, 'music', s.slug, 'index.html');
    ergebnis.set(d, bausteineEinsetzen(songseite(s), d));
  }
  const u = path.join(ROOT, 'music', 'index.html');
  ergebnis.set(u, bausteineEinsetzen(uebersicht(), u));
  ergebnis.set(path.join(ROOT, 'sitemap.xml'), sitemap());
  for (const datei of dateien()) {
    if (ergebnis.has(datei)) continue;
    const alt = fs.readFileSync(datei, 'utf8');
    if (alt.includes('gemeinsam:')) ergebnis.set(datei, bausteineEinsetzen(alt, datei));
  }
}

let geaendert = 0;
for (const [datei, neu] of ergebnis) {
  const alt = fs.existsSync(datei) ? fs.readFileSync(datei, 'utf8') : null;
  if (neu === alt) continue;
  geaendert++;
  if (CHECK) fehler.push(`${path.relative(ROOT, datei)}: ${alt === null ? 'fehlt' : 'veraltet'}, bitte "node _src/build.mjs" ausfuehren`);
  else { fs.mkdirSync(path.dirname(datei), { recursive: true }); fs.writeFileSync(datei, neu); }
}

if (fehler.length) { console.error(fehler.join('\n')); process.exit(1); }
console.log(CHECK ? `Alles aktuell (${SONGS.length} Songs, ${bausteine} Bausteine geprueft).`
  : `${SONGS.length} Songs, ${bausteine} Bausteine, ${geaendert} Dateien geaendert.`);
