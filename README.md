# Buduj z AI — strona WWW

Statyczna strona (HTML + CSS + jeden plik JS, bez frameworków). Mobile-first, ciemny motyw,
akcent limonkowy. Newsletter zapisuje e-maile do bazy Supabase. Sprzedaż przez zewnętrzny sklep Payhip.

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

E-maile zapisują się do tabeli w Supabase przez REST API. Dopóki w `js/config.js` są wartości
w `[NAWIASACH]`, formularz działa i waliduje dane, ale zamiast zapisu pokazuje komunikat
„zapisy nie są jeszcze podłączone”.

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

## Grafika do social (OG)

Plik `og-image.svg` to źródło. Facebook/LinkedIn nie czytają SVG, więc wyeksportuj go do
**`og-image.png` 1200×630 px** (np. otwierając SVG w przeglądarce i robiąc zrzut, albo w dowolnym edytorze)
i wgraj obok plików strony. Odwołania w `<head>` już wskazują na `og-image.png`.

---

## LISTA WSZYSTKICH [NAWIASÓW] DO UZUPEŁNIENIA

### Globalne (powtarzają się na wielu stronach)
- `[ADRES_STRONY_DO_UZUPEŁNIENIA]` — pełny adres strony, np. `https://budujzai.pl`.
  Występuje w: `index.html`, `nowosci.html` (canonical, OG), `sitemap.xml`, `robots.txt`, `js/config.js`.
- `[LINK_INSTAGRAM]`, `[LINK_TIKTOK]`, `[LINK_YOUTUBE]` — linki do social (stopka wszystkich stron + dane strukturalne).
- `og-image.png` — grafika social do wyeksportowania (patrz wyżej).

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
