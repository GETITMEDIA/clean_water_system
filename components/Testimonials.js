/* =========================================================
   Testimonials — auto-playing sliding carousel with
   touch swipe, dot nav, pause-on-hover, and IntersectionObserver
   entrance animation.
   ========================================================= */

const TESTIMONIALS = [
  {
    text: 'The water quality has completely transformed since installing the Clean Water System RO purifier. My family now drinks directly from the tap without any worries. The taste is crystal clear!',
    name: 'Rajesh Kumar',
    location: 'Mumbai, Maharashtra',
    product: 'Domestic RO Purifier',
    initial: 'R',
    rating: 5,
  },
  {
    text: 'Installation was completed within 2 hours by their certified technician. Very professional team. The water tastes incredibly pure and our electric kettle no longer has white deposits!',
    name: 'Priya Sharma',
    location: 'New Delhi',
    product: 'Water Softener Plant',
    initial: 'P',
    rating: 5,
  },
  {
    text: 'We installed the industrial RO plant for our restaurant 8 months ago. Zero complaints, zero maintenance issues. The water is consistently pure and our customers have noticed the difference in food quality.',
    name: 'Arjun Nair',
    location: 'Bengaluru, Karnataka',
    product: 'Commercial RO Plant',
    initial: 'A',
    rating: 5,
  },
  {
    text: 'My children had frequent stomach issues due to contaminated water. After installing Clean Water System, their health has dramatically improved. Best investment we have ever made for our family.',
    name: 'Sunita Patel',
    location: 'Ahmedabad, Gujarat',
    product: 'Domestic RO Purifier',
    initial: 'S',
    rating: 5,
  },
  {
    text: 'The after-sales service is exceptional. They respond within 24 hours and the annual maintenance is very thorough. Worth every rupee. Highly recommend to anyone looking for reliable water purification.',
    name: 'Mohammed Ali',
    location: 'Hyderabad, Telangana',
    product: 'Multibrand Water Purifier',
    initial: 'M',
    rating: 5,
  },
  {
    text: 'We installed their iron removal plant for our overhead tank. The water used to leave orange stains on everything. Now it is crystal clear! The team was professional and the results are outstanding.',
    name: 'Lakshmi Iyer',
    location: 'Chennai, Tamil Nadu',
    product: 'Iron Removal Plant',
    initial: 'L',
    rating: 5,
  },
];

const STATS = [
  { number: '5,000', suffix: '+', label: 'Happy Customers' },
  { number: '10',    suffix: '+', label: 'Years Experience' },
  { number: '99.9',  suffix: '%', label: 'Water Purity' },
  { number: '24/7',  suffix: '',  label: 'Customer Support' },
];

export default class Testimonials {
  constructor({ root }) {
    this.root = document.querySelector(root);
    if (!this.root) return;
    this.current = 0;
    this.autoTimer = null;
    this._render();
    this._cache();
    this._bindEvents();
    this._update();
    this._startAuto();
    this._observeEntrance();
    this._spawnBubbles();
  }

  /* ------ Render HTML ------ */
  _render() {
    const cards = TESTIMONIALS.map(
      (t) => `
      <div class="ts-card">
        <div class="ts-card-inner">
          <span class="ts-quote-mark" aria-hidden="true">“</span>
          <div class="ts-stars" aria-label="${t.rating} out of 5 stars">
            ${'<span class="ts-star" aria-hidden="true">★</span>'.repeat(t.rating)}
          </div>
          <p class="ts-text">${t.text}</p>
          <div class="ts-author">
            <div class="ts-avatar" aria-hidden="true">${t.initial}</div>
            <div>
              <p class="ts-author-name">${t.name}</p>
              <p class="ts-author-location">${t.location}</p>
              <span class="ts-product-tag">${t.product}</span>
            </div>
          </div>
        </div>
      </div>`
    ).join('');

    const stats = STATS.map(
      (s) => `
      <div class="ts-stat">
        <p class="ts-stat-number">${s.number}<em>${s.suffix}</em></p>
        <p class="ts-stat-label">${s.label}</p>
      </div>`
    ).join('');

    const dots = TESTIMONIALS.map(
      (_, i) => `<button class="ts-dot" aria-label="Go to testimonial ${i + 1}" data-dot="${i}"></button>`
    ).join('');

    this.root.innerHTML = `
      <div class="ts-glow ts-glow-a" aria-hidden="true"></div>
      <div class="ts-glow ts-glow-b" aria-hidden="true"></div>
      <div class="ts-bubbles" id="tsBubbles" aria-hidden="true"></div>

      <svg class="ts-wave-top" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,0 C360,80 1080,0 1440,60 L1440,0 Z" fill="#eaf6ff"/>
      </svg>

      <div class="ts-inner">

        <header class="ts-heading">
          <p class="ts-label">What Our Customers Say</p>
          <span class="ts-underline" aria-hidden="true"></span>
          <h2 class="ts-title" id="testimonialsHeading">Real Stories. <span>Pure Results.</span></h2>
          <p class="ts-subtitle">Thousands of families and businesses trust us for clean, safe water every day.</p>
        </header>

        <div class="ts-stats" aria-label="Company statistics">
          ${stats}
        </div>

        <div class="ts-carousel-wrapper" role="region" aria-labelledby="testimonialsHeading">
          <button class="ts-btn ts-btn-prev" aria-label="Previous testimonial">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="ts-track-clip">
            <div class="ts-track" id="tsTrack" aria-live="polite">
              ${cards}
            </div>
          </div>

          <button class="ts-btn ts-btn-next" aria-label="Next testimonial">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div class="ts-dots" id="tsDots" role="tablist" aria-label="Testimonial navigation">
          ${dots}
        </div>

      </div>
    `;
  }

  /* ------ Spawn floating bubbles ------ */
  _spawnBubbles() {
    const container = this.root.querySelector('#tsBubbles');
    for (let i = 0; i < 14; i++) {
      const b = document.createElement('span');
      b.className = 'ts-bubble';
      const size = Math.random() * 70 + 18;
      b.style.cssText = `
        width:${size}px;
        height:${size}px;
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 70}%;
        animation-duration:${Math.random() * 10 + 9}s;
        animation-delay:${Math.random() * 7}s;
      `;
      container.appendChild(b);
    }
  }

  /* ------ Cache DOM refs ------ */
  _cache() {
    this.track = this.root.querySelector('#tsTrack');
    this.clip  = this.root.querySelector('.ts-track-clip');
    this.dots  = [...this.root.querySelectorAll('.ts-dot')];
    this.prevBtn = this.root.querySelector('.ts-btn-prev');
    this.nextBtn = this.root.querySelector('.ts-btn-next');
    this.total = TESTIMONIALS.length;
  }

  /* ------ How many cards fit in the viewport ------ */
  _visible() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640)  return 2;
    return 1;
  }

  _maxIndex() {
    return Math.max(0, this.total - this._visible());
  }

  /* ------ Sync card widths + translate ------ */
  _update() {
    const vis = this._visible();
    const pct = 100 / vis;
    [...this.track.querySelectorAll('.ts-card')].forEach((c) => {
      c.style.flex = `0 0 ${pct}%`;
      c.style.maxWidth = `${pct}%`;
      c.style.minWidth = `${pct}%`;
    });
    this.track.style.transform = `translateX(-${this.current * pct}%)`;
    this.dots.forEach((d, i) => d.classList.toggle('is-active', i === this.current));
  }

  /* ------ Navigation ------ */
  _goTo(i) {
    this.current = Math.min(Math.max(0, i), this._maxIndex());
    this._update();
  }

  _next() {
    this._goTo(this.current >= this._maxIndex() ? 0 : this.current + 1);
  }

  _prev() {
    this._goTo(this.current <= 0 ? this._maxIndex() : this.current - 1);
  }

  /* ------ Auto-play ------ */
  _startAuto() {
    this.autoTimer = setInterval(() => this._next(), 4000);
  }

  _stopAuto() {
    clearInterval(this.autoTimer);
  }

  /* ------ Events ------ */
  _bindEvents() {
    this.prevBtn.addEventListener('click', () => {
      this._stopAuto(); this._prev(); this._startAuto();
    });
    this.nextBtn.addEventListener('click', () => {
      this._stopAuto(); this._next(); this._startAuto();
    });
    this.dots.forEach((d, i) => {
      d.addEventListener('click', () => {
        this._stopAuto(); this._goTo(i); this._startAuto();
      });
    });

    /* Pause on hover */
    this.clip.addEventListener('mouseenter', () => this._stopAuto());
    this.clip.addEventListener('mouseleave', () => this._startAuto());

    /* Touch swipe */
    let tx = 0;
    this.clip.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
    this.clip.addEventListener('touchend', (e) => {
      const diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 48) {
        this._stopAuto();
        diff > 0 ? this._next() : this._prev();
        this._startAuto();
      }
    });

    /* Reflow on resize */
    window.addEventListener('resize', () => {
      this._update();
    });
  }

  /* ------ Scroll-triggered entrance ------ */
  _observeEntrance() {
    if (!('IntersectionObserver' in window)) {
      this.root.classList.add('ts-visible');
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.root.classList.add('ts-visible');
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(this.root);
  }
}
