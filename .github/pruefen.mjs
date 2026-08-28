/* Die Sammelseite kann sich nicht selbst prüfen wie ein Blatt: ihr Prüflauf
   holt alle Blätter, und die liegen in fremden Repos. Also prüft die CI
   zwei Dinge getrennt:

     1. den Bau der Seite selbst — eine Karte je Blatt, jede mit gültiger Adresse,
        keine Doppelten, keine Fehlenden, kein Konsolenfehler
     2. die veröffentlichten Blätter — jede Adresse muss antworten und den
        erwarteten Titel tragen

   Punkt 2 prüft die Wirklichkeit draußen, nicht diesen Commit. Schlägt er fehl,
   ist entweder ein Blatt umbenannt worden oder ein Pages-Deployment steht noch
   aus; beides will man wissen.

       npm install playwright && npx playwright install chromium
       node .github/pruefen.mjs                # beides
       node .github/pruefen.mjs --nur-aufbau   # ohne Netz nach draußen */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright";

const WURZEL = process.cwd();
const NUR_AUFBAU = process.argv.includes("--nur-aufbau");
const ERWARTET = ["plotterblaetter", "redundanz", "reparatur", "schmiegung", "wuerfel", "rechenwerk", "einueben",
  "knackbar", "phishauge", "klartext", "einbruch",
  "nachkomma", "zeitsprung", "gradtage", "stimmfuehrung", "verzerrung",
  "handschlag", "wegewahl", "frequenzgang", "indexbaum", "auszaehlung", "uebersetzer", "ornament", "augenmass", "vorhersage", "tragwerk", "blocksatz",
  "abgleich", "spielbaum", "mischung", "turnier", "tilgung", "regenbogen",
  "faltung", "stau", "minen", "sortiernetz", "schwelle", "stroemung", "nachbarschaft", "ansturm", "schriftcode"];

const beanstandungen = [];
const meldung = (t) => { beanstandungen.push(t); console.log(`  ✗ ${t}`); };
const in_ordnung = (t) => console.log(`  ✓ ${t}`);

const TYPEN = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".mjs": "text/javascript" };
const server = createServer(async (anfrage, antwort) => {
  try {
    let pfad = decodeURIComponent((anfrage.url || "/").split("?")[0]);
    if (pfad.endsWith("/")) pfad += "index.html";
    const datei = join(WURZEL, normalize(pfad).replace(/^([/\\])+/, ""));
    if (!datei.startsWith(WURZEL)) { antwort.writeHead(403).end(); return; }
    antwort.writeHead(200, { "content-type": TYPEN[extname(datei)] || "application/octet-stream" });
    antwort.end(await readFile(datei));
  } catch {
    antwort.writeHead(404).end("nicht gefunden");
  }
});
await new Promise((f) => server.listen(0, "127.0.0.1", f));
const adresse = `http://127.0.0.1:${server.address().port}`;

/* ---------- 1. Aufbau ---------- */
console.log("=== Aufbau der Sammelseite");
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
const konsolenfehler = [];
tab.on("console", (n) => { if (n.type() === "error") konsolenfehler.push(n.text()); });
tab.on("pageerror", (f) => konsolenfehler.push("Ausnahme: " + f.message));

await tab.goto(`${adresse}/index.html`, { waitUntil: "load" });
await tab.waitForTimeout(400);

const echteFehler = konsolenfehler.filter((t) => !/favicon/i.test(t));
if (echteFehler.length) meldung(`Konsolenfehler: ${echteFehler.join(" | ").slice(0, 300)}`);
else in_ordnung("kein Konsolenfehler beim Laden");

const adressen = await tab.$$eval("a.karte", (as) => as.map((a) => a.getAttribute("href")));
const namen = adressen.map((h) => (h.match(/github\.io\/([^/]+)\//) || [])[1]).filter(Boolean);

if (namen.length !== adressen.length) meldung("Karte mit unerwarteter Adressform gefunden");
else in_ordnung(`alle ${adressen.length} Karten tragen eine gültige Adresse`);

const fehlend = ERWARTET.filter((n) => !namen.includes(n));
const zuviel = namen.filter((n) => !ERWARTET.includes(n));
const doppelt = namen.filter((n, i) => namen.indexOf(n) !== i);
if (fehlend.length) meldung(`Karte fehlt: ${fehlend.join(", ")}`);
if (zuviel.length) meldung(`Karte zeigt auf Unbekanntes: ${zuviel.join(", ")}`);
if (doppelt.length) meldung(`Karte doppelt: ${doppelt.join(", ")}`);
if (!fehlend.length && !zuviel.length && !doppelt.length)
  in_ordnung(`alle ${ERWARTET.length} Blätter genau einmal verlinkt`);

const signete = await tab.$$eval("a.karte canvas", (cs) =>
  cs.filter((c) => {
    const g = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    const erstes = [g[0], g[1], g[2]];
    for (let i = 4; i < g.length; i += 4) {
      if (g[i] !== erstes[0] || g[i + 1] !== erstes[1] || g[i + 2] !== erstes[2]) return false;
    }
    return true;                                     // durchgehend eine Farbe = nichts gezeichnet
  }).length);
if (signete > 0) meldung(`${signete} Signet(e) leer geblieben`);
else in_ordnung("alle Signete gezeichnet");

/* Die Ordnung ist eine Behauptung an beide Wörter: „nach Feldern" heißt
   gruppiert mit Gruppenkopf, „alphabetisch" heißt wirklich sortiert — und
   beim Umschalten darf kein Blatt verloren gehen. Nachgeprüft wird beides,
   hin und zurück. */
const ordnung = await tab.evaluate(() => {
  const wahl = document.getElementById("s-ordnung");
  if (!wahl) return null;
  const titel = () => [...document.querySelectorAll("#gruppen a.karte .name")]
    .map((n) => n.textContent.replace("→", "").trim());
  const kopfe = () => document.querySelectorAll("#gruppen h2").length;
  const gruppiert = { kopfe: kopfe(), karten: titel().length };
  wahl.value = "az";
  wahl.dispatchEvent(new Event("change"));
  const az = titel();
  const sortiert = JSON.stringify(az) === JSON.stringify([...az].sort((a, b) => a.localeCompare(b, "de")));
  const einmal = new Set(az).size === az.length;
  wahl.value = "feld";
  wahl.dispatchEvent(new Event("change"));
  const zurueck = { kopfe: kopfe(), karten: titel().length };
  return { gruppiert, az: az.length, sortiert, einmal, zurueck, liste: az };
});
if (!ordnung) meldung("Ordnungswahl fehlt");
else {
  if (ordnung.gruppiert.kopfe === 0 || ordnung.gruppiert.karten !== ERWARTET.length)
    meldung(`Feldordnung unvollständig (${ordnung.gruppiert.kopfe} Köpfe, ${ordnung.gruppiert.karten} Karten)`);
  else in_ordnung("nach Feldern: alle Gruppen mit Kopfzeile");
  if (ordnung.az !== ERWARTET.length) meldung(`Alphabetisch: ${ordnung.az} statt ${ERWARTET.length} Karten`);
  else if (!ordnung.einmal) meldung("Alphabetisch: ein Blatt doppelt");
  else if (!ordnung.sortiert) meldung("Alphabetisch: nicht sortiert — " + ordnung.liste.slice(0, 5).join(", "));
  else in_ordnung("alphabetisch: alle Blätter, wirklich sortiert");
  if (ordnung.zurueck.kopfe === 0 || ordnung.zurueck.karten !== ERWARTET.length)
    meldung("Rückwechsel zur Feldordnung scheitert");
  else in_ordnung("Rückwechsel zur Feldordnung gelungen");
}

await browser.close();
server.close();

/* ---------- 2. Die veröffentlichten Blätter ---------- */
if (NUR_AUFBAU) {
  console.log("\n(Adressen draußen nicht geprüft — --nur-aufbau)");
} else {
  console.log("\n=== Veröffentlichte Blätter");
  for (const name of ERWARTET) {
    const ziel = `https://ssims437.github.io/${name}/`;
    try {
      const antwort = await fetch(ziel, { cache: "no-store" });
      if (!antwort.ok) { meldung(`${name}: ${antwort.status}`); continue; }
      const html = await antwort.text();
      const titel = ((html.match(/<title>([^<]*)<\/title>/) || [])[1] || "").trim();
      if (!titel) meldung(`${name}: kein Titel`);
      else in_ordnung(`${name}: 200 · ${titel.slice(0, 60)}`);
    } catch (f) {
      meldung(`${name}: nicht erreichbar (${f.message})`);
    }
  }
}

console.log("");
if (beanstandungen.length) {
  console.log(`FEHLGESCHLAGEN — ${beanstandungen.length} Beanstandung(en):`);
  for (const b of beanstandungen) console.log(`  - ${b}`);
  process.exit(1);
}
console.log("Alles in Ordnung.");
