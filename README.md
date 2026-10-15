# Palace Hotel Zandvoort

Een Nederlandstalige website voor Appartement Eterna in Zandvoort. De pagina combineert kustfotografie met interactieve fotolinten, een fotoweergave, uitklapbare appartementinformatie en een gedeelde beschikbaarheidskalender. De pagina gebruikt het gewone browser-scrollen en bevat geen 3D-model.

## Lokaal bekijken

Open `index.html` in een browser of start een lokale webserver in deze map, bijvoorbeeld:

```sh
python -m http.server 8000
```

## Inhoud en contact

- De contactontvanger staat als `CONTACT_EMAIL` bovenaan in `app.js`.
- De zichtbare gegevens zijn gebaseerd op de bestaande [Eterna-pagina](https://www.eterna.nl/index.html) en [kenmerken](https://www.eterna.nl/kenmerken.html).
- Verouderde prijzen uit het tariefschema van 2020 zijn niet opgenomen. Controleer actuele tarieven, beschikbaarheid, voorwaarden en de boekingsprovider rechtstreeks met de eigenaar.
- Een verblijf kan maximaal zeven nachten duren. De boekingsaanvraag opent een e-mail; de website bewaart geen aanvragen.
- De galerij gebruikt de zes aangeleverde appartementfoto’s in `assets/eterna/`. De foto’s openen in een navigeerbare fotoweergave; de twee bewegende fotolinten kunnen worden gepauzeerd.
- Scrollanimaties omvatten tekstregels die in beeld schuiven, subtiele beeldparallax, sectie-onthullingen en een voortgangslijn. De pagina blijft normaal scrollbaar en vermindert animaties als de bezoeker minder beweging heeft ingesteld.
- Kleuren, indeling en responsive vormgeving staan in `styles.css`; paginacopy en secties staan in `index.html`.

## Gedeelde beschikbaarheidskalender instellen

GitHub Pages serveert statische bestanden. De maandkalender en het beheerpaneel gebruiken daarom Google Apps Script als gedeelde API en een privé Google Sheet als opslag. De API-bron staat in `backend/AppsScript.gs`; de codes staan niet in de openbare websitebestanden. Zodra deze verbinding actief is, kunnen alle bezoekers de beschikbaarheidsstatus zien.

1. Maak een nieuw project op [script.google.com](https://script.google.com/) en plak de inhoud van `backend/AppsScript.gs` in `Code.gs`.
2. Kies `setupAvailabilitySheet` in de functiekeuze en voer deze eenmaal uit. Sta Google Sheets-toegang toe. Het script maakt een privé spreadsheet aan.
3. Open **Projectinstellingen → Script Properties** en voeg `ADMIN_CODES` toe met de twee beheercodes, gescheiden door een komma. Houd deze codes privé.
4. Kies **Deploy → New deployment → Web app**. Stel **Execute as** in op **Me** en **Who has access** op **Anyone**. Zo kan de website de agenda lezen; alleen de beheercodes mogen wijzigingen opslaan. Apps Script geeft een `/exec`-URL.
5. Plak die `/exec`-URL in `availability-config.js` als waarde van `window.AVAILABILITY_API_URL`, commit en push die ene configuratiewijziging naar `main`.

Tot de `/exec`-URL is toegevoegd, toont de website geen dagen als beschikbaar en meldt zij dat de gedeelde agenda nog gekoppeld moet worden. Voer daarna de beschikbaarheid via **Agenda beheren** in. Een periode loopt van aankomst tot vertrek; de vertrekdag is geen overnachting. Gasten kunnen maximaal zeven nachten aanvragen. De aanvraag opent een e-mail aan `tresjuice@hotmail.com`; de eigenaar bevestigt het verblijf per e-mail.

Apps Script-deployments worden beheerd in het Google-account van de eigenaar. Deel of publiceer de beheercodes niet buiten de private Script Properties.

## Publicatie

GitHub Pages publiceert de statische website via `.github/workflows/pages.yml`.
