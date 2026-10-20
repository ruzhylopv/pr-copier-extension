// Forwards the keyboard shortcut and toolbar icon click to the content script in the active tab.
function requestCopy(tab) {
  if (!tab?.id) return;
  // Fails harmlessly on tabs without the content script (non-GitHub pages).
  chrome.tabs.sendMessage(tab.id, { type: 'copy-pr-link' }).catch(() => {});
}

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'copy-pr-link') requestCopy(tab);
});

chrome.action.onClicked.addListener(requestCopy);
