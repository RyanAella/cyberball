# Cyberball – Projekt-Dokumentation

Ostrazismus-Forschungsspiel („Cyberball") auf Basis von **Phaser 3**, konzipiert für Online-Befragungen
(z. B. SoSciSurvey). Teilnehmende spielen eine Runde Ball-Werfen mit computergesteuerten Mitspielern
(CPUs) – je nach Bedingung inclusiv (sie erhalten Bälle) oder exklusiv (sie werden ignoriert).

Diese Doku richtet sich an die Studienleitung (Konfiguration & Einbindung in die Befragung) sowie an
Entwicklende (Aufbau, URL-Parameter, Code-Struktur).

---

## 1. Schnellüberblick

| Datei/Ordner   | Zweck                                                                 |
|----------------|-----------------------------------------------------------------------|
| `index.html`   | Configuration Builder (UI) + Spielstart per URL-Parameter            |
| `js/game.js`   | `GameScene` – das eigentliche Spiel (Würfe, Modi, Endscreen/Code)    |
| `js/preview.js`| `PhaserPreviewScene` – Live-Vorschau im Builder                       |
| `assets/`      | Ball, Player-Spritesheet (`player.json` multiatlas), Logos            |
| `README.md`    | Englische Kurzanleitung (Spielprinzip, Builder)                      |
| `CHANGELOG.md` | Versionshistorie                                                      |
| `docs/`        | Diese Dokumentation                                                   |

**Kein Build-System, keine Abhängigkeiten im Repo:** Phaser 3 wird per CDN geladen, alles ist
Vanilla HTML/JS. Das Spiel läuft statisch auf jedem Webserver (GitHub Pages, Uni-Webspace, …).

---

## 2. Ablauf einer Studie (typisch)

1. **Konfigurieren:** Forschende öffnen `index.html` (den „Builder"), stellen Spieler, Namen,
   Bilder, Modus und Wurfanzahl ein.
2. **Link erzeugen:** Button **Copy Link** erzeugt eine URL, die die komplette Konfiguration als
   Parameter enthält – inklusive aller Bilder (Base64, im Link eingebettet, s. Abschnitt 5).
3. **Einbinden:** Der Link wird in der Befragung (z. B. SoSciSurvey) in einem `<iframe>` eingebettet
   oder direkt als Seiten-Weiterleitung verwendet.
4. **Teilnahme:** Das Spiel startet automatisch (Countdown, erster CPU wirft) und endet nach der
   eingestellten Wurfanzahl.
5. **Kontrolle:** Am Ende erscheint ein zufällig generierter **Abschluss-Code**, den Teilnehmende
   im Fragebogen (z. B. als offene Frage direkt unter dem iframe) eintippen. So ist belegbar, dass
   das Spiel tatsächlich durchgespielt wurde.

---

## 3. URL-Parameter (Spielstart per Link)

Das Spiel startet automatisch, sobald der Parameter `cpus` in der URL vorhanden ist. Fehlt er,
zeigt die Seite stattdessen den Builder an.

| Parameter     | Bedeutung | Standard |
|---------------|-----------|----------|
| `cpus`        | Anzahl CPU-Mitspieler: `2` oder `3` | `2` |
| `mode`        | `inclusion` (Spieler erhält Bälle) oder `exclusion` (Spieler wird ignoriert) | `inclusion` |
| `throws`      | Anzahl Würfe bis zum Spielende; max. 32; `0` = unbegrenzt | `30` |
| `bgType`      | `color` oder `image` | `color` |
| `bg`          | Hintergrundfarbe (Hex) **oder** Base64-Bild-Data-URL (URL-encoded) | `#f5f5f5` |
| `playerColor` | Farbe des eigenen Avatars (nur wenn „Customize" aktiviert war) | `#FFFFFF` |
| `pname`       | Name des Teilnehmenden | `Player 1` |
| `cpuNames`    | CPU-Namen, pipe-getrennt (`Anna\|Ben\|Cleo`), URL-encoded | `CPU 1…` |
| `avatars`     | CPU-Bilder als Base64-Data-URLs, pipe-getrennt, URL-encoded | – |
| `avatar0`     | Bild des Teilnehmenden (Base64-Data-URL, URL-encoded) | – |
| `codePrefix`  | Präfix des Abschluss-Codes (z. B. `UNI`, `LAB`) | `CB` |
| `redirect`    | Optionale URL, zu der 5 s nach Spielende weitergeleitet wird | – |

**Wichtig fürs Hosting:** Die URL muss auf dem Verzeichnis mit trailing slash enden
(`.../cyberball/?cpus=2`, nicht `.../cyberball?cpus=2`), sonst liefern manche Server (z. B. der
VS-Code Live Server) einen 404-Fehler. Der „Copy Link"-Button setzt den Slash automatisch korrekt.

---

## 4. Spielmodi & Verhalten

- **Inclusion:** Der Ball startet bei einem zufälligen CPU. CPUs werfen bevorzugt an die Spieler
  mit den wenigsten bisherigen Ballkontakten (Gleichstand zufällig aufgelöst) – so erhält der
  Teilnehmende bei 30–32 Würfen zuverlässig ca. 7–8 Bälle und die CPUs werden ungefähr gleich
  oft eingebunden. Wer den Ball hat, wirft per Klick auf einen Mitspieler.
- **Exclusion:** Nach dem ersten eigenen Wurf des Teilnehmenden werfen die CPUs nur noch
  untereinander – der Teilnehmende erhält keinen Ball mehr (klassische Ostrazismus-Bedingung).
- **Spielende:** Nach der eingestellten Wurfanzahl (`throws`) erscheint der Endscreen mit dem
  Abschluss-Code. Optional folgt eine Weiterleitung zur Befragung (Parameter `redirect`).
- **Abschluss-Code:** Format `<codePrefix>-<8 zufällige Zeichen>` (ohne leicht verwechselbare
  Zeichen: kein 0/O, 1/I etc.). Der Code wird zusätzlich in `window.cyberballCompletionCode`
  abgelegt, falls die Befragungsseite ihn programmatisch auslesen will.

---

## 5. Bilder (Avatare & Hintergrund)

- **Konzept:** Kein Server-Speicher, keine externen Bild-Hosts, kein CORS-Proxy. Bilder werden im
  Browser verkleinert und komprimiert (Canvas → JPEG-Data-URL) und als Base64 **direkt im
  Spiel-Link** eingebettet:
  - Avatare: max. 96×96 px, Qualität 0.8 → typischerweise 1–5 KB pro Bild
  - Hintergrund: max. 800×600 px, Qualität 0.7
- **Darstellung:** Avatare erscheinen als kleines Bild (48×48 im Spiel) über jedem Spieler, der
  Name darunter.
- **Grenzen:** Mit Hintergrundbild und 3 CPUs kann der Link mehrere Kilobybyte groß werden –
  sehr lange Links können von manchen Tools gekürzt werden. Im Zweifel Hintergrundfarbe statt
  -bild verwenden und den Link direkt im iframe-`src` hinterlegen.

---

## 6. Einbindung in SoSciSurvey (iframe)

Beispiel (HTML-Frage oder Textbaustein in SoSciSurvey):

```html
<iframe src="https://<dein-server>/cyberball/?cpus=3&mode=exclusion&throws=30&codePrefix=UNI"
        width="820" height="640" style="border:0;"></iframe>
```

Direkt darunter im Fragebogen: eine offene Eingabefrage „Bitte geben Sie den Code aus dem Spiel ein."

**Embedded-Modus:** Öffnet man das Spiel über eine URL mit Parametern (wie im iframe), blendet
sich alles Störende aus – Logo, Überschrift, Startanweisung und der Rahmen. Sichtbar ist nur das
800×600-Pixel-Spielfeld. Der Builder (ohne Parameter) zeigt weiterhin die normale Oberfläche.

**Hinweis zum iframe:** Das Spiel läuft komplett clientseitig; die Befragungsseite braucht keinen
Zugriff auf das Spiel. Der Abschluss-Code wird vom Teilnehmenden manuell abgetippt – dafür ist
keine Weiterleitung nötig, aber der optionale `redirect`-Parameter existiert weiterhin.

---

## 7. Code-Struktur (für Entwicklende)

### `index.html`
- **Builder-UI:** zwei Tabs („Participant", „Settings") mit Vorschau (500×400) rechts.
- **Inline-Skripte:** URL-Parsing beim Laden → entweder Builder füllen oder Spiel starten;
  `getConfig()` sammelt die aktuellen Einstellungen; `buildGameParams()` baut die URL-Parameter;
  `compressImageToDataUrl(file, maxDim, quality)` erledigt die Bild-Komprimierung.
- **Achtung:** `getConfig()` muss die *aktuell gewählte* CPU-Anzahl verwenden, nicht die aus der
  URL – sonst fehlen z. B. die Felder des dritten CPU im generierten Link (bekannter, gefixter Bug).

### `js/game.js` – `GameScene`
- `preload()`: Assets mit korrigierter Base-URL (`setBaseURL`), dynamische Laden von Hintergrund
  und Avataren (Data-URLs brauchen temporär `setBaseURL('')`).
- `create()`: Spieler-Positionen (bei 3 CPUs flacher gestellt, damit Avatar-Bilder oben nicht am
  Rand kleben), Animationen, Wurf-/Fang-Logik (`physics.moveTo` + Overlap), Modi, Endscreen.
- **Auto-Start:** Ball startet bei zufälligem CPU, Countdown 3-2-1, dann `cpuThrow()`.
- Countdown und Wurf-Logik laufen über `this.time.addEvent` / `delayedCall`.

### `js/preview.js` – `PhaserPreviewScene`
- Skalierte Miniaturansicht (500×400) der Spielerpositionen, Namen, Avatare und des Hintergrunds.
- Startet neu (`scene.restart`), wenn sich Hintergrund, CPU-Anzahl oder Avatare ändern.

### Bekannte Eigenheiten
- **„Texture key already in use"**-Warnung im Builder: Vorschau und Spiel nutzen dieselben
  Asset-Keys. Rein kosmetisch, hat keine Auswirkung auf das Spiel im iframe.
- **WebGL-Screenshots:** In headless-Tests ist der Canvas schwarz, sofern nicht
  `preserveDrawingBuffer: true` gesetzt wird (nur für automatisierte Tests relevant).

---

## 8. Workflow & Konventionen (dieses Repo)

- **Branches:** Neue Features entstehen auf `feature/<name>`-Branches. **Direkte Commits/Pushes auf
  `master` sind tabu.** Der Merge auf `master` erfolgt ausschließlich durch die Projektinhaberin.
- **Autorenschaft:** Alle Commits laufen auf **Rebecca Biebl** (in der Repo-Git-Config gesetzt):
  `git config user.name` / `user.email` entsprechend prüfen, bevor committet wird.
- **Commit-Stil:** Kurze englische Zusammenfassung + Aufzählung der Änderungen; keine
  Co-authored-by-Trailer.
- **Tests:** Syntax via `node --check js/*.js` bzw. `new Function(...)` für Inline-Skripte;
  funktionale Prüfungen per Playwright (lokal, Port 5500, Verzeichnis mit trailing slash).

---

## 9. Checkliste: Studie vorbereiten

- [ ] Spiel auf stabilen Webspace hochladen (GitHub Pages, Uni-Server, …)
- [ ] Im Builder konfigurieren: Modus, Würfe, Code-Präfix, Namen, Bilder
- [ ] **Copy Link** → Link testen (im Inkognito-Fenster: startet das Spiel automatisch?)
- [ ] In SoSciSurvey als iframe einbetten, Code-Abfrage darunter platzieren
- [ ] Testdurchlauf: Spiel bis zum Ende spielen, Code eingeben
- [ ] Erwartete Wurfanzahl & Spielzeit prüfen (ca. 1–2 s pro Wurf)
