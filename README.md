# Palace Hotel Zandvoort — interactieve conceptwebsite

Nederlandstalige statische website met een interactieve Three.js-kustscène, een op schaal gebracht OBJ-architectuurmodel met automatisch toegepaste steen- en zeeglastinten, camerastanden, galerijweergave en een mailto-aanvraagformulier. De pagina presenteert verhuurinformatie en claimt geen officiële vertegenwoordiging van het hotel.

## Aanpasbare informatie

- Contactadres en formulierontvanger: `CONTACT_EMAIL` in `app.js`.
- Bezoekerscopy en paginatitel: `index.html`.
- Kleuren, typografie en responsive gedrag: `styles.css`.
- `assets/zandvoort-kust.webp` is alleen een omgevingsbeeld en wordt niet voorgesteld als foto van het appartement.
- `assets/sunrise-tower.obj` is het aangeleverde 3D-model. Omdat het bestand geen materiaal- of kleurgegevens bevat, voegt de Three.js-scène een bescheiden palet van zandsteen en zeeglas toe.

Goedgekeurde appartementfoto's en bevestigde woninggegevens zijn nog nodig voordat kamers, voorzieningen, capaciteit, prijzen of beschikbaarheid worden getoond. Het formulier opent de e-mailapp van de bezoeker; aanvragen worden niet door deze website opgeslagen.

## Hosting

GitHub Pages publiceert via `.github/workflows/pages.yml`. Three.js wordt geladen via jsDelivr. Als WebGL niet beschikbaar is, blijft de overige website bruikbaar.

