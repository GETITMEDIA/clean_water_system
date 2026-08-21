/* =========================================================
   ProductShowcase — premium product range section background.
   Spawns the ambient floating water droplets behind the heading
   and category listings. Card/button entrance animation is owned
   by ProductsPage.js, which renders the cards themselves.
   ========================================================= */

export default class ProductShowcase {
  constructor({ root, dropletLayer, dropletCount = 16 }) {
    this.root = document.querySelector(root);
    this.dropletLayer = document.querySelector(dropletLayer);

    if (!this.root) return;

    this._spawnDroplets(dropletCount);
  }

  _spawnDroplets(count) {
    if (!this.dropletLayer) return;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const droplet = document.createElement('span');
      droplet.className = 'droplet';
      const size = 6 + Math.random() * 12;
      droplet.style.left = `${Math.random() * 100}%`;
      droplet.style.top = `${Math.random() * 90}%`;
      droplet.style.width = `${size}px`;
      droplet.style.height = `${size}px`;
      droplet.style.opacity = String(0.4 + Math.random() * 0.5);
      droplet.style.animationDuration = `${5 + Math.random() * 5}s`;
      droplet.style.animationDelay = `${Math.random() * -8}s`;
      fragment.appendChild(droplet);
    }

    this.dropletLayer.appendChild(fragment);
  }
}
