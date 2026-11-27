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
