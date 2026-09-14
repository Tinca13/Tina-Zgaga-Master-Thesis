# -*- coding: utf-8 -*-

# ============================================================
# NAVODILA ZA ZAGON
# ============================================================
#
# 1. Zagon lokalnega HTTP-strežnika:
#
#    C:\Python27\python.exe -m SimpleHTTPServer 8000
#
# 2. Zagon Python skripte v ločenem terminalu:
#
#    C:\Python27\python.exe ".\Python koda.py"
#
# ============================================================
# OPOMBE
# ============================================================
#
# - Računalnik in robot Pepper morata biti povezana v isto
#   lokalno omrežje.
#
# - Vrednosti PEPPER_IP in PC_IP je treba po potrebi prilagoditi
#   trenutni omrežni konfiguraciji.
#
# - Skripta uporablja knjižnico NAOqi za povezavo z robotom Pepper.
#
# ============================================================


import time
from naoqi import ALProxy


# ============================================================
# KONFIGURACIJA
# ============================================================

# IP-naslov robota Pepper.
PEPPER_IP = "172.20.10.5"

# IP-naslov računalnika, na katerem teče lokalni HTTP-strežnik.
PC_IP = "172.20.10.2"

# Privzeta vrata za komunikacijo z ogrodjem NAOqi.
NAOQI_PORT = 9559

# Vrata lokalnega HTTP-strežnika.
WEB_SERVER_PORT = 8000


def main():
    """
    Vzpostavi povezavo s storitvijo ALTabletService na robotu Pepper
    in na tablici odpre začetno spletno stran uporabniškega vmesnika.
    """

    try:
        print(
            "Vzpostavljam povezavo z ALTabletService na naslovu {}:{} ..."
            .format(PEPPER_IP, NAOQI_PORT)
        )

        # Ustvarimo povezavo s storitvijo ALTabletService,
        # ki omogoča upravljanje spletnega pogleda na tablici robota.
        tablet = ALProxy(
            "ALTabletService",
            PEPPER_IP,
            NAOQI_PORT
        )

        # Omogočimo Wi-Fi na tablici, če še ni omogočen.
        # Omrežna povezava je potrebna za dostop do lokalnega
        # HTTP-strežnika, ki teče na računalniku.
        tablet.enableWifi()

        # Skrijemo morebitni trenutno odprti spletni pogled.
        # Nato pred ponovnim prikazom strani počakamo kratek čas.
        print("Ponastavljam spletni pogled na tablici ...")
        tablet.hideWebview()
        time.sleep(1)

        # Ustvarimo časovni žig, ki ga dodamo URL-ju kot parameter.
        # S tem zmanjšamo možnost, da bi tablica uporabila starejšo
        # različico strani, shranjeno v predpomnilniku.
        timestamp = int(time.time())

        # Sestavimo URL začetne strani uporabniškega vmesnika.
        # Stran se nalaga z lokalnega HTTP-strežnika na računalniku.
        url = "http://{}:{}/tablet.html?v={}".format(
            PC_IP,
            WEB_SERVER_PORT,
            timestamp
        )

        print("Odpiram spletni vmesnik na naslovu:")
        print(url)

        # Prikažemo spletni vmesnik na tablici robota Pepper.
        tablet.showWebview(url)

        print("Spletni vmesnik je bil uspešno poslan na tablico.")

        # Če se stran na tablici ne prikaže, lahko v terminalu,
        # kjer teče HTTP-strežnik, preverimo, ali je Pepper
        # poslal zahtevo GET za spletno stran.
        print(
            "Če se stran ne prikaže, preverite, ali terminal "
            "lokalnega HTTP-strežnika beleži zahtevo GET."
        )

    except Exception as e:
        # Izpišemo napako, če povezave z robotom ni mogoče vzpostaviti
        # ali če med izvajanjem pride do druge izjeme.
        print(
            "Pri povezavi z robotom Pepper ali izvajanju skripte "
            "je prišlo do napake:"
        )
        print(e)


if __name__ == "__main__":
    main()