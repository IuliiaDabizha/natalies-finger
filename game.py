#!/usr/bin/env python3
"""
🍟 NATALIE'S ANNULAIRE — MC'DO BULLSHIT CRUSADE 🍟
Python Backend Server & Terminal Game Companion
Written in Python 3.
"""

import sys
import os
import http.server
import socketserver
import webbrowser
from threading import Timer

PORT = 8085
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

LORE = {
    "title_en": "NATALIE'S ANNULAIRE — A Mc'Do Bullshit Crusade",
    "title_fr": "L'ANNULAIRE DE NATALIE — La Croisade du Foutage de Gueule chez Mc'Do",
    "intro_en": (
        "\n🔥 THE HEIST OF THE SEVERED ANNULAIRE 🔥\n"
        "It is 11:45 PM at Mc'Do Tassin la Demi-Lune. Behind the office desk lurks Natalie:\n"
        "50 years old, 4'11\" of pure distilled corporate rage, rocking a haircut like an angry thumb dipped in paprika.\n"
        "Natalie has zero joy in her soul. She screams at fake plastic ficus plants for insubordination,\n"
        "weighs dehydrated onion specks on a pocket scale, and dented her minivan 40 times into the dumpster while blaming the trash bin for having an attitude.\n"
        "Five years ago, she threw a temper tantrum over a water cup request and slammed the register so hard that she snapped off her own ANNULAIRE (ring finger).\n"
        "She never went to the hospital. She sneered: 'Pain is weakness leaving the franchise!' and tossed it into the freezer for tax write-off.\n\n"
        "You are not an employee. You are a vigilante troll on a sacred crusade: enter the front doors, talk to Clement,\n"
        "explore the back parking lot on the opposite side to get police tools and the car code,\n"
        "infiltrate the sealed sub-zero walk-in freezer, pry Natalie's 2019 fossilized finger from McFlurry crate #4,\n"
        "and present it right to her face until her blood pressure hits 9000 PSI and she literally EXPLODES!\n"
    ),
    "intro_fr": (
        "\n🔥 LE BRAQUAGE DE L'ANNULAIRE PERDU 🔥\n"
        "Il est 23h45 au Mc'Do de Tassin la Demi-Lune. Derrière son bureau règne Natalie :\n"
        "50 ans, 1m50 de pure haine managériale, avec une coupe comme un pouce en colère trempé dans le paprika.\n"
        "Natalie n'a aucune pitié. Elle hurle sur des faux ficus en plastique pour insubordination,\n"
        "pèse des miettes d'oignons déshydratés sur une balance de poche, et a embouti 40 fois son monospace pourri contre la benne en accusant la benne d'avoir bougé.\n"
        "Il y a 5 ans, elle a piqué une crise monumentale pour un gobelet d'eau et a claqué le tiroir-caisse si fort qu'elle s'est arraché l'ANNULAIRE.\n"
        "Elle n'est jamais allée aux urgences. Elle s'est écriée : 'La douleur, c'est de la faiblesse face au bilan comptable !' et l'a balancé au congélo pour amortissement fiscal.\n\n"
        "Tu n'es pas là pour manger. Tu es là pour la mission troll du siècle : entrer par les portes avant, parler à Clement,\n"
        "explorer le parking arrière à l'opposé pour trouver les outils des flics et le code dans sa bagnole,\n"
        "t'infiltrer dans la chambre froide hermétique pour arracher son annulaire fossilisé de 2019,\n"
        "et lui offrir droit dans les yeux avec un grand sourire jusqu'à ce que sa tension explose à 9000 bars !\n"
    )
}

class McDoHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run_server():
    print("=" * 65)
    print("🍟 NATALIE'S ANNULAIRE — MC'DO GAME SERVER (PYTHON) 🍟")
    print("=" * 65)
    print(f"Serving Game from: {DIRECTORY}")
    print(f"URL: http://localhost:{PORT}/game.html")
    print("Press Ctrl+C to stop.")
    print("=" * 65)

    Timer(1.0, lambda: webbrowser.open(f"http://localhost:{PORT}/game.html")).start()

    with socketserver.TCPServer(("", PORT), McDoHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server. Natalie is exploding.")
            httpd.server_close()

def run_terminal_game():
    print("=" * 65)
    print("🍟 NATALIE'S ANNULAIRE — TERMINAL TEXT-RPG 🍟")
    print("=" * 65)
    lang = input("Choose Language (EN / FR) [EN]: ").strip().upper()
    is_fr = lang == 'FR'

    print(LORE["intro_fr"] if is_fr else LORE["intro_en"])

    # STAGE 1: FRONT ENTRANCE & CLEMENT
    input("\n[Enter to walk inside Mc'Do through the front glass doors / Entrée pour entrer au Mc'Do]...")
    print("\n📍 " + ("COMPTOIR D'ACCUEIL & CAISSE #3" if is_fr else "FRONT LOBBY & REGISTER #3"))
    if is_fr:
        print("Clement est posté à la caisse #3. Le bureau de Natalie sur la gauche a une grande arche 100% ouverte !")
        print("Clement : « Wesh frère ! Bienvenue au Mc'Do ! Son bureau est grand ouvert sur la gauche ! »")
        print("« Mais la chambre froide est cadenassée, et personne ne connaît le code du boîtier de clés ! »")
        print("« Je fermais le comptoir et j'avais besoin de frites, je lance une tournée et m'absente deux secondes... »")
        print("« Et elle a viré les frites de la friteuse ! Il restait 40 secondes au chrono et plus UNE SEULE frite dans l'huile ! »")
        print("« Natalie a garé son monospace pourri sur le parking arrière, à l'opposé du bâtiment, près de la benne ! »")
        print("« L'Officier Miller est garé là-bas aussi à manger des Big Macs. Sors par la porte arrière et va lui parler ! »")
    else:
        print("Clement is stationed at Register #3. Natalie's office corridor on the left is wide open and unobstructed!")
        print("Clement: \"Yo bro! Welcome inside! Natalie's office is right there on the left through that open archway!\"")
        print("« But the freezer is locked tight, and nobody knows the PIN to the breakroom wall lockbox! »")
        print("« Closing up front at comptoir and I needed fries, so I start to fry some fries and went away for a sec... »")
        print("« And she removed the fries from the fryer! 40 seconds left on the timer and no fucking fries in the oil left! »")
        print("« Natalie parked her beat-up minivan in the back parking lot on the opposite side, next to the dumpster! »")
        print("« Officer Miller is parked back there too eating cold Big Macs. Head out the back door and talk to him! »")

    # STAGE 2: BACK PARKING LOT & POLICE CROWBAR
    input("\n[Enter to head out back to the parking lot on the opposite side / Entrée pour aller sur le parking arrière]...")
    print("\n📍 " + ("PARKING ARRIÈRE (À L'OPPOSÉ DU BÂTIMENT)" if is_fr else "BACK PARKING LOT (OPPOSITE SIDE OF MC'DO)"))
    if is_fr:
        print("Une voiture de police est garée, gyrophares allumés. L'Officier Miller mange un Big Mac froid.")
        print("Officier Miller : « Gamin, Natalie a appelé le 17 SEPT FOIS ce soir ! »")
        print("« Tu veux la troller avec son vieux doigt coupé de 2019 ?! (Explose de rire) Prends ce pied-de-biche confisqué ! »")
        print("« Force la boîte à gants de son monospace pourri et le container poubelle juste ici ! »")
        print("🔧 Vous obtenez le PIED-DE-BICHE !")
    else:
        print("A police cruiser is parked with flashing red and blue lights. Officer Miller is eating a cold Big Mac.")
        print("Officer Miller: \"Kid, Natalie called 911 SEVEN TIMES tonight!\"")
        print("« You're trolling her with her 2019 severed annulaire?! (Laughs uncontrollably) Take this police crowbar! »")
        print("« Pry open the glovebox of her dented minivan and the industrial dumpster right here in the back lot! »")
        print("🔧 You obtained the POLICE CROWBAR!")

    # STAGE 3: PRY MINIVAN & DUMPSTER
    input("\n[Enter to pry open Natalie's minivan & the dumpster / Entrée pour forcer le monospace et la benne]...")
    if is_fr:
        print("🚗 Vous forcez la boîte à gants du monospace bordeaux de Natalie avec le pied-de-biche !")
        print("📝 Vous trouvez le post-it : « Rappel : Le code du boîtier mural est [ 0 0 4 0 ] (les 40s avant la fin des frites). »")
        print("🗑️ Vous faites sauter le cadenas de la benne poubelle ! Un raton-laveur s'enfuit avec un nugget !")
        print("📖 Vous trouvez le Manuel 2019 : Natalie confirme que son annulaire est dans le CARTON MCFLURRY #4 !")
        print("⚠️ Le manuel avertit : le carton est gelé dans un bloc de glace à -18°C ! Il faut des pinces, de l'huile bouillante et des gants !")
    else:
        print("🚗 You pry open the glovebox of Natalie's dented maroon minivan with the crowbar!")
        print("📝 You find her sticky note: \"Reminder: Wall lockbox PIN is [ 0 0 4 0 ] (the exact 40 seconds I pull fries).\"")
        print("🗑️ You pop the padlock of the industrial dumpster! A terrified raccoon bolts with a McNugget!")
        print("📖 You find the 2019 Handbook: Natalie scrawled that her severed finger is hidden in MCFLURRY CRATE #4!")
        print("⚠️ The handbook warns: Crate #4 is frozen solid at -18°C! You need tongs, boiling oil, and heavy rubber gloves!")

    # STAGE 4: KITCHEN TOOLS
    input("\n[Enter to return inside the kitchen to gather tools / Entrée pour récupérer les outils en cuisine]...")
    print("\n📍 " + ("CUISINE COMMERCIALE" if is_fr else "COMMERCIAL KITCHEN"))
    if is_fr:
        print("Arthur (au grill) : « Tu sais que le doigt est dans le carton #4 ?! Tiens mes grosses pinces en inox lourd ! »")
        print("Maxime (à la garniture) : « Prends ma louche d'huile de friture bouillante à 200°C pour faire fondre la glace instantanément ! »")
        print("Enzo (à la plonge) : « Prends mes gros gants industriels en caoutchouc résistant au grand froid (-18°C) ! »")
    else:
        print("Arthur (at grill): \"You know the finger is in Crate #4?! Take my heavy stainless steel tongs!\"")
        print("Maxime (at assembly): \"Take my ladle of boiling 400-degree fry oil to melt the McFlurry ice block!\"")
        print("Enzo (at sink): \"Take my heavy industrial rubber gloves to survive the sub-zero -18°C frost!\"")

    # STAGE 5: BREAKROOM LOCKBOX
    input("\n[Enter to unlock the breakroom wall safe / Entrée pour déverrouiller le boîtier mural]...")
    print("\n📍 " + ("SALLE DE PAUSE" if is_fr else "STAFF BREAKROOM"))
    if is_fr:
        print("Julien : « Le code c'est bien 0040 ! »")
        print("🔑 Vous tapez 0040 sur le clavier du boîtier mural. CLIC ! Vous obtenez le Passe-Partout de la chambre froide !")
    else:
        print("Julien: \"The code is definitely 0040!\"")
        print("🔑 You punch in 0040 on the wall lockbox keypad. CLICK! You obtained the Freezer Master Key!")

    # STAGE 6: SEALED FREEZER VAULT & EXTRACTION
    input("\n[Enter to unlock the fully enclosed freezer room / Entrée pour ouvrir la chambre froide hermétique]...")
    print("\n📍 " + ("CHAMBRE FROIDE HERMÉTIQUE (-18°C)" if is_fr else "SEALED WALK-IN FREEZER VAULT (-18°C)"))
    if is_fr:
        print("La chambre froide est 100% scellée par 4 murs solides. Vous déverrouillez la lourde porte blindée avec la clé !")
        print("Un brouillard de givre s'échappe ! Vous trouvez le carton McFlurry #4 au fond sur le sol glacé.")
        print("Vous enfilez les gants d'Enzo, versez l'huile bouillante de Maxime et arrachez l'annulaire avec les pinces d'Arthur !")
        print("💍 L'annulaire fossilisé de 2019 brille avec sa bague en toc 'Meilleure Manager' de chez Claire's !")
    else:
        print("The freezer is 100% sealed by solid walls on all 4 sides. You unlock the heavy vault door with the master key!")
        print("A cloud of sub-zero frost pours out! You locate McFlurry crate #4 on the icy blue floor.")
        print("You put on Enzo's gloves, pour Maxime's boiling oil, and yank out the finger with Arthur's tongs!")
        print("💍 The fossilized 2019 annulaire gleams with the tarnished Claire's 'Best Manager' ring!")

    # STAGE 7: PACKAGING AT DRIVE-THRU
    input("\n[Enter to bring the finger to Chloe at the drive-thru / Entrée pour apporter le doigt à Chloe au Drive]...")
    if is_fr:
        print("🎁 Chloe : « PUTAIN ! Il est tout dur, givré à l'Oreo McFlurry avec sa fausse bague en toc ! »")
        print("Chloe l'emballe dans une Boîte Happy Meal Dorée avec un ruban rouge : 'Trophée de la Directrice du Siècle' !")
    else:
        print("🎁 Chloe: \"HOLY SHIT! It's rock-hard, blue, frosted in McFlurry ice with her Claire's fake ring!\"")
        print("Chloe packages it into a Golden Happy Meal Box with a satin red ribbon: 'Manager of the Century Award'!")

    # STAGE 8: CLIMAX IN NATALIE'S OFFICE
    input("\n[Enter to march through the wide open corridor into Natalie's office / Entrée pour entrer dans le bureau de Natalie]...")
    print("\n" + ("=" * 65))
    if is_fr:
        print("Vous entrez librement dans son bureau par la grande arche ouverte.")
        print("Vous posez la boîte dorée sur son bureau : « Félicitations Natalie, pour 5 ans de tyrannie exemplaire. »")
        print("Natalie ouvre le ruban... et pousse un hurlement d'horreur en voyant son propre doigt fossilisé de 2019 !")
        print("« MON ANNULAIRE D'IL Y A 5 ANS ?! VOUS VOUS FOUTEZ DE MA GUEULE DEVANT TOUT LE MONDE ?! »")
        print("« J'AI RETIRÉ CES FRITES 40 SECONDES EN AVANCE PARCE QUE LE MOU ÇA FORGE LE CARACTÈRE ! »")
        print("Sa tension monte à 9000 bars ! Elle gonfle comme une montgolfière écarlate !")
        print("💥 KABOOOOOOOOOOOOOOM ! 💥")
        print("NATALIE EXPLOSE EN UN GEYSER DE 90 NUGGETS, D'HUILE ET DE TICKETS 100% GRATUITS !")
        print("Clement, Arthur, Karim, Maxime, Enzo, Julien, Luca, Chloe et les policiers dansent sous une pluie de nuggets !")
    else:
        print("You walk freely into her office through the wide open corridor.")
        print("You place the golden box on her desk: \"Happy Anniversary Natalie, for 5 years of exemplary tyranny.\"")
        print("Natalie unties the satin ribbon... and screams in absolute horror at her shriveled 2019 ring finger!")
        print("« IS THIS MY ANNULAIRE FROM 5 YEARS AGO?! YOU TROLLED ME IN FRONT OF MY ENTIRE STAFF?! »")
        print("« I PULLED THOSE FRIES 40 SECONDS EARLY BECAUSE CRISPINESS IS WAGE THEFT! »")
        print("Her blood pressure hits 9000 PSI! Her veins bulge! Her body swells like an angry cherry-red balloon!")
        print("💥 KABOOOOOOOOOOOOOOM! 💥")
        print("NATALIE LITERALLY EXPLODES INTO A GEYSER OF 90 NUGGETS, HOT FRY OIL, AND 100% OFF COUPONS!")
        print("Clement, Arthur, Karim, Maxime, Enzo, Julien, Luca, Chloe, and both Police Officers celebrate in the rain of nuggets!")
    print("=" * 65)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == '--cli':
        run_terminal_game()
    else:
        run_server()
