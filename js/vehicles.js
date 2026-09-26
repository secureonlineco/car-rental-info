/* ═══════════════════════════════════════════════════════════════
   International Rent A Car — Shared fleet data
   Single source of truth for VEHICLES.
   Used by fleet-page.js and the International Assistant.
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* img: null → no approved photo exists yet; a placeholder is shown.
     Passengers / doors / transmission / fuel are verified International
     business values. Luggage is intentionally not used or displayed. */
  var VEHICLES = [
    { group: 'A',  name: 'VW Up',                    note: 'White',                    img: 'vw-up-white.png',                    passengers: 4, doors: 5, transmission: 'Manual',    fuel: 'Petrol',          price: 25 },
    { group: 'A',  name: 'Toyota Aygo',               note: 'Red',                      img: 'toyota-aygo-red.png.png',            passengers: 4, doors: 5, transmission: 'Manual',    fuel: 'Petrol',          price: 25 },

    { group: 'B',  name: 'Fiat Panda',                note: 'White',                    img: 'fiat-panda-white.png.png',           passengers: 4, doors: 5, transmission: 'Manual',    fuel: 'Petrol',          price: 27 },
    { group: 'B',  name: 'Kia Picanto',                note: 'Grey',                     img: 'kia-picanto-grey.png.png',           passengers: 4, doors: 5, transmission: 'Manual',    fuel: 'Petrol',          price: 24 },
    { group: 'B',  name: 'Toyota Aygo X',              note: 'White',                    img: 'toyota-aygo-x-white.png',            passengers: 4, doors: 5, transmission: 'Manual',    fuel: 'Petrol',          price: 26 },
    { group: 'B',  name: 'Hyundai i10',                note: 'Mango Green',              img: 'hyundai-i10-mango-green.png.png',    passengers: 4, doors: 5, transmission: 'Manual',    fuel: 'Petrol',          price: 23 },

    { group: 'B1', name: 'Kia Picanto',                note: 'Automatic',                img: 'kia-picanto-grey.png.png',           passengers: 4, doors: 5, transmission: 'Automatic', fuel: 'Petrol',          price: 27 },
    { group: 'B1', name: 'Toyota Aygo X',              note: 'Automatic',                img: 'toyota-aygo-x-white.png',            passengers: 4, doors: 5, transmission: 'Automatic', fuel: 'Petrol',          price: 29 },

    { group: 'C',  name: 'VW Polo',                    note: 'Manual',                   img: 'vw-polo-grey.png.png',               passengers: 5, doors: 5, transmission: 'Manual',    fuel: 'Petrol',          price: 28 },
    { group: 'C',  name: 'Hyundai i20',                 note: 'Blue',                     img: 'hyundai-i20-blue.png.png',           passengers: 5, doors: 5, transmission: 'Manual',    fuel: 'Petrol',          price: 27 },
    { group: 'C',  name: 'Fiat 500C Cabrio',            note: 'Red, 2024',                img: 'fiat-500c-cabrio-2024-red.png.png',  passengers: 4, doors: 3, transmission: 'Automatic', fuel: 'Petrol',          price: 36 },

    { group: 'C1', name: 'VW Polo',                     note: 'Automatic',                img: 'vw-polo-grey.png.png',               passengers: 5, doors: 5, transmission: 'Automatic', fuel: 'Petrol',          price: 31 },
    { group: 'C1', name: 'Toyota Yaris',                 note: 'White',                    img: 'toyota-yaris-white.png.png',         passengers: 5, doors: 5, transmission: 'Automatic', fuel: 'Petrol',          price: 31 },

    { group: 'D',  name: 'Skoda Kamiq',                  note: 'Grey',                     img: 'skoda-kamiq-grey.png.png',           passengers: 5, doors: 5, transmission: 'Manual',    fuel: 'Petrol',          price: 37 },
    { group: 'D',  name: 'VW Taigo',                     note: 'White',                    img: 'vw-taigo-white.png.png',             passengers: 5, doors: 5, transmission: 'Manual',    fuel: 'Petrol',          price: 37 },
    { group: 'D',  name: 'Kia Stonic',                   note: 'Astro Grey',               img: 'kia-stonic-astro-grey.png.png',      passengers: 5, doors: 5, transmission: 'Manual',    fuel: 'Petrol',          price: 36 },

    { group: 'E',  name: 'VW Caddy',                     note: 'White',                    img: 'vw-caddy-white.png.png',             passengers: 7, doors: 4, transmission: 'Manual',    fuel: 'Petrol',          price: 39 },

    { group: 'F',  name: 'MINI Cooper Cabrio',           note: 'Light Grey, Roof Open',    img: 'mini-cooper-cabrio-light-grey.png',  passengers: 4, doors: 3, transmission: 'Automatic', fuel: 'Petrol',          price: 55 },
    { group: 'F',  name: 'VW T-Roc Cabrio',               note: 'White, Roof Open',         img: 'vw-t-roc-cabrio-white.png.png',      passengers: 4, doors: 3, transmission: 'Manual',    fuel: 'Petrol',          price: 58 },

    { group: 'G',  name: 'VW ID.3',                       note: 'Dark Grey, 2024',           img: 'vw-id3-2024-dark-grey.png.png',      passengers: 5, doors: 5, transmission: 'Automatic', fuel: 'Electric',        price: 62 },
    { group: 'G',  name: 'VW ID.4',                       note: 'White',                     img: 'vw-id4-white.png',                   passengers: 5, doors: 5, transmission: 'Automatic', fuel: 'Electric',        price: 68 },

    { group: 'H',  name: 'Jeep Wrangler 4xe',              note: 'Silver, Roof/Panels Open',  img: 'jeep-wrangler-4xe-silver-open.png',  passengers: 5, doors: 5, transmission: 'Automatic', fuel: 'Plug-in Hybrid',  price: 85 }
  ];

  global.IRAC = global.IRAC || {};
  global.IRAC.VEHICLES = VEHICLES;
}(window));
