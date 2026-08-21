/* =========================================================
   HeroSlider — premium 5-slide hero carousel.
   One shared background image for every slide; left-side text
   and right-side product PNG swap per slide with a staggered
   text reveal, a crossfade/scale image transition, and a
   CSS-driven water-splash burst (rings + wave + droplets)
   replayed on every slide change.
   ========================================================= */

const SLIDES = [
  {
    tag: 'Smart Home Purification',
    headingLines: ['Pure Water,', 'Elevated Living.'],
    desc: 'Next-generation RO + UV + UF filtration in a sleek, wall-mounted design — engineered for homes that expect nothing less than perfection.',
    image: 'assets/frames/png1.png',
    alt: 'Pure E Safe premium wall-mounted RO water purifier',
    exploreHref: 'domestic-water-purifiers.html',
  },
  {
    tag: 'Commercial Grade Systems',
    headingLines: ['Built For Scale.', 'Engineered For Purity.'],
    desc: 'From offices to industrial facilities, our commercial RO plants deliver consistent, high-volume purified water — reliable performance, every single day.',
    image: 'assets/frames/png2.png',
    alt: 'Commercial RO water treatment plant',
    exploreHref: 'industrial-commercial-ro-plants.html',
  },
  {
    tag: 'Advanced Softening Technology',
    headingLines: ['Soft Water.', 'Stronger Homes.'],
    desc: 'Say goodbye to scale, stains, and hard-water damage. Our softener systems protect your pipes, appliances, and skin — for life.',
    image: 'assets/frames/png3.png',
    alt: 'Twin-tank water softener system',
    exploreHref: 'water-softener-plant.html',
  },
  {
    tag: 'UV + UF Protection',
    headingLines: ['Every Drop.', 'Absolutely Safe.'],
    desc: 'Dual-layer UV and UF purification eliminates bacteria, viruses, and microplastics — hospital-grade safety, straight from your tap.',
    image: 'assets/frames/png4.png',
    alt: 'UV and UF water purifier with faucet',
    exploreHref: 'multibrand-water-purifiers.html',
  },
  {
    tag: 'Industrial Water Treatment',
    headingLines: ['Power Meets', 'Precision Purity.'],
    desc: 'Heavy-duty treatment systems designed for factories and large-scale operations — maximum output without compromising water quality.',
    image: 'assets/frames/png5.png',
    alt: 'Industrial water treatment unit',
    exploreHref: 'industrial-commercial-ro-plants.html',
  },
];

const AUTOPLAY_MS = 6000;
const BG_IMAGE = 'assets/frames/hero.png';

export default class HeroSlider {
  constructor({ root }) {
    this.root = document.querySelector(root);
    if (!this.root) return;

    this.current = 0;
    this.total = SLIDES.length;
    this.autoTimer = null;

    this._render();
    this._cache();
    this._bindEvents();

    /* Double rAF so the browser paints the inactive (pre-reveal) state
       at least once before we flip to active — otherwise the very first
       slide would snap straight to its end state with no transition. */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._goTo(0, true);
        this._startAuto();
        this.root.classList.add('hs-mounted');
      });
    });
  }

  /* ------ Render ------ */
  _render() {
    const slides = SLIDES.map((s, i) => `
      <div class="hs-slide" data-slide="${i}">
        <div class="hs-slide-text">
          <span class="hs-tag">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C12 2 5 11 5 15.5C5 19.6 8.4 23 12 23C15.6 23 19 19.6 19 15.5C19 11 12 2 12 2Z"/></svg>
            ${s.tag}
          </span>
          <h1 class="hs-heading">
            <span class="hs-heading-line">${s.headingLines[0]}</span>
            <span class="hs-heading-line hs-heading-accent">${s.headingLines[1]}</span>
          </h1>
          <p class="hs-desc">${s.desc}</p>
          <div class="hs-cta-row">
            <a href="#quote" class="hs-btn hs-btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20V4M5 11l7-7 7 7"/></svg>
              <span>Get a Free Quote</span>
            </a>
            <a href="${s.exploreHref}" class="hs-btn hs-btn-ghost">
              <span>Explore Range</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>
            </a>
          </div>
        </div>

        <div class="hs-slide-visual">
          <div class="hs-splash" aria-hidden="true">
            <span class="hs-ring hs-ring-a"></span>
            <span class="hs-ring hs-ring-b"></span>
            <span class="hs-glow"></span>
            <svg class="hs-wave" viewBox="0 0 600 120" preserveAspectRatio="none">
              <path d="M0,70 C100,30 200,100 300,60 C400,20 500,90 600,50 L600,120 L0,120 Z" fill="url(#hsWaveGrad${i})"/>
              <defs>
                <linearGradient id="hsWaveGrad${i}" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#5bb8ff" stop-opacity="0.55"/>
                  <stop offset="100%" stop-color="#0d5ef4" stop-opacity="0.05"/>
                </linearGradient>
              </defs>
            </svg>
            ${[...Array(7)].map((_, d) => `<span class="hs-droplet" style="--d:${d}"></span>`).join('')}
          </div>
          <img class="hs-product-img" src="${s.image}" alt="${s.alt}" loading="${i === 0 ? 'eager' : 'lazy'}">
        </div>
      </div>
    `).join('');

    const dots = SLIDES.map((_, i) => `<button class="hs-dot" data-dot="${i}" aria-label="Go to slide ${i + 1}"></button>`).join('');

    this.root.innerHTML = `
      <div class="hs-bg" style="background-image:url('${BG_IMAGE}')" aria-hidden="true"></div>
      <div class="hs-scrim" aria-hidden="true"></div>

      <div class="hs-inner">
        <div class="hs-slides" id="hsSlides">${slides}</div>

        <div class="hs-controls">
          <button class="hs-arrow hs-arrow-prev" aria-label="Previous slide">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div class="hs-dots" id="hsDots" role="tablist" aria-label="Hero slide navigation">${dots}</div>
          <button class="hs-arrow hs-arrow-next" aria-label="Next slide">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    `;
  }

  /* ------ Cache DOM refs ------ */
  _cache() {
    this.slideEls = [...this.root.querySelectorAll('.hs-slide')];
    this.dotEls   = [...this.root.querySelectorAll('.hs-dot')];
    this.prevBtn  = this.root.querySelector('.hs-arrow-prev');
    this.nextBtn  = this.root.querySelector('.hs-arrow-next');
    this.slidesWrap = this.root.querySelector('#hsSlides');
  }

  /* ------ Navigation ------ */
  _goTo(i, isInitial = false) {
    this.current = ((i % this.total) + this.total) % this.total;

    this.slideEls.forEach((el, idx) => {
      el.classList.toggle('is-active', idx === this.current);
    });
    this.dotEls.forEach((d, idx) => d.classList.toggle('is-active', idx === this.current));

    this._playSplash(this.slideEls[this.current]);
    if (!isInitial) this._restartAuto();
  }

  _next() { this._goTo(this.current + 1); }
  _prev() { this._goTo(this.current - 1); }

  /* ------ Replay the water-splash burst on the active slide ------ */
  _playSplash(slideEl) {
    const splash = slideEl.querySelector('.hs-splash');
    if (!splash) return;
    splash.classList.remove('is-bursting');
    void splash.offsetWidth; /* force reflow so the animation restarts */
    splash.classList.add('is-bursting');
  }

  /* ------ Autoplay ------ */
  _startAuto() {
    this.autoTimer = setInterval(() => this._next(), AUTOPLAY_MS);
  }
  _stopAuto() {
    clearInterval(this.autoTimer);
  }
  _restartAuto() {
    this._stopAuto();
    this._startAuto();
  }

  /* ------ Events ------ */
  _bindEvents() {
    this.prevBtn.addEventListener('click', () => this._prev());
    this.nextBtn.addEventListener('click', () => this._next());
    this.dotEls.forEach((d, i) => d.addEventListener('click', () => this._goTo(i)));

    this.root.addEventListener('mouseenter', () => this._stopAuto());
    this.root.addEventListener('mouseleave', () => this._startAuto());

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this._stopAuto(); else this._startAuto();
    });

    /* Keyboard */
    this.root.setAttribute('tabindex', '-1');
    this.root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this._next();
      if (e.key === 'ArrowLeft') this._prev();
    });

    /* Touch swipe */
    let tx = 0;
    this.slidesWrap.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    this.slidesWrap.addEventListener('touchend', (e) => {
      const diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 48) (diff > 0 ? this._next() : this._prev());
    }, { passive: true });
  }
}
