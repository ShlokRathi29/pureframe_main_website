/**
 * animations.js — Pureframe Labs
 * Scroll-reveal for elements with the `.reveal` class.
 * Uses a single IntersectionObserver; re-observes new elements on page switch.
 */

let observer = null;

function runReveal() {
  if (!observer) {
    observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
  }

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  window._initReveal = runReveal;
  runReveal();
});
