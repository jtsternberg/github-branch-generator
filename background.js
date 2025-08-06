chrome.action.onClicked.addListener((tab) => {
  // Inject both the Gemini API and content scripts
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['gemini-api.js', 'content.js']
  });
});