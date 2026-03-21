document.addEventListener('DOMContentLoaded', () => {
  const adSelectors = ['.ad-banner', '.ad', 'iframe[src*="ads"]', 'ins.adsbygoogle'];
  adSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.style.border = '2px solid red';
      el.style.position = 'relative';
      const warning = document.createElement('div');
      warning.innerText = '⚠️ Advertisement Detected (May Contain Malicious Content) ⚠️';
      warning.style.cssText = `
        color: red; font-weight: bold; 
        background: yellow; padding: 5px; 
        position: absolute; top: 0; left: 0; 
        z-index: 9999;
      `;
      el.parentElement.insertBefore(warning, el);
    });
  });
});

