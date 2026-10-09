// Nederlandstalige gidsen voor zzp'ers. Same shape as POSTS in src/pages/Blog.jsx;
// each slug also has a /p/ rewrite in vercel.json and a sitemap entry.

const BD = "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw";

const FREE_CTA_NL = {
  title: "Factureren met de juiste btw, gratis",
  sub: "Gratis plan: 20 facturen en 5 klanten. Kies per factuur het btw-tarief, zet 'btw verlegd' erop en verstuur in het Nederlands, Engels, Frans, Spaans of Arabisch. Geen creditcard nodig.",
  button: "Gratis account maken →",
};

const DUTCH_GUIDES = [
  {
    slug: "btw-verlegd-factuur",
    lang: "nl",
    title: "Btw verlegd op je factuur: wanneer het geldt en wat je erop zet",
    seoTitle: "Btw verlegd op je factuur: wanneer en hoe? | FaturaPro",
    description: "Wanneer je de btw verlegt, wat er dan op je factuur moet staan (met voorbeeldtekst), waar je het invult in je btw-aangifte en hoe het werkt bij kosten uit het buitenland.",
    date: "2026-10-10",
    readTime: "8 min",
    keywords: "btw verlegd, btw verlegd factuur, btw verleggen, verleggingsregeling, btw verlegd EU, btw verlegd zzp, rubriek 3b, opgaaf ICP, btw verlegd tekst factuur",
    alternates: {
      nl: "https://faturapro.app/blog/btw-verlegd-factuur",
      en: "https://faturapro.app/blog/reverse-charge-vat-invoice-btw-verlegd",
      "x-default": "https://faturapro.app/blog/reverse-charge-vat-invoice-btw-verlegd",
    },
    quickAnswer: "Btw verlegd betekent dat niet jij, maar je klant de btw aangeeft en betaalt. Als zzp'er gebruik je het vooral bij diensten aan een ondernemer in een ander EU-land met een geldig btw-id. Je rekent dan geen btw, zet 'btw verlegd' op de factuur met jouw btw-id en dat van je klant, en vult de omzet in bij rubriek 3b van je btw-aangifte en in de opgaaf ICP. Ook bij kosten die je uit het buitenland afneemt, zoals online advertenties, geef je de btw vaak zelf aan.",
    checklist: [
      "Klant is een ondernemer in een ander EU-land met een geldig btw-id (controleer het in VIES)",
      "Geen btw op de factuur, wel het bedrag zoals het zonder verlegging zou gelden",
      "De tekst 'btw verlegd' (Engels, Duits of Frans mag ook)",
      "Jouw btw-id én het btw-id van je klant",
      "Factuur uiterlijk de 15e van de maand na de levering",
      "Omzet in rubriek 3b en in de opgaaf ICP",
      "Kosten uit andere EU-landen met verlegde btw: rubriek 4b, aftrekken in 5b",
    ],
    sections: [
      { h: "Wat betekent btw verlegd?", p: "Normaal reken je btw over je factuur, ontvangt je klant die van jou en draag jij hem af aan de Belastingdienst. Bij btw verlegd (de verleggingsregeling) gaat die plicht over naar je klant. Jij stuurt een factuur zonder btw en je klant geeft de btw aan in zijn eigen aangifte. Een ondernemer mag die btw meestal meteen weer aftrekken, dus voor hem is het vaak een boeking die tegen elkaar wegvalt. Er gaat niets verloren: de btw wordt betaald in het land waar de dienst wordt afgenomen. In deze gids lees je de situaties die voor zzp'ers en kleine ondernemers het meest voorkomen. Btw kent veel uitzonderingen; controleer je eigen situatie bij de Belastingdienst of je boekhouder." },
      { h: "Wanneer verleg je de btw? Diensten aan ondernemers in de EU", p: "De meest voorkomende situatie: je levert een dienst, zoals ontwerp, ontwikkeling, advies, marketing of vertaalwerk, aan een ondernemer in een ander EU-land. Volgens de hoofdregel wordt een dienst aan een ondernemer belast in het land van de klant, en verleg je de btw. Voorwaarde is dat je klant echt een ondernemer is. Vraag zijn btw-identificatienummer en controleer het in de VIES-database van de Europese Commissie. Bewaar een schermafbeelding of bevestiging van die controle bij je administratie. Is het nummer niet geldig of is je klant een particulier, dan verleg je de btw niet en reken je meestal Nederlandse btw." },
      { h: "Wanneer niet?", p: "Btw verleggen is geen keuze en geen korting. Je verlegt de btw niet bij particulieren in een ander EU-land, bij klanten zonder geldig btw-id en (op een paar uitzonderingen na) niet bij klanten in Nederland. Sommige diensten volgen bovendien een eigen regel, ongeacht wie de klant is: bijvoorbeeld diensten die met onroerend goed te maken hebben, toegang tot evenementen, personenvervoer en restaurantdiensten worden meestal belast waar ze plaatsvinden. Klanten buiten de EU zijn een apart geval. Een dienst aan een ondernemer buiten de EU is meestal niet in Nederland belast, maar dat is geen Europese verlegging: zet er dan geen 'btw verlegd' op en neem het niet op in de opgaaf ICP. Vermeld in plaats daarvan dat de dienst niet in Nederland met btw belast is." },
      { h: "Wat zet je op de factuur? (met voorbeeld)", p: "Een factuur met verlegde btw bevat alles wat een gewone factuur nodig heeft, zoals factuurnummer, factuurdatum, je naam, adres, KVK-nummer en btw-id en een omschrijving van het werk. Daarnaast: de tekst 'btw verlegd', het btw-identificatienummer van je klant, en het bedrag zoals het zonder verlegging per btw-tarief zou gelden, maar zonder btw-bedrag. De tekst mag volgens de Belastingdienst ook in het Engels, Duits of Frans. Een voorbeeld voor de opmerkingen op je factuur: 'Btw verlegd / VAT reverse-charged. Btw-id afnemer: DE123456789.' Stuur de factuur uiterlijk op de 15e van de maand na de maand waarin je het werk deed. In FaturaPro zet je het btw-tarief van die factuur op 0% en vul je de tekst en het btw-id van je klant in bij de factuuropmerkingen; je eigen btw-id komt uit je bedrijfsgegevens." },
      { h: "Waar vul je het in bij je btw-aangifte?", p: "Ook als de btw verlegd is, doe je aangifte. Diensten waarvan je de btw naar een ondernemer in een ander EU-land verlegt, vul je in bij rubriek 3b: 'Leveringen naar of diensten in landen binnen de EU'. Daarnaast doe je de opgaaf intracommunautaire prestaties (ICP), waarin je per btw-id van je klant aangeeft hoeveel je hebt gefactureerd. Voor de meeste zzp'ers is dat per kwartaal, met dezelfde termijn als de btw-aangifte. De belastingdiensten in Europa vergelijken jouw opgaaf met de aangifte van je klant; zorg dus dat btw-id's en bedragen overeenkomen met je facturen." },
      { h: "Andersom: kosten die je uit het buitenland afneemt", p: "De verleggingsregeling werkt ook als jij de klant bent. Veel diensten die zzp'ers gebruiken worden vanuit een ander EU-land gefactureerd met verlegde btw, zoals online advertenties of software-abonnementen uit Ierland. Geef zo'n leverancier je btw-id, zodat hij zonder btw factureert. Je geeft de Nederlandse btw over die kosten dan zelf aan in rubriek 4b en trekt hem, als je de btw volledig mag aftrekken, in dezelfde aangifte weer af in rubriek 5b. Per saldo is dat meestal nul, maar de boekingen moeten er wel staan. Voor diensten van buiten de EU gebruik je rubriek 4a. Gebruik je de kleineondernemersregeling (KOR), vraag dan bij de Belastingdienst na hoe dit voor jou werkt: ook met de KOR kun je over diensten uit het buitenland btw verschuldigd zijn." },
      { h: "Btw verlegd binnen Nederland", p: "Er bestaat ook een binnenlandse verleggingsregeling voor bepaalde sectoren, zoals onderaanneming in de bouw, het uitlenen van personeel en bepaalde goederen zoals oud metaal en, boven een drempelbedrag, mobiele telefoons en computerchips. De leverancier vult die omzet dan in bij rubriek 1e en de afnemer geeft de btw aan in rubriek 2a. De meeste zzp'ers in creatief werk, IT of advies krijgen hier nooit mee te maken. Werk je in een van deze sectoren, vraag dan je boekhouder welke regels voor jou gelden." },
    ],
    faqs: [
      { q: "Is btw verlegd hetzelfde als 0% btw?", a: "Op de factuur staat in beide gevallen geen btw-bedrag, maar het is iets anders. Bij 0% (bijvoorbeeld bij een levering van goederen naar een ander EU-land of bij export) is geen btw verschuldigd. Bij btw verlegd is wel btw verschuldigd, alleen geeft je klant die aan in plaats van jij." },
      { q: "Mag ik 'VAT reverse-charged' in het Engels op de factuur zetten?", a: "Ja. Volgens de Belastingdienst mag de vermelding ook in het Engels, Duits of Frans. 'Btw verlegd', 'VAT reverse-charged' en 'Reverse charge' zijn allemaal goed." },
      { q: "Hoe controleer ik of het btw-id van mijn klant geldig is?", a: "In de VIES-database van de Europese Commissie. Vul het land en het nummer in en bewaar het resultaat bij je administratie. Is het nummer niet geldig, dan verleg je de btw meestal niet." },
      { q: "Ik ben 'btw verlegd' vergeten op mijn factuur. Wat nu?", a: "Maak een creditnota voor de oude factuur en stuur een nieuwe factuur met de juiste vermeldingen. In FaturaPro kan dat met een creditnota die verwijst naar de oorspronkelijke factuur." },
      { q: "Heeft FaturaPro een aparte knop voor btw verlegd?", a: "Nee, er is geen aparte schakelaar. Zet het btw-tarief op de factuur op 0% en zet 'btw verlegd' en het btw-id van je klant in de factuuropmerkingen. Je kunt de factuur ook in het Engels, Frans of Spaans maken voor een buitenlandse klant." },
    ],
    sources: [
      { label: "Belastingdienst: hoe werkt btw verleggen?", href: BD + "/btw_berekenen_aan_uw_klanten/waarover_btw_berekenen/verleggingsregeling/hoe_werkt_btw_verleggen" },
      { label: "Belastingdienst: diensten aan afnemers in andere EU-landen", href: BD + "/zakendoen_met_het_buitenland/goederen_en_diensten_naar_andere_eu_landen/btw_berekenen_bij_diensten/btw_berekenen_bij_diensten_aan_afnemers_in_andere_eu_landen" },
      { label: "Belastingdienst: factuureisen", href: BD + "/administratie_bijhouden/facturen_maken/factuureisen/" },
      { label: "Europese Commissie: btw-nummer controleren (VIES)", href: "https://ec.europa.eu/taxation_customs/vies/" },
    ],
    relatedLinks: [
      { label: "Gratis factuur maken", href: "/nl/factuur-maken" },
      { label: "Btw terugvragen op je kosten", href: "/blog/btw-terugvragen-kosten-zzp" },
      { label: "UBL-factuur maken", href: "/ubl-factuur-maken" },
    ],
    cta: FREE_CTA_NL,
  },
];

export default DUTCH_GUIDES;
