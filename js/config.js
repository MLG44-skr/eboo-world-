// Konfiguracja strony "Buduj z AI"
// -----------------------------------------------------------------------------
// Tu podajesz dane do zapisu newslettera w bazie Supabase.
// Jak zdobyć te wartości — patrz README.md sekcja "Newsletter / baza danych".
//
// WAŻNE: newsletter MUSI mieć WŁASNY, OSOBNY projekt Supabase dla Marcela.
//        NIE używać projektu SOLA (txqjj...) ani żadnego innego istniejącego.
//        Dopóki poniżej są wartości w [NAWIASACH], formularz jest ukryty, a w
//        sekcji newslettera pokazuje się komunikat "Zapisy ruszają wkrótce".
// -----------------------------------------------------------------------------
window.BUDUJ_CONFIG = {
  // Adres NOWEGO projektu Supabase Marcela, np. "https://abcd1234.supabase.co"
  SUPABASE_URL: "[SUPABASE_URL_DO_UZUPEŁNIENIA]",
  // Klucz publiczny "anon" z tego projektu (NIE service_role!)
  SUPABASE_ANON_KEY: "[SUPABASE_ANON_KEY_DO_UZUPEŁNIENIA]",
  // Nazwa tabeli na zapisy (domyślnie "subscribers")
  SUBSCRIBERS_TABLE: "subscribers",
  // Pełny adres strony (do linków). Na razie GitHub Pages; później własna domena.
  SITE_URL: "https://marzenia42-png.github.io/buduj-z-ai",
  // Pokaż na stronie elementy jeszcze niegotowe (z [NAWIASAMI])?
  // false = ukryte na live. true (lub ?wip=1 w adresie) = podgląd wszystkiego.
  POKAZ_WIP: false,
  // Adres kontaktowy (wyświetlany w regulaminie i polityce prywatności)
  CONTACT_EMAIL: "marcelbarut44@gmail.com",
  // Analityka bez cookies (GoatCounter). Wklej pełny URL licznika, np.
  // "https://budujzai.goatcounter.com/count" — puste = wyłączone (bez skryptu, bez banera).
  ANALYTICS_GOATCOUNTER: ""
};
