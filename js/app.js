/* =========================================================================
   BUDUJ Z AI — logika strony (vanilla JS, bez bibliotek)
   ========================================================================= */
(function () {
  "use strict";

  var AUTOR = "marcel barut"; // na okładkach zawsze małymi literami
  var WIP_POKAZ = false;      // tryb podglądu niegotowych treści (?wip=1 / POKAZ_WIP)
  var ASSET_V = "13";         // wersja assetów (cache-busting); bump przy każdym deployu

  // Czy wartość to placeholder "[...DO UZUPEŁNIENIA]"?
  function isPH(v) { return typeof v === "string" && v.trim().charAt(0) === "["; }
  // Zwróć pusty string zamiast placeholdera (chyba że tryb podglądu).
  function clean(v) { return (!WIP_POKAZ && isPH(v)) ? "" : v; }

  /* ---------- Pomocnicze ---------- */
  function h(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function get(url) {
    var u = url + (url.indexOf("?") < 0 ? "?" : "&") + "v=" + ASSET_V;
    return fetch(u, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("Błąd ładowania: " + url);
      return r.json();
    });
  }

  /* ---------- Okładka ebooka (ilustracja WebP z /img/covers) ---------- */
  function coverHTML(ebook, klasa) {
    var id = ebook.id || "";
    var src = "img/covers/" + id + "-400.webp?v=" + ASSET_V;
    return '<img class="cover ' + (klasa || "") + '" src="' + h(src) +
           '" width="400" height="640" loading="lazy" decoding="async" ' +
           'alt="Okładka ebooka: ' + h(ebook.tytul || "") + '">';
  }

  /* ---------- Hero: wachlarz 3 okładek ---------- */
  function renderWachlarz(ebooki) {
    var box = qs("#hero-waclarz");
    if (!box) return;
    box.innerHTML = ebooki.slice(0, 3).map(function (e) { return coverHTML(e); }).join("");
  }

  /* ---------- Nowości AI ---------- */
  function newsCardHTML(n) {
    var link = n.link_zrodla && !isPH(n.link_zrodla)
      ? '<a class="news__link" href="' + h(n.link_zrodla) + '" target="_blank" rel="noopener">Źródło →</a>'
      : (WIP_POKAZ ? '<span class="news__link" style="color:var(--tekst-2)">[LINK DO ŹRÓDŁA]</span>' : "");
    return (
      '<article class="karta news">' +
        '<div class="news__data">' + h(clean(n.data)) + "</div>" +
        '<h3 class="news__tytul">' + h(clean(n.tytul)) + "</h3>" +
        "<p>" + h(clean(n.opis)) + "</p>" +
        link +
      "</article>"
    );
  }

  function renderNews(news) {
    // Na live pomijamy wpisy-placeholdery (bez uzupełnionego tytułu).
    if (!WIP_POKAZ) news = news.filter(function (n) { return !isPH(n.tytul); });
    var aktualne = qs("#news-aktualne");
    if (aktualne) {
      // Brak nowości -> ukryj całą sekcję (nie zostawiaj pustego nagłówka).
      var sekcja = document.getElementById("nowosci");
      if (news.length === 0 && sekcja) { sekcja.style.display = "none"; }
      else { aktualne.innerHTML = news.slice(0, 3).map(newsCardHTML).join(""); }
    }
    var archiwum = qs("#news-archiwum");
    if (archiwum && news.length === 0) {
      archiwum.innerHTML = '<p class="hero__sub">Pierwsze wydania pojawią się wkrótce — zapisz się do newslettera, żeby nic nie przegapić.</p>';
      archiwum = null;
    }
    if (archiwum) {
      var grupy = {};
      var kolejnosc = [];
      news.forEach(function (n) {
        var k = n.tydzien || "Pozostałe";
        if (!grupy[k]) { grupy[k] = []; kolejnosc.push(k); }
        grupy[k].push(n);
      });
      archiwum.innerHTML = kolejnosc.map(function (k) {
        return (
          '<div class="mt-40">' +
            "<h2>" + h(k) + "</h2>" +
            '<div class="siatka siatka--3">' + grupy[k].map(newsCardHTML).join("") + "</div>" +
          "</div>"
        );
      }).join("");
    }
  }

  /* ---------- Ebooki ---------- */
  function ebookCardHTML(e) {
    var wkrotce = e.status === "wkrotce";
    var cenaGotowa = e.cena && !isPH(e.cena);
    var punkty = (e.punkty || []).filter(function (p) { return WIP_POKAZ || !isPH(p); })
      .map(function (p) { return "<li>" + h(p) + "</li>"; }).join("");
    var badge = wkrotce ? '<span class="badge badge--wkrotce">Wkrótce</span>' : '<span class="badge">Dostępny</span>';

    var cta;
    if (wkrotce) {
      cta = '<a class="btn btn--obrys btn--maly" href="#newsletter">Daj znać, gdy wyjdzie</a>';
    } else if (e.link_payhip && !isPH(e.link_payhip)) {
      cta = '<a class="btn btn--akcent btn--maly" href="' + h(e.link_payhip) + '" target="_blank" rel="noopener">Kup</a>';
    } else if (WIP_POKAZ) {
      cta = '<a class="btn btn--akcent btn--maly" href="#" aria-disabled="true" title="Uzupełnij link Payhip">Kup</a>';
    } else {
      // Brak linku Payhip na live — kieruj do newslettera zamiast martwego przycisku.
      cta = '<a class="btn btn--obrys btn--maly" href="#newsletter">Powiadom mnie</a>';
    }

    // Cenę pokazujemy tylko gdy gotowa (lub w podglądzie).
    var cenaHTML = (!wkrotce && (cenaGotowa || WIP_POKAZ))
      ? '<span class="ebook__cena">' + h(cenaGotowa ? e.cena : "[CENA]") + "</span>" : "";

    return (
      '<article class="karta ebook">' +
        '<div class="ebook__cover">' + coverHTML(e) + "</div>" +
        '<div class="ebook__tresc">' +
          badge +
          '<h3 class="ebook__tytul">' + h(clean(e.tytul)) + "</h3>" +
          "<p>" + h(clean(e.opis)) + "</p>" +
          '<ul class="ebook__punkty">' + punkty + "</ul>" +
          '<div class="ebook__stopka">' +
            cenaHTML +
            cta +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderEbooki(ebooki) {
    var box = qs("#ebooki-lista");
    if (box) box.innerHTML = ebooki.map(ebookCardHTML).join("");
  }

  /* ---------- Projekty / aplikacje ---------- */
  function projektCardHTML(p, i) {
    var tagi = (p.tagi || []).filter(function (t) { return WIP_POKAZ || !isPH(t); })
      .map(function (t) { return '<span class="badge">' + h(t) + "</span>"; }).join("");
    var link = p.link && !isPH(p.link)
      ? '<a class="btn btn--akcent btn--maly" href="' + h(p.link) + '" target="_blank" rel="noopener">' + h(p.link_label || "Zobacz") + "</a>"
      : '<span class="btn btn--obrys btn--maly btn--wylaczony">' + h(p.link_label || "Wkrótce") + "</span>";

    // Bez makiety/zrzutów — czekamy na prawdziwe zrzuty HABLA (żeby nie sugerować funkcji, których apka nie ma).
    return (
      '<article class="projekt projekt--tekst">' +
        "<div>" +
          '<span class="nadtytul">' + h(p.typ) + "</span>" +
          '<h3 class="projekt__tytul">' + h(clean(p.tytul)) + "</h3>" +
          '<div class="projekt__meta">' + tagi + "</div>" +
          "<p>" + h(clean(p.opis)) + "</p>" +
          '<div class="projekt__akcje">' + link + "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderProjekty(projekty) {
    // Na live pomijamy projekty-placeholdery (bez uzupełnionego tytułu).
    if (!WIP_POKAZ) projekty = projekty.filter(function (p) { return !isPH(p.tytul); });
    var box = qs("#projekty-lista");
    if (!box) return;
    var sekcja = document.getElementById("projekty");
    if (projekty.length === 0 && sekcja) { sekcja.style.display = "none"; return; }
    box.innerHTML = projekty.map(projektCardHTML).join("");
  }

  /* ---------- Newsletter ---------- */
  function emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function initNewsletter() {
    var slot = qs("#newsletter-slot");
    if (!slot) return;

    var cfg = window.BUDUJ_CONFIG || {};
    var skonfig = cfg.SUPABASE_URL && !isPH(cfg.SUPABASE_URL) &&
                  cfg.SUPABASE_ANON_KEY && !isPH(cfg.SUPABASE_ANON_KEY);

    // Brak kluczy -> zostaje statyczny komunikat "Zapisy ruszają wkrótce".
    if (!skonfig) return;

    // Klucze są -> budujemy formularz (nie trzymamy go w publicznym HTML).
    slot.innerHTML =
      '<form id="newsletter-form" class="newsletter__form" novalidate>' +
        '<div class="pole">' +
          '<label for="nl-email">Twój e-mail</label>' +
          '<input type="email" id="nl-email" name="email" autocomplete="email" placeholder="ty@przyklad.pl" required />' +
        '</div>' +
        '<div class="zgoda">' +
          '<input type="checkbox" id="nl-zgoda" name="zgoda" required />' +
          '<label for="nl-zgoda">Zgadzam się na otrzymywanie newslettera i akceptuję <a href="polityka-prywatnosci.html">politykę prywatności</a>.</label>' +
        '</div>' +
        '<button type="submit" class="btn btn--ciemny">Zapisz mnie</button>' +
        '<p class="komunikat" id="nl-komunikat" role="status" aria-live="polite"></p>' +
      '</form>';

    var form = qs("#newsletter-form", slot);
    var email = qs("#nl-email", form);
    var zgoda = qs("#nl-zgoda", form);
    var komunikat = qs("#nl-komunikat", form);
    var przycisk = qs('button[type="submit"]', form);

    function msg(text, ok) {
      komunikat.textContent = text;
      komunikat.className = "komunikat " + (ok ? "komunikat--ok" : "komunikat--blad");
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      komunikat.textContent = "";
      var val = (email.value || "").trim();

      if (!emailOk(val)) { msg("Podaj poprawny adres e-mail.", false); email.focus(); return; }
      if (!zgoda.checked) { msg("Zaznacz zgodę, żeby móc Cię zapisać.", false); zgoda.focus(); return; }

      var cfg = window.BUDUJ_CONFIG || {};
      var skonfig = cfg.SUPABASE_URL && cfg.SUPABASE_URL.indexOf("[") !== 0 &&
                    cfg.SUPABASE_ANON_KEY && cfg.SUPABASE_ANON_KEY.indexOf("[") !== 0;

      if (!skonfig) {
        msg("Dzięki! Zapisy e-mail nie są jeszcze podłączone — wróć za chwilę. (konfiguracja: README)", true);
        form.reset();
        return;
      }

      przycisk.disabled = true;
      var url = cfg.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/" + (cfg.SUBSCRIBERS_TABLE || "subscribers");
      fetch(url, {
        method: "POST",
        headers: {
          "apikey": cfg.SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + cfg.SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },
        body: JSON.stringify({ email: val, consent: true })
      }).then(function (r) {
        if (r.status === 201 || r.status === 200 || r.status === 204) {
          msg("Zapisane! Sprawdź skrzynkę — wkrótce dostaniesz pierwszą checklistę.", true);
          form.reset();
        } else if (r.status === 409) {
          msg("Ten adres jest już zapisany. Do zobaczenia w newsletterze!", true);
          form.reset();
        } else {
          return r.text().then(function (t) {
            msg("Coś poszło nie tak. Spróbuj ponownie za chwilę.", false);
            if (window.console) console.warn("Newsletter:", r.status, t);
          });
        }
      }).catch(function () {
        msg("Brak połączenia. Sprawdź internet i spróbuj ponownie.", false);
      }).then(function () {
        przycisk.disabled = false;
      });
    });
  }

  /* ---------- Menu mobilne ---------- */
  function initNav() {
    var toggle = qs("#nav-toggle");
    var nav = qs("#nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var otwarte = nav.classList.toggle("otwarte");
      toggle.setAttribute("aria-expanded", otwarte ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("otwarte"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- Tryb WIP (podgląd niegotowych treści) ---------- */
  function initWip() {
    var cfg = window.BUDUJ_CONFIG || {};
    WIP_POKAZ = cfg.POKAZ_WIP === true ||
                new URLSearchParams(location.search).get("wip") === "1";
  }

  /* ---------- Przełącznik stylów ---------- */
  function initSwitch() {
    var box = qs(".styl-switch");
    if (!box) return;
    var aktywny = document.documentElement.getAttribute("data-styl") || "a";
    var btns = box.querySelectorAll("button[data-styl]");
    Array.prototype.forEach.call(btns, function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-styl") === aktywny ? "true" : "false");
      b.addEventListener("click", function () {
        var s = b.getAttribute("data-styl");
        try { localStorage.setItem("bza-styl", s); } catch (e) {}
        location.search = "?styl=" + s + "&wip=1";   // zostań w trybie podglądu
      });
    });
  }

  /* ---------- Symulacja: agent, który rozmawia ---------- */
  function initAgentDemo() {
    var body = qs("#agent-body"); if (!body) return;
    var textEl = qs("#agent-text"), caret = qs("#agent-caret"), typing = qs("#agent-typing");
    var steps = document.querySelectorAll("#agent-steps .step");
    var reply = "Jasne. Pierwszy ekran apki do nauki:\n• duży licznik serii dni (motywuje),\n• przycisk „Zacznij powtórkę”,\n• 3 talie fiszek do wyboru,\n• pasek postępu dziennego.\nZaczynamy od ekranu startowego?";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var timers = [];
    function clearAll() { timers.forEach(clearTimeout); timers = []; }
    function setSteps(on) { for (var i = 0; i < steps.length; i++) steps[i].classList.toggle("active", on); }
    function showFinal() { setSteps(true); if (typing) typing.style.display = "none"; if (caret) caret.hidden = true; textEl.textContent = reply; }
    if (reduce) { showFinal(); return; }
    function type(i) {
      if (i <= reply.length) { textEl.textContent = reply.slice(0, i); timers.push(setTimeout(function () { type(i + 1); }, 24)); }
      else { if (caret) caret.hidden = true; timers.push(setTimeout(run, 5000)); }
    }
    function run() {
      clearAll();
      textEl.textContent = ""; if (caret) caret.hidden = true; if (typing) typing.style.display = "";
      setSteps(false);
      timers.push(setTimeout(function () { if (steps[0]) steps[0].classList.add("active"); }, 400));
      timers.push(setTimeout(function () { if (steps[1]) steps[1].classList.add("active"); }, 1200));
      timers.push(setTimeout(function () { if (steps[2]) steps[2].classList.add("active"); }, 2000));
      timers.push(setTimeout(function () {
        if (steps[3]) steps[3].classList.add("active");
        if (typing) typing.style.display = "none";
        if (caret) caret.hidden = false;
        type(0);
      }, 2800));
    }
    // Start dopiero, gdy sekcja wejdzie w pole widzenia (oszczędza baterię na telefonie).
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { run(); io.disconnect(); } });
      }, { threshold: 0.3 });
      io.observe(body);
    } else { run(); }
  }

  /* ---------- Adres kontaktowy (z configu, jedno źródło) ---------- */
  function initContact() {
    var cfg = window.BUDUJ_CONFIG || {};
    var mail = cfg.CONTACT_EMAIL;
    if (!mail || isPH(mail)) return;
    var els = document.querySelectorAll("[data-contact-email]");
    Array.prototype.forEach.call(els, function (a) {
      a.textContent = mail;
      if (a.tagName === "A") a.setAttribute("href", "mailto:" + mail);
    });
  }

  /* ---------- Analityka bez cookies (GoatCounter) — tylko gdy ustawiona ---------- */
  function initAnalytics() {
    var cfg = window.BUDUJ_CONFIG || {};
    var code = cfg.ANALYTICS_GOATCOUNTER;
    if (!code || isPH(code)) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "//gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", code);
    document.body.appendChild(s);
    // Pokaż akapit o statystykach w polityce tylko gdy analityka jest włączona.
    var note = document.querySelector("[data-analytics-note]");
    if (note) note.hidden = false;
  }

  /* ---------- Rok w stopce ---------- */
  function initRok() {
    var el = qs("#rok");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Start ---------- */
  function baza() {
    // Ścieżka do /data działa i z podstron, i z korzenia (wszystko w jednym folderze).
    return "data/";
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initSwitch();
    initWip();
    initContact();
    initAnalytics();
    initRok();
    initNewsletter();
    initAgentDemo();

    if (qs("#hero-waclarz") || qs("#ebooki-lista")) {
      get(baza() + "ebooks.json").then(function (ebooki) {
        renderWachlarz(ebooki);
        renderEbooki(ebooki);
      }).catch(function (e) { if (window.console) console.warn(e); });
    }
    if (qs("#news-aktualne") || qs("#news-archiwum")) {
      get(baza() + "news.json").then(renderNews).catch(function (e) { if (window.console) console.warn(e); });
    }
    if (qs("#projekty-lista")) {
      get(baza() + "projekty.json").then(renderProjekty).catch(function (e) { if (window.console) console.warn(e); });
    }
  });
})();
