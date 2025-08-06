chrome.action.onClicked.addListener((tab) => {
  // Inject the bundled content script
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['dist/content-bundle.iife.js']
  });
});