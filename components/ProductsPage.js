/* =========================================================
   ProductsPage — renders one section per category (each with a
   4-card grid + "View More" button) from the shared product
   catalog, then reveals cards with a scroll fade-up.
   ========================================================= */

import { getAllProducts, getAllCategories, WHATSAPP_NUMBER } from './productsData.js?v=4';
import { buildProductCard, observeCardEntrances } from './productCardUtils.js?v=2';
import { CATEGORY_FALLBACKS } from './categoryFallbackContent.js';

export default class ProductsPage {
  constructor({ container }) {
    this.container = document.querySelector(container);
    if (!this.container) return;

    this._render();
    observeCardEntrances(this.container.querySelectorAll('.premium-card'));
  }

  _render() {
    const products   = getAllProducts();
    const categories = getAllCategories();
    const fragment   = document.createDocumentFragment();

    const PREVIEW_LIMIT = 4;

    categories.forEach((category) => {
      const catProducts = products
        .filter((p) => p.category === category.id)
        .slice(0, PREVIEW_LIMIT);

      const section = document.createElement('section');
      section.className = 'product-category-section';
      section.id = category.id;

      const inner = document.createElement('div');
      inner.className = 'category-inner';

      const heading = document.createElement('div');
      heading.className = 'category-heading';
      heading.innerHTML = `
        <h2>${category.name}<span class="category-underline" aria-hidden="true"></span></h2>
        <a class="category-view-more" href="${category.id}.html">View More</a>
      `;

      inner.appendChild(heading);

      if (catProducts.length) {
        const grid = document.createElement('div');
        grid.className = 'product-card-grid';
        catProducts.forEach((product) => grid.appendChild(buildProductCard(product)));
        inner.appendChild(grid);
      } else if (CATEGORY_FALLBACKS[category.id]) {
        inner.appendChild(this._buildFallbackRow(CATEGORY_FALLBACKS[category.id]));
      }

      section.appendChild(inner);
      fragment.appendChild(section);
    });

    this.container.appendChild(fragment);
  }

  _buildFallbackRow(fallback) {
    const row = document.createElement('div');
    row.className = 'cat-fallback-row';
    row.innerHTML = `
      <div class="cat-fallback-image">
        <img src="${fallback.image}" alt="${fallback.name}" loading="lazy" />
      </div>
      <div class="cat-fallback-text">
        <h3>${fallback.name}</h3>
        <span class="cat-fallback-underline" aria-hidden="true"></span>
        <p>${fallback.description}</p>
        <a class="cat-fallback-enquire-btn" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fallback.whatsappText)}" target="_blank" rel="noopener">Enquire Now</a>
      </div>
    `;
    return row;
  }
}
