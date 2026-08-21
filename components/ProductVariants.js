/* =========================================================
   ProductVariants — intermediate page (looked up from the ?id=
   URL param) that lists a single product's COLORS as cards, each
   with its own photo. Colors are photo-only choices, independent
   of price — every card shows the product's starting price.
   Each card's "View More" deep-links into ProductDetail.js with
   the matching color pre-selected via &color=<index>.
   ========================================================= */

import { findProductById, formatPrice, startingPrice, productColors } from './productsData.js?v=4';
import { observeCardEntrances } from './productCardUtils.js?v=2';

export default class ProductVariants {
  constructor({ root }) {
    this.root = document.querySelector(root);
    if (!this.root) return;

    const id = new URLSearchParams(window.location.search).get('id');
    const product = findProductById(id);

    if (!product) {
      this._renderNotFound();
      return;
    }

    this.product = product;
    this._render(product);
    observeCardEntrances(this.root.querySelectorAll('.premium-card'));
  }

  _render(product) {
    document.title = `${product.name} - Clean Water System`;

    const header = document.createElement('header');
    header.className = 'products-page-header';
    header.innerHTML = `
      <p class="section-label">Product</p>
      <span class="label-underline" aria-hidden="true"></span>
      <h1 class="page-title">${product.name}</h1>
      <p class="section-subtitle">Choose a color to view full details.</p>
    `;

    const gridWrap = document.createElement('div');
    gridWrap.className = 'category-page-grid-wrap';

    const grid = document.createElement('div');
    grid.className = 'product-card-grid';

    const colors = productColors(product);
    const price = formatPrice(startingPrice(product));

    colors.forEach((color, index) => {
      const card = document.createElement('article');
      card.className = 'premium-card';
      const label = color.name || `Option ${index + 1}`;
      card.innerHTML = `
        <div class="card-photo-area">
          <span class="podium-glow" aria-hidden="true"></span>
          <img class="product-photo" src="${color.image}" alt="${product.name} — ${label}" loading="lazy" />
          <span class="podium-base" aria-hidden="true"></span>
        </div>
        <h3 class="card-title">${label}</h3>
        <span class="title-underline" aria-hidden="true"></span>
        <p class="card-price">From ${price}</p>
        <a class="card-view-more" href="product-detail.html?id=${product.id}&color=${index}">View More</a>
      `;
      grid.appendChild(card);
    });

    gridWrap.appendChild(grid);
    this.root.appendChild(header);
    this.root.appendChild(gridWrap);
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
