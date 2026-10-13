# Palace Hotel Zandvoort

Een compacte Nederlandstalige website voor Appartement Eterna in Zandvoort. De ervaring gebruikt kustfotografie, redactionele typografie, GSAP ScrollSmoother en lichte 2D-scrollanimaties. De pagina bevat geen WebGL of 3D-model.

## Lokaal bekijken

Open `index.html` in een browser of start een lokale webserver in deze map, bijvoorbeeld:

```sh
python -m http.server 8000
```

## Inhoud en contact

- De contactontvanger staat als `CONTACT_EMAIL` bovenaan in `app.js`.
- De zichtbare gegevens zijn gebaseerd op de bestaande [Eterna-pagina](https://www.eterna.nl/index.html) en [kenmerken](https://www.eterna.nl/kenmerken.html).
- Verouderde prijzen uit het tariefschema van 2020 zijn niet opgenomen. Controleer actuele tarieven, beschikbaarheid, voorwaarden en de boekingsprovider rechtstreeks met de eigenaar.
- De datumkeuze maakt een e-mailaanvraag. Er is geen live beschikbaarheidskoppeling en de website bewaart geen inzendingen.
- Appartementfoto's zijn nog niet aangeleverd. Het panoramabeeld wordt alleen als kust-/omgevingsbeeld gebruikt.
- Kleuren, indeling en responsive vormgeving staan in `styles.css`; paginacopy en secties staan in `index.html`.

## Publicatie

GitHub Pages publiceert de statische website via `.github/workflows/pages.yml`.
