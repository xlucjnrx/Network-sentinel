  const logs  = [];
  let paused  = false;
  let searchQ = '';
  const counts = { blocked: 0, beacon: 0, pixel: 0, fetch: 0, canvas: 0 };
  const container     = document.getElementById('logContainer');
  const emptyState    = document.getElementById('emptyState');
  const searchInput   = document.getElementById('searchInput');
  const pauseBtn      = document.getElementById('pauseBtn');
  const clearBtn      = document.getElementById('clearBtn');
  const exportBtn     = document.getElementById('exportBtn');
  const liveDot       = document.getElementById('liveDot');
  const countBlocked  = document.getElementById('countBlocked');
  const countBeacon   = document.getElementById('countBeacon');
  const countPixel    = document.getElementById('countPixel');
  const countTotal    = document.getElementById('countTotal');
  function timestamp() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}.${String(d.getMilliseconds()).padStart(3,'0')}`;
  }

  function extractHost(url) {
    try { return new URL(url).hostname; }
    catch { return url; }
  }

  function badgeHTML(type) {
    const map = {
      blocked: '<span class="badge badge-blocked">BLOCKED</span>',
      beacon:  '<span class="badge badge-beacon">BEACON</span>',
      pixel:   '<span class="badge badge-pixel">PIXEL</span>',
      fetch:   '<span class="badge badge-fetch">FETCH</span>',
      canvas:  '<span class="badge badge-canvas">CANVAS</span>',
    };
    return map[type] || `<span class="badge">${type.toUpperCase()}</span>`;
  }

  function rowVisible(entry) {
    if (!searchQ) return true;
    const q = searchQ.toLowerCase();
    return entry.url.toLowerCase().includes(q) || entry.host.toLowerCase().includes(q);
  }
  function renderRow(entry) {
    const row = document.createElement('div');
    row.className = 'log-row' + (rowVisible(entry) ? '' : ' hidden');
    row.dataset.type = entry.type;
    row.dataset.url  = entry.url;
    row.dataset.host = entry.host;

    const shortTab = entry.tabTitle
      ? entry.tabTitle.substring(0, 20) + (entry.tabTitle.length > 20 ? '…' : '')
      : '—';

    row.innerHTML = `
      <div class="log-type">${badgeHTML(entry.type)}</div>
      <div class="log-time">${entry.time}</div>
      <div class="log-url" title="${entry.url}">
        <span class="log-host">${entry.host}</span>
        ${entry.url.replace(entry.host, '')}
      </div>
      <div class="log-tab" title="${entry.tabTitle || ''}">${shortTab}</div>
    `;
    container.insertBefore(row, emptyState);
    emptyState.style.display = 'none';

    if (!paused) {
      row.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
  }

  function refilter() {
    const rows = container.querySelectorAll('.log-row');
    let anyVisible = false;
    rows.forEach(row => {
      const entry = { type: row.dataset.type, url: row.dataset.url, host: row.dataset.host };
      const visible = rowVisible(entry);
      row.classList.toggle('hidden', !visible);
      if (visible) anyVisible = true;
    });
    emptyState.style.display = anyVisible ? 'none' : 'flex';
  }

  function addEntry(entry) {
    if (paused) return;

    entry.time = timestamp();
    entry.host = extractHost(entry.url);
    logs.push(entry);    
    if (counts[entry.type] !== undefined) counts[entry.type]++;
    updateCounters();

    renderRow(entry);
  }

  function updateCounters() {
    countBlocked.textContent = counts.blocked.toLocaleString();
    countBeacon.textContent  = (counts.beacon + counts.fetch).toLocaleString();
    countPixel.textContent   = counts.pixel.toLocaleString();
    countTotal.textContent   = logs.length.toLocaleString();
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'LOG_EVENT') {
      addEntry(message.entry);
    }
  });
  chrome.runtime.sendMessage({ type: 'GET_LOG' }, (response) => {
    if (response && response.log) {
      response.log.forEach(entry => addEntry(entry));
    }
  });

  searchInput.addEventListener('input', () => {
    searchQ = searchInput.value.trim();
    refilter();
  });
  pauseBtn.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? '▶ RESUME' : '⏸ PAUSE';
    pauseBtn.classList.toggle('paused', paused);
    liveDot.classList.toggle('paused', paused);
  });
  clearBtn.addEventListener('click', () => {
    logs.length = 0;
    Object.keys(counts).forEach(k => counts[k] = 0);
    updateCounters();
    container.querySelectorAll('.log-row').forEach(r => r.remove());
    emptyState.style.display = 'flex';
    chrome.runtime.sendMessage({ type: 'CLEAR_LOG' });
  });
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sentinel-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

})();

})();
