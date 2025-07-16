document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleBlock");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const key = "block_" + url.hostname;

    chrome.storage.local.get([key], (result) => {
      toggle.checked = result[key] !== false;
    });

    toggle.addEventListener("change", () => {
      const value = {};
      value[key] = toggle.checked;
      chrome.storage.local.set(value);
    });
  });
});
