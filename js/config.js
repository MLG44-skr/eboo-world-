// Konfiguracja strony "Buduj z AI"
// -----------------------------------------------------------------------------
// Tu podajesz dane do zapisu newslettera w bazie Supabase.
// Jak zdobyć te wartości — patrz README.md sekcja "Newsletter / baza danych".
// Dopóki poniżej są wartości w [NAWIASACH], formularz działa, ale zamiast zapisu
// do bazy pokaże komunikat, że zapisy nie są jeszcze skonfigurowane.
// -----------------------------------------------------------------------------
window.BUDUJ_CONFIG = {
  // Adres projektu Supabase, np. "https://abcd1234.supabase.co"
  SUPABASE_URL: "[SUPABASE_URL_DO_UZUPEŁNIENIA]",
  // Klucz publiczny "anon" z Supabase (NIE service_role!)
  SUPABASE_ANON_KEY: "[SUPABASE_ANON_KEY_DO_UZUPEŁNIENIA]",
  // Nazwa tabeli na zapisy (domyślnie "subscribers")
  SUBSCRIBERS_TABLE: "subscribers",
  // Pełny adres strony (do linków, OG, sitemap). Np. "https://budujzai.pl"
  SITE_URL: "[ADRES_STRONY_DO_UZUPEŁNIENIA]"
};
