const menu = document.querySelector('#menu');
const nav = document.querySelector('#nav');

menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
}));

const expandableStates = [];
const hiddenClass = 'expandable-item--hidden';

const getColumnCount = grid => {
  const columns = window.getComputedStyle(grid).gridTemplateColumns;
  return columns && columns !== 'none' ? columns.split(' ').filter(Boolean).length : 1;
};

const getInitialLimit = grid => {
  const rows = window.matchMedia('(max-width: 600px)').matches
    ? 3
    : window.matchMedia('(max-width: 1050px)').matches
      ? 2
      : 1;
  return Math.max(1, getColumnCount(grid) * rows);
};

const updateExpandableSection = state => {
  const initialLimit = getInitialLimit(state.grid);
  const items = [...state.grid.querySelectorAll('[data-expandable-item]')];
  const totalItems = items.length;
  const hasHiddenItems = totalItems > initialLimit;

  if (!hasHiddenItems) state.expanded = false;

  items.forEach((item, index) => {
    const isHidden = hasHiddenItems && !state.expanded && index >= initialLimit;
    item.hidden = isHidden;
    item.classList.toggle(hiddenClass, isHidden);
    item.setAttribute('aria-hidden', String(isHidden));
  });

  state.button.hidden = !hasHiddenItems;
  state.button.textContent = state.expanded ? 'Show Less' : 'Show More';
  state.button.setAttribute('aria-expanded', String(state.expanded));
};

document.querySelectorAll('[data-expandable-section]').forEach(section => {
  const grid = section.querySelector('[data-expandable-grid]');
  const button = section.querySelector('[data-expand-toggle]');
  const items = [...section.querySelectorAll('[data-expandable-item]')];
  if (!grid || !button || !items.length) return;

  const state = { grid, button, expanded: false };
  expandableStates.push(state);
  updateExpandableSection(state);
  window.requestAnimationFrame(() => updateExpandableSection(state));
  window.setTimeout(() => updateExpandableSection(state), 250);

  const observer = new MutationObserver(() => updateExpandableSection(state));
  observer.observe(grid, { childList: true });
  state.observer = observer;

  button.addEventListener('click', () => {
    state.expanded = !state.expanded;
    updateExpandableSection(state);
  });
});

let expandableResizeTimer;
window.addEventListener('resize', () => {
  window.clearTimeout(expandableResizeTimer);
  expandableResizeTimer = window.setTimeout(() => expandableStates.forEach(updateExpandableSection), 180);
});
