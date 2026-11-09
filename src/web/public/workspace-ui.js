const namespace = 'http://www.w3.org/2000/svg';
const paths = {
  light: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
  dark: 'M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5Z',
  system: 'M3 4h18v13H3ZM8 21h8m-4-4v4',
  operations: 'M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z',
  factory: 'M3 7h7l2 2h9v11H3ZM3 7V4h7l2 3',
  attention: 'M12 3 2 21h20ZM12 9v5m0 3v1',
  issues: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v6m0 3v1',
  runtime: 'M3 3h18v7H3Zm0 11h18v7H3ZM6 6h1m-1 11h1',
  account: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-3a8 8 0 0 1 16 0v3',
};
function icon(name) {
  const svg = document.createElementNS(namespace, 'svg');
  for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', 'aria-hidden': 'true', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) svg.setAttribute(key, value);
  const path = document.createElementNS(namespace, 'path'); path.setAttribute('d', paths[name]); svg.append(path); return svg;
}
const preferenceKey = 'lcc:appearance';
let preference = 'system';
try { const saved = localStorage.getItem(preferenceKey); if (['light', 'dark', 'system'].includes(saved)) preference = saved; } catch { /* Browser storage can be disabled. */ }
function applyTheme(value) {
  preference = value; document.documentElement.dataset.lhTheme = value;
  document.querySelectorAll('[data-theme-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === value)));
}
applyTheme(preference);
function enhance() {
  let changedNavigation = false;
  document.querySelectorAll('.workspace-nav a').forEach(link => {
    if (link.querySelector('svg')) return;
    const route = link.getAttribute('href'), name = route === '/workspace' ? 'account' : route?.split('/')[2];
    if (paths[name]) { link.prepend(icon(name)); changedNavigation = true; }
  });
  if (changedNavigation) document.querySelector('.workspace-nav [aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  document.querySelectorAll('.topbar').forEach(header => {
    if (header.querySelector('.theme-switcher')) return;
    const group = document.createElement('div'); group.className = 'theme-switcher'; group.setAttribute('role', 'group'); group.setAttribute('aria-label', 'Appearance');
    for (const value of ['light', 'dark', 'system']) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'theme-option'; button.dataset.themeChoice = value;
      const label = value[0].toUpperCase() + value.slice(1); button.title = label; button.setAttribute('aria-label', label + ' appearance');
      button.setAttribute('aria-pressed', String(value === preference)); button.append(icon(value));
      button.addEventListener('click', () => { applyTheme(value); try { localStorage.setItem(preferenceKey, value); } catch { /* The current page still changes. */ } });
      group.append(button);
    }
    header.querySelector('.appearance')?.remove(); header.append(group);
  });
}
const favicon = document.createElement('link'); favicon.rel = 'icon'; favicon.type = 'image/svg+xml'; favicon.href = '/lighthouse.svg';
document.head.querySelectorAll('link[rel="icon"]').forEach(link => link.remove()); document.head.append(favicon);
enhance();
new MutationObserver(enhance).observe(document.body, { childList: true, subtree: true });
window.addEventListener('storage', event => { if (event.key === preferenceKey) applyTheme(['light', 'dark', 'system'].includes(event.newValue) ? event.newValue : 'system'); });
