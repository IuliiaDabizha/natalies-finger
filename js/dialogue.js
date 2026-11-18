// ============================================================
//  js/dialogue.js — The Ultimate Mc'Do Heist Script & Banter Engine
//  Set in Mc'Do Tassin la Demi-Lune (Lyon), France
//  Interactive Dialogues • Pure Mockery of Natalie • Word Fights
//  Lore: Immaculate Restaurant, Legendary Hardworking Workers,
//        and Natalie, the Unhinged Toxic Micromanager.
// ============================================================

window.LANG = 'en';

window.GAME_LORE = {
  en: {
    hudMission: "🎯 STEP 1: TALK TO CLEMENT AT FRONT COUNTER OR CLARA IN LOBBY",
    rageLabel: "NATALIE BP:",
    compass: "📍 Mc'Do Tassin la Demi-Lune (Lyon)",
    interact: "PRESS [E] TO INTERACT",
    next: "[ Press E / Space / Enter to continue ▶ ]",
    notif: "📦 FOUND: ",

    clement: {
      name: "Clement",
      role: "Front Counter Lead (Exhausted & Alert)",
      dialogue_quest: {
        intro: [
          "Psst! Keep your voice down! Natalie is in her corner office glaring through the HD fisheye cameras like a psychotic pigeon dipped in paprika.",
          "Look around: our floors are buffed like mirrors and our counters are sanitized to surgical grade. We work our asses off every single night.",
          "Yet Natalie spent two hours yesterday accusing me of 'smiling too seductively at customers' and demanded I tape my eyebrows down with packing tape so I look 'professionally miserable'! What do you want at 11:45 PM?"
        ],
        prompt: "Choose your response to Clement carefully:",
        choices: [
          {
            label: "A) \"Natalie posted a memo stating any cashier who clocks out 15 minutes before closing has their break pay docked.\"",
            isSpy: true,
            kickOutReason: "That 'memo' was Natalie's verbal trap leaked only to her corporate informants to test who spreads unverified rumors! Clement yelled: 'CORPORATE INFORMANT DETECTED!' and shoved you out the front doors!"
          },
          {
            label: "B) \"Register #3's thermal receipt printer is feeding 4mm off-center, but your counter sanitation log meets Rhône health codes.\"",
            isSpy: true,
            kickOutReason: "Quoting Rhône health code logs and millimetric printer feed margins is verbatim regional audit jargon! Clement panicked, pulled the alarm, and shouted: 'REGIONAL AUDITOR NARC!'"
          },
          {
            label: "C) \"I watched Natalie on CCTV hiding behind the drink fountain sniffing empty bags looking for stolen fry aroma, before she stole your tip jar to buy rhinestones for her Claire's hair clips!\"",
            isSpy: false,
            reply: [
              "BAHAHAHA! SHE LITERALLY SNIFFED EMPTY BAGS! That cheap, psychotic goblin! She really stole our tip jar for 2-euro plastic rhinestones!",
              "Bro, you see right through that troll! You're the real deal!",
              "Listen: Natalie locked the back service door into the kiosk security grid. Talk to Clara right behind you in the dining lobby!",
              "Clara has the Bistro Pass and knows how to crash Kiosk #4 to drop the alarm so you can slip out to Officer Miller in the parking lot!"
            ]
          }
        ]
      },
      dialogue_done: [
        "Go talk to Clara in the lobby! If you actually make Natalie explode, I'll sneak you 20 tubs of barbecue sauce!"
      ]
    },

    clara: {
      name: "Clara",
      role: "Dining Room Host & Packaging Master",
      dialogue_quest: {
        intro: [
          "Welcome to Mc'Do Tassin la Demi-Lune! Notice how every table is wiped spotless, chairs aligned, and trash sorted to perfection?",
          "We take massive pride in our restaurant. The only nightmare here is Natalie: yesterday she spent two hours with a plastic school protractor measuring the chairs, and when table 4 was rotated 2 degrees off, she screamed at a potted artificial fern for 'insubordination'!",
          "She's been sending fake friendly customers to test our loyalty. What's your business here tonight?"
        ],
        prompt: "Answer Clara's loyalty test:",
        choices: [
          {
            label: "A) \"Your dining room customer dwell time is 18.2 minutes, which exceeds the regional quick-service benchmark.\"",
            isSpy: true,
            kickOutReason: "You rattled off quick-service corporate dwell-time benchmarks! Clara spotted you as a corporate compliance spy immediately and chased you out with her mop!"
          },
          {
            label: "B) \"Natalie told the regional director that the lobby was untidy yesterday, despite three complete sanitations.\"",
            isSpy: true,
            kickOutReason: "Natalie never speaks to the regional director on Tuesdays—that was a fake corporate honeypot planted to catch loose lips! Clara gasped: 'Only Natalie's pet rat repeats that Tuesday rumor!' and kicked you out!"
          },
          {
            label: "C) \"Natalie spent 45 minutes screaming at a plastic artificial fern in the lobby, convinced its fake leaves were rolling their eyes at her!\"",
            isSpy: false,
            reply: [
              "OH MY GOD YES! She literally threatened to write up a FAKE PLASTIC FICUS! She's the dumbest, most toxic manager in all of Lyon!",
              "You truly understand how completely unhinged Natalie is! You're here to liberate us!",
              "Take my official STAFF BISTRO PASS! You need it to navigate the kitchen corridors.",
              "First, go over to Kiosk #4 and overload it with 99 burgers to disable Natalie's rear door sensor. Then go out the back service door to find Officer Miller in the parking lot!"
            ]
          }
        ]
      },
      dialogue_done: [
        "Once you rescue that frozen fossilized finger from the freezer, bring it straight to me! I'll wrap it in a 24K Golden Happy Meal Box with a crimson ribbon!"
      ],
      dialogue_package: [
        "HOLY SHIT! You actually pried it out of the sub-zero ice block?!",
        "It's blue, rock-solid, smelling like 2019 Oreo McFlurry, and still wearing her tacky Claire's 'Best Manager' ring! PEAK COMEDY!",
        "Watch this: I'm packaging it in this 24K GOLDEN HAPPY MEAL AWARD BOX with a fake certificate: 'EXEMPLARY DICTATOR OF THE CENTURY - TASSIN LA DEMI-LUNE'!",
        "Now march straight into her office through the wide west corridor and hand it to her face!"
      ]
    },

    police: {
      name: "Officer Miller",
      role: "Exhausted Police Officer (Back Lot)",
      dialogue_quest: {
        intro: [
          "Hold it right there! Officer Bob is snoring against the steering wheel with a cold nugget stuck to his forehead.",
          "Natalie called 911 seven times tonight. At 9 PM she called because her reflection in the glass door 'refused to step aside when she walked past', and she wanted us to arrest the window for aggravated trespassing!",
          "Every night we see her workers scrub this place like a palace while she screams at them from her minivan. What's your business in the back lot?"
        ],
        prompt: "Choose your answer to Officer Miller:",
        choices: [
          {
            label: "A) \"Natalie called 911 tonight because her reflection in the glass door didn't salute her, so she reported a suspicious trespassing woman with a bad paprika haircut.\"",
            isSpy: false,
            reply: [
              "(Chokes on his coffee laughing) BWAHAHAHA! You know about that?! She literally tried to file a restraining order AGAINST HER OWN REFLECTION!",
              "Kid, anyone who mocks that psychotic bowling ball is doing God's work for the town of Tassin!",
              "Take this heavy steel POLICE CROWBAR we confiscated from delinquents. It can pry open a bank vault.",
              "Use it to pry open her maroon beater minivan glovebox and crack that rusty dumpster padlock!"
            ]
          },
          {
            label: "B) \"Officer, this parking lot is private commercial property under Mc'Donald's France SAS jurisdiction. You must leave.\"",
            isSpy: true,
            kickOutReason: "You tried to lecture a French police officer on corporate commercial property jurisdiction! Miller handcuffed you to the delivery gate until sunrise!"
          },
          {
            label: "C) \"Natalie filed a formal complaint claiming the night patrol officers stole four hot apple pies.\"",
            isSpy: true,
            kickOutReason: "Miller knows the night shift only eats sundae cups, not apple pies! He suspected you were a corporate provocateur trying to bait a false police misconduct report and escorted you off the premises!"
          }
        ]
      },
      dialogue_done: [
        "Go pry that minivan glovebox and pop the dumpster! Make that tyrannical manager pop like a balloon!"
      ]
    },

    arthur: {
      name: "Arthur",
      role: "Grill Cook & Kitchen Craftsman",
      dialogue_quest: {
        intro: [
          "Careful around the grill! Look at this stainless steel: mirror-polished, zero carbon residue, pristine ventilation hoods.",
          "Our beef is 100% French Charolais seared to perfection. The only toxic element in this kitchen is Natalie: last week she stuck an ear thermometer into my armpit while I was searing meat, docked 15 minutes of pay, and claimed my body heat was 'radiating unauthorized calories into franchise air'!",
          "Natalie's paranoia is off the charts. Why should I trust someone standing in my kitchen?"
        ],
        prompt: "Respond to Arthur's grill dilemma:",
        choices: [
          {
            label: "A) \"According to Corporate Kitchen Manual Section 4, patties must be seared at exactly 177°C with double platen clamp.\"",
            isSpy: true,
            kickOutReason: "You cited corporate manual section numbers! Arthur roared: 'HEADQUARTERS TECH AUDITOR DETECTED!' and launched you through the kitchen swinging doors!"
          },
          {
            label: "B) \"Natalie blamed the grill smoke for melting her cheap drugstore mascara, then demanded you reimburse her 3 euros for eyeliner because 'the burgers committed cosmetic assault'!\"",
            isSpy: false,
            reply: [
              "BWAHAHAHA! She really cried over her 3-euro drugstore eyeliner! She's so pathetic and brain-dead!",
              "You actually know how ridiculous she is! You're one of us!",
              "Take my heavy STAINLESS STEEL GRILL TONGS! Rated for 5000°F and industrial bone-extraction!",
              "Next, talk to Lea at the prep line — you'll need her boiling fry oil ladle to melt the ice block in the freezer!"
            ]
          },
          {
            label: "C) \"Arthur, if you increase your patty flip frequency by 1.2 seconds, you can qualify for Natalie's 'Employee of the Month' bonus pin.\"",
            isSpy: true,
            kickOutReason: "Natalie's 'bonus pin' is a notorious scam she uses to cheat workers out of hydration breaks! Arthur saw right through you: 'CORPORATE SYCOPHANT!' and chased you out with grease tongs!"
          }
        ]
      },
      dialogue_done: [
        "Those tongs can bend titanium. Rip that fossilized finger right out of the crate!"
      ]
    },

    lea: {
      name: "Lea",
      role: "Prep Master & Assembly Artist",
      dialogue_quest: {
        intro: [
          "Hey! Mind the prep table — every sauce dispenser is calibrated, veggies sliced fresh, wrappers stacked to the exact millimeter.",
          "Our assembly line is cleaner than a Swiss watch factory. The only clown here is Natalie: yesterday she weighed dehydrated onion flakes on a pocket scale, convinced I put 14 specks instead of 12 to bankrupt the store, then licked a cheese slice to test its 'respect for hierarchy' and got mayo stuck in her bangs!",
          "She's been testing us with trick questions all evening. Who are you and what do you want?"
        ],
        prompt: "Choose your answer to Lea:",
        choices: [
          {
            label: "A) \"Natalie's pickle policy is scientifically calculated: exactly two crinkle-cut slices per burger ensures standard sodium balance.\"",
            isSpy: true,
            kickOutReason: "You defended pickle rationing with corporate nutritional doublespeak! Lea gasped: 'Only Natalie's pet rat defends pickle stinginess!' and dumped cold barbecue sauce all over you as you were kicked out!"
          },
          {
            label: "B) \"Natalie licked a slice of cheddar cheese to test its 'hierarchical loyalty', gagged, got mayonnaise stuck in her ugly paprika bangs, and blamed you for having spiteful tastebuds!\"",
            isSpy: false,
            reply: [
              "HAHAHA! She spent 20 minutes in the bathroom scrubbing mayo out of her hideous haircut! She's so embarrassing and ridiculous!",
              "You see right through all her psychological warfare! You're a true comrade!",
              "Take my 400°F BIOHAZARD FRY OIL LADLE! NATO classified it as a thermal weapon, but it melts frozen McFlurry dairy in 2 seconds!",
              "Now go talk to Natan at the dish pit — you need his heavy hazmat rubber gloves or your hands will get frostbite in the freezer!"
            ]
          },
          {
            label: "C) \"Under Franchise Clause 12, prep workers are strictly prohibited from storing non-regulation ladles near fry vats.\"",
            isSpy: true,
            kickOutReason: "You quoted Franchise Clause 12! Lea shouted: 'FRANCHISE COMPLIANCE INSPECTOR!' and the kitchen crew escorted you straight to the sidewalk!"
          }
        ]
      },
      dialogue_done: [
        "Pour that boiling oil right over crate #4! That ancient Oreo ice won't stand a chance!"
      ]
    },

    natan: {
      name: "Natan",
      role: "Sanitation Specialist & Dish Pit Survivor",
      dialogue_quest: {
        intro: [
          "Brrrr... Look at this dish pit: stainless steel scrubbed until it shines like sterling silver, every tray sterilized to hospital standard.",
          "We do flawless work, but Natalie unplugged the hot water because she claims warm water makes workers 'soft and decadent', while she sat in her office with two space heaters blowing directly onto her hairy ankles!",
          "Natalie loves sending auditors to verify if workers are 'coping with austerity'. What are you doing here?"
        ],
        prompt: "Respond to Natan's cold water test:",
        choices: [
          {
            label: "A) \"Cold water washing is documented to increase dish detergent surfactant efficiency while lowering the store's carbon footprint.\"",
            isSpy: true,
            kickOutReason: "You recited corporate greenwashing propaganda to justify freezing an employee! Natan dumped an icy bucket of dishwater on your head and threw you out into the night!"
          },
          {
            label: "B) \"Natalie claimed warm water makes workers 'soft and decadent' to pocket a gas bonus, while she ran two personal space heaters pointed directly at her hairy ankles in her office!\"",
            isSpy: false,
            reply: [
              "THAT CHEAP, GREEDY GREMLIN! Two heaters on her hairy ankles while my hands turn blue! Thank you for exposing that psychotic hypocrite!",
              "You are 100% on our side!",
              "Take my NUCLEAR-GRADE RUBBER HAZMAT GLOVES! They smell like old grease, but they block -50°C frostbite!",
              "Now go to the breakroom and talk to Raphael — he guards the wall safe with the Freezer Master Key!"
            ]
          },
          {
            label: "C) \"Your tray wash throughput is 42 trays per hour, which is 6 trays below the Lyon metropolitan benchmark.\"",
            isSpy: true,
            kickOutReason: "You tracked his tray throughput like an efficiency consultant! Natan brandished his scrub brush and shouted: 'MANAGEMENT NARC!' as you were ejected!"
          }
        ]
      },
      dialogue_done: [
        "Those gloves will protect your hands from the sub-zero freezer chill. Go get her finger!"
      ]
    },

    raphael: {
      name: "Raphael",
      role: "Breakroom Guardian & Veteran Worker",
      dialogue_quest: {
        intro: [
          "Shhh! Keep your voice down. The breakroom is tidy, recycling sorted, everything clean. I'm on a legal 3-minute break.",
          "Natalie mounted an acoustic decibel meter outside the door. If anyone laughs, she writes a report about 'disruptive joy'.",
          "She's been trapping people with fake security questions all day. Why should I tell you anything about the safe?"
        ],
        prompt: "Answer Raphael:",
        choices: [
          {
            label: "A) \"Breaks during closing shifts exceeding 120 seconds require prior written authorization on Form B-12.\"",
            isSpy: true,
            kickOutReason: "Form B-12 is Natalie's favorite fake bureaucratic intimidation document! Raphael smashed his coffee mug, yelled: 'CORPORATE RAT!', and tossed you out the emergency exit!"
          },
          {
            label: "B) \"Natalie set the wall safe lockbox code to [ 0 0 4 0 ] because that's how many times she backed her beat-up minivan into the dumpster, and she wrote the PIN on a sticky note blaming the dumpster for having an attitude!\"",
            isSpy: false,
            reply: [
              "HOLY SHIT! You found her glovebox note?! She literally blamed the metal dumpster for having an attitude and moving into her bumper!",
              "That woman is an absolute circus clown! The crew has united!",
              "The lockbox PIN is indeed [ 0 0 4 0 ]! Punch it into the wall safe behind me to grab the MASTER KEY!",
              "Before you open the freezer, talk to Luca at the drive-thru for his jammer headset so Natalie's office alarm doesn't catch you!"
            ]
          },
          {
            label: "C) \"Raphael, HR has authorized a 5-minute break extension if you sign this employee wellness acknowledgment form.\"",
            isSpy: true,
            kickOutReason: "Natalie's HR wellness form is a sting operation to waive overtime rights! Raphael called you a fraudulent spy and slammed the security door in your face!"
          }
        ]
      },
      dialogue_done: [
        "Punch in [ 0 0 4 0 ] on the wall lockbox to take the Freezer Master Key!"
      ]
    },

    luca: {
      name: "Luca",
      role: "Drive-Thru Specialist & Tech Wizard",
      dialogue_quest: {
        intro: [
          "Drive-thru frequency open... Look at our queue times: lightning fast, bags double-checked, drinks sealed tight. Flawless execution.",
          "The problem is Natalie: she put on the drive-thru headset yesterday to show off her 'executive sales dominance', screamed at a customer asking for ketchup, choked on her own chewing gum in rage, and a customer had to perform the Heimlich through the car window!",
          "She's been testing headsets on different frequencies. How do you propose bypassing her office alarm?"
        ],
        prompt: "Answer Luca's frequency question:",
        choices: [
          {
            label: "A) \"Your drive-thru speaker response delay was clocked at 4.2 seconds, triggering an automatic demerit on your shift review.\"",
            isSpy: true,
            kickOutReason: "You complained about drive-thru response delays! Luca slammed the sliding window on your fingers and activated the car siren to blast you out!"
          },
          {
            label: "B) \"Natalie tried to prove her 'alpha sales dominance' on the headset, choked on her chewing gum, and a drive-thru customer had to Heimlich her through the car window while you rewired Channel 3!\"",
            isSpy: false,
            reply: [
              "I WAS THERE! The customer literally Heimlich'd her through the drive-thru window! Funniest shit I've ever seen in my life!",
              "Take my PIRATE DRIVE-THRU JAMMER HEADSET!",
              "It broadcasts a continuous loop of impossible orders: 'Can I get a Big Mac without bread, meat, or sauce?' and 'Is your tap water vegan?'.",
              "Natalie will be screaming at her monitors, completely deaf to the freezer door opening! Go unlock that vault and pry the finger!"
            ]
          },
          {
            label: "C) \"Operating an uncertified secondary headset on Mc'Donald's wireless spectrum violates French ARCEP telecom regulations.\"",
            isSpy: true,
            kickOutReason: "You quoted French ARCEP telecom regulations! Luca shouted: 'HEADQUARTERS SNITCH!' and booted you out onto Avenue du 8 Mai 1945!"
          }
        ]
      },
      dialogue_done: [
        "The jammer headset is blasting fake vegan water orders into Natalie's office. She's completely distracted!"
      ]
    },

    car: {
      name: "Natalie's 2004 Beater Minivan",
      inspect_locked: "A rusted maroon minivan covered in 40 dents from backing into stationary trash cans. Bumper stickers: 'I DON'T PAY MINIMUM WAGE TO HEAR YOU BREATHE' and 'HONK IF YOU THINK DUMB MANAGERS ARE OPPRESSED'. Glovebox is locked — you need a crowbar.",
      inspect_pried: "CRUNCH! You pop open the glovebox! Inside: 47 unpaid Tassin parking tickets, a rotten pickle jar, an overdue invoice for bad drugstore hair dye, and Natalie's sticky note: 'Freezer wall lockbox PIN: [ 0 0 4 0 ] (number of times I backed into the dumpster because the dumpster has an attitude). Dock staff wages if they laugh.'"
    },

    dumpster: {
      name: "Industrial Biohazard Dumpster",
      inspect_locked: "A massive green dumpster sealed with rusted chains and a heavy padlock. The hardworking crew keeps the outside spotless, but Natalie locked the bin to hide her records. You need a crowbar to pop it.",
      inspect_opened: "SKRRRRK! Padlock snaps! Inside: Natalie's 2019 Diary of Pure Stupidity. Blood-red Sharpie: 'May 14, 2019: Threw a massive temper tantrum because a customer asked for a tap water cup. Slammed the cash drawer so hard I snapped off my own annulaire (ring finger). Refused to go to the hospital because bandages are for losers. Threw the finger into walk-in freezer McFlurry Crate #4 as a tax write-off!'"
    },

    natalie: {
      name: "Natalie (Store Manager)",
      role: "50yo Short Chubby Tyrant (Paprika Haircut)",
      idle: [
        "WHAT ARE YOU DOING IN MY PRIVATE OFFICE?! NO EMPLOYEES! NO CUSTOMERS! AND ABSOLUTELY NO 10% DISCOUNT COUPONS!",
        "I gave my youth to this Tassin franchise! I lost my annulaire five years ago and I don't give a damn! Pain is weakness leaving the balance sheet! GET OUT BEFORE I GARNISH YOUR WAGES IN THE AFTERLIFE!"
      ],
      finale: [
        "WHAT IS THIS LUXURY 24K GOLD BOX?! An executive award from Headquarters recognizing my tyrannical reign of terror over minimum-wage peasants?!",
        "(Rips off the red satin ribbon) Let me gaze upon my golden medal... WAIT. WHAT IS THIS FROZEN, WITHERED, DISGUSTING BLUE LOG WITH A 2-EURO CLAIRE'S RING?!",
        "...NO. NO NO NO! THIS IS MY OWN SEVERED ANNULAIRE FROM 2019! THE FINGER I SNAPPED OFF IN A TANTRUM OVER A FREE WATER CUP!",
        "YOU SNEAKY LITTLE TROLL! You broke into my walk-in freezer, melted my five-year-old Oreo McFlurry ice, and paraded my ugly shriveled digit in front of the entire crew?!",
        "And you told everyone about my 40 minivan dents?! My mayonnaise-stained paprika bangs?! My stolen tip jars?! Look at them laughing at me through the window!",
        "I AM NATALIE! I AM THE IMMORTAL DICTATOR OF TASSIN LA DEMI-LUNE! I DON'T GET TOPPLED BY TEENAGERS IN APRONS! I AM THE LAW OF THIS FRANCHISE!",
        "MY ARTERIES ARE BULGING! MY BLOOD PRESSURE HAS BROKEN 9000 PSI! STEAM IS ROARING OUT OF MY EARS LIKE A FREIGHT TRAIN! I AM EXPANDING LIKE A RANCID PAPRIKA ZEPLIN!",
        "CURSE YOU, TASSIN CREW! CURSE YOU, MINIMUM WAGE! I AM GOING OVERCRITICAL! GOODBYE CRUEL FRANCHISE! KABOOOOOOOOOOOOOM!"
      ]
    },

    items: {
      pass_bistro: "Clara's Staff Bistro Pass",
      crowbar: "Police Crowbar (Confiscated)",
      pin_note: "Secret PIN [ 0040 ] Sticky Note",
      handbook: "2019 Disciplinary Diary",
      tongs: "Arthur's 5000°F Stainless Tongs",
      ladle: "Lea's Boiling Fry Oil Ladle",
      gloves: "Natan's Nuclear Hazmat Gloves",
      key: "Raphael's Freezer Master Key",
      headset: "Luca's Drive-Thru Jammer Headset",
      finger: "Natalie's 2019 Fossilized Annulaire",
      gift_box: "24K Golden Happy Meal Award Box"
    },

    victory: {
      title: "💥 BOOOOOOOOM! NATALIE EXPLODED! 💥",
      desc: "Her rage exceeded 9000 PSI! Natalie swelled like a cherry-red paprika balloon, whistled like a steam train, and detonated into 90 flying golden McNuggets, hot oil, and 100% OFF crew discount coupons! Clement, Arthur, Clara, Lea, Natan, Raphael, Luca, and Officer Miller dance in the raining nuggets! You are crowned the Ultimate Mc'Do Troll Legend of Tassin la Demi-Lune!"
    }
  },

  fr: {
    hudMission: "🎯 ÉTAPE 1 : PARLE À CLEMENT AU COMPTOIR OU À CLARA DANS LE LOBBY",
    rageLabel: "TENSION NATALIE :",
    compass: "📍 Mc'Do Tassin la Demi-Lune (Lyon)",
    interact: "APPUYER SUR [E] POUR INTERAGIR",
    next: "[ Appuyez sur E / Espace / Entrée pour continuer ▶ ]",
    notif: "📦 OBTENU : ",

    clement: {
      name: "Clement",
      role: "Responsable Comptoir (Épuisé mais Vigilant)",
      dialogue_quest: {
        intro: [
          "Chuuut ! Baisse d'un ton. Natalie est dans son bureau en train de nous épier sur les caméras comme un pigeon psychotique trempé dans le paprika.",
          "Regarde notre restaurant : le carrelage brille comme un miroir, les comptoirs sont désinfectés comme des blocs opératoires. On bosse comme des chefs !",
          "Mais hier Natalie m'a accusé pendant 45 minutes de 'sourire trop séduisamment aux clients' et a exigé que je me scotche les sourcils pour avoir l'air 'professionnellement misérable' ! Tu veux quoi à 23h45 ?"
        ],
        prompt: "Choisis ta réponse à Clement très attentivement :",
        choices: [
          {
            label: "A) « Natalie a affiché une note disant que tout caissier dépointant 15 minutes avant la fermeture aura sa pause déduite. »",
            isSpy: true,
            kickOutReason: "Cette 'note' était un faux piège verbal que Natalie n'a raconté qu'à ses espions internes pour voir qui colporte les rumeurs ! Clement a crié : 'BALANCE DE DIRECTION DÉTECTÉE !' et vous a éjecté sur le trottoir !"
          },
          {
            label: "B) « L'imprimante ticket de la Caisse 3 dévie de 4mm, mais votre registre d'hygiène est conforme aux normes du Rhône. »",
            isSpy: true,
            kickOutReason: "Parler du registre d'hygiène du Rhône et du décalage millimétrique d'imprimante est le jargon exact des auditeurs régionaux ! Clement a paniqué : 'AUDITEUR DE CHICAGO EN COSTUME !' et a déclenché l'éjection !"
          },
          {
            label: "C) « J'ai vu Natalie sur les caméras se cacher derrière la machine à soda pour renifler les sacs vides, avant de voler votre boîte à pourboires pour s'acheter des strass chez Claire's ! »",
            isSpy: false,
            reply: [
              "HAHAHAHA ! ELLE RENIFLAIT LES SACS VIDES ?! Cette crevarde toxique nous a volé les pourboires pour des faux strass en plastique à 2 euros !",
              "T'as percé à jour ce monstre ! T'es vraiment là pour nous libérer !",
              "Écoute-moi bien : Natalie a verrouillé la porte arrière sur le réseau de sécurité des bornes. Va voir Clara juste derrière dans le lobby !",
              "Clara a le Pass-Bistro et sait comment court-circuiter la borne 4 pour couper l'alarme et te laisser sortir sur le parking arrière !"
            ]
          }
        ]
      },
      dialogue_done: [
        "Va voir Clara dans le lobby ! Si tu réussis à faire exploser Natalie, je t'offre 20 sauces Deluxe gratos !"
      ]
    },

    clara: {
      name: "Clara",
      role: "Accueil & Experte Packaging",
      dialogue_quest: {
        intro: [
          "Bienvenue au Mc'Do de Tassin la Demi-Lune ! Regarde nos tables : nettoyées au millimètre, fauteuils impeccables, tri sélectif parfait.",
          "On fait un travail exemplaire. Le seul cauchemar ici, c'est Natalie : hier elle a passé deux heures avec un rapporteur d'école en plastique pour mesurer l'angle des chaises, et quand la table 4 déviait de 2 degrés, elle a hurlé sur un faux ficus en plastique pour 'insubordination' !",
          "Elle envoie des faux clients sympas pour tester notre loyauté corporative. Qu'est-ce que tu fabriques ici ?"
        ],
        prompt: "Réponds au test de Clara :",
        choices: [
          {
            label: "A) « La durée moyenne de séjour de vos clients est de 18.2 minutes, ce qui dépasse le benchmark régional. »",
            isSpy: true,
            kickOutReason: "Vous avez sorti des ratios corporatifs de durée de séjour ! Clara vous a immédiatement identifié comme un espion de conformité et vous a chassé à grands coups de balai !"
          },
          {
            label: "B) « Natalie a dit au directeur régional que la salle était sale hier, malgré vos trois nettoyages complets. »",
            isSpy: true,
            kickOutReason: "Natalie ne parle jamais au directeur régional le mardi : c'était un piège d'audit interne pour démasquer les indics ! Clara s'est écriée : 'Seul un collabo de Natalie répète ce mensonge du mardi !' et vous a viré !"
          },
          {
            label: "C) « Natalie a passé 45 minutes à hurler sur une plante artificielle en plastique dans le lobby, persuadée que ses fausses feuilles levaient les yeux au ciel ! »",
            isSpy: false,
            reply: [
              "MON DIEU OUI ! Elle a littéralement menacé de coller un blâme à un FICUS EN PLASTIQUE ! C'est la manageuse la plus débile et toxique de tout Lyon !",
              "Tu comprends parfaitement son niveau de démence ! Tu es notre sauveur !",
              "Prends mon PASS-BISTRO OFFICIEL D'ÉQUIPIÈRE ! Il te permet de circuler librement dans les couloirs du personnel.",
              "Va saboter la borne #4 avec 99 burgers pour désactiver l'alarme de la porte arrière, puis sors sur le parking arrière parler à l'Officier Miller !"
            ]
          }
        ]
      },
      dialogue_done: [
        "Dès que t'as arraché le doigt givré de Natalie du congélo, ramène-le moi ! Je vais lui préparer un emballage 24K collector avec un ruban rouge !"
      ],
      dialogue_package: [
        "PUTAIN MAIS TU L'AS VRAIMENT DÉTERRÉ ?!",
        "Il est bleu schtroumpf, dur comme un diamant, sent le McFlurry 2019 et porte encore sa bague 'Meilleure Directrice' de chez Claire's ! C'est le chef-d'œuvre du siècle !",
        "Regarde ça : je te le scelle dans cette BOÎTE HAPPY MEAL DORÉE 24K avec un faux diplôme 'TYRAN EXEMPLAIRE DU SIÈCLE - DIVISION TASSIN' !",
        "Fonce droit dans son bureau par la grande arche ouest et offre-lui son trophée !"
      ]
    },

    police: {
      name: "Officier Miller",
      role: "Policier Épuisé (Parking Arrière)",
      dialogue_quest: {
        intro: [
          "Halte là ! L'Officier Bob dort sur le volant avec un nugget froid collé sur le front.",
          "Natalie a appelé le 17 sept fois ce soir. À 21h, elle a appelé parce que son reflet dans la porte vitrée 'refusait de s'écarter quand elle passait', et elle voulait qu'on arrête la vitre pour violation de domicile aggravée !",
          "Chaque nuit on voit ces pauvres équipiers récurer le resto comme des chefs pendant qu'elle leur hurle dessus depuis son monospace. Tu fais quoi sur le parking ?"
        ],
        prompt: "Choisis ta réponse à l'Officier Miller :",
        choices: [
          {
            label: "A) « Natalie a appelé le 17 ce soir parce que son reflet dans la vitre ne la saluait pas, et a signalé une rôdeuse suspecte avec une coupe au bol paprika hideuse. »",
            isSpy: false,
            reply: [
              "(S'étouffe de rire dans son café) HAHAHAHA ! Tu es au courant de ça ?! Elle a littéralement porté plainte CONTRE SON PROPRE REFLET MOCHE !",
              "Gamin, quiconque se fout de la gueule de cette boule de bowling hystérique fait œuvre de salubrité publique pour Tassin !",
              "Prends ce lourd PIED-DE-BICHE DE POLICE confisqué. Il peut ouvrir un coffre-fort de banque.",
              "Force la boîte à gants de son monospace garé en travers sur 3 places et fais sauter le cadenas de la benne à ordures !"
            ]
          },
          {
            label: "B) « Officier, ce parking est une propriété commerciale privée sous statut Mc'Donald's SAS. Vous devez quitter les lieux. »",
            isSpy: true,
            kickOutReason: "Vous avez voulu donner des leçons de juridiction commerciale à un policier municipal ! Miller vous a menotté à la barrière de livraison jusqu'à l'aube !"
          },
          {
            label: "C) « Natalie a déposé une plainte formelle affirmant que la patrouille de nuit avait volé quatre chaussons aux pommes. »",
            isSpy: true,
            kickOutReason: "Miller sait que la patrouille ne mange que des sundaes caramel, jamais de chaussons aux pommes ! Il a flairé une tentative de provocation corporative et vous a expulsé sur le champ !"
          }
        ]
      },
      dialogue_done: [
        "Explose sa boîte à gants et venge tout Tassin la Demi-Lune !"
      ]
    },

    arthur: {
      name: "Arthur",
      role: "Artisan Grilladin (Cuisine Étincelante)",
      dialogue_quest: {
        intro: [
          "Attention au grill ! Regarde cet inox : poli miroir, zéro résidu de graisse, hottes d'aération immaculées.",
          "Notre viande est du pur Charolais grillé à la perfection. Le seul poison ici, c'est Natalie : la semaine dernière elle m'a enfoncé un thermomètre auriculaire sous l'aisselle pendant que je cuisais, m'a retiré 15 minutes de paie, prétendant que ma chaleur corporelle 'rayonnait des calories non déclarées dans l'air corporatif' !",
          "Elle est parano au possible. Pourquoi je devrais te faire confiance en cuisine ?"
        ],
        prompt: "Réponds au dilemme de cuisson d'Arthur :",
        choices: [
          {
            label: "A) « Selon la Section 4 du Manuel Cuisine, les steaks doivent être saisis à 177°C avec pression de platen double. »",
            isSpy: true,
            kickOutReason: "Vous avez cité les sections du manuel de Chicago ! Arthur a hurlé : 'AUDITEUR TECHNIQUE INFILTRÉ !' et vous a propulsé à travers les portes battantes !"
          },
          {
            label: "B) « Natalie a accusé la fumée du grill d'avoir fait couler son mascara discount, puis t'a réclamé 3 euros pour son eyeliner parce que 'les steaks ont commis une agression cosmétique' ! »",
            isSpy: false,
            reply: [
              "HAHAHAHA ! Elle a vraiment pleurniché pour son eyeliner à 3 balles de supermarché ! Quelle pauvre folle finie !",
              "Tu sais exactement à quel point elle est ridicule ! Tu es des nôtres !",
              "Prends mes PINCES EN INOX LOURD trempé à 5000°C ! Avec ça, tu arracherais une dent à un T-Rex !",
              "Va ensuite voir Lea à l'assemblage : il te faut sa louche d'huile bouillante pour faire fondre la glace dans la chambre froide !"
            ]
          },
          {
            label: "C) « Arthur, si tu accélères la rotation des steaks de 1.2s, tu pourras gagner le badge 'Employé du Mois' de Natalie. »",
            isSpy: true,
            kickOutReason: "Le 'badge bonus' de Natalie est une arnaque connue pour sucrer les pauses d'hydratation ! Arthur s'est écrié : 'LÈCHE-BOTTES DU MANAGEMENT !' et vous a chassé !"
          }
        ]
      },
      dialogue_done: [
        "Ces pinces résistent à tout. Déracine ce doigt fossilisé sans pitié !"
      ]
    },

    lea: {
      name: "Lea",
      role: "Cheffe de Table d'Assemblage",
      dialogue_quest: {
        intro: [
          "Gare à la table ! Chaque distributeur est calibré, légumes coupés frais, emballages alignés au millimètre près.",
          "Notre ligne est plus propre qu'un laboratoire suisse. La seule clown ici, c'est Natalie : hier elle a pesé des oignons déshydratés sur une balance de poche, convaincue que j'avais mis 14 miettes au lieu de 12 pour ruiner la franchise, puis a léché une tranche de cheddar pour tester son 'respect hiérarchique' et s'est foutu de la mayo dans sa frange !",
          "Elle nous teste avec des pièges toute la soirée. Qui es-tu et que veux-tu ?"
        ],
        prompt: "Choisis ta réponse à Lea :",
        choices: [
          {
            label: "A) « La politique de Natalie sur les cornichons est optimale : deux tranches ondulées assurent l'équilibre parfait en sodium. »",
            isSpy: true,
            kickOutReason: "Vous avez défendu le rationnement des cornichons avec la novlangue corporative ! Lea a crié : 'UN RAT DE LA DIRECTION !' et vous a aspergé de sauce avant de vous faire éjecter !"
          },
          {
            label: "B) « Natalie a léché une tranche de cheddar pour tester sa 'loyauté corporative', s'est étouffée, s'est collé de la mayonnaise dans sa coupe paprika hideuse, et t'a accusée d'avoir des papilles séditieuses ! »",
            isSpy: false,
            reply: [
              "HAHAHAHA ! Elle a passé 20 minutes dans les chiottes à se gratter la mayo de ses cheveux horribles ! Tellement ridicule !",
              "Tu as percé toute sa folie toxique ! T'es un vrai frère d'armes !",
              "Prends ma LOUCHE D'HUILE DE FRITURE À 200°C ! Classée arme thermique par l'OTAN, elle liquéfie la crème glacée en 2 secondes !",
              "Va direct voir Natan à la plonge : sans ses gros gants anti-gel, tes mains vont se briser en mille morceaux !"
            ]
          },
          {
            label: "C) « En vertu de la Clause Franchise 12, il est interdit de stocker des louches non réglementaires près des friteuses. »",
            isSpy: true,
            kickOutReason: "Vous avez cité la Clause Franchise 12 ! Lea a crié : 'INSPECTEUR DE FRANCHISE DÉGUISÉ !' et vous a fait expulser sur le trottoir !"
          }
        ]
      },
      dialogue_done: [
        "Verse l'huile bouillante sur le carton #4, la glace va s'évaporer instantanément !"
      ]
    },

    natan: {
      name: "Natan",
      role: "Maître Plongeur (Cuvettes Scintillantes)",
      dialogue_quest: {
        intro: [
          "Brrrr... Regarde ma plonge : inox frotté jusqu'à briller comme de l'argent massif, chaque plateau stérilisé comme à l'hôpital.",
          "On fait un boulot impeccable, mais Natalie a coupé l'eau chaude prétendant que l'eau tiède rend les employés 'mous et décadents', pendant qu'elle a deux radiateurs électriques pointés directement sur ses chevilles poilues dans son bureau !",
          "Natalie adore envoyer des contrôleurs vérifier si les équipiers 's'adaptent à l'austérité'. Tu viens faire quoi ?"
        ],
        prompt: "Réponds au test d'eau froide de Natan :",
        choices: [
          {
            label: "A) « Laver à l'eau froide augmente le pouvoir tensioactif du détergent tout en réduisant l'empreinte carbone du Mc'Do. »",
            isSpy: true,
            kickOutReason: "Vous avez récité le greenwashing corporatif pour justifier de geler un employé ! Natan vous a balancé un seau d'eau glacée sur la tête avant de vous expulser !"
          },
          {
            label: "B) « Natalie a affirmé que l'eau chaude rend les équipiers 'mous et décadents' pour gratter une prime de gaz, pendant qu'elle fait tourner deux chauffages d'appoint sur ses chevilles poilues ! »",
            isSpy: false,
            reply: [
              "CETTE GRENOUILLE D'AUSTÉRITÉ INFÂME ! Deux chauffages sur ses chevilles poilues pendant qu'on a les doigts bleus !",
              "Merci d'avoir dénoncé cette hypocrite psychotique ! Tu es à 100% avec nous !",
              "Prends mes GANTS INDUSTRIELS EN NÉOPRÈNE NUCLÉAIRE ! Ça sent le bacon rance, mais ça bloque le froid polaire à -50°C !",
              "Fonce en salle de pause voir Raphael : c'est lui qui surveille le coffre mural avec la Clé Maîtresse !"
            ]
          },
          {
            label: "C) « Votre cadence de lavage est de 42 plateaux par heure, soit 6 de moins que la moyenne de la métropole lyonnaise. »",
            isSpy: true,
            kickOutReason: "Vous avez chronométré la plonge comme un consultant véreux ! Natan a brandi son goupillon et crié : 'MANAGEMENT NARC !' en vous éjectant !"
          }
        ]
      },
      dialogue_done: [
        "Ces gants te protègent jusqu'à -50°C. Récupère ce doigt de sorcière !"
      ]
    },

    raphael: {
      name: "Raphael",
      role: "Pilier de Salle de Pause & Vétéran",
      dialogue_quest: {
        intro: [
          "Chuuut ! Parle doucement. La salle de pause est propre, recyclage fait, silence respecté. Je prends mes 3 minutes légales.",
          "Natalie a installé un capteur acoustique dans le couloir. Si quelqu'un rigole, elle colle un rapport pour 'tapage d'équipe'.",
          "Elle piège tout le monde avec des fausses questions de sécurité. Pourquoi je devrais t'ouvrir le coffre ?"
        ],
        prompt: "Réponds à Raphael :",
        choices: [
          {
            label: "A) « Les pauses de fermeture dépassant 120 secondes exigent un accord écrit préalable sur Formulaire B-12. »",
            isSpy: true,
            kickOutReason: "Le formulaire B-12 est le faux document fétiche de Natalie pour terroriser les employés ! Raphael a crié au traître corporatif et vous a catapulté par la sortie de secours !"
          },
          {
            label: "B) « Natalie a mis le code [ 0 0 4 0 ] sur le coffre parce que c'est le nombre de fois où elle a embouti son monospace contre la benne ce mois-ci, et elle l'a noté sur un post-it en accusant la benne d'avoir une mauvaise attitude ! »",
            isSpy: false,
            reply: [
              "LA VACHE ! Tu as fouillé son monospace et trouvé son mot ?! Elle a vraiment accusé la benne à ordures d'avoir une mauvaise attitude et d'avoir sauté sur son pare-chocs !",
              "Cette femme est le clown le plus phénoménal de tout le département ! Toute l'équipe est unie !",
              "Le code est bien [ 0 0 4 0 ] ! Tape-le sur le boîtier mural derrière moi pour choper la CLÉ MAÎTRESSE !",
              "Mais avant d'entrer dans la chambre froide, va voir Luca au Drive pour son casque pirate afin d'aveugler l'alarme du bureau de Natalie !"
            ]
          },
          {
            label: "C) « Raphael, les RH autorisent une extension de pause de 5 minutes si tu signes ce document de bien-être au travail. »",
            isSpy: true,
            kickOutReason: "Le formulaire de bien-être RH de Natalie est un traquenard pour faire renoncer aux heures sup ! Raphael a crié au traître et a claqué la porte au nez !"
          }
        ]
      },
      dialogue_done: [
        "Tape [ 0 0 4 0 ] sur le boîtier mural pour prendre la Clé Maîtresse !"
      ]
    },

    luca: {
      name: "Luca",
      role: "As du Drive & Hacker Audio",
      dialogue_quest: {
        intro: [
          "Fréquence Drive ouverte... Regarde nos cadences : ultra-rapides, commandes vérifiées, sacs parfaitement fermés. Zéro faute.",
          "Le gros problème, c'est Natalie : elle a mis le casque hier pour montrer ses 'techniques de vente dominantes', a hurlé sur un client demandant des serviettes, s'est étouffée avec son chewing-gum de rage, et un client a dû lui faire la méthode de Heimlich à travers la portière !",
          "Elle scrute les fréquences audio du Drive. Comment tu comptes neutraliser son alarme de bureau ?"
        ],
        prompt: "Réponds à la question de fréquence de Luca :",
        choices: [
          {
            label: "A) « Le délai de réponse du haut-parleur Drive est mesuré à 4.2s, ce qui déclenche un malus sur votre évaluation. »",
            isSpy: true,
            kickOutReason: "Vous avez calculé les délais au chronomètre corporatif ! Luca a refermé le guichet en fanfare et déclenché l'alarme Drive pour vous dégager !"
          },
          {
            label: "B) « Natalie a voulu prouver sa 'domination commerciale' au Drive, s'est étouffée avec son chewing-gum, et un automobiliste a dû la secouer par la fenêtre pendant que tu déviais le Canal 3 ! »",
            isSpy: false,
            reply: [
              "J'Y ÉTAIS ! Le client l'a littéralement secouée à travers la fenêtre du Drive ! Le moment le plus magique de l'histoire du fast-food !",
              "Prends mon CASQUE BROUILLEUR SANS FIL DU DRIVE !",
              "Il balance en boucle des commandes impossibles : 'Est-ce que votre eau du robinet est certifiée sans gluten ?'.",
              "Natalie sera en train d'hurler sur son écran, sourde à l'ouverture de la chambre froide ! Fonce forcer le carton #4 et arracher son doigt !"
            ]
          },
          {
            label: "C) « L'usage d'un casque radio non homologué sur le spectre Mc'Do enfreint la réglementation télécom de l'ARCEP. »",
            isSpy: true,
            kickOutReason: "Vous avez brandi la réglementation télécom de l'ARCEP ! Luca a crié : 'ESPION DE CHIEN !' et vous a projeté direct sur l'Avenue du 8 Mai 1945 !"
          }
        ]
      },
      dialogue_done: [
        "Le casque pirate tourne en boucle dans le bureau de Natalie. Son cerveau est en surchauffe !"
      ]
    },

    car: {
      name: "Monospace 2004 de Natalie",
      inspect_locked: "Un monospace bordeaux pourri criblé de 40 bosses pour avoir percuté des poubelles immobiles. Autocollants : 'JE NE PAIE PAS LE SMIC POUR VOUS ENTENDRE RESPIRER' et 'KLAXONNE SI TU PENSES QUE LES DIRECTEURS SONT DES VICTIMES'. Boîte à gants verrouillée — il vous faut un pied-de-biche.",
      inspect_pried: "CRAC ! Vous forcez la boîte à gants ! À l'intérieur : 47 PV impayés de Tassin, un paquet de gâteaux rassis, une facture en retard de teinture discount pour cheveux, et le post-it : 'Code coffre mural chambre froide : [ 0 0 4 0 ] (40 fois où j'ai reculé dans la benne parce que la benne m'a manqué de respect). Retenue sur salaire si quelqu'un se marre.'"
    },

    dumpster: {
      name: "Benne Industrielle à Ordures",
      inspect_locked: "Une grande benne verte scellée par une chaîne rouillée et un gros cadenas. L'équipe garde l'extérieur nickel, mais Natalie a cadenassé la benne pour planquer ses archives. Il vous faut un pied-de-biche.",
      inspect_opened: "SKRRRRK ! Le cadenas saute ! À l'intérieur : le Journal de Pure Démence 2019 de Natalie. Écrit en Sharpie rouge sang : '14 mai 2019 : Caprice monumental parce qu'un gamin a demandé un jouet supplémentaire. Claqué le tiroir-caisse si fort que mon annulaire s'est arraché net. Refusé d'aller aux urgences car les pansements sont pour les faibles. Balancé le doigt dans le carton McFlurry #4 pour amortissement fiscal !'"
    },

    natalie: {
      name: "Natalie (Directrice)",
      role: "Tyran de 50 ans (Coupe Paprika)",
      idle: [
        "QU'EST-CE QUE VOUS FOUTEZ DANS MON BUREAU PRIVÉ ?! PAS D'EMPLOYÉS ! PAS DE CLIENTS ! ET INTERDICTION TOTALE DES BONS DE RÉDUCTION 10% !",
        "J'ai donné ma jeunesse à cette franchise de Tassin ! J'ai perdu mon annulaire il y a 5 ans et je m'en tape le coquillard ! La douleur, c'est de la faiblesse face au bilan comptable ! SORTEZ AVANT QUE JE SAISISSE VOTRE SALAIRE DANS L'AU-DELÀ !"
      ],
      finale: [
        "C'EST QUOI CETTE BOÎTE DE LUXE EN OR 24K ?! Un hommage du siège pour récompenser mon règne de terreur et mes avertissements abusifs ?!",
        "(Déchire le ruban de satin) Laissez-moi admirer ma médaille... ATTENDEZ. C'EST QUOI CE BOUT DE CHAIR BLEUÂTRE GIVRÉ AVEC CETTE BAGUE EN TOC À 2 EUROS DE CHEZ CLAIRE'S ?!",
        "...NON. NON NON NON ! C'EST MON PROPRE ANNULAIRE DE 2019 ! CELUI QUE J'AI SOUFFLÉ DE RAGE EN CLAQUANT LE TIROIR POUR UN GOBELET D'EAU !",
        "ESPÈCE DE TROLL MINABLE ! Tu as forcé ma chambre froide, fait fondre ma glace McFlurry Oreo vieille de 5 ans, et tu brandis mon doigt tout racorni devant toute l'équipe ?!",
        "Et tu leur as tout raconté ?! Mes 40 bosses sur le monospace ?! Ma frange trempée de mayonnaise ?! Mes vols de pourboires ?! Regardez-les qui se marrent derrière la vitre !",
        "JE SUIS NATALIE ! LA DICTATRICE INDÉTRÔNABLE DE TASSIN LA DEMI-LUNE ! JE NE ME LAISSE PAS RENVERSER PAR DES ÉQUIPIERS EN TABLIER ! JE SUIS LA LOI DU FRANCHISÉ !",
        "MES ARTÈRES VONT PÉTER ! MA TENSION VIENT DE PULVÉRISER LES 9000 BARS ! LA VAPEUR ME SORT DU CRÂNE COMME UNE LOCOMOTIVE ! JE GONFLE COMME UN DIRIGEABLE PAPRIKA POURRI !",
        "MAUDITE SOIS-TU, ÉQUIPE DE TASSIN ! MAUDIT SOIT LE SMIC ! SURCHAUFFE CRITIQUE ! ADIEU LE COMMERCE ! BOOOOOOOOOOOOOOM !"
      ]
    },

    items: {
      pass_bistro: "Pass-Bistro d'Équipière de Clara",
      crowbar: "Pied-de-biche de Police (Confisqué)",
      pin_note: "Post-it Secret Code [ 0040 ]",
      handbook: "Journal Disciplinaire 2019",
      tongs: "Pinces en Inox 5000°C d'Arthur",
      ladle: "Louche d'Huile Bouillante de Lea",
      gloves: "Gants Anti-Gel Nucléaires de Natan",
      key: "Clé Maîtresse de Raphael",
      headset: "Casque Pirate du Drive de Luca",
      finger: "Annulaire Fossilisé 2019 de Natalie",
      gift_box: "Boîte Cadeau Happy Meal Dorée 24K"
    },

    victory: {
      title: "💥 BOOOOOOOOM ! NATALIE A EXPLOSÉ ! 💥",
      desc: "Sa tension a dépassé les 9000 bars ! Natalie a gonflé comme un ballon paprika rouge rubis, sifflé comme une bouilloire atomique, et détoné en un geyser de 90 nuggets volants, d'huile chaude et de coupons de réduction -100% VIP ! Clement, Arthur, Clara, Lea, Natan, Raphael, Luca et l'Officier Miller dansent sous la pluie de nuggets dorés ! Vous êtes couronné la Légende Absolue du Foutage de Gueule de Tassin la Demi-Lune !"
    }
  }
};
