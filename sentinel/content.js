const domainKey = "block_" + window.location.hostname;

chrome.storage.local.get([domainKey], (data) => {
  if (data[domainKey] !== false) {
    blockAds();
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[domainKey]) {
    if (changes[domainKey].newValue === false) {
      location.reload();
    } else {
      blockAds();
    }
  }
});

function blockAds() {
  window.open = () => null;
  window.onbeforeunload = null;
  history.pushState = history.replaceState = () => {};

  document.addEventListener("click", (e) => {
    const el = e.target.closest("a[target='_blank']");
    if (el && !el.href.includes(window.location.hostname)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  const selectors = [
    "iframe",
    "[id*='popup']",
    "[class*='popup']",
    "[id*='overlay']",
    "[class*='overlay']",
    "[id*='modal']",
    "[class*='modal']",
    "[id*='ads']",
    "[class*='ads']"
  ];
  const removeAds = () => {
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });
  };
  removeAds();

  const observer = new MutationObserver(() => removeAds());
  observer.observe(document.body, { childList: true, subtree: true });
}
