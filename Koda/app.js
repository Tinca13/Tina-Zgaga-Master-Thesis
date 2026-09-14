/* =========================================================
   SKUPNA DATOTEKA APP.JS
   =========================================================
   
   Datoteka vsebuje programsko logiko za tri igre:
   
   - Spomin
   - Križci in krožci
   - Šah
   
   Ob nalaganju posamezne HTML-strani se glede na razred
   elementa <body> inicializira samo igra, ki pripada tej strani.
   
   Igre Spomin in Križci in krožci uporabljata lastno programsko
   logiko, zapisano v tej datoteki.
   
   Pri igri Šah se za upravljanje pravil, dovoljenih potez in
   stanja igre uporablja zunanja knjižnica chess.js.
   ========================================================= */


/* =========================================================
   INICIALIZACIJA POSAMEZNE IGRE
   ========================================================= */

/* Počakamo, da je struktura HTML-dokumenta v celoti naložena. */
document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;

    /* Če je odprta stran igre Spomin, inicializiramo igro Spomin. */
    if (body.classList.contains("page-memory")) {
        initMemoryGame();
    }

    /* Če je odprta stran igre Križci in krožci,
       inicializiramo ustrezno igro. */
    if (body.classList.contains("page-tictactoe")) {
        initTicTacToe();
    }

    /* Če je odprta stran igre Šah, inicializiramo šahovsko igro. */
    if (body.classList.contains("page-chess")) {
        initChessGame();
    }
});


/* =========================================================
   IGRA SPOMIN
   ========================================================= */

function initMemoryGame() {

    /* ---------------------------------------------------------
       ZAČETNE NASTAVITVE IGRE
       --------------------------------------------------------- */

    /* Seznam šestih parov simbolov, ki se uporabljajo na karticah. */
    var icons = [
        "🍎", "🍎",
        "🍌", "🍌",
        "🍇", "🍇",
        "🍒", "🍒",
        "🍍", "🍍",
        "🍓", "🍓"
    ];

    /* Naključno razporejeni simboli trenutne igre. */
    var boardIcons = [];

    /* Seznam trenutno obrnjenih kartic.
       Naenkrat sta lahko obrnjeni največ dve kartici. */
    var flippedCards = [];

    /* Pepperjev pomnilnik že videnih kartic.
       Ključ predstavlja indeks kartice, vrednost pa njen simbol. */
    var pepperMemory = {};

    /* Rezultat igralca in robota Pepper. */
    var playerScore = 0;
    var pepperScore = 0;

    /* Spremenljivka določa, ali je klik na kartico trenutno dovoljen. */
    var canClick = true;

    /* Določa, ali je trenutno na potezi Pepper. */
    var isPepperTurn = false;


    /* ---------------------------------------------------------
       MEŠANJE KARTIC
       --------------------------------------------------------- */

    /*
     * Naključno premeša elemente podane tabele.
     * Uporabljen je Fisher-Yatesov postopek mešanja.
     */
    function shuffle(array) {
        var remaining = array.length;
        var temporaryValue;
        var randomIndex;

        while (remaining > 0) {
            randomIndex = Math.floor(Math.random() * remaining);
            remaining--;

            temporaryValue = array[remaining];
            array[remaining] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }


    /* ---------------------------------------------------------
       USTVARJANJE IGRALNE PLOŠČE
       --------------------------------------------------------- */

    /*
     * Ustvari igralno ploščo velikosti 3 × 4.
     * Vsaka kartica dobi enolični indeks, ki se pozneje uporablja
     * za dostop do kartice in pripadajočega simbola.
     */
    function createBoard() {
        boardIcons = shuffle(icons.slice());

        var table = document.getElementById("memory-board");
        var html = "";
        var index = 0;

        for (var row = 0; row < 3; row++) {
            html += "<tr>";

            for (var column = 0; column < 4; column++) {
                html +=
                    "<td id='card-" + index + "'" +
                    " onclick='handleCardClick(" + index + ")'>" +
                    "?</td>";

                index++;
            }

            html += "</tr>";
        }

        table.innerHTML = html;
    }


    /* ---------------------------------------------------------
       IZBIRA KARTICE
       --------------------------------------------------------- */

    /*
     * Obravnava klik igralca na kartico.
     * Klik se ignorira, kadar je interakcija začasno onemogočena
     * ali kadar je na potezi Pepper.
     */
    function handleCardClick(id) {
        if (!canClick || isPepperTurn) {
            return;
        }

        revealCard(id);
    }


    /*
     * Obrne izbrano kartico in prikaže njen simbol.
     * Pepper si ob prikazu zapomni položaj in simbol kartice.
     */
    function revealCard(id) {
        var card = document.getElementById("card-" + id);

        /* Kartica mora obstajati in še ne sme biti obrnjena
           ali že pravilno povezana v par. */
        if (!card || card.className !== "") {
            return;
        }

        card.innerHTML = boardIcons[id];
        card.className = "flipped";

        /* Pepper si zapomni vsako odkrito kartico. */
        pepperMemory[id] = boardIcons[id];

        flippedCards.push({
            id: id,
            icon: boardIcons[id]
        });

        /* Ko sta obrnjeni dve kartici, začasno preprečimo
           nadaljnje klike in preverimo, ali tvorita par. */
        if (flippedCards.length === 2) {
            canClick = false;
            setTimeout(checkMemoryMatch, 800);
        }
    }


    /* ---------------------------------------------------------
       PREVERJANJE PARA
       --------------------------------------------------------- */

    /*
     * Primerja trenutno obrnjeni kartici.
     *
     * Če sta simbola enaka:
     * - kartici ostaneta vidni,
     * - igralec na potezi prejme točko,
     * - isti igralec nadaljuje potezo.
     *
     * Če simbola nista enaka:
     * - kartici se ponovno skrijeta,
     * - poteza preide na drugega igralca.
     */
    function checkMemoryMatch() {
        var firstCard = flippedCards[0];
        var secondCard = flippedCards[1];

        var firstElement = document.getElementById(
            "card-" + firstCard.id
        );

        var secondElement = document.getElementById(
            "card-" + secondCard.id
        );

        /* Kartici tvorita par. */
        if (firstCard.icon === secondCard.icon) {
            firstElement.className = "matched";
            secondElement.className = "matched";

            /* Najdenih parov Pepper ne potrebuje več v pomnilniku. */
            delete pepperMemory[firstCard.id];
            delete pepperMemory[secondCard.id];

            /* Točko prejme igralec, ki je izvedel potezo. */
            if (isPepperTurn) {
                pepperScore++;
            } else {
                playerScore++;
            }

            updateMemoryScore();

            flippedCards = [];

            /* Igra se konča, ko je najdenih vseh šest parov. */
            if (playerScore + pepperScore === 6) {
                showMemoryWinner();
                return;
            }

            /* Ob pravilnem paru isti igralec nadaljuje potezo. */
            if (isPepperTurn) {
                setTimeout(pepperMemoryTurn, 1000);
            } else {
                canClick = true;
            }

        /* Kartici ne tvorita para. */
        } else {
            firstElement.className = "";
            firstElement.innerHTML = "?";

            secondElement.className = "";
            secondElement.innerHTML = "?";

            flippedCards = [];

            /* Če je Pepper zgrešil, je ponovno na potezi uporabnik. */
            if (isPepperTurn) {
                isPepperTurn = false;
                canClick = true;

                document.getElementById("status").innerHTML =
                    "Ti si na vrsti!";

            /* Če je zgrešil uporabnik, potezo prevzame Pepper. */
            } else {
                isPepperTurn = true;

                document.getElementById("status").innerHTML =
                    "Pepper razmišlja ...";

                setTimeout(pepperMemoryTurn, 1200);
            }
        }
    }


    /* ---------------------------------------------------------
       PEPPERJEVA POTEZA PRI IGRI SPOMIN
       --------------------------------------------------------- */

    /*
     * Izvede Pepperjevo potezo.
     *
     * Pepper najprej preveri, ali ima v pomnilniku dve kartici
     * z enakim simbolom. Če tak par pozna, ga izbere.
     *
     * Če znanega para nima, izbere naključno še neodkrito kartico.
     * Po odkritju prve kartice ponovno preveri svoj pomnilnik in,
     * če pozna ustrezni par, izbere zapomnjeno kartico.
     * V nasprotnem primeru izbere drugo kartico naključno.
     */
    function pepperMemoryTurn() {
        var firstId = -1;
        var secondId = -1;
        var availableCards = [];

        /* Poiščemo vse kartice, ki še niso bile pravilno povezane
           in trenutno niso obrnjene. */
        for (var index = 0; index < boardIcons.length; index++) {
            var card = document.getElementById("card-" + index);

            if (card && card.className === "") {
                availableCards.push(index);
            }
        }

        if (availableCards.length === 0) {
            return;
        }

        /* Pepper najprej poišče že znan par v svojem pomnilniku. */
        for (var firstKey in pepperMemory) {
            if (!pepperMemory.hasOwnProperty(firstKey)) {
                continue;
            }

            for (var secondKey in pepperMemory) {
                if (!pepperMemory.hasOwnProperty(secondKey)) {
                    continue;
                }

                if (
                    firstKey !== secondKey &&
                    pepperMemory[firstKey] === pepperMemory[secondKey]
                ) {
                    var firstKnownCard = document.getElementById(
                        "card-" + firstKey
                    );

                    var secondKnownCard = document.getElementById(
                        "card-" + secondKey
                    );

                    /* Uporabimo samo kartici, ki sta še vedno na voljo. */
                    if (
                        firstKnownCard.className === "" &&
                        secondKnownCard.className === ""
                    ) {
                        firstId = parseInt(firstKey, 10);
                        secondId = parseInt(secondKey, 10);
                        break;
                    }
                }
            }

            if (firstId !== -1) {
                break;
            }
        }

        /* Če Pepper ne pozna para, naključno izbere prvo kartico. */
        if (firstId === -1) {
            firstId = availableCards[
                Math.floor(Math.random() * availableCards.length)
            ];
        }

        revealCard(firstId);

        /* Druga kartica se obrne z zamikom, da je poteza
           uporabniku vizualno razumljiva. */
        setTimeout(function () {

            /*
             * Če Pepper vnaprej ni poznal celotnega para,
             * po odprtju prve kartice preveri, ali je njen par
             * že shranjen v pomnilniku.
             */
            if (secondId === -1) {
                var firstIcon = boardIcons[firstId];

                for (var key in pepperMemory) {
                    if (!pepperMemory.hasOwnProperty(key)) {
                        continue;
                    }

                    if (
                        parseInt(key, 10) !== firstId &&
                        pepperMemory[key] === firstIcon
                    ) {
                        var rememberedCard = document.getElementById(
                            "card-" + key
                        );

                        if (rememberedCard.className === "") {
                            secondId = parseInt(key, 10);
                            break;
                        }
                    }
                }
            }

            /*
             * Če ustreznega para še vedno ne pozna,
             * naključno izbere eno od preostalih kartic.
             */
            if (secondId === -1) {
                var remainingCards = [];

                for (
                    var index = 0;
                    index < boardIcons.length;
                    index++
                ) {
                    var card = document.getElementById(
                        "card-" + index
                    );

                    if (
                        card &&
                        card.className === "" &&
                        index !== firstId
                    ) {
                        remainingCards.push(index);
                    }
                }

                if (remainingCards.length > 0) {
                    secondId = remainingCards[
                        Math.floor(
                            Math.random() * remainingCards.length
                        )
                    ];
                }
            }

            if (secondId !== -1) {
                revealCard(secondId);
            }
        }, 1000);
    }


    /* ---------------------------------------------------------
       REZULTAT IN KONEC IGRE
       --------------------------------------------------------- */

    /* Posodobi prikaz trenutnega rezultata. */
    function updateMemoryScore() {
        document.getElementById("score").innerHTML =
            "Ti: " + playerScore +
            " | Pepper: " + pepperScore;
    }


    /*
     * Po najdenih vseh parih primerja rezultat in izpiše
     * končni rezultat igre.
     */
    function showMemoryWinner() {
        var message;

        if (playerScore > pepperScore) {
            message = "Zmagala si!";
        } else if (pepperScore > playerScore) {
            message = "Pepper je zmagal!";
        } else {
            message = "Izenačeno!";
        }

        document.getElementById("status").innerHTML = message;

        /* Po zaključku igre nadaljnje poteze niso dovoljene. */
        canClick = false;
        isPepperTurn = false;
    }


    /*
     * Funkcijo izpostavimo globalnemu objektu window,
     * ker jo kličejo elementi igralne plošče prek atributa onclick.
     */
    window.handleCardClick = handleCardClick;

    /* Ob inicializaciji igre ustvarimo novo igralno ploščo. */
    createBoard();
}


/* =========================================================
   IGRA KRIŽCI IN KROŽCI
   ========================================================= */

function initTicTacToe() {

    /* ---------------------------------------------------------
       ZAČETNE NASTAVITVE IGRE
       --------------------------------------------------------- */

    /* Devet elementov predstavlja devet polj igralne plošče. */
    var board = [
        "", "", "",
        "", "", "",
        "", "", ""
    ];

    /* Določa, ali igra še poteka. */
    var active = true;

    /* Uporabnik igra z znakom X, Pepper pa z znakom O. */
    var playerSign = "X";
    var pepperSign = "O";

    /* Vse možne zmagovalne kombinacije na plošči 3 × 3. */
    var winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];


    /* ---------------------------------------------------------
       POTEZA UPORABNIKA
       --------------------------------------------------------- */

    /*
     * Obravnava izbiro igralnega polja.
     * Poteza se izvede samo, če je polje prazno in igra še poteka.
     */
    function playerMove(index) {
        if (board[index] !== "" || !active) {
            return;
        }

        makeTicTacToeMove(index, playerSign);

        /*
         * Če uporabnik s svojo potezo ni zaključil igre,
         * se igralna plošča začasno onemogoči in potezo prevzame Pepper.
         */
        if (active) {
            document.getElementById("status").innerText =
                "Pepper razmišlja ...";

            document.getElementById("game-board").className =
                "disabled";

            setTimeout(pepperTicTacToeMove, 1000);
        }
    }


    /* ---------------------------------------------------------
       PEPPERJEVA POTEZA
       --------------------------------------------------------- */

    /*
     * Izbere in izvede Pepperjevo potezo.
     */
    function pepperTicTacToeMove() {
        if (!active) {
            return;
        }

        var bestMove = findBestTicTacToeMove();

        if (bestMove !== -1) {
            makeTicTacToeMove(bestMove, pepperSign);
        }

        /* Po Pepperjevi potezi ponovno omogočimo igralno ploščo. */
        document.getElementById("game-board").className = "";

        if (active) {
            document.getElementById("status").innerText =
                "Ti si na vrsti (X)";
        }
    }


    /* ---------------------------------------------------------
       IZVEDBA POTEZE
       --------------------------------------------------------- */

    /*
     * Vpiše znak v interno predstavitev igralne plošče
     * in posodobi ustrezno HTML-polje.
     *
     * Po vsaki potezi preveri zmago oziroma neodločen rezultat.
     */
    function makeTicTacToeMove(index, sign) {
        board[index] = sign;

        var cells = document.querySelectorAll(
            "#game-board td"
        );

        cells[index].innerText = sign;

        /* Različna barva omogoča vizualno razlikovanje igralcev. */
        if (sign === playerSign) {
            cells[index].style.color = "#2c3e50";
        } else {
            cells[index].style.color = "#00ADEE";
        }

        var winningCombination = checkTicTacToeWinner();

        /* Če obstaja zmagovalna kombinacija, zaključimo igro. */
        if (winningCombination) {
            active = false;

            if (sign === playerSign) {
                document.getElementById("status").innerText =
                    "Zmagala si!";
            } else {
                document.getElementById("status").innerText =
                    "Pepper je zmagal!";
            }

            /* Označimo tri polja, ki sestavljajo zmagovalno kombinacijo. */
            for (
                var index = 0;
                index < winningCombination.length;
                index++
            ) {
                cells[
                    winningCombination[index]
                ].className = "winner-cell";
            }

        /* Če ni prostih polj in ni zmagovalca, je rezultat neodločen. */
        } else if (board.indexOf("") === -1) {
            active = false;

            document.getElementById("status").innerText =
                "IZENAČENO!";
        }
    }


    /* ---------------------------------------------------------
       IZBIRA PEPPERJEVE POTEZE
       --------------------------------------------------------- */

    /*
     * Izbere Pepperjevo naslednjo potezo po naslednjih pravilih:
     *
     * 1. Če lahko Pepper z naslednjo potezo zmaga, izbere to polje.
     * 2. Če lahko uporabnik z naslednjo potezo zmaga, Pepper potezo blokira.
     * 3. Če je sredinsko polje prosto, izbere sredino.
     * 4. Sicer naključno izbere eno od preostalih prostih polj.
     */
    function findBestTicTacToeMove() {
        var index;
        var combination;

        /* Najprej preverimo možnost neposredne Pepperjeve zmage. */
        for (
            index = 0;
            index < winningCombinations.length;
            index++
        ) {
            combination = winningCombinations[index];

            if (
                checkTwoOfThree(
                    combination[0],
                    combination[1],
                    combination[2],
                    pepperSign
                )
            ) {
                return getEmptyTicTacToeCell(
                    combination[0],
                    combination[1],
                    combination[2]
                );
            }
        }

        /* Nato preverimo, ali je treba preprečiti zmago uporabnika. */
        for (
            index = 0;
            index < winningCombinations.length;
            index++
        ) {
            combination = winningCombinations[index];

            if (
                checkTwoOfThree(
                    combination[0],
                    combination[1],
                    combination[2],
                    playerSign
                )
            ) {
                return getEmptyTicTacToeCell(
                    combination[0],
                    combination[1],
                    combination[2]
                );
            }
        }

        /* Če je mogoče, Pepper izbere sredinsko polje. */
        if (board[4] === "") {
            return 4;
        }

        /* Zberemo vsa preostala prosta polja. */
        var availableCells = [];

        for (index = 0; index < board.length; index++) {
            if (board[index] === "") {
                availableCells.push(index);
            }
        }

        /* Med prostimi polji izberemo eno naključno. */
        if (availableCells.length > 0) {
            return availableCells[
                Math.floor(Math.random() * availableCells.length)
            ];
        }

        return -1;
    }


    /*
     * Preveri, ali izbrana trojica polj vsebuje:
     * - dva enaka znaka izbranega igralca in
     * - eno prazno polje.
     *
     * Tak položaj pomeni možnost zmage ali potrebo po blokiranju.
     */
    function checkTwoOfThree(first, second, third, sign) {
        var signCount = 0;
        var emptyCount = 0;

        var indexes = [first, second, third];

        for (var index = 0; index < indexes.length; index++) {
            if (board[indexes[index]] === sign) {
                signCount++;
            } else if (board[indexes[index]] === "") {
                emptyCount++;
            }
        }

        return signCount === 2 && emptyCount === 1;
    }


    /* Vrne indeks praznega polja znotraj podane kombinacije. */
    function getEmptyTicTacToeCell(first, second, third) {
        if (board[first] === "") {
            return first;
        }

        if (board[second] === "") {
            return second;
        }

        if (board[third] === "") {
            return third;
        }

        return -1;
    }


    /*
     * Pregleda vse možne zmagovalne kombinacije.
     * Če najde tri enake neprazne znake, vrne njihovo kombinacijo.
     */
    function checkTicTacToeWinner() {
        for (
            var index = 0;
            index < winningCombinations.length;
            index++
        ) {
            var combination = winningCombinations[index];

            if (
                board[combination[0]] !== "" &&
                board[combination[0]] ===
                    board[combination[1]] &&
                board[combination[0]] ===
                    board[combination[2]]
            ) {
                return combination;
            }
        }

        return null;
    }


    /*
     * Funkcijo izpostavimo globalnemu objektu window,
     * ker jo kličejo HTML-elementi igralne plošče prek onclick.
     */
    window.playerMove = playerMove;
}


/* =========================================================
   IGRA ŠAH
   =========================================================
   
   Pravila šaha, stanje igre, dovoljene poteze in zaznavanje
   konca igre upravlja knjižnica chess.js.
   
   Ta del kode skrbi predvsem za:
   - prikaz šahovske plošče,
   - izbiro figur,
   - prikaz dovoljenih potez,
   - uporabnikove poteze,
   - izbiro Pepperjeve poteze,
   - prikaz trenutnega stanja in končnega rezultata.
   ========================================================= */

function initChessGame() {

    /* ---------------------------------------------------------
       PREVERJANJE KNJIŽNICE CHESS.JS
       --------------------------------------------------------- */

    /*
     * Pred inicializacijo preverimo, ali je objekt Chess,
     * ki ga zagotavlja knjižnica chess.js, na voljo.
     */
    if (typeof Chess === "undefined") {
        console.error("Knjižnica chess.js ni bila naložena.");

        var missingLibraryStatus =
            document.getElementById("status");

        if (missingLibraryStatus) {
            missingLibraryStatus.innerText =
                "Napaka: knjižnica za šah ni bila naložena.";
        }

        return;
    }


    /* ---------------------------------------------------------
       ZAČETNE NASTAVITVE ŠAHOVSKE IGRE
       --------------------------------------------------------- */

    /* Ustvarimo novo standardno šahovsko partijo. */
    var game = new Chess();

    /* Trenutno izbrano polje uporabnika. */
    var selectedSquare = null;

    /* Seznam dovoljenih potez za trenutno izbrano figuro. */
    var legalMoves = [];

    /* Določa, ali partija še poteka. */
    var gameActive = true;

    /* Med Pepperjevim razmišljanjem preprečimo poteze uporabnika. */
    var pepperThinking = false;


    /*
     * Unicode-znaki za prikaz belih in črnih šahovskih figur.
     *
     * chess.js uporablja:
     * k = kralj
     * q = dama
     * r = trdnjava
     * b = lovec
     * n = skakač
     * p = kmet
     */
    var pieces = {
        w: {
            k: "♔",
            q: "♕",
            r: "♖",
            b: "♗",
            n: "♘",
            p: "♙"
        },
        b: {
            k: "♚",
            q: "♛",
            r: "♜",
            b: "♝",
            n: "♞",
            p: "♟"
        }
    };


    /* ---------------------------------------------------------
       PRETVORBA KOORDINAT
       --------------------------------------------------------- */

    /*
     * Pretvori vrstico in stolpec HTML-tabele v standardno
     * šahovsko oznako polja.
     *
     * Primer:
     * vrstica 7, stolpec 0 -> a1
     * vrstica 0, stolpec 4 -> e8
     */
    function coordinatesToSquare(row, column) {
        var files = "abcdefgh";
        var rank = 8 - row;

        return files.charAt(column) + rank;
    }


    /* ---------------------------------------------------------
       DELO Z DOVOLJENIMI POTEZAMI
       --------------------------------------------------------- */

    /* Preveri, ali je določeno polje dovoljen cilj trenutne poteze. */
    function isLegalDestination(square) {
        for (
            var index = 0;
            index < legalMoves.length;
            index++
        ) {
            if (legalMoves[index].to === square) {
                return true;
            }
        }

        return false;
    }


    /*
     * Vrne podrobnosti dovoljene poteze za izbrano ciljno polje.
     * Če poteza ni dovoljena, vrne null.
     */
    function getLegalMove(square) {
        for (
            var index = 0;
            index < legalMoves.length;
            index++
        ) {
            if (legalMoves[index].to === square) {
                return legalMoves[index];
            }
        }

        return null;
    }


    /* ---------------------------------------------------------
       RISANJE ŠAHOVSKE PLOŠČE
       --------------------------------------------------------- */

    /*
     * Iz trenutnega stanja objekta game ponovno izriše vseh
     * 64 polj šahovske plošče.
     *
     * Funkcija označi:
     * - trenutno izbrano figuro,
     * - dovoljena ciljna polja,
     * - možna jemanja nasprotnikovih figur.
     */
    function drawChessBoard() {
        var table = document.getElementById("chess-table");

        if (!table) {
            return;
        }

        var html = "";

        for (var row = 0; row < 8; row++) {
            html += "<tr>";

            for (var column = 0; column < 8; column++) {
                var square =
                    coordinatesToSquare(row, column);

                /* Podatek o figuri na trenutnem polju.
                   Če je polje prazno, je vrednost null. */
                var piece = game.get(square);

                var classes = [];

                /* Izmenično določimo svetlo in temno polje. */
                if ((row + column) % 2 === 0) {
                    classes.push("white-sq");
                } else {
                    classes.push("black-sq");
                }

                /* Označimo trenutno izbrano polje. */
                if (selectedSquare === square) {
                    classes.push("selected");
                    classes.push("chess-selected");
                }

                /*
                 * Dovoljena prazna polja označimo zeleno,
                 * polja z nasprotnikovo figuro pa rdeče.
                 */
                if (isLegalDestination(square)) {
                    if (piece) {
                        classes.push("chess-capture");
                    } else {
                        classes.push("chess-legal");
                    }
                }

                var pieceCharacter = "";

                /* Če je na polju figura, pridobimo njen Unicode-znak. */
                if (piece) {
                    pieceCharacter =
                        pieces[piece.color][piece.type];
                }

                html +=
                    "<td id='cell-" +
                    row +
                    "-" +
                    column +
                    "'" +
                    " class='" +
                    classes.join(" ") +
                    "'" +
                    " onclick='handleSqClick(" +
                    row +
                    ", " +
                    column +
                    ")'>" +
                    pieceCharacter +
                    "</td>";
            }

            html += "</tr>";
        }

        table.innerHTML = html;
    }


    /* ---------------------------------------------------------
       IZBIRA ŠAHOVSKE FIGURE
       --------------------------------------------------------- */

    /* Odstrani trenutno izbiro figure in seznam dovoljenih potez. */
    function clearSelection() {
        selectedSquare = null;
        legalMoves = [];
    }


    /*
     * Izbere belo figuro uporabnika.
     *
     * Uporabnik lahko izbira samo bele figure in samo takrat,
     * ko je po pravilih igre na potezi bela stran.
     */
    function selectSquare(square) {
        var piece = game.get(square);

        if (
            !piece ||
            piece.color !== "w" ||
            game.turn() !== "w"
        ) {
            return false;
        }

        selectedSquare = square;

        /*
         * chess.js vrne seznam vseh dovoljenih potez
         * za izbrano figuro v podrobni obliki.
         */
        legalMoves = game.moves({
            square: square,
            verbose: true
        });

        drawChessBoard();

        var statusElement =
            document.getElementById("status");

        if (statusElement) {
            if (legalMoves.length > 0) {
                statusElement.innerText =
                    "Izberi označeno polje.";
            } else {
                statusElement.innerText =
                    "Ta figura trenutno nima dovoljene poteze.";
            }
        }

        return true;
    }


    /* ---------------------------------------------------------
       POTEZA UPORABNIKA
       --------------------------------------------------------- */

    /*
     * Obravnava klik uporabnika na posamezno šahovsko polje.
     *
     * Prvi klik izbere figuro.
     * Drugi klik poskuša izvesti potezo na izbrano ciljno polje.
     */
    function handleSqClick(row, column) {
        if (
            !gameActive ||
            pepperThinking ||
            game.turn() !== "w"
        ) {
            return;
        }

        var square = coordinatesToSquare(row, column);
        var clickedPiece = game.get(square);

        /* Če figura še ni izbrana, poskusimo izbrati kliknjeno polje. */
        if (!selectedSquare) {
            selectSquare(square);
            return;
        }

        /* Ponovni klik iste figure prekliče trenutno izbiro. */
        if (selectedSquare === square) {
            clearSelection();
            drawChessBoard();

            document.getElementById("status").innerText =
                "Ti si na vrsti!";

            return;
        }

        var selectedMove = getLegalMove(square);

        /*
         * Če ciljno polje ni dovoljeno:
         * - klik druge bele figure spremeni izbor,
         * - klik drugega nedovoljenega polja prekliče izbor.
         */
        if (!selectedMove) {
            if (
                clickedPiece &&
                clickedPiece.color === "w"
            ) {
                selectSquare(square);
            } else {
                clearSelection();
                drawChessBoard();

                document.getElementById("status").innerText =
                    "Ta poteza ni dovoljena.";
            }

            return;
        }

        /* Pripravimo podatke za izvedbo dovoljene poteze. */
        var moveData = {
            from: selectedMove.from,
            to: selectedMove.to
        };

        /*
         * Pri promociji kmeta ga samodejno promoviramo v damo.
         */
        if (selectedMove.promotion) {
            moveData.promotion = "q";
        }

        /* Izvedbo in veljavnost poteze prepustimo knjižnici chess.js. */
        var completedMove = game.move(moveData);

        clearSelection();
        drawChessBoard();

        if (!completedMove) {
            document.getElementById("status").innerText =
                "Poteze ni bilo mogoče izvesti.";

            return;
        }

        /* Po vsaki potezi preverimo, ali se je partija končala. */
        if (finishGameIfNeeded()) {
            return;
        }

        /* Če partija še poteka, potezo prevzame Pepper. */
        pepperThinking = true;

        document.getElementById("status").innerText =
            "Pepper razmišlja ...";

        setTimeout(pepperChessMove, 1000);
    }


    /* ---------------------------------------------------------
       PEPPERJEVA ŠAHOVSKA POTEZA
       --------------------------------------------------------- */

    /*
     * Pepper pridobi vse dovoljene poteze črne strani.
     *
     * Strategija izbire:
     * - če obstajajo poteze z jemanjem figure, izbira med njimi;
     * - sicer, če obstajajo poteze, ki dajejo šah, izbira med njimi;
     * - v vseh drugih primerih izbira med vsemi dovoljenimi potezami.
     *
     * Med enakovrednimi možnostmi je izbira naključna.
     */
    function pepperChessMove() {
        if (
            !gameActive ||
            game.turn() !== "b"
        ) {
            pepperThinking = false;
            return;
        }

        /* Pridobimo vse dovoljene poteze črne strani. */
        var possibleMoves = game.moves({
            verbose: true
        });

        /* Če potez ni, preverimo končno stanje igre. */
        if (possibleMoves.length === 0) {
            pepperThinking = false;
            finishGameIfNeeded();
            return;
        }

        var captureMoves = [];
        var checkingMoves = [];

        /* Poteze razdelimo glede na njihove lastnosti. */
        for (
            var index = 0;
            index < possibleMoves.length;
            index++
        ) {
            var move = possibleMoves[index];

            /* Poteza vključuje jemanje nasprotnikove figure. */
            if (move.captured) {
                captureMoves.push(move);
            }

            /* Znak + v SAN-zapisu pomeni, da poteza povzroči šah. */
            if (
                move.san &&
                move.san.indexOf("+") !== -1
            ) {
                checkingMoves.push(move);
            }
        }

        /* Privzeto lahko Pepper izbere katerokoli dovoljeno potezo. */
        var preferredMoves = possibleMoves;

        /*
         * Prednost imajo poteze z jemanjem.
         * Če teh ni, imajo prednost poteze, ki povzročijo šah.
         */
        if (captureMoves.length > 0) {
            preferredMoves = captureMoves;
        } else if (checkingMoves.length > 0) {
            preferredMoves = checkingMoves;
        }

        /* Naključno izberemo potezo iz prednostnega nabora. */
        var selectedMove =
            preferredMoves[
                Math.floor(
                    Math.random() * preferredMoves.length
                )
            ];

        var moveData = {
            from: selectedMove.from,
            to: selectedMove.to
        };

        /* Tudi Pepperjevega kmeta pri promociji spremenimo v damo. */
        if (selectedMove.promotion) {
            moveData.promotion = "q";
        }

        /* Izvedemo Pepperjevo potezo. */
        game.move(moveData);

        pepperThinking = false;

        /* Po potezi ponovno izrišemo trenutno stanje plošče. */
        drawChessBoard();

        /* Če igre ni konec, posodobimo prikaz trenutnega stanja. */
        if (!finishGameIfNeeded()) {
            updateChessStatus();
        }
    }


    /* ---------------------------------------------------------
       PREVERJANJE KONCA ŠAHOVSKE PARTIJE
       --------------------------------------------------------- */

    /*
     * S pomočjo chess.js preveri različne možne načine
     * zaključka šahovske partije.
     */
    function finishGameIfNeeded() {
        if (!game.isGameOver()) {
            return false;
        }

        var message = "Igra je končana.";

        /* Mat pomeni zmago strani, ki je izvedla zadnjo potezo. */
        if (game.isCheckmate()) {
            if (game.turn() === "w") {
                message = "Pepper je zmagal!";
            } else {
                message = "Zmagala si!";
            }

        /* Pat predstavlja remi. */
        } else if (game.isStalemate()) {
            message = "Igra se je končala s patom.";

        /* Trikratna ponovitev istega položaja. */
        } else if (game.isThreefoldRepetition()) {
            message =
                "Igra se je končala zaradi trikratne ponovitve položaja.";

        /* Na plošči ni dovolj materiala za izvedbo mata. */
        } else if (game.isInsufficientMaterial()) {
            message =
                "Igra se je končala zaradi nezadostnega materiala.";

        /* Drugi primeri remija, ki jih zazna chess.js. */
        } else if (game.isDraw()) {
            message = "Igra se je končala z remijem.";
        }

        endChessGame(message);
        return true;
    }


    /* ---------------------------------------------------------
       PRIKAZ STANJA ŠAHOVSKE PARTIJE
       --------------------------------------------------------- */

    /*
     * Posodobi besedilo, ki uporabniku sporoča,
     * kdo je trenutno na potezi in ali je beli kralj v šahu.
     */
    function updateChessStatus() {
        var statusElement =
            document.getElementById("status");

        if (!statusElement) {
            return;
        }

        if (game.turn() === "w") {
            if (game.isCheck()) {
                statusElement.innerText =
                    "Šah! Ti si na vrsti.";
            } else {
                statusElement.innerText =
                    "Ti si na vrsti!";
            }
        } else {
            statusElement.innerText =
                "Pepper razmišlja ...";
        }
    }


    /* ---------------------------------------------------------
       ZAKLJUČEK ŠAHOVSKE PARTIJE
       --------------------------------------------------------- */

    /*
     * Zaključi partijo, onemogoči nadaljnje poteze in
     * uporabniku prikaže končno sporočilo.
     */
    function endChessGame(message) {
        gameActive = false;
        pepperThinking = false;

        clearSelection();

        var statusElement =
            document.getElementById("status");

        if (statusElement) {
            statusElement.innerText = message;
            statusElement.classList.add("winner");
        }

        drawChessBoard();
    }


    /*
     * Funkcijo izpostavimo globalnemu objektu window,
     * ker jo kličejo šahovska polja prek atributa onclick.
     */
    window.handleSqClick = handleSqClick;


    /* ---------------------------------------------------------
       ZAČETEK ŠAHOVSKE IGRE
       --------------------------------------------------------- */

    /* Izrišemo začetni položaj in prikažemo začetno stanje igre. */
    drawChessBoard();
    updateChessStatus();
}