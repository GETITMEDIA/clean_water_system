/* =========================================================
   ProductDetail — renders a single product (looked up from the
   ?id= URL param): photo + color thumbnail rail, a price-linked
   variant list, spec bullets, an Enquire Now WhatsApp link, a
   Features dropdown (mirrors the variant list), and an
   included-items note.

   Variants (price tiers, e.g. "RO + Minerals") and colors (photo
   choices, e.g. "Green") are fully independent selections:
   - Picking a variant changes ONLY the price. The photo/thumbnail
     rail is untouched.
   - Clicking a color thumbnail changes ONLY the displayed photo.
     The price/selected variant is untouched.
   Colors are shared across every variant of a product — the rail
   is built once and never rebuilt when the variant changes.

   Note: Enquire Now always opens our WhatsApp number directly via a
   wa.me link — never the OS share sheet (navigator.share), since that
   lets the customer pick any app/contact instead of landing straight
   in our chat. The product image URL is pasted into the message text
   itself; WhatsApp renders that as a link preview once the site is
   live on a real domain it can fetch from (not on localhost).
   ========================================================= */

import { findProductById, formatPrice, startingPrice, productColors, getAllProducts, WHATSAPP_NUMBER } from './productsData.js?v=4';

export default class ProductDetail {
  constructor({ root }) {
    this.root = document.querySelector(root);
    if (!this.root) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const product = findProductById(id);

    if (!product) {
      this._renderNotFound();
      return;
    }

    const requestedVariant = Number(params.get('variant'));
    const requestedColor = Number(params.get('color'));
    this.product = product;
    this.selectedVariantIndex = Number.isInteger(requestedVariant) && product.variants[requestedVariant]
      ? requestedVariant
      : 0;
    this.colors = productColors(product);
    this.selectedImageSrc = (Number.isInteger(requestedColor) && this.colors[requestedColor]?.image)
      || this.colors[0]?.image
      || product.image;
    this._renderProduct(product);
    this._cacheElements();
    this._renderThumbs();
    this._bindEvents();
    this._applySelection();
    this._renderRelatedProducts(product);
  }

  /* Builds the thumbnail rail once from the product's shared colors.
     Hidden entirely when there's only one color — nothing to pick
     between. Never rebuilt when the variant/price selection changes. */
  _renderThumbs() {
    this.thumbsEl.classList.toggle('is-hidden', this.colors.length < 2);
    this.thumbsEl.innerHTML = this.colors
      .map(
        (c) => `
        <button type="button" class="detail-color-thumb" data-img="${this._esc(c.image)}" aria-label="${c.name ? `${this.product.name} — ${c.name}` : `${this.product.name} photo`}">
          <img src="${c.image}" alt="" />
          <span class="thumb-radio" aria-hidden="true"></span>
        </button>`
      )
      .join('');

    this.colorThumbButtons = [...this.thumbsEl.querySelectorAll('.detail-color-thumb')];
    this.colorThumbButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedImageSrc = btn.dataset.img;
        this._applySelection();
      });
    });
  }

  _renderProduct(product) {
    document.title = `${product.name} - Clean Water System`;

    const variantList = product.variants
      .map(
        (variant, index) => `
        <li>
          <button type="button" class="detail-variant-link" data-index="${index}">
            <span class="variant-name">${variant.name}</span>
            <span class="variant-price">${formatPrice(variant.price)}</span>
          </button>
        </li>`
      )
      .join('');

    const descriptionItems = product.descriptionList.map((line) => `<li>${line}</li>`).join('');

    const variantOptions = product.variants
      .map((variant, index) => `<option value="${index}">${variant.name}</option>`)
      .join('');

    this.root.innerHTML = `
      <a class="detail-back-link" href="products.html">&larr; Back to all products</a>
      <div class="detail-grid">
        <div class="detail-photo-row">
          <div class="detail-photo-main">
            <span class="detail-podium-glow" aria-hidden="true"></span>
            <img class="detail-photo" id="detailMainPhoto" src="${product.image}" alt="${product.name}" />
            <span class="detail-podium-base" aria-hidden="true"></span>
          </div>
          <div class="detail-color-thumbs" id="detailColorThumbs"></div>
        </div>

        <div class="detail-info">
          <h1>${product.name}</h1>
          <p class="detail-price" id="detailPrice"></p>

          <ul class="detail-variant-list" id="detailVariantList">
            ${variantList}
          </ul>

          <h2 class="detail-section-heading">Description</h2>
          <ul class="detail-description-list">${descriptionItems}</ul>

          <div class="detail-actions">
            <button type="button" class="enquire-now-btn" id="enquireNowBtn">ENQUIRE NOW</button>
          </div>

          <div class="detail-features">
            <label for="detailFeaturesSelect">Features</label>
            <select id="detailFeaturesSelect">
              <option value="" disabled>Select</option>
              ${variantOptions}
            </select>
          </div>

          <div class="detail-installation">
            <h2 class="detail-section-heading">Free Installation!</h2>
            <p>${product.includedItems}</p>
          </div>
        </div>
      </div>
    `;
  }

  _cacheElements() {
    this.priceEl = this.root.querySelector('#detailPrice');
    this.mainPhoto = this.root.querySelector('#detailMainPhoto');
    this.thumbsEl = this.root.querySelector('#detailColorThumbs');
    this.colorThumbButtons = [];
    this.variantLinkButtons = [...this.root.querySelectorAll('.detail-variant-link')];
    this.featuresSelect = this.root.querySelector('#detailFeaturesSelect');
    this.enquireNowBtn = this.root.querySelector('#enquireNowBtn');
  }

  _bindEvents() {
    this.variantLinkButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedVariantIndex = Number(btn.dataset.index);
        this._applySelection();
      });
    });

    this.featuresSelect.addEventListener('change', (e) => {
      this.selectedVariantIndex = Number(e.target.value);
      this._applySelection();
    });

    this.enquireNowBtn.addEventListener('click', () => this._handleEnquireClick());
  }

  _applySelection() {
    const product = this.product;
    const variant = product.variants[this.selectedVariantIndex];

    this.priceEl.textContent = formatPrice(variant.price);

    this.variantLinkButtons.forEach((btn) => {
      btn.classList.toggle('is-selected', Number(btn.dataset.index) === this.selectedVariantIndex);
    });
    this.colorThumbButtons.forEach((btn) => {
      btn.classList.toggle('is-selected', btn.dataset.img === this.selectedImageSrc);
    });

    if (this.selectedImageSrc && this.mainPhoto.src !== this.selectedImageSrc) {
      this.mainPhoto.src = this.selectedImageSrc;
    }

    this.featuresSelect.value = String(this.selectedVariantIndex);
  }

  /* ------ Enquire Now: go straight to our WhatsApp number, no chooser ------
     The product image URL is pasted directly into the message text (not
     attached as a file) — WhatsApp auto-generates a link preview/thumbnail
     for it once the message is sent, as long as the URL is one WhatsApp's
     own servers can actually reach. That means this only renders a preview
     once the site is on a real public domain; on localhost the URL is
     unreachable from outside this machine, so no preview can appear no
     matter what the code does — that's not fixable from here. */
  _handleEnquireClick() {
    const variant = this.product.variants[this.selectedVariantIndex];
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      this._buildEnquiryMessage(variant)
    )}`;
    window.open(waUrl, '_blank', 'noopener');
  }

  _buildEnquiryMessage(variant) {
    const product = this.product;
    const imageUrl = new URL(this.mainPhoto.src, window.location.href).href;
    return (
      `Hello, I would like to order the following product:\n\n` +
      `Product Name: ${product.name} (${variant.name})\n` +
      `Price: ${formatPrice(variant.price)}\n` +
      `Image: ${imageUrl}\n\n` +
      `Please share more details about availability and delivery.`
    );
  }

  _renderRelatedProducts(product) {
    const related = getAllProducts().filter((p) => p.id !== product.id);
    if (!related.length) return;

    const cards = related
      .map(
        (p) => `
        <a class="detail-related-card" href="product-variants.html?id=${p.id}">
          <span class="detail-related-photo-area">
            <img src="${p.image}" alt="${p.name}" loading="lazy" />
          </span>
          <span class="detail-related-name">${p.name}</span>
          <span class="detail-related-price">${formatPrice(startingPrice(p))}</span>
        </a>`
      )
      .join('');

    const section = document.createElement('section');
    section.className = 'detail-related';
    section.innerHTML = `
      <h2 class="detail-related-heading">Related Products</h2>
      <div class="detail-related-carousel">
        <button type="button" class="detail-related-nav detail-related-nav-prev" aria-label="Scroll left">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="detail-related-track" id="detailRelatedTrack">${cards}</div>
        <button type="button" class="detail-related-nav detail-related-nav-next" aria-label="Scroll right">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    `;

    this.root.appendChild(section);

    const track = section.querySelector('#detailRelatedTrack');
    const scrollByCard = () => track.querySelector('.detail-related-card')?.getBoundingClientRect().width + 20 || 260;

    section.querySelector('.detail-related-nav-prev').addEventListener('click', () => {
      track.scrollBy({ left: -scrollByCard(), behavior: 'smooth' });
    });
    section.querySelector('.detail-related-nav-next').addEventListener('click', () => {
      track.scrollBy({ left: scrollByCard(), behavior: 'smooth' });
    });
  }

  _esc(str) {
    return String(str ?? '').replace(/"/g, '&quot;');
  }

  _renderNotFound() {
    this.root.innerHTML = `
      <div class="detail-not-found">
        <h1>Product not found</h1>
        <p>The product you're looking for doesn't exist or may have been removed.</p>
        <a class="order-now-btn" href="products.html">Browse all products</a>
      </div>
    `;
  }
}
