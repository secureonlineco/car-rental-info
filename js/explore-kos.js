/* Explore Kos — category map prototype */
(function () {
  'use strict';

  var DATA = {
    areas: {
      label: 'Area',
      items: [
        { id: 'kos-town',    name: 'Kos Town',    x: 808, y: 188, meta: 'East coast',          text: 'The island capital — harbour, old town and local life.' },
        { id: 'zia',         name: 'Zia',         x: 628, y: 198, meta: 'Mountain village',    text: 'A mountain village known for its sunset views.' },
        { id: 'tigaki',      name: 'Tigaki',      x: 608, y: 128, meta: 'North coast',         text: 'A long sandy beach with shallow, calm water.' },
        { id: 'marmari',     name: 'Marmari',     x: 528, y: 132, meta: 'North coast',         text: 'A quiet north-coast village beside the salt lake.' },
        { id: 'pyli',        name: 'Pyli',        x: 478, y: 208, meta: 'Inland',              text: 'An inland village at the foot of Mount Dikeos.' },
        { id: 'kardamena',   name: 'Kardamena',   x: 428, y: 328, meta: 'South coast',         text: 'Our home village on the south coast of Kos.' },
        { id: 'antimachia',  name: 'Antimachia',  x: 352, y: 228, meta: 'Centre of the island', text: 'A central village near the castle and the airport.' },
        { id: 'mastichari',  name: 'Mastichari',  x: 292, y: 158, meta: 'North-west coast',    text: 'A small fishing harbour on the north-west coast.' },
        { id: 'kefalos',     name: 'Kefalos',     x: 118, y: 228, meta: 'West coast',          text: 'The western bay — clear water and a wide horizon.' },
        { id: 'kamari',      name: 'Kamari',      x: 102, y: 288, meta: 'West coast',          text: 'A quiet west-coast bay below the village of Kefalos.' }
      ]
    },
    beaches: {
      label: 'Beach',
      items: [
        { id: 'tigaki-beach',    name: 'Tigaki Beach',     x: 618, y: 116, meta: 'North coast · sandy',     text: 'Long, shallow and sandy — easy swimming.' },
        { id: 'marmari-beach',   name: 'Marmari Beach',    x: 538, y: 118, meta: 'North coast · sandy',     text: 'A wide north-coast stretch with calm water.' },
        { id: 'paradise-beach',  name: 'Paradise Beach',   x: 168, y: 328, meta: 'South-west · cove',       text: 'A sheltered cove on the south-west coast.' },
        { id: 'agios-stefanos',  name: 'Agios Stefanos',   x: 68,  y: 198, meta: 'West tip · two bays',     text: 'Two small bays facing Kastri islet.' },
        { id: 'camel-beach',     name: 'Camel Beach',      x: 148, y: 322, meta: 'South-west coast',        text: 'A south-west beach named for its dune shape.' },
        { id: 'limnionas',      name: 'Limnionas',        x: 228, y: 162, meta: 'West coast · rocky',      text: 'A rocky west-coast bay with clear water.' },
        { id: 'agios-fokas',     name: 'Agios Fokas',      x: 792, y: 262, meta: 'East of Kos Town',        text: 'A black-pebble beach east of Kos Town.' },
        { id: 'psalidi-beach',   name: 'Psalidi Beach',    x: 828, y: 178, meta: 'North-east shore',        text: 'The north-east shore, close to Kos Town.' }
      ]
    },
    sights: {
      label: 'Landmark',
      items: [
        { id: 'asklepion',         name: 'Asklepion',               x: 748, y: 208, meta: 'Near Kos Town',     text: 'The ancient healing sanctuary above Kos Town.' },
        { id: 'agora',             name: 'Ancient Agora',           x: 798, y: 178, meta: 'Kos Town harbour',  text: 'Open ruins in the heart of the old harbour.' },
        { id: 'castle',            name: 'Castle of the Knights',   x: 822, y: 168, meta: 'Kos Town harbour',  text: 'A harbour fortress at the entrance to Kos Town.' },
        { id: 'plane-tree',        name: "Hippocrates' Plane Tree", x: 792, y: 196, meta: 'Kos Town centre',   text: 'A historic tree in the centre of Kos Town.' },
        { id: 'antimachia-castle', name: 'Antimachia Castle',       x: 338, y: 214, meta: 'Centre of Kos',     text: 'A hilltop fortress in the centre of the island.' },
        { id: 'windmill',          name: 'Windmill of Antimachia',  x: 372, y: 232, meta: 'Antimachia',        text: 'A restored mill beside the village road.' },
        { id: 'plaka',             name: 'Plaka Forest',            x: 392, y: 268, meta: 'Near the airport',  text: 'A pine wood known for its peacocks.' },
        { id: 'alikes',            name: 'Alikes Salt Lake',        x: 578, y: 148, meta: 'North coast',       text: 'A coastal wetland between Tigaki and Marmari.' },
        { id: 'embros',            name: 'Embros Thermae',          x: 708, y: 292, meta: 'South-east shore',  text: 'Natural hot springs on the south-east shore.' }
      ]
    },
    experiences: {
      label: 'Experience',
      items: [
        { id: 'zia-sunset', name: 'Zia Sunset',        x: 622, y: 192, meta: 'Mountain village', text: 'Watch the sun drop behind the Aegean from Zia.' },
        { id: 'dikeos',     name: 'Mountain / Dikeos', x: 548, y: 198, meta: 'Centre of Kos',    text: 'Hill roads and views across the centre of Kos.' },
        { id: 'boat-trips', name: 'Boat Trips',        x: 438, y: 332, meta: 'South coast',      text: 'Day boats along the south coast from Kardamena.' },
        { id: 'thermal',    name: 'Thermal Springs',   x: 708, y: 292, meta: 'South-east shore', text: 'Warm seawater pools at Embros Thermae.' },
        { id: 'villages',   name: 'Local Villages',    x: 478, y: 218, meta: 'Inland Kos',       text: 'Quiet inland squares, tavernas and daily life.' }
      ]
    }
  };

  var catEl    = document.getElementById('ekCats');
  var mapEl    = document.getElementById('ekMap');
  var svgEl    = mapEl ? mapEl.querySelector('.ek-map__canvas') : null;
  var pinsEl   = document.getElementById('ekPins');
  var selectEl = document.getElementById('ekSelect');
  var catLine  = document.getElementById('ekPanelCat');
  var titleEl  = document.getElementById('ekPanelTitle');
  var metaEl   = document.getElementById('ekPanelMeta');
  var textEl   = document.getElementById('ekPanelText');

  var activeCat = 'areas';
  var activeId  = DATA.areas.items[0].id;

  function items() {
    return DATA[activeCat].items;
  }

  function find(id) {
    var list = items();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return list[0];
  }

  function placePins() {
    if (!svgEl || !mapEl || !pinsEl) return;
    var ctm = svgEl.getScreenCTM();
    if (!ctm) return;
    var mapRect = mapEl.getBoundingClientRect();
    var pins = pinsEl.querySelectorAll('.ek-pin');
    for (var i = 0; i < pins.length; i++) {
      var pt = svgEl.createSVGPoint();
      pt.x = parseFloat(pins[i].getAttribute('data-x'));
      pt.y = parseFloat(pins[i].getAttribute('data-y'));
      var loc = pt.matrixTransform(ctm);
      pins[i].style.left = (loc.x - mapRect.left) + 'px';
      pins[i].style.top  = (loc.y - mapRect.top) + 'px';
    }
  }

  function setActive(id) {
    var loc = find(id);
    if (!loc) return;
    activeId = loc.id;

    var pins = pinsEl.querySelectorAll('.ek-pin');
    for (var i = 0; i < pins.length; i++) {
      pins[i].classList.toggle('is-active', pins[i].getAttribute('data-id') === loc.id);
    }

    var chips = selectEl.querySelectorAll('.ek-select__btn');
    for (var j = 0; j < chips.length; j++) {
      var on = chips[j].getAttribute('data-id') === loc.id;
      chips[j].classList.toggle('is-active', on);
      chips[j].setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) chips[j].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    if (catLine) catLine.textContent = DATA[activeCat].label;
    if (titleEl) titleEl.textContent = loc.name;
    if (metaEl)  metaEl.textContent  = loc.meta || '';
    if (textEl)  textEl.textContent  = loc.text;
  }

  function renderCategory() {
    var list = items();
    var htmlPins = '';
    var htmlChips = '';

    for (var i = 0; i < list.length; i++) {
      var loc = list[i];
      htmlPins += '<button type="button" class="ek-pin" data-id="' + loc.id +
        '" data-x="' + loc.x + '" data-y="' + loc.y +
        '" aria-label="' + loc.name + '"></button>';
      htmlChips += '<button type="button" class="ek-select__btn" data-id="' + loc.id +
        '" role="tab" aria-selected="false">' + loc.name + '</button>';
    }

    pinsEl.innerHTML = htmlPins;
    selectEl.innerHTML = htmlChips;

    var pinBtns = pinsEl.querySelectorAll('.ek-pin');
    for (var p = 0; p < pinBtns.length; p++) {
      pinBtns[p].addEventListener('click', function () {
        setActive(this.getAttribute('data-id'));
      });
    }

    var chipBtns = selectEl.querySelectorAll('.ek-select__btn');
    for (var c = 0; c < chipBtns.length; c++) {
      chipBtns[c].addEventListener('click', function () {
        setActive(this.getAttribute('data-id'));
      });
    }

    setActive(list[0].id);
    requestAnimationFrame(placePins);
  }

  function setCategory(cat) {
    if (!DATA[cat]) return;
    activeCat = cat;

    var btns = catEl.querySelectorAll('.ek-cats__btn');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-cat') === cat;
      btns[i].classList.toggle('is-active', on);
      btns[i].setAttribute('aria-selected', on ? 'true' : 'false');
    }

    renderCategory();

    var activeCatBtn = catEl.querySelector('.ek-cats__btn.is-active');
    if (activeCatBtn && activeCatBtn.scrollIntoView) {
      activeCatBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }

  if (catEl) {
    var catBtns = catEl.querySelectorAll('.ek-cats__btn');
    for (var k = 0; k < catBtns.length; k++) {
      catBtns[k].addEventListener('click', function () {
        setCategory(this.getAttribute('data-cat'));
      });
    }
  }

  window.addEventListener('resize', function () {
    requestAnimationFrame(placePins);
  });

  var rgBack = document.getElementById('rgBack');
  if (rgBack) {
    rgBack.addEventListener('click', function (e) {
      if (window.history.length > 1 && document.referrer) {
        e.preventDefault();
        history.back();
      }
    });
  }

  renderCategory();
})();
