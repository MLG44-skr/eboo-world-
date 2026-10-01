/* =========================================================================
   Tryb podglądu (?wip=1) — wstrzykuje treści NIEGOTOWE, których NIE ma
   w publicznym HTML: przełącznik stylów, zdjęcie, opinie, dodatkowe FAQ,
   dalszy fragment, linki social oraz pełne szablony regulaminu/polityki.
   W wersji publicznej ten plik nic nie robi (zero [NAWIASÓW] w HTML).
   ========================================================================= */
(function () {
  "use strict";
  if (new URLSearchParams(location.search).get("wip") !== "1") return;

  function byId(id) { return document.getElementById(id); }
  function set(id, html) { var el = byId(id); if (el) el.innerHTML = html; }

  /* --- Przełącznik stylów (tylko w podglądzie) --- */
  var sw = document.createElement("div");
  sw.className = "styl-switch";
  sw.setAttribute("role", "group");
  sw.setAttribute("aria-label", "Styl strony");
  sw.innerHTML =
    '<span class="styl-switch__label">Styl:</span>' +
    '<button type="button" data-styl="a">Ciemny</button>' +
    '<button type="button" data-styl="b">Edytorski</button>' +
    '<button type="button" data-styl="c">Jasny</button>';
  document.body.appendChild(sw);

  /* --- Zdjęcie w "O mnie" --- */
  var grid = byId("omnie-grid");
  if (grid) {
    var foto = document.createElement("div");
    foto.className = "omnie__foto";
    foto.textContent = "[TWOJE ZDJĘCIE]";
    grid.insertBefore(foto, grid.firstChild);
  }

  /* --- Dalszy fragment rozdziału --- */
  set("wip-fragment", "<p>[DALSZY FRAGMENT ROZDZIAŁU 1 DO UZUPEŁNIENIA — wklej 1–2 akapity z prawdziwego ebooka.]</p>");

  /* --- Opinie --- */
  set("wip-opinie",
    '<section id="opinie"><div class="kontener">' +
      '<div class="sekcja__head"><p class="nadtytul">Co mówią czytelnicy</p><h2>Opinie</h2></div>' +
      '<div class="siatka siatka--3">' +
        '<div class="opinia">[Opinia czytelnika]</div>' +
        '<div class="opinia">[Opinia czytelnika]</div>' +
        '<div class="opinia">[Opinia czytelnika]</div>' +
      '</div>' +
    '</div></section>');

  /* --- Dodatkowe pytania FAQ --- */
  set("wip-faq",
    '<details><summary>Jakie są metody płatności?</summary>' +
      '<p>[METODY PŁATNOŚCI DO UZUPEŁNIENIA — np. BLIK, karta, Przelewy24 przez sklep Payhip.]</p></details>' +
    '<details><summary>Czy mogę zwrócić ebook?</summary>' +
      '<p>[ZASADY ZWROTÓW DO UZUPEŁNIENIA — produkty cyfrowe; patrz Regulamin.]</p></details>');

  /* --- Linki social w stopce (prepend przed Regulamin/Polityka) --- */
  var fl = byId("footer-links");
  if (fl) {
    var social = [
      ['[LINK_INSTAGRAM]', 'Instagram'],
      ['[LINK_TIKTOK]', 'TikTok'],
      ['[LINK_YOUTUBE]', 'YouTube']
    ];
    for (var i = social.length - 1; i >= 0; i--) {
      var li = document.createElement("li");
      li.innerHTML = '<a href="' + social[i][0] + '" target="_blank" rel="noopener">' + social[i][1] + "</a>";
      fl.insertBefore(li, fl.firstChild);
    }
  }

  /* --- Pełne szablony dokumentów prawnych --- */
  var REGULAMIN =
    '<p><strong>Uwaga:</strong> poniższy tekst to <span class="uzupelnij">szablon</span>. Dane w nawiasach uzupełnia właściciel / księgowa. Nie traktuj go jako gotowego dokumentu prawnego — wymaga weryfikacji.</p>' +
    '<h2>§1. Postanowienia ogólne</h2>' +
    '<p>Sprzedawcą produktów cyfrowych dostępnych na stronie jest <span class="uzupelnij">[NAZWA FIRMY / IMIĘ I NAZWISKO DO UZUPEŁNIENIA]</span>, <span class="uzupelnij">[ADRES DO UZUPEŁNIENIA]</span>, NIP <span class="uzupelnij">[NIP DO UZUPEŁNIENIA]</span>, REGON <span class="uzupelnij">[REGON DO UZUPEŁNIENIA]</span>, e-mail <span class="uzupelnij">[E-MAIL KONTAKTOWY DO UZUPEŁNIENIA]</span>.</p>' +
    '<h2>§2. Przedmiot sprzedaży</h2>' +
    '<p>Przedmiotem sprzedaży są treści cyfrowe (ebooki w formacie PDF) oraz ewentualnie dostęp do aplikacji. Sprzedaż i płatności obsługuje zewnętrzna platforma <span class="uzupelnij">Payhip</span>.</p>' +
    '<h2>§3. Składanie zamówienia i płatność</h2>' +
    '<ul><li>Zakup odbywa się przez przycisk „Kup”, który przenosi do sklepu <span class="uzupelnij">Payhip</span>.</li>' +
    '<li>Metody płatności: <span class="uzupelnij">[METODY PŁATNOŚCI DO UZUPEŁNIENIA]</span>.</li>' +
    '<li>Po opłaceniu plik PDF dostarczany jest na podany adres e-mail.</li></ul>' +
    '<h2>§4. Prawo odstąpienia od umowy</h2>' +
    '<p><span class="uzupelnij">[ZASADY ODSTĄPIENIA / ZWROTÓW DO UZUPEŁNIENIA]</span></p>' +
    '<h2>§5. Reklamacje</h2>' +
    '<p>Reklamacje: <span class="uzupelnij">[E-MAIL REKLAMACJI DO UZUPEŁNIENIA]</span>, czas rozpatrzenia: <span class="uzupelnij">[LICZBA DNI DO UZUPEŁNIENIA]</span> dni.</p>' +
    '<h2>§6. Postanowienia końcowe</h2>' +
    '<p>Obowiązuje prawo polskie. Regulamin obowiązuje od dnia <span class="uzupelnij">[DATA DO UZUPEŁNIENIA]</span>.</p>';

  var POLITYKA =
    '<p><strong>Uwaga:</strong> poniższy tekst to <span class="uzupelnij">szablon</span>. Dane w nawiasach uzupełnia właściciel / księgowa. Wymaga weryfikacji przed publikacją.</p>' +
    '<h2>1. Administrator danych</h2>' +
    '<p>Administratorem danych jest <span class="uzupelnij">[NAZWA FIRMY / IMIĘ I NAZWISKO DO UZUPEŁNIENIA]</span>, <span class="uzupelnij">[ADRES DO UZUPEŁNIENIA]</span>, kontakt: <span class="uzupelnij">[E-MAIL KONTAKTOWY DO UZUPEŁNIENIA]</span>.</p>' +
    '<h2>2. Jakie dane zbieramy</h2>' +
    '<ul><li><strong>Newsletter:</strong> adres e-mail oraz data i fakt wyrażenia zgody.</li>' +
    '<li><strong>Zakup ebooka:</strong> dane podane w sklepie <span class="uzupelnij">Payhip</span>.</li></ul>' +
    '<h2>3. Cel i podstawa przetwarzania</h2>' +
    '<p>Dane z newslettera przetwarzamy na podstawie zgody (art. 6 ust. 1 lit. a RODO). Zgodę można wycofać w każdej chwili, pisząc na <span class="uzupelnij">[E-MAIL KONTAKTOWY DO UZUPEŁNIENIA]</span>.</p>' +
    '<h2>4. Komu powierzamy dane</h2>' +
    '<p>Dostawcy usług: <span class="uzupelnij">[DOSTAWCA NEWSLETTERA / BAZY — np. Supabase DO UZUPEŁNIENIA]</span>, <span class="uzupelnij">[DOSTAWCA PŁATNOŚCI — Payhip DO UZUPEŁNIENIA]</span>, <span class="uzupelnij">[HOSTING DO UZUPEŁNIENIA]</span>.</p>' +
    '<h2>5. Jak długo przechowujemy dane</h2>' +
    '<p>Do czasu wycofania zgody lub <span class="uzupelnij">[OKRES DO UZUPEŁNIENIA]</span>.</p>' +
    '<h2>6. Twoje prawa</h2>' +
    '<p>Prawo dostępu, sprostowania, usunięcia, ograniczenia, przenoszenia oraz skargi do Prezesa UODO.</p>' +
    '<h2>7. Pliki cookies</h2>' +
    '<p><span class="uzupelnij">[INFORMACJA O COOKIES DO UZUPEŁNIENIA]</span></p>' +
    '<p>Data ostatniej aktualizacji: <span class="uzupelnij">[DATA DO UZUPEŁNIENIA]</span>.</p>';

  var legal = byId("wip-legal");
  if (legal) {
    var doc = legal.getAttribute("data-doc");
    if (doc === "regulamin") legal.innerHTML = REGULAMIN;
    else if (doc === "polityka") legal.innerHTML = POLITYKA;
  }
})();
