/* =========================================================
   scrollReveal — adds .is-visible to elements as they enter the
   viewport (IntersectionObserver), used to fade/slide cards in on
   scroll across the About, Contact, Services and Gallery pages.
   ========================================================= */

export function revealOnScroll(selectors) {
  const targets = selectors.flatMap((selector) => [...document.querySelectorAll(selector)]);
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
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

  targets.forEach((el) => observer.observe(el));

  /* Safety net: full-page screenshot tools, print views, and some mobile
     "save page" captures never scroll the page, so IntersectionObserver
     never fires for off-screen content — which would otherwise stay
     invisible forever. Force everything visible after a short delay
     regardless, so nothing is ever permanently hidden. */
  setTimeout(() => {
    targets.forEach((el) => el.classList.add('is-visible'));
    observer.disconnect();
  }, 1500);
}
