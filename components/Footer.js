/* =========================================================
   Footer — sitewide footer rendered into <footer id="siteFooter">
   on every page. Single source of truth so link/contact-detail
   changes only need to happen here once.
   ========================================================= */

const WHATSAPP_NUMBER = '919600879192';
const PHONE_NUMBERS = [
  { display: '96008 79192', tel: '+919600879192' },
  { display: '90437 29192', tel: '+919043729192' },
];
const EMAIL = 'cleanwatersystemskaqua@gmail.com';
const WEBSITE = 'www.cleanwatersystem.com';

const QUICK_LINKS = [
  { label: 'Home', href: 'index.html#home' },
  { label: 'About Us', href: 'about.html' },
  { label: 'Products', href: 'products.html' },
  { label: 'Gallery', href: 'gallery.html' },
  { label: 'Contact Us', href: 'contact.html' },
];

const PRODUCT_LINKS = [
  { label: 'Multibrand Water Purifiers', href: 'multibrand-water-purifiers.html', icon: 'droplet' },
  { label: 'Domestic Water Purifiers', href: 'domestic-water-purifiers.html', icon: 'home' },
  { label: 'Industrial &amp; Commercial RO Plants', href: 'industrial-commercial-ro-plants.html', icon: 'factory' },
  { label: 'Water Softener Plant', href: 'water-softener-plant.html', icon: 'tanks' },
  { label: 'Iron Removal Plant', href: 'iron-removal-plant.html', icon: 'shield' },
  { label: 'Water Conditioner', href: 'water-conditioner.html', icon: 'sliders' },
  { label: 'Sand Filter', href: 'sand-filter.html', icon: 'layers' },
  { label: 'Automatic Level Controller', href: 'automatic-level-controller.html', icon: 'gauge' },
];

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', icon: 'facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/popular/cleaning-water-systems/', icon: 'instagram' },
  { label: 'LinkedIn', href: '#', icon: 'linkedin' },
  { label: 'YouTube', href: '#', icon: 'youtube' },
];

const ICONS = {
  droplet: '<path d="M12 2C12 2 5 11 5 15.5C5 19.6 8.4 23 12 23C15.6 23 19 19.6 19 15.5C19 11 12 2 12 2Z"/>',
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>',
  factory: '<path d="M3 21V11l6 4v-4l6 4v-4l6 4v6H3Z"/><path d="M7 21v-4M12 21v-4M17 21v-4"/>',
  tanks: '<rect x="4" y="6" width="6" height="15" rx="3"/><rect x="14" y="6" width="6" height="15" rx="3"/><path d="M4 11h6M14 11h6"/>',
  shield: '<path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6Z"/><polyline points="9 12 11 14 15 10"/>',
  sliders: '<line x1="4" y1="6" x2="20" y2="6"/><circle cx="9" cy="6" r="2"/><line x1="4" y1="12" x2="20" y2="12"/><circle cx="16" cy="12" r="2"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="10" cy="18" r="2"/>',
  layers: '<polygon points="12 2 22 8.5 12 15 2 8.5 12 2"/><polyline points="2 15.5 12 22 22 15.5"/><polyline points="2 12 12 18.5 22 12"/>',
  gauge: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M12 15 16 9"/><path d="M4.6 19a10 10 0 1 1 14.8 0"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z"/><polyline points="22 6 12 13 2 6"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/>',
  pin: '<path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/>',
  chevron: '<polyline points="9 18 15 12 9 6"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
  linkedin: '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"/><path d="M2 9h6v13H2z"/><path d="M9 9h5.6v2.2h.08c.78-1.4 2.68-2.9 5.52-2.9C25.7 8.3 22 12 22 17.2V22h-6v-4.4c0-2.6-.05-6-3.7-6-3.7 0-4.3 2.8-4.3 5.8V22H9Z"/>',
  youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><polygon points="10 9 16 12 10 15 10 9"/>',
};

function ico(name, size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
}

export default class Footer {
  constructor({ root }) {
    this.root = document.querySelector(root);
    if (!this.root) return;
    this._render();
  }

  _render() {
    const year = new Date().getFullYear();

    const quickLinks = QUICK_LINKS.map(
      (l) => `<li><a href="${l.href}">${ico('chevron', 15)}<span>${l.label}</span></a></li>`
    ).join('');

    const productLinks = PRODUCT_LINKS.map(
      (p) => `
        <a class="footer-product-link" href="${p.href}">
          <span class="footer-product-icon">${ico(p.icon, 20)}</span>
          <span>${p.label}</span>
        </a>`
    ).join('');

    const socialLinks = SOCIAL_LINKS.map(
      (s) => `<a class="footer-social-btn" href="${s.href}" aria-label="${s.label}" target="_blank" rel="noopener">${ico(s.icon, 16)}</a>`
    ).join('');

    this.root.innerHTML = `
      <div class="footer-wave" aria-hidden="true">
        <svg class="footer-wave-svg" viewBox="0 0 1440 160" preserveAspectRatio="none">
          <path d="M0,80 C240,20 480,140 720,80 C960,20 1200,140 1440,80 L1440,0 L0,0 Z" fill="rgba(255,255,255,0.14)"/>
          <path d="M0,100 C240,150 480,50 720,100 C960,150 1200,50 1440,100 L1440,160 L0,160 Z" fill="#f8fcff"/>
        </svg>
        <span class="footer-wave-bubble" style="left:6%;bottom:30%;width:10px;height:10px;"></span>
        <span class="footer-wave-bubble" style="left:22%;bottom:55%;width:7px;height:7px;"></span>
        <span class="footer-wave-bubble" style="left:44%;bottom:22%;width:14px;height:14px;"></span>
        <span class="footer-wave-bubble" style="left:63%;bottom:48%;width:8px;height:8px;"></span>
        <span class="footer-wave-bubble" style="left:80%;bottom:28%;width:11px;height:11px;"></span>
        <span class="footer-wave-bubble" style="left:92%;bottom:58%;width:6px;height:6px;"></span>
      </div>

      <div class="footer-main">
        <div class="footer-main-inner">

          <div class="footer-col footer-col-brand">
            <a href="index.html#home" class="footer-logo">
              <img src="assets/images/logo.png" alt="Clean Water System" class="footer-logo-img" width="46" height="46">
              <span class="footer-logo-text">
                <span class="footer-logo-title">CLEAN</span>
                <span class="footer-logo-subtitle">WATER SYSTEM</span>
              </span>
            </a>
            <p class="footer-tagline">Pure Water. Pure Life.</p>
            <p class="footer-desc">We provide advanced water treatment solutions for homes, businesses and industries. Our systems ensure safe, clean and healthy water for a better tomorrow.</p>
            <ul class="footer-brand-contact">
              <li>
                <span class="footer-contact-icon">${ico('phone', 15)}</span>
                <span>${PHONE_NUMBERS.map((p) => `<a href="tel:${p.tel}">${p.display}</a>`).join(' / ')}</span>
              </li>
              <li>
                <span class="footer-contact-icon">${ico('mail', 15)}</span>
                <a href="mailto:${EMAIL}">${EMAIL}</a>
              </li>
              <li>
                <span class="footer-contact-icon">${ico('globe', 15)}</span>
                <a href="https://${WEBSITE}" target="_blank" rel="noopener">${WEBSITE}</a>
              </li>
            </ul>
          </div>

          <div class="footer-col">
            <h3 class="footer-col-heading">Quick Links</h3>
            <ul class="footer-links-list">${quickLinks}</ul>
          </div>

          <div class="footer-col footer-col-products">
            <h3 class="footer-col-heading">Our Products</h3>
            <div class="footer-product-grid">${productLinks}</div>
          </div>

          <div class="footer-col">
            <h3 class="footer-col-heading">Contact Us</h3>
            <ul class="footer-contact-list">
              <li>
                <span class="footer-contact-icon">${ico('pin', 17)}</span>
                <span># 10, Vallalar Salai, 45 Feet Road,<br>Raja Rajeshwari Nagar (Rainbow Nagar Corner),<br>Pondicherry 605011</span>
              </li>
              <li>
                <span class="footer-contact-icon">${ico('pin', 17)}</span>
                <span>NO: 6/472, Vasantha Puram Phase II,<br>Abdul Kalam Nagar, 1st Street, Paraniputhur,<br>Chennai-600122</span>
              </li>
            </ul>
            <p class="footer-social-label">Follow Us</p>
            <div class="footer-contact-social">${socialLinks}</div>
          </div>

        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <p class="footer-copyright">
            <span>&copy; ${year} All Rights Reserved</span>
            <a
              href="https://www.getitmediasolutions.com/"
              target="_blank"
              rel="noopener"
              class="footer-agency-link"
              aria-label="GetIt Media Solutions — Online Digital Marketing (opens in a new tab)"
            >
              <span class="footer-agency-text">GETIT MEDIA SOLUTION</span>
            </a>
          </p>
        </div>
      </div>
    `;
  }
}
