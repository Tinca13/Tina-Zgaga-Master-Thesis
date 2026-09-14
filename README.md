# Tina Zgaga – Magistrsko delo

## Razvoj in vrednotenje sistema za interakcijo humanoidnega robota s starejšimi osebami v domu upokojencev

Ta repozitorij vsebuje programsko rešitev, razvito v okviru magistrskega dela **Tine Zgaga**.

V okviru projekta je bil razvit interaktivni sistem za humanoidnega robota **Pepper**, ki na robotovi tablici omogoča uporabo treh iger:

- Spomin,
- Križci in krožci,
- Šah.

Uporabniški vmesnik in igre so bili zasnovani za interakcijo robota Pepper s starejšimi osebami v okolju doma upokojencev.

---

## Struktura projekta

Glavna programska koda se nahaja v mapi `Koda`.

```text
Koda/
├── lib/
│   └── chess.bundle.js
├── Python koda.py
├── tablet.html
├── memory.html
├── TicTacToe.html
├── sah.html
├── style.css
├── app.js
├── chess-entry.js
├── package.json
└── package-lock.json
```

### Glavne datoteke

- `Python koda.py` – vzpostavi povezavo z robotom Pepper prek okolja NAOqi in na robotovi tablici odpre spletni uporabniški vmesnik.
- `tablet.html` – začetni meni za izbiro igre.
- `memory.html` – uporabniški vmesnik igre Spomin.
- `TicTacToe.html` – uporabniški vmesnik igre Križci in krožci.
- `sah.html` – uporabniški vmesnik igre Šah.
- `style.css` – oblikovanje in postavitev uporabniškega vmesnika.
- `app.js` – vsebuje programsko logiko iger Spomin, Križci in krožci ter Šah.
- `chess-entry.js` – vstopna datoteka za vključitev knjižnice `chess.js` v spletni vmesnik.
- `lib/chess.bundle.js` – datoteka, pripravljena za uporabo v brskalniku s pomočjo orodja esbuild.
- `package.json` – vsebuje podatke o JavaScript odvisnostih in ukaz za izdelavo `chess.bundle.js`.
- `package-lock.json` – vsebuje natančno določene različice uporabljenih npm paketov.

---

## Uporabljene tehnologije

Pri razvoju sistema so bile uporabljene naslednje tehnologije:

- Python 2.7,
- NAOqi Python SDK,
- HTML5,
- CSS,
- JavaScript,
- Node.js in npm,
- chess.js,
- esbuild.

Python skripta skrbi za povezavo z robotom Pepper prek storitve `ALTabletService`, medtem ko je uporabniški vmesnik za robotovo tablico izdelan kot spletna aplikacija.

---

## Igre

### Spomin

Igra Spomin vsebuje 12 kart oziroma 6 parov simbolov. Igralec in Pepper izmenično odkrivata karte ter zbirata najdene pare.

Pepper pri izbiri kart uporablja informacije o predhodno odkritih kartah in si zapomni njihove položaje.

### Križci in krožci

Igralec igra z znakom **X**, Pepper pa z znakom **O**.

Pepper pri izbiri poteze preveri možnost za zmago, možnost blokiranja igralčeve zmage in razpoložljivost sredinskega polja. Če nobena od teh možnosti ni na voljo, izbere eno izmed prostih polj.

### Šah

Pri igri Šah igralec igra z belimi figurami, Pepper pa s črnimi.

Za izvajanje pravil šaha, preverjanje dovoljenih potez in spremljanje stanja igre je uporabljena odprtokodna knjižnica **chess.js**.

Prikaz šahovnice, uporabniška interakcija in logika Pepperjeve izbire potez so implementirani v okviru tega projekta.

---

## Izdelava šahovske knjižnice za brskalnik

Knjižnica `chess.js` je v spletni vmesnik vključena prek datoteke `lib/chess.bundle.js`.

Datoteka se izdela iz `chess-entry.js` s pomočjo orodja **esbuild**.

V mapi `Koda` je treba najprej namestiti odvisnosti:

```bash
npm install
```

Nato se datoteka izdela z ukazom:

```bash
npm run build
```

Rezultat je datoteka:

```text
lib/chess.bundle.js
```

---

## Zagon sistema

Računalnik in robot Pepper morata biti povezana v isto lokalno omrežje.

Naslova `PEPPER_IP` in `PC_IP` v datoteki `Python koda.py` je treba po potrebi prilagoditi trenutni omrežni konfiguraciji.

V mapi `Koda` se najprej zažene lokalni HTTP-strežnik:

```text
C:\Python27\python.exe -m SimpleHTTPServer 8000
```

Nato se v ločenem terminalu zažene Python skripta:

```text
C:\Python27\python.exe ".\Python koda.py"
```

Skripta vzpostavi povezavo s storitvijo `ALTabletService` na robotu Pepper in na njegovi tablici odpre začetno stran `tablet.html`.

---

## Odvisnosti

JavaScript odvisnosti projekta so določene v datotekah `package.json` in `package-lock.json`.

Mapa `node_modules` ni vključena v repozitorij. Potrebne pakete je mogoče namestiti z ukazom:

```bash
npm install
```

Tudi lokalno okolje **NAOqi Python SDK** ni vključeno v repozitorij in ga je treba namestiti oziroma konfigurirati ločeno.

---

## Zunanje programske komponente

### chess.js

Projekt uporablja odprtokodno knjižnico **chess.js**, različico **1.4.0**, ki je objavljena pod licenco **BSD-2-Clause**.

Knjižnica je uporabljena za izvajanje pravil šaha, določanje dovoljenih potez in spremljanje stanja šahovske igre.

### esbuild

**esbuild** je uporabljen kot razvojno orodje za pripravo datoteke `chess.bundle.js`, ki omogoča uporabo knjižnice `chess.js` v spletnem vmesniku.

---

## Magistrsko delo

Programska rešitev je bila razvita v okviru magistrskega dela:

**Tina Zgaga**  
**Razvoj in vrednotenje sistema za interakcijo humanoidnega robota s starejšimi osebami v domu upokojencev**  
2026