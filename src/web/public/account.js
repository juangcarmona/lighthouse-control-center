import './workspace-ui.js';
// Use the same source-owned Lighthouse mark as the other workspace pages.
document.body.classList.add('lh-root');
{
  const brand = document.querySelector('.topbar .brand');
  if (brand) {
    const mark = new DOMParser().parseFromString("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 128 128\" role=\"img\" aria-labelledby=\"title desc\">\n  <title id=\"title\">Lighthouse</title>\n  <desc id=\"desc\">A blue and white lighthouse with its light source casting a beam to the right.</desc>\n  <rect x=\"1\" y=\"1\" width=\"126\" height=\"126\" rx=\"18\" fill=\"#F8FAFF\" stroke=\"#DCE1EB\" stroke-width=\"2\"/>\n  <path d=\"M76 31 128 15v37L76 42Z\" fill=\"#4DA3FF\" opacity=\".2\"/>\n  <path d=\"M78 33 128 18M78 40l50 6\" fill=\"none\" stroke=\"#1F6FD1\" stroke-width=\"1.5\" opacity=\".68\"/>\n  <g transform=\"translate(-5 0)\">\n    <path d=\"M54 49h32l9 58H44l10-58Z\" fill=\"#1F6FD1\"/>\n    <path d=\"M58 53h13l8 50H51l7-50Z\" fill=\"#F8FAFF\"/>\n    <path d=\"M73 53h9l9 50H79l-6-50Z\" fill=\"#4DA3FF\"/>\n    <path d=\"M58 72h25l2 5H57l1-5Zm-3 18h31l1 5H54l1-5Z\" fill=\"#1F6FD1\"/>\n    <path d=\"M51 49h38l-5-8H56l-5 8Z\" fill=\"#8FC2FF\"/>\n    <rect x=\"59\" y=\"27\" width=\"22\" height=\"15\" rx=\"2\" fill=\"#4DA3FF\" stroke=\"#1F6FD1\" stroke-width=\"2\"/>\n    <path d=\"M56 28h28l-4-6H60l-4 6Z\" fill=\"#1F6FD1\"/>\n    <circle cx=\"70\" cy=\"34.5\" r=\"3.4\" fill=\"#FFFFFF\"/>\n    <path d=\"M61 22v-4h18v4M53 109h34l8 6H45l8-6Z\" fill=\"#1F6FD1\"/>\n    <path d=\"M64 18v-4m-9 10-4-4\" stroke=\"#1F6FD1\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n  </g>\n</svg>\n", 'image/svg+xml').documentElement;
    mark.setAttribute('class', 'brand-mark'); mark.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('span'); copy.className = 'brand-copy';
    const name = document.createElement('strong'); name.textContent = 'Lighthouse';
    const product = document.createElement('small'); product.textContent = 'Control Center';
    copy.append(name, document.createTextNode(' '), product); brand.setAttribute('aria-label', 'Lighthouse Control Center');
    brand.replaceChildren(mark, copy); brand.href = '/workspace/operations';
    const header = brand.closest('.topbar'), main = document.getElementById('account');
    const nav = header?.querySelector('nav');
    if (header && main && nav) {
      const rail = document.createElement('aside'); rail.className = 'site-sidebar'; rail.setAttribute('aria-label', 'Workspace');
      nav.classList.add('workspace-nav');
      let accountLink = [...nav.querySelectorAll('a')].find(link => link.getAttribute('href') === '/workspace');
      if (!accountLink) { accountLink = document.createElement('a'); accountLink.href = '/workspace'; accountLink.textContent = 'Account'; nav.append(accountLink); }
      for (const [href, label] of [['/workspace/operations', 'Overview'], ['/workspace/factory', 'Projects'], ['/workspace/attention', 'Inbox'], ['/workspace/issues', 'Missions'], ['/workspace/runtime', 'Runtime'], ['/workspace', 'Account']]) {
        const link = [...nav.querySelectorAll('a')].find(item => item.getAttribute('href') === href);
        if (link) { link.textContent = label; nav.append(link); }
      }
      for (const link of main.querySelectorAll('a[href="/workspace/factory"]')) link.textContent = 'Projects';
      for (const link of main.querySelectorAll('a[href="/workspace/operations"]')) link.textContent = 'Open fleet overview';
      accountLink.setAttribute('aria-current', 'page'); rail.append(brand, nav);
      const column = document.createElement('div'); column.className = 'page-column';
      header.before(rail, column); column.append(header, main);
      const location = document.createElement('div'); location.className = 'header-context';
      const kicker = document.createElement('span'); kicker.className = 'header-kicker'; kicker.textContent = 'WORKSPACE';
      location.append(kicker, document.createTextNode(' / Account')); header.replaceChildren(location);
      accountLink.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }
}
const status = document.getElementById('account-status');
const identity = document.getElementById('github-account');
const repositories = document.getElementById('repository-authority');
const disconnect = document.getElementById('github-disconnect');
let busy = false;
async function refresh() {
  if (busy || document.hidden) return;
  busy = true;
  try {
    const response = await fetch('/api/connections/github', { signal: AbortSignal.timeout(35000) });
    if ([401, 403].includes(response.status)) {
      document.getElementById('account-verification-details')?.remove();
      identity.textContent = 'No verified acting account is available.';
      if (disconnect) disconnect.hidden = true;
      repositories.replaceChildren();
      status.textContent = 'Your owner session has ended or access is denied. Sign in again to continue.';
      return;
    }
    if (!response.ok) throw Error();
    const account = await response.json();
    if (disconnect && ['linked', 'unlinked', 'unconfigured'].includes(account.state)) disconnect.hidden = account.state !== 'linked';
    if (account.state !== 'linked') {
      document.getElementById('account-verification-details')?.remove();
      identity.textContent = account.state === 'unconfigured' ? 'GitHub connection is not configured.'
        : account.state === 'unlinked' ? 'GitHub is not connected.' : 'GitHub verification is unavailable.';
      repositories.replaceChildren();
      status.textContent = account.state === 'unconfigured'
        ? 'GitHub setup is required before operations can load. Register the development App, then connect your account.'
        : 'Connect and verify your GitHub account to load repository operations.';
      return;
    }
    if (typeof account.login !== 'string' || !Number.isSafeInteger(account.userId) || !Array.isArray(account.repositories)) throw Error();
    identity.textContent = `GitHub connected as ${account.login}.`;
    const fragment = document.createDocumentFragment();
    for (const repository of account.repositories) {
      const item = document.createElement('li');
      const checked = Number.isFinite(Date.parse(repository.checkedAt)) ? new Date(repository.checkedAt).toISOString() : 'unavailable';
      item.textContent = `${repository.repository}: ${repository.availability === 'available'
        ? `issues read ${repository.issuesRead === true ? 'allowed' : 'denied'}; Actions read ${repository.actionsRead === true ? 'allowed' : 'denied'}; issue write permission ${repository.issuesWrite === true ? 'confirmed' : 'not confirmed'}`
        : 'authority ' + (repository.availability === 'denied' ? 'denied' : 'unavailable')}. Checked: ${checked}.`;
      fragment.append(item);
    }
    repositories.replaceChildren(fragment);
    const verified = Number.isFinite(Date.parse(account.verifiedAt)) ? new Date(account.verifiedAt).toISOString() : 'unavailable';
    status.textContent = 'GitHub connection verified. Repository permissions refresh automatically.';
    let diagnostics = document.getElementById('account-verification-details');
    if (!diagnostics) {
      diagnostics = document.createElement('details'); diagnostics.id = 'account-verification-details';
      const summary = document.createElement('summary'); summary.textContent = 'Identity verification details';
      diagnostics.append(summary, document.createElement('p')); status.after(diagnostics);
    }
    diagnostics.querySelector('p').textContent = `GitHub user ID ${account.userId} · Last verified ${verified}. Current permission observations do not grant command eligibility.`;
  } catch {
    repositories.replaceChildren();
    status.textContent = 'Current GitHub authority is unavailable. Previously displayed identity may be stale; source operations require a new successful check.';
  } finally { busy = false; }
}
refresh();
setInterval(refresh, 240000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
