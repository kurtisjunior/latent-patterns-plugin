/**
 * Background Script for Firefox (Manifest V2)
 * Firefox-only implementation for CSS injection, messaging, and storage
 */

// Cross-browser API handle (Firefox uses `browser`, Chrome uses `chrome`)
const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

const CSS_FILE_PATH = 'src/styles/universal-theme.css';

// Never style these hosts by default
const NEVER_STYLE_HOSTS = [
    'docs.google.com',
    'mail.google.com',
    'github.com',
    'twitter.com',
    'figma.com',
    'notion.so'
];

function isSystemURL(url) {
    if (!url) return true;
    return url.startsWith('about:') ||
        url.startsWith('moz-extension://') ||
        url.startsWith('chrome://') ||
        url.startsWith('chrome-extension://') ||
        url.startsWith('edge://');
}

function extractHostname(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname || urlObj.href;
    } catch (error) {
        return null;
    }
}

function setActionBadge(tabId, state) {
    // state: 'on' | 'off' | 'blocked'
    if (typeof tabId !== 'number') return;

    try {
        // Don't use a badge: it overlays and covers the icon artwork.
        browserAPI.browserAction.setBadgeText({ tabId, text: '' });

        // Also update the toolbar icon so ON/OFF is obvious
        const iconSuffix = state === 'on' ? 'on' : (state === 'blocked' ? 'blocked' : 'off');
        browserAPI.browserAction.setIcon({
            tabId,
            path: {
                16: `icons/icon-16-${iconSuffix}.png`,
                48: `icons/icon-48-${iconSuffix}.png`,
                128: `icons/icon-128-${iconSuffix}.png`,
                256: `icons/icon-256-${iconSuffix}.png`
            }
        });
    } catch (error) {
        // Ignore if badge APIs aren't available
    }
}

function updateActionForTab(tabId, url) {
    if (typeof tabId !== 'number' || !url || isSystemURL(url)) return;
    const hostname = extractHostname(url);
    if (!hostname) return;

    browserAPI.storage.local.get(['enabledGlobal', 'siteEnabled', 'neverStyleHosts'], (result) => {
        const enabledGlobal = result.enabledGlobal !== false;
        const siteEnabled = result.siteEnabled || {};
        const neverStyleHosts = result.neverStyleHosts || NEVER_STYLE_HOSTS;

        if (neverStyleHosts.includes(hostname)) {
            setActionBadge(tabId, 'blocked');
            return;
        }

        // Default is OFF unless explicitly enabled for this hostname
        const shouldStyle = enabledGlobal && (siteEnabled[hostname] === true);
        setActionBadge(tabId, shouldStyle ? 'on' : 'off');
    });
}

/**
 * Initialize storage with defaults on install
 */
browserAPI.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    browserAPI.storage.local.get(['enabledGlobal', 'siteEnabled', 'neverStyleHosts'], (result) => {
        if (result.enabledGlobal === undefined) {
            browserAPI.storage.local.set({
                enabledGlobal: true,
                siteEnabled: {},
                neverStyleHosts: NEVER_STYLE_HOSTS
            });
        }
    });
});

/**
 * Click the toolbar icon to toggle styling for current site
 */
browserAPI.browserAction.onClicked.addListener((tab) => {
    try {
        if (!tab || !tab.id || !tab.url || isSystemURL(tab.url)) return;

        const hostname = extractHostname(tab.url);
        if (!hostname) return;

        browserAPI.storage.local.get(['enabledGlobal', 'siteEnabled', 'neverStyleHosts'], (result) => {
            const enabledGlobal = result.enabledGlobal !== false;
            const siteEnabled = result.siteEnabled || {};
            const neverStyleHosts = result.neverStyleHosts || NEVER_STYLE_HOSTS;

            if (neverStyleHosts.includes(hostname) || !enabledGlobal) {
                // Can't enable on blocked hosts; if globally disabled, keep as OFF.
                updateActionForTab(tab.id, tab.url);
                return;
            }

            const currentState = siteEnabled[hostname] === true;
            const newState = !currentState;
            siteEnabled[hostname] = newState;

            browserAPI.storage.local.set({ siteEnabled: siteEnabled }, () => {
                applyOrRemoveStyling(tab.id, hostname);
            });
        });
    } catch (error) {
        // Ignore click failures
    }
});

/**
 * Handle messages from popup
 */
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('🔔 [BACKGROUND] Message received:', request.action);
    console.log('🔔 [BACKGROUND] Full request:', request);
    console.log('🔔 [BACKGROUND] Sender tab ID:', sender.tab?.id);
    
    if (request.action === 'getState') {
        console.log('🔔 [BACKGROUND] Handling getState');
        browserAPI.storage.local.get(['enabledGlobal', 'siteEnabled'], (result) => {
            sendResponse({
                enabled: result.enabledGlobal !== false,
                disabledSites: Object.keys(result.siteEnabled || {}).filter(h => !result.siteEnabled[h])
            });
        });
    } 
    else if (request.action === 'getSiteStatus') {
        console.log('🔔 [BACKGROUND] Handling getSiteStatus for:', request.hostname);
        getSiteStatus(request.hostname, sendResponse);
    } 
    else if (request.action === 'toggleSite') {
        console.log('🔔 [BACKGROUND] Handling toggleSite - hostname:', request.hostname, 'enabled:', request.enabled);
        // sender.tab is undefined for extension pages (e.g. popup/options)
        const tabId = (sender && sender.tab && typeof sender.tab.id === 'number')
            ? sender.tab.id
            : (typeof request.tabId === 'number' ? request.tabId : undefined);
        toggleSiteStatus(request.hostname, request.enabled, tabId, sendResponse);
    }
    else if (request.action === 'reapplyTab') {
        // Used by options page after global toggle changes
        if (typeof request.tabId === 'number' && request.url && !isSystemURL(request.url)) {
            const hostname = extractHostname(request.url);
            if (hostname) {
                applyOrRemoveStyling(request.tabId, hostname);
                updateActionForTab(request.tabId, request.url);
            }
        }
        sendResponse({ success: true });
    } else {
        console.log('🔔 [BACKGROUND] Unknown action:', request.action);
    }
    
    return true; // Keep channel open for async response
});

/**
 * Check if a site should be styled
 */
function getSiteStatus(hostname, sendResponse) {
    browserAPI.storage.local.get(['enabledGlobal', 'siteEnabled', 'neverStyleHosts'], (result) => {
        const enabledGlobal = result.enabledGlobal !== false;
        const siteEnabled = result.siteEnabled || {};
        const neverStyleHosts = result.neverStyleHosts || NEVER_STYLE_HOSTS;
        
        // Check if in never style list
        if (neverStyleHosts.includes(hostname)) {
            sendResponse({ enabled: false });
            return;
        }
        
        // Check if globally disabled
        if (!enabledGlobal) {
            sendResponse({ enabled: false });
            return;
        }
        
        // Check per-site setting (defaults to false)
        const siteEnabled_value = siteEnabled[hostname] === true;
        sendResponse({ enabled: siteEnabled_value });
    });
}

/**
 * Toggle styling for a site
 */
function toggleSiteStatus(hostname, enabled, tabId, sendResponse) {
    console.log('🔄 [TOGGLE] Starting toggle for:', hostname, 'enabled:', enabled, 'tabId:', tabId);
    
    browserAPI.storage.local.get(['siteEnabled'], (result) => {
        const siteEnabled = result.siteEnabled || {};
        console.log('🔄 [TOGGLE] Current siteEnabled:', siteEnabled);
        
        siteEnabled[hostname] = enabled;
        console.log('🔄 [TOGGLE] Updated siteEnabled:', siteEnabled);
        
        browserAPI.storage.local.set({ siteEnabled: siteEnabled }, () => {
            console.log('🔄 [TOGGLE] Storage updated');

            const applyToTab = (resolvedTabId) => {
                if (typeof resolvedTabId === 'number') {
                    applyOrRemoveStyling(resolvedTabId, hostname);
                }
                console.log('🔄 [TOGGLE] Sending response:', { success: true });
                sendResponse({ success: true });
            };

            if (typeof tabId === 'number') {
                applyToTab(tabId);
            } else {
                browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const activeTabId = (tabs && tabs[0] && typeof tabs[0].id === 'number') ? tabs[0].id : undefined;
                    applyToTab(activeTabId);
                });
            }
        });
    });
}

/**
 * Inject CSS into a tab
 */
function injectCSS(tabId, callback) {
    console.log('injectCSS called for tab:', tabId);
    try {
        const promise = browserAPI.tabs.insertCSS(tabId, {
            file: CSS_FILE_PATH
        });
        
        // Handle promise-based response
        if (promise && promise.then) {
            promise
                .then(() => {
                    console.log('CSS injected into tab:', tabId);
                    if (callback) callback();
                })
                .catch(error => {
                    console.error('Error injecting CSS:', error);
                    if (callback) callback();
                });
        } else {
            // Fallback for callback-based
            if (callback) callback();
        }
    } catch (error) {
        console.error('Error injecting CSS:', error);
        if (callback) callback();
    }
}

/**
 * Remove CSS from a tab
 */
function removeCSS(tabId, callback) {
    console.log('removeCSS called for tab:', tabId);
    try {
        const promise = browserAPI.tabs.removeCSS(tabId, {
            file: CSS_FILE_PATH
        });
        
        // Handle promise-based response
        if (promise && promise.then) {
            promise
                .then(() => {
                    console.log('CSS removed from tab:', tabId);
                    if (callback) callback();
                })
                .catch(error => {
                    console.error('Error removing CSS:', error);
                    if (callback) callback();
                });
        } else {
            // Fallback for callback-based
            if (callback) callback();
        }
    } catch (error) {
        console.error('Error removing CSS:', error);
        if (callback) callback();
    }
}

/**
 * Handle keyboard shortcuts
 */
browserAPI.commands.onCommand.addListener((command) => {
    console.log('Command:', command);
    
    if (command === 'toggle-global') {
        browserAPI.storage.local.get(['enabledGlobal'], (result) => {
            const currentState = result.enabledGlobal !== false;
            const newState = !currentState;
            browserAPI.storage.local.set({ enabledGlobal: newState }, () => {
                console.log('Global toggle:', newState);
                updateAllTabs();
            });
        });
    } 
    else if (command === 'toggle-site') {
        browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || tabs.length === 0) return;
            
            const tab = tabs[0];
            try {
                const url = new URL(tab.url);
                const hostname = url.hostname;
                
                browserAPI.storage.local.get(['siteEnabled'], (result) => {
                    const siteEnabled = result.siteEnabled || {};
                    const currentState = siteEnabled[hostname] === true;
                    const newState = !currentState;
                    
                    siteEnabled[hostname] = newState;
                    
                    browserAPI.storage.local.set({ siteEnabled: siteEnabled }, () => {
                        console.log(`Site ${hostname} toggled to:`, newState);
                        
                        if (newState) {
                            injectCSS(tab.id);
                        } else {
                            removeCSS(tab.id);
                        }
                    });
                });
            } catch (error) {
                console.error('Error parsing URL:', error);
            }
        });
    }
});

/**
 * Update styling on all tabs
 */
function updateAllTabs() {
    browserAPI.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            try {
                const url = new URL(tab.url);
                const hostname = url.hostname;
                applyOrRemoveStyling(tab.id, hostname);
            } catch (error) {
                // Skip tabs with invalid URLs
            }
        });
    });
}

/**
 * Apply or remove styling based on settings
 */
function applyOrRemoveStyling(tabId, hostname) {
    browserAPI.storage.local.get(['enabledGlobal', 'siteEnabled', 'neverStyleHosts'], (result) => {
        const enabledGlobal = result.enabledGlobal !== false;
        const siteEnabled = result.siteEnabled || {};
        const neverStyleHosts = result.neverStyleHosts || NEVER_STYLE_HOSTS;
        
        // Never style protected sites
        if (neverStyleHosts.includes(hostname)) {
            sendCSSMessage(tabId, 'removeCSS');
            setActionBadge(tabId, 'blocked');
            return;
        }
        
        // Check if should style
        // Default is OFF unless explicitly enabled for this hostname
        const shouldStyle = enabledGlobal && (siteEnabled[hostname] === true);
        
        const action = shouldStyle ? 'applyCSS' : 'removeCSS';
        sendCSSMessage(tabId, action);

        setActionBadge(tabId, shouldStyle ? 'on' : 'off');
    });
}

/**
 * Send CSS action to content script
 */
function sendCSSMessage(tabId, action) {
    browserAPI.tabs.sendMessage(tabId, { action: action }, (response) => {
        if (browserAPI.runtime.lastError) {
            // Content script might not be injected yet
            console.log('Note: content script not available on this tab');
        }
    });
}

/**
 * Handle tab updates (page finish loading)
 */
browserAPI.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        try {
            const url = new URL(tab.url);
            const hostname = url.hostname;
            applyOrRemoveStyling(tabId, hostname);
            updateActionForTab(tabId, tab.url);
        } catch (error) {
            // Skip invalid URLs
        }
    }
});

/**
 * Handle tab activation
 */
browserAPI.tabs.onActivated.addListener((activeInfo) => {
    browserAPI.tabs.get(activeInfo.tabId, (tab) => {
        if (tab && tab.url) {
            try {
                const url = new URL(tab.url);
                const hostname = url.hostname;
                applyOrRemoveStyling(tab.id, hostname);
                updateActionForTab(tab.id, tab.url);
            } catch (error) {
                // Skip invalid URLs
            }
        }
    });
});
