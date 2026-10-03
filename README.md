# Buduj z AI — strona WWW

Statyczna strona (HTML + CSS + jeden plik JS, bez frameworków). Mobile-first, ciemny motyw,
akcent limonkowy. Newsletter zapisuje e-maile do bazy Supabase. Sprzedaż przez zewnętrzny sklep Payhip.

- **Live:** https://mlg44-skr.github.io/eboo-world-/
- **Repo:** https://github.com/MLG44-skr/eboo-world-
- Każdy `git push` do gałęzi `main` automatycznie odświeża stronę na GitHub Pages (~1 min).

> **Elementy niegotowe są ukryte na live** (patrz sekcja „Flaga WIP"). Odsłaniają się
> dopiero po uzupełnieniu treści. Adresy `canonical`/OG wskazują na GitHub Pages —
> po wpięciu własnej domeny trzeba je podmienić (lista miejsc na końcu).

## Jak uruchomić lokalnie

Treść (nowości, ebooki, projekty) ładuje się z plików JSON przez `fetch`, więc **nie wystarczy
kliknąć pliku** — trzeba lokalny serwer. Najprościej:

```
cd E:\Dario\projekty\buduj-z-ai
python -m http.server 8080 --bind 127.0.0.1
```

Potem otwórz w przeglądarce:

```
http://127.0.0.1:8080/
```

(Po pracy zamknij serwer: Ctrl+C.)

## Struktura plików

```
index.html                 strona główna (wszystkie sekcje)
nowosci.html               archiwum nowości AI
regulamin.html             szablon regulaminu (do uzupełnienia)
polityka-prywatnosci.html  szablon polityki prywatności (do uzupełnienia)
css/style.css              cały wygląd
js/config.js               konfiguracja (klucze Supabase, adres strony)
js/app.js                  logika: render treści, okładki, newsletter, menu
data/news.json             nowości AI (edytujesz co tydzień)
data/ebooks.json           lista ebooków
data/projekty.json         aplikacje/projekty (HABLA itd.)
sitemap.xml, robots.txt    SEO
og-image.svg               źródło grafiki do social (wyeksportuj do og-image.png)
```

---

## Jak dodać NOWĄ nowość AI (co tydzień)

Otwórz `data/news.json` i **dopisz nowy blok na samej górze listy** (najnowsze pierwsze):

```json
{
  "tydzien": "Tydzień 2 — 6–12 października 2026",
  "data": "8 października 2026",
  "tytul": "Tytuł nowości",
  "opis": "Dwa zdania: co to jest i co konkretnie zmienia dla Ciebie.",
  "link_zrodla": "https://adres-zrodla.pl"
}
```

Zasady:
- Pamiętaj o przecinku między blokami `{ }`.
- 3 najnowsze wpisy pokazują się na stronie głównej, wszystkie — w archiwum (`nowosci.html`),
  pogrupowane po polu `"tydzien"` (wpisy z tym samym tekstem `tydzien` trafiają do jednej grupy).
- Jeśli nie masz jeszcze linku, zostaw `"[LINK DO ŹRÓDŁA DO UZUPEŁNIENIA]"` — pokaże się neutralny placeholder.

## Jak dodać NOWY ebook

Otwórz `data/ebooks.json` i dopisz blok:

```json
{
  "id": "krotki-identyfikator",
  "tytul": "Tytuł ebooka",
  "opis": "Jedno–dwa zdania opisu.",
  "punkty": ["Co w środku 1", "Co w środku 2", "Co w środku 3"],
  "cena": "49 zł",
  "link_payhip": "https://payhip.com/b/XXXXX",
  "kolor_okladki": "#000000",
  "kolor_akcent": "#E8FF3A",
  "status": "dostepny"
}
```

Zasady:
- `status`: `"dostepny"` → przycisk „Kup” (link do Payhip). `"wkrotce"` → przycisk
  „Daj znać, gdy wyjdzie” (prowadzi do newslettera), bez ceny.
- Okładka jest **rysowana w kodzie** z pól `tytul`, `kolor_okladki`, `kolor_akcent` —
  nie trzeba grafiki. Autor („marcel barut”) dokleja się automatycznie.
- Dobierz `kolor_akcent` tak, by był czytelny na `kolor_okladki` (jasny pasek na ciemnej okładce).

## Jak dodać NOWY projekt/aplikację

Otwórz `data/projekty.json` i dopisz blok (`typ`, `tytul`, `opis`, `tagi`, `status`, `link`, `link_label`).
Pierwszy projekt na liście dostaje makietę telefonu (pod HABLA); kolejne — okładkę generowaną w kodzie.

---

## Newsletter / baza danych (Supabase)

> **WAŻNE:** newsletter musi mieć **własny, osobny projekt Supabase** dla tej strony.
> **Nie używać** projektu SOLA (`txqjj…`) ani żadnego innego istniejącego — zakładamy nowy.

E-maile zapisują się do tabeli w Supabase przez REST API. Dopóki w `js/config.js` są wartości
w `[NAWIASACH]`, **formularz jest ukryty**, a w sekcji newslettera pokazuje się komunikat
**„Zapisy ruszają wkrótce”**. Po wklejeniu kluczy formularz pojawia się automatycznie.

### Krok 1 — utwórz tabelę

W panelu Supabase → SQL Editor wklej i uruchom:

```sql
create table if not exists public.subscribers (
  id          bigint generated always as identity primary key,
  email       text not null unique,
  consent     boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Zapisy z przeglądarki (klucz anon). Włącz RLS i pozwól TYLKO dodawać:
alter table public.subscribers enable row level security;

create policy "public can insert" on public.subscribers
  for insert to anon
  with check (true);
```

(Nie dodawaj polityki SELECT dla `anon` — dzięki temu nikt z przeglądarki nie odczyta listy e-maili.
Podgląd zapisów robisz w panelu Supabase.)

Unikalny `email` + brak polityki odczytu = ochrona przed podwójnym zapisem (duplikat zwróci 409,
strona pokaże „już zapisany”).

### Krok 2 — wklej klucze do `js/config.js`

- `SUPABASE_URL` — z Supabase → Settings → API → Project URL
- `SUPABASE_ANON_KEY` — z Settings → API → **anon public** (NIE service_role!)
- `SITE_URL` — docelowy adres strony

---

## Cache / wersjonowanie assetów (WAŻNE)

Żeby nikt nie dostał nowego HTML ze starym CSS/JS z cache, wszystkie pliki CSS/JS/JSON
ładowane są z końcówką `?v=<numer>`. Numer jest w dwóch miejscach:
- w czterech plikach `.html` (przy `style.css`, `config.js`, `app.js`, `wip.js` oraz w inline-skrypcie motywu),
- w `js/app.js` jako `ASSET_V` (używany przy pobieraniu `data/*.json`).

**Po KAŻDEJ zmianie w `css/*` lub `js/*` podnieś numer** (np. z `7` na `8`) w obu miejscach,
potem commit + push. Inaczej odwiedzający z cache zobaczą „rozjechaną" stronę (nowy HTML + stary CSS).
(Docelowo zautomatyzuje to skrypt build — patrz sekcja „Na później".)

## Flaga WIP — ukrywanie niegotowych elementów

Elementy z `[NAWIASAMI]` (zdjęcie w „O mnie", dalszy fragment ebooka, opinie, linki do social,
pytania FAQ o płatności/zwroty) są **ukryte na live**. Mechanizm:

- W kodzie są oznaczone atrybutem `data-wip`, a CSS je chowa (`[data-wip]{display:none}`).
- Linki-placeholdery (href zaczynający się od `[`) chowane są automatycznie przez JS.

Jak odsłonić:
- **Podgląd wszystkiego:** dopisz `?wip=1` do adresu (np. `…/eboo-world-/?wip=1`) **lub** ustaw
  `POKAZ_WIP: true` w `js/config.js`.
- **Na stałe (gdy element gotowy):** uzupełnij jego treść i **usuń atrybut `data-wip`** z tego
  elementu w HTML (przy linkach social — wpisz prawdziwy adres zamiast `[LINK_…]`).

## Grafika do social (OG)

`og-image.png` (1200×630) jest już wygenerowany z `og-image.svg`. Jeśli zmienisz treść/grafikę,
odśwież PNG (otwórz SVG w przeglądarce i zrób zrzut 1200×630, albo w dowolnym edytorze). Odwołania
w `<head>` wskazują na `og-image.png`.

## Prerender (SEO) — `node build.js`

Nowości, ebooki i projekty są **wklejane jako gotowy HTML** do `index.html` i `nowosci.html`
(między znacznikami `<!--PR:klucz:start/end-->`), żeby widział je Google — nie tylko JavaScript.
Po KAŻDEJ zmianie w `data/*.json` (albo po bumpie wersji) uruchom:

```
cd E:\Dario\projekty\buduj-z-ai
node build.js
```

Skrypt nie ma zależności (czysty Node), replikuje publiczny render z `js/app.js` (pomija
placeholdery `[ ]`). Kolejność przy zmianie CSS/JS: podnieś `?v=` + `ASSET_V`, potem `node build.js`, potem commit.

### Na później (opcjonalnie)
- GitHub Action, który sam uruchamia `node build.js` przy każdym pushu zmian w `data/`.
- Statystyki bez cookies: GoatCounter (ustaw `ANALYTICS_GOATCOUNTER` w `js/config.js`).

---

## LISTA WSZYSTKICH [NAWIASÓW] DO UZUPEŁNIENIA

### Globalne
- **Adres strony** — ustawiony tymczasowo na `https://mlg44-skr.github.io/eboo-world-`.
  Po wpięciu własnej domeny podmień w: `index.html`, `nowosci.html` (canonical, OG),
  `sitemap.xml`, `robots.txt`, `js/config.js` (`SITE_URL`).
- `[LINK_INSTAGRAM]`, `[LINK_TIKTOK]`, `[LINK_YOUTUBE]` — linki do social (stopka wszystkich stron +
  dane strukturalne). **Ukryte na live**, dopóki placeholder; wpisanie prawdziwego adresu je pokazuje.
- `og-image.png` — gotowy (1200×630). Odśwież tylko jeśli zmienisz grafikę.

### Konfiguracja (`js/config.js`)
- `[SUPABASE_URL_DO_UZUPEŁNIENIA]`
- `[SUPABASE_ANON_KEY_DO_UZUPEŁNIENIA]`

### Strona główna (`index.html`)
- `[TWOJE ZDJĘCIE]` — sekcja „O mnie”.
- `[DALSZY FRAGMENT ROZDZIAŁU 1 DO UZUPEŁNIENIA]` — sekcja „Fragment ebooka”.
- `[Opinia czytelnika]` ×3 — sekcja „Opinie” (NIE wymyślać — wstawić prawdziwe, gdy będą).
- `[METODY PŁATNOŚCI DO UZUPEŁNIENIA]`, `[ZASADY ZWROTÓW DO UZUPEŁNIENIA]` — FAQ.

### Dane (`data/*.json`)
- `data/news.json` — całość to placeholdery (tytuły, opisy, daty, linki źródeł).
- `data/ebooks.json` — `[CENA DO UZUPEŁNIENIA]` i `[LINK PAYHIP DO UZUPEŁNIENIA]` przy każdym ebooku.
- `data/projekty.json` — `[LINK DO HABLA DO UZUPEŁNIENIA]` + cały drugi projekt placeholder.

### Dokumenty prawne (uzupełnia właściciel / księgowa)
- `regulamin.html` — nazwa firmy, adres, NIP, REGON, e-maile, metody płatności, zasady zwrotów, daty.
- `polityka-prywatnosci.html` — administrator danych, dostawcy (Supabase/Payhip/hosting), okresy, cookies, daty.

> Zasada: nie wymyślamy danych firmy ani liczb. Wszędzie, gdzie brakuje informacji, zostaje `[NAWIAS]`.
