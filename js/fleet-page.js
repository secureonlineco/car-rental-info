/* ═══════════════════════════════════════════════════════════════
   International Rent A Car — Full Fleet Page Script
   Vanilla JS · No dependencies · fleet.html only
   Requires: js/app.js (nav, mobile menu, Check Availability modal)
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── SHARED ICON MARKUP (matches homepage fleet-card__spec icons) ─── */
  var ICON = {
    passenger: '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><circle cx="7.5" cy="4" r="2.3" stroke="#CC2228" stroke-width="1.35"/><path d="M2 13.5c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="#CC2228" stroke-width="1.35" stroke-linecap="round"/></svg>',
    door:      '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><rect x="2.5" y="1.5" width="10" height="12" rx="1.5" stroke="#CC2228" stroke-width="1.35"/><circle cx="10.5" cy="7.5" r="0.9" fill="#CC2228"/></svg>',
    manual:    '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><circle cx="4" cy="3.5" r="1.4" stroke="#CC2228" stroke-width="1.3"/><circle cx="11" cy="3.5" r="1.4" stroke="#CC2228" stroke-width="1.3"/><circle cx="4" cy="11.5" r="1.4" stroke="#CC2228" stroke-width="1.3"/><path d="M4 4.9v5.2M11 4.9V8H4" stroke="#CC2228" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    automatic: '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M3.5 7.5A4 4 0 1111.5 7.5" stroke="#CC2228" stroke-width="1.35" stroke-linecap="round"/><path d="M11.5 5v2.5H9" stroke="#CC2228" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ac:        '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M7.5 1.5v12M1.5 7.5h12M4 4l7 7M11 4l-7 7" stroke="#CC2228" stroke-width="1.35" stroke-linecap="round"/></svg>',
    luggage:   '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><rect x="3" y="5.5" width="9" height="7.5" rx="1.3" stroke="#CC2228" stroke-width="1.35"/><path d="M5 5.5V4.2A1.3 1.3 0 016.3 2.9h2.4A1.3 1.3 0 0110 4.2v1.3" stroke="#CC2228" stroke-width="1.35" stroke-linecap="round"/></svg>',
    fuel:      '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M3 13.5V5A1.5 1.5 0 014.5 3.5h5A1.5 1.5 0 0111 5v4" stroke="#CC2228" stroke-width="1.35" stroke-linecap="round"/><path d="M3 10h8" stroke="#CC2228" stroke-width="1.35" stroke-linecap="round"/><path d="M11 7l2 1.5v4a.9.9 0 01-1.8 0V8.5" stroke="#CC2228" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    car:       '<svg width="40" height="40" viewBox="0 0 34 34" fill="none" aria-hidden="true"><path d="M4.5 20.5L7.8 12H26.2L29.5 20.5" stroke="#CC2228" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><rect x="3.5" y="20" width="27" height="7" rx="2.8" stroke="#CC2228" stroke-width="1.7"/><circle cx="9.5" cy="27.5" r="2" stroke="#CC2228" stroke-width="1.7" fill="none"/><circle cx="24.5" cy="27.5" r="2" stroke="#CC2228" stroke-width="1.7" fill="none"/><path d="M13 16.5h8" stroke="#CC2228" stroke-width="1.7" stroke-linecap="round"/></svg>',
    close:     '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };

  /* ─── FULL FLEET DATA ─────────────────────────────────────────
     img: null  → no approved photo exists yet; a placeholder is shown.
     Passengers / doors / transmission / fuel are verified International
     business values. Luggage is intentionally not used or displayed.
  ──────────────────────────────────────────────────────────────── */
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

  var IMG_BASE = 'assets/images/fleet/cards/';
  var PAGE_SIZE = 8;

  /* Assign a stable id once, up front. Display labels are resolved
     through I18N at render time — vehicle specs themselves stay unchanged. */
  VEHICLES.forEach(function (v, i) {
    v.id = i;
  });

  /* ─── STATE ───────────────────────────────────────────────────── */
  var state = {
    category: 'all',
    transmission: 'all',
    fuel: 'all',
    passengers: 'all',
    sort: 'recommended',
    view: 'grid',
    page: 1
  };

  /* ─── DOM REFS ────────────────────────────────────────────────── */
  var catBar      = document.getElementById('fleetCats');
  var selTrans    = document.getElementById('filterTransmission');
  var selFuel     = document.getElementById('filterFuel');
  var selPass     = document.getElementById('filterPassengers');
  var selSort     = document.getElementById('fleetSort');
  var viewBtns    = Array.prototype.slice.call(document.querySelectorAll('.fleetpg-view-btn'));
  var gridEl      = document.getElementById('fleetGrid');
  var countEl     = document.getElementById('fleetCount');
  var emptyEl     = document.getElementById('fleetEmpty');
  var paginationEl= document.getElementById('fleetPagination');

  var detailsModal   = document.getElementById('detailsModal');
  var detailsClose   = document.getElementById('detailsModalClose');
  var detailsImgWrap = document.getElementById('detailsModalImgWrap');
  var detailsGroup   = document.getElementById('detailsModalGroup');
  var detailsName    = document.getElementById('detailsModalName');
  var detailsSpecs   = document.getElementById('detailsModalSpecs');
  var detailsPrice   = document.getElementById('detailsModalPrice'); /* kept; price UI currently hidden */
  var detailsCta     = document.getElementById('detailsModalCta');

  if (!gridEl) return; /* Not on fleet.html */

  /* ─── HELPERS ─────────────────────────────────────────────────── */
  function t(key, vars) {
    return (window.I18N && typeof I18N.t === 'function') ? I18N.t(key, vars) : '';
  }

  function groupLabel(v) {
    return t('fleet.groupLabel', { group: v.group });
  }

  function exampleName(v) {
    return t('fleet.orSimilar', { name: v.name });
  }

  function transLabel(value) {
    return t(value === 'Automatic' ? 'fleet.transmission.automatic' : 'fleet.transmission.manual');
  }

  function fuelLabel(value) {
    if (value === 'Electric') return t('fleet.fuel.electric');
    if (value === 'Diesel') return t('fleet.fuel.diesel');
    if (value === 'Plug-in Hybrid') return t('fleet.fuel.pluginHybrid');
    return t('fleet.fuel.petrol');
  }

  function transIcon(tr) { return tr === 'Automatic' ? ICON.automatic : ICON.manual; }

  function specRow(icon, label) {
    return '<li class="fleet-card__spec">' + icon + '<span>' + label + '</span></li>';
  }

  function specsMarkup(v) {
    return (
      specRow(ICON.passenger, t('fleet.spec.passengers', { n: v.passengers })) +
      specRow(ICON.door,      t('fleet.spec.doors', { n: v.doors })) +
      specRow(transIcon(v.transmission), transLabel(v.transmission)) +
      specRow(ICON.ac,        t('fleet.spec.airConditioning')) +
      specRow(ICON.fuel,      fuelLabel(v.fuel))
    );
  }

  function webpName(img) {
    return img.replace(/(\.png)+$/i, '.webp');
  }

  function imageMarkup(v) {
    if (v.img) {
      return (
        '<picture>' +
          '<source type="image/webp" srcset="' + IMG_BASE + webpName(v.img) + '">' +
          '<img src="' + IMG_BASE + v.img + '" alt="' + t('fleet.cardAria', { group: v.group, name: v.name }) + '" width="1536" height="1024" loading="lazy" decoding="async" />' +
        '</picture>'
      );
    }
    return (
      '<div class="fleetpg-noimg" role="img" aria-label="' + t('fleet.photoSoonAria', { name: v.name }) + '">' +
        ICON.car +
        '<span>' + t('fleet.photoSoon') + '</span>' +
      '</div>'
    );
  }

  function cardMarkup(v) {
    var groupText = groupLabel(v);
    var example = exampleName(v);
    return (
      '<article class="fleetpg-card" role="listitem" data-id="' + v.id + '">' +
        '<div class="fleet-card__img-wrap fleetpg-card__img-wrap">' +
          imageMarkup(v) +
        '</div>' +
        '<div class="fleet-card__body fleetpg-card__body">' +
          '<div class="fleet-card__head">' +
            '<p class="fleet-card__group">' + groupText + '</p>' +
            '<p class="fleet-card__example">' + example + '</p>' +
          '</div>' +
          '<ul class="fleet-card__specs" aria-label="' + t('fleet.specsAria') + '">' +
            specsMarkup(v) +
          '</ul>' +
          '<div class="fleetpg-card__footer">' +
            '<div class="fleetpg-card__actions">' +
              '<button type="button" class="fleetpg-card__details" data-details-id="' + v.id + '">' + t('buttons.viewDetails') + '</button>' +
              '<button type="button" class="fleet-card__cta" data-group="' + groupText + '" data-vehicle="' + example + '" data-group-code="' + v.group + '" data-name="' + v.name + '">' +
                '\uD83D\uDCAC ' + t('buttons.checkAvailability') +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  /* ─── FILTER + SORT ───────────────────────────────────────────── */
  function getFiltered() {
    return VEHICLES.filter(function (v) {
      if (state.category !== 'all' && v.group !== state.category) return false;
      if (state.transmission !== 'all' && v.transmission !== state.transmission) return false;
      if (state.fuel !== 'all' && v.fuel !== state.fuel) return false;
      if (state.passengers !== 'all' && v.passengers < parseInt(state.passengers, 10)) return false;
      return true;
    });
  }

  var GROUP_ORDER = ['A', 'B', 'B1', 'C', 'C1', 'D', 'E', 'F', 'G', 'H'];
  function getSorted(list) {
    var arr = list.slice();
    if (state.sort === 'price-asc') {
      arr.sort(function (a, b) { return a.price - b.price; });
    } else if (state.sort === 'price-desc') {
      arr.sort(function (a, b) { return b.price - a.price; });
    } else {
      arr.sort(function (a, b) { return GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.price - b.price; });
    }
    return arr;
  }

  /* ─── RENDER ──────────────────────────────────────────────────── */
  function renderCount(n) {
    if (!countEl) return;
    if (n === 0) countEl.textContent = t('fleet.count.none');
    else if (n === 1) countEl.textContent = t('fleet.count.one');
    else countEl.textContent = t('fleet.count.many', { n: n });
  }

  function renderPagination(totalPages) {
    if (!paginationEl) return;
    paginationEl.innerHTML = '';
    if (totalPages <= 1) return;

    function pageBtn(label, page, opts) {
      opts = opts || {};
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fleetpg-page' + (opts.active ? ' fleetpg-page--active' : '');
      b.textContent = label;
      if (opts.disabled) { b.disabled = true; }
      else {
        b.addEventListener('click', function () {
          state.page = page;
          render();
          gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
      return b;
    }

    paginationEl.appendChild(pageBtn('\u2039', state.page - 1, { disabled: state.page <= 1 }));
    for (var p = 1; p <= totalPages; p++) {
      paginationEl.appendChild(pageBtn(String(p), p, { active: p === state.page }));
    }
    paginationEl.appendChild(pageBtn('\u203A', state.page + 1, { disabled: state.page >= totalPages }));
  }

  function render() {
    var filtered = getFiltered();
    var sorted   = getSorted(filtered);
    var totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;

    var start = (state.page - 1) * PAGE_SIZE;
    var pageItems = sorted.slice(start, start + PAGE_SIZE);

    gridEl.className = 'fleetpg-grid' + (state.view === 'list' ? ' fleetpg-grid--list' : '');
    gridEl.innerHTML = pageItems.map(cardMarkup).join('');

    renderCount(sorted.length);
    renderPagination(totalPages);

    if (emptyEl) emptyEl.hidden = sorted.length !== 0;
    gridEl.hidden = sorted.length === 0;
  }

  /* ─── DETAILS MODAL ───────────────────────────────────────────── */
  var lastDetailsId = null;

  function openDetails(id) {
    var v = VEHICLES[id];
    if (!v || !detailsModal) return;
    lastDetailsId = id;

    if (detailsImgWrap) detailsImgWrap.innerHTML = imageMarkup(v);
    if (detailsGroup)   detailsGroup.textContent  = groupLabel(v);
    if (detailsName)    detailsName.textContent   = exampleName(v);
    if (detailsSpecs)   detailsSpecs.innerHTML    = specsMarkup(v);
    if (detailsCta) {
      detailsCta.setAttribute('data-group', groupLabel(v));
      detailsCta.setAttribute('data-vehicle', exampleName(v));
      detailsCta.setAttribute('data-group-code', v.group);
      detailsCta.setAttribute('data-name', v.name);
    }

    detailsModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { detailsModal.classList.add('fleetpg-modal--open'); });
    });
  }

  function closeDetails() {
    if (!detailsModal) return;
    detailsModal.classList.remove('fleetpg-modal--open');
    document.body.style.overflow = '';
    setTimeout(function () { detailsModal.setAttribute('hidden', ''); }, 260);
  }

  if (detailsClose) detailsClose.addEventListener('click', closeDetails);
  if (detailsModal) {
    detailsModal.addEventListener('click', function (e) {
      if (e.target === detailsModal) closeDetails();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && detailsModal && !detailsModal.hasAttribute('hidden')) closeDetails();
  });
  /* Close the details modal automatically when its own CTA hands off to the
     shared Check Availability modal (delegated listener lives in app.js). */
  if (detailsCta) {
    detailsCta.addEventListener('click', function () { closeDetails(); });
  }

  /* ─── EVENTS ──────────────────────────────────────────────────── */
  gridEl.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-details-id]');
    if (btn) openDetails(parseInt(btn.getAttribute('data-details-id'), 10));
  });

  if (catBar) {
    catBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.fleetpg-cat');
      if (!btn) return;
      Array.prototype.slice.call(catBar.querySelectorAll('.fleetpg-cat')).forEach(function (b) {
        b.classList.remove('fleetpg-cat--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('fleetpg-cat--active');
      btn.setAttribute('aria-selected', 'true');
      state.category = btn.getAttribute('data-cat');
      state.page = 1;
      render();
    });
  }

  if (selTrans) selTrans.addEventListener('change', function () { state.transmission = selTrans.value; state.page = 1; render(); });
  if (selFuel)  selFuel.addEventListener('change',  function () { state.fuel = selFuel.value; state.page = 1; render(); });
  if (selPass)  selPass.addEventListener('change',  function () { state.passengers = selPass.value; state.page = 1; render(); });
  if (selSort)  selSort.addEventListener('change',  function () { state.sort = selSort.value; state.page = 1; render(); });

  viewBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      viewBtns.forEach(function (b) { b.classList.remove('fleetpg-view-btn--active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('fleetpg-view-btn--active');
      btn.setAttribute('aria-pressed', 'true');
      state.view = btn.getAttribute('data-view');
      render();
    });
  });

  /* ─── INITIAL RENDER ──────────────────────────────────────────── */
  render();

  if (window.I18N && typeof I18N.onChange === 'function') {
    I18N.onChange(function () {
      render();
      if (detailsModal && !detailsModal.hasAttribute('hidden') && lastDetailsId != null) {
        openDetails(lastDetailsId);
      }
    });
  }

}());
