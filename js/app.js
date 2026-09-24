/* ═══════════════════════════════════════════════════════════════
   International Rent A Car — App Script
   Vanilla JS · No dependencies · Production-ready
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── DOM REFS ────────────────────────────────────────────────── */
  var nav           = document.getElementById('nav');
  var navBurger     = document.getElementById('navBurger');
  var mobMenu       = document.getElementById('mobMenu');
  var mobMenuBg     = document.getElementById('mobMenuBg');
  var mobMenuClose  = document.getElementById('mobMenuClose');
  var heroSlides    = Array.prototype.slice.call(document.querySelectorAll('.hero__slide'));
  var heroDots      = Array.prototype.slice.call(document.querySelectorAll('.hero__dot'));

  /* ─── NAV SCROLL ──────────────────────────────────────────────── */
  var scrollTicking = false;

  function updateNav() {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }
    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(updateNav);
      scrollTicking = true;
    }
  }, { passive: true });

  /* Run once on load in case page was scrolled (e.g. back navigation) */
  updateNav();

  /* ─── MOBILE MENU ─────────────────────────────────────────────── */
  function openMenu() {
    if (!mobMenu) return;
    mobMenu.setAttribute('aria-hidden', 'false');
    if (navBurger) {
      navBurger.setAttribute('aria-expanded', 'true');
      navBurger.classList.add('open');
    }
    document.body.style.overflow = 'hidden';
    var focusable = mobMenu.querySelector('button, a');
    if (focusable) setTimeout(function () { focusable.focus(); }, 60);
  }

  function closeMenu() {
    if (!mobMenu) return;
    mobMenu.setAttribute('aria-hidden', 'true');
    if (navBurger) {
      navBurger.setAttribute('aria-expanded', 'false');
      navBurger.classList.remove('open');
    }
    document.body.style.overflow = '';
    if (navBurger) navBurger.focus();
  }

  if (navBurger)    navBurger.addEventListener('click',    openMenu);
  if (mobMenuClose) mobMenuClose.addEventListener('click', closeMenu);
  if (mobMenuBg)    mobMenuBg.addEventListener('click',    closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobMenu && mobMenu.getAttribute('aria-hidden') === 'false') {
      closeMenu();
    }
  });

  if (mobMenu) {
    var menuLinks = mobMenu.querySelectorAll('.mob-menu__link, .mob-menu__cta');
    for (var i = 0; i < menuLinks.length; i++) {
      menuLinks[i].addEventListener('click', closeMenu);
    }
  }

  /* ─── HERO SLIDER ─────────────────────────────────────────────── */
  var currentSlide = 0;
  var slideTimer   = null;

  function hydrateHeroSlide(slide) {
    if (!slide || slide.getAttribute('data-hero-ready') === '1') return;
    var sources = slide.querySelectorAll('source[data-srcset]');
    for (var i = 0; i < sources.length; i++) {
      sources[i].srcset = sources[i].getAttribute('data-srcset');
    }
    var img = slide.querySelector('img[data-src]');
    if (img && !img.getAttribute('src')) {
      img.src = img.getAttribute('data-src');
    }
    slide.setAttribute('data-hero-ready', '1');
  }

  function hydrateHeroSlideAndNext(index) {
    if (!heroSlides.length) return;
    var safe = (index % heroSlides.length + heroSlides.length) % heroSlides.length;
    hydrateHeroSlide(heroSlides[safe]);
    if (heroSlides.length > 1) {
      hydrateHeroSlide(heroSlides[(safe + 1) % heroSlides.length]);
    }
  }

  function goToSlide(index) {
    if (!heroSlides.length) return;

    /* Deactivate current */
    heroSlides[currentSlide].classList.remove('active');
    if (heroDots[currentSlide]) {
      heroDots[currentSlide].classList.remove('active');
      heroDots[currentSlide].setAttribute('aria-selected', 'false');
    }

    /* Activate next */
    currentSlide = (index % heroSlides.length + heroSlides.length) % heroSlides.length;
    hydrateHeroSlideAndNext(currentSlide);
    heroSlides[currentSlide].classList.add('active');
    if (heroDots[currentSlide]) {
      heroDots[currentSlide].classList.add('active');
      heroDots[currentSlide].setAttribute('aria-selected', 'true');
    }
  }

  function startSlider() {
    if (heroSlides.length < 2) return;
    slideTimer = setInterval(function () {
      goToSlide(currentSlide + 1);
    }, 8000);
  }

  function resetSlider() {
    clearInterval(slideTimer);
    startSlider();
  }

  for (var d = 0; d < heroDots.length; d++) {
    (function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-slide'), 10);
        if (!isNaN(idx)) {
          goToSlide(idx);
          resetSlider();
        }
      });
    })(heroDots[d]);
  }

  if (heroSlides[0]) {
    heroSlides[0].setAttribute('data-hero-ready', '1');
    var firstHeroImg = heroSlides[0].querySelector('img');
    function hydrateNextAfterFirst() {
      if (heroSlides.length > 1) hydrateHeroSlide(heroSlides[1]);
    }
    if (firstHeroImg && firstHeroImg.complete) {
      hydrateNextAfterFirst();
    } else if (firstHeroImg) {
      firstHeroImg.addEventListener('load', hydrateNextAfterFirst);
    }
  }

  startSlider();

  /* ─── SMOOTH ANCHOR SCROLLING ─────────────────────────────────── */
  var anchors = document.querySelectorAll('a[href^="#"]');
  for (var a = 0; a < anchors.length; a++) {
    anchors[a].addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;
      var targetId = href.slice(1);
      var target   = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      var navH = nav ? nav.offsetHeight : 0;
      var top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  /* ─── FOOTER YEAR (auto-update) ────────────────────────────────── */
  var copyEl = document.querySelector('.footer__copy');
  if (copyEl) {
    var year = new Date().getFullYear();
    if (window.I18N && typeof I18N.t === 'function') {
      copyEl.textContent = I18N.t('footer.copyright', { year: year });
    } else {
      copyEl.innerHTML = copyEl.innerHTML.replace(/\d{4}/, year);
    }
  }

  /* ─── QUICK ACCESS — entrance animation ────────────────────────
     Desktop / tablet (≥640px):
       • Staggered qaFadeUp entrance, then .shown enables hover styles.
     Mobile (<640px):
       • No stagger — all cards shown instantly.
       • Scroll / snap / focus is handled by initPremiumCarousel
         (same engine as Our Fleet).
  ─────────────────────────────────────────────────────────────────── */
  var qaCards = Array.prototype.slice.call(document.querySelectorAll('.qa-card'));

  if (window.innerWidth >= 640) {
    /* Desktop / tablet: staggered fade-up */
    var qaAnimMs    = 560;
    var qaBaseDelay = 320;
    var qaStagger   = 90;
    for (var qi = 0; qi < qaCards.length; qi++) {
      (function (card, i) {
        var startAt  = qaBaseDelay + i * qaStagger;
        var finishAt = startAt + qaAnimMs + 50;
        setTimeout(function () { card.classList.add('visible'); },  startAt);
        setTimeout(function () {
          card.classList.remove('visible');
          card.classList.add('shown');
        }, finishAt);
      })(qaCards[qi], qi);
    }
  } else {
    qaCards.forEach(function (card) { card.classList.add('shown'); });
  }

  /* ─── FLEET CARDS — entrance animation + mobile carousel ──────────
     Desktop / tablet (≥640px):
       • Each card individually observed; staggered fleetFadeUp on entry.
     Mobile (<640px):
       • Cards live in a horizontal scroll carousel; only the first is
         in the viewport initially. Observe the section instead, and
         reveal all cards at once when it enters view.
  ─────────────────────────────────────────────────────────────────── */
  var fleetCards   = Array.prototype.slice.call(document.querySelectorAll('.fleet-card'));
  var fleetAnimMs  = 480;  /* must match @keyframes fleetFadeUp duration */
  var fleetStagger = 80;   /* ms between each subsequent card */

  if (fleetCards.length) {
    if ('IntersectionObserver' in window) {

      if (window.innerWidth < 640) {
        /* ── Mobile: reveal all cards when the section scrolls in ──
           Individual cards are governed by the carousel's own
           opacity/scale state (active/far), so per-card fade-up
           would be invisible here. Instead, the horizontal track
           itself gets one subtle fade + upward settle as the
           section enters view — same soft, one-time reveal feel
           as desktop, applied at the container level. ─────────── */
        var fleetSection = document.getElementById('fleet');
        var fleetGridEl  = document.querySelector('.fleet-grid');
        var fleetMobObs  = new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting) return;
          if (fleetGridEl) fleetGridEl.classList.add('fleet-grid--shown');
          fleetCards.forEach(function (card) { card.classList.add('fleet-shown'); });
          fleetMobObs.disconnect();
        }, { threshold: 0.15 });
        if (fleetSection) fleetMobObs.observe(fleetSection);
        else {
          if (fleetGridEl) fleetGridEl.classList.add('fleet-grid--shown');
          fleetCards.forEach(function (c) { c.classList.add('fleet-shown'); });
        }

      } else {
        /* ── Desktop / tablet: staggered per-card entrance ───────── */
        var fleetObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var card = entry.target;
            var idx  = fleetCards.indexOf(card);
            setTimeout(function () {
              card.classList.add('fleet-in');
              setTimeout(function () {
                card.classList.remove('fleet-in');
                card.classList.add('fleet-shown');
              }, fleetAnimMs + 50);
            }, idx * fleetStagger);
            fleetObs.unobserve(card);
          });
        }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });
        fleetCards.forEach(function (card) { fleetObs.observe(card); });
      }

    } else {
      /* Fallback: no IntersectionObserver — show all cards immediately */
      fleetCards.forEach(function (card) { card.classList.add('fleet-shown'); });
    }
  }

  /* ─── INFO CARDS — entrance animation (desktop) + carousel (mobile) ─
     Desktop/tablet (≥640px): staggered fleetFadeUp-style entrance.
     Mobile (<640px): all cards revealed immediately; center-mode
     carousel handles scale / opacity / elevation via JS classes.
  ─────────────────────────────────────────────────────────────────── */
  var infoCards   = Array.prototype.slice.call(document.querySelectorAll('.info-card'));
  var infoAnimMs  = 480;
  var infoStagger = 80;

  if (infoCards.length) {
    if (window.innerWidth < 640) {
      /* Mobile: show all cards immediately so the carousel can style them */
      infoCards.forEach(function (card) { card.classList.add('info-shown'); });

    } else if ('IntersectionObserver' in window) {
      /* Desktop: staggered per-card entrance animation */
      var infoObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var card = entry.target;
          var idx  = infoCards.indexOf(card);
          setTimeout(function () {
            card.classList.add('info-in');
            setTimeout(function () {
              card.classList.remove('info-in');
              card.classList.add('info-shown');
            }, infoAnimMs + 50);
          }, idx * infoStagger);
          infoObs.unobserve(card);
        });
      }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });
      infoCards.forEach(function (card) { infoObs.observe(card); });

    } else {
      infoCards.forEach(function (card) { card.classList.add('info-shown'); });
    }
  }

  /* ─── PREMIUM CAROUSEL — SHARED ENGINE ────────────────────────────
     Center-mode scroll carousel with scale / opacity / shadow states
     and synced pagination dots. One instance per section.

     trackEl — the .prem-carousel__track scroll container
     dotsEl  — the .prem-carousel__dots pagination bar (may be null)
  ─────────────────────────────────────────────────────────────────── */
  function initPremiumCarousel(trackEl, dotsEl, alwaysOn) {
    if (!trackEl) return;

    var cards   = Array.prototype.slice.call(trackEl.querySelectorAll('.prem-carousel__card'));
    var dots    = dotsEl ? Array.prototype.slice.call(dotsEl.querySelectorAll('.prem-carousel__dot')) : [];
    var ticking = false;

    function isCarouselActive() {
      return !!alwaysOn || window.innerWidth < 640;
    }

    function updateDots(activeIdx) {
      dots.forEach(function (dot, i) {
        var on = (i === activeIdx);
        dot.classList.toggle('prem-carousel__dot--active', on);
        dot.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }

    function update() {
      ticking = false;
      if (!isCarouselActive() || !cards.length) return;

      /* Find card whose centre is closest to the track's centre */
      var rect    = trackEl.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var best = 0, bestDist = Infinity;

      cards.forEach(function (card, i) {
        var r    = card.getBoundingClientRect();
        var dist = Math.abs(r.left + r.width / 2 - centerX);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });

      /* Apply opacity / shadow state classes (all carousels) */
      cards.forEach(function (card, i) {
        var d = Math.abs(i - best);
        card.classList.remove('prem-carousel__card--active', 'prem-carousel__card--far');
        if      (d === 0) card.classList.add('prem-carousel__card--active');
        else if (d >= 2)  card.classList.add('prem-carousel__card--far');
        /* d === 1: neighbour — default CSS (scale 0.93, opacity 0.85) */
      });

      updateDots(best);
    }

    /* rAF-throttled scroll listener */
    trackEl.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    });

    /* Dot click → scroll matching card to centre */
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (!isCarouselActive() || !cards[i]) return;
        cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    });

    /* Initial render */
    update();
  }

  /* ─── EXPLORE KOS — DESTINATION DATA ──────────────────────────────
     Stable fields: id, image, googleMapsQuery.
     Customer-facing copy lives under locales.<lang> so later languages
     can add name / description / highlights without changing this shape. */
  var EXPLORE_DESTINATIONS = [
    {
      id: 'kos-town',
      image: 'assets/images/explore/kos-town.png',
      googleMapsQuery: 'Kos Town, Kos, Greece',
      locales: {
        en: {
          name: 'Kos Town',
          description: 'The vibrant capital of Kos, where the historic harbor, medieval castle, ancient landmarks and lively waterfront come together in the heart of the island.',
          highlights: ['Historic Harbor', 'Neratzia Castle', 'Old Town', 'Hippocrates\' Plane Tree']
        },
        de: {
          name: 'Kos-Stadt',
          description: 'Die lebendige Hauptstadt von Kos, in der sich historischer Hafen, mittelalterliche Burg, antike Sehenswürdigkeiten und die belebte Uferpromenade im Herzen der Insel vereinen.',
          highlights: ['Historischer Hafen', 'Burg Neratzia', 'Altstadt', 'Platane des Hippokrates']
        },
        fr: {
          name: 'Ville de Kos',
          description: 'La capitale animée de Kos, où le port historique, le château médiéval, les sites antiques et le front de mer animé se rejoignent au cœur de l’île.',
          highlights: ['Port historique', 'Château de Neratzia', 'Vieille ville', 'Platane d’Hippocrate']
        },
        it: {
          name: 'Città di Kos',
          description: 'La vivace capitale di Kos, dove il porto storico, il castello medievale, i monumenti antichi e il lungomare animato si incontrano nel cuore dell’isola.',
          highlights: ['Porto storico', 'Castello di Neratzia', 'Città vecchia', 'Platano di Ippocrate']
        },
        nl: {
          name: 'Kos-stad',
          description: 'De levendige hoofdstad van Kos, waar de historische haven, het middeleeuwse kasteel, antieke bezienswaardigheden en de bruisende waterkant samenkomen in het hart van het eiland.',
          highlights: ['Historische haven', 'Kasteel Neratzia', 'Oude stad', 'Plataan van Hippocrates']
        },
        pl: {
          name: "Kos (miasto)",
          description: "Tętniąca życiem stolica Kos, w której historyczny port, średniowieczny zamek, antyczne zabytki i ożywiony bulwar spotykają się w sercu wyspy.",
          highlights: ["Historyczny port", "Zamek Neratzia", "Stare Miasto", "Platan Hipokratesa"]
        },
        ru: {
          name: "Город Кос",
          description: "Живая столица Коса, где историческая гавань, средневековый замок, античные памятники и оживлённая набережная сходятся в самом сердце острова.",
          highlights: ["Историческая гавань", "Замок Нерация", "Старый город", "Платан Гиппократа"]
        },
        cs: {
          name: "Město Kós",
          description: "Živoucí hlavní město Kósu, kde se historický přístav, středověký hrad, antické památky a rušné nábřeží setkávají v srdci ostrova.",
          highlights: ["Historický přístav", "Hrad Neratzia", "Staré město", "Platán Hippokrata"]
        },
        sv: {
          name: "Kos stad",
          description: "Den livliga huvudstaden på Kos, där den historiska hamnen, det medeltida slottet, antika sevärdheter och den livliga strandpromenaden möts i öns hjärta.",
          highlights: ["Historisk hamn", "Slottet Neratzia", "Gamla stan", "Hippokrates platan"]
        },
        da: {
          name: "Kos by",
          description: "Den livlige hovedstad på Kos, hvor den historiske havn, det middelalderlige slot, antikke seværdigheder og den travle havnefront mødes i øens hjerte.",
          highlights: ["Historisk havn", "Neratzia-slottet", "Den gamle bydel", "Hippokrates’ platan"]
        },
        no: {
          name: "Kos by",
          description: "Den livlige hovedstaden på Kos, der den historiske havnen, det middelalderske slottet, antikke severdigheter og den travle sjøfronten møtes i hjertet av øya.",
          highlights: ["Historisk havn", "Neratzia-slottet", "Gamlebyen", "Hippokrates’ platan"]
        },
        fi: {
          name: "Kosin kaupunki",
          description: "Kosin elävä pääkaupunki, jossa historiallinen satama, keskiaikainen linna, antiikin nähtävyydet ja vilkas rantakatu kohtaavat saaren sydämessä.",
          highlights: ["Historiallinen satama", "Neratzian linna", "Vanha kaupunki", "Hippokrateen plataani"]
        }
      }
    },
    {
      id: 'zia',
      image: 'assets/images/explore/zia.png',
      googleMapsQuery: 'Zia, Kos, Greece',
      locales: {
        en: {
          name: 'Zia',
          description: 'A traditional mountain village on the slopes of Mount Dikeos, known for its picturesque alleys, local cuisine and panoramic views across Kos and the nearby islands. Zia is also renowned for its beautiful sunset views.',
          highlights: ['Mount Dikeos', 'Traditional village', 'Panoramic views', 'Sunset views']
        },
        de: {
          name: 'Zia',
          description: 'Ein traditionelles Bergdorf an den Hängen des Berges Dikeos, bekannt für malerische Gassen, lokale Küche und Panoramablicke über Kos und die benachbarten Inseln. Zia ist außerdem berühmt für seine schönen Sonnenuntergänge.',
          highlights: ['Berg Dikeos', 'Traditionelles Dorf', 'Panoramablicke', 'Sonnenuntergänge']
        },
        fr: {
          name: 'Zia',
          description: 'Un village de montagne traditionnel sur les pentes du mont Dikéos, réputé pour ses ruelles pittoresques, sa cuisine locale et ses vues panoramiques sur Kos et les îles voisines. Zia est également célèbre pour ses magnifiques couchers de soleil.',
          highlights: ['Mont Dikéos', 'Village traditionnel', 'Vues panoramiques', 'Couchers de soleil']
        },
        it: {
          name: 'Zia',
          description: 'Un tradizionale villaggio di montagna alle pendici del monte Dikeos, noto per i vicoli pittoreschi, la cucina locale e le viste panoramiche su Kos e le isole vicine. Zia è anche rinomata per i suoi splendidi tramonti.',
          highlights: ['Monte Dikeos', 'Villaggio tradizionale', 'Viste panoramiche', 'Tramonti']
        },
        nl: {
          name: 'Zia',
          description: 'Een traditioneel bergdorp op de hellingen van de berg Dikeos, bekend om zijn schilderachtige steegjes, lokale keuken en panoramische uitzichten over Kos en de naburige eilanden. Zia staat ook bekend om zijn prachtige zonsondergangen.',
          highlights: ['Berg Dikeos', 'Traditioneel dorp', 'Panoramische uitzichten', 'Zonsondergangen']
        },
        pl: {
          name: "Zia",
          description: "Tradycyjna górska wioska na zboczach góry Dikeos, znana z malowniczych uliczek, lokalnej kuchni i panoramicznych widoków na Kos i pobliskie wyspy. Zia słynie też z pięknych zachodów słońca.",
          highlights: ["Góra Dikeos", "Tradycyjna wioska", "Panoramiczne widoki", "Zachody słońca"]
        },
        ru: {
          name: "Зия",
          description: "Традиционная горная деревня на склонах горы Дикеос, известная живописными улочками, местной кухней и панорамными видами на Кос и соседние острова. Зия также славится красивыми закатами.",
          highlights: ["Гора Дикеос", "Традиционная деревня", "Панорамные виды", "Закаты"]
        },
        cs: {
          name: "Zia",
          description: "Tradiční horská vesnice na svazích hory Dikeos, známá malebnými uličkami, místní kuchyní a panoramatickými výhledy na Kós a okolní ostrovy. Zia je také proslulá nádhernými západy slunce.",
          highlights: ["Hora Dikeos", "Tradiční vesnice", "Panoramatické výhledy", "Západy slunce"]
        },
        sv: {
          name: "Zia",
          description: "En traditionell bergsby på sluttningarna av berget Dikeos, känd för pittoreska gränder, det lokala köket och panoramavyer över Kos och närliggande öar. Zia är också känd för sina vackra solnedgångar.",
          highlights: ["Berget Dikeos", "Traditionell by", "Panoramavyer", "Solnedgångar"]
        },
        da: {
          name: "Zia",
          description: "En traditionel bjerglandsby på skråningerne af bjerget Dikeos, kendt for maleriske gyder, det lokale køkken og panoramaudsigter over Kos og de nærliggende øer. Zia er også berømt for sine smukke solnedgange.",
          highlights: ["Bjerget Dikeos", "Traditionel landsby", "Panoramaudsigter", "Solnedgange"]
        },
        no: {
          name: "Zia",
          description: "En tradisjonell fjellandsby i skråningene av fjellet Dikeos, kjent for pittoreske smug, det lokale kjøkkenet og panoramautsikt over Kos og naboøyene. Zia er også kjent for de vakre solnedgangene.",
          highlights: ["Fjellet Dikeos", "Tradisjonell landsby", "Panoramautsikt", "Solnedganger"]
        },
        fi: {
          name: "Zia",
          description: "Perinteinen vuoristokylä Dikeos-vuoren rinteillä. Se tunnetaan viehättävistä kujista, paikallisesta ruoasta ja panoraamanäkymistä Kosille ja lähisaarille. Zia on kuuluisa myös kauniista auringonlaskuistaan.",
          highlights: ["Dikeos-vuori", "Perinteinen kylä", "Panoraamanäkymät", "Auringonlaskut"]
        }
      }
    },
    {
      id: 'kefalos',
      image: 'assets/images/explore/kefalos.png',
      googleMapsQuery: 'Kefalos, Kos, Greece',
      locales: {
        en: {
          name: 'Kefalos',
          description: 'A historic settlement in the southwest of Kos, combining a traditional hillside village, the seaside area of Kamari and the spectacular beaches of Kefalos Bay.',
          highlights: ['Kefalos Village', 'Kamari', 'Kefalos Bay', 'Kastri Islet']
        },
        de: {
          name: 'Kefalos',
          description: 'Eine historische Siedlung im Südwesten von Kos, die ein traditionelles Bergdorf, das Küstengebiet Kamari und die eindrucksvollen Strände der Bucht von Kefalos verbindet.',
          highlights: ['Dorf Kefalos', 'Kamari', 'Bucht von Kefalos', 'Inselchen Kastri']
        },
        fr: {
          name: 'Kefalos',
          description: 'Une localité historique dans le sud-ouest de Kos, alliant un village traditionnel à flanc de colline, le quartier balnéaire de Kamari et les plages spectaculaires de la baie de Kefalos.',
          highlights: ['Village de Kefalos', 'Kamari', 'Baie de Kefalos', 'Îlot de Kastri']
        },
        it: {
          name: 'Kefalos',
          description: 'Un insediamento storico nel sud-ovest di Kos, che unisce un tradizionale villaggio collinare, la zona mare di Kamari e le spiagge spettacolari della baia di Kefalos.',
          highlights: ['Villaggio di Kefalos', 'Kamari', 'Baia di Kefalos', 'Isolotto di Kastri']
        },
        nl: {
          name: 'Kefalos',
          description: 'Een historische nederzetting in het zuidwesten van Kos, met een traditioneel heuveldorp, het kustgebied Kamari en de indrukwekkende stranden van de baai van Kefalos.',
          highlights: ['Dorp Kefalos', 'Kamari', 'Baai van Kefalos', 'Eilandje Kastri']
        },
        pl: {
          name: "Kefalos",
          description: "Historyczna osada na południowym zachodzie Kos, łącząca tradycyjną wioskę na wzgórzu, nadmorską część Kamari i spektakularne plaże Zatoki Kefalos.",
          highlights: ["Wioska Kefalos", "Kamari", "Zatoka Kefalos", "Wysepka Kastri"]
        },
        ru: {
          name: "Кефалос",
          description: "Историческое поселение на юго-западе Коса, где сочетаются традиционная деревня на холме, приморский район Камари и впечатляющие пляжи бухты Кефалос.",
          highlights: ["Деревня Кефалос", "Камари", "Бухта Кефалос", "Островок Кастри"]
        },
        cs: {
          name: "Kefalos",
          description: "Historická osada na jihozápadě Kósu, která spojuje tradiční vesnici na svahu, přímořskou část Kamari a působivé pláže zálivu Kefalos.",
          highlights: ["Vesnice Kefalos", "Kamari", "Záliv Kefalos", "Ostrůvek Kastri"]
        },
        sv: {
          name: "Kefalos",
          description: "En historisk ort i sydvästra Kos som förenar en traditionell by på sluttningen, kustområdet Kamari och de spektakulära stränderna i Kefalosbukten.",
          highlights: ["Byn Kefalos", "Kamari", "Kefalosbukten", "Holmen Kastri"]
        },
        da: {
          name: "Kefalos",
          description: "En historisk bebyggelse i det sydvestlige Kos, der forener en traditionel landsby på skråningen, kystområdet Kamari og de spektakulære strande i Kefalosbugten.",
          highlights: ["Landsbyen Kefalos", "Kamari", "Kefalosbugten", "Holmen Kastri"]
        },
        no: {
          name: "Kefalos",
          description: "En historisk bosetning i sørvest på Kos, som forener en tradisjonell landsby i skråningen, kystområdet Kamari og de spektakulære strendene i Kefalosbukta.",
          highlights: ["Landsbyen Kefalos", "Kamari", "Kefalosbukta", "Holmen Kastri"]
        },
        fi: {
          name: "Kefalos",
          description: "Historiallinen asutus Kosin lounaisosassa. Se yhdistää perinteisen rinnnekylän, Kamarin rantaseudun ja Kefaloksen lahden vaikuttavat rannat.",
          highlights: ["Kefaloksen kylä", "Kamari", "Kefaloksen lahti", "Kastrin luoto"]
        }
      }
    },
    {
      id: 'paradise-beach',
      image: 'assets/images/explore/paradise-beach.png',
      googleMapsQuery: 'https://maps.app.goo.gl/kHyrtAc4tXiwLfyL6',
      locales: {
        en: {
          name: 'Paradise Beach',
          description: 'One of the most popular beaches in Kos, set in Kefalos Bay with golden sand, shallow turquoise waters and a relaxed seaside atmosphere.',
          highlights: ['Golden sandy beach', 'Shallow turquoise waters', 'Water sports', 'Natural underwater bubbles']
        },
        de: {
          name: 'Paradise Beach',
          description: 'Einer der beliebtesten Strände auf Kos, in der Bucht von Kefalos mit goldenem Sand, flachem türkisfarbenem Wasser und einer entspannten Meeresatmosphäre.',
          highlights: ['Goldener Sandstrand', 'Flaches türkisfarbenes Wasser', 'Wassersport', 'Natürliche Unterwasserblasen']
        },
        fr: {
          name: 'Paradise Beach',
          description: 'L’une des plages les plus prisées de Kos, dans la baie de Kefalos, avec un sable doré, des eaux turquoise peu profondes et une atmosphère balnéaire détendue.',
          highlights: ['Plage de sable doré', 'Eaux turquoise peu profondes', 'Sports nautiques', 'Bulles sous-marines naturelles']
        },
        it: {
          name: 'Paradise Beach',
          description: 'Una delle spiagge più amate di Kos, nella baia di Kefalos, con sabbia dorata, acque turchesi poco profonde e un’atmosfera marina rilassata.',
          highlights: ['Spiaggia di sabbia dorata', 'Acque turchesi poco profonde', 'Sport acquatici', 'Bolle sottomarine naturali']
        },
        nl: {
          name: 'Paradise Beach',
          description: 'Een van de populairste stranden van Kos, in de baai van Kefalos, met gouden zand, ondiep turquoise water en een ontspannen sfeer aan zee.',
          highlights: ['Gouden zandstrand', 'Ondiep turquoise water', 'Watersport', 'Natuurlijke onderwaterbellen']
        },
        pl: {
          name: "Paradise Beach",
          description: "Jedna z najpopularniejszych plaż na Kos, w Zatoce Kefalos, ze złotym piaskiem, płytką turkusową wodą i swobodną nadmorską atmosferą.",
          highlights: ["Złota piaszczysta plaża", "Płytka turkusowa woda", "Sporty wodne", "Naturalne podwodne bąbelki"]
        },
        ru: {
          name: "Paradise Beach",
          description: "Один из самых популярных пляжей Коса в бухте Кефалос: золотой песок, мелкая бирюзовая вода и спокойная приморская атмосфера.",
          highlights: ["Золотой песчаный пляж", "Мелкая бирюзовая вода", "Водные виды спорта", "Природные подводные пузырьки"]
        },
        cs: {
          name: "Paradise Beach",
          description: "Jedna z nejoblíbenějších pláží na Kósu v zálivu Kefalos se zlatým pískem, mělkou tyrkysovou vodou a uvolněnou přímořskou atmosférou.",
          highlights: ["Zlatá písečná pláž", "Mělká tyrkysová voda", "Vodní sporty", "Přírodní podvodní bublinky"]
        },
        sv: {
          name: "Paradise Beach",
          description: "En av de mest populära stränderna på Kos, i Kefalosbukten, med gyllene sand, grunt turkost vatten och en avspänd stämning vid havet.",
          highlights: ["Gyllene sandstrand", "Grunt turkost vatten", "Vattensport", "Naturliga undervattensbubblor"]
        },
        da: {
          name: "Paradise Beach",
          description: "En af de mest populære strande på Kos, i Kefalosbugten, med gyldent sand, lavt turkis vand og en afslappet stemning ved havet.",
          highlights: ["Gylden sandstrand", "Lavt turkis vand", "Vandsport", "Naturlige undervandsbobler"]
        },
        no: {
          name: "Paradise Beach",
          description: "En av de mest populære strendene på Kos, i Kefalosbukta, med gyllen sand, grunt turkis vann og en avslappet stemning ved sjøen.",
          highlights: ["Gyllen sandstrand", "Grunt turkis vann", "Vannsport", "Naturlige undervannsbobler"]
        },
        fi: {
          name: "Paradise Beach",
          description: "Yksi Kosin suosituimmista rannoista Kefaloksen lahdella: kultainen hiekka, matala turkoosi vesi ja rento merellinen tunnelma.",
          highlights: ["Kultainen hiekkaranta", "Matala turkoosi vesi", "Vesiurheilu", "Luonnolliset vedenalaiset kuplat"]
        }
      }
    },
    {
      id: 'tigaki',
      image: 'assets/images/explore/tigaki.png',
      googleMapsQuery: 'Tigaki, Kos, Greece',
      locales: {
        en: {
          name: 'Tigaki',
          description: 'A popular seaside destination on the north coast of Kos, known for its long sandy beach, shallow waters and easy-going atmosphere.',
          highlights: ['Long sandy beach', 'Shallow waters', 'Water sports', 'Alykes Salt Lake']
        },
        de: {
          name: 'Tigaki',
          description: 'Ein beliebtes Küstenziel an der Nordküste von Kos, bekannt für seinen langen Sandstrand, flaches Wasser und eine entspannte Atmosphäre.',
          highlights: ['Langer Sandstrand', 'Flaches Wasser', 'Wassersport', 'Salzsee Alykes']
        },
        fr: {
          name: 'Tigaki',
          description: 'Une destination balnéaire prisée sur la côte nord de Kos, connue pour sa longue plage de sable, ses eaux peu profondes et son atmosphère décontractée.',
          highlights: ['Longue plage de sable', 'Eaux peu profondes', 'Sports nautiques', 'Lac salé d’Alykes']
        },
        it: {
          name: 'Tigaki',
          description: 'Una destinazione balneare molto amata sulla costa nord di Kos, nota per la lunga spiaggia sabbiosa, le acque poco profonde e l’atmosfera rilassata.',
          highlights: ['Lunga spiaggia sabbiosa', 'Acque poco profonde', 'Sport acquatici', 'Lago salato di Alykes']
        },
        nl: {
          name: 'Tigaki',
          description: 'Een populaire badplaats aan de noordkust van Kos, bekend om het lange zandstrand, het ondiepe water en de relaxed sfeer.',
          highlights: ['Lang zandstrand', 'Ondiep water', 'Watersport', 'Zoutmeer Alykes']
        },
        pl: {
          name: "Tigaki",
          description: "Popularne nadmorskie miejsce na północnym wybrzeżu Kos, znane z długiej piaszczystej plaży, płytkiej wody i swobodnej atmosfery.",
          highlights: ["Długa piaszczysta plaża", "Płytka woda", "Sporty wodne", "Słone jezioro Alykes"]
        },
        ru: {
          name: "Тигаки",
          description: "Популярный приморский курорт на северном побережье Коса, известный длинным песчаным пляжем, мелкой водой и спокойной атмосферой.",
          highlights: ["Длинный песчаный пляж", "Мелкая вода", "Водные виды спорта", "Солёное озеро Аликес"]
        },
        cs: {
          name: "Tigaki",
          description: "Oblíbená přímořská destinace na severním pobřeží Kósu, známá dlouhou písečnou pláží, mělkou vodou a pohodovou atmosférou.",
          highlights: ["Dlouhá písečná pláž", "Mělká voda", "Vodní sporty", "Slané jezero Alykes"]
        },
        sv: {
          name: "Tigaki",
          description: "En populär badort på norra kusten av Kos, känd för den långa sandstranden, det grunda vattnet och den avspända stämningen.",
          highlights: ["Lång sandstrand", "Grunt vatten", "Vattensport", "Saltsjön Alykes"]
        },
        da: {
          name: "Tigaki",
          description: "Et populært kyststed på nordsiden af Kos, kendt for den lange sandstrand, det lave vand og den afslappede stemning.",
          highlights: ["Lang sandstrand", "Lavt vand", "Vandsport", "Saltsøen Alykes"]
        },
        no: {
          name: "Tigaki",
          description: "Et populært kyststed på nordsiden av Kos, kjent for den lange sandstranden, det grunne vannet og den avslappede stemningen.",
          highlights: ["Lang sandstrand", "Grunt vann", "Vannsport", "Saltsjøen Alykes"]
        },
        fi: {
          name: "Tigaki",
          description: "Suosittu rantakohde Kosin pohjoisrannikolla. Se tunnetaan pitkästä hiekkarannasta, matalasta vedestä ja rennosta tunnelmasta.",
          highlights: ["Pitkä hiekkaranta", "Matala vesi", "Vesiurheilu", "Alykesin suolajärvi"]
        }
      }
    },
    {
      id: 'asklepion',
      image: 'assets/images/explore/asklepion.png',
      googleMapsQuery: 'Asklepion, Kos, Greece',
      locales: {
        en: {
          name: 'Asklepion',
          description: 'One of the most important archaeological sites of Kos, the ancient sanctuary of Asklepios was a centre of healing and medicine and is closely connected with the legacy of Hippocrates.',
          highlights: ['Ancient Sanctuary of Asklepios', 'Three archaeological terraces', 'Temple of Asklepios', 'Connection with Hippocrates']
        },
        de: {
          name: 'Asklepion',
          description: 'Eine der bedeutendsten archäologischen Stätten von Kos: Das antike Heiligtum des Asklepios war ein Zentrum der Heilkunst und Medizin und ist eng mit dem Vermächtnis des Hippokrates verbunden.',
          highlights: ['Antikes Heiligtum des Asklepios', 'Drei archäologische Terrassen', 'Tempel des Asklepios', 'Verbindung zu Hippokrates']
        },
        fr: {
          name: 'Asklepion',
          description: 'L’un des sites archéologiques les plus importants de Kos : le sanctuaire antique d’Asclépios était un centre de soins et de médecine, étroitement lié à l’héritage d’Hippocrate.',
          highlights: ['Sanctuaire antique d’Asclépios', 'Trois terrasses archéologiques', 'Temple d’Asclépios', 'Lien avec Hippocrate']
        },
        it: {
          name: 'Asklepion',
          description: 'Uno dei siti archeologici più importanti di Kos: l’antico santuario di Asclepio era un centro di cura e di medicina, strettamente legato all’eredità di Ippocrate.',
          highlights: ['Antico santuario di Asclepio', 'Tre terrazze archeologiche', 'Tempio di Asclepio', 'Legame con Ippocrate']
        },
        nl: {
          name: 'Asklepion',
          description: 'Een van de belangrijkste archeologische sites van Kos: het antieke heiligdom van Asklepios was een centrum voor genezing en geneeskunde en is nauw verbonden met de erfenis van Hippocrates.',
          highlights: ['Antiek heiligdom van Asklepios', 'Drie archeologische terrassen', 'Tempel van Asklepios', 'Verbinding met Hippocrates']
        },
        pl: {
          name: "Asklepion",
          description: "Jedno z najważniejszych stanowisk archeologicznych na Kos: starożytne sanktuarium Asklepiosa było ośrodkiem leczenia i medycyny i jest ściśle związane z dziedzictwem Hipokratesa.",
          highlights: ["Starożytne sanktuarium Asklepiosa", "Trzy tarasy archeologiczne", "Świątynia Asklepiosa", "Związek z Hipokratesem"]
        },
        ru: {
          name: "Асклепион",
          description: "Один из важнейших археологических памятников Коса: древнее святилище Асклепия было центром врачевания и медицины и тесно связано с наследием Гиппократа.",
          highlights: ["Древнее святилище Асклепия", "Три археологические террасы", "Храм Асклепия", "Связь с Гиппократом"]
        },
        cs: {
          name: "Asklepion",
          description: "Jedno z nejdůležitějších archeologických nalezišť na Kósu: antická svatyně Asklépia byla centrem léčení a medicíny a úzce souvisí s odkazem Hippokrata.",
          highlights: ["Antická svatyně Asklépia", "Tři archeologické terasy", "Chrám Asklépia", "Spojení s Hippokratem"]
        },
        sv: {
          name: "Asklepion",
          description: "En av de viktigaste arkeologiska platserna på Kos: Asklepios antika helgedom var ett centrum för läkekonst och medicin och är nära knuten till Hippokrates arv.",
          highlights: ["Asklepios antika helgedom", "Tre arkeologiska terrasser", "Asklepios tempel", "Koppling till Hippokrates"]
        },
        da: {
          name: "Asklepion",
          description: "Et af de vigtigste arkæologiske steder på Kos: Asklepios’ antikke helligdom var et centrum for helbredelse og medicin og er tæt forbundet med Hippokrates’ arv.",
          highlights: ["Asklepios’ antikke helligdom", "Tre arkæologiske terrasser", "Asklepios’ tempel", "Forbindelse til Hippokrates"]
        },
        no: {
          name: "Asklepion",
          description: "Et av de viktigaste arkeologiske stedene på Kos: Asklepios’ antikke helligdom var et senter for helbredelse og medisin og er tett knyttet til Hippokrates’ arv.",
          highlights: ["Asklepios’ antikke helligdom", "Tre arkeologiske terrasser", "Asklepios’ tempel", "Tilknytning til Hippokrates"]
        },
        fi: {
          name: "Asklepion",
          description: "Yksi Kosin tärkeimmistä arkeologisista kohteista: Asklepioksen antiikin pyhäkkö oli parannuksen ja lääketieteen keskus ja liittyy tiiviisti Hippokrateen perintöön.",
          highlights: ["Asklepioksen antiikin pyhäkkö", "Kolme arkeologista terassia", "Asklepioksen temppeli", "Yhteys Hippokrateeseen"]
        }
      }
    },
    {
      id: 'antimachia',
      image: 'assets/images/explore/antimachia.png',
      googleMapsQuery: 'Antimachia, Kos, Greece',
      locales: {
        en: {
          name: 'Antimachia',
          description: 'A traditional inland village known for its medieval castle, folklore heritage and historic windmill, offering a glimpse into the traditional life of Kos.',
          highlights: ['Antimachia Castle', 'Traditional Windmill', 'Folklore Museum', 'Traditional village']
        },
        de: {
          name: 'Antimachia',
          description: 'Ein traditionelles Inlandsdorf, bekannt für seine mittelalterliche Burg, das folkloristische Erbe und die historische Windmühle, das einen Einblick in das traditionelle Leben auf Kos bietet.',
          highlights: ['Burg Antimachia', 'Traditionelle Windmühle', 'Volkskundemuseum', 'Traditionelles Dorf']
        },
        fr: {
          name: 'Antimachia',
          description: 'Un village traditionnel de l’intérieur, connu pour son château médiéval, son patrimoine folklorique et son moulin historique, offrant un aperçu de la vie traditionnelle de Kos.',
          highlights: ['Château d’Antimachia', 'Moulin traditionnel', 'Musée du folklore', 'Village traditionnel']
        },
        it: {
          name: 'Antimachia',
          description: 'Un tradizionale villaggio dell’entroterra, noto per il castello medievale, il patrimonio folkloristico e il mulino a vento storico, che offre uno sguardo sulla vita tradizionale di Kos.',
          highlights: ['Castello di Antimachia', 'Mulino a vento tradizionale', 'Museo del folklore', 'Villaggio tradizionale']
        },
        nl: {
          name: 'Antimachia',
          description: 'Een traditioneel dorp in het binnenland, bekend om het middeleeuwse kasteel, het folklore-erfgoed en de historische windmolen, dat een blik biedt op het traditionele leven op Kos.',
          highlights: ['Kasteel Antimachia', 'Traditionele windmolen', 'Folkloremuseum', 'Traditioneel dorp']
        },
        pl: {
          name: "Antimachia",
          description: "Tradycyjna wioska w głębi lądu, znana z średniowiecznego zamku, dziedzictwa ludowego i historycznego wiatraka, dająca wgląd w tradycyjne życie na Kos.",
          highlights: ["Zamek Antimachia", "Tradycyjny wiatrak", "Muzeum folkloru", "Tradycyjna wioska"]
        },
        ru: {
          name: "Антимахия",
          description: "Традиционная деревня в глубине острова, известная средневековым замком, фольклорным наследием и исторической ветряной мельницей — взгляд на традиционную жизнь Коса.",
          highlights: ["Замок Антимахия", "Традиционная ветряная мельница", "Музей фольклора", "Традиционная деревня"]
        },
        cs: {
          name: "Antimachia",
          description: "Tradiční vesnice ve vnitrozemí, známá středověkým hradem, folklorním dědictvím a historickým větrným mlýnem, která nabízí pohled na tradiční život na Kósu.",
          highlights: ["Hrad Antimachia", "Tradiční větrný mlýn", "Muzeum folkloru", "Tradiční vesnice"]
        },
        sv: {
          name: "Antimachia",
          description: "En traditionell by inne på ön, känd för sitt medeltida slott, sitt folkloristiska arv och den historiska väderkvarnen — en inblick i det traditionella livet på Kos.",
          highlights: ["Slottet Antimachia", "Traditionell väderkvarn", "Folkloremuseum", "Traditionell by"]
        },
        da: {
          name: "Antimachia",
          description: "En traditionel landsby inde i landet, kendt for sit middelalderlige slot, sin folkloristiske arv og den historiske vindmølle, der giver et indblik i det traditionelle liv på Kos.",
          highlights: ["Antimachia-slottet", "Traditionel vindmølle", "Folkloremuseum", "Traditionel landsby"]
        },
        no: {
          name: "Antimachia",
          description: "En tradisjonell landsby inne på øya, kjent for det middelalderske slottet, folklorearven og den historiske vindmøllen, og gir et innblikk i det tradisjonelle livet på Kos.",
          highlights: ["Slottet Antimachia", "Tradisjonell vindmølle", "Folkloremuseum", "Tradisjonell landsby"]
        },
        fi: {
          name: "Antimachia",
          description: "Perinteinen sisämaan kylä, joka tunnetaan keskiaikaisesta linnasta, kansanperinteestä ja historiallisesta tuulimyllystä. Se avaa näkymän Kosin perinteiseen elämään.",
          highlights: ["Antimachian linna", "Perinteinen tuulimylly", "Kansanperinnemuseo", "Perinteinen kylä"]
        }
      }
    },
    {
      id: 'kardamena',
      image: 'assets/images/explore/kardamena.png',
      googleMapsQuery: 'Kardamena, Kos, Greece',
      locales: {
        en: {
          name: 'Kardamena',
          description: 'A lively seaside settlement with a long sandy coastline, a busy harbor and a mix of traditional island character, restaurants and seaside activities.',
          highlights: ['Kardamena Harbor', 'Sandy coastline', 'Water sports', 'Boat trips to Nisyros']
        },
        de: {
          name: 'Kardamena',
          description: 'Eine lebendige Küstensiedlung mit langem Sandstrand, einem belebten Hafen und einer Mischung aus traditionellem Inselcharakter, Restaurants und Aktivitäten am Meer.',
          highlights: ['Hafen von Kardamena', 'Sandküste', 'Wassersport', 'Bootsausflüge nach Nisyros']
        },
        fr: {
          name: 'Kardamena',
          description: 'Une localité balnéaire animée, avec un long littoral sableux, un port actif et un mélange de caractère insulaire traditionnel, de restaurants et d’activités en bord de mer.',
          highlights: ['Port de Kardamena', 'Littoral sableux', 'Sports nautiques', 'Excursions en bateau vers Nisyros']
        },
        it: {
          name: 'Kardamena',
          description: 'Un vivace insediamento sul mare, con una lunga costa sabbiosa, un porto animato e un mix di carattere isolano tradizionale, ristoranti e attività a mare.',
          highlights: ['Porto di Kardamena', 'Costa sabbiosa', 'Sport acquatici', 'Gite in barca a Nisyros']
        },
        nl: {
          name: 'Kardamena',
          description: 'Een levendige badplaats met een lange zandkust, een drukke haven en een mix van traditioneel eilandkarakter, restaurants en activiteiten aan zee.',
          highlights: ['Haven van Kardamena', 'Zandkust', 'Watersport', 'Boottochten naar Nisyros']
        },
        pl: {
          name: "Kardamena",
          description: "Tętniąca życiem osada nadmorska z długim piaszczystym wybrzeżem, ruchliwym portem oraz połączeniem tradycyjnego charakteru wyspy, restauracji i atrakcji nad morzem.",
          highlights: ["Port Kardamena", "Piaszczyste wybrzeże", "Sporty wodne", "Wycieczki łodzią na Nisiros"]
        },
        ru: {
          name: "Кардамена",
          description: "Оживлённый приморский посёлок с длинной песчаной береговой линией, оживлённой гаванью и сочетанием традиционного островного характера, ресторанов и развлечений у моря.",
          highlights: ["Гавань Кардамены", "Песчаное побережье", "Водные виды спорта", "Лодочные поездки на Нисирос"]
        },
        cs: {
          name: "Kardamena",
          description: "Živá přímořská osada s dlouhým písečným pobřežím, rušným přístavem a kombinací tradičního ostrovního rázu, restaurací a aktivit u moře.",
          highlights: ["Přístav Kardamena", "Písečné pobřeží", "Vodní sporty", "Výlety lodí na Nisyros"]
        },
        sv: {
          name: "Kardamena",
          description: "En livlig badort med en lång sandkust, en livlig hamn och en blandning av traditionell ö-karaktär, restauranger och aktiviteter vid havet.",
          highlights: ["Hamnen i Kardamena", "Sandkust", "Vattensport", "Båtturer till Nisyros"]
        },
        da: {
          name: "Kardamena",
          description: "En livlig kystbebyggelse med en lang sandkyst, en travl havn og en blanding af traditionel ø-karakter, restauranter og aktiviteter ved havet.",
          highlights: ["Havnen i Kardamena", "Sandkyst", "Vandsport", "Bådture til Nisyros"]
        },
        no: {
          name: "Kardamena",
          description: "Et livlig kyststed med en lang sandkyst, en travel havn og en blanding av tradisjonell øykarakter, restauranter og aktiviteter ved sjøen.",
          highlights: ["Havnen i Kardamena", "Sandkyst", "Vannsport", "Båtturer til Nisyros"]
        },
        fi: {
          name: "Kardamena",
          description: "Elävä rantakohde, jossa on pitkä hiekkainen rannikko, vilkas satama sekä perinteistä saarihenkeä, ravintoloita ja merellä tapahtuvaa toimintaa.",
          highlights: ["Kardamenan satama", "Hiekkainen rannikko", "Vesiurheilu", "Venereissut Nisyrokseen"]
        }
      }
    }
  ];

  function t(key, vars) {
    return (window.I18N && typeof I18N.t === 'function') ? I18N.t(key, vars) : '';
  }

  function exploreCopy(dest) {
    if (!dest) return { name: '', description: '', highlights: [] };
    var lang = (window.I18N && I18N.lang) || 'en';
    var pack = dest.locales || {};
    var loc = pack[lang] || pack.en || {};
    var en = pack.en || {};
    return {
      name: loc.name || en.name || '',
      description: loc.description || en.description || '',
      highlights: loc.highlights && loc.highlights.length ? loc.highlights : (en.highlights || [])
    };
  }

  var EXPLORE_CARD_ARROW =
    '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">' +
      '<path d="M3.5 7.5h8M8.5 5L11 7.5 8.5 10" stroke="#CC2228" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  function renderExploreKos() {
    var track  = document.querySelector('#exploreTrack') || document.querySelector('.explore-grid');
    var dotsEl = document.querySelector('#exploreDots') || document.querySelector('#explore .prem-carousel__dots');
    if (!track) return;

    track.innerHTML = EXPLORE_DESTINATIONS.map(function (d) {
      var copy = exploreCopy(d);
      return (
        '<button type="button" class="explore-card prem-carousel__card" data-explore-id="' + d.id + '"' +
          ' aria-haspopup="dialog" aria-label="' + t('explore.cardAria', { name: copy.name }) + '">' +
          '<div class="explore-card__bg" style="background-image:url(\'' + d.image + '\')" aria-hidden="true"></div>' +
          '<div class="explore-card__overlay" aria-hidden="true"></div>' +
          '<div class="explore-card__content"><strong>' + copy.name + '</strong></div>' +
          '<div class="explore-card__btn" aria-hidden="true">' + EXPLORE_CARD_ARROW + '</div>' +
        '</button>'
      );
    }).join('');

    if (dotsEl) {
      dotsEl.innerHTML = EXPLORE_DESTINATIONS.map(function (d, i) {
        var on = (i === 0);
        return (
          '<button type="button" class="prem-carousel__dot' + (on ? ' prem-carousel__dot--active' : '') + '"' +
            ' role="tab" aria-selected="' + (on ? 'true' : 'false') + '"' +
            ' aria-label="' + t('explore.dotAria', { n: i + 1, total: EXPLORE_DESTINATIONS.length }) + '"></button>'
        );
      }).join('');
    }
  }

  /* ─── CAROUSEL INSTANCES ────────────────────────────────────────── */
  initPremiumCarousel(
    document.querySelector('.qa-grid'),
    document.querySelector('#quick-links .prem-carousel__dots')
  );

  initPremiumCarousel(
    document.querySelector('.fleet-grid'),
    document.querySelector('#fleet .prem-carousel__dots')
  );

  initPremiumCarousel(
    document.querySelector('.info-grid'),
    document.querySelector('#rental-guide .prem-carousel__dots')
  );

  renderExploreKos();

  initPremiumCarousel(
    document.querySelector('.explore-grid'),
    document.querySelector('#explore .prem-carousel__dots'),
    true
  );

  /* ─── EXPLORE KOS — DESTINATION DETAILS MODAL ───────────────────── */
  var exploreModal            = document.getElementById('exploreModal');
  var exploreModalClose       = document.getElementById('exploreModalClose');
  var exploreModalImage       = document.getElementById('exploreModalImage');
  var exploreModalTitle       = document.getElementById('exploreModalTitle');
  var exploreModalDesc        = document.getElementById('exploreModalDesc');
  var exploreModalHighlights  = document.getElementById('exploreModalHighlights');
  var exploreModalMaps        = document.getElementById('exploreModalMaps');
  var exploreLastFocus        = null;
  var exploreCloseTimer       = null;
  var currentExploreId        = null;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function exploreFocusables() {
    if (!exploreModal) return [];
    return Array.prototype.slice.call(
      exploreModal.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) {
      return !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true';
    });
  }

  function getExploreDestination(id) {
    for (var i = 0; i < EXPLORE_DESTINATIONS.length; i++) {
      if (EXPLORE_DESTINATIONS[i].id === id) return EXPLORE_DESTINATIONS[i];
    }
    return null;
  }

  function fillExploreModal(dest) {
    if (!dest) return;
    var copy = exploreCopy(dest);

    if (exploreModalImage) {
      exploreModalImage.src = dest.image;
      exploreModalImage.alt = copy.name;
    }
    if (exploreModalTitle) exploreModalTitle.textContent = copy.name;
    if (exploreModalDesc)  exploreModalDesc.textContent  = copy.description;

    if (exploreModalHighlights) {
      exploreModalHighlights.innerHTML = copy.highlights.map(function (item) {
        return '<li>' + item + '</li>';
      }).join('');
    }

    if (exploreModalMaps) {
      exploreModalMaps.href = dest.googleMapsQuery.indexOf('https://') === 0
        ? dest.googleMapsQuery
        : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(dest.googleMapsQuery);
    }
  }

  function refreshExploreCopy() {
    var cards = document.querySelectorAll('#explore .explore-card[data-explore-id]');
    for (var i = 0; i < cards.length; i++) {
      var dest = getExploreDestination(cards[i].getAttribute('data-explore-id'));
      if (!dest) continue;
      var copy = exploreCopy(dest);
      var strong = cards[i].querySelector('strong');
      if (strong) strong.textContent = copy.name;
      cards[i].setAttribute('aria-label', t('explore.cardAria', { name: copy.name }));
    }
    var dots = document.querySelectorAll('#exploreDots .prem-carousel__dot, #explore .prem-carousel__dots .prem-carousel__dot');
    var total = EXPLORE_DESTINATIONS.length;
    for (var j = 0; j < dots.length; j++) {
      dots[j].setAttribute('aria-label', t('explore.dotAria', { n: j + 1, total: total }));
    }
    if (exploreModal && !exploreModal.hasAttribute('hidden') && currentExploreId) {
      fillExploreModal(getExploreDestination(currentExploreId));
    }
  }

  function openExploreModal(dest, triggerEl) {
    if (!exploreModal || !dest) return;
    exploreLastFocus = triggerEl || document.activeElement;
    currentExploreId = dest.id;
    fillExploreModal(dest);

    if (exploreCloseTimer) {
      clearTimeout(exploreCloseTimer);
      exploreCloseTimer = null;
    }

    exploreModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        exploreModal.classList.add('explore-modal--open');
        if (exploreModalClose) exploreModalClose.focus();
      });
    });
  }

  function closeExploreModal() {
    if (!exploreModal || exploreModal.hasAttribute('hidden')) return;
    exploreModal.classList.remove('explore-modal--open');
    document.body.style.overflow = '';

    var delay = prefersReducedMotion() ? 0 : 300;
    exploreCloseTimer = setTimeout(function () {
      exploreModal.setAttribute('hidden', '');
      exploreCloseTimer = null;
      if (exploreLastFocus && typeof exploreLastFocus.focus === 'function') {
        exploreLastFocus.focus();
      }
    }, delay);
  }

  document.addEventListener('click', function (e) {
    var card = e.target.closest('#explore .explore-card[data-explore-id]');
    if (card) {
      e.preventDefault();
      openExploreModal(getExploreDestination(card.getAttribute('data-explore-id')), card);
    }
  });

  if (exploreModalClose) {
    exploreModalClose.addEventListener('click', closeExploreModal);
  }
  if (exploreModal) {
    exploreModal.addEventListener('click', function (e) {
      if (e.target === exploreModal) closeExploreModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!exploreModal || exploreModal.hasAttribute('hidden')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeExploreModal();
      return;
    }

    if (e.key !== 'Tab') return;

    var items = exploreFocusables();
    if (!items.length) return;
    var first = items[0];
    var last  = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ─── CHECK AVAILABILITY MODAL ──────────────────────────────────── */
  var availModal        = document.getElementById('availModal');
  var availModalClose   = document.getElementById('availModalClose');
  var availModalForm    = document.getElementById('availModalForm');
  var availPickup       = document.getElementById('availPickup');
  var availReturn       = document.getElementById('availReturn');
  var availGroupBadge   = document.getElementById('availGroupBadge');
  var availVehicleName  = document.getElementById('availVehicleName');
  var availDurationRow  = document.getElementById('availDurationRow');
  var availDurationValue= document.getElementById('availDurationValue');
  var availPriceBlock   = document.getElementById('availPriceBlock');
  var availPriceRow     = document.getElementById('availPriceRow');
  var availPriceValue   = document.getElementById('availPriceValue');
  var availInsuranceNote = document.getElementById('availInsuranceNote');
  var availContactPriceNote = document.getElementById('availContactPriceNote');
  var availHotel        = document.getElementById('availHotel');
  var availHotelOtherWrap = document.getElementById('availHotelOtherWrap');
  var availHotelOther   = document.getElementById('availHotelOther');
  var HOTEL_OTHER       = '__other__';

  var activeGroup     = '';
  var activeGroupCode = '';
  var activeVehicle   = '';

  /* High Season totals by vehicle group and rental days.
     Additional seasons can be added here later without changing lookupPrice. */
  var ACTIVE_PRICE_SEASON = 'high';
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

  /* ── Helpers ─────────────────────────────────────────────────── */

  function todayISO() {
    var d  = new Date();
    var mm = (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1);
    var dd = (d.getDate()    < 10 ? '0' : '') + d.getDate();
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var p = dateStr.split('-');
    var month = t('avail.month.' + parseInt(p[1], 10));
    return parseInt(p[2], 10) + ' ' + month + ' ' + p[0];
  }

  function calcDays(pickup, ret) {
    if (!pickup || !ret) return 0;
    var diff = (new Date(ret) - new Date(pickup)) / 86400000;
    if (diff < 0) return 0;
    return Math.round(diff) + 1;
  }

  function durationLabel(days) {
    if (!days) return '';
    return days === 1 ? t('avail.duration.one') : t('avail.duration.many', { n: days });
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

  function hidePriceBlock() {
    if (availPriceBlock) availPriceBlock.setAttribute('hidden', '');
    if (availPriceRow) availPriceRow.removeAttribute('hidden');
    if (availInsuranceNote) availInsuranceNote.removeAttribute('hidden');
    if (availContactPriceNote) availContactPriceNote.setAttribute('hidden', '');
    if (availPriceValue) availPriceValue.textContent = '—';
  }

  function updatePrice(days) {
    if (!availPriceBlock) return;
    if (!days || days < 1) {
      hidePriceBlock();
      return;
    }

    if (days >= 8) {
      availPriceBlock.removeAttribute('hidden');
      if (availPriceRow) availPriceRow.setAttribute('hidden', '');
      if (availInsuranceNote) availInsuranceNote.setAttribute('hidden', '');
      if (availContactPriceNote) availContactPriceNote.removeAttribute('hidden');
      if (availPriceValue) availPriceValue.textContent = '—';
      return;
    }

    var amount = lookupPrice(activeGroupCode, days);
    if (amount == null) {
      hidePriceBlock();
      return;
    }

    availPriceBlock.removeAttribute('hidden');
    if (availPriceRow) availPriceRow.removeAttribute('hidden');
    if (availPriceValue) availPriceValue.textContent = formatPrice(amount);
    if (availInsuranceNote) availInsuranceNote.removeAttribute('hidden');
    if (availContactPriceNote) availContactPriceNote.setAttribute('hidden', '');
  }

  function updateDuration() {
    var pickup = availPickup ? availPickup.value : '';
    var ret    = availReturn ? availReturn.value : '';
    var days   = calcDays(pickup, ret);
    if (days > 0) {
      if (availDurationValue) availDurationValue.textContent = durationLabel(days);
      if (availDurationRow)   availDurationRow.removeAttribute('hidden');
    } else {
      if (availDurationRow)   availDurationRow.setAttribute('hidden', '');
    }
    updatePrice(days);
  }

  function selectedHotel() {
    if (!availHotel) return '';
    var val = availHotel.value;
    if (!val) return '';
    if (val === HOTEL_OTHER) {
      return availHotelOther ? availHotelOther.value.replace(/^\s+|\s+$/g, '') : '';
    }
    return val;
  }

  function syncHotelOther() {
    var isOther = !!(availHotel && availHotel.value === HOTEL_OTHER);
    if (availHotelOtherWrap) {
      if (isOther) {
        availHotelOtherWrap.removeAttribute('hidden');
      } else {
        availHotelOtherWrap.setAttribute('hidden', '');
        if (availHotelOther) {
          availHotelOther.value = '';
          availHotelOther.classList.remove('avail-modal__input--error');
        }
      }
    }
  }

  function resetHotel() {
    if (availHotel) {
      availHotel.value = '';
      availHotel.classList.remove('avail-modal__input--error');
    }
    if (availHotelOther) {
      availHotelOther.value = '';
      availHotelOther.classList.remove('avail-modal__input--error');
    }
    if (availHotelOtherWrap) availHotelOtherWrap.setAttribute('hidden', '');
    if (availHotelOther) availHotelOther.placeholder = t('avail.hotelNamePlaceholder');
  }

  function buildWAMessage(group, vehicle, pickup, ret, hotel) {
    var days = calcDays(pickup, ret);
    var hotelSection = hotel ? t('avail.wa.hotel', { hotel: hotel }) : '';
    var amount = lookupPrice(activeGroupCode, days);
    var priceSection = '';
    var ask = t('avail.wa.ask');
    if (amount != null) {
      priceSection = t('avail.wa.price', { price: formatPrice(amount) });
      ask = t('avail.wa.ask.priced');
    }
    return t('avail.wa.body', {
      group: group,
      vehicle: vehicle,
      pickup: formatDate(pickup),
      return: formatDate(ret),
      duration: durationLabel(days),
      hotelSection: hotelSection,
      priceSection: priceSection,
      ask: ask
    });
  }

  /* ── Open / Close ────────────────────────────────────────────── */

  function openAvailModal(group, vehicle, groupCode) {
    if (!availModal) return;
    activeGroup     = group;
    activeGroupCode = groupCode ? String(groupCode).toUpperCase() : '';
    activeVehicle   = vehicle;

    /* Populate header identity */
    if (availGroupBadge)  availGroupBadge.textContent  = group;
    if (availVehicleName) availVehicleName.textContent  = vehicle;

    /* Reset form */
    var today = todayISO();
    if (availPickup) { availPickup.min = today; availPickup.value = ''; availPickup.classList.remove('avail-modal__input--error'); }
    if (availReturn) { availReturn.min = today; availReturn.value = ''; availReturn.classList.remove('avail-modal__input--error'); }
    if (availDurationRow) availDurationRow.setAttribute('hidden', '');
    hidePriceBlock();
    resetHotel();

    /* Show + animate */
    availModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        availModal.classList.add('avail-modal--open');
        if (availPickup) availPickup.focus();
      });
    });
  }

  function closeAvailModal() {
    if (!availModal) return;
    resetHotel();
    availModal.classList.remove('avail-modal--open');
    document.body.style.overflow = '';
    setTimeout(function () {
      availModal.setAttribute('hidden', '');
    }, 300);
  }

  /* ── Event: open on card CTA click ──────────────────────────── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.fleet-card__cta[data-group], .fleet-card__cta[data-group-code]');
    if (btn) {
      e.preventDefault();
      var groupCode = btn.getAttribute('data-group-code');
      var vehicleName = btn.getAttribute('data-name');
      var group = groupCode
        ? t('fleet.groupLabel', { group: groupCode })
        : (btn.getAttribute('data-group') || '');
      var vehicle = vehicleName
        ? t('fleet.orSimilar', { name: vehicleName })
        : (btn.getAttribute('data-vehicle') || '');
      openAvailModal(group, vehicle, groupCode);
    }
  });

  /* ── Event: close ────────────────────────────────────────────── */
  if (availModalClose) {
    availModalClose.addEventListener('click', closeAvailModal);
  }
  if (availModal) {
    availModal.addEventListener('click', function (e) {
      if (e.target === availModal) closeAvailModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && availModal && !availModal.hasAttribute('hidden')) {
      closeAvailModal();
    }
  });

  /* ── Event: date changes → duration + return min sync ───────── */
  if (availPickup) {
    availPickup.addEventListener('change', function () {
      availPickup.classList.remove('avail-modal__input--error');
      if (availReturn) {
        availReturn.min = availPickup.value || todayISO();
        if (availReturn.value && availReturn.value < availPickup.value) {
          availReturn.value = '';
        }
      }
      updateDuration();
    });
  }
  if (availReturn) {
    availReturn.addEventListener('change', function () {
      availReturn.classList.remove('avail-modal__input--error');
      updateDuration();
    });
  }
  if (availHotel) {
    availHotel.addEventListener('change', function () {
      availHotel.classList.remove('avail-modal__input--error');
      syncHotelOther();
    });
  }
  if (availHotelOther) {
    availHotelOther.addEventListener('input', function () {
      availHotelOther.classList.remove('avail-modal__input--error');
    });
  }

  /* ── Event: form submit → WhatsApp ──────────────────────────── */
  if (availModalForm) {
    availModalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var pickup = availPickup ? availPickup.value : '';
      var ret    = availReturn ? availReturn.value : '';
      var valid  = true;

      if (!pickup) { if (availPickup) availPickup.classList.add('avail-modal__input--error'); valid = false; }
      if (!ret)    { if (availReturn) availReturn.classList.add('avail-modal__input--error'); valid = false; }
      if (pickup && ret && ret < pickup) {
        if (availReturn) availReturn.classList.add('avail-modal__input--error');
        valid = false;
      }
      if (availHotel && availHotel.value === HOTEL_OTHER) {
        var otherName = availHotelOther ? availHotelOther.value.replace(/^\s+|\s+$/g, '') : '';
        if (!otherName) {
          if (availHotelOther) availHotelOther.classList.add('avail-modal__input--error');
          valid = false;
        }
      }
      if (!valid)  return;

      var msg = buildWAMessage(activeGroup, activeVehicle, pickup, ret, selectedHotel());
      window.open('https://wa.me/306944771738?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
      closeAvailModal();
    });
  }

  if (window.I18N && typeof I18N.onChange === 'function') {
    I18N.onChange(function () {
      refreshExploreCopy();
      updateDuration();
      if (availHotelOther) availHotelOther.placeholder = t('avail.hotelNamePlaceholder');
    });
  }

}());
