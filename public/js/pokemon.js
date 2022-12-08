// anything created in here will be accessible to any other
// script for this webapp without need for imports.
const DELIMITER = '_';
// layering: generation -> species -> cry -> forms sharing cry -> different species with cry
const POKEMON = [[
    "Bulbasaur", "Ivysaur", ["Venusaur", "Venusaur_Mega"],
    "Charmander", "Charmeleon", ["Charizard", "Charizard_Mega X", "Charizard_Mega Y"],
    "Squirtle", "Wartortle", ["Blastoise", "Blastoise_Mega"],
    "Caterpie", "Metapod", "Butterfree",
    "Weedle", "Kakuna", ["Beedrill", "Beedrill_Mega"],
    "Pidgey", "Pidgeotto", ["Pidgeot", "Pidgeot_Mega"],
    [["Rattata", "Rattata_Alola"]], [["Raticate", "Raticate_Alola"]],
    "Spearow", "Fearow",
    "Ekans", "Arbok",
    "Pikachu", [["Raichu", "Raichu_Alola"]],
    [["Sandshrew", "Sandshrew_Alola"]], [["Sandslash", "Sandslash_Alola"]],
    "Nidoran♀", "Nidorina", "Nidoqueen",
    "Nidoran♂", "Nidorino", "Nidoking",
    "Clefairy", "Clefable",
    [["Vulpix", "Vulpix_Alola"]], [["Ninetales", "Ninetales_Alola"]],
    "Jigglypuff", "Wigglytuff",
    "Zubat", "Golbat",
    "Oddish", "Gloom", "Vileplume",
    "Paras", "Parasect",
    "Venonat", "Venomoth",
    [["Diglett", "Diglett_Alola"]], [["Dugtrio", "Dugtrio_Alola"]],
    [["Meowth", "Meowth_Alola", "Meowth_Galar"]], [["Persian", "Persian_Alola"]],
    "Psyduck", "Golduck",
    "Mankey", "Primeape",
    [["Growlithe", "Growlithe_Hisui"]], [["Arcanine", "Arcanine_Hisui"]],
    "Poliwag", "Poliwhirl", "Poliwrath",
    "Abra", "Kadabra", ["Alakazam", "Alakazam_Mega"],
    "Machop", "Machoke", "Machamp",
    "Bellsprout", "Weepinbell", "Victreebel",
    "Tentacool", "Tentacruel",
    [["Geodude", "Geodude_Alola"]], [["Graveler", "Graveler_Alola"]], [["Golem", "Golem_Alola"]],
    [["Ponyta", "Ponyta_Galar"]], [["Rapidash", "Rapidash_Galar"]],
    [["Slowpoke", "Slowpoke_Galar"]], [["Slowbro", "Slowbro_Galar"], "Slowbro_Mega"],
    "Magnemite", "Magneton",
    [["Farfetch'd", "Farfetch'd_Galar"]],
    "Doduo", "Dodrio",
    "Seel", "Dewgong",
    [["Grimer", "Grimer_Alola"]], [["Muk", "Muk_Alola"]],
    "Shellder", "Cloyster",
    "Gastly", "Haunter", ["Gengar", "Gengar_Mega"],
    "Onix",
    "Drowzee", "Hypno",
    "Krabby", "Kingler",
    [["Voltorb", "Voltorb_Hisui"]], [["Electrode", "Electrode_Hisui"]],
    "Exeggcute", [["Exeggutor", "Exeggutor_Alola"]],
    "Cubone", [["Marowak", "Marowak_Alola"]],
    "Hitmonlee", "Hitmonchan",
    "Lickitung",
    "Koffing", [["Weezing", "Weezing_Galar"]],
    "Rhyhorn", "Rhydon",
    "Chansey",
    "Tangela",
    ["Kangaskhan", "Kangaskhan_Mega"],
    "Horsea", "Seadra",
    "Goldeen", "Seaking",
    "Staryu", "Starmie",
    [["Mr. Mime", "Mr. Mime_Galar"]],
    "Scyther",
    "Jynx",
    "Electabuzz", "Magmar",
    ["Pinsir", "Pinsir_Mega"],
    [["Tauros", "Tauros_Paldea Combat", "Tauros_Paldea Blaze", "Tauros_Paldea Aqua"]],
    "Magikarp", ["Gyarados", "Gyarados_Mega"],
    "Lapras",
    "Ditto",
    "Eevee", "Vaporeon", "Jolteon", "Flareon",
    "Porygon",
    "Omanyte", "Omastar",
    "Kabuto", "Kabutops",
    ["Aerodactyl", "Aerodactyl_Mega"],
    "Snorlax",
    [["Articuno", "Articuno_Galar"]], [["Zapdos", "Zapdos_Galar"]], [["Moltres", "Moltres_Galar"]],
    "Dratini", "Dragonair", "Dragonite",
    ["Mewtwo", "Mewtwo_Mega X", "Mewtwo_Mega Y"],
    "Mew"
], [
    "Chikorita", "Bayleef", "Meganium",
    "Cyndaquil", "Quilava", [["Typhlosion", "Typhlosion_Hisui"]],
    "Totodile", "Croconaw", "Feraligatr",
    "Sentret", "Furret",
    "Hoothoot", "Noctowl",
    "Ledyba", "Ledian",
    "Spinarak", "Ariados",
    "Crobat",
    "Chinchou", "Lanturn",
    "Pichu", "Cleffa", "Igglybuff",
    "Togepi", "Togetic",
    "Natu", "Xatu",
    "Mareep", "Flaaffy", ["Ampharos", "Ampharos_Mega"],
    "Bellossom",
    "Marill", "Azumarill",
    "Sudowoodo",
    "Politoed",
    "Hoppip", "Skiploom", "Jumpluff",
    "Aipom",
    "Sunkern", "Sunflora",
    "Yanma",
    [["Wooper", "Wooper_Paldea"]], "Quagsire",
    "Espeon", "Umbreon",
    "Murkrow",
    [["Slowking", "Slowking_Galar"]],
    "Misdreavus",
    "Unown",
    "Wobbuffet",
    "Girafarig",
    "Pineco", "Forretress",
    "Dunsparce",
    "Gligar",
    ["Steelix", "Steelix_Mega"],
    "Snubbull", "Granbull",
    [["Qwilfish", "Qwilfish_Hisui"]],
    ["Scizor", "Scizor_Mega"],
    "Shuckle",
    ["Heracross", "Heracross_Mega"],
    [["Sneasel", "Sneasel_Hisui"]],
    "Teddiursa", "Ursaring",
    "Slugma", "Magcargo",
    "Swinub", "Piloswine",
    [["Corsola", "Corsola_Galar"]],
    "Remoraid", "Octillery",
    "Delibird",
    "Mantine",
    "Skarmory",
    "Houndour", ["Houndoom", "Houndoom_Mega"],
    "Kingdra",
    "Phanpy", "Donphan",
    "Porygon2",
    "Stantler",
    "Smeargle",
    "Tyrogue", "Hitmontop",
    "Smoochum", "Elekid", "Magby",
    "Miltank",
    "Blissey",
    "Raikou", "Entei", "Suicune",
    "Larvitar", "Pupitar", ["Tyranitar", "Tyranitar_Mega"],
    "Lugia", "Ho-Oh",
    "Celebi"
], [
    "Treecko", "Grovyle", ["Sceptile", "Sceptile_Mega"],
    "Torchic", "Combusken", ["Blaziken", "Blaziken_Mega"],
    "Mudkip", "Marshtomp", ["Swampert", "Swampert_Mega"],
    "Poochyena", "Mightyena",
    [["Zigzagoon", "Zigzagoon_Galar"]], [["Linoone", "Linoone_Galar"]],
    "Wurmple", "Silcoon", "Beautifly", "Cascoon", "Dustox",
    "Lotad", "Lombre", "Ludicolo",
    "Seedot", "Nuzleaf", "Shiftry",
    "Taillow", "Swellow",
    "Wingull", "Pelipper",
    "Ralts", "Kirlia", ["Gardevoir", "Gardevoir_Mega"],
    "Surskit", "Masquerain",
    "Shroomish", "Breloom",
    "Slakoth", "Vigoroth", "Slaking",
    "Nincada", "Ninjask", "Shedinja",
    "Whismur", "Loudred", "Exploud",
    "Makuhita", "Hariyama",
    "Azurill",
    "Nosepass",
    "Skitty", "Delcatty",
    ["Sableye", "Sableye_Mega"], ["Mawile", "Mawile_Mega"],
    "Aron", "Lairon", ["Aggron", "Aggron_Mega"],
    "Meditite", ["Medicham", "Medicham_Mega"],
    "Electrike", ["Manectric", "Manectric_Mega"],
    "Plusle", "Minun",
    "Volbeat", "Illumise",
    "Roselia",
    "Gulpin", "Swalot",
    "Carvanha", ["Sharpedo", "Sharpedo_Mega"],
    "Wailmer", "Wailord",
    "Numel", ["Camerupt", "Camerupt_Mega"],
    "Torkoal",
    "Spoink", "Grumpig",
    "Spinda",
    "Trapinch", "Vibrava", "Flygon",
    "Cacnea", "Cacturne",
    "Swablu", ["Altaria", "Altaria_Mega"],
    "Zangoose", "Seviper",
    "Lunatone", "Solrock",
    "Barboach", "Whiscash",
    "Corphish", "Crawdaunt",
    "Baltoy", "Claydol",
    "Lileep", "Cradily",
    "Anorith", "Armaldo",
    "Feebas", "Milotic",
    [["Castform", "Castform_Sunny", "Castform_Rainy", "Castform_Snowy"]],
    "Kecleon",
    "Shuppet", ["Banette", "Banette_Mega"],
    "Duskull", "Dusclops",
    "Tropius",
    "Chimecho",
    ["Absol", "Absol_Mega"],
    "Wynaut",
    "Snorunt", ["Glalie", "Glalie_Mega"],
    "Spheal", "Sealeo", "Walrein",
    "Clamperl", "Huntail", "Gorebyss",
    "Relicanth",
    "Luvdisc",
    "Bagon", "Shelgon", ["Salamence", "Salamence_Mega"],
    "Beldum", "Metang", ["Metagross", "Metagross_Mega"],
    "Regirock", "Regice", "Registeel",
    ["Latias", "Latias_Mega"], ["Latios", "Latios_Mega"],
    ["Kyogre", "Kyogre_Primal"], ["Groudon", "Groudon_Primal"], ["Rayquaza", "Rayquaza_Mega"],
    "Jirachi",
    [["Deoxys", "Deoxys_Attack", "Deoxys_Defense", "Deoxys_Speed"]]
], [
    "Turtwig", "Grotle", "Torterra",
    "Chimchar", "Monferno", "Infernape",
    "Piplup", "Prinplup", "Empoleon",
    "Starly", "Staravia", "Staraptor",
    "Bidoof", "Bibarel",
    "Kricketot", "Kricketune",
    "Shinx", "Luxio", "Luxray",
    "Budew", "Roserade",
    "Cranidos", "Rampardos",
    "Shieldon", "Bastiodon",
    [["Burmy_Plant", "Burmy_Sandy", "Burmy_Trash"]], [["Wormadam_Plant", "Wormadam_Sandy", "Wormadam_Trash"]], "Mothim",
    "Combee", "Vespiquen",
    "Pachirisu",
    "Buizel", "Floatzel",
    "Cherubi", [["Cherrim_Overcast", "Cherrim_Sunny"]],
    [["Shellos_West Sea", "Shellos_East Sea"]], [["Gastrodon_West Sea", "Gastrodon_East Sea"]],
    "Ambipom",
    "Drifloon", "Drifblim",
    "Buneary", ["Lopunny", "Lopunny_Mega"],
    "Mismagius", "Honchkrow",
    "Glameow", "Purugly",
    "Chingling",
    "Stunky", "Skuntank",
    "Bronzor", "Bronzong",
    "Bonsly", "Mime Jr.", "Happiny",
    "Chatot",
    "Spiritomb",
    "Gible", "Gabite", ["Garchomp", "Garchomp_Mega"],
    "Munchlax",
    "Riolu", ["Lucario", "Lucario_Mega"],
    "Hippopotas", "Hippowdon",
    "Skorupi", "Drapion",
    "Croagunk", "Toxicroak",
    "Carnivine",
    "Finneon", "Lumineon",
    "Mantyke",
    "Snover", ["Abomasnow", "Abomasnow_Mega"],
    "Weavile", "Magnezone", "Lickilicky", "Rhyperior", "Tangrowth",
    "Electivire", "Magmortar",
    "Togekiss", "Yanmega",
    "Leafeon", "Glaceon",
    "Gliscor", "Mamoswine", "Porygon-Z", ["Gallade", "Gallade_Mega"],
    "Probopass", "Dusknoir", "Froslass",
    [["Rotom", "Rotom_Heat", "Rotom_Wash", "Rotom_Frost", "Rotom_Fan", "Rotom_Mow"]],
    "Uxie", "Mesprit", "Azelf",
    [["Dialga", "Dialga_Origin"]], [["Palkia", "Palkia_Origin"]],
    "Heatran",
    "Regigigas",
    [["Giratina_Altered", "Giratina_Origin"]],
    "Cresselia",
    "Phione", "Manaphy",
    "Darkrai",
    ["Shaymin_Land", "Shaymin_Sky"],
    "Arceus"
], [
    "Victini",
    "Snivy", "Servine", "Serperior",
    "Tepig", "Pignite", "Emboar",
    "Oshawott", "Dewott", [["Samurott", "Samurott_Hisui"]],
    "Patrat", "Watchog",
    "Lillipup", "Herdier", "Stoutland",
    "Purrloin", "Liepard",
    "Pansage", "Simisage", "Pansear", "Simisear", "Panpour", "Simipour",
    "Munna", "Musharna",
    "Pidove", "Tranquill", "Unfezant",
    "Blitzle", "Zebstrika",
    "Roggenrola", "Boldore", "Gigalith",
    "Woobat", "Swoobat",
    "Drilbur", "Excadrill",
    ["Audino", "Audino_Mega"],
    "Timburr", "Gurdurr", "Conkeldurr",
    "Tympole", "Palpitoad", "Seismitoad",
    "Throh", "Sawk",
    "Sewaddle", "Swadloon", "Leavanny",
    "Venipede", "Whirlipede", "Scolipede",
    "Cottonee", "Whimsicott",
    "Petilil", [["Lilligant", "Lilligant_Hisui"]],
    [["Basculin_Red", "Basculin_Blue", "Basculin_White"]],
    "Sandile", "Krokorok", "Krookodile",
    [["Darumaka", "Darumaka_Galar"]], [["Darmanitan_Standard", "Darmanitan_Zen", "Darmanitan_Galar Standard", "Darmanitan_Galar Zen"]],
    "Maractus",
    "Dwebble", "Crustle",
    "Scraggy", "Scrafty",
    "Sigilyph",
    [["Yamask", "Yamask_Galar"]], "Cofagrigus",
    "Tirtouga", "Carracosta",
    "Archen", "Archeops",
    "Trubbish", "Garbodor",
    [["Zorua", "Zorua_Hisui"]], [["Zoroark", "Zoroark_Hisui"]],
    "Minccino", "Cinccino",
    "Gothita", "Gothorita", "Gothitelle",
    "Solosis", "Duosion", "Reuniclus",
    "Ducklett", "Swanna",
    "Vanillite", "Vanillish", "Vanilluxe",
    [["Deerling_Spring", "Deerling_Summer", "Deerling_Autumn", "Deerling_Winter"]], [["Sawsbuck_Spring", "Sawsbuck_Summer", "Sawsbuck_Autumn", "Sawsbuck_Winter"]],
    "Emolga",
    "Karrablast", "Escavalier",
    "Foongus", "Amoonguss",
    "Frillish", "Jellicent",
    "Alomomola",
    "Joltik", "Galvantula",
    "Ferroseed", "Ferrothorn",
    "Klink", "Klang", "Klinklang",
    "Tynamo", "Eelektrik", "Eelektross",
    "Elgyem", "Beheeyem",
    "Litwick", "Lampent", "Chandelure",
    "Axew", "Fraxure", "Haxorus",
    "Cubchoo", "Beartic",
    "Cryogonal",
    "Shelmet", "Accelgor",
    [["Stunfisk", "Stunfisk_Galar"]],
    "Mienfoo", "Mienshao",
    "Druddigon",
    "Golett", "Golurk",
    "Pawniard", "Bisharp",
    "Bouffalant",
    "Rufflet", [["Braviary", "Braviary_Hisui"]],
    "Vullaby", "Mandibuzz",
    "Heatmor", "Durant",
    "Deino", "Zweilous", "Hydreigon",
    "Larvesta", "Volcarona",
    "Cobalion", "Terrakion", "Virizion",
    ["Tornadus_Incarnate", "Tornadus_Therian"], ["Thundurus_Incarnate", "Thundurus_Therian"],
    "Reshiram", "Zekrom",
    ["Landorus_Incarnate", "Landorus_Therian"],
    ["Kyurem", "Kyurem_White", "Kyurem_Black"],
    [["Keldeo_Ordinary", "Keldeo_Resolute"]],
    [["Meloetta_Aria", "Meloetta_Pirouette"]],
    "Genesect"
], [
    "Chespin", "Quilladin", "Chesnaught",
    "Fennekin", "Braixen", "Delphox",
    "Froakie", "Frogadier", [["Greninja", "Greninja_Ash"]],
    "Bunnelby", "Diggersby",
    "Fletchling", "Fletchinder", "Talonflame",
    "Scatterbug", "Spewpa", "Vivillon",
    "Litleo", "Pyroar",
    "Flabébé", [["Floette", "Floette_Eternal"]], "Florges", // flower colors?????
    "Skiddo", "Gogoat",
    "Pancham", "Pangoro",
    "Furfrou",
    "Espurr", [["Meowstic_Male", "Meowstic_Female"]],
    "Honedge", "Doublade", [["Aegislash_Shield", "Aegislash_Blade"]],
    "Spritzee", "Aromatisse",
    "Swirlix", "Slurpuff",
    "Inkay", "Malamar",
    "Binacle", "Barbaracle",
    "Skrelp", "Dragalge",
    "Clauncher", "Clawitzer",
    "Helioptile", "Heliolisk",
    "Tyrunt", "Tyrantrum",
    "Amaura", "Aurorus",
    "Sylveon",
    "Hawlucha",
    "Dedenne",
    "Carbink",
    "Goomy", [["Sliggoo", "Sliggoo_Hisui"]], [["Goodra", "Goodra_Hisui"]],
    "Klefki",
    "Phantump", "Trevenant",
    [["Pumpkaboo_Average", "Pumpkaboo_Small", "Pumpkaboo_Large"], "Pumpkaboo_Super"], [["Gourgeist_Average", "Gourgeist_Small", "Gourgeist_Large"], "Gourgeist_Super"],
    "Bergmite", [["Avalugg", "Avalugg_Hisui"]],
    "Noibat", "Noivern",
    "Xerneas", "Yveltal", ["Zygarde_50%", "Zygarde_10%", "Zygarde_Complete"],
    ["Diancie", "Diancie_Mega"],
    ["Hoopa_Confined", "Hoopa_Unbound"],
    "Volcanion"
], [
    "Rowlet", "Dartrix", [["Decidueye", "Decidueye_Hisui"]],
    "Litten", "Torracat", "Incineroar",
    "Popplio", "Brionne", "Primarina",
    "Pikipek", "Trumbeak", "Toucannon",
    "Yungoos", "Gumshoos",
    "Grubbin", "Charjabug", "Vikavolt",
    "Crabrawler", "Crabominable",
    ["Oricorio_Baile", "Oricorio_Pom-Pom", "Oricorio_Pa'u", "Oricorio_Sensu"],
    "Cutiefly", "Ribombee",
    "Rockruff", ["Lycanroc_Midday", "Lycanroc_Midnight", "Lycanroc_Dusk"],
    ["Wishiwashi_Solo", "Wishiwashi_School"],
    "Mareanie", "Toxapex",
    "Mudbray", "Mudsdale",
    "Dewpider", "Araquanid",
    "Fomantis", "Lurantis",
    "Morelull", "Shiinotic",
    "Salandit", "Salazzle",
    "Stufful", "Bewear",
    "Bounsweet", "Steenee", "Tsareena",
    "Comfey",
    "Oranguru", "Passimian",
    "Wimpod", "Golisopod",
    "Sandygast", "Palossand",
    "Pyukumuku",
    "Type: Null", "Silvally",
    [["Minior_Meteor", "Minior_Core"]],
    "Komala",
    "Turtonator",
    "Togedemaru",
    "Mimikyu",
    "Bruxish",
    "Drampa",
    "Dhelmise",
    "Jangmo-o", "Hakamo-o", "Kommo-o",
    "Tapu Koko", "Tapu Lele", "Tapu Bulu", "Tapu Fini",
    "Cosmog", "Cosmoem", "Solgaleo", "Lunala",
    "Nihilego", "Buzzwole", "Pheromosa", "Xurkitree", "Celesteela", "Kartana", "Guzzlord",
    ["Necrozma", "Necrozma_Dusk Mane", "Necrozma_Dawn Wings", "Necrozma_Ultra"],
    "Magearna",
    "Marshadow",
    "Poipole", "Naganadel",
    "Stakataka", "Blacephalon",
    "Zeraora",
    "Meltan", "Melmetal"
], [
    "Grookey", "Thwackey", "Rillaboom",
    "Scorbunny", "Raboot", "Cinderace",
    "Sobble", "Drizzile", "Inteleon",
    "Skwovet", "Greedent",
    "Rookidee", "Corvisquire", "Corviknight",
    "Blipbug", "Dottler", "Orbeetle",
    "Nickit", "Thievul",
    "Gossifleur", "Eldegoss",
    "Wooloo", "Dubwool",
    "Chewtle", "Drednaw",
    "Yamper", "Boltund",
    "Rolycoly", "Carkol", "Coalossal",
    "Applin", "Flapple", "Appletun",
    "Silicobra", "Sandaconda",
    ["Cramorant", ["Cramorant_Gulping", "Cramorant_Gorging"]], // both gulping and gorging???
    "Arrokuda", "Barraskewda",
    "Toxel", ["Toxtricity_Amped", "Toxtricity_Low Key"],
    "Sizzlipede", "Centiskorch",
    "Clobbopus", "Grapploct",
    "Sinistea", "Polteageist",
    "Hatenna", "Hattrem", "Hatterene",
    "Impidimp", "Morgrem", "Grimmsnarl",
    "Obstagoon", "Perrserker", "Cursola", "Sirfetch'd", "Mr. Rime", "Runerigus",
    "Milcery", "Alcremie",
    "Falinks",
    "Pincurchin",
    "Snom", "Frosmoth",
    "Stonjourner", ["Eiscue_Ice", "Eiscue_Noice"],
    ["Indeedee_Male", "Indeedee_Female"],
    ["Morpeko_Full Belly", "Morpeko_Hangry"],
    "Cufant", "Copperajah",
    "Dracozolt", "Arctozolt", "Dracovish", "Arctovish",
    "Duraludon",
    "Dreepy", "Drakloak", "Dragapult",
    ["Zacian_Hero of Many Battles", "Zacian_Crowned Sword"], ["Zamazenta_Hero of Many Battles", "Zamazenta_Crowned Shield"],
    ["Eternatus", "Eternatus_Eternamax"],
    "Kubfu", ["Urshifu_Single", "Urshifu_Rapid"],
    "Zarude",
    "Regieleki", "Regidrago",
    "Glastrier", "Spectrier", ["Calyrex", "Calyrex_Ice", "Calyrex_Shadow"],
    "Wyrdeer", "Kleavor", "Ursaluna", [["Basculegion_Male", "Basculegion_Female"]], "Sneasler", "Overqwil",
    ["Enamorus_Incarnate", "Enamorus_Therian"]
], [
    "Sprigatito", "Floragato", "Meowscarada",
    "Fuecoco", "Crocalor", "Skeledirge",
    "Quaxly", "Quaxwell", "Quaquaval",
    "Lechonk", ["Oinkologne_Male", "Oinkologne_Female"],
    [["Dudunsparce_Two-Segment", "Dudunsparce_Three-Segment"]],
    "Tarountula", "Spidops",
    "Nymble", "Lokix",
    "Rellor", "Rabsca",
    "Greavard", "Houndstone",
    "Flittle", "Espathra",
    "Farigiraf",
    "Wiglett", "Wugtrio",
    "Dondozo",
    "Veluza",
    [["Finizen", ["934_Palafin_Zero"]]], ["Palafin_Hero"],
    "Smoliv", "Dolliv", "Arboliva",
    "Capsakid", "Scovillain",
    "Tadbulb", "Bellibolt",
    "Varoom", "Revavroom",
    "Orthworm",
    "Tandemaus", ["Maushold_Family of Three", "Maushold_Family of Four"],
    "Cetoddle", "Cetitan",
    "Frigibax", "Arctibax", "Baxcalibur",
    ["Tatsugiri_Curly", "Tatsugiri_Droopy", "Tatsugiri_Stretchy"],
    "Cyclizar",
    "Pawmi", "Pawmo", "Pawmot",
    "Wattrel", "Kilowattrel",
    "Bombirdier",
    [["Squawkabilly_Green", "Squawkabilly_Blue", "Squawkabilly_Yellow", "Squawkabilly_White"]],
    "Flamigo",
    "Klawf",
    "Nacli", "Naclstack", "Garganacl",
    "Glimmet", "Glimmora",
    "Shroodle", "Grafaiai",
    "Fidough", "Dachsbun",
    "Maschiff", "Mabosstiff",
    "Bramblin", "Brambleghast",
    ["Gimmighoul_Chest", "Gimmighoul_Roaming"], "Gholdengo",
    "Great Tusk", "Brute Bonnet", "", "Sandy Shocks", "Scream Tail", "Flutter Mane", "Slither Wing", "Roaring Moon",
    "Iron Treads", "", "Iron Moth", "Iron Hands", "Iron Jugulis", "Iron Thorns", "Iron Bundle", "Iron Valiant",
    "Ting-Lu", "Chien-Pao", "Wo-Chien", "Chi-Yu",
    "Koraidon", "Miraidon",
    "Tinkatink", "Tinkatuff", "Tinkaton",
    "Charcadet", "Armarouge", "Ceruledge",
    "Toedscool", "Toedscruel",
    "Kingambit",
    "Clodsire",
    "Annihilape"
]];
