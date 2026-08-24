/* =========================================================
   CLEAN WATER SYSTEM — NAVBAR INTERACTIONS
   - Mobile menu toggle (slide-in + animated icon)
   - Products dropdown toggle (click + outside click + Esc)
   - Active navigation highlighting (click + scrollspy)
   - Sticky navbar shadow enhancement on scroll
   - Smooth scrolling to in-page sections
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const navbarWrapper = document.getElementById('navbarWrapper');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');
  const navLinks = document.querySelectorAll('.nav-link[data-link]');

  const dropdown = document.getElementById('productsDropdown');
  const dropdownToggle = document.getElementById('productsToggle');

  const sections = document.querySelectorAll('main section[id]');

  const SCROLL_THRESHOLD = 12;
  const MOBILE_BREAKPOINT = 880;

  /* ---------- Mobile menu open/close ---------- */
  function openMenu() {
    navMenu.classList.add('active');
    navOverlay.classList.add('active');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    closeDropdown();
  }

  menuToggle.addEventListener('click', () => {
    navMenu.classList.contains('active') ? closeMenu() : openMenu();
  });

  navOverlay.addEventListener('click', closeMenu);

  /* ---------- Products dropdown open/close ---------- */
  function openDropdown() {
    dropdown.classList.add('open');
    dropdownToggle.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    dropdown.classList.remove('open');
    dropdownToggle.setAttribute('aria-expanded', 'false');
  }

  dropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
  });

  document.addEventListener('click', (e) => {
    if (dropdown.classList.contains('open') && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdown();
      if (navMenu.classList.contains('active')) {
        closeMenu();
        menuToggle.focus();
      }
    }
  });

  /* ---------- Active link helper ---------- */
  function setActiveLink(activeLink) {
    navLinks.forEach((link) => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });
    activeLink.classList.add('active');
    activeLink.setAttribute('aria-current', 'page');
  }

  /* ---------- Click: smooth scroll, active state, close mobile menu ---------- */
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveLink(link);
        }
      }

      if (navMenu.classList.contains('active')) {
        closeMenu();
      }
    });
  });

  /* ---------- Scrollspy: highlight nav link for section in view ---------- */
  if (sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const matchingLink = document.querySelector(
              `.nav-link[href="#${entry.target.id}"]`
            );
            if (matchingLink) setActiveLink(matchingLink);
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- Sticky navbar shadow enhancement on scroll ---------- */
  let ticking = false;

  function onScroll() {
    navbarWrapper.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  });

  onScroll();

  /* ---------- Reset mobile menu state when resizing back to desktop ---------- */
  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_BREAKPOINT && navMenu.classList.contains('active')) {
      closeMenu();
    }
  });
});

/* =========================================================
   FLOATING WHATSAPP BUTTON
   Injected on every page that loads this script, so the enquiry route is
   always one tap away.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.wa-float')) return;

  const NUMBER = '919600879192';
  const TEXT = encodeURIComponent(
    'Hello, I would like to enquire about your water treatment products.'
  );

  const link = document.createElement('a');
  link.className = 'wa-float';
  link.href = `https://wa.me/${NUMBER}?text=${TEXT}`;
  link.target = '_blank';
  link.rel = 'noopener';
  link.setAttribute('aria-label', 'Chat with us on WhatsApp');
  link.innerHTML = `
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15s-.77.96-.94 1.16c-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.470 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z"/>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.02h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.23 8.24z"/>
    </svg>
    <span class="wa-float-label">Chat with us</span>
  `;

  document.body.appendChild(link);
});

/* =========================================================
   BACK-TO-TOP BUTTON
   Sits above the WhatsApp float and fades in once the visitor is a screen
   or so down the page — these pages are long, and the nav is at the top.
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.to-top')) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
         stroke="currentColor" stroke-width="2.4" stroke-linecap="round"
         stroke-linejoin="round" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  `;

  btn.addEventListener('click', () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  document.body.appendChild(btn);

  let ticking = false;
  const update = () => {
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  });

  update();
});
