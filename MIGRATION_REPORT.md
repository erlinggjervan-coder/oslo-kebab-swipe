# Migrasjonsrapport

## Eksportidentitet

- Eksporttid: 2026-07-19 00:54:29 UTC
- Faktisk hentet arbeidsmappe: `/workspace/scratch/2669810f55ab/rull-oslo`
- Aktiv Sites-side: RULL Oslo, lagret versjon 2
- Eksportert kildecommit: `9abd43e966e51082670b3f25f179cfc957d7ee1f`
- Commit-tittel: `Replace demo data with verified Oslo kebab catalog`
- Bekreftelse: kilden ble klonet direkte fra repositoryet som Sites-prosjektet oppga. Dette er ikke HTML fra den publiserte siden, en Canvas-eksport, tidligere prototype eller rekonstruert kode.

Dokumentasjonsfilene, `.env.example` og `.gitignore`-unntaket er lagt til lokalt etter kloningen for denne overleveringen. Appens design, funksjoner og data er ikke endret og ingenting er publisert eller deployet.

## Teknologi

- Node.js: krever `>=22.13.0`; eksportkontroll kjørt med 24.14.0
- Package manager: npm; kontroll kjørt med 11.9.0
- React 19.2.6, React DOM 19.2.6
- Next.js 16.2.6
- Vinext 0.0.50, Vite 8.0.13
- TypeScript 5.9.3
- Framer Motion 12.x
- Cloudflare Vite-plugin/Worker og Wrangler
- Drizzle-starterkode finnes, men ingen aktiv database eller tabeller

## Hovedmapper

- `.openai/`: Sites-hostingmanifest.
- `app/`: sider, layout, stil, typer, all aktiv UI- og domenelogikk.
- `app/data/`: aktiv restaurantkatalog og bydelsliste.
- `build/`: kildekode til Sites Vite-plugin; dette er ikke en generert buildmappe og må beholdes.
- `db/`, `drizzle/`, `examples/d1/`: ubrukt D1/Drizzle-startstruktur; skjemaet er tomt.
- `public/`: fem lokale SVG-filer og 147 meny-JSON-filer.
- `scripts/`: installasjons-, bygg-, validerings- og databyggeskript.
- `tests/`: eksisterende Node-test av generert artefaktmetadata.
- `worker/`: Cloudflare Worker-entrypoint.

## Fil- og datatall

- Antall filer i ZIP: 192, inkludert `FILE_MANIFEST.txt`; kryssjekkes på nytt ved pakking.
- Lokale bilde-/mediefiler: 5 SVG-filer; ingen rasterbilder eller fontfiler.
- Restaurantoppføringer: 148 i `app/data/verified-venues.json`.
- Bydeler/områder: 16 dataverdier — 15 offisielle bydeler og Sentrum.
- Restaurantnivå-bildekoblinger: 736 eksterne URL-er.
- Lokale menyfiler: 147 gyldige JSON-filer.
- Menyvarer i de lokale filene: 9 040.
- Manglende meny: Mix Trosterud (`624e9d357d2dc0a9704a6d5c`), eksplisitt merket ikke verifisert.

## Hvor funksjonene ligger

- Restaurantdata: `app/data/verified-venues.json`.
- Menydata og priser: `public/menus/*.json`.
- Datatransformasjon: `scripts/build-venue-data.mjs`; manuell kildeoppføring i `scripts/manual-venues.json`.
- Swipe, bildeblaing, angre og kortstokk: `app/RullApp.tsx`, særlig `Discover`, `SwipeCard`, `decide` og `undo`.
- Filter og bydelslogikk: `app/RullApp.tsx` (`defaultFilters`, `filteredVenues`, `FilterSheet`) og `app/data/venues.ts`.
- Lagrede steder, favoritter og private vurderinger: `app/RullApp.tsx`; vedvarende data i `localStorage`-nøklene `rull-decisions`, `rull-favorites`, `rull-reviews` og `rull-reports`.
- Kartfunksjon: eksterne Google Maps-søkelenker i hver restaurantoppføring. Det finnes ingen innebygd kartkomponent eller koordinatdatasett i aktiv app.

## Backend og database

Den aktive appen har ingen backend for applikasjonsdata, ingen Supabase-mappe, ingen migrations og ingen seed-database. `db/schema.ts` er med vilje tom, og `.openai/hosting.json` angir `d1: null` og `r2: null`. Vinext-starterens D1-eksempel og Drizzle-journal er beholdt fordi de finnes i den faktiske kilden, men de er ikke koblet til brukerflaten.

Ingen private brukerdata er eksportert. Nettleserens eksisterende `localStorage` tilhører den enkelte brukerprofilen og kan ikke eller bør ikke pakkes inn i prosjektet.

## Miljøvariabler og bindinger

Ingen hemmelig eller påkrevd applikasjonsvariabel mangler. `.env.example` lister de valgfrie lokale verktøyvariablene. Produksjonsbindingene `ASSETS` og `IMAGES` leveres av Cloudflare; `DB` er kun relevant dersom D1 senere aktiveres. Ingen reelle `.env`-filer eller tokens er inkludert.

## Eksterne tjenester og det som ikke kunne inkluderes

- Wolt-restaurant- og produktbilder er eksterne og ble ikke kopiert av opphavsrettshensyn.
- Wolt-restaurantlenker brukes som kildeproveniens.
- Google Maps brukes som ekstern søke-/veibeskrivelses- og vurderingsdestinasjon; ingen Places API-data finnes.
- Google Fonts/Next-fontressurser lastes eksternt.
- OpenStreetMap/Nominatim ble brukt i datainnsamlingen, men rå geokodingssvar og koordinater er ikke i repositoryet.
- Midlertidige råfiler som datageneratoren refererer til under `/tmp` er ikke tilgjengelige. Det ferdige aktive katalog- og menydatasettet er inkludert.
- Sites-plattformens tilgangspolicy, byggmiljø og hostinginfrastruktur er ekstern og kan ikke pakkes i ZIP.

Se `EXTERNAL_DEPENDENCIES.md` for domener og konsekvenser.

## Kjente feil og uferdige deler

- Sanntidsåpningstider mangler.
- Numerisk Google-rating mangler.
- Innebygd kart og koordinater mangler.
- Katalogen er et datert kildeøyeblikksbilde og kan bli utdatert.
- Én restaurant mangler menyfil.
- Kataloggeneratoren kan ikke kjøres ende-til-ende uten de opprinnelige råfilene.
- Personlige data synkroniseres ikke mellom enheter.

## Åpne i Codex og starte lokalt

1. Pakk ut `oslo-kebab-swipe-full-project.zip`.
2. Åpne rotmappen som inneholder `package.json` og `AGENTS.md`.
3. Bruk Node.js 22.13.0 eller nyere.
4. Kjør `npm ci`.
5. Kjør `npm run dev`.
6. Før endringer, les `PROJECT_CONTEXT.md` og `AGENTS.md`.

## Eksportkontroller

- Aktiv kilde: `HEAD` er kontrollert mot Sites-commit `9abd43e966e51082670b3f25f179cfc957d7ee1f`.
- Avhengigheter: et direkte `npm ci`-forsøk feilet fordi arbeidsflatens globale `/root/.npm` ikke var skrivbar. Repositoryets dokumenterte `npm run install:ci` brukte prosjektlokal cache, integritetskontrollerte Vinext-tarballen og installerte 519 pakker uten feil.
- Build: bestått med `npm run build`; Vinext bygget alle fem miljøer og artefaktvalideringen fant både ESM Worker `default.fetch` og hostingmanifest. Én ikke-blokkerende advarsel om klientchunk over 500 kB ble rapportert.
- TypeScript: `npx tsc --noEmit` feilet på tre Cloudflare-runtime-typer i ubrukt starter-/worker-infrastruktur: `cloudflare:workers`, `Fetcher` og `D1Database`. Dette skyldes at global Cloudflare-typedeklarasjon ikke er konfigurert i `tsconfig.json`. Den faktiske Vinext-builden kompilerer og består.
- Lint: fullført med 0 feil og 7 `@next/next/no-img-element`-advarsler i `app/RullApp.tsx`. De eksterne bildene brukes bevisst med vanlig `<img>` og fallback.
- Tester: bestått; 1 test, 1 pass, 0 feil. Testkommandoen bygget og validerte artefaktet på nytt.
- Artefakt: `npm run validate:artifact` bestått separat.
- Importbaner: alle relative importer i JS/TS/TSX/MJS ble kontrollert; ingen manglende lokale mål.
- Restaurantdata: JSON kan leses; 148 oppføringer og alle 16 områdenavn ble validert.
- Menydata: 147 filer kan parses, 9 040 varer; ingen ugyldige JSON-filer. Den ene forventede manglende menyen er eksplisitt `menuVerified: false`.
- Assets: alle lokale kildeassets finnes. Fem SVG-filer inngår; genererte `.vinext`-fontfiler inngår ikke.
- Hemmeligheter: ingen ekte `.env`-fil eller gjenkjennelig privatnøkkel/API-token ble funnet i eksportsettet.
- ZIP-integritet: bestått med `unzip -t`; alle oppføringer kunne dekomprimeres uten feil.
- ZIP-struktur: inneholder en vanlig rotmappe med hele kildehierarkiet, ikke én generert HTML-fil.
- Manifest: ZIP-en inneholder 192 filer, og den normaliserte fillisten er identisk med `FILE_MANIFEST.txt`.
