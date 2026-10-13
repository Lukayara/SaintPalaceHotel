# Palace Hotel Zandvoort — interactieve conceptwebsite

Nederlandstalige statische website met een sticky Three.js-story, scrollgestuurde camerastanden, modelgebonden hotspots, vrij verkennen en een bewegende Noordzee-scène. Het aangeleverde OBJ-model wordt op basis van zijn bounding box geschaald en met vaste steen-, glas- en metaalmaterialen weergegeven. De pagina claimt geen officiële vertegenwoordiging van het hotel.

## Aanpasbare informatie

- Contactadres en formulierontvanger: `CONTACT_EMAIL` in `app.js`.
- Bezoekerscopy en paginatitel: `index.html`.
- Kleuren, typografie en responsive gedrag: `styles.css`.
- `assets/zandvoort-kust.webp` is alleen een omgevingsbeeld en wordt niet voorgesteld als foto van het appartement.
- `assets/sunrise-tower.obj` is het aangeleverde 3D-model. Omdat het bestand geen materiaal- of kleurgegevens bevat, voegt de Three.js-scène een bescheiden palet van zandsteen en zeeglas toe.
- `assets/palace-brand-source.webp` bewaart het aangeleverde logo; `assets/palace-brand-icon.png` bevat alleen de golfmarkering voor de kop- en voettekst. `assets/favicon.png` en `assets/apple-touch-icon.png` zijn de bijbehorende pictogramvarianten.
- De scroll-scène pauzeert wanneer het podium uit beeld is. De contactflow blijft beschikbaar zonder WebGL.

Goedgekeurde appartementfoto's en bevestigde woninggegevens zijn nog nodig voordat kamers, voorzieningen, capaciteit, prijzen of beschikbaarheid worden getoond. Het formulier opent de e-mailapp van de bezoeker; aanvragen worden niet door deze website opgeslagen.

## Hosting

GitHub Pages publiceert via `.github/workflows/pages.yml`. Three.js wordt geladen via jsDelivr. Als WebGL niet beschikbaar is, blijft de overige website bruikbaar.

