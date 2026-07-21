# Permanente arbeidsregler for Codex

1. Les hele prosjektstrukturen, `PROJECT_CONTEXT.md`, `MIGRATION_REPORT.md` og berørte filer før store endringer.
2. Ikke bygg prosjektet på nytt eller erstatt det med en ny arkitektur uten uttrykkelig beskjed.
3. Ikke fjern eller svekk fungerende funksjoner. Bevar særlig swipe, angre, menyer, filtre, lagrede steder, private vurderinger og kildemerking.
4. Ikke dikt opp restaurantnavn, adresser, bydeler, priser, menyer, åpningstider, bilder, beskrivelser eller vurderinger. Bruk en etterprøvbar kilde og registrer kontrolltidspunkt.
5. Ikke eksponer, logg, commit eller pakk inn hemmelige nøkler, tokens, passord eller private brukerdata. Oppdater `.env.example` bare med tomme/sikre verdier.
6. Ikke publiser, deploy, endre tilgangspolicy eller muter eksterne tjenester uten uttrykkelig tillatelse fra brukeren.
7. Gjør små, kontrollerbare endringer. Unngå å blande redesign, dataoppdatering og infrastrukturendring i samme endring uten behov.
8. Kjør build, eksplisitt TypeScript-kontroll, linting og eksisterende tester etter kodeendringer. Valider restaurant- og meny-JSON når data endres.
9. Dokumenter alle endrede filer, datakilder, antakelser og kontroller i overleveringen. Oppdater kontekstdokumentene når arkitektur eller datagrunnlag endres.
10. Oppgi ærlig hva som ikke kunne kontrolleres. Ikke presenter Wolt-data som Google-data, et kildeøyeblikksbilde som sanntid eller en delvis katalog som garantert komplett.

Prosjektet bruker npm og krever Node.js 22.13.0 eller nyere. Ikke commit `node_modules`, `dist`, cachemapper eller ekte `.env`-filer.
