/* Vollpruefung - das dritte Werkzeug neben pflege.mjs (greift ein) und
 * pruefblick.mjs (misst die Gestaltung nach).
 *
 *   node werkzeug/vollpruefung.mjs            alle Blaetter
 *   node werkzeug/vollpruefung.mjs schriftcode nur eines
 *
 * Vollpruefung: fuer jedes Blatt den echten Pruefknopf druecken - erst an der
 * lokalen Datei, dann an der veroeffentlichten Fassung. Gemessen wird, was das
 * Blatt selbst meldet, plus Konsolenfehler. Kein Urteil aus dem Bauch.
 */
import { chromium } from "playwright";
import http from "http"; import fs from "fs"; import path from "path";
import { readdirSync } from "fs";

/* Wurzel wie in pruefblick.mjs aus dem eigenen Ort ableiten - ein fester Pfad
   haette das Werkzeug an einen Rechner gebunden. */
const WURZEL = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const NUR = process.argv.slice(2);

const TYPEN = { ".html":"text/html; charset=utf-8", ".css":"text/css", ".mjs":"text/javascript",
  ".js":"text/javascript", ".png":"image/png", ".json":"application/json", ".csv":"text/csv",
  ".mid":"audio/midi", ".svg":"image/svg+xml" };
const server = http.createServer((q,a)=>{
  let p = decodeURIComponent(q.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const datei = path.join(WURZEL, p.replace(/^[\/]+/,""));
  fs.readFile(datei,(e,d)=>{ if(e){a.writeHead(404);a.end();return;}
    a.writeHead(200,{"content-type":TYPEN[path.extname(datei)]||"application/octet-stream"}); a.end(d); });
});
await new Promise(r=>server.listen(8760,r));

const blaetter = readdirSync(WURZEL,{withFileTypes:true})
  .filter(e=>e.isDirectory() && !e.name.startsWith(".") && !e.name.startsWith("_")
    && e.name!=="node_modules" && fs.existsSync(path.join(WURZEL,e.name,".git")))
  .map(e=>e.name).filter(n=>!NUR.length||NUR.includes(n)).sort();

/* Erkennung wie in .github/pruefen.mjs: drei Formulierungen, zwei davon verankert. */
const SCHLECHT = [/(\d+)\s+Prüfung(?:en)?\s+fehlgeschlagen/i, /^\s*(\d+)\s+FEHLER/im, /^\s*(\d+)\s+FALSCHE\s+FÄLLE/im];

async function pruefe(browser, adresse, name) {
  const ctx = await browser.newContext({ viewport:{width:1280,height:900} });
  const tab = await ctx.newPage();
  const fehler = [];
  tab.on("console", m => { if (m.type()==="error") fehler.push(m.text().slice(0,120)); });
  tab.on("pageerror", e => fehler.push("SEITENFEHLER " + e.message.slice(0,120)));
  let ergebnis = { name, knopf:false, text:"", fehler, rot:0, status:"?" };
  try {
    const antwort = await tab.goto(adresse, { waitUntil:"load", timeout:45000 });
    ergebnis.status = antwort ? antwort.status() : "?";
    await tab.waitForTimeout(400);
    const knopf = await tab.$("#b-pruefen");
    if (!knopf) { ergebnis.text = "kein Prüfknopf"; await ctx.close(); return ergebnis; }
    ergebnis.knopf = true;
    await knopf.click({ timeout:15000 });
    /* warten, bis der Fuss nicht mehr "noch nicht geprüft" sagt und sich beruhigt */
    let letzter = "", ruhig = 0;
    for (let i=0;i<80;i++) {
      await tab.waitForTimeout(500);
      const t = await tab.$eval("#pruef-fuss", e=>e.innerText).catch(()=>"" );
      if (t && !/noch nicht geprüft|läuft|prüfe/i.test(t)) { if (t===letzter) ruhig++; else ruhig=0; if (ruhig>=2) { letzter=t; break; } }
      letzter = t;
    }
    ergebnis.text = (letzter||"").replace(/\s+/g," ").trim();
    /* Rot-Erkennung woertlich aus .github/pruefen.mjs uebernommen - meine
       eigene Heuristik ("color enthaelt 163") schlug bei zeitsprung falsch an. */
    ergebnis.rot = await tab.evaluate(() => {
      const tabellen = ["#pruef", "#pruef-tabelle"].flatMap((s) => [...document.querySelectorAll(s)]);
      let n = 0;
      for (const t of tabellen) {
        for (const zelle of t.querySelectorAll("td")) {
          const f = getComputedStyle(zelle).color.match(/\d+/g);
          if (!f) continue;
          const [r, g, b] = f.map(Number);
          if (r > 110 && r > g * 1.5 && r > b * 1.5) n++;
        }
      }
      return n;
    }).catch(() => 0);
  } catch (e) { ergebnis.text = "ABBRUCH: " + e.message.split("\n")[0].slice(0,110); }
  await ctx.close();
  return ergebnis;
}

const browser = await chromium.launch();
let schlecht = 0;
for (const b of blaetter) {
  const pfad = b + "/";   /* die Sammelseite liegt lokal ebenfalls in ihrem Ordner - "" traf die Wurzel ohne index.html */
  const lok = await pruefe(browser, `http://localhost:8760/${pfad}`, b);
  const liv = await pruefe(browser, b==="ssims437.github.io" ? "https://ssims437.github.io/" : `https://ssims437.github.io/${b}/`, b);
  const urteil = (r) => {
    /* Erst der Status. Ohne diese Zeile ging eine 404-Seite als "ohne Prüflauf"
       durch - sie hat ja keinen Pruefknopf. Eine Fehlerseite ist kein Blatt. */
    if (r.status !== 200 && r.status !== "?") return `SCHLECHT: HTTP ${r.status}`;
    if (!r.knopf) return r.text==="kein Prüfknopf" ? "ohne Prüflauf" : r.text;
    if (/^ABBRUCH/.test(r.text)) return r.text;
    for (const re of SCHLECHT) if (re.test(r.text)) return "SCHLECHT: " + r.text.slice(0,90);
    if (r.rot>0) return `SCHLECHT: ${r.rot} rote Zelle(n)`;
    if (r.fehler.length) return "KONSOLE: " + r.fehler[0];
    return "gruen";
  };
  const ul = urteil(lok), uv = urteil(liv);
  const gut = (u)=>u==="gruen"||u==="ohne Prüflauf";
  if (!gut(ul) || !gut(uv)) schlecht++;
  console.log(`${b.padEnd(22)} lokal=${ul.padEnd(30)} live[${liv.status}]=${uv}`);
}
await browser.close(); server.close();
console.log(`\n${blaetter.length} Blätter geprüft, ${schlecht} auffällig.`);
process.exit(schlecht?1:0);
