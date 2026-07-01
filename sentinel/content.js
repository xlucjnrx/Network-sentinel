(() => {
  // ── Selectors ────────────────────────────────────────────────────────────────
  const AD_SELECTORS = [
    '.ad', '.ads', '.ad-banner', '.ad-container', '.ad-wrapper',
    '.ad-slot', '.ad-unit', '.ad-block', '.ad-box', '.ad-frame',
    '#ad', '#ads', '#ad-banner', '#ad-container', '#advertisement',

    'ins.adsbygoogle',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googleads"]',

    'iframe[src*="ads"]',
    'iframe[src*="advert"]',
    'iframe[src*="banner"]',
    'iframe[src*="popup"]',

    '[id*="google_ads"]',
    '[id*="div-gpt-ad"]',
    '[class*="adsbygoogle"]',
    '[class*="sponsored"]',
    '[data-ad-slot]',
    '[data-ad-client]',

    '.popup', '.pop-up', '.overlay:not(video)',
    '[class*="modal"][class*="ad"]',
  ];

    if (el.dataset.sentinelBlocked) return;
    el.dataset.sentinelBlocked = 'true';
    el.style.setProperty('display', 'none', 'important');
  }

  function blockAds(root = document) {
    AD_SELECTORS.forEach(selector => {
      try {
        root.querySelectorAll(selector).forEach(hideElement);
      } catch {
      }
    });
  }
  const observer = new MutationObserver(mutations => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        hideElement(node); 
        blockAds(node);   
      });
    });
  });
  function init() {
    blockAds();
    observer.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
