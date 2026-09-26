/* ═══════════════════════════════════════════════════════════════
   International Assistant — deterministic knowledge map
   Intents point at existing i18n keys. No second price/fleet table.
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var WA_URL = 'https://wa.me/306944771738';

  var DAY_WORDS = {
    1: ['one', 'ein', 'eine', 'einen', 'eins', 'un', 'une', 'uno', 'una', 'een', 'jeden', 'одна', 'один', 'jedna', 'ett', 'en', 'et', 'yksi'],
    2: ['two', 'zwei', 'deux', 'due', 'twee', 'dwa', 'два', 'dva', 'två', 'to', 'kaksi'],
    3: ['three', 'drei', 'trois', 'tre', 'drie', 'trzy', 'три', 'tři', 'tre', 'kolme'],
    4: ['four', 'vier', 'quatre', 'quattro', 'cztery', 'четыре', 'čtyři', 'fyra', 'fire', 'neljä'],
    5: ['five', 'fünf', 'cinq', 'cinque', 'vijf', 'pięć', 'пять', 'pět', 'fem', 'viisi'],
    6: ['six', 'sechs', 'sei', 'zes', 'sześć', 'шесть', 'šest', 'sex', 'seks', 'kuusi'],
    7: ['seven', 'sieben', 'sept', 'sette', 'zeven', 'siedem', 'семь', 'sedm', 'sju', 'syv', 'seitsemän'],
    8: ['eight', 'acht', 'huit', 'otto', 'osiem', 'восемь', 'osm', 'åtta', 'otte', 'kahdeksan'],
    9: ['nine', 'neun', 'neuf', 'nove', 'negen', 'dziewięć', 'девять', 'devět', 'nio', 'ni', 'yhdeksän'],
    10: ['ten', 'zehn', 'dix', 'dieci', 'tien', 'dziesięć', 'десять', 'deset', 'tio', 'ti', 'kymmenen']
  };

  /* Unfinalized topics — never invent an answer.
     Fuel/charging POLICY is separate from fuel TYPE (see FUEL_POLICY). */
  var DENY = [
    'third-party', 'third party', 'thirdparty', 'dritt', 'tiers', 'terzi', 'derde partij',
    'tyre', 'tires', 'tyres', 'reifen', 'pneu', 'gomme', 'banden', 'opony', 'шин', 'pneumatik',
    'rim', 'rims', 'felgen', 'jante', 'cerchi', 'velgen', 'felgi',
    'glass', 'windscreen', 'windshield', 'windschutz', 'pare-brise', 'parabrezza', 'voorruit',
    'szyba', 'стекл', 'čelní', 'vindruta', 'forrude', 'frontrute', 'tuulilasi',
    'roadside', 'pannenhilfe', 'dépannage', 'soccorso', 'pechhulp', 'pomoc drogowa',
    'replacement vehicle', 'ersatzwagen', 'véhicule de remplacement', 'auto sostitutiva',
    'vervangende auto', 'samochód zastępczy',
    'late return', 'late-return', 'verspätete rückgabe', 'retour tardif', 'restituzione in ritardo',
    'early return', 'early-return', 'vorzeitige rückgabe', 'retour anticipé',
    'late cancel', 'late cancellation', 'stornogebühr'
  ];

  var FUEL_POLICY = [
    'fuel included', 'is fuel included', 'fuel policy', 'who pays for fuel', 'pay for fuel',
    'pays for fuel', 'full-to-full', 'full to full', 'full to-full',
    'return the car full', 'return it full', 'return full', 'tank full', 'full tank',
    'charging included', 'is charging included', 'charging policy',
    'how does charging', 'how charging works', 'need to charge', 'charge the ev',
    'charge before', 'charge the car', 'before returning', 'do i need to charge',
    'how much fuel', 'same fuel'
  ];

  var FUEL_TYPE = [
    'what fuel', 'which fuel', 'fuel type', 'fuel does', 'type of fuel',
    'what type of fuel', 'uses fuel', 'fuel is required', 'fuel should i put',
    'petrol', 'diesel', 'electric', 'hybrid',
    'plug-in', 'plugin', 'plug in'
  ];

  var PRICE_FOLLOW_UP = [
    'what about', 'and for', 'how much for', 'and what about',
    'und für', 'und fur', 'was ist mit',
    'et pour', 'e per', 'en voor'
  ];

  var PRICE_WORDS = [
    'price', 'cost', 'how much', 'euro', '€', 'preis', 'kosten', 'wie viel', 'wieviel',
    'prix', 'combien', 'prezzo', 'quanto costa', 'prijs', 'hoeveel', 'cena', 'ile kosztuje',
    'цена', 'сколько', 'kolik', 'hyrespris', 'hur mycket', 'lejepris', 'hvad koster',
    'leiepris', 'hva koster', 'hinta', 'paljonko', 'πόσο', 'kostet', 'koster', 'košta'
  ];

  var VEHICLE_WORDS = [
    'vehicle', 'vehicles', 'car', 'cars', 'fleet', 'which car', 'what car', 'what is group',
    'fahrzeug', 'autos', 'voiture', 'veicolo', 'auto', 'voertuig', 'pojazd', 'автомобил',
    'vozidlo', 'fordon', 'køretøj', 'kjøretøy', 'ajoneuvo', 'which group', 'what vehicles'
  ];

  var CONTACT_WORDS = [
    'contact', 'phone', 'email', 'address', 'whatsapp', 'opening hours', 'office hours',
    'telefon', 'adresse', 'horaire', 'orari', 'telefoon', 'adres', 'kontakt', 'телефон',
    'адрес', 'kontakta', 'åpningstid', 'aukiolo', 'call you', 'reach you'
  ];

  var POLICY = {
    deposit: {
      keys: ['guide.insurance.deposit'],
      words: ['deposit', 'kaution', 'caution', 'deposito', 'aanbetaling', 'zaliczka', 'депозит', 'záloha', 'deposition', 'depositum', 'vakuus', 'προκαταβολ', 'εγγύηση', 'security']
    },
    insurance: {
      keys: ['guide.insurance.l1', 'guide.insurance.l2', 'guide.insurance.deposit', 'guide.insurance.l3', 'guide.insurance.l4'],
      words: ['insurance', 'cover', 'coverage', 'versicherung', 'assurance', 'assicurazione', 'verzekering', 'ubezpieczenie', 'страхов', 'pojišt', 'försäkring', 'forsikring', 'vakuutus']
    },
    excess: {
      keys: ['guide.insurance.l2', 'guide.insurance.l3', 'guide.insurance.deposit'],
      words: ['excess', 'selbstbeteiligung', 'franchise', 'franchigia', 'eigen risico', 'udział własny', 'франшиз']
    },
    driverRequirements: {
      keys: ['guide.driver.l1', 'guide.driver.l2', 'guide.driver.l3'],
      words: ['age', 'old', 'minimum age', 'alter', 'âge', 'età', 'leeftijd', 'wiek', 'возраст', 'věk', 'ålder', 'alder', 'ikä', 'ηλικία', 'licence', 'license', 'führerschein', 'permis', 'patente', 'rijbewijs']
    },
    rentalPayment: {
      keys: ['guide.payment.l1', 'guide.payment.l2'],
      words: ['payment', 'cash', 'card', 'rental day', '08:30', 'zahlung', 'paiement', 'pagamento', 'betaling', 'płatność', 'оплат']
    },
    additionalDriver: {
      keys: ['guide.extraDriver.l1', 'guide.extraDriver.l2', 'guide.extraDriver.l3'],
      words: ['additional driver', 'extra driver', 'second driver', 'zusatzfahrer', 'conducteur supplémentaire', 'conducente aggiuntivo', 'extra bestuurder', 'dodatkowy kierowca', 'дополнительн', 'další řidič', 'extra förare', 'ekstra fører', 'lisäkuljettaja']
    },
    ferry: {
      keys: ['guide.use.l3'],
      words: ['ferry', 'island', 'another island', 'andere insel', 'autre île', 'altra isola', 'ander eiland', 'inną wysp', 'другой остров', 'jiný ostrov', 'annan ö', 'annen øy', 'toiselle saarelle']
    },
    vehicleUse: {
      keys: ['guide.use.l1', 'guide.use.l2', 'guide.use.l3', 'guide.use.l4', 'guide.use.l5', 'guide.use.l6'],
      words: ['smoking', 'rauchen', 'fumer', 'fumare', 'roken', 'unpaved', 'dirt road', 'off-road', 'fines', 'interior clean']
    },
    cancellation: {
      keys: ['guide.cancel.l1', 'guide.cancel.l2'],
      words: ['cancel', 'cancellation', 'storn', 'annul', 'cancellaz', 'anulow', 'отмен', 'avbok', 'avbestill', 'peruut']
    },
    notCovered: {
      keys: ['guide.notCovered.l1', 'guide.notCovered.l2', 'guide.notCovered.l3', 'guide.notCovered.l4', 'guide.notCovered.l5', 'guide.notCovered.l6', 'guide.notCovered.l7', 'guide.notCovered.l8', 'guide.notCovered.l9', 'guide.notCovered.l10'],
      words: ['not covered', 'excluded', 'void', 'nicht gedeckt', 'non couvert', 'non coperto']
    }
  };

  var SUGGEST_KEYS = [
    'assistant.suggest.deposit',
    'assistant.suggest.age',
    'assistant.suggest.priceC3',
    'assistant.suggest.extraDriver',
    'assistant.suggest.ferry',
    'assistant.suggest.insurance'
  ];

  global.IRAC = global.IRAC || {};
  global.IRAC.ASSISTANT_KNOWLEDGE = {
    WA_URL: WA_URL,
    DAY_WORDS: DAY_WORDS,
    DENY: DENY,
    FUEL_POLICY: FUEL_POLICY,
    FUEL_TYPE: FUEL_TYPE,
    PRICE_FOLLOW_UP: PRICE_FOLLOW_UP,
    PRICE_WORDS: PRICE_WORDS,
    VEHICLE_WORDS: VEHICLE_WORDS,
    CONTACT_WORDS: CONTACT_WORDS,
    POLICY: POLICY,
    SUGGEST_KEYS: SUGGEST_KEYS
  };
}(window));
