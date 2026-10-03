# Buduj z AI — START (stan + DO MARCELA)

**Live:** https://mlg44-skr.github.io/eboo-world-/
**Repo:** https://github.com/MLG44-skr/eboo-world-
**Podgląd elementów roboczych:** dopisz `?wip=1` do adresu.

Jak dodać nową nowość AI, ebook lub projekt oraz jak działa wersjonowanie assetów — patrz `README.md`.

## Stan (skrót)
- Strona live, 5 podstron, 3 warianty stylu (przełącznik w `?wip=1`), ciemny motyw.
- Okładki ebooków: ilustracje w `img/covers/` (SVG + WebP).
- Nowości AI: 3 realne wpisy ze źródłami + archiwum (`data/news.json`).
- Checklista 10 promptów: `pliki/checklista-10-promptow.pdf` (link w sekcji newslettera).
- Sekcja „Zobacz AI w akcji": symulacja agenta (offline, oznaczona „Symulacja").
- Regulamin + polityka: kompletny tekst, administrator = Marcel Barut, kontakt: marcelbarut44@gmail.com.
- Newsletter: zapisy wstrzymane (decyzja o MailerLite po stronie Dario); na razie PDF do pobrania.

## DO MARCELA (czego potrzebujemy, żeby dokończyć)
- [ ] **Zdjęcie do „O mnie"** (do sekcji o Tobie).
- [ ] **Linki do social:** Instagram, TikTok, YouTube (pokażą się w stopce po wpisaniu).
- [ ] **Ceny + linki Payhip** dla 4 ebooków (w `data/ebooks.json`, pola `cena` i `link_payhip`).
- [ ] **2–3 zrzuty ekranu HABLA** (bez danych osobowych) — wtedy dodamy je do sekcji projektów.
- [ ] **Decyzja o newsletterze** (np. MailerLite) — wtedy wpinamy działające zapisy.
- [ ] **Założyć darmowe konto GoatCounter** (najlepiej na marcelbarut44@gmail.com) i podać **URL licznika** (np. `https://budujzai.goatcounter.com/count`) — wtedy włączymy statystyki bez cookies.
- [ ] (opcjonalnie) **Własna domena** — podmienimy adresy canonical/OG/`SITE_URL`.

## Decyzje
- Administrator danych: **Marcel Barut (osoba prywatna)**.
- Kontakt serwisu: **marcelbarut44@gmail.com** (w `js/config.js` → `CONTACT_EMAIL`).
- Statystyki: planowany **GoatCounter** (bez cookies, bez banera) — włączenie po założeniu darmowego konta.
