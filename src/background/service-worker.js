/**
 * Service Worker for Chrome Extension
 * Handles message passing, CSS injection/removal, keyboard shortcuts, and storage
 */

import {
  initializeStorage,
  getGlobalSetting,
  setGlobalSetting,
  getSiteEnabled,
  setSiteEnabled,
  getNeverStyleHosts,
  applySitePreference,
} from '../utils/storage.js';

// CSS file path for injection
const CSS_FILE_PATH = '/src/styles/universal-theme.css';

/**
 * Initialize service worker on install/startup
 */
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Service worker installed');
  await initializeStorage();
});

/**
 * Handle messages from popup and content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getState') {
    handleGetState(sendResponse);
  } else if (request.action === 'getSiteStatus') {
    handleGetSiteStatus(request.hostname, sendResponse);
  } else if (request.action === 'toggleSite') {
    handleToggleSite(request.hostname, request.enabled, sendResponse);
  }
  
  // Return true to indicate we'll send response asynchronously
  return true;
});

/**
 * Handle "getState" message - return current extension state
 * @param {Function} sendResponse - Callback to send response
 */
async function handleGetState(sendResponse) {
  try {
    const enabledGlobal = await getGlobalSetting('enabledGlobal');
    const siteEnabled = await getGlobalSetting('siteEnabled');
    
    sendResponse({
      enabled: enabledGlobal,
      disabledSites: Object.keys(siteEnabled).filter(host => !siteEnabled[host])
    });
  } catch (error) {
    console.error('Error getting state:', error);
    sendResponse({ error: error.message });
  }
}

/**
 * Handle "getSiteStatus" message - check if a specific site is enabled
 * @param {string} hostname - The hostname to check
 * @param {Function} sendResponse - Callback to send response
 */
async function handleGetSiteStatus(hostname, sendResponse) {
  try {
    const shouldStyle = await applySitePreference(hostname);
    
    sendResponse({
      hostname: hostname,
      enabled: shouldStyle
    });
  } catch (error) {
    console.error('Error getting site status:', error);
    sendResponse({ error: error.message });
  }
}

/**
 * Handle "toggleSite" message - toggle styling for current site
 * @param {string} hostname - The hostname to toggle
 * @param {boolean} enabled - Whether to enable or disable styling
 * @param {Function} sendResponse - Callback to send response
 */
async function handleToggleSite(hostname, enabled, sendResponse) {
  try {
    // Update storage
    await setSiteEnabled(hostname, enabled);
    
    // Find the active tab and apply/remove CSS
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      const tab = tabs[0];
      if (enabled) {
        await injectCSS(tab.id);
      } else {
        await removeCSS(tab.id);
      }
    }
    
    sendResponse({
      success: true,
      hostname: hostname,
      enabled: enabled
    });
  } catch (error) {
    console.error('Error toggling site:', error);
    sendResponse({ error: error.message });
  }
}

/**
 * Listen for keyboard shortcuts
 */
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command triggered:', command);
  
  if (command === 'toggle-global') {
    await handleGlobalToggle();
  } else if (command === 'toggle-site') {
    await handleSiteToggle();
  }
});

/**
 * Handle global toggle (Ctrl+Shift+Y)
 * Toggle the enabledGlobal setting and update all tabs
 */
async function handleGlobalToggle() {
  try {
    const currentState = await getGlobalSetting('enabledGlobal');
    const newState = !currentState;
    
    await setGlobalSetting('enabledGlobal', newState);
    
    console.log('Global toggle:', newState);
    
    // Update all tabs - reapply or remove CSS based on new state
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.url && !isSystemURL(tab.url)) {
        await updateTabStyling(tab);
      }
    }
  } catch (error) {
    console.error('Error toggling global state:', error);
  }
}

/**
 * Handle site toggle (Ctrl+Shift+U)
 * Toggle styling for the current active site
 */
async function handleSiteToggle() {
  try {
    // Get the active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;
    
    const tab = tabs[0];
    if (!tab.url || isSystemURL(tab.url)) return;
    
    const hostname = extractHostname(tab.url);
    
    // Toggle the site preference
    const currentEnabled = await getSiteEnabled(hostname);
    await setSiteEnabled(hostname, !currentEnabled);
    
    console.log('Site toggle for', hostname, ':', !currentEnabled);
    
    // Update the tab styling
    await updateTabStyling(tab);
  } catch (error) {
    console.error('Error toggling site:', error);
  }
}

/**
 * Update CSS styling for a specific tab based on current preferences
 * @param {Object} tab - Chrome tab object
 */
async function updateTabStyling(tab) {
  try {
    if (!tab.id || isSystemURL(tab.url)) return;
    
    const hostname = extractHostname(tab.url);
    const shouldStyle = await applySitePreference(hostname);
    
    if (shouldStyle) {
      await injectCSS(tab.id);
    } else {
      await removeCSS(tab.id);
    }
  } catch (error) {
    console.error('Error updating tab styling:', error);
  }
}

/**
 * Inject CSS into a specific tab
 * @param {number} tabId - The tab ID to inject CSS into
 */
async function injectCSS(tabId) {
  try {
    await chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: [CSS_FILE_PATH]
    });
    console.log('CSS injected into tab:', tabId);
  } catch (error) {
    console.error('Error injecting CSS:', error);
  }
}

/**
 * Remove CSS from a specific tab
 * @param {number} tabId - The tab ID to remove CSS from
 */
async function removeCSS(tabId) {
  try {
    await chrome.scripting.removeCSS({
      target: { tabId: tabId },
      files: [CSS_FILE_PATH]
    });
    console.log('CSS removed from tab:', tabId);
  } catch (error) {
    console.error('Error removing CSS:', error);
  }
}

/**
 * Extract hostname from a URL
 * @param {string} url - The URL to extract hostname from
 * @returns {string} The hostname
 */
function extractHostname(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname || urlObj.href;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return url;
  }
}

/**
 * Check if a URL is a system URL (chrome://, about:, etc.)
 * @param {string} url - The URL to check
 * @returns {boolean} True if it's a system URL
 */
function isSystemURL(url) {
  if (!url) return true;
  return url.startsWith('chrome://') || 
         url.startsWith('about:') || 
         url.startsWith('edge://') ||
         url.startsWith('moz-extension://') ||
         url.startsWith('chrome-extension://');
}

/**
 * Listen for tab updates to reapply CSS if needed
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only process when the page has finished loading
  if (changeInfo.status === 'complete' && tab.url && !isSystemURL(tab.url)) {
    // Apply styling if appropriate
    const hostname = extractHostname(tab.url);
    const shouldStyle = await applySitePreference(hostname);
    
    if (shouldStyle) {
      await injectCSS(tabId);
    }
  }
});

/**
 * Listen for tab activation to ensure CSS is properly applied
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && !isSystemURL(tab.url)) {
      const hostname = extractHostname(tab.url);
      const shouldStyle = await applySitePreference(hostname);
      
      if (shouldStyle) {
        await injectCSS(tab.id);
      }
    }
  } catch (error) {
    console.error('Error on tab activation:', error);
  }
});

console.log('Service worker loaded');
