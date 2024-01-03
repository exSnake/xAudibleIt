// popup.js

console.log("xAudibleIt: Popup script loaded");

document.addEventListener("DOMContentLoaded", function () {
  console.log("xAudibleIt: DOM fully loaded and parsed");
  let isAutoClickEnabled = false;

  //#region Storage Initialization
  chrome.storage.local.get(["ClickCount"], function (items) {
    console.log("xAudibleIt: Retrieved ClickCount from storage", items);
    if (isNaN(items.ClickCount)) {
      items.ClickCount = 0;
    }
    incrementClickCount(items.ClickCount);
  });

  chrome.storage.local.get(["isAutoClickEnabled"], function (items) {
    console.log("xAudibleIt: Retrieved isAutoClickEnabled from storage");
    setAutoClickEnabled(items.isAutoClickEnabled);
  });
  //#endregion Initializations

  //#region Buttons Initialization

  // button Next Page
  document.getElementById("next-page").addEventListener("click", () => {
    console.log("xAudibleIt: Next Page button clicked in popup");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "clickNextPage" },
        (response) => {
          console.log("xAudibleIt: Response from content script for next page:", response);
        }
      );
    });
  });

  // button Auto-Click
  document.getElementById("toggle-autoclick").addEventListener("click", () => {
    console.log("xAudibleIt: Toggle Auto-Click button clicked");
    isAutoClickEnabled = !isAutoClickEnabled; // Toggle the flag
    setAutoClickEnabled(isAutoClickEnabled);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "toggleAutoClick",
        isEnabled: isAutoClickEnabled,
      });
    });
  });

  // button Clear
  document.getElementById("clear-content").addEventListener("click", () => {
    console.log("xAudibleIt: Clear button clicked");
    chrome.storage.local.clear();
    incrementClickCount(0);
  });

  //#endregion Buttons Initialization

  //#region Listeners Initialization

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("xAudibleIt: Message received in popup:", message.action);
    if (message.action === "incrementCount") {
      chrome.storage.local.get(["ClickCount"], function (result) {
        console.log("xAudibleIt: Retrieved ClickCount from storage", result.ClickCount);
        if(!result.ClickCount) {
          result.ClickCount = 0;
        }
        incrementClickCount(result.ClickCount + 1);
      });
    } else if (message.action === "disableAutoClick") {
      setAutoClickEnabled(false);
    }
  });

  //#endregion Listeners Initialization

  //#region Actions

  function setAutoClickEnabled(isEnabled) {
    isAutoClickEnabled = isEnabled;
    document.getElementById("toggle-autoclick").textContent = isAutoClickEnabled
      ? "Disable Auto-Click"
      : "Enable Auto-Click";
    chrome.storage.local.set({ isAutoClickEnabled: isAutoClickEnabled });
  }

  // Function to update the click count display
  function incrementClickCount(newCount) {
    console.log("xAudibleIt: Updating click count:", newCount);
    let count = 0;
    if (newCount) {
      chrome.storage.local.set({ ClickCount: newCount });
      count = newCount;
    } else if (count && !isNaN(count)) {
      chrome.storage.local.set({ ClickCount: count + 1 });
      count++;
    } else {
      chrome.storage.local.set({ ClickCount: 0 });
    }
    document.getElementById("click-count").textContent = count;
  }

  //#endregion Actions
});
