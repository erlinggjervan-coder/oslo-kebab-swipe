# RULL Oslo

RULL Oslo er den aktive kildekoden til en mobiltilpasset kebabvelger for Oslo. Brukeren sveiper restauranter til høyre for å lagre dem eller til venstre for å gå videre, kan angre siste valg, åpne komplette menyer, filtrere katalogen og føre private vurderinger i nettleseren.

Eksporten er hentet direkte fra kildekoderepositoriet som er koblet til den publiserte Sites-versjonen. Den er ikke en rekonstruksjon av den synlige nettsiden.

## Teknologistakk

- React 19.2.6 og TypeScript 5.9.3
- Next.js 16.2.6-kode kjørt gjennom Vinext 0.0.50 og Vite 8.0.13
- Framer Motion for swipe- og overgangsanimasjoner
- Tailwind/PostCSS-verktøy i byggkjeden, med hovedstilen i `app/globals.css`
- Cloudflare Worker/Sites som produksjonsmål
- npm med låst `package-lock.json`

## Krav

- Node.js 22.13.0 eller nyere
- npm (prosjektet er kontrollert med npm 11.9.0)
- Linux med `bash`, `flock`, `curl`, `sha256sum` og GNU `timeout` for de inkluderte CI-hjelpeskriptene

## Installere og kjøre

```bash
npm ci
npm run dev
```

Utviklingsserveren lytter via Vite/Vinext. For den samme kontrollerte installasjonsflyten som Sites bruker på Linux kan du i stedet kjøre `npm run install:ci`.

## Kontroller

```bash
npm run build
npx tsc --noEmit
npm run lint
npm test
```

`npm test` kjører build på nytt før Node-testene. `npm run validate:artifact` kontrollerer et eksisterende `dist`-artefakt.

## Data og funksjoner

- `app/data/verified-venues.json`: 148 restaurantoppføringer.
- `public/menus/`: 147 lokale menyfiler med publiserte priser og produktdata.
- `scripts/manual-venues.json`: én manuelt verifisert kildeoppføring som inngår i katalogbyggingen.
- `app/RullApp.tsx`: swipe, filtrering, menyvisning, lagrede steder, angre, favoritter, privat vurdering og finalerunde.
- `app/data/venues.ts`: listen over 15 offisielle Oslo-bydeler, pluss Sentrum, og innlasting av katalogen.

Oppføringen Mix Trosterud har ingen tilgjengelig menyfil i kildematerialet og er eksplisitt markert som ikke menyverifisert. Eksterne restaurant- og produktbilder lastes fra Wolts offentlige bildeadresser og er ikke kopiert inn i eksporten; se `EXTERNAL_DEPENDENCIES.md`.

## Lagring, backend og database

Den aktive appen har ingen applikasjonsdatabase og ingen Supabase-integrasjon. Swipevalg, favoritter, rapporter og private vurderinger lagres i nettleserens `localStorage` og følger derfor ikke brukeren mellom nettlesere eller enheter.

Repositoryet inneholder den ubrukte Vinext/D1-startstrukturen `db/`, `drizzle/` og `examples/d1/`. `.openai/hosting.json` har `d1: null` og `r2: null`, og `db/schema.ts` er tomt. Det kreves ingen database for å kjøre den nåværende appen.

## Miljøvariabler

Ingen hemmelige eller påkrevde applikasjonsvariabler brukes av den aktive funksjonaliteten. `.env.example` dokumenterer valgfrie verktøy- og timeoutvariabler. Cloudflare-bindingene `ASSETS` og `IMAGES` leveres av vertsmiljøet ved produksjonskjøring; `DB` blir bare nødvendig dersom den valgfrie D1-koden tas i bruk.

## Kjente begrensninger

- Katalogen er et kildekontrollert øyeblikksbilde fra 17. juli 2026 og er ikke en garanti for at absolutt alle virksomheter eller senere endringer er fanget.
- Åpningstider og sanntidsstatus er ikke tilgjengelig i datasettet; feltene er tomme/inaktive i brukerflaten.
- Appen viser Wolt-score. Google-knappene åpner et søk i Google Maps, men en Google Places-integrasjon og numerisk Google-rating finnes ikke.
- Restaurantbilder, produktbilder og Google Fonts er eksterne nettressurser og krever nettverk.
- Det finnes Google Maps-lenker, men ingen innebygd kartvisning eller lokale koordinater i den aktive katalogen.
- Kataloggeneratoren forventer midlertidige råfiler i `/tmp` og kan ikke regenerere datasettet fra bare eksporten. Det ferdige aktive datasettet og menyfilene er inkludert.

Se `PROJECT_CONTEXT.md` og `MIGRATION_REPORT.md` før større videreutvikling.
