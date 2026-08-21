/* =========================================================
   CategoryPage — renders every product in a single category
   (looked up by id) on its own dedicated page, e.g.
   multibrand-water-purifiers.html.
   ========================================================= */

import { getAllProducts, getAllCategories } from './productsData.js?v=4';
import { buildProductCard, observeCardEntrances } from './productCardUtils.js?v=2';

export default class CategoryPage {
  constructor({ container, categoryId }) {
    this.container = document.querySelector(container);
    if (!this.container) return;

    const category = getAllCategories().find((c) => c.id === categoryId);

    if (!category) {
      this._renderNotFound();
      return;
    }

    document.title = `${category.name} - Clean Water System`;
    this._render(category);
    observeCardEntrances(this.container.querySelectorAll('.premium-card'));
  }

  _render(category) {
    const header = document.createElement('header');
    header.className = 'products-page-header';
    header.innerHTML = `
      <p class="section-label">Category</p>
      <span class="label-underline" aria-hidden="true"></span>
      <h1 class="page-title">${category.name}</h1>
      <p class="section-subtitle">Browse all ${category.name} products.</p>
    `;

    const gridWrap = document.createElement('div');
    gridWrap.className = 'category-page-grid-wrap';

    const grid = document.createElement('div');
    grid.className = 'product-card-grid';
    getAllProducts()
      .filter((product) => product.category === category.id)
      .forEach((product) => grid.appendChild(buildProductCard(product)));

    gridWrap.appendChild(grid);
    this.container.appendChild(header);
    this.container.appendChild(gridWrap);
  }

  _renderNotFound() {
    this.container.innerHTML = `
      <div class="detail-not-found">
        <h1>Category not found</h1>
        <p>The category you're looking for doesn't exist or may have been removed.</p>
        <a class="order-now-btn" href="products.html">Browse all products</a>
      </div>
    `;
  }
}
