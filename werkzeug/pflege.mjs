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

/* ------------------------------------------------------------------- Lauf */

const blaetter = fs.readdirSync(wurzel, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith(".") && !e.name.startsWith("_"))
  .map((e) => e.name)
  .filter((n) => fs.existsSync(path.join(wurzel, n, "index.html")))
  .sort();

let berührt = 0;
const spalten = [];
for (const name of blaetter) {
  const datei = path.join(wurzel, name, "index.html");
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
