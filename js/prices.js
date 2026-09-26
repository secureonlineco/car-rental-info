/* ═══════════════════════════════════════════════════════════════
   International Rent A Car — Shared pricing
   Single source of truth for PRICE_SEASONS / lookupPrice / formatPrice
   Used by app.js and the International Assistant.
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var ACTIVE_PRICE_SEASON = 'high';

  /* High Season totals by vehicle group and rental days.
     These are TOTAL rental prices, not daily rates. */
  var PRICE_SEASONS = {
    high: {
      A:  { 1: 60,   2: 115,  3: 170,  4: 225,  5: 280,  6: 335,  7: 390 },
      B:  { 1: 65,   2: 125,  3: 185,  4: 245,  5: 305,  6: 365,  7: 425 },
      B1: { 1: 70,   2: 135,  3: 200,  4: 265,  5: 330,  6: 395,  7: 460 },
      C:  { 1: 75,   2: 145,  3: 215,  4: 285,  5: 355,  6: 425,  7: 495 },
      C1: { 1: 80,   2: 155,  3: 230,  4: 305,  5: 380,  6: 455,  7: 530 },
      D:  { 1: 90,   2: 175,  3: 260,  4: 345,  5: 430,  6: 515,  7: 600 },
      D1: { 1: 95,   2: 185,  3: 275,  4: 365,  5: 455,  6: 545,  7: 635 },
      E:  { 1: 100,  2: 195,  3: 290,  4: 385,  5: 480,  6: 575,  7: 670 },
      F:  { 1: 105,  2: 205,  3: 305,  4: 405,  5: 505,  6: 605,  7: 705 },
      G:  { 1: 115,  2: 225,  3: 335,  4: 445,  5: 560,  6: 670,  7: 780 },
      H:  { 1: 200,  2: 395,  3: 590,  4: 785,  5: 980,  6: 1175, 7: 1370 }
    }
  };

  function calcDays(pickup, ret) {
    if (!pickup || !ret) return 0;
    var diff = (new Date(ret) - new Date(pickup)) / 86400000;
    if (diff < 0) return 0;
    return Math.round(diff) + 1;
  }

  function formatPrice(amount) {
    var whole = String(Math.round(amount));
    var out = '';
    while (whole.length > 3) {
      out = ',' + whole.slice(-3) + out;
      whole = whole.slice(0, -3);
    }
    return '€' + whole + out;
  }

  function lookupPrice(groupCode, days) {
    var season = PRICE_SEASONS[ACTIVE_PRICE_SEASON];
    if (!season || !groupCode || days < 1 || days > 7) return null;
    var table = season[String(groupCode).toUpperCase()];
    if (!table) return null;
    var amount = table[days];
    return typeof amount === 'number' ? amount : null;
  }

  global.IRAC = global.IRAC || {};
  global.IRAC.PRICE_SEASONS = PRICE_SEASONS;
  global.IRAC.ACTIVE_PRICE_SEASON = ACTIVE_PRICE_SEASON;
  global.IRAC.calcDays = calcDays;
  global.IRAC.formatPrice = formatPrice;
  global.IRAC.lookupPrice = lookupPrice;
}(window));
