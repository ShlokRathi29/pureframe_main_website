/**
 * main.js — Pureframe Labs
 * Global logic for multi-page site
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isVisible = mobileMenu.style.display === 'flex';
      mobileMenu.style.display = isVisible ? 'none' : 'flex';
    });
  }

  // Handle active link state based on current URL
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    // Basic active state setting based on href matching current path
    if (link.getAttribute('href') && currentPath.endsWith(link.getAttribute('href'))) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });

  // Init Animations (Reveal on scroll)
  if (typeof window._initReveal === 'function') {
    window._initReveal();
  }
});
