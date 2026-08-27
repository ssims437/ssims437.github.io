/* Prüfblick über alle Blätter — die Gegenprobe zur Pflege.
 *
 * `pflege.mjs` greift ein, dieses Werkzeug misst nach. Beides gehört zusammen:
 * Ein Eingriff, der nur behauptet wird, ist keiner. Geprüft wird im echten
 * Browser an denselben Dateien, die auch veröffentlicht werden.
 *
 *   node werkzeug/pruefblick.mjs           alle Blätter
 *   node werkzeug/pruefblick.mjs schwelle  nur eines
 *
 * Rückgabe 0 = alles in Ordnung, 1 = mindestens eine Beanstandung.
 *
 * Gemessen wird, was schon einmal stillschweigend gedriftet ist:
 *   1. Vorspann linksbündig und bündig mit der Überschrift
 *   2. keine Seite läuft auf schmalem Schirm seitwärts
 *   3. leise Schrift hält 4,5:1 — hell wie dunkel
 *   4. Klickflächen taugen für einen Daumen
 *   5. jede benutzte Farbvariable ist auch definiert
 *   6. der Ansichtsschalter wechselt wirklich die Ansicht, und die Bilder
 *      ziehen mit
 *   7. nichts schreibt beim Laden einen Fehler in die Konsole
 */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join, normalize, dirname } from "node:path";
import { chromium } from "playwright";

const WURZEL = join(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const nurDiese = process.argv.slice(2);

const TYPEN = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".mjs": "text/javascript",
  ".js": "text/javascript", ".png": "image/png", ".json": "application/json", ".csv": "text/csv",
  ".mid": "audio/midi", ".svg": "image/svg+xml" };

const server = createServer(async (anfrage, antwort) => {
  try {
    let pfad = decodeURIComponent((anfrage.url || "/").split("?")[0]);
    if (pfad.endsWith("/")) pfad += "index.html";
    const datei = join(WURZEL, normalize(pfad).replace(/^[\\/]+/, ""));
    if (!datei.startsWith(WURZEL)) { antwort.writeHead(403).end(); return; }
    antwort.writeHead(200, { "content-type": TYPEN[extname(datei)] || "application/octet-stream" });
    antwort.end(await readFile(datei));
  } catch { antwort.writeHead(404).end("nicht gefunden"); }
});
await new Promise((f) => server.listen(0, "127.0.0.1", f));
const adresse = `http://127.0.0.1:${server.address().port}`;

const seiten = [];
for (const e of readdirSync(WURZEL, { withFileTypes: true })) {
  if (!e.isDirectory() || e.name.startsWith(".") || e.name.startsWith("_")) continue;
  if (nurDiese.length && !nurDiese.includes(e.name)) continue;
  for (const d of readdirSync(join(WURZEL, e.name))) if (d.endsWith(".html")) seiten.push(`${e.name}/${d}`);
}
seiten.sort();

/* Nichts gemessen ist kein gutes Ergebnis. Ohne diese Sperre meldet ein Aufruf
   mit falschem Argument — etwa einem Pfad statt eines Ordnernamens — fröhlich
   "Alle 0 Seiten in Ordnung" und geht mit 0 hinaus. Das ist eine Entwarnung
   über eine Prüfung, die nie stattgefunden hat. */
if (!seiten.length) {
  console.log("ABBRUCH — keine einzige Seite gefunden, es wurde nichts gemessen.");
  if (nurDiese.length) {
    console.log("  Erwartet werden Ordnernamen, nicht Pfade: " + nurDiese.join(", "));
    console.log("  Richtig ist etwa:  node werkzeug/pruefblick.mjs schriftcode");
  }
  server.close();
  process.exit(1);
}

const beanstandungen = [];
const klage = (seite, text) => beanstandungen.push(`${seite}: ${text}`);

/* Farbvariablen rein statisch: benutzt, aber nirgends definiert. Ein var() mit
   Ersatzwert trägt seinen Ausweg selbst mit sich und zählt nicht. */
function farbnamen(seite) {
  const t = readFileSync(join(WURZEL, seite), "utf8");
  const definiert = new Set([...t.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
  for (const m of t.matchAll(/setProperty\(\s*["'](--[a-z0-9-]+)/gi)) definiert.add(m[1]);
  const benutzt = [...t.matchAll(/var\((--[a-z0-9-]+)\s*\)/gi)].map((m) => m[1]);
  return [...new Set(benutzt)].filter((n) => !definiert.has(n));
}

const MESSUNG = `(() => {
  const rgb = (c) => { const m = c.match(/[\\d.]+/g); return m ? m.slice(0,3).map(Number) : null; };
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
  const leucht = (c) => 0.2126*lin(c[0]) + 0.7152*lin(c[1]) + 0.0722*lin(c[2]);
  const kontrast = (a, b) => { const la = leucht(a), lb = leucht(b), h = Math.max(la,lb), t = Math.min(la,lb); return (h+0.05)/(t+0.05); };
  const hinter = (el) => { let p = el; while (p) { const f = getComputedStyle(p).backgroundColor;
      if (f && !/rgba\\(0, 0, 0, 0\\)/.test(f)) return rgb(f); p = p.parentElement; }
    return rgb(getComputedStyle(document.body).backgroundColor); };
  const probe = (sel) => { const el = document.querySelector(sel); if (!el) return null;
    return { wert: +kontrast(rgb(getComputedStyle(el).color), hinter(el)).toFixed(2), sel }; };

  const vorspann = document.querySelector(".vorspann, .lead, .anriss, .standfirst");
  const h1 = document.querySelector("h1");
  /* Der Vorspann soll so weit reichen wie der Rest der Seite. Gemessen wird
     gegen die Überschrift daneben: die ist ein Blockelement im selben Kasten
     und damit genau so breit wie der Inhaltsbereich — anders als der Kasten
     selbst, dessen Rahmenmass die Polsterung mitzählt. */
  const kasten = h1 ? h1.getBoundingClientRect() : null;
  const ausrichtung = vorspann && h1 ? {
    aus: getComputedStyle(vorspann).textAlign,
    versatz: Math.round(vorspann.getBoundingClientRect().left - h1.getBoundingClientRect().left),
    fehlbreite: Math.round(kasten.width - vorspann.getBoundingClientRect().width),
  } : null;

  const sichtbar = (e) => e.offsetParent !== null && e.getBoundingClientRect().height > 0;
  const knoepfe = [...document.querySelectorAll("button, select")].filter(sichtbar)
    .map((e) => Math.round(e.getBoundingClientRect().height));
  const regler = [...document.querySelectorAll("input[type=range]")].filter(sichtbar)
    .map((e) => Math.round(e.getBoundingClientRect().height));

  return {
    ueberlauf: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ausrichtung,
    kontraste: [probe(".vorspann, .lead, .anriss, .standfirst"), probe(".hinweis"), probe(".kl"), probe(".fuss")].filter(Boolean),
    knopf: knoepfe.length ? Math.min(...knoepfe) : null,
    regler: regler.length ? Math.min(...regler) : null,
    schalter: !!document.getElementById("b-thema"),
  };
})()`;

const bild = `[...document.querySelectorAll("canvas")].map((c) => { try { return c.toDataURL().slice(-90); } catch { return "?"; } })`;

const browser = await chromium.launch();
for (const seite of seiten) {
  process.stdout.write('  ' + seite.replace('/index.html', '').padEnd(32));
  const offen = farbnamen(seite);
  if (offen.length) klage(seite, `Farbvariable ohne Definition: ${offen.join(", ")}`);

  /* breit und hell: Ausrichtung, Kontrast, Klickflächen, Ansichtsschalter */
  const ctx = await browser.newContext({ viewport: { width: 1300, height: 950 }, colorScheme: "light" });
  const tab = await ctx.newPage();
  const fehler = [];
  tab.on("console", (m) => { if (m.type() === "error" && !/favicon/i.test(m.text())) fehler.push(m.text()); });
  tab.on("pageerror", (e) => fehler.push("Ausnahme: " + e.message));
  await tab.goto(`${adresse}/${seite}`, { waitUntil: "load" });
  await tab.waitForTimeout(400);
  const hell = await tab.evaluate(MESSUNG);

  if (!hell.ausrichtung) klage(seite, "kein Vorspann oder keine Überschrift gefunden");
  else {
    const { aus, versatz, fehlbreite } = hell.ausrichtung;
    if (!["start", "left"].includes(aus) || Math.abs(versatz) > 1)
      klage(seite, `Vorspann nicht linksbündig (${aus}, ${versatz} px versetzt)`);
    if (fehlbreite > 2)
      klage(seite, `Vorspann ${fehlbreite} px schmäler als die Seite — Breitenbremse noch drin`);
  }
  for (const k of hell.kontraste) if (k.wert < 4.5) klage(seite, `Kontrast hell ${k.wert}:1 bei ${k.sel}`);
  if (hell.knopf !== null && hell.knopf < 32) klage(seite, `Knopf nur ${hell.knopf} px hoch`);
  if (hell.regler !== null && hell.regler < 24) klage(seite, `Regler nur ${hell.regler} px hoch`);
  if (!hell.schalter) klage(seite, "kein Ansichtsschalter");

  /* Der Schalter muss wirken — und die gezeichneten Bilder mitziehen. */
  let bilder = "—";
  if (hell.schalter) {
    const vorher = await tab.evaluate(`({ grund: getComputedStyle(document.body).backgroundColor, bilder: ${bild} })`);
    /* Ein Blatt, das rechnet, laesst den Knopf warten — zoo.html belegt den
       Hauptthread in Scheiben von ueber zwei Sekunden. Frueher riss dieser
       Klick den ganzen Lauf ab, und die restlichen Blaetter blieben ungemessen:
       ein Absturz, der wie ein Ergebnis aussah. Jetzt ist es eine Beanstandung
       an genau dieser Seite, und der Lauf geht weiter. */
    let geklickt = true;
    try {
      await tab.click("#b-thema", { noWaitAfter: true, timeout: 10000 });
    } catch {
      geklickt = false;
      klage(seite, "Ansichtsschalter binnen 10 s nicht klickbar (Hauptthread belegt?)");
      bilder = "?";
    }
    if (geklickt) {
      await tab.waitForTimeout(450);
      const nachher = await tab.evaluate(`({ grund: getComputedStyle(document.body).backgroundColor, bilder: ${bild} })`);
      if (vorher.grund === nachher.grund) klage(seite, `Ansichtsschalter ohne Wirkung (${vorher.grund})`);
      const neu = vorher.bilder.filter((b, i) => b !== nachher.bilder[i]).length;
      if (vorher.bilder.length && neu === 0) klage(seite, `${vorher.bilder.length} Bild(er) ziehen beim Umschalten nicht mit`);
      bilder = vorher.bilder.length ? `${neu}/${vorher.bilder.length}` : "—";
    }
  }
  if (fehler.length) klage(seite, `Konsole: ${fehler.join(" | ").slice(0, 200)}`);
  await ctx.close();

  /* schmal und dunkel: Querlauf und Kontrast auf dunklem Grund */
  const ctx2 = await browser.newContext({ viewport: { width: 380, height: 900 }, colorScheme: "dark" });
  const tab2 = await ctx2.newPage();
  await tab2.goto(`${adresse}/${seite}`, { waitUntil: "load" });
  await tab2.waitForTimeout(350);
  const schmal = await tab2.evaluate(MESSUNG);
  if (schmal.ueberlauf > 1) klage(seite, `läuft auf 380 px um ${schmal.ueberlauf} px seitwärts`);
  for (const k of schmal.kontraste) if (k.wert < 4.5) klage(seite, `Kontrast dunkel ${k.wert}:1 bei ${k.sel}`);
  await ctx2.close();

  const kleinster = Math.min(...hell.kontraste.map((k) => k.wert), ...schmal.kontraste.map((k) => k.wert));
  console.log(`Querlauf ${String(schmal.ueberlauf).padStart(3)} px · ` +
    `Vorspann ${String(hell.ausrichtung ? hell.ausrichtung.fehlbreite : "?").padStart(3)} px schmäler · ` +
    `Kontrast ab ${kleinster.toFixed(2)}:1 · Knopf ${String(hell.knopf ?? "—").padStart(3)} px · Bilder ${bilder}`);
}
await browser.close();
server.close();

console.log("");
if (beanstandungen.length) {
  console.log(`FEHLGESCHLAGEN — ${beanstandungen.length} Beanstandung(en):`);
  for (const b of beanstandungen) console.log("  - " + b);
  process.exit(1);
}
console.log(`Alle ${seiten.length} Seiten in Ordnung.`);
