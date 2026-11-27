# Gemeinsame Bausteine der Website

Teile, die auf vielen Seiten gleich sind, stehen nur noch an einer Stelle: in `_src/build.mjs`.
Das Skript schreibt sie in alle Seiten. Die Seiten bleiben normales HTML und funktionieren genau wie vorher.

Der Ordner `_src` wird nicht veröffentlicht. GitHub Pages lässt Ordner mit Unterstrich am Anfang weg.

## So ändert man einen gemeinsamen Teil

1. In `_src/build.mjs` ändern, zum Beispiel einen Link in `SOCIAL` oder einen Text in `TEXTE`.
2. Im Ordner der Website ausführen:

   ```
   node _src/build.mjs
   ```

3. Die geänderten Seiten committen.

Prüfen, ob alle Seiten aktuell sind (ändert nichts, meldet nur):

```
node _src/build.mjs --check
```

Dafür braucht man nur Node.js (ab Version 18), keine Pakete.

## Wo die Bausteine stehen

In den Seiten steht jeder Baustein zwischen zwei Markierungen:

```html
<!-- gemeinsam:fusszeile -->
… schreibt das Skript …
<!-- /gemeinsam:fusszeile -->
```

In CSS und JavaScript sehen die Markierungen so aus: `/* gemeinsam:name */`.

**Zwischen den Markierungen nichts von Hand ändern.** Beim nächsten Lauf wird es überschrieben.
Alles außerhalb gehört der Seite selbst und wird nie angefasst.

| Baustein | Inhalt | Seiten |
|---|---|---|
| `navigation` | Kopfleiste mit Logo, Menü und Sprachknopf | alle (Startseite mit Schalter `startseite`) |
| `fusszeile` | Fußzeile mit Rechtlichem und Social-Links | alle Unterseiten (404: `ohne-social flach`) |
| `fusszeile-css` | Aussehen der Fußzeile | alle Unterseiten |
| `menue-css` | Handy-Menü wie auf der Startseite | alle Unterseiten |
| `sprunglink-css` | „Zum Inhalt springen“ | alle Unterseiten |
| `schriften` | Schriften Rajdhani und Exo 2 vom eigenen Server | alle Unterseiten und `css/style.css` |
| `schriften-vorladen` | die zwei wichtigsten Schriftdateien früh laden | alle Seiten |
| `texte` | gemeinsame deutsche und englische Texte (Menü, Fußzeile) | alle Unterseiten |
| `statistik` | GoatCounter | alle Seiten |

Schalter stehen hinter dem Namen, zum Beispiel `<!-- gemeinsam:fusszeile ohne-social flach -->`.

Die Startseite holt ihre Texte weiter aus `js/i18n.js`. Das Jahr in der Fußzeile setzt das Skript bei jedem Lauf neu.

Weitere Bausteine für die Musik: `musik-startseite` (Startseite), `musik-texte de`/`musik-texte en` (in `js/i18n.js`) und `zahlen` („Über uns“).

## Musik

Alle Songs stehen in `_src/musik.json`. Daraus erzeugt das Skript:

- jede Songseite unter `music/<slug>/` (Vorlage: `_src/vorlagen/musik-song.html`),
- die Übersicht `music/` (Vorlage: `_src/vorlagen/musik-uebersicht.html`),
- den Musikbereich der Startseite (die zwei neuesten groß, die nächsten vier klein, dazu „Alle Releases ansehen“),
- die Liste „Mehr von Veriatax“ auf jeder Songseite,
- die Zahl der Releases in „Über uns“,
- die ganze `sitemap.xml`.

**Songseiten, Übersicht und Sitemap nicht von Hand ändern**, sondern `musik.json` oder die Vorlagen.

### Neuen Song hinzufügen

1. Drei Bilder ablegen (Dateiname = slug):
   - `images/<slug>.jpg`, Cover 600 × 600
   - `images/thumbs/<slug>.jpg`, Cover 200 × 200
   - `images/share/<slug>.jpg`, Vorschaubild 1200 × 630
2. In `_src/musik.json` einen Eintrag ergänzen. Die Reihenfolge in der Datei ist egal, sortiert wird nach Datum:

   ```json
   {
     "slug": "neuer-song",
     "titel": "Neuer Song",
     "titelZusatz": "Melodic House",
     "datum": "2026-12-12",
     "genre": { "de": "Melodic House", "en": "Melodic House" },
     "text": { "de": "Beschreibung …", "en": "Description …" },
     "spotify": "https://open.spotify.com/track/…",
     "apple": "https://music.apple.com/de/song/…",
     "aehnlich": ["golden-pulse", "riverside-light"]
   }
   ```

3. `node _src/build.mjs` ausführen und alles committen.

| Feld | Bedeutung |
|---|---|
| `slug` | Adresse und Bildname, nur Kleinbuchstaben und Bindestriche |
| `titel` | Songtitel |
| `titelZusatz` | steht im Browser-Tab hinter dem Titel |
| `datum` | Erscheinungstag als JJJJ-MM-TT |
| `genre`, `text` | Genre und Beschreibung, Deutsch und Englisch |
| `kurz` | optional: kürzerer Text für die Startseite; sonst nimmt das Skript den ersten Satz |
| `spotify`, `apple` | Links zum Song; `apple` ist optional |
| `vormerken` | optional, vor dem Erscheinen: Pre-Save-Link statt `spotify`. Dann zeigt die Seite „Auf Spotify vormerken“ und „Erscheint am …“. Nach dem Erscheinen entfernen und `spotify`/`apple` eintragen |
| `aehnlich` | optional: diese Songs stehen bei „Mehr von Veriatax“ vorne, danach alle übrigen, neueste zuerst |

Wird ein Song aus `musik.json` gelöscht, bleibt sein Ordner unter `music/` liegen und muss von Hand entfernt werden.
