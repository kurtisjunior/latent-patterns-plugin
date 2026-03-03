/**
 * Chrome Storage API utility for managing extension settings
 * Handles global settings, per-site preferences, and never-style hosts
 */

// Default hosts that should never be styled
const DEFAULT_NEVER_STYLE_HOSTS = [
  'docs.google.com',
  'mail.google.com',
  'github.com',
  'twitter.com',
  'figma.com',
  'notion.so'
];

// Default settings structure
const DEFAULT_SETTINGS = {
  enabledGlobal: true,
  siteEnabled: {},
  neverStyleHosts: DEFAULT_NEVER_STYLE_HOSTS
};

/**
 * Initialize storage with default values on first install
 * @returns {Promise<void>}
 */
export async function initializeStorage() {
  const result = await chrome.storage.sync.get(null);
  
  // Only initialize if storage is empty
  if (Object.keys(result).length === 0) {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);
  }
}

/**
 * Get a global setting by key
 * @param {string} key - The setting key (e.g., 'enabledGlobal')
 * @returns {Promise<any>} The setting value
 */
export async function getGlobalSetting(key) {
  const result = await chrome.storage.sync.get(key);
  
  if (key in result) {
    return result[key];
  }
  
  // Return default value if not found
  if (key in DEFAULT_SETTINGS) {
    return DEFAULT_SETTINGS[key];
  }
  
  return null;
}

/**
 * Set a global setting by key
 * @param {string} key - The setting key
 * @param {any} value - The value to set
 * @returns {Promise<void>}
 */
export async function setGlobalSetting(key, value) {
  await chrome.storage.sync.set({ [key]: value });
}

/**
 * Get whether a specific hostname is enabled
 * @param {string} hostname - The hostname to check
 * @returns {Promise<boolean>} Whether the site is enabled
 */
export async function getSiteEnabled(hostname) {
  const siteEnabled = await getGlobalSetting('siteEnabled');
  
  // Return the stored value for this hostname, default to true if not set
  return siteEnabled[hostname] !== undefined ? siteEnabled[hostname] : true;
}

/**
 * Set whether a specific hostname is enabled
 * @param {string} hostname - The hostname to toggle
 * @param {boolean} value - Whether to enable or disable the site
 * @returns {Promise<void>}
 */
export async function setSiteEnabled(hostname, value) {
  const siteEnabled = await getGlobalSetting('siteEnabled');
  siteEnabled[hostname] = value;
  await setGlobalSetting('siteEnabled', siteEnabled);
}

/**
 * Get the list of hosts that should never be styled
 * @returns {Promise<string[]>} Array of hostnames
 */
export async function getNeverStyleHosts() {
  return await getGlobalSetting('neverStyleHosts');
}

/**
 * Apply site preference logic with correct precedence
 * 1) If hostname is in neverStyleHosts, return false (never style)
 * 2) If enabledGlobal is false, return false
 * 3) Otherwise, return siteEnabled[hostname] value
 * 
 * @param {string} hostname - The hostname to check
 * @returns {Promise<boolean>} Whether to style this hostname
 */
export async function applySitePreference(hostname) {
  const neverStyleHosts = await getNeverStyleHosts();
  
  // Step 1: Check if hostname is in never-style list
  if (neverStyleHosts.includes(hostname)) {
    return false;
  }
  
  // Step 2: Check if extension is disabled globally
  const enabledGlobal = await getGlobalSetting('enabledGlobal');
  if (!enabledGlobal) {
    return false;
  }
  
  // Step 3: Return per-site preference
  return await getSiteEnabled(hostname);
}

/**
 * Add a hostname to the never-style list
 * @param {string} hostname - The hostname to add
 * @returns {Promise<void>}
 */
export async function addNeverStyleHost(hostname) {
  const neverStyleHosts = await getNeverStyleHosts();
  
  if (!neverStyleHosts.includes(hostname)) {
    neverStyleHosts.push(hostname);
    await setGlobalSetting('neverStyleHosts', neverStyleHosts);
  }
}

/**
 * Remove a hostname from the never-style list
 * @param {string} hostname - The hostname to remove
 * @returns {Promise<void>}
 */
export async function removeNeverStyleHost(hostname) {
  const neverStyleHosts = await getNeverStyleHosts();
  const index = neverStyleHosts.indexOf(hostname);
  
  if (index > -1) {
    neverStyleHosts.splice(index, 1);
    await setGlobalSetting('neverStyleHosts', neverStyleHosts);
  }
}

/**
 * Reset all settings to defaults
 * @returns {Promise<void>}
 */
export async function resetToDefaults() {
  await chrome.storage.sync.set(DEFAULT_SETTINGS);
}

/**
 * Get all settings (for debugging or export)
 * @returns {Promise<Object>} All current settings
 */
export async function getAllSettings() {
  return await chrome.storage.sync.get(null);
}
