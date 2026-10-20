(() => {
  const BUTTON_ID = 'pr-link-copier-btn';
  const BUTTON_LABEL = 'Copy link';
  const PR_PATH = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)/;

  // Canonical PR URL, without /files, /commits, query or hash.
  function getPrUrl() {
    const m = location.pathname.match(PR_PATH);
    return m ? `${location.origin}/${m[1]}/${m[2]}/pull/${m[3]}` : null;
  }

  function findTitleElement() {
    return (
      document.querySelector('[data-component="PH_Title"] .markdown-title') ||
      document.querySelector('.gh-header-title .js-issue-title') ||
      document.querySelector('h1 .markdown-title')
    );
  }

  function getTitle() {
    const el = findTitleElement();
    if (el) return el.textContent.replace(/\s+/g, ' ').trim();
    // Fallback: "<title> by <user> · Pull Request #123 · owner/repo"
    const m = document.title.match(/^(.*?) by \S+ · Pull Request #\d+/);
    return m ? m[1].trim() : null;
  }

  // Slack breaks on brackets inside link text: "[ALL-5643] Add" -> "ALL-5643 Add".
  function cleanLinkText(text) {
    return text.replace(/[[\]]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function buildMarkdownLink() {
    const url = getPrUrl();
    const title = getTitle();
    if (!url || !title) return null;
    return `[${cleanLinkText(title)}](${url})`;
  }

  async function writeClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      textarea.remove();
      return ok;
    }
  }

  function flash(button, label) {
    if (!button) return;
    button.textContent = label;
    clearTimeout(button._resetTimer);
    button._resetTimer = setTimeout(() => {
      button.textContent = BUTTON_LABEL;
    }, 1500);
  }

  async function copyPrLink() {
    const button = document.getElementById(BUTTON_ID);
    const link = buildMarkdownLink();
    if (!link) {
      flash(button, 'No PR title found');
      return;
    }
    const ok = await writeClipboard(link);
    flash(button, ok ? 'Copied ✓' : 'Copy failed');
  }

  function injectButton() {
    if (!getPrUrl() || document.getElementById(BUTTON_ID)) return;
    const titleEl = findTitleElement();
    if (!titleEl) return;

    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.className = 'pr-link-copier-btn';
    button.textContent = BUTTON_LABEL;
    button.title = 'Copy as Markdown link: [Title](url)';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      copyPrLink();
    });

    (titleEl.closest('h1') || titleEl.parentElement).appendChild(button);
  }

  // GitHub navigates without full page loads and re-renders the header,
  // so re-check whenever the DOM changes (batched to one check per frame).
  let scheduled = false;
  function scheduleInject() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      injectButton();
    });
  }

  new MutationObserver(scheduleInject).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('turbo:load', scheduleInject);
  scheduleInject();

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'copy-pr-link') copyPrLink();
  });
})();
