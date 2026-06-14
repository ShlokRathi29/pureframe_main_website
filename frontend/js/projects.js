/**
 * projects.js — Pureframe Labs
 * Live search/filter for the projects grid.
 * Cards are shown/hidden based on their data-search attribute
 * plus any visible text content.
 */

function filterProjects() {
  const input = document.getElementById('projectSearch');
  if (!input) return;

  const query = input.value.toLowerCase().trim();

  document.querySelectorAll('.proj-card').forEach(card => {
    const searchable = (card.dataset.search || '') + ' ' + card.textContent.toLowerCase();
    card.style.display = searchable.includes(query) ? '' : 'none';
  });
}

function initProjectSearch() {
  const input = document.getElementById('projectSearch');
  if (input) {
    input.addEventListener('input', filterProjects);
  }
}

document.addEventListener('DOMContentLoaded', initProjectSearch);
