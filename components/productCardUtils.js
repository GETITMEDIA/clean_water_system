/* =========================================================
   Shared product-card rendering helpers — used by ProductsPage.js
   and CategoryPage.js so the card markup/entrance animation only
   needs to be written (and fixed) in one place.
   ========================================================= */

import { formatPrice, startingPrice } from './productsData.js?v=4';

export function buildProductCard(product) {
  const card = document.createElement('article');
  card.className = 'premium-card';
  card.innerHTML = `
    <div class="card-photo-area">
      <span class="podium-glow" aria-hidden="true"></span>
      <img class="product-photo" src="${product.image}" alt="${product.name}" loading="lazy" />
      <span class="podium-base" aria-hidden="true"></span>
    </div>
    <h3 class="card-title">${product.name}</h3>
    <span class="title-underline" aria-hidden="true"></span>
    <p class="card-price">From ${formatPrice(startingPrice(product))}</p>
    <a class="card-view-more" href="product-variants.html?id=${product.id}">View More</a>
  `;
  return card;
}

export function observeCardEntrances(elements) {
  const list = [...elements].filter(Boolean);
  if (!list.length) return;

  if (!('IntersectionObserver' in window)) {
    list.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  list.forEach((el) => observer.observe(el));
}
