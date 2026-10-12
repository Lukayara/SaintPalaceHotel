# Palace Hotel Zandvoort — interactieve conceptwebsite

Nederlandstalige statische website met een interactieve Three.js-kustscène, camerastanden, galerijweergave en een mailto-aanvraagformulier. De pagina presenteert verhuurinformatie en claimt geen officiële vertegenwoordiging van het hotel.

## Aanpasbare informatie

- Contactadres en formulierontvanger: `CONTACT_EMAIL` in `app.js`.
- Bezoekerscopy en paginatitel: `index.html`.
- Kleuren, typografie en responsive gedrag: `styles.css`.
- `assets/zandvoort-kust.webp` is alleen een omgevingsbeeld en wordt niet voorgesteld als foto van het appartement.

Goedgekeurde appartementfoto's en bevestigde woninggegevens zijn nog nodig voordat kamers, voorzieningen, capaciteit, prijzen of beschikbaarheid worden getoond. Het formulier opent de e-mailapp van de bezoeker; aanvragen worden niet door deze website opgeslagen.

## Hosting

GitHub Pages publiceert via `.github/workflows/pages.yml`. Three.js wordt geladen via jsDelivr. Als WebGL niet beschikbaar is, blijft de overige website bruikbaar.

