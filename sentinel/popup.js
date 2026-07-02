(() => {
  const toggleEl      = document.getElementById('toggleBlock');
  const statusTextEl  = document.getElementById('statusText');
  const blockedCountEl= document.getElementById('blockedCount');
  const resetBtn      = document.getElementById('resetBtn');

  // ── Render state into the UI ─────────────────────────────────────────────────
  function renderState({ isEnabled, blockedCount }) {
    toggleEl.checked = isEnabled;

    statusTextEl.textContent  = isEnabled ? 'ACTIVE' : 'PAUSED';
    statusTextEl.className    = isEnabled ? 'status-on' : 'status-off';

    blockedCountEl.textContent = blockedCount.toLocaleString();
    blockedCountEl.className   = isEnabled ? 'stats-count' : 'stats-count inactive';
  }

  // ── Load current state from background.js on popup open ─────────────────────
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
    if (response) renderState(response);
  });

  // ── Toggle switch ─────────────────────────────────────────────────────────────
  toggleEl.addEventListener('change', () => {
    chrome.runtime.sendMessage({ type: 'TOGGLE' }, (response) => {
      if (response) renderState({ ...response, blockedCount: getCurrentCount() });
    });
  });

  // ── Reset counter ─────────────────────────────────────────────────────────────
  resetBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'RESET_COUNT' }, (response) => {
      if (response) blockedCountEl.textContent = '0';
    });
  });

  // ── Helper: read current displayed count ─────────────────────────────────────
  function getCurrentCount() {
    return parseInt(blockedCountEl.textContent.replace(/,/g, ''), 10) || 0;
  }

})();
