# Masterplan — Werkzeug, Zweck, Ziele, Stand, Offenes

> Stand: 5. Oktober 2026 · Umfang: **42 Blätter in 23 Feldern**, alle Repos sauber und veröffentlicht
> Diese Datei ist eine Bestandsaufnahme, kein Auftrag. Aus dem, was hier steht, lässt sich jederzeit ein
> Arbeitsauftrag an ein anderes Modell oder Werkzeug ableiten.

---

## 1. Was das hier ist

Ein privater Werkstätten-Betrieb für **selbstverifizierende Einzelblätter**: kleine, in sich
geschlossene Webseiten, die eine einzige Behauptung mathematisch oder technisch unter sich selbst
beweisen. Keine Demonstrationsseiten, keine Tutorial-Seiten, keine Marketing-Seiten. Jedes Blatt ist
so gebaut, dass es seine eigene Behauptung nachrechnet und den Rechenweg offenlegt.

Der Kern ist eine Sammlung, die man als Endlosschleife liest: Jedes Blatt erklärt ein Stück
Wirklichkeit, indem es es nachrechnet, und macht sichtbar, wie viel Genauigkeit dabei wirklich
herauskommt — nicht wie viel man behauptet.

**Was das nicht ist:** kein Produkt, keine Kundenarbeit, keine Demo für Vorgesetzte. Nichts davon
hat einen Adressaten außer der Person, die es baut.

---

## 2. Warum es das gibt

### 2.1 Der Antrieb

Der Auslöser war Unlust, nicht Faszination. Überall dort, wo eine Zahl behauptet wird, steht
irgendwo „ungefähr", „erfahrungsgemäß", „dürfte bei" — und niemand rechnet nach. Das ist teuer. Wer
eine Fertigung mit 14 Tagen Sicherheitsbestand plant und 60 hat, hat nicht falsch gerechnet, sondern
gar nicht. Wer Streuung im Preis ignoriert, zahlt sie später doppelt.

Die Werkstatt ist der Gegenbau dazu: **eine Behauptung, eine Rechnung, ein Beweis der Rechnung
selbst.** Nicht „hier ist das Ergebnis", sondern „hier ist der Weg, und hier ist der Grenzpunkt, an
dem der Weg nachweislich aufhört zu stimmen".

### 2.2 Was daran neu ist

Nicht die Algorithmen. Alle hier verwendeten Verfahren — Huffman, Reed-Solomon, Dijkstra, Black-Scholes,
Perkolation — sind Standard und seit Jahrzehnten bekannt. Neu ist die **Beweisdisziplin**:

- Kein Ergebnis gilt als belegt, bevor der **gesamte relevante Raum** durchlaufen ist, nicht eine
  Stichprobe. Wenn der Raum endlich ist, wird er durchgezählt (Unicode: 1 112 064 Zeichen,
  Farbräume: alle 16 777 216 sRGB-Farben). Wenn er unendlich ist, werden die **Eigenschaften**
  geprüft, die für alle Punkte gelten müssen (Monotonie, Symmetrie, Identitäten).
- Jede Rechnung bekommt eine **unabhängige Gegenrechnung**. Nicht derselbe Weg zweimal, sondern
  ein zweiter Weg mit anderer Herleitung: der Wortlaut der Definition gegen die optimierte Fassung,
  die numerische Integration gegen die geschlossene Formel, der eigene Parser gegen den
  Fremd-Decoder des Browsers.
- Jede Prüfung bekommt eine **Gegenprobe mit bekanntem Ausgang**. Ein Test, der nicht scheitern
  kann, ist Dekoration. „Grün" beweist nichts, wenn die Maschine bei Fehlern genauso grün wäre.
- Was der Rechnung **nicht** gelingt, wird **gemessen und hingeschrieben**, nicht wegformuliert.
  Eigene Rundungsfehler sind Teil des Blattes, nicht dessen Makel.
- Ein leeres Ergebnis gilt als **Warnung**, nicht als Entwarnung. „Keine Treffer" ist nur eine
  Aussage, wenn belegt ist, dass gesucht wurde.

### 2.3 Der eigentliche Ertrag

Nicht die Blätter selbst — die sind in Tagen zu schreiben und dann fertig. Der Ertrag steckt im
**Abschnitt „Was mich das gekostet hat"** jedes Blattes.

Es ist die interessanteste Sammlung im ganzen Bestand. Sie beginnt bei trivialen, läuft über
subtile, landet regelmäßig bei „ich hatte das im Kopf falsch". Zusammengetragen:

**Gefundene Fehler, nach Häufigkeit sortiert:**

1. **Index-Um-eins** — klassisch. In den Blättern steht mehrfach, dass ein Array-Index um eins
   verschoben war, und die Prüfung es sofort meldete, weil die Zahl zu sauber stimmte. Ein
   verschobener Index erzeugt selten „näherungsweise richtig"; er erzeugt systematisch falsch.
2. **Die Optimierung war das Problem** — der schnelle Weg lieferte plausiblere Ergebnisse als der
   Referenzweg, also wurde der Referenzweg als Referenz entwertet. In einem Blatt verlor der
   Return-Wert bei der Rückrechnung 1 Bit gegenüber der Vorwärtsrichtung, und beides war intern
   konsistent. Nur der Vergleich mit der Definition deckte es auf.
3. **Gleitkomma bei Zwischenschritten** — die Auffälligkeit ist, dass stellenweise *exakt* gleich
   herauskam (1 ULP Unterschied über 22 Sekunden). Wer nach „rund" sucht, findet es nicht.
4. **Der Randfall, den man nicht vorsieht** — der Fehler steckt nicht in der Hauptlinie, sondern
   dort, wo der Algorithmus eine Annahme über den Rand macht: ein Bit-Umschlag am *letzten*
   Restbit wird von den meisten Parsern still geschluckt, wenn man nicht gezielt darauf prüft.
5. **Vorschnelle Korrekturen** — die eigentliche Fehlerklasse: eine Anomalie sichtbar, schnelle
   Erklärung gesucht, weggekorrigiert, Anomalie bleibt. (Ein Blatt: Segmentlängen „korrigiert", weil
   die Fehlermeldung unverändert blieb — der Fehler lag woanders, in einem Byte, das zwei Bedeutungen
   hat. Ein anderes: eine Reparatur, die den Zustand messbar verschlechterte; zurückgerollt an
   Hand der Zahl, nicht des Gefühls.)
6. **Ein Wert vor dem anderen, den niemand angefasst hat** — Farbvariable für ein neu eröffnetes
   Feld im `--gN`-System vergeben, im `index.html` eingetragen, aber nie im `:root` definiert. Der
   Planungsfehler, den kein Prüflauf des betroffenen Blattes findet, weil das Blatt die Farbe gar
   nicht benutzt — und der erst beim Nachmessen der Sammelseite auffällt (siehe 7.3).

**Diese Fehler sind in echten Arbeitsumgebungen entstanden.** Sie tauchen wieder auf — als
Schätzung, als Plausibilitätsannahme, als stiller Fehler ohne Fehlermeldung. Wer sie einmal
benannt gesehen hat, prüft anders. Die Werkstatt trainiert diesen Blick, ohne dass jemand es merkt.

---

## 3. Die Ziele

### 3.1 Hauptaufgabe

**Eine Sammlung eigenständiger Blätter bauen, von denen jedes seine eigene Behauptung beweist.**

Woran „fertig" gemessen wird:

- Ein Blatt gilt als fertig, wenn sein Prüfknopf im echten Browser gedrückt **grün** wird, und
  zwar am **identischen File, das veröffentlicht wird** — kein Nachbau, keine Attrappe.
- Und wenn es eine **Gegenprobe** enthält, die bei Störung **rot** wird.
- Und wenn die Grenzen benannt sind (was reicht nicht, was ist modelliert, was bleibt offen).

### 3.2 Nebenaufgaben, aus dem Hauptaufgabe-Nutzwerk folgen

1. **Rechenstrecke sichtbar machen** — der Weg ist interessanter als der Wert, und die
   Anschaulichkeit entsteht aus dem Nachrechnen, nicht aus dem Erzählen.
2. **Umgangssprach statt Fachsprache** — 14-jährige und eine 14-Jährige müssen den Witz der Sache
   begreifen, ohne belogen zu werden. Fachbegriffe werden erklärt, nicht vermieden.
3. **Fünf Größenordnungen müssen zusammenpassen** — die Ansicht darf auf dem Telefon nicht
   umbrechen, auf 4K darf sie nicht verloren gehen (Staffelung 1500/1800/2200 px), hell und dunkel
   müssen beide tragen.
4. **Ein Blatt ist eine Datei** — kein Build, keine Paketverwaltung, keine externe Zeile, kein CDN.
   Eine Blatt muss einzeln weitergereicht werden können und dann noch funktionieren.
5. **Nach 6 Monaten noch lesbar** — mit den inneren Details, die man beim Bauen wusste, aber nach
   6 Monaten nicht mehr weiß.

### 3.3 Was die Sammlung NICHT sein soll

- Kein Tutorial, keine Einführung in ein Thema
- Kein Benchmark, kein Vergleich
- Kein Produkt, keine Firma, kein Auftritt
- Kein Blatt, das einem Unternehmen nützt
- Kein Blatt, aus dem sich etwas ableiten lässt, das man einer fremden Organisation antut

Das ist **keine** Nebenbedingung, sondern Grenze. Die Werkstatt ist genau dann wertlos, wenn sie
zu einer Sammlung beliebiger veröffentlichungsfähiger Artefakte verkommt.

---

## 4. Was bereits gebaut ist

### 4.1 Die Sammlung — 23 Felder, 42 Blätter

| Feld | Karten | Blätter |
|---|---|---|
| Zahl & Genauigkeit | 4 | Nachkomma · Würfel · Handschlag · Vorhersage |
| Sprache & Maschine | 3 | Übersetzer · Rechenwerk · Schriftcode |
| Daten & Speicher | 4 | Redundanz · Reparatur · Schmiegung · Indexbaum |
| Auge & Ohr | 2 | Frequenzgang · Augenmaß |
| Muster & Form | 3 | Ornament · Stimmführung · Plotterblätter |
| Kraft & Tragen | 1 | Tragwerk |
| Wege & Entscheidungen | 2 | Wegewahl · Auszählung |
| Schrift & Satz | 1 | Blocksatz |
| Erde & Zeit | 3 | Verzerrung · Zeitsprung · Gradtage |
| Leben & Wachstum | 1 | Abgleich |
| Spiel & Strategie | 3 | Spielbaum · Mischung · Turnier |
| Markt & Risiko | 1 | Tilgung |
| Licht & Optik | 1 | Regenbogen |
| Falten & Papier | 1 | Faltung |
| Verkehr & Fluss | 1 | Stau |
| Rätsel & Deduktion | 1 | Minen |
| Ordnen & Vergleichen | 1 | Sortiernetz |
| Schwelle & Übergang | 1 | Schwelle |
| Geschick & Reflex | 1 | Ansturm |
| Nachbarschaft & Raum | 1 | Nachbarschaft |
| Strömung & Wirbel | 1 | Strömung |
| Lernen & Anpassen | 1 | Einüben |
| Angriff & Abwehr | 4 | Knackbar · Phishing-Auge · Klartext · Einbruchsprobe |

**Regel, die dabei eingehalten wird:** ein neues Stück gehört in ein Feld, das anders ist als das
letzte. Nie Einzelkarten — ein Feld mit genau einer Karte ist ein Etikett, kein Feld. Entweder
bestehendes Feld sinnvoll ergänzen oder neues Feld mit mindestens zwei Karten eröffnen.

### 4.2 Was die Blätter inhaltlich tragen

Nur die Beweisstärke, nicht das Thema — Themen stehen in 4.1. Die Beweisarten, sortiert nach
Belegkraft:

**Vollständig durchgezählt (der stärkste Beweis)**

| Blatt | Was durchgezählt wurde |
|---|---|
| Schriftcode | alle 1 112 064 Unicode-Skalarwerte, Byte für Byte gegen den eingebauten Encoder, beide Richtungen |
| Augenmaß | alle 16 777 216 sRGB-Farben durch den OKLCH-Umweg; dabei **null** Farben erreichen 4,5:1 Kontrast auf hellem *und* dunklem Grund |
| Gradtage | 41 Jahre echte Messreihe |
| Redundanz | jeder Durchgang packt zurück und vergleicht Byte für Byte gegen zlib |
| Mischung | Nullsummenspiel gegen erschöpfende Enumeration aller Trägermengen |
| Auszählung | alle 2002 Wahlstapel |
| Reparatur | alle 65 536 Bytepaare, alle 255 Symbolschritte |
| Blocksatz | 103 264 Aufteilungen einzeln durchprobiert |
| Abgleich | 161 850 Ausrichtungen |
| Regenbogen | 256 000 Strahlen |
| Spielbaum | 4096 Nim-Stellungen rückwärts + 255 168 Partien |
| Einüben | Gradientencheck über alle Gewichte |
| Knackbar | alle MD5-Testvektoren |

**Identität für alle Punkte in einem Raum (eleganteste Form)**

| Blatt | Identität |
|---|---|
| Handschlag | alle 21 952 Punkt-Tripel auf der elliptischen Kurve |
| Stau | Stauwelle wandert mit gemessenen −15 km/h — wie auf echten Autobahnen |
| Vorhersage | deterministisch bis aufs letzte Bit, trotzdem nach 22 s unvorhersagbar |
| Faltung | Origami-Bedingungen in beide Richtungen geprüft |
| Stimmführung | neun Prüfungen, darunter die eigene MIDI-Datei zurückgelesen |
| Schmiegung | 12 selbst geschriebene JPEG-Dateien, bytegenau vom Browser-Decoder zurück |
| Sortiernetz | alle 161 möglichen Netze kleiner Mengen aufgezählt |

**Eigenschaften statt Punkte (unendlicher Raum)**

| Blatt | Geprüfte Eigenschaft |
|---|---|
| Schwelle | Perkolation: Schwelle selbst gemessen, Exponent 4/3 fällt aus der Schärfe |
| Nachbarschaft | Voronoi/Delaunay auf ganzen Koordinaten, alle 240 114 Dreieck-Punkt-Paare |
| Ansturm | gleicher Zustandsabdruck bei 30 wie bei 240 Bildern/s — Bildratenunabhängigkeit |
| Strömung | Zerfallsrate auf 1 % gegen exp(−2νk²t), Strouhal-Zahl gemessen |
| Turnier | Einladungsschwelle gemessen und hergeleitet, Abstand 4·10⁻¹⁷ |

**Zweiter Weg als Zeuge**

| Blatt | Zweiter Weg |
|---|---|
| Übersetzer | zwei Parser, zwei Auswerter |
| Rechenwerk | 525 056 Fälle, alle Gatterpaare |
| Frequenzgang | eigene FFT gegen die Definition, Fenster gegen Harris (1978) |
| Tilgung | Effektivzins per Newton *und* Bisektion |
| Schmiegung | eigener Deuter gegen den Browser-Decoder, Korrelation 0,999 |

**Gegenproben — der Test muss schiefgehen**

| Blatt | Gegenprobe |
|---|---|
| Schriftcode | nachgiebiger Decoder, der still ersetzt → ertappt |
| Klartext | eingeschleuster Netzwerkzugriff → ertappt |
| Schmiegung | 317 Einzelbit-Störungen → alle bemerkt; Farben-Tauscher → ertappt |
| Einbruch | 3 Klicks → 3 Aktionen ohne Schutz, 0 mit |
| Knackbar | Salting zerstört die Wiederverwendung |

**Interaktiv und/oder spielbar**

| Blatt | Was man tut |
|---|---|
| Wegewahl | Pfade auf einer bemalbaren Karte ziehen, jeden angefassten Feld sehen |
| Minen | echtes Minenräumen mit Brettern, bei denen jeder Zug erzwungen ist |
| Ansturm | Echtzeit-Arenaspiel, Zustand Tick für Tick wiederholbar |
| Strömung | Tinte mit der Maus rühren, Wirbelstraße beobachten |
| Plotterblätter | vier Blätter: Wave Function Collapse, Wellengleichung, Physarum, Lenia |
| Stimmführung | Akkorde anhören, geführte Stimmen, plus Node-CLI aus derselben Logik |
| Phishing-Auge | acht erfundene Nachrichten anklicken, Fehlalarme zählen |
| Knackbar | Wörterbuchangriff auf eigene Demo-Konten zum Zusehen |

### 4.3 Werkzeuge der Sammlung

**Pflege (`werkzeug/pflege.mjs`)** — greift ein, überschreibt wieder, idempotent:
- Vorspann auf volle Seitenbreite, linksbündig (zentriert liest sich bei einer Zeile gut, bei
  sechs schlecht)
- Seitenbreite staffeln (1500/1800/2200 px)
- Schärfe-Einschub: Canvas in Geräte-Pixeln rastern — **mit Ausnahme** der Blätter, die selbst
  Pixel lesen oder schreiben, sonst brechen ihre Prüfläufe
- Jeder Eingriff hinterlässt ein Merkzeichen, ein zweiter Lauf wiederholt ihn nicht

**Nachmessen (`werkzeug/pruefblick.mjs`)** — misst im echten Browser:
- Ausrichtung auf das Pixel **gegen die Überschrift**, nicht gegen den Kasten (gegen den Kasten
  zählt dessen Polsterung mit und meldet fälschlich 56 px Differenz)
- Querlauf bei 380 px Breite
- Kontrast hell **und** dunkel
- Höhe von Knöpfen und Reglern
- undefinierte CSS-Farbvariablen
- ob der Ansichtsschalter wirklich umschaltet **samt mitziehenden Bildern**

Genau dieses Werkzeug hat in einem Blatt einen wirkungslosen Schalter entlarvt: Er war im
Schärfe-Einschub gelandet, der auf gewöhnlichen Schirmen früh aussteigt.

**CI** — identisch in allen Blättern (`.github/pruefen.mjs` + `.github/workflows/pruefen.yml`):
- Playwright drückt den echten Prüfknopf im Browser, an derselben Datei, die veröffentlicht wird
- Erkennt drei Fehlformulierungen des Fehlschlags: „N Prüfung(en) fehlgeschlagen", „N FEHLER",
  „N FALSCHE FÄLLE" (die letzten beiden verankert, sonst schlägt ein Erfolgssatz der Form „kein
  einziger Fehler" fälschlich an) plus einen markup-unabhängigen Rotscan der Prüftabelle
- Läuft nur bei HTML/MJS/Workflow-Änderung, nicht bei README-Änderung; zusätzlich als Zeitplan
- Browser aus dem Cache; ~25 s pro Lauf; öffentliche Repos verbrauchen keine Actions-Minuten

### 4.4 Der Standortkontext, der das trägt

Auf demselben Rechner liegen **zwei Git-Identitäten** nebeneinander, und sie werden per `includeIf`
in der globalen Git-Konfiguration getrennt — die eine für die Werkstatt, die andere für
berufliche Projekte. Getrennt über den Pfad, damit die private Identität **nie** in fremde
Arbeitsbereiche durchsickert und umgekehrt.

```
[includeIf "gitdir:C:/Projekte/<beruflicher Ordner>/"]
	path = C:/Projekte/<beruflicher Ordner>/.gitconfig-beruflich
[includeIf "gitdir/i:C:/Projekte/_sandbox/"]
	path = C:/Projekte/_sandbox/.gitconfig-sandbox
```

Inhalt der Werkstatt-Konfiguration:

```gitconfig
[user]
	name = ssims437
	email = 83755683+ssims437@users.noreply.github.com
```

Die `noreply`-Adresse hält die Commits dem Konto zugeordnet, ohne den Nachnamen zu zeigen. Die
globale Identität bleibt für berufliche Projekte **unangetastet** — `git config --global user.*`
wird im Werkstattbereich nie gesetzt. Am 17.08.2026 wurde die Historie aller damals 16 Repos per
`filter-branch` auf diese Identität vereinheitlicht; neue Repos erben sie automatisch über den
`includeIf`-Pfad.

**Struktur je Blatt-Repo (überall gleich):**

```
<blatt>/
  .github/pruefen.mjs
  .github/workflows/pruefen.yml
  .gitignore
  index.html          ← die eine Datei, alles drin
  LICENSE             ← MIT, Rechteinhaber ssims437
  README.md
```

Der Elternordner der Werkstatt ist **kein** Repo. Dort liegen zwei lokale Playwright-Helfer
(nicht versioniert) sowie ein `node_modules` mit Playwright, das aus jedem Blatt-Ordner heraus
nach oben aufgelöst wird.

---

## 5. Was im Bauen passiert ist

Die Fehlerliste aus 2.2 ist das Ergebnis. Vier vollständige Blatt-Geschichten, weil sie den
Zusammenhang zeigen:

**Schmiegung (JPEG von Hand)** — das jüngste Blatt, sieben Fehler in einer Sitzung:
- Die **fehlenden 128**: Das Format verlangt Pegelversatz −128 vor der Transformation, +128 nach
  der Rückkehr. Beides vergessen. Der eigene Roundtrip blieb grün, weil Schreiber und Deuter
  denselben Blindfleck teilten — hin ohne Versatz, zurück ohne Versatz, Differenz null. Erst der
  Fremd-Zeuge fiel um: Grau 150 kam als gesättigtes Magenta zurück. Gefunden über ein
  8×8-Einfarbig-Bild.
- **Energie verschwand auf exakt ein Viertel**: Die Transformationsgewichte doppelt schief. Der
  Prüflauf meldete Rot, verriet aber seine Messwerte — fest eingetippte Nullen statt Zahlen, der
  alte Fehler in neuer Verkleidung. Der Einzelnadel-Test brachte es auf einen Blick: Eingangsenergie
  262 144, Ausgangsenergie 65 536, also Parseval verletzt um Faktor 4 — zwei Achsen à Faktor 2.
- **Cr polsterte aus der falschen Ebene**: Beim Halbierungszweig wurde eine Variable umgebogen, die
  zweite vergessen. Räumlicher Versatz, mittlerer Fehler auf Rot 72. Gefunden über die
  Kanal-Isolierung: ΔR 71,6 · ΔG 36,3 · ΔB 6,7 — nur B war unbeteiligt, also war es Cr.
- **Der falsche Fix, der den Zustand verschlechterte**: Bei schleieriger Rekonstruktion wurde die
  Dequantisierung „repariert" — PSNR fiel von 33 auf 20 dB. Der Fix war die Ursache; zurückgerollt
  anhand der Zahl.
- **Die Quantisierungstabelle in Raster- statt Zickzackordnung geschrieben**: intern konsistent, in
  fremden Decodern falsch. Gefunden über ein Header-Duell gegen eine unabhängig erzeugte Datei.

**Schriftcode (UTF-8 von Hand)** — der Überlang-Index war um eins verschoben; der hexadezimale
Index-Leck kam von einer unbeabsichtigten Seitenwirkung von `.map()`, das den Array-Index als
zweites Argument an den Callback reicht, der ein `padStart(st || 2, "0")` akzeptierte.

**Eine Sitzung, in der fast alles falsch war** — mehrere Korrekturen aus dem Gefühl, die Messwerte
aber den Weg gewiesen haben. Der Punkt: Ohne strenge Messung wären drei davon gelandet.

**Knackbar, Klartext, Phishauge, Einbruchsprobe** (Feld *Angriff & Abwehr*, zuletzt gebaut) —
Thema, das dem Beruf am nächsten liegt: Der Wörterbuchangriff läuft gegen eigene Demo-Konten zum
Zusehen, das Phishing-Auge zählt Fehlalarme gegen dich, Klartext zeigt, was eine Seite über dich
sieht (und beweist per Quelltext-Selbstscan, dass nichts nach draußen geht), die Einbruchsprobe
prüft Clickjacking, CSRF und PIN-Raten. Anlass: Der eigene Beruf wird im Detail gelebt, aber die
meisten Werkzeuge dieser Art sind Blackboxen. Der Selbstscan ist die Pointe — das Werkzeug prüft
seine eigenen Abflüsse, wie es ein externes täte.

---

## 6. Der Regelkanon (verbindlich)

1. **Eine einzelne self-contained HTML-Datei.** Kein Build, keine Paketverwaltung, keine externe
   Zeile, kein CDN. Ein Blatt muss einzeln weitergereicht werden können und dann noch
   funktionieren. 55–70 kB pro Blatt ist die reale Größenordnung.
2. **Gemeinsame Handschrift.** Dieselben CSS-Token, Kästen mit Kopfzeile, Reglerleiste,
   Monospace-Kleinschrift für Marken, hell **und** dunkel über `prefers-color-scheme` **und**
   `[data-theme]`. Der Token-Satz steht wörtlich in einem bestehenden Blatt.
3. **Beweis statt Behauptung.** Jedes Blatt hat einen eingebauten Prüflauf hinter `#b-pruefen`,
   der das eigene Verfahren gegen eine **unabhängige Referenz** stellt — erschöpfend statt
   Stichprobe, wo möglich. Der Prüflauf ist der Test; es gibt keine separate Testsuite.
4. **README mit „Was mich das gekostet hat"** — die echten Fehler beim Bauen, mit Messwerten, auch
   wenn sie unbequem sind. Bewährter Aufbau: `# Titel` → Warum … überhaupt prüfbar ist → Was der
   Prüflauf zeigt → … ist gemessen, nicht geraten → **Was mich das gekostet hat** → Technik →
   Die ganze Sammlung → Lizenz.
5. **Echte Umlaute** in allem Fließtext, auch in `<meta name="description">`. ASCII nur für
   Dateinamen, Bezeichner, CLI-Schalter, Commit-Betreffe.
6. **MIT-Lizenz**, Rechteinhaber `ssims437`. `.gitignore` für Arbeitsbilder.
7. **Nabe statt Netz.** Jedes Blatt verweist im Fuß **nur** auf die Sammelseite; kein Blatt
   verlinkt ein anderes. Vorher war es ein Vollnetz (15 × 14 = 210 Links, 16 Repos je neuem
   Blatt) — jetzt kostet ein neues Blatt **zwei Commits**. Keine Zahlwörter in Titeln oder
   Fußzeilen („Alle Blätter", nicht „Alle fünfunddreißig Blätter"), sonst kostet jedes neue Stück
   wieder 16 Commits; die Sammelseite zählt selbst über `ALLE.length`.
8. **CI in jedem Repo**, identisch in allen Blättern, eigene Fassung in der Sammelseite.
9. **Identität:** überall nur der GitHub-Nick `ssims437` — auch in der Lizenz und in der
   Commit-Historie.
10. **Commits ohne Co-Autoren und ohne jeden KI-/Claude-/Anthropic-Hinweis.** Betreffzeile
    sachlich, ASCII, Umlaute im Commit-Betreff umschrieben.

**Gestaltungsvorgaben aus dem Design-Durchgang (25.08.2026, alles gemessen):**
- Vorspann linksbündig, **ohne eigene Breitenbremse** — über die volle Inhaltsbreite
- Breite Inhalte scrollen im eigenen Kasten (`overflow-x`) — vier Blätter liefen auf 380 px seitwärts
  aus der Seite
- Klickflächen ≥ 34 px, Regler ≥ 26 px, sichtbarer Fokusrahmen
- Kontrast der leisen Schrift ≥ 5:1 gerechnet (vier Blätter lagen unter 4,5:1)
- Kopfzeile „Blatt · Feld", `h1` mit `clamp(24px, 4.2vw, 40px)`, Ansichtsschalter hell/dunkel
- `prefers-reduced-motion` respektieren
- Seitenbreite gestaffelt: 1500 / 1800 / 2200 px

**Fallen aus der Praxis (jede ist einmal echt passiert):**
- **Erst die Zahl messen, dann schreiben.** Ein Prüflauf rechnet asynchron weiter; direkt nach dem
  Klick steht noch „noch nicht geprüft" da. Nie eine Prüflauf-Zahl aus dem Kopf in eine Karte oder
  ein README schreiben.
- **GitHub antwortet auf `topics`- und Pages-Routen sporadisch mit 503** (17.08.2026 eine echte
  „major partial outage"). Wiederholung mit Backoff; rote `pages build and deployment`-Läufe erst
  als eigenen Fehler werten, wenn `githubstatus.com` sauber ist.
- **`gh api -X PUT .../topics` ersetzt die Topic-Liste** — erst GET, vereinigen, dann PUT.
- **Canvas-Fallen** (alle drei melden keinen Fehler, sie liefern still Falsches): CSS-Variablen
  wirken im Canvas nicht; Pixelzugriffe ignorieren Transformationen; die HiDPI-Rasterung muss beim
  **ersten** `getContext` gesetzt werden.
- **`scrollIntoView` zieht die ganze Seite mit** — ein Blatt scrollte sich beim Laden 86 px weg.
- **Ein leeres Ergebnis ist keine Entwarnung.** „Keine Treffer" ist nur dann eine Aussage, wenn die
  Prüfung nachweislich gelaufen ist. Zu jeder Messung gehört ein Kontrollfall mit bekannter Antwort.
- **Gleitkomma kann zwischen Engines minimal abweichen** — Konstanten aus `sin`/`cos` berechnete
  Prüfwerte dann hart kodieren, sonst schlägt derselbe Code in CI rot, lokal grün.
- **Literaturevektoren gegenprüfen, im Prüfenden noch einmal** — der Prüfer fing einmal einen Fehler
  im Code und einmal einen falsch zitierten RFC-Wert. Beides sah gleich aus: „Zahl stimmt nicht".

---

## 7. Was offen ist

### 7.1 In Arbeit

**Kein Blatt in Arbeit.** Der Ordner `blackscholes` in der Werkstatt ist angelegt, **leer**, ohne
Repo und ohne Datei.

Geplanter Zusatz, falls er weiterverfolgt werden soll:
- **Feld:** Markt & Risiko (enthält bisher nur `tilgung` — wäre eine sinnvolle Ergänzung statt einer
  Einzelkarte)
- **Thema:** Optionsbewertung (Black-Scholes, Greeks, Put-Call-Parität)
- **Beweisidee:** Die Put-Call-Parität gilt für *jede* Parameterkombination → das Gitter aus S, K, T,
  r, σ vollständig durchzählen statt gestichprobt; dazu ein zweiter Weg (Binomialbaum nach
  Cox-Ross-Rubinstein gegen die geschlossene Form, Konvergenzordnung messen) und zwei Gegenproben.
  Die Normalverteilung aus dem **Integraldefinition** über eine Gauss-Legendre-Regel, deren Knoten
  und Gewichte zur Laufzeit per Newton auf den Legendre-Polynomen erzeugt werden — keine Tabelle,
  keine auswendig gelernten Koeffizienten, und die Regel prüft selbst nach (Σwᵢ = 2).
- **Belege gesichert:** Normalverteilungstabelle aus drei unabhängigen Quellen deckungsgleich
  (N(0,00) = 0,5000, N(0,50) = 0,6915, N(1,00) = 0,8413, N(1,50) = 0,9332, N(2,00) = 0,9772);
  ein Standardbeispiel (S = 42, K = 40, r = 10 %, σ = 20 %, T = 0,5 → d₁ = 0,7693, d₂ = 0,6278) und
  eine Standardaufgabe (S = 52, K = 50, τ = 0,25, σ = 0,3, r = 0,12 → Call 5,057); das Binomialverfahren
  konvergiert gegen die geschlossene Form mit Ordnung O(1/n) für europäische Optionen

**Ein Hinweis, der beim Planen auffiel und die Gegenprobe gerettet hat:** Ein Vertauschen von d₁
und d₂ **bricht die Put-Call-Parität nicht** — denn N(d₂) + N(−d₂) = 1 hält die Identität trotzdem.
Eine Gegenprobe „d₁/d₂ vertauscht" hätte also nichts ertappt und wäre als Beleg wertlos gewesen. Die
Gegenproben müssen anders gebaut sein, etwa als Vorzeichenfehler im Zinssatz einer Beinseite.

### 7.2 Strukturell offen

- **Feld mit nur einer Karte:** 13 Felder haben genau ein Blatt (Kraft & Tragen, Schrift & Satz,
  Leben & Wachstum, Markt & Risiko, Licht & Optik, Falten & Papier, Verkehr & Fluss,
  Rätsel & Deduktion, Ordnen & Vergleichen, Schwelle & Übergang, Geschick & Reflex,
  Nachbarschaft & Raum, Strömung & Wirbel). Das widerspricht der eigenen Regel „keine Einzelkarten".
  Entweder ist die Regel zu streng (ein Feld darf als Etikett für ein Einzelthema stehen) oder diesen
  Feldern fehlt jeweils das zweite Blatt. **Diese Frage ist bewusst offen gelassen** — sie verlangt
  eine Wertung darüber, was die Sammlung sein soll, und die gehört der Person, die sie besitzt.
- **Feld *Farbe & Wahrnehmung*** existiert in der CSS-Variablenliste (`--g8`), ist aber kein Feld
  mit Karten. Der Name ist verwaist.
- **Ein unbenutzter Farbindex:** vergeben sind `--g1` bis `--g23`, das sind 23 Slots für 23 Felder.
  Der Listenname *Farbe & Wahrnehmung* belegt `--g8`, ohne dass ein Feld dort liegt.

### 7.3 Werkzeugtechnisch offen

- **`--g24` ist im `:root` nicht definiert.** Das Feld *Angriff & Abwehr* (4 Karten) verweist darauf.
  Weil `--akzent: var(--g24)` dann garantiert ungültig ist, greift überall der Notwert `--g1` — die
  vier Karten zeigen also blau statt ihrer Feldfarbe: der 8-px-Punkt in der Feldzeile und die Linke
  neben der Beweiszeile. **Warum es durchgerutscht ist:** `pruefblick.mjs` prüft Blatt-Ordner,
  nicht die Sammelseite selbst, und der Prüflauf des Hubs prüft Karten, Adressen und Sortierung,
  nicht die Farbdefinitionen des eigenen Stylesheets. **Behebung:** eine Zeile im `:root` und eine
  im Dunkel-Block. Der Punkt steht hier, weil er die Regel illustriert: die Sammelseite braucht
  denselben Nachmesser, den die Blätter bekommen haben.
- **`pflege.mjs` und `pruefblick.mjs` sind manuell gestartet**, nicht Teil der CI. Ein Blatt, das nach
  dem Bau nicht durch `pruefblick` läuft, kann Designfehler tragen, die lokal nie auffielen.
  Automatisierung wäre der logische nächste Schritt, bisher nicht umgesetzt.
- **Design-Korrekturen an neuen Blättern entstehen manuell** (Ansichtsschalter, Vorspannbreite).
  Der Vorspann ist inzwischen im Blatt selbst richtiggestellt; der Schalter wurde in einem Commit
  nachgezogen. Ein Weg, beide Punkte strukturell zu schließen, fehlt.
- **`plotterblaetter`** trägt vier Blätter in einem Repo und damit einen Sonderfall in der
  CI-Logik (Unterblätter ohne Nabe-Verweis).

### 7.4 Nicht offen, sondern bewusst so

- Keine Themenvorgabe durch Dritte. Der Befehl „freiehand" bedeutet: Thema selbst wählen, ohne
  Rückfrage, etwas Fertiges liefern.
- Außenwirksame Schritte (Push in öffentliche Repos, `gh repo create`, Pages-Aktivierung) werden
  vorher bestätigt. Freie Themenwahl heißt **nicht** freie Veröffentlichung.

---

## 8. Die Arbeitsregeln

Kurzfassung; die vollständige Fassung steht in `prompts/ssi-arbeitsprompt.md` und gilt nicht nur in
der Werkstatt. **Im Zweifel gilt das Original.**

1. **Erst messen, dann behaupten.** Keine Ursache, bevor sie gemessen ist. Reihenfolge: exakten
   Fehlertext holen → Zustand messen → dann Ursache benennen. Wenn das eigene Werkzeug verdächtig
   wirkt, **zuerst den Lauf wiederholen**, bevor am System etwas repariert wird.
2. **Leeres Ergebnis ist kein Ergebnis.** „Nichts gefunden", „unauffällig", „0 Befunde" sind
   wertlos, solange nicht belegt ist, dass die Prüfung gelaufen ist und auf vollständigen Daten
   gearbeitet hat. Zu jeder Messung gehört ein **Kontrollfall mit bekannter Antwort**. Wenn der
   Kontrollfall nicht anschlägt, misst die Prüfung nichts — und ist der Negativbefund wertlos.
3. **Grün muss etwas bedeuten.** Ein bestandener Test, der nie fehlschlagen kann, ist Dekoration.
   Jede Prüfstrecke braucht die Gegenprobe: einen Fall, der garantiert rot wird. Gegen echte Daten
   messen, nicht gegen selbst erfundene. **Teilmengen und Limits nie als Vollständigkeit ausgeben** —
   wer nur die ersten 100 Datensätze gesehen hat, schreibt das hin. Ein verdächtig sauberer Durchlauf
   ist ein Grund zum Nachsehen, nicht zur Freude.
4. **Schreibende Aktionen zuerst trocken.** Jedes Skript, das etwas verändert, zuerst als Dry-Run
   (`-WhatIf`, Diff, Vorschau des Payloads). Erst nach Sichtung scharf. Bei destruktiven Schritten
   vorher ansagen, was genau passiert und was der Rückweg ist.
5. **Rückbau ist ein eigener Schritt.** Testobjekte, die scharf gestellt wurden, brauchen einen
   quittierten Rückbau **mit Live-Nachlesen**. Eine Fußnote „bitte später zurückbauen" reicht nicht —
   so etwas bleibt wochenlang unbemerkt aktiv.
6. **Nichts erfinden.** Nur verwenden, was tatsächlich in der Quelle steht. Keine plausibel
   klingenden Zusatzdetails, keine erfundenen Dateinamen, Feldnamen oder Ausgaben. Was unbekannt
   ist, wird als unbekannt hingeschrieben.
7. **Zwei Quellen bei unzuverlässigen Schnittstellen.** Manche Schnittstellen liefern zeitweise
   veraltete Werte ohne Fehlermeldung. Vor dem Reparieren erst wiederholen, für
   sicherheitsrelevante Aussagen eine zweite unabhängige Quelle heranziehen.
8. **Kein Kunde im System eines anderen Kunden.** Namen, Ticketnummern, Details tauchen nie in
   Artefakten auf, die einer anderen Organisation gehören — in Skripten, Kommentaren, Richtlinien,
   Dokumentation. **Für die Werkstatt heißt das: keine Namen, keine internen Daten, keine
   Firmenbezüge in irgendeinem öffentlichen Blatt.** Es ist keine Formvorschrift, sondern die
   Bedingung dafür, dass überhaupt etwas veröffentlicht werden darf.
9. **Bei Live-Diagnose nicht planen.** Wenn jemand gerade an einer Konsole sitzt und ein Problem hat:
   sofort copy-paste-fertige Befehle liefern. Keine Planungsphase, keine Optionenübersicht.
10. **Zwei Quellen für unzuverlässige Schnittstellen, ein zweiter Weg für Rechnungen** — siehe 1 und 7.

---

## 9. Wie ein neues Blatt gebaut wird (Ablauf, erprobt, in dieser Reihenfolge)

Werkzeuge vorhanden und geprüft: Node v24.19.0, `gh` 2.98.0, Python 3.13.15, Playwright 1.47.2 im
Wurzelordner der Werkstatt (wird aus jedem Blatt-Ordner nach oben aufgelöst).

1. **Bauen** — `<name>/index.html`, self-contained, Prüfknopf `#b-pruefen` eingebaut.
2. **Lokal verifizieren** — im Blattordner den Prüfknopf drücken und den Screenshot **ansehen**,
   nicht nur den Rückgabewert lesen:
   ```
   node ..\zeilen.mjs index.html 30000        # drückt #b-pruefen, liest Tabelle + Fuß
   node ..\bild.mjs   index.html "<out>.png" "" voll
   ```
   (Argument 4 ist ein Selektor **oder leer**, Argument 5 ist „voll" — „voll" nicht an Position 4)
3. **README** schreiben, inkl. „Was mich das gekostet hat".
4. **CI-Dateien** aus einem bestehenden Blatt kopieren: `.github/pruefen.mjs` und
   `.github/workflows/pruefen.yml` (unverändert übernehmen; der Prüfer ist in allen Blättern
   identisch, Referenz ist der älteste davon).
5. **Lokal `node .github/pruefen.mjs`** laufen lassen — muss grün sein. Falls Playwright fehlt:
   einmalig im Wurzelordner `npm install --no-save playwright@1.47.2` + `npx playwright install
   chromium`; `node_modules` danach wieder löschbar.
6. **Nachmessen** — aus dem Hub-Ordner: `node werkzeug\pruefblick.mjs <name>`. Geprüft werden
   Querlauf, Vorspann-Ausrichtung, Kontrast hell und dunkel, Knopf- und Reglerhöhen, Farbvariablen,
   Ansichtsschalter samt mitziehenden Bildern.
7. `git init -b main` → `git add -A` → Commit.
8. **Ab hier außenwirksam — vorher bestätigen lassen:**
   ```
   gh repo create ssims437/<name> --public --source . --remote origin --push
   gh api -X POST repos/ssims437/<name>/pages -f "source[branch]=main" -f "source[path]=/"
   ```
9. **Topics setzen** — Standard: `single-file-html`, `no-build`, `self-verifying`, `visualization`
   plus fachliche. Achtung: `PUT` ersetzt die Liste — immer erst GET, vereinigen, dann PUT.
10. **Karte in der Sammelseite ergänzen** (`index.html`) und den Namen in die `ERWARTET`-Liste in
    deren `.github/pruefen.mjs` eintragen. Bei einem **neuen Feld** zusätzlich eine Farbvariable
    `--gN` im `:root` **und** im Dunkel-Block definieren — sonst bekommt das Feld den Notwert
    (siehe 7.3).
11. **Live prüfen** (Pages-Adresse aufrufen, Prüflauf drücken).

Das sind **zwei Repos**, nicht sechzehn: das neue Blatt und die Sammelseite.

**Datenmodell der Sammelseite** (beim Eintragen beachten):
- `FELDER` ist ein Array von Feldern, jedes mit `name`, `farbe` (`--gN`), `text`, `blaetter`
- Eine Karte: `{ id, titel, was, beweis, knopf, signet }`
- `beweis` ist die **gemessene** Prüflauf-Zahl, keine geschätzte
- `knopf: true` heißt: das Blatt hat einen `#b-pruefen`-Knopf; die Sammelseiten-CI prüft das nach
- `signet` ist ein gezeichnetes Zeichen (im `SIGNETE`-Objekt inline definiert, Canvas-Zeichnung)
- **Felder und Blätter werden beim Aufbau alphabetisch sortiert** (`Intl.Collator("de-AT")`), nicht
  in der Liste selbst — ein neuer Eintrag darf also unten angehängt werden und sitzt trotzdem richtig
- Ein Feld kann `offen: true` tragen (reservierter Platz ohne Karten); derzeit gibt es keins mehr
- Der Zähler der Sammelseite rechnet selbst: `ALLE.length` Blätter, `FELDER.length - offen` Felder

---

## 10. Auf einen Blick

| | |
|---|---|
| **Was** | Selbstverifizierende Einzelblätter — Webseiten, die ihre Behauptung nachrechnen |
| **Warum** | Weil überall Zahlen behauptet und nichts nachgerechnet wird, und weil das teuer ist |
| **Ziel** | Eine Sammlung, in der jede Behauptung einen Weg und einen messbaren Grenzpunkt hat |
| **Stand** | 42 Blätter, 23 Felder, alle Repos sauber, alles veröffentlicht, CI grün |
| **Stärke** | Erschöpfende Prüfungen, zweite Rechnung, Gegenproben, Fehlerkatalog in den READMEs |
| **Offen** | `blackscholes` (leer), 13 Felder mit Einzelkarte, `--g24` undefiniert, Pflegewerkzeuge nicht in CI |
| **Nicht** | Tutorial, Benchmark, Produkt, Firma, Auftritt — und kein Kundenbezug, nirgends |
| **Nächster Schritt** | Entweder `blackscholes` zu Ende bauen (Markt & Risiko, Plan in 7.1) — oder die |
| | Frage aus 7.2 beantworten, was ein Feld mit einer Karte sein soll |
| **Nicht tun** | `git config --global user.*` in der Werkstatt; Namens- oder Firmenbezüge in öffentliche |
| | Blätter; Zahlen in Titeln oder Fußzeilen; KI- oder Mitautorenhinweise in Commits |

---

## 11. Zwei Sätze, die mehr sagen als der Rest

**Ein Ergebnis ohne Weg ist eine Behauptung, und eine Behauptung ist der Fehler, bevor er passiert.**

**Eine Prüfung, die nicht scheitern kann, ist Dekoration — sie kostet Rechenzeit und wiegt einen
Zweig.**
