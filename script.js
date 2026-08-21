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
