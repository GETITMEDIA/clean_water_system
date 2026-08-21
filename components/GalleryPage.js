/* =========================================================
   GalleryPage — category filter chips + click-to-enlarge
   lightbox (with prev/next navigation) for the photo grid.
   ========================================================= */

import { revealOnScroll } from './scrollReveal.js';

export default class GalleryPage {
  constructor({ grid, filterBar, lightbox }) {
    this.grid = document.querySelector(grid);
    this.filterBar = document.querySelector(filterBar);
    this.lightbox = document.querySelector(lightbox);
    if (!this.grid) return;

    this.items = [...this.grid.querySelectorAll('.gallery-item')];
    this.lbImg = this.lightbox?.querySelector('.gallery-lightbox-img');
    this.lbCaption = this.lightbox?.querySelector('.gallery-lightbox-caption');
    this.lbPrev = this.lightbox?.querySelector('.gallery-lightbox-prev');
    this.lbNext = this.lightbox?.querySelector('.gallery-lightbox-next');
    this.currentIndex = 0;

    this._bindFilters();
    this._bindLightbox();
    revealOnScroll(['.gallery-item']);
  }

  _visibleItems() {
    return this.items.filter((item) => !item.classList.contains('is-hidden'));
  }

  _bindFilters() {
    if (!this.filterBar) return;
    const chips = [...this.filterBar.querySelectorAll('.gallery-chip')];

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.toggle('is-active', c === chip));
        const category = chip.dataset.filter;
        this.items.forEach((item) => {
          const match = category === 'all' || item.dataset.category === category;
          item.classList.toggle('is-hidden', !match);
        });
      });
    });
  }

  _bindLightbox() {
    if (!this.lightbox || !this.lbImg) return;

    this.items.forEach((item) => {
      item.addEventListener('click', () => {
        const visible = this._visibleItems();
        this.currentIndex = visible.indexOf(item);
        this._openAt(this.currentIndex);
      });
    });

    this.lbPrev?.addEventListener('click', () => this._step(-1));
    this.lbNext?.addEventListener('click', () => this._step(1));

    this.lightbox.querySelector('.gallery-lightbox-close')?.addEventListener('click', () => this._close());
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) this._close();
    });
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') this._close();
      if (e.key === 'ArrowLeft') this._step(-1);
      if (e.key === 'ArrowRight') this._step(1);
    });
  }

  _openAt(index) {
    const visible = this._visibleItems();
    if (!visible.length) return;
    this.currentIndex = (index + visible.length) % visible.length;

    const item = visible[this.currentIndex];
    const img = item.querySelector('img');
    this.lbImg.src = img.src;
    this.lbImg.alt = img.alt;
    if (this.lbCaption) this.lbCaption.textContent = item.dataset.caption || img.alt;

    const multiple = visible.length > 1;
    this.lbPrev?.classList.toggle('is-hidden', !multiple);
    this.lbNext?.classList.toggle('is-hidden', !multiple);

    this.lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  _step(direction) {
    if (!this.lightbox.classList.contains('is-open')) return;
    this._openAt(this.currentIndex + direction);
  }

  _close() {
    this.lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}
