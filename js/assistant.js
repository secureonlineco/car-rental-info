/* ═══════════════════════════════════════════════════════════════
   International Assistant — deterministic client-side chat
   No API, no backend. Answers only from approved IRAC data.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var MAX_LEN = 500;
  var SEND_GAP_MS = 700;
  var lastSend = 0;
  var lastGroup = '';
  var open = false;

  function t(key, vars) {
    return (window.I18N && typeof I18N.t === 'function') ? I18N.t(key, vars) : '';
  }

  function prices() { return window.IRAC || {}; }
  function knowledge() { return (window.IRAC && IRAC.ASSISTANT_KNOWLEDGE) || {}; }
  function vehicles() { return (window.IRAC && IRAC.VEHICLES) || []; }

  function normalize(str) {
    return String(str || '')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  function containsToken(text, token) {
    if (!token) return false;
    if (token.indexOf(' ') !== -1) return text.indexOf(token) !== -1;
    return new RegExp('(?:^|[^a-z0-9äöüáéíóúåøæčďěňřšťůžа-яё])' + token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:$|[^a-z0-9äöüáéíóúåøæčďěňřšťůžа-яё])').test(text);
  }

  function containsAny(text, list) {
    var i;
    for (i = 0; i < list.length; i++) {
      if (containsToken(text, list[i])) return true;
    }
    return false;
  }

  var GROUP_PREFIX = '(?:group|category|gruppe|groupe|gruppo|groep|grupa|группа|skupina|grupp|kategorie|catégorie|categoria|categorie|categoría|kategoria|ryhmä|ομάδα|γκρουπ|klasse|class)';
  var DAY_UNIT = '(?:days?|tage?n?|tag|jours?|jour|giorni|giorno|dagen|dag|dni|дня|дней|dní|dny|dagar|dage|døgn|päivää|päivä|ημέρες|ημέρα|ημερες|ημερα)';

  function hasGroupWord(text) {
    return new RegExp('\\b' + GROUP_PREFIX + '\\b').test(text);
  }

  function findGroupPrefixed(text) {
    var m = text.match(/\b(b1|c1|d1)\b/);
    if (m) return m[1].toUpperCase();
    /* Prefix must end at a word boundary so "group" cannot steal the "e" from "groupe". */
    m = text.match(new RegExp(GROUP_PREFIX + '(?![a-z0-9äöüáéíóúåøæčďěňřšťůžа-яё])\\s*([a-h])\\b'));
    if (m) return m[1].toUpperCase();
    return '';
  }

  function findBareGroup(text) {
    var re = /\b([a-h])\b/g;
    var m, letter, after, found = '';
    while ((m = re.exec(text))) {
      letter = m[1];
      after = text.slice(m.index + 1);
      /* English article "a" is not Group A when a noun or number follows. */
      if (letter === 'a') {
        if (/^\s+\d/.test(after)) continue;
        if (/^\s+[a-zäöüáéíóúåøæčďěňřšťůžа-яё]/i.test(after) &&
            !/^\s+(for|days?|day|tage?n?|tag|jours?|jour)\b/i.test(after)) {
          continue;
        }
      }
      found = letter.toUpperCase();
    }
    return found;
  }

  function findGroup(text, allowBare) {
    var prefixed = findGroupPrefixed(text);
    if (prefixed) return prefixed;
    if (allowBare) return findBareGroup(text);
    return '';
  }

  var WEEK_UNIT = '(?:weeks?|woche|wochen|semaines?|settiman[ae]|weken|tydzie[nń]|недель|неделю|недели|неделя|týden|tyden|vecka|veckor|uge|uker?|viikko(?:a|n)?|viikolta)';

  function hasWeekDuration(text) {
    return new RegExp(
      '(?:^|[^a-z0-9äöüáéíóúåøæčďěňřšťůžа-яё])(?:(?:a|one|1|eine|einer|ein|un|une|una|een|en|et|jeden|jedna|jedną)\\s+)?' +
      WEEK_UNIT +
      '(?:$|[^a-z0-9äöüáéíóúåøæčďěňřšťůžа-яё])'
    ).test(text);
  }

  function isRentalPriceWeek(text) {
    return !!(findGroupPrefixed(text) || containsAny(text, knowledge().PRICE_WORDS || []));
  }

  function findDays(text) {
    var m = text.match(new RegExp('(\\d{1,2})\\s*' + DAY_UNIT));
    if (m) return parseInt(m[1], 10);
    var words = knowledge().DAY_WORDS || {};
    var n, i, list, word;
    for (n in words) {
      if (!Object.prototype.hasOwnProperty.call(words, n)) continue;
      list = words[n];
      for (i = 0; i < list.length; i++) {
        word = list[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp('(?:^|[^a-z0-9äöüáéíóúåøæ])' + word + '\\s+' + DAY_UNIT).test(text)) {
          return parseInt(n, 10);
        }
      }
    }
    if (hasWeekDuration(text) && isRentalPriceWeek(text)) return 7;
    return 0;
  }

  function findDaysLoose(text) {
    var days = findDays(text);
    if (days) return days;
    var m = text.match(/\b(\d{1,2})\b/);
    if (!m) return 0;
    var n = parseInt(m[1], 10);
    if (n >= 1 && n <= 31) return n;
    return 0;
  }

  function isAutomaticVehicle(v) {
    if (!v) return false;
    if (normalize(v.transmission || '') === 'automatic') return true;
    return containsToken(normalize(v.note || ''), 'automatic');
  }

  function hasAutomaticQualifier(text) {
    return containsToken(text, 'automatic');
  }

  function preferAutomaticRow(vehicle, text) {
    if (!vehicle || !hasAutomaticQualifier(text)) return vehicle;
    var list = vehicles();
    var name = normalize(vehicle.name || '');
    var i, v;
    for (i = 0; i < list.length; i++) {
      v = list[i];
      if (normalize(v.name || '') === name && isAutomaticVehicle(v)) return v;
    }
    return vehicle;
  }

  function uniqueNameCount(hits) {
    var names = {};
    var seen = 0;
    var i, name;
    for (i = 0; i < hits.length; i++) {
      name = normalize(hits[i].name || '');
      if (!names[name]) {
        names[name] = true;
        seen += 1;
      }
    }
    return seen;
  }

  function findNamedVehicle(text) {
    var list = vehicles();
    var best = null;
    var bestLen = 0;
    var i, v, name, tokens, tok, j, k, phrase, tokenHits, phraseHits, manufacturers;
    for (i = 0; i < list.length; i++) {
      v = list[i];
      name = normalize(v.name || '');
      if (name.length >= 4 && text.indexOf(name) !== -1 && name.length > bestLen) {
        best = v;
        bestLen = name.length;
      }
    }
    if (best) return preferAutomaticRow(best, text);

    manufacturers = {};
    tokenHits = {};
    phraseHits = {};
    for (i = 0; i < list.length; i++) {
      tokens = normalize(list[i].name || '').split(/\s+/);
      if (tokens[0]) manufacturers[tokens[0]] = true;
      for (j = 0; j < tokens.length; j++) {
        tok = tokens[j];
        if (tok.length >= 4 || tok.indexOf('.') !== -1) {
          if (!tokenHits[tok]) tokenHits[tok] = [];
          tokenHits[tok].push(list[i]);
        }
        phrase = tok;
        for (k = j + 1; k < tokens.length; k++) {
          phrase += ' ' + tokens[k];
          if (!phraseHits[phrase]) phraseHits[phrase] = [];
          phraseHits[phrase].push(list[i]);
        }
      }
    }

    for (phrase in phraseHits) {
      if (!Object.prototype.hasOwnProperty.call(phraseHits, phrase)) continue;
      if (text.indexOf(phrase) === -1) continue;
      if (uniqueNameCount(phraseHits[phrase]) > 1) continue;
      if (phrase.length > bestLen) {
        best = phraseHits[phrase][0];
        bestLen = phrase.length;
      }
    }
    if (best) return preferAutomaticRow(best, text);

    for (tok in tokenHits) {
      if (!Object.prototype.hasOwnProperty.call(tokenHits, tok)) continue;
      if (manufacturers[tok]) continue;
      if (!containsToken(text, tok)) continue;
      if (uniqueNameCount(tokenHits[tok]) > 1) continue;
      if (tok.length > bestLen) {
        best = tokenHits[tok][0];
        bestLen = tok.length;
      }
    }
    return preferAutomaticRow(best, text);
  }

  function fuelLabel(value) {
    if (value === 'Electric') return t('fleet.fuel.electric') || value;
    if (value === 'Diesel') return t('fleet.fuel.diesel') || value;
    if (value === 'Plug-in Hybrid') return t('fleet.fuel.pluginHybrid') || value;
    if (value === 'Petrol') return t('fleet.fuel.petrol') || value;
    return value || '';
  }

  function fuelsForGroup(group, onlyVehicle) {
    var list = vehicles();
    var lines = [];
    var seen = {};
    var i, v, line, label;
    for (i = 0; i < list.length; i++) {
      v = list[i];
      if (onlyVehicle && v !== onlyVehicle) continue;
      if (!onlyVehicle && v.group !== group) continue;
      if (!v.name || !v.fuel) continue;
      label = fuelLabel(v.fuel);
      if (!label) continue;
      line = v.name + ' — ' + label;
      if (!seen[line]) {
        seen[line] = true;
        lines.push(line);
      }
    }
    return lines;
  }

  function policyLines(keys) {
    var out = [];
    var i, line;
    for (i = 0; i < keys.length; i++) {
      line = t(keys[i]);
      if (line) out.push(line);
    }
    return out.join('\n');
  }

  function vehiclesInGroup(group) {
    var list = vehicles();
    var names = [];
    var seen = {};
    var i, v;
    for (i = 0; i < list.length; i++) {
      v = list[i];
      if (v.group === group && v.name && !seen[v.name]) {
        seen[v.name] = true;
        names.push(t('fleet.orSimilar', { name: v.name }) || (v.name + ' or Similar'));
      }
    }
    return names;
  }

  var WEAK_POLICY = {
    island: 1, old: 1, card: 1, cover: 1, security: 1, 'return': 1,
    hotel: 1, change: 1, driver: 1, car: 1, cars: 1, cash: 1, caution: 1
  };

  var PRICE_BLOCK_TOPICS = [
    'fuel', 'petrol', 'diesel', 'gasoline', 'charging',
    'insurance', 'excess', 'hotel', 'resort', 'child seat', 'baby seat'
  ];

  var RENTAL_PRICE_CONTEXT = [
    'rental', 'rent', 'hire', 'group', 'vehicle', 'car', 'cars',
    'rate', 'rates', 'days', 'day', 'week', 'groupe', 'gruppe', 'gruppo', 'groep'
  ];

  var CONTEXTUAL_TOKENS = {
    track: ['unpaved', 'dirt', 'off-road', 'off road', 'gravel', 'beach', 'piste', 'schotter'],
    caution: ['deposit', 'security', 'kaution', 'garantie', 'hold'],
    stock: ['available', 'availability', 'in stock'],
    valet: ['clean', 'cleaning', 'interior'],
    panda: ['car', 'fiat', 'group', 'model', 'rent', 'hire', 'vehicle', 'want', 'get', 'book'],
    i10: ['hyundai', 'car', 'group', 'model', 'rent', 'hire', 'vehicle', 'want', 'get', 'book'],
    taigo: ['vw', 'volkswagen', 'car', 'group', 'model', 'rent', 'hire', 'vehicle', 'want', 'get', 'book'],
    cleaning: ['return', 'interior', 'sand', 'vacuum', 'tidy', 'dirty', 'beach', 'wash', 'inside', 'mats'],
    visa: ['pay', 'card', 'debit', 'credit', 'payment', 'accept'],
    amex: ['pay', 'card', 'credit', 'payment', 'accept', 'american'],
    gps: ['have', 'include', 'navigation', 'sat', 'nav', 'rent'],
    wa: ['whatsapp', 'message', 'number', 'contact'],
    '08:30': ['pickup', 'pick up', 'rental', 'hour', 'time', 'open', 'from', 'collect'],
    '21:00': ['return', 'hour', 'time', 'close', 'until', 'drop']
  };

  var HANDLER_KEYS = {
    insurance: ['assistant.insuranceNatural'],
    excess: ['assistant.excessNatural'],
    deposit: ['guide.insurance.deposit'],
    driverRequirements: ['assistant.driverRequirementsNatural'],
    additionalDriver: ['assistant.additionalDriverNatural'],
    ferry: ['guide.use.l3'],
    vehicleUse: ['guide.use.l1', 'guide.use.l2', 'guide.use.l3', 'guide.use.l4', 'guide.use.l5', 'guide.use.l6'],
    smoking: ['assistant.smokingNatural'],
    trafficFines: ['assistant.trafficFinesNatural'],
    keys: ['assistant.keysNatural'],
    cancellation: ['assistant.cancellationNatural'],
    notCovered: ['guide.notCovered.l1', 'guide.notCovered.l2', 'guide.notCovered.l3', 'guide.notCovered.l4', 'guide.notCovered.l5', 'guide.notCovered.l6', 'guide.notCovered.l7', 'guide.notCovered.l8', 'guide.notCovered.l9', 'guide.notCovered.l10'],
    payment: ['assistant.paymentNatural'],
    rentalHours: ['assistant.rentalHoursNatural'],
    childSeats: ['assistant.childSeatsNatural']
  };

  function phraseMatches(text, phrase) {
    if (!phrase) return false;
    if (text.indexOf(phrase) === -1) return false;
    var escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    return new RegExp(
      '(?:^|[^a-z0-9äöüáéíóúåøæčďěňřšťůžа-яё])' + escaped + '(?:$|[^a-z0-9äöüáéíóúåøæčďěňřšťůžа-яё])'
    ).test(text);
  }

  function hitExclusion(text, list) {
    var i;
    for (i = 0; i < (list || []).length; i++) {
      if (phraseMatches(text, list[i])) return true;
    }
    return false;
  }

  function tokenHasRequiredContext(text, phrase) {
    var need = CONTEXTUAL_TOKENS[phrase];
    if (!need) return true;
    return containsAny(text, need);
  }

  function compareLibraryHits(a, b) {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.exact !== b.exact) return a.exact - b.exact;
    if (a.wordCount !== b.wordCount) return a.wordCount - b.wordCount;
    if (a.phrase.length !== b.phrase.length) return a.phrase.length - b.phrase.length;
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    if (a.phrase < b.phrase) return -1;
    if (a.phrase > b.phrase) return 1;
    return 0;
  }

  function matchLibraryIntent(text) {
    var map = (window.IRAC && IRAC.ASSISTANT_INTENTS) || {};
    var best = null;
    var name, it, i, phrase, words, cand;
    words = text.split(' ');
    for (name in map) {
      if (!Object.prototype.hasOwnProperty.call(map, name)) continue;
      it = map[name];
      if (hitExclusion(text, it.exclusions)) continue;
      for (i = 0; i < it.phrases.length; i++) {
        phrase = it.phrases[i];
        if (!phraseMatches(text, phrase)) continue;
        if (phrase.indexOf(' ') === -1 && !tokenHasRequiredContext(text, phrase)) continue;
        if (phrase.indexOf(' ') === -1 && phrase.length < 4 && words.length > 5 && name !== 'greeting') continue;
        cand = {
          name: name,
          handler: it.handler,
          phrase: phrase,
          priority: it.priority || 0,
          exact: text === phrase ? 1 : 0,
          wordCount: phrase.split(' ').length
        };
        if (!best || compareLibraryHits(cand, best) > 0) best = cand;
      }
    }
    return best;
  }

  function matchPolicy(text) {
    var policy = knowledge().POLICY || {};
    var intent, best = '', bestLen = 0, w, i;
    for (intent in policy) {
      if (!Object.prototype.hasOwnProperty.call(policy, intent)) continue;
      for (i = 0; i < policy[intent].words.length; i++) {
        w = policy[intent].words[i];
        if (WEAK_POLICY[w]) continue;
        if (containsToken(text, w) && w.length > bestLen) {
          best = intent;
          bestLen = w.length;
        }
      }
    }
    return best;
  }

  function findCompactPrice(text) {
    var m = String(text).match(/(?:^|[^a-z0-9])([a-h])([1-7])(?![a-z0-9])/i);
    if (!m) return null;
    var letter = m[1].toUpperCase();
    var n = parseInt(m[2], 10);
    if ((letter === 'B' || letter === 'C' || letter === 'D') && n === 1) {
      return { group: letter + '1', days: 0 };
    }
    return { group: letter, days: n };
  }

  function isDurationFollowUp(text) {
    var K = knowledge();
    if (containsAny(text, K.PRICE_FOLLOW_UP || [])) return true;
    if (/^(and\s+)?for\s+/.test(text)) return true;
    if (/^\d{1,2}$/.test(text)) return true;
    return false;
  }

  function contactReply() {
    return {
      text: [
        t('contact.address').replace(/<br\s*\/?>/gi, ', '),
        t('contact.days') + ' · ' + t('contact.hours1') + ' · ' + t('contact.hours2'),
        '+30 22420 92265',
        '+30 6944 771 738',
        'info@internationalrentals.gr'
      ].filter(Boolean).join('\n'),
      whatsapp: true
    };
  }

  function emergencyReply() {
    return {
      text: [
        t('emergency.heading'),
        '112 — ' + t('emergency.emergency'),
        '100 — ' + t('emergency.police'),
        '166 — ' + t('emergency.ambulance'),
        '199 — ' + t('emergency.fire')
      ].join('\n')
    };
  }

  function groupReply(group) {
    var names = vehiclesInGroup(group);
    if (!names.length) return { text: t('assistant.groupUnknown', { group: group }) };
    return { text: t('assistant.groupVehiclesNatural', { group: group, names: names.join(', ') }) };
  }

  function fuelTypeOverviewReply() {
    var list = vehicles();
    var fuelOrder = ['Petrol', 'Diesel', 'Electric', 'Plug-in Hybrid'];
    var fuelToGroups = {};
    var i, v, fuel, groups, label, lines = [];
    for (i = 0; i < list.length; i++) {
      v = list[i];
      if (!v.fuel || !v.group) continue;
      if (!fuelToGroups[v.fuel]) fuelToGroups[v.fuel] = [];
      if (fuelToGroups[v.fuel].indexOf(v.group) === -1) fuelToGroups[v.fuel].push(v.group);
    }
    for (i = 0; i < fuelOrder.length; i++) {
      fuel = fuelOrder[i];
      groups = fuelToGroups[fuel];
      if (!groups || !groups.length) continue;
      label = fuelLabel(fuel);
      lines.push(label + ' — ' + groups.join(', '));
    }
    return {
      text: (lines.length ? lines.join('\n') + '\n' : '') + t('assistant.fuelTypeAskGroup')
    };
  }

  function hasRentalPriceContext(text, group, daysStrict, compact) {
    if (compact && compact.days) return true;
    if (group && daysStrict) return true;
    return containsAny(text, RENTAL_PRICE_CONTEXT);
  }

  function priceReply(group, days) {
    if (days >= 8) {
      lastGroup = group || lastGroup;
      return { text: t('assistant.contactForPriceNatural'), whatsapp: true };
    }
    if (group && days >= 1 && days <= 7) {
      var amount = prices().lookupPrice(group, days);
      if (amount != null) {
        lastGroup = group;
        var duration = days === 1 ? t('avail.duration.one') : t('avail.duration.many', { n: days });
        return {
          text: t('assistant.priceAnswerNatural', {
            group: group,
            duration: duration,
            price: prices().formatPrice(amount)
          }) + ' ' + t('assistant.priceIncluded')
        };
      }
    }
    return null;
  }

  function answerMessage(raw) {
    var K = knowledge();
    var text = normalize(raw);
    var compact = findCompactPrice(text);
    var lib = matchLibraryIntent(text);
    var named = findNamedVehicle(text);
    var daysStrict = findDays(text);
    if (compact && compact.days && !daysStrict) daysStrict = compact.days;

    var priceBlocked = containsAny(text, PRICE_BLOCK_TOPICS);
    var structuredPrice = !!(compact && compact.days);
    var libHandler = lib ? lib.handler : '';
    var specificNonPrice = !!(libHandler && libHandler !== 'price' && libHandler !== 'fleet');

    var allowBareGroup = (hasGroupWord(text) || structuredPrice || (libHandler === 'price' && !priceBlocked)) && !!daysStrict;
    var group = findGroup(text, allowBareGroup);
    if (compact && compact.group) group = compact.group;
    if (!group && named) group = named.group;
    var prefixed = findGroupPrefixed(text) || (compact && compact.group) || '';
    var followShape = isDurationFollowUp(text);
    var followDays = 0;
    if (lastGroup && followShape && !prefixed) {
      followDays = daysStrict || findDaysLoose(text);
    }
    var followUp = !!(lastGroup && followShape && followDays && !prefixed);
    var policyIntent = matchPolicy(text);
    var wordCount = text ? text.split(' ').length : 0;

    var isFuelPolicy = (libHandler === 'fuelPolicy') || (!specificNonPrice && containsAny(text, K.FUEL_POLICY || []));
    var isFuelType = (libHandler === 'fuelType') || (!specificNonPrice && !isFuelPolicy && containsAny(text, K.FUEL_TYPE || []));
    var isContact = (libHandler === 'contact' || libHandler === 'whatsapp') || (!specificNonPrice && containsAny(text, K.CONTACT_WORDS || []));
    var isVehicle = (libHandler === 'fleet' || libHandler === 'specificModel') || containsAny(text, K.VEHICLE_WORDS || []);
    var isPrice = !priceBlocked && !specificNonPrice && (
      libHandler === 'price' ||
      structuredPrice ||
      !!(group && daysStrict) ||
      (containsAny(text, K.PRICE_WORDS || []) && hasRentalPriceContext(text, group, daysStrict, compact))
    );

    /* 1. Hard safety / deny */
    if (containsAny(text, K.DENY || [])) {
      lastGroup = '';
      return { text: t('assistant.unconfirmedNatural'), whatsapp: true };
    }

    /* 2. Specific semantic intents beat generic keyword flags */
    if (isFuelPolicy && !structuredPrice) {
      lastGroup = '';
      return { text: t('assistant.unconfirmedNatural'), whatsapp: true };
    }

    if (libHandler === 'unconfirmed') {
      lastGroup = '';
      return { text: t('assistant.unconfirmedNatural'), whatsapp: true };
    }

    if (libHandler === 'greeting' && !structuredPrice && !group && !daysStrict) {
      lastGroup = '';
      return { text: t('assistant.greeting') || t('assistant.welcome') };
    }

    if (libHandler === 'emergency') {
      lastGroup = '';
      return emergencyReply();
    }

    if (isFuelType && (group || named)) {
      lastGroup = '';
      var fuelLines = fuelsForGroup(group || named.group, named);
      if (fuelLines.length) {
        return { text: t('assistant.groupVehicles', { group: group || named.group, names: fuelLines.join(', ') }) };
      }
    }

    if (isFuelType && !group && !named) {
      lastGroup = '';
      return fuelTypeOverviewReply();
    }

    if (libHandler && HANDLER_KEYS[libHandler]) {
      lastGroup = '';
      return { text: policyLines(HANDLER_KEYS[libHandler]) };
    }

    /* 3. Policy keyword fallback only when the library did not already decide */
    if (policyIntent && !libHandler) {
      lastGroup = '';
      return { text: policyLines(HANDLER_KEYS[policyIntent] || (K.POLICY[policyIntent] && K.POLICY[policyIntent].keys) || []) };
    }

    /* 4. Active pricing context: short prefixed group switch (C3 → Group G) */
    if (group && lastGroup && !daysStrict && !isPrice && !followUp && prefixed && wordCount <= 3) {
      lastGroup = group;
      return { text: t('assistant.needGroupAndDaysNatural') };
    }

    if (libHandler === 'specificModel') {
      lastGroup = '';
      if (named || group) return groupReply(group || named.group);
      return { text: t('assistant.fleetOverviewNatural'), fleet: true };
    }

    if (libHandler === 'fleet' && !group && !named && !structuredPrice) {
      lastGroup = '';
      return { text: t('assistant.fleetOverviewNatural'), fleet: true };
    }

    if (group && isVehicle && !isPrice && !followUp) {
      lastGroup = '';
      return groupReply(group);
    }

    /* 5. Structured / explicit rental price */
    var days = daysStrict;
    if (!days && followUp) days = followDays;
    if (!days && group && isPrice && !followUp) days = findDaysLoose(text);

    var priceGroup = group || (followUp ? lastGroup : '');

    if ((isPrice || followUp) && !priceBlocked) {
      var priced = priceReply(priceGroup, days);
      if (priced) return priced;
      if (group) lastGroup = group;
      return { text: t('assistant.needGroupAndDaysNatural') };
    }

    /* Group-only statements list vehicles and do not create a price follow-up context. */
    if (group && (hasGroupWord(text) || /what is|which|welche|quel|quale|welke|jaka|какая|jaká|vilken|hvilken|mikä/.test(text))) {
      lastGroup = '';
      return groupReply(group);
    }

    if (isContact) {
      lastGroup = '';
      return contactReply();
    }

    lastGroup = '';
    return { text: t('assistant.unknownNatural'), whatsapp: true };
  }

  /* ── DOM ─────────────────────────────────────────────────────── */

  var ROBOT_SRC = 'assets/images/assistant/international-assistant-robot.png';
  var root, panel, logEl, inputEl, formEl, chipsEl, toggleBtn, toggleLabel, closeBtn, titleEl, sendBtn, waSlot;

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function mascot(extraClass, height) {
    var wrap = el('span', extraClass ? 'ia-mascot ' + extraClass : 'ia-mascot');
    var img = el('img', 'ia-mascot__img');
    img.src = ROBOT_SRC;
    img.alt = '';
    img.decoding = 'async';
    img.setAttribute('aria-hidden', 'true');
    img.width = height;
    img.height = height;
    wrap.appendChild(img);
    return wrap;
  }

  function appendTextLines(parent, text) {
    var parts = String(text || '').split('\n');
    var i, span;
    for (i = 0; i < parts.length; i++) {
      if (i) parent.appendChild(document.createElement('br'));
      span = document.createTextNode(parts[i]);
      parent.appendChild(span);
    }
  }

  function addMessage(role, payload) {
    var wrap = el('div', 'ia-msg ia-msg--' + role);
    var bubble = el('div', 'ia-msg__bubble');
    appendTextLines(bubble, payload.text);
    wrap.appendChild(bubble);
    if (payload.whatsapp) {
      var a = el('a', 'ia-wa');
      a.href = knowledge().WA_URL || 'https://wa.me/306944771738';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = t('assistant.whatsapp');
      wrap.appendChild(a);
    }
    if (payload.fleet) {
      var fleetLink = el('a', 'ia-fleet');
      fleetLink.href = 'fleet.html';
      fleetLink.textContent = t('assistant.viewFleet');
      wrap.appendChild(fleetLink);
    }
    logEl.appendChild(wrap);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function renderChips() {
    if (!chipsEl) return;
    chipsEl.textContent = '';
    var keys = knowledge().SUGGEST_KEYS || [];
    var i, btn, label;
    var hint = el('p', 'ia-chips__label');
    hint.textContent = t('assistant.tryAsking');
    chipsEl.appendChild(hint);
    for (i = 0; i < keys.length; i++) {
      label = t(keys[i]);
      if (!label) continue;
      btn = el('button', 'ia-chip');
      btn.type = 'button';
      btn.textContent = label;
      btn.setAttribute('data-q', label);
      chipsEl.appendChild(btn);
    }
  }

  function applyChrome() {
    if (titleEl) titleEl.textContent = t('assistant.title');
    if (sendBtn) sendBtn.textContent = t('assistant.send');
    if (inputEl) inputEl.placeholder = t('assistant.placeholder');
    if (toggleBtn) toggleBtn.setAttribute('aria-label', t('assistant.open'));
    if (toggleLabel) toggleLabel.textContent = t('assistant.openLabel');
    if (closeBtn) closeBtn.setAttribute('aria-label', t('assistant.close'));
    if (logEl && logEl.children.length === 1) {
      var welcomeBubble = logEl.querySelector('.ia-msg__bubble');
      if (welcomeBubble) {
        welcomeBubble.textContent = '';
        appendTextLines(welcomeBubble, t('assistant.welcome'));
      }
    }
    renderChips();
  }

  function setOpen(next) {
    open = !!next;
    if (panel) panel.hidden = !open;
    if (root) {
      if (open) root.classList.add('ia-root--open');
      else root.classList.remove('ia-root--open');
    }
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggleBtn.hidden = open;
    }
    if (open && inputEl) inputEl.focus();
  }

  function submitText(raw) {
    var now = Date.now();
    if (now - lastSend < SEND_GAP_MS) return;
    var text = String(raw || '').replace(/^\s+|\s+$/g, '');
    if (!text) return;
    if (text.length > MAX_LEN) text = text.slice(0, MAX_LEN);
    lastSend = now;
    addMessage('user', { text: text });
    addMessage('assistant', answerMessage(text));
    if (chipsEl) chipsEl.hidden = true;
  }

  function build() {
    root = document.getElementById('assistant-root');
    if (!root) return;

    toggleBtn = el('button', 'ia-toggle');
    toggleBtn.type = 'button';
    toggleBtn.appendChild(mascot('ia-mascot--fab', 44));
    toggleLabel = el('span', 'ia-toggle__label');
    toggleBtn.appendChild(toggleLabel);
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', 'ia-panel');

    panel = el('section', 'ia-panel');
    panel.id = 'ia-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', 'ia-title');

    var head = el('header', 'ia-head');
    var brand = el('div', 'ia-head__brand');
    titleEl = el('h2', 'ia-title');
    titleEl.id = 'ia-title';
    brand.appendChild(mascot('ia-mascot--head', 34));
    brand.appendChild(titleEl);
    closeBtn = el('button', 'ia-close');
    closeBtn.type = 'button';
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
    head.appendChild(brand);
    head.appendChild(closeBtn);

    logEl = el('div', 'ia-log');
    logEl.setAttribute('role', 'log');
    logEl.setAttribute('aria-live', 'polite');

    chipsEl = el('div', 'ia-chips');

    formEl = el('form', 'ia-form');
    inputEl = el('input', 'ia-input');
    inputEl.type = 'text';
    inputEl.maxLength = MAX_LEN;
    inputEl.autocomplete = 'off';
    inputEl.setAttribute('enterkeyhint', 'send');
    sendBtn = el('button', 'ia-send');
    sendBtn.type = 'submit';
    formEl.appendChild(inputEl);
    formEl.appendChild(sendBtn);

    waSlot = el('div', 'ia-wa-slot');

    panel.appendChild(head);
    panel.appendChild(logEl);
    panel.appendChild(chipsEl);
    panel.appendChild(formEl);
    panel.appendChild(waSlot);

    root.appendChild(panel);
    root.appendChild(toggleBtn);

    applyChrome();
    addMessage('assistant', { text: t('assistant.welcome') });

    toggleBtn.addEventListener('click', function () { setOpen(true); });
    closeBtn.addEventListener('click', function () { setOpen(false); });
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      submitText(inputEl.value);
      inputEl.value = '';
    });
    chipsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.ia-chip');
      if (!btn) return;
      submitText(btn.getAttribute('data-q') || btn.textContent);
    });

    if (window.I18N && typeof I18N.onChange === 'function') {
      I18N.onChange(applyChrome);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
}());
