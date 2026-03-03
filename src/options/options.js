/**
 * Options Page Script for Manifest V2
 * Handles extension settings management
 * NOTE: Manifest V2 does not support ES6 modules
 */

// Get the browser API (Firefox uses 'browser', Chrome uses 'chrome')
const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

// Storage area - Firefox uses local, Chrome uses sync, we'll use local for compatibility
const storage = browserAPI.storage.local;

// DOM Elements
const globalToggle = document.getElementById('globalToggle');
const resetButton = document.getElementById('resetButton');
const sitesList = document.getElementById('sitesList');
const confirmDialog = document.getElementById('confirmDialog');
const modalOverlay = document.getElementById('modalOverlay');
const confirmCancel = document.getElementById('confirmCancel');
const confirmReset = document.getElementById('confirmReset');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const versionNumber = document.getElementById('versionNumber');

/**
 * Initialize options page on load
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Options page loaded');

    // Load extension version from manifest
    loadManifestVersion();

    // Load current settings
    loadSettings();

    // Attach event listeners
    globalToggle.addEventListener('change', handleGlobalToggleChange);
    resetButton.addEventListener('click', handleResetClick);
    confirmCancel.addEventListener('click', closeConfirmDialog);
    modalOverlay.addEventListener('click', closeConfirmDialog);
    confirmReset.addEventListener('click', handleConfirmedReset);

    // Load sites list
    loadSitesList();

    // Listen for storage changes
    storage.onChanged.addListener(handleStorageChange);
});

/**
 * Load and display extension version
 */
function loadManifestVersion() {
    try {
        const manifest = browserAPI.runtime.getManifest();
        if (versionNumber && manifest.version) {
            versionNumber.textContent = manifest.version;
        }
    } catch (error) {
        console.error('Error loading manifest:', error);
    }
}

/**
 * Load current settings from storage
 */
function loadSettings() {
    storage.get(['enabledGlobal'], (result) => {
        const enabledGlobal = result.enabledGlobal !== false;
        globalToggle.checked = enabledGlobal;
    });
}

/**
 * Load list of configured sites
 */
function loadSitesList() {
    storage.get(['siteEnabled'], (result) => {
        const siteEnabled = result.siteEnabled || {};
        
        // Clear existing list
        sitesList.innerHTML = '';
        
        // Add sites to list
        Object.keys(siteEnabled).forEach((hostname) => {
            addSiteToList(hostname, siteEnabled[hostname]);
        });
        
        if (Object.keys(siteEnabled).length === 0) {
            sitesList.innerHTML = '<p style="color: #999; text-align: center;">No sites configured yet</p>';
        }
    });
}

/**
 * Add a site to the list with toggle
 */
function addSiteToList(hostname, enabled) {
    const item = document.createElement('div');
    item.className = 'site-item';
    item.innerHTML = `
        <span class="site-name">${escapeHtml(hostname)}</span>
        <label class="toggle-switch">
            <input type="checkbox" class="site-toggle" ${enabled ? 'checked' : ''} data-hostname="${escapeHtml(hostname)}">
            <span class="toggle-slider"></span>
        </label>
    `;
    
    sitesList.appendChild(item);
    
    // Add event listener to the toggle
    const toggle = item.querySelector('.site-toggle');
    toggle.addEventListener('change', (e) => {
        handleSiteToggleChange(hostname, e.target.checked);
    });
}

/**
 * Handle global toggle change
 */
function handleGlobalToggleChange() {
    const enabled = globalToggle.checked;
    storage.set({ enabledGlobal: enabled }, () => {
        showToast(enabled ? 'Extension enabled' : 'Extension disabled');

        // Re-style all tabs immediately to reflect new global state
        try {
            browserAPI.tabs.query({}, (tabs) => {
                tabs.forEach((tab) => {
                    if (tab && tab.id) {
                        browserAPI.runtime.sendMessage({
                            action: 'reapplyTab',
                            tabId: tab.id,
                            url: tab.url
                        });
                    }
                });
            });
        } catch (error) {
            // Ignore
        }
    });
}

/**
 * Handle per-site toggle change
 */
function handleSiteToggleChange(hostname, enabled) {
    storage.get(['siteEnabled'], (result) => {
        const siteEnabled = result.siteEnabled || {};
        siteEnabled[hostname] = enabled;
        storage.set({ siteEnabled: siteEnabled }, () => {
            showToast(enabled ? `Enabled for ${hostname}` : `Disabled for ${hostname}`);
        });
    });
}

/**
 * Handle reset button click
 */
function handleResetClick() {
    openConfirmDialog();
}

/**
 * Open confirmation dialog
 */
function openConfirmDialog() {
    confirmDialog.style.display = 'block';
    modalOverlay.style.display = 'block';
}

/**
 * Close confirmation dialog
 */
function closeConfirmDialog() {
    confirmDialog.style.display = 'none';
    modalOverlay.style.display = 'none';
}

/**
 * Handle confirmed reset
 */
function handleConfirmedReset() {
    closeConfirmDialog();
    
    // Reset to defaults
    const defaults = {
        enabledGlobal: true,
        siteEnabled: {}
    };
    
    storage.clear(() => {
        storage.set(defaults, () => {
            loadSettings();
            loadSitesList();
            showToast('Settings reset to defaults');
        });
    });
}

/**
 * Handle storage changes from other pages
 */
function handleStorageChange(changes) {
    if (changes.enabledGlobal) {
        globalToggle.checked = changes.enabledGlobal.newValue !== false;
    }
    if (changes.siteEnabled) {
        loadSitesList();
    }
}

/**
 * Show toast notification
 */
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
