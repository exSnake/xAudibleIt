// script.js

console.log("xAudibleIt: Content script loaded");

let clickCount = 0;

//#region Actions

// Function to click the button in the div
function clickButtonInDiv() {
  console.log("xAudibleIt: Attempting to click button in div");
  const divName = "discovery-add-to-library-form";
  const targetDiv = document.querySelector(`div[name='${divName}']`);

  if (targetDiv) {
    const button = targetDiv.querySelector("button");
    if (button) {
      button.click();
      sendClickCount();
      console.log("xAudibleIt: Button clicked in div");
      return true;
    } else {
      console.log("xAudibleIt: No button found within the div, looking for Next Page button");
      clickNextPageButton();
      return false;
    }
  } else {
    console.log("xAudibleIt: Div not found:", divName);
    clickNextPageButton();
    return false;
  }
}

// Function to click the Next Page button
function clickNextPageButton() {
  chrome.storage.local.get(["lastPage"], function (result) {
    console.log("xAudibleIt: Retrieved lastPage from storage", result.lastPage);
    const lastPage = result.lastPage;
    const page = document.getElementsByName("page")[0]?.getAttribute("value");

    console.log("xAudibleIt: Current page:", page, "Last page:", lastPage);
    if (page === lastPage) {
      console.log("xAudibleIt: Last page reached");
      disableAutoClick();
      return;
    }

    chrome.storage.local.set({ lastPage: page });
    const nextPageButton = document.querySelector(
      ".nextButton a.bc-button-text"
    );
    if (nextPageButton) {
      nextPageButton.click();
      console.log("xAudibleIt: Next Page button clicked");
    } else {
      console.log("xAudibleIt: Next Page button not found");
      disableAutoClick();
    }
  });
}

function disableAutoClick() {
  chrome.runtime.sendMessage({ action: "disableAutoClick" });
}

// Function to send message to background script to increment click count
function sendClickCount() {
  chrome.runtime.sendMessage({ action: "incrementCount" });
}

// Function to handle page load
function onPageLoad() {
  chrome.storage.local.get(["isAutoClickEnabled"], function (result) {
    if (result.isAutoClickEnabled) {
      console.log("xAudibleIt: Auto-click is enabled on page load");
      setTimeout(clickButtonInDiv, 1000);
    } else {
      console.log("xAudibleIt: Auto-click is disabled on page load");
    }
  });
}

//#endregion Actions

//#region Listeners

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("xAudibleIt: Message received:", request.action);
  if (request.action === "clickNextPage") {
    clickNextPageButton();
    sendResponse({ clicked: true });
  } else if (request.action === "toggleAutoClick") {
    const isAutoClickEnabled = request.isEnabled;
    chrome.storage.local.set({ isAutoClickEnabled: request.isEnabled });
    if (isAutoClickEnabled) {
      clickButtonInDiv();
      console.log("xAudibleIt: Auto-click enabled");
    } else {
      console.log("xAudibleIt: Auto-click disabled");
    }
  }
});

// Add event listener for page load
window.addEventListener("load", onPageLoad);

//#endregion Listeners
