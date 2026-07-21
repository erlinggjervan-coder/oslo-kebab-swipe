# Eksterne avhengigheter

## Restaurant- og menybilder

Katalogen og menyfilene inneholder URL-er til `imageproxy.wolt.com` og `wolt-menu-images-cdn.wolt.com`. Det finnes 736 bildekoblinger på restaurantnivå, i tillegg til produktbildekoblinger i menyfilene. Bildene er ikke lastet ned eller pakket inn fordi de tilhører tredjepart og eksporten ikke dokumenterer en rett til redistribusjon. Appen trenger internettilgang for å vise dem og bruker en lokal SVG-fallback ved feil.

## Restaurantkilde

`app/data/verified-venues.json` inneholder kildelenker til aktive restaurantoppføringer på `wolt.com`. Meny- og restaurantdata er et lokalt øyeblikksbilde kontrollert 17. juli 2026; appen henter ikke menydata fra et Wolt-API ved normal kjøring. `scripts/build-venue-data.mjs` viser transformasjonen, men den opprinnelige innhentingen i `/tmp/wolt-kebab-oslo.json` og `/tmp/rull-menu-*.json` finnes ikke i repositoryet og inngår derfor ikke i eksporten.

## Google Maps og vurderinger

Appen oppretter eksterne søkelenker til `www.google.com/maps`. Det brukes ingen Google API-nøkkel, Places API eller innebygd kart. Google-tall, Place IDs og koordinater er ikke lagret. «Skriv på Google» og veibeskrivelse avhenger av at Google finner riktig virksomhet fra navn og adresse.

## Bydelsgrunnlag

Bydelsklassifiseringen i det ferdige datasettet ble kontrollert mot OpenStreetMap/Nominatim under datainnsamlingen. Det gjøres ingen levende OSM-forespørsel i appen, og de midlertidige geokodingssvarene er ikke del av repositoryet. Krediteringen vises i brukerflaten.

## Fonter

`app/globals.css` importerer DM Sans og Manrope fra `fonts.googleapis.com`. `app/layout.tsx` bruker også Nexts Geist-fontintegrasjon. Fontfilene er ikke pakket lokalt; uten nettverk faller CSS tilbake til systemfonter.

## Hosting og runtime

Produksjonsmålet er OpenAI Sites på Cloudflare Worker-runtime. `.openai/hosting.json` inneholder prosjektkoblingen, men ingen hemmelig innloggingsinformasjon. Cloudflare leverer `ASSETS`- og `IMAGES`-bindinger under hosting. D1 og R2 er satt til `null` og brukes ikke. Appen kan utvikles lokalt med Vite/Vinext uten tilgang til den publiserte siden.

## Innlogging og brukerdata

`app/chatgpt-auth.ts` er en valgfri starterhjelper, men importeres ikke av den aktive appen. Sites-tilgangspolicyen ligger utenfor repositoryet. Swipevalg, favoritter, rapporter og private vurderinger lagres i nettleserens `localStorage`; ingen ekstern brukerdatabase eller privat brukerdata er inkludert.

## Pakkeavhengigheter

npm-pakker hentes fra npm-registeret med eksakte/integritetslåste oppføringer i `package-lock.json`. `node_modules` er med vilje utelatt fra eksporten og gjenskapes med `npm ci`.
