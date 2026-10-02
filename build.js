/* =========================================================================
   Prerender (SEO): wstrzykuje nowości, ebooki i projekty jako gotowy HTML
   do index.html i nowosci.html (między znacznikami <!--PR:klucz:start/end-->).
   Czysty Node, zero zależności. Uruchom po każdej zmianie w data/*.json:

       node build.js

   Replikuje publiczny render z js/app.js (pomija placeholdery [ ]).
   ========================================================================= */
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const readJSON = (f) => JSON.parse(read(f));

const V = (read("js/app.js").match(/ASSET_V\s*=\s*"(\d+)"/) || [, "1"])[1];

function h(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
const isPH = (v) => typeof v === "string" && v.trim().charAt(0) === "[";
const clean = (v) => (isPH(v) ? "" : v);

function coverHTML(e) {
  var src = "img/covers/" + (e.id || "") + "-400.webp?v=" + V;
  return '<img class="cover" src="' + h(src) + '" width="400" height="640" loading="lazy" decoding="async" alt="Okładka ebooka: ' + h(e.tytul || "") + '">';
}
function newsCard(n) {
  var link = n.link_zrodla && !isPH(n.link_zrodla)
    ? '<a class="news__link" href="' + h(n.link_zrodla) + '" target="_blank" rel="noopener">Źródło →</a>' : "";
  return '<article class="karta news"><div class="news__data">' + h(clean(n.data)) + "</div>" +
    '<h3 class="news__tytul">' + h(clean(n.tytul)) + "</h3><p>" + h(clean(n.opis)) + "</p>" + link + "</article>";
}
function ebookCard(e) {
  var wkrotce = e.status === "wkrotce";
  var cenaGotowa = e.cena && !isPH(e.cena);
  var punkty = (e.punkty || []).filter((p) => !isPH(p)).map((p) => "<li>" + h(p) + "</li>").join("");
  var badge = wkrotce ? '<span class="badge badge--wkrotce">Wkrótce</span>' : '<span class="badge">Dostępny</span>';
  var cta;
  if (wkrotce) cta = '<a class="btn btn--obrys btn--maly" href="#newsletter">Daj znać, gdy wyjdzie</a>';
  else if (e.link_payhip && !isPH(e.link_payhip)) cta = '<a class="btn btn--akcent btn--maly" href="' + h(e.link_payhip) + '" target="_blank" rel="noopener">Kup</a>';
  else cta = '<a class="btn btn--obrys btn--maly" href="#newsletter">Powiadom mnie</a>';
  var cenaHTML = (!wkrotce && cenaGotowa) ? '<span class="ebook__cena">' + h(e.cena) + "</span>" : "";
  return '<article class="karta ebook"><div class="ebook__cover">' + coverHTML(e) + "</div>" +
    '<div class="ebook__tresc">' + badge + '<h3 class="ebook__tytul">' + h(clean(e.tytul)) + "</h3>" +
    "<p>" + h(clean(e.opis)) + '</p><ul class="ebook__punkty">' + punkty + "</ul>" +
    '<div class="ebook__stopka">' + cenaHTML + cta + "</div></div></article>";
}
function projektCard(p) {
  var tagi = (p.tagi || []).filter((t) => !isPH(t)).map((t) => '<span class="badge">' + h(t) + "</span>").join("");
  var link = p.link && !isPH(p.link)
    ? '<a class="btn btn--akcent btn--maly" href="' + h(p.link) + '" target="_blank" rel="noopener">' + h(p.link_label || "Zobacz") + "</a>"
    : '<span class="btn btn--obrys btn--maly btn--wylaczony">' + h(p.link_label || "Wkrótce") + "</span>";
  return '<article class="projekt projekt--tekst"><div><span class="nadtytul">' + h(p.typ) + "</span>" +
    '<h3 class="projekt__tytul">' + h(clean(p.tytul)) + '</h3><div class="projekt__meta">' + tagi + "</div>" +
    "<p>" + h(clean(p.opis)) + '</p><div class="projekt__akcje">' + link + "</div></div></article>";
}

function inject(html, key, content) {
  var re = new RegExp("(<!--PR:" + key + ":start-->)[\\s\\S]*?(<!--PR:" + key + ":end-->)");
  if (!re.test(html)) throw new Error("Brak znacznika PR:" + key);
  return html.replace(re, "$1" + content + "$2");
}

var news = readJSON("data/news.json");
var ebooki = readJSON("data/ebooks.json");
var projekty = readJSON("data/projekty.json");
var newsPub = news.filter((n) => !isPH(n.tytul));
var projektyPub = projekty.filter((p) => !isPH(p.tytul));

var idx = read("index.html");
idx = inject(idx, "news", newsPub.slice(0, 3).map(newsCard).join(""));
idx = inject(idx, "ebooki", ebooki.map(ebookCard).join(""));
idx = inject(idx, "projekty", projektyPub.map(projektCard).join(""));
fs.writeFileSync(path.join(ROOT, "index.html"), idx);

var grupy = {}, kol = [];
newsPub.forEach((n) => { var k = n.tydzien || "Pozostałe"; if (!grupy[k]) { grupy[k] = []; kol.push(k); } grupy[k].push(n); });
var arch = newsPub.length === 0
  ? '<p class="hero__sub">Pierwsze wydania pojawią się wkrótce — zapisz się do newslettera, żeby nic nie przegapić.</p>'
  : kol.map((k) => '<div class="mt-40"><h2>' + h(k) + '</h2><div class="siatka siatka--3">' + grupy[k].map(newsCard).join("") + "</div></div>").join("");
var now = read("nowosci.html");
now = inject(now, "archiwum", arch);
fs.writeFileSync(path.join(ROOT, "nowosci.html"), now);

console.log("prerender ok | news(top3):" + Math.min(3, newsPub.length) + " ebooki:" + ebooki.length + " projekty:" + projektyPub.length + " archiwum-grup:" + kol.length + " v" + V);
