/* Pflege aller Blätter auf einmal.
 *
 * Die Blätter sind absichtlich einzelne Dateien ohne Build — der Preis dafür
 * ist, dass eine Änderung an der gemeinsamen Handschrift siebenundzwanzigmal
 * gemacht werden muss. Dieses Werkzeug macht sie einmal.
 *
 *   node werkzeug/pflege.mjs           zeigt nur, was es täte
 *   node werkzeug/pflege.mjs --schreiben   schreibt es
 *
 * Jeder Eingriff ist an einem Merkzeichen erkennbar und wird beim zweiten Lauf
 * nicht wiederholt. Wer eine Regel ändern will, ändert sie hier und lässt neu
 * laufen.
 */

import fs from "fs";
import path from "path";

const wurzel = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1"), "..", "..");
const schreiben = process.argv.includes("--schreiben");

/* Die Vorspann-Klasse heißt nicht überall gleich — die drei ältesten Blätter
   sind vor der gemeinsamen Handschrift entstanden. */
const VORSPANN = ["vorspann", "lead", "anriss", "standfirst"];
/* Ebenso der Seitenkasten. */
const KASTEN = ["blatt", "bogen", "wrap"];

/* Blätter, die Pixel selbst lesen oder setzen, bleiben unberührt: putImageData
   und getImageData rechnen in Geräte-Pixeln und ignorieren die Transformation.
   Eine gröbere oder feinere Rasterung verschiebt dort das Bild — oder, schlimmer,
   den Beweis: ornament und augenmass weisen ihre Symmetrie bzw. ihren Kontrast
   am fertigen Bild nach, und die Prüfung schlägt sofort fehl. Genau so ist es
   aufgefallen. */
const KEINE_SCHAERFE = /putImageData|getImageData|resetTransform|setTransform\s*\(\s*1\s*,/;

const MERK_BREIT = "/* PFLEGE: breite-schirme */";
const MERK_SCHAERFE = "/* PFLEGE: schaerfe */";
const MERK_SCHMAL = "/* PFLEGE: schmalschirm */";
const MERK_KLICK = "/* PFLEGE: klickflaechen */";
const MERK_FOKUS = "/* PFLEGE: fokus */";

/* Die Farbnamen der drei ältesten Blätter. */
const LEISE = ["--leise", "--muted"];
const GRUND = ["--grund", "--papier", "--paper", "--bg"];
const FELD = ["--feld", "--card", "--panel"];

/* ------------------------------------------------------------------ Hilfen */

/* Findet den Regelblock zu einem Selektor und liefert Anfang und Ende der
   geschweiften Klammern. Reicht für handgeschriebenes CSS ohne Verschachtelung. */
function regelBlock(text, selektor) {
  const anfang = text.indexOf(`.${selektor} {`);
  if (anfang < 0) return null;
  const auf = text.indexOf("{", anfang);
  const zu = text.indexOf("}", auf);
  if (zu < 0) return null;
  return { anfang, auf, zu, inhalt: text.slice(auf + 1, zu) };
}

/* Der Vorspann stand eine Zeit lang zentriert. Das liest sich bei einer Zeile
   gut und bei sechs schlecht: das linke Ende springt, das Auge sucht bei jeder
   Zeile neu den Anfang. Seit 25.08.2026 steht er linksbündig — bündig mit der
   Überschrift und mit allem darunter. */
function vorspannLinks(text) {
  for (const name of VORSPANN) {
    const b = regelBlock(text, name);
    if (!b) continue;
    let neu = b.inhalt;
    neu = neu.replace(/\s*text-align:\s*center\s*;?/g, "");
    neu = neu.replace(/margin:\s*0\s+auto\s*;/g, "margin:0;");
    neu = neu.replace(/margin:\s*0\s+auto\b/g, "margin:0");
    if (neu === b.inhalt) return { text, geaendert: false, name };
    return { text: text.slice(0, b.auf + 1) + neu + text.slice(b.zu), geaendert: true, name };
  }
  return { text, geaendert: false, name: null };
}

function kastenFinden(text) {
  for (const name of KASTEN) {
    const b = regelBlock(text, name);
    if (b && /max-width:\s*\d+px/.test(b.inhalt)) {
      return { name, breite: +b.inhalt.match(/max-width:\s*(\d+)px/)[1] };
    }
  }
  return null;
}

/* Auf breiten Schirmen soll das Blatt mitwachsen statt Rand zu zeigen. Die
   Staffelung ist bewusst grob: drei Stufen, keine stufenlose Skalierung, damit
   Spaltenbreiten und Zeilenlängen berechenbar bleiben. */
function breiteSchirme(text, kasten) {
  if (text.includes(MERK_BREIT)) return { text, geaendert: false };
  const stufen = [[1500, 1360], [1800, 1560], [2200, 1800]]
    .filter(([, b]) => b > kasten.breite);
  if (!stufen.length) return { text, geaendert: false };
  const block = `\n  ${MERK_BREIT}\n` + stufen
    .map(([ab, breite]) => `  @media (min-width: ${ab}px) { .${kasten.name} { max-width: ${breite}px; } }`)
    .join("\n") + "\n";
  const ende = text.lastIndexOf("</style>");
  return { text: text.slice(0, ende) + block + text.slice(ende), geaendert: true, stufen: stufen.length };
}

/* Feine Schirme rastern das Bild in Geräte-Pixeln. Ein Canvas mit 820 Punkten
   Breite wird dort weichgezeichnet hochskaliert. Der Einschub legt die
   Rasterung größer an und rechnet die Zeichenfläche zurück — der Zeichencode
   sieht weiter seine gewohnten Maße.

   Gehängt wird er an getContext, nicht an eine Liste vorhandener Bilder: So
   erwischt er auch Bilder, die erst im Betrieb entstehen. Er greift beim
   allerersten getContext eines Bildes — ausnahmslos, auch bei Bildern, die noch
   nicht im Dokument hängen. Das ist kein Übereifer, sondern Notwehr: Das
   Neuanlegen der Rasterung löscht den Inhalt, und ein Bild, das erst gezeichnet
   und später nochmal angefasst wird, wäre dann plötzlich leer. Wer früh greift,
   löscht nur Leeres. */
const SCHAERFE_EINSCHUB = `<script>
${MERK_SCHAERFE}
(function () {
  "use strict";
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  if (dpr <= 1.01) return;
  const wb = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, "width");
  const hb = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, "height");
  const roh = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (art, ...rest) {
    const g = roh.call(this, art, ...rest);
    if (art !== "2d" || this.__scharf) return g;
    this.__scharf = true;
    let lw = wb.get.call(this), lh = hb.get.call(this);
    const anlegen = () => {
      wb.set.call(this, Math.round(lw * dpr));
      hb.set.call(this, Math.round(lh * dpr));
      roh.call(this, "2d").setTransform(dpr, 0, 0, dpr, 0, 0);   // Größe setzen löscht den Zustand
    };
    Object.defineProperty(this, "width",  { get: () => lw, set: (v) => { lw = v; anlegen(); }, configurable: true });
    Object.defineProperty(this, "height", { get: () => lh, set: (v) => { lh = v; anlegen(); }, configurable: true });
    anlegen();
    return g;
  };
})();
<\/script>
`;

/* Schneidet einen vorhandenen Einschub heraus — damit eine geänderte Fassung
   den alten Stand ersetzt statt sich daneben zu setzen. */
function schaerfeHeraus(text) {
  const anfang = "<script>\n" + MERK_SCHAERFE;
  const schluss = "<\/script>\n";
  const i = text.indexOf(anfang);
  if (i < 0) return text;
  const ende = text.indexOf(schluss, i);
  if (ende < 0) return text;
  return text.slice(0, i) + text.slice(ende + schluss.length);
}

function schaerfeEinsetzen(text) {
  const drin = text.includes(MERK_SCHAERFE);
  if (KEINE_SCHAERFE.test(text)) {
    // auch wieder ausbauen können: ein Blatt kann nachträglich Pixel lesen lernen
    if (drin) return { text: schaerfeHeraus(text), geaendert: true,
      grund: "Schärfe wieder ausgebaut — liest Pixel selbst" };
    return { text, geaendert: false, grund: "liest oder setzt Pixel selbst" };
  }
  if (drin) {
    const ohne = schaerfeHeraus(text);
    const neu = ohne.slice(0, ohne.lastIndexOf("<script")) + SCHAERFE_EINSCHUB +
      ohne.slice(ohne.lastIndexOf("<script"));
    if (neu === text) return { text, geaendert: false, grund: "schon da" };
    return { text: neu, geaendert: true, grund: "Schärfe erneuert" };
  }
  const letztes = text.lastIndexOf("<script");
  if (letztes < 0) return { text, geaendert: false, grund: "kein Skript" };
  return { text: text.slice(0, letztes) + SCHAERFE_EINSCHUB + text.slice(letztes), geaendert: true };
}

/* Auf schmalen Schirmen darf die Seite nicht seitwärts laufen. Breite Inhalte
   — in dieser Sammlung sind es ausnahmslos Tabellen und lange Auswahlfelder —
   scrollen deshalb in ihrem eigenen Kasten. Gemessen am 25.08.2026: vier
   Blätter schoben die ganze Seite über den Rand (frequenzgang +117 px,
   auszaehlung +94, verzerrung +67, zeitsprung +15). */
function schmalschirm(text) {
  if (text.includes(MERK_SCHMAL)) return { text, geaendert: false };
  const block = `\n  ${MERK_SCHMAL}\n` +
    "  @media (max-width: 700px) {\n" +
    "    table { display: block; max-width: 100%; overflow-x: auto; }\n" +
    "    select, input[type=text], input[type=number], input[type=search] { max-width: 100%; }\n" +
    "  }\n";
  const ende = text.lastIndexOf("</style>");
  if (ende < 0) return { text, geaendert: false };
  return { text: text.slice(0, ende) + block + text.slice(ende), geaendert: true };
}

/* Knöpfe waren 28 px hoch, Regler 16 px — am Schreibtisch bequem, am Daumen
   nicht. 34 px kosten optisch fast nichts und treffen sich deutlich besser. */
function klickflaechen(text) {
  if (text.includes(MERK_KLICK)) return { text, geaendert: false };
  const block = `\n  ${MERK_KLICK}\n` +
    "  button, select { min-height: 34px; }\n" +
    "  input[type=range] { height: 26px; }\n";
  const ende = text.lastIndexOf("</style>");
  if (ende < 0) return { text, geaendert: false };
  return { text: text.slice(0, ende) + block + text.slice(ende), geaendert: true };
}

/* Wer mit der Tastatur bedient, muss sehen, wo er ist. */
function fokusRegel(text) {
  if (/:focus-visible/.test(text)) return { text, geaendert: false };
  const block = `\n  ${MERK_FOKUS}\n` +
    "  :focus-visible { outline: 2px solid var(--merk, currentColor); outline-offset: 2px; }\n";
  const ende = text.lastIndexOf("</style>");
  if (ende < 0) return { text, geaendert: false };
  return { text: text.slice(0, ende) + block + text.slice(ende), geaendert: true };
}

/* ---- Kontrast der leisen Schrift -------------------------------------------
   Die leise Schrift trägt Vorspann, Hinweise und Beschriftungen — also den
   halben Text. Gemessen lag sie in den vier ältesten Blättern unter 4,5:1
   (redundanz 4,25 · reparatur 4,26 · plotterblaetter 4,30 · wuerfel 4,47),
   während die neueren bei 4,9 bis 5,3 liegen. Hier wird nicht geschätzt,
   sondern gerechnet: die Farbe wird schrittweise abgedunkelt, bis sie gegen
   den dunkleren der beiden Gründe 5,0:1 erreicht. */
function hexNachRgb(h) {
  const m = h.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const t = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
  return [0, 2, 4].map((i) => parseInt(t.slice(i, i + 2), 16));
}
const rgbNachHex = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0").toUpperCase()).join("");
const kanal = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const leuchtdichte = (c) => 0.2126 * kanal(c[0]) + 0.7152 * kanal(c[1]) + 0.0722 * kanal(c[2]);
function kontrast(a, b) {
  const la = leuchtdichte(a), lb = leuchtdichte(b);
  const hoch = Math.max(la, lb), tief = Math.min(la, lb);
  return (hoch + 0.05) / (tief + 0.05);
}

/* Der erste :root-Block ist der helle; die dunklen stehen in Medienabfragen
   oder unter [data-theme]. Nur der helle wird angefasst. */
function hellerBlock(text) {
  const anfang = text.indexOf(":root {");
  if (anfang < 0) return null;
  const auf = text.indexOf("{", anfang);
  const zu = text.indexOf("}", auf);
  if (zu < 0) return null;
  return { auf, zu, inhalt: text.slice(auf + 1, zu) };
}

function wert(inhalt, namen) {
  for (const n of namen) {
    const m = inhalt.match(new RegExp(n + "\\s*:\\s*(#[0-9a-fA-F]{3,6})"));
    if (m) return { name: n, hex: m[1] };
  }
  return null;
}

function kontrastHeben(text, ziel = 5.0) {
  const b = hellerBlock(text);
  if (!b) return { text, geaendert: false, grund: "kein :root gefunden" };
  const leise = wert(b.inhalt, LEISE);
  const grund = wert(b.inhalt, GRUND);
  const feld = wert(b.inhalt, FELD);
  if (!leise || !grund) return { text, geaendert: false, grund: "Farben nicht gefunden" };
  const gruende = [hexNachRgb(grund.hex), feld ? hexNachRgb(feld.hex) : null].filter(Boolean);
  const vorne = hexNachRgb(leise.hex);
  if (!vorne || !gruende.length) return { text, geaendert: false, grund: "Farbe unlesbar" };
  const schlechtester = () => Math.min(...gruende.map((g) => kontrast(vorne, g)));
  const vorher = schlechtester();
  if (vorher >= ziel) return { text, geaendert: false, grund: `schon ${vorher.toFixed(2)}:1` };
  let farbe = vorne.slice();
  for (let i = 0; i < 60 && Math.min(...gruende.map((g) => kontrast(farbe, g))) < ziel; i++) {
    farbe = farbe.map((v) => v * 0.96);
  }
  const nachher = Math.min(...gruende.map((g) => kontrast(farbe, g)));
  const neu = b.inhalt.replace(new RegExp("(" + leise.name + "\\s*:\\s*)" + leise.hex, "i"), "$1" + rgbNachHex(farbe));
  if (neu === b.inhalt) return { text, geaendert: false, grund: "Ersetzung misslungen" };
  return { text: text.slice(0, b.auf + 1) + neu + text.slice(b.zu), geaendert: true,
    grund: `${leise.name} ${leise.hex} → ${rgbNachHex(farbe)} (${vorher.toFixed(2)} → ${nachher.toFixed(2)}:1)` };
}

/* ------------------------------------------------------------------- Lauf */

/* Auch die Unterblätter: plotterblaetter trägt vier Stück, und sie sind
   dieselbe Sammlung. Bis 25.08.2026 hat die Pflege sie übersehen. */
const blaetter = fs.readdirSync(wurzel, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith(".") && !e.name.startsWith("_"))
  .flatMap((e) => fs.readdirSync(path.join(wurzel, e.name))
    .filter((d) => d.endsWith(".html"))
    .map((d) => (d === "index.html" ? e.name : `${e.name}/${d}`)))
  .sort();

let berührt = 0;
const spalten = [];
for (const name of blaetter) {
  const datei = name.endsWith(".html") ? path.join(wurzel, name) : path.join(wurzel, name, "index.html");
  const roh = fs.readFileSync(datei, "utf8");
  let text = roh;
  const notizen = [];

  const v = vorspannLinks(text);
  text = v.text;
  if (v.geaendert) notizen.push(`Vorspann linksbündig (.${v.name})`);
  else if (!v.name) notizen.push("kein Vorspann gefunden");

  const kasten = kastenFinden(text);
  if (kasten) {
    const b = breiteSchirme(text, kasten);
    text = b.text;
    if (b.geaendert) notizen.push(`${b.stufen} Breitstufen (.${kasten.name}, ab ${kasten.breite}px)`);
  } else notizen.push("kein Seitenkasten gefunden");

  const s = schaerfeEinsetzen(text);
  text = s.text;
  if (s.geaendert) notizen.push(s.grund || "Schärfe eingesetzt");
  else if (s.grund && s.grund !== "schon da") notizen.push(`Schärfe übersprungen: ${s.grund}`);

  const sm = schmalschirm(text);
  text = sm.text;
  if (sm.geaendert) notizen.push("Schmalschirm: breite Inhalte scrollen im Kasten");

  const kf = klickflaechen(text);
  text = kf.text;
  if (kf.geaendert) notizen.push("Klickflächen 34 px");

  const fo = fokusRegel(text);
  text = fo.text;
  if (fo.geaendert) notizen.push("Fokusrahmen ergänzt");

  const ko = kontrastHeben(text);
  text = ko.text;
  if (ko.geaendert) notizen.push(`Kontrast: ${ko.grund}`);

  if (text !== roh) {
    berührt++;
    if (schreiben) fs.writeFileSync(datei, text);
  }
  spalten.push([name, notizen.length ? notizen.join(" · ") : "nichts zu tun"]);
}

const breite = Math.max(...spalten.map(([n]) => n.length));
for (const [n, t] of spalten) console.log(n.padEnd(breite + 2) + t);
console.log(`\n${berührt} von ${blaetter.length} Blättern ${schreiben ? "geändert" : "wären zu ändern"}` +
  (schreiben ? "." : " — mit --schreiben ausführen."));
