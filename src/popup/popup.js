/**
 * Popup Script for Manifest V2
 * Handles popup UI interactions
 * NOTE: Manifest V2 does not support ES6 modules, so we use direct API calls
 */

// DOM Elements
const siteToggle = document.getElementById('siteToggle');
const siteName = document.getElementById('siteName');
const toggleStatus = document.getElementById('toggleStatus');
const extensionStatus = document.getElementById('extensionStatus');
const statusDot = document.getElementById('statusDot');
const settingsLink = document.getElementById('settingsLink');

// Get the browser API (Firefox uses 'browser', Chrome uses 'chrome')
const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

/**
 * Initialize popup on load
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Popup loaded');
    
    // Get current tab information
    initializePopup();
    
    // Attach event listeners
    siteToggle.addEventListener('change', handleSiteToggle);
    settingsLink.addEventListener('click', handleSettingsClick);
});

/**
 * Initialize popup with current site and extension state
 */
function initializePopup() {
    try {
        // Get current active tab
        browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || tabs.length === 0) {
                siteName.textContent = 'Unable to get site info';
                return;
            }
            
            const tab = tabs[0];
            
            if (!tab || !tab.url) {
                siteName.textContent = 'Unable to get site info';
                return;
            }
            
            // Extract hostname from URL
            try {
                const url = new URL(tab.url);
                const hostname = url.hostname || url.href;
                siteName.textContent = hostname;
                
                // Request current state from background script
                browserAPI.runtime.sendMessage(
                    { action: 'getState' },
                    (response) => {
                        if (browserAPI.runtime.lastError) {
                            console.error('Error getting state:', browserAPI.runtime.lastError);
                            return;
                        }
                        
                        if (response) {
                            updatePopupState(response, hostname);
                        }
                    }
                );
                
                // Check if site is enabled/disabled
                browserAPI.runtime.sendMessage(
                    { action: 'getSiteStatus', hostname: hostname },
                    (response) => {
                        if (browserAPI.runtime.lastError) {
                            console.error('Error getting site status:', browserAPI.runtime.lastError);
                            return;
                        }
                        
                        if (response) {
                            updateSiteToggle(response.enabled);
                        }
                    }
                );
                
            } catch (error) {
                console.error('Error parsing URL:', error);
                siteName.textContent = 'Invalid site';
            }
        });
        
    } catch (error) {
        console.error('Error initializing popup:', error);
        siteName.textContent = 'Error loading site';
    }
}

/**
 * Update popup UI based on extension state
 * @param {Object} state - Extension state from background script
 * @param {string} hostname - Current site hostname
 */
function updatePopupState(state, hostname) {
    const isExtensionEnabled = state.enabled !== false;
    
    // Update extension status display
    extensionStatus.textContent = isExtensionEnabled ? 'On' : 'Off';
    statusDot.style.background = isExtensionEnabled ? 'var(--on)' : 'var(--off)';
    statusDot.style.boxShadow = isExtensionEnabled
        ? '0 0 0 3px rgba(46, 125, 50, 0.18)'
        : '0 0 0 3px rgba(211, 47, 47, 0.18)';
    
    // Per-site state is loaded separately via getSiteStatus (default is OFF)
}

/**
 * Update site toggle checkbox state
 * @param {boolean} enabled - Whether the site is enabled
 */
function updateSiteToggle(enabled) {
    siteToggle.checked = enabled;
    toggleStatus.textContent = enabled ? 'On' : 'Off';
}

/**
 * Handle site toggle change
 */
function handleSiteToggle() {
    console.log('📍 [POPUP] Toggle clicked, current state:', siteToggle.checked);
    
    const newState = siteToggle.checked;
    console.log('📍 [POPUP] New state to send:', newState);
    
     // Get current tab hostname
     browserAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
            console.error('📍 [POPUP] No tabs found');
            return;
        }
        
         const tab = tabs[0];
         if (!tab || !tab.url) {
             console.error('📍 [POPUP] No tab URL');
             return;
         }
        
        try {
            const url = new URL(tab.url);
            const hostname = url.hostname || url.href;
             console.log('📍 [POPUP] Hostname:', hostname);
            
            // Update status text immediately
            toggleStatus.textContent = newState ? 'On' : 'Off';
            
            // Send toggle message to background script
             console.log('📍 [POPUP] Sending toggleSite message:', { hostname, enabled: newState, tabId: tab.id });
            
            browserAPI.runtime.sendMessage(
                 {
                     action: 'toggleSite',
                     hostname: hostname,
                     enabled: newState,
                     tabId: tab.id
                 },
                (response) => {
                    if (browserAPI.runtime.lastError) {
                        console.error('📍 [POPUP] Error toggling site:', browserAPI.runtime.lastError);
                        // Revert toggle on error
                        siteToggle.checked = !newState;
                        toggleStatus.textContent = !newState ? 'On' : 'Off';
                        return;
                    }
                    
                    console.log('📍 [POPUP] Site toggled successfully:', response);
                }
            );
        } catch (error) {
            console.error('📍 [POPUP] Error parsing URL:', error);
        }
    });
}

/**
 * Handle settings link click
 */
function handleSettingsClick(e) {
    e.preventDefault();
    
    // Open options page
    browserAPI.runtime.openOptionsPage();
    
    // Close popup after opening options
    window.close();
}

/**
 * Listen for messages from background script
 */
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateStatus') {
        // Update UI when extension status changes
        updatePopupState(request.state, request.hostname);
        sendResponse({ received: true });
    }
});
