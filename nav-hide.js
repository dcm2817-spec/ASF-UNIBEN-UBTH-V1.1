// Hides the navbar when scrolling down (into a section), shows it again
// when scrolling up — keeps more screen space free on mobile.
(function () {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScrollY = window.scrollY;
  const threshold = 10; // ignore tiny scroll jitters

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const diff = currentScrollY - lastScrollY;

    if (Math.abs(diff) < threshold) return;

    if (diff > 0 && currentScrollY > navbar.offsetHeight) {
      // Scrolling down and past the navbar's own height
      navbar.classList.add('nav-hidden');
    } else {
      // Scrolling up
      navbar.classList.remove('nav-hidden');
    }
    lastScrollY = currentScrollY;
  }, { passive: true });
})();
