# Prosjektkontekst: RULL Oslo

## Konsept

RULL Oslo skal gjøre valget av kebabsted lekent og raskt. Hovedopplevelsen er en Tinder-lignende kortstokk: høyresveip betyr «lagre», venstresveip betyr «gå videre». Brukeren kan også bruke knappene, angre siste avgjørelse og se alle lagrede steder under «Mine ruller».

Et restaurantkort viser ekte navn, adresse, bydel, bilder, kilde, publisert fra-pris og Wolt-score. Brukeren kan bla mellom inntil fem bilder, åpne menyen, se detaljer og gå videre til Google Maps. Etter at et sted er lagret kan brukeren merke det som favoritt eller lagre en privat vurdering av kjøtt, saus, brød, porsjon og verdi. Alt personlig lagres bare lokalt i nettleseren.

## Design og brukeropplevelse

Designet er mørkt, energisk og matdrevet: kremfarget typografi, sterk oransje primærfarge, limegrønne aksenter, store restaurantbilder, avrundede kort og fysiske swipe-animasjoner. Swipe-siden er produktets viktigste flate og skal fortsette å fungere godt både med berøring, mus og handlingsknapper. Forsiden introduserer konseptet og leder raskt inn i kortstokken.

## Det som fungerer nå

- Swipe med drag eller knapper, med lagring og forkasting.
- Angre siste swipe og starte kortstokken på nytt.
- «Mine ruller», favoritter, besøkte steder og private vurderinger.
- Menymodal som laster restaurantens lokale JSON-fil ved behov.
- Bildekarusell og fallback dersom et eksternt bilde feiler.
- Filtrering på bydel, makspris, mattype, Wolt-score og verifisert meny.
- Alle Oslos 15 offisielle bydeler er valgbare, i tillegg til Sentrum.
- Detaljvisning, Google-/veibeskrivelseslenker og lenke for Google-vurdering.
- Finalerunde som velger mellom tre lagrede kandidater.
- 148 kildeoppføringer, 147 lokale menyer, 9 040 menyvarer og 736 eksterne bildekoblinger.

## Dataprinsipper som må bevares

Restaurantopplysninger skal være ekte, sporbare og tydelig datert. Navn, adresse, meny, priser, bilder, beskrivelser, score og åpningstider må aldri fylles med oppdiktede verdier. Når en verdi ikke er tilgjengelig, skal brukerflaten si det eller utelate verdien. Den nåværende katalogen oppgir Wolt som kilde og kontrolltidspunkt 17. juli 2026. Bydelsklassifiseringen ble laget med OpenStreetMap/Nominatim-grunnlag under datainnsamlingen.

Katalogen representerer alle funn som ble verifisert i den gjennomførte Wolt-baserte innsamlingen, men skal ikke omtales som en evig eller juridisk komplett liste over absolutt alle kebabsteder. Virksomheter, priser og menyer endres. Fremtidig oppdatering bør ha kildeproveniens, kontrolltidspunkt og en manuell avviksflyt.

## Uferdig eller begrenset

- Åpningstider og «åpent nå» er ikke implementert med levende data.
- Numerisk Google-rating er ikke integrert; appen viser Wolt-score og åpner Google eksternt.
- Ingen innebygd kartflate eller koordinater finnes i den aktive katalogen.
- Ingen konto- eller synkroniseringsbackend finnes. `localStorage` kan slettes av brukeren og synkroniseres ikke.
- Ingen offentlig posting av egne vurderinger finnes; «Skriv på Google» går til Google Maps-søk.
- Menyen til Mix Trosterud mangler i kilden og er markert som ikke verifisert.
- Kataloggeneratoren er ikke selvstendig fordi råinnhentingen lå i midlertidige `/tmp`-filer. Det ferdige datasettet er inkludert.
- De eksterne Wolt-bildene og fontene kan endres eller forsvinne.

## Viktige tidligere valg

- Riktige data er viktigere enn å fylle alle felt.
- Menyer er splittet i 147 filer og lastes ved behov for å holde førstelasningen mindre.
- Wolt-score merkes som Wolt-score; en Google-score skal ikke simuleres.
- Eksterne bilder beholdes som kilde-URL-er av hensyn til nøyaktighet og rettigheter.
- Brukerdata forblir private i nettleseren inntil en eksplisitt backend bygges.
- Bydelsfilteret bruker en eksplisitt, stabil liste med alle 15 bydeler og Sentrum.

## Funksjoner som ikke må fjernes

Swipe/knappevalg, angre, bildeblaing, menylasting, bydels- og prisfilter, lagrede steder, favoritter, private vurderinger, detaljer, Google-lenker, kildeetiketter, dataforbehold, mobilnavigasjon og finalerunden skal bevares ved videre arbeid med mindre brukeren uttrykkelig bestemmer noe annet.
