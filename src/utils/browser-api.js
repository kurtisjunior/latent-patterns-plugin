/**
 * Browser API Compatibility Shim
 * 
 * Provides a unified API for Chrome and Firefox browser extensions.
 * Auto-detects the browser and normalizes API differences.
 * 
 * @module browser-api
 */

// ============================================================================
// BROWSER DETECTION
// ============================================================================

/**
 * Detect browser and get the appropriate API object
 * Firefox: window.browser
 * Chrome: window.chrome
 * @type {Object}
 */
const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

/**
 * Detect which browser we're running in
 * @type {string}
 */
const BROWSER_TYPE = (typeof browser !== 'undefined') ? 'firefox' : 'chrome';

// ============================================================================
// UNIFIED API OBJECT
// ============================================================================

/**
 * Unified API object that works consistently across Chrome and Firefox
 * Provides direct access to browser APIs while handling differences
 */
export const API = {
  /**
   * Storage API - unified across browsers
   * Firefox: browser.storage.local
   * Chrome: chrome.storage.sync
   */
  storage: browserAPI.storage,

  /**
   * Runtime API - unified across browsers
   * Used for extension messaging and metadata
   */
  runtime: browserAPI.runtime,

  /**
   * Tabs API - unified across browsers
   * Used for tab manipulation and queries
   */
  tabs: browserAPI.tabs,

  /**
   * Commands API - unified across browsers
   * Used for keyboard shortcuts
   */
  commands: browserAPI.commands,

  /**
   * Browser type identifier
   */
  browserType: BROWSER_TYPE,
};

// ============================================================================
// CSS INJECTION HELPERS
// ============================================================================

/**
 * Insert CSS into a specific tab
 * Handles the differences between Chrome's scripting API and Firefox's tabs API
 * 
 * Chrome: chrome.scripting.insertCSS()
 * Firefox: browser.tabs.insertCSS()
 * 
 * @async
 * @param {number} tabId - The ID of the tab to inject CSS into
 * @param {string} filePath - Path to the CSS file (e.g., '/styles/content.css')
 * @returns {Promise<void>}
 * @throws {Error} If injection fails
 * 
 * @example
 * await insertCSS(123, '/styles/injected.css');
 */
export async function insertCSS(tabId, filePath) {
  try {
    if (BROWSER_TYPE === 'firefox') {
      // Firefox API: browser.tabs.insertCSS()
      await browserAPI.tabs.insertCSS(tabId, {
        file: filePath,
      });
    } else {
      // Chrome API: chrome.scripting.insertCSS()
      await browserAPI.scripting.insertCSS({
        target: { tabId },
        files: [filePath],
      });
    }
  } catch (error) {
    console.error(`Failed to insert CSS into tab ${tabId}:`, error);
    throw error;
  }
}

/**
 * Remove CSS from a specific tab
 * Handles the differences between Chrome's scripting API and Firefox's tabs API
 * 
 * Chrome: chrome.scripting.removeCSS()
 * Firefox: browser.tabs.removeCSS()
 * 
 * @async
 * @param {number} tabId - The ID of the tab to remove CSS from
 * @param {string} filePath - Path to the CSS file (e.g., '/styles/content.css')
 * @returns {Promise<void>}
 * @throws {Error} If removal fails
 * 
 * @example
 * await removeCSS(123, '/styles/injected.css');
 */
export async function removeCSS(tabId, filePath) {
  try {
    if (BROWSER_TYPE === 'firefox') {
      // Firefox API: browser.tabs.removeCSS()
      await browserAPI.tabs.removeCSS(tabId, {
        file: filePath,
      });
    } else {
      // Chrome API: chrome.scripting.removeCSS()
      await browserAPI.scripting.removeCSS({
        target: { tabId },
        files: [filePath],
      });
    }
  } catch (error) {
    console.error(`Failed to remove CSS from tab ${tabId}:`, error);
    throw error;
  }
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

/**
 * Get the appropriate storage area for the current browser
 * Defaults to sync storage for better data consistency
 * 
 * Chrome: chrome.storage.sync (or chrome.storage.local)
 * Firefox: browser.storage.local (sync not available for extensions)
 * 
 * @param {string} [area='sync'] - Storage area: 'sync', 'local', or 'managed'
 * @returns {Object} The storage API object for the specified area
 * 
 * @example
 * const storage = getStorage('sync');
 * await storage.set({ key: 'value' });
 */
export function getStorage(area = 'sync') {
  // Firefox doesn't support sync storage for extensions, use local instead
  if (BROWSER_TYPE === 'firefox' && area === 'sync') {
    return browserAPI.storage.local;
  }

  return browserAPI.storage[area];
}

/**
 * Get the runtime API
 * Useful for messages, extension metadata, and callbacks
 * 
 * @returns {Object} The runtime API object
 * 
 * @example
 * const runtime = getRuntime();
 * runtime.sendMessage({ action: 'ping' });
 */
export function getRuntime() {
  return browserAPI.runtime;
}

// ============================================================================
// SCRIPTING HELPERS
// ============================================================================

/**
 * Execute a script in a specific tab
 * Handles the differences between Chrome and Firefox
 * 
 * Chrome: chrome.scripting.executeScript()
 * Firefox: browser.tabs.executeScript()
 * 
 * @async
 * @param {number} tabId - The ID of the tab to execute script in
 * @param {Object} scriptOptions - Script options
 * @param {string} [scriptOptions.filePath] - Path to the script file
 * @param {string} [scriptOptions.code] - Inline JavaScript code to execute
 * @returns {Promise<Array>} Array of results from script execution
 * @throws {Error} If execution fails
 * 
 * @example
 * // Execute from file
 * await executeScript(123, { filePath: '/scripts/content.js' });
 * 
 * // Execute inline code
 * await executeScript(123, { code: 'console.log("Hello");' });
 */
export async function executeScript(tabId, scriptOptions) {
  try {
    if (BROWSER_TYPE === 'firefox') {
      // Firefox API: browser.tabs.executeScript()
      const options = {};
      if (scriptOptions.filePath) {
        options.file = scriptOptions.filePath;
      } else if (scriptOptions.code) {
        options.code = scriptOptions.code;
      }
      return await browserAPI.tabs.executeScript(tabId, options);
    } else {
      // Chrome API: chrome.scripting.executeScript()
      const options = {
        target: { tabId },
      };
      if (scriptOptions.filePath) {
        options.files = [scriptOptions.filePath];
      } else if (scriptOptions.code) {
        options.func = () => {
          // Note: Chrome's API uses a function approach, so we need to evaluate the code
          eval(scriptOptions.code);
        };
      }
      return await browserAPI.scripting.executeScript(options);
    }
  } catch (error) {
    console.error(`Failed to execute script in tab ${tabId}:`, error);
    throw error;
  }
}

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

/**
 * Export all utilities as default
 * @type {Object}
 */
export default {
  API,
  BROWSER_TYPE,
  insertCSS,
  removeCSS,
  executeScript,
  getStorage,
  getRuntime,
};
