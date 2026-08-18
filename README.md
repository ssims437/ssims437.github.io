# ssims437.github.io

Die Sammelseite über alle eigenständigen Blätter — je eine einzelne HTML-Datei ohne Build und
ohne Bibliothek, jede mit eingebautem Prüflauf.

→ **[Seite öffnen](https://ssims437.github.io/)**

Sie ist selbst nach denselben Regeln gebaut wie alles, was sie verlinkt: eine Datei, kein
Paketmanager, keine externe Zeile Code, hell und dunkel, und ein Prüflauf, der etwas
Nachprüfbares tut statt etwas zu behaupten.

## Was der Prüflauf hier prüft

Alle Blätter liegen auf derselben Herkunft wie diese Seite (`ssims437.github.io`), deshalb darf sie
sie holen und nachlesen. Geprüft wird nur, was ohne Ausführen fremden Codes entscheidbar ist —
für jedes Blatt:

| Prüfung | Warum |
|---|---|
| Adresse antwortet mit 200 | eine Sammelseite mit toten Verweisen ist schlimmer als keine |
| Titel beginnt wie erwartet | fängt Umbenennungen und vertauschte Verweise |
| Rückverweis auf diese Seite vorhanden | die Nabe muss von jedem Blatt aus erreichbar bleiben |
| eigener Prüfknopf noch an Bord | bei den zehn Blättern, die einen haben; fünf prüfen anders |

Was die Prüfläufe der Blätter *rechnen*, kann diese Seite nicht nachvollziehen — dafür muss man
das Blatt öffnen und drücken. Genau das steht auch so in der Ausgabe.

## Warum eine Nabe und kein Netz

Vorher verwies jedes Blatt auf alle anderen. Das ist bei 15 Stücken ein Netz aus **210** Links,
und jedes neue Blatt bedeutete **16** angefasste Repos — plus einen Commit ohne Inhalt in jedem
davon. Dabei sind über die Zeit drei verschiedene Schreibweisen des Verweisblocks entstanden
(`<span>` mit und ohne `style`, `<footer>` statt `<span>`), was das automatische Nachziehen jedes
Mal zu einer Suche nach Sonderfällen gemacht hat.

| | Links gesamt | Repos für ein neues Blatt |
|---|---|---|
| Vollnetz (vorher) | 15 × 14 = 210 | 16 |
| Nabe (jetzt) | 15 + 15 = 30 | 2 |

Dazu kommt ein Grund, der nichts mit Wartung zu tun hat: `https://ssims437.github.io/` war vorher
**404** — genau die Adresse, die jemand eintippt, der von `/verzerrung/` kommt und kürzt.

Was dabei verloren geht, ehrlich: ein einzeln weitergegebenes Blatt trug vorher die ganze Karte in
sich, jetzt nur noch die Adresse dorthin. Für „läuft ohne alles" reicht das; für „zeigt die
Sammlung im Blatt selbst" nicht.

## Was mich das gekostet hat

**Die Gruppierung war die eigentliche Arbeit.** Eine alphabetische Liste von damals fünfzehn Namen war
ein Menü, kein Überblick. Die Blätter in Felder zu schneiden (Rechnen & Zahlen, Sprache & Maschine, Daten &
Speicher, Signale & Zufall, Wege & Entscheidungen, Welt messen) hat länger gedauert als die Seite
zu bauen — und zwei Stücke sitzen bis heute nicht sauber: **Würfel** ist ein Prüfstand für
Zufallsgeneratoren und stünde genauso gut bei „Rechnen", und **Wegewahl** ist so viel
Algorithmen-Handwerk wie Entscheidungslehre.

**Die Beweiszeile je Karte musste gemessen werden, nicht geschätzt.** Auf jeder Karte steht, was
der Prüflauf des Blattes tatsächlich nachrechnet. Für vier Blätter hatte ich die Zahl nicht zur
Hand — also lokal geöffnet, Prüflauf gedrückt, Zahl abgelesen. Bei **Rechenwerk** kam dabei
heraus, dass der Prüflauf asynchron in Häppchen läuft: direkt nach dem Klick stand noch „noch
nicht geprüft" da, die Zahl (**525 056 Fälle**) erst 1,3 Sekunden später. Wer solche Zahlen aus
dem Kopf oder aus dem README abschreibt, schreibt irgendwann eine, die nicht mehr stimmt.

**Fünf Blätter haben keinen Prüfknopf — und das musste in die Tabelle.** Der erste Entwurf des
Prüflaufs verlangte von jedem Blatt einen `#b-pruefen`-Knopf. Damit wären fünf Zeilen rot
geworden, obwohl nichts kaputt ist: **Gradtage** ist ein Datenbericht, **Würfel** ist selbst der
Prüfstand, **Redundanz** prüft bei jedem Durchgang den Rückweg, **Reparatur** lebt vom
Herumklicken, **Plotterblätter** hat kein Verfahren, das man gegen etwas stellen könnte. Jetzt
steht dort „keiner vorgesehen" statt „fehlt" — eine Prüfung, die Falsches meldet, wird schneller
ignoriert als eine, die schweigt.

**Root-relativ prüfen, absolut verlinken.** Die Verweise auf den Karten sind absolute Adressen
(`https://ssims437.github.io/handschlag/`), damit sie auch aus einer heruntergeladenen Kopie
funktionieren. Die Prüf-Abfragen dagegen laufen root-relativ (`/handschlag/`) — nur so prüft die
Seite lokal unter `python -m http.server` dieselben Dateien, die sie später auf GitHub Pages
prüft. Mit absoluten Adressen hätte der lokale Lauf die veröffentlichte Fassung geprüft und jede
noch nicht gepushte Änderung stillschweigend übersehen.

## Technik

Eine einzelne HTML-Datei. Kein Build, keine Bibliothek. Canvas 2D für die Signete
(gezeichnet, nicht als Bild eingebunden), `fetch` für den Prüflauf, hell und dunkel über
`prefers-color-scheme` und einen Schalter.

## Lizenz

MIT
