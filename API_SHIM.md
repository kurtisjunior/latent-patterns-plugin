# Browser API Shim Technical Documentation

## Overview

The `browser-api.js` shim provides a unified interface for accessing browser extension APIs across Chrome and Firefox. Since Chrome uses the `chrome.*` API namespace while Firefox uses `browser.*`, this shim auto-detects the browser and normalizes all API calls, allowing your extension code to work seamlessly on both platforms without conditional checks.

**Location:** `/src/utils/browser-api.js`

---

## Why the Shim Exists

Browser extensions have different API patterns:

| Browser | API Namespace | Storage Options | CSS Injection |
|---------|---------------|-----------------|---------------|
| **Chrome** | `chrome.*` | `sync`, `local`, `managed` | `chrome.scripting.*` |
| **Firefox** | `browser.*` | `local` only | `browser.tabs.*` |

The shim **automatically detects** which browser is running and provides consistent APIs, eliminating the need for platform-specific conditional code throughout your extension.

---

## Quick Start

### Basic Usage

```javascript
import { API, insertCSS, removeCSS, getStorage } from '../utils/browser-api.js';

// Query active tabs
const tabs = await API.tabs.query({ active: true, currentWindow: true });

// Get extension manifest
const manifest = API.runtime.getManifest();

// Inject CSS (works on both browsers)
await insertCSS(tabId, '/src/styles/theme.css');

// Access storage (automatically handles sync/local differences)
const storage = getStorage('sync');
await storage.set({ userPreferences: { theme: 'dark' } });
```

---

## Available Exports

### Main Object

#### `API` - Unified Browser API
The primary export. Provides unified access to browser APIs:

```javascript
import { API } from '../utils/browser-api.js';

// Storage (automatically handles browser differences)
API.storage.local
API.storage.sync

// Runtime (extension messaging, lifecycle)
API.runtime.sendMessage()
API.runtime.onMessage.addListener()
API.runtime.getManifest()

// Tabs (tab queries and manipulation)
API.tabs.query()
API.tabs.get()
API.tabs.update()

// Commands (keyboard shortcuts)
API.commands.getAll()
API.commands.onCommand.addListener()

// Browser type identifier
API.browserType  // 'chrome' or 'firefox'
```

#### `BROWSER_TYPE` - Browser Identifier
String constant indicating which browser is running:

```javascript
import { BROWSER_TYPE } from '../utils/browser-api.js';

if (BROWSER_TYPE === 'firefox') {
  console.log('Running in Firefox');
} else {
  console.log('Running in Chrome');
}
```

### Helper Functions

#### `insertCSS(tabId, filePath)` - Inject CSS

Injects CSS into a specific tab. Handles API differences transparently.

**Parameters:**
- `tabId` (number): The ID of the target tab
- `filePath` (string): Path to the CSS file relative to extension root (e.g., `/src/styles/content.css`)

**Returns:** `Promise<void>`

**Throws:** `Error` if injection fails

```javascript
import { insertCSS } from '../utils/browser-api.js';

try {
  await insertCSS(123, '/src/styles/injected.css');
  console.log('CSS injected successfully');
} catch (error) {
  console.error('CSS injection failed:', error);
}
```

**Under the hood:**
- **Chrome:** Uses `chrome.scripting.insertCSS()` with `{ target: { tabId }, files: [filePath] }`
- **Firefox:** Uses `browser.tabs.insertCSS()` with `{ file: filePath }`

---

#### `removeCSS(tabId, filePath)` - Remove CSS

Removes previously injected CSS from a tab.

**Parameters:**
- `tabId` (number): The ID of the target tab
- `filePath` (string): Path to the CSS file to remove

**Returns:** `Promise<void>`

**Throws:** `Error` if removal fails

```javascript
import { removeCSS } from '../utils/browser-api.js';

await removeCSS(123, '/src/styles/injected.css');
```

**Under the hood:**
- **Chrome:** Uses `chrome.scripting.removeCSS()`
- **Firefox:** Uses `browser.tabs.removeCSS()`

---

#### `getStorage(area = 'sync')` - Get Storage Area

Returns the appropriate storage area for the current browser. **Critical for cross-browser compatibility** because Firefox doesn't support sync storage.

**Parameters:**
- `area` (string, optional): Storage area name. Default: `'sync'`
  - `'sync'` - Synced across user devices (Chrome only; Firefox falls back to `local`)
  - `'local'` - Local storage only
  - `'managed'` - Read-only, managed by admin policy

**Returns:** Storage API object

```javascript
import { getStorage } from '../utils/browser-api.js';

// Get sync storage (automatically falls back to local on Firefox)
const storage = getStorage('sync');
await storage.set({ theme: 'dark' });
const data = await storage.get(['theme']);

// Get local storage explicitly
const localStorage = getStorage('local');
await localStorage.set({ cache: { ...} });
```

**Firefox Behavior:** When you request `'sync'` storage on Firefox, it automatically returns `browser.storage.local` instead, making this transparent to your code.

---

#### `getRuntime()` - Get Runtime API

Returns the runtime API object. Useful for messaging, lifecycle events, and extension metadata.

**Returns:** Runtime API object

```javascript
import { getRuntime } from '../utils/browser-api.js';

const runtime = getRuntime();

// Listen for messages
runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ pong: true });
  }
});

// Send message
runtime.sendMessage({ action: 'greet', name: 'Extension' });

// Get manifest
const manifest = runtime.getManifest();
```

---

#### `executeScript(tabId, scriptOptions)` - Execute JavaScript

Executes JavaScript in a specific tab. Supports both file-based and inline code execution.

**Parameters:**
- `tabId` (number): The ID of the target tab
- `scriptOptions` (object): Execution options
  - `filePath` (string, optional): Path to script file
  - `code` (string, optional): Inline JavaScript code

**Returns:** `Promise<Array>` - Array of results from script execution

**Throws:** `Error` if execution fails

```javascript
import { executeScript } from '../utils/browser-api.js';

// Execute from file
await executeScript(123, { 
  filePath: '/src/scripts/inject.js' 
});

// Execute inline code
await executeScript(123, { 
  code: 'console.log("Executing in page context");' 
});
```

**Under the hood:**
- **Chrome:** Uses `chrome.scripting.executeScript()`
- **Firefox:** Uses `browser.tabs.executeScript()`

---

## API Properties and Capabilities

### Storage API (`API.storage`)

Provides persistent data storage. The shim automatically handles browser differences.

```javascript
import { API } from '../utils/browser-api.js';

// Set data
await API.storage.sync.set({ 
  userSettings: { 
    theme: 'dark', 
    fontSize: 14 
  } 
});

// Get data
const result = await API.storage.sync.get('userSettings');
console.log(result.userSettings);

// Get multiple keys
const data = await API.storage.sync.get(['theme', 'fontSize']);

// Listen for changes
API.storage.onChanged.addListener((changes, area) => {
  console.log(`Storage changed in ${area}:`, changes);
});
```

**Cross-browser behavior:**
- **Chrome:** Full support for `sync`, `local`, and `managed`
- **Firefox:** Only `local` available; use `getStorage('sync')` to get `local` automatically

---

### Runtime API (`API.runtime`)

Handles messaging, lifecycle events, and extension metadata.

```javascript
import { API } from '../utils/browser-api.js';

// Message passing
API.runtime.sendMessage({ 
  action: 'loadData', 
  id: 123 
});

// Listen for messages (in background or content scripts)
API.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    sendResponse({ data: 'response' });
  }
});

// Get extension info
const manifest = API.runtime.getManifest();
console.log(manifest.version);

// Get extension URL
const iconUrl = API.runtime.getURL('/icons/icon-128.png');
```

---

### Tabs API (`API.tabs`)

Query and manipulate browser tabs.

```javascript
import { API } from '../utils/browser-api.js';

// Query tabs
const activeTabs = await API.tabs.query({ 
  active: true, 
  currentWindow: true 
});

// Get specific tab
const tab = await API.tabs.get(tabId);

// Update tab
await API.tabs.update(tabId, { url: 'https://example.com' });

// Listen for tab events
API.tabs.onActivated.addListener((activeInfo) => {
  console.log(`Tab ${activeInfo.tabId} is now active`);
});
```

---

### Commands API (`API.commands`)

Handle keyboard shortcuts defined in manifest.

```javascript
import { API } from '../utils/browser-api.js';

// Listen for keyboard shortcuts
API.commands.onCommand.addListener((command) => {
  if (command === 'toggle-feature') {
    // Handle shortcut
  }
});

// Get all commands
const commands = await API.commands.getAll();
commands.forEach(cmd => {
  console.log(`${cmd.name}: ${cmd.shortcut}`);
});
```

---

### Browser Type (`API.browserType`)

Identifier for browser detection. Use when you need browser-specific logic.

```javascript
import { API } from '../utils/browser-api.js';

if (API.browserType === 'firefox') {
  // Firefox-specific code
  console.log('Optimizing for Firefox');
} else if (API.browserType === 'chrome') {
  // Chrome-specific code
  console.log('Optimizing for Chrome');
}
```

---

## CSS Injection Details

### How It Works

The shim abstracts away the different CSS injection APIs:

| Browser | API | Tab Parameter | File Format |
|---------|-----|---|---|
| **Chrome** | `chrome.scripting.insertCSS()` | `target: { tabId }` | `files: [path]` (array) |
| **Firefox** | `browser.tabs.insertCSS()` | First argument | `file: path` (string) |

### Practical Examples

```javascript
import { insertCSS, removeCSS } from '../utils/browser-api.js';

// Inject theme CSS
await insertCSS(tabId, '/src/styles/dark-theme.css');

// Inject multiple stylesheets
await insertCSS(tabId, '/src/styles/base.css');
await insertCSS(tabId, '/src/styles/components.css');

// Clean up when feature is disabled
await removeCSS(tabId, '/src/styles/dark-theme.css');
```

### Error Handling

Both functions throw errors if injection fails:

```javascript
import { insertCSS } from '../utils/browser-api.js';

async function applyTheme(tabId, theme) {
  try {
    await insertCSS(tabId, `/src/styles/${theme}.css`);
  } catch (error) {
    console.error(`Failed to apply ${theme} theme:`, error);
    // Fallback or user notification
  }
}
```

### File Path Requirements

- Paths must be relative to the extension root
- Must include the leading slash: `/src/styles/theme.css` ✓, `src/styles/theme.css` ✗
- CSS file must exist in the extension package
- Applies to all contexts (content scripts, popups, options pages)

---

## Storage Compatibility Guide

### The Challenge

- **Chrome** supports both sync and local storage
- **Firefox** only supports local storage for extensions
- `getStorage()` handles this transparently

### How getStorage() Works

```javascript
import { getStorage } from '../utils/browser-api.js';

// Request sync storage
const storage = getStorage('sync');

// On Chrome: Returns chrome.storage.sync
// On Firefox: Returns browser.storage.local (automatic fallback)
```

### Recommended Patterns

**For user preferences (should sync):**
```javascript
const storage = getStorage('sync');
await storage.set({ preferences: { ... } });
```

**For temporary cache (local only):**
```javascript
const storage = getStorage('local');
await storage.set({ cache: { ...data } });
```

**For managed data (admin policies):**
```javascript
// Chrome only; Firefox will return undefined
const managed = getStorage('managed');
if (managed) {
  const policy = await managed.get(['allowFeatureX']);
}
```

### Storage Events

```javascript
import { API } from '../utils/browser-api.js';

API.storage.onChanged.addListener((changes, area) => {
  console.log(`${area} storage changed:`, changes);
  
  if (area === 'sync' || area === 'local') {
    // React to storage changes
  }
});
```

---

## Browser Detection Patterns

### When to Use Browser Detection

Use browser-specific code sparingly. Most APIs are abstracted by the shim. Only use when:

1. **Different API behavior** - The shim doesn't cover your use case
2. **Feature availability** - A feature exists on one browser but not another
3. **Performance optimization** - Different strategies per browser
4. **Debugging** - Logging which browser is running

### Detection Patterns

```javascript
import { API, BROWSER_TYPE } from '../utils/browser-api.js';

// Pattern 1: Using BROWSER_TYPE constant
if (BROWSER_TYPE === 'firefox') {
  initFirefoxFeatures();
}

// Pattern 2: Using API.browserType
switch (API.browserType) {
  case 'chrome':
    initChromeFeatures();
    break;
  case 'firefox':
    initFirefoxFeatures();
    break;
}

// Pattern 3: Feature capability checking (preferred)
if (API.storage.managed) {
  // Managed storage available (Chrome)
} else {
  // Only local/sync available (Firefox)
}
```

### Example: Firefox-Specific Code

```javascript
import { API } from '../utils/browser-api.js';

async function setupStorage() {
  if (API.browserType === 'firefox') {
    // Firefox doesn't support sync; use local only
    const storage = await API.storage.local.get();
    return storage;
  } else {
    // Chrome can use sync storage
    const storage = await API.storage.sync.get();
    return storage;
  }
}
```

---

## Error Handling Guide

### CSS Injection Errors

```javascript
import { insertCSS } from '../utils/browser-api.js';

async function injectStyles(tabId, stylePath) {
  try {
    await insertCSS(tabId, stylePath);
  } catch (error) {
    // Common causes:
    // - Tab ID is invalid (tab was closed)
    // - File path doesn't exist in extension
    // - No permission for the tab's URL
    
    console.error(`CSS injection failed for tab ${tabId}:`, error);
    
    // Graceful fallback
    if (error.message.includes('Invalid tab')) {
      console.log('Tab was closed; skipping');
    } else if (error.message.includes('No handler')) {
      console.log('File not found; check manifest.json');
    }
  }
}
```

### Storage Errors

```javascript
import { getStorage } from '../utils/browser-api.js';

async function saveSettings(settings) {
  try {
    const storage = getStorage('sync');
    await storage.set(settings);
  } catch (error) {
    // Storage quota exceeded or other error
    console.error('Failed to save settings:', error);
    
    // Fallback to local storage
    const localStorage = getStorage('local');
    await localStorage.set(settings);
  }
}
```

### Runtime Messaging Errors

```javascript
import { getRuntime } from '../utils/browser-api.js';

async function sendMessage(message) {
  try {
    const runtime = getRuntime();
    const response = await runtime.sendMessage(message);
    return response;
  } catch (error) {
    // Receiver not listening or disconnected
    console.error('Message send failed:', error);
  }
}
```

---

## Practical Examples

### Example 1: Theme Injection and Cleanup

```javascript
import { insertCSS, removeCSS, getStorage } from '../utils/browser-api.js';

async function applyTheme(tabId, themeName) {
  // Load theme preference
  const storage = getStorage('sync');
  const themePath = `/src/styles/themes/${themeName}.css`;
  
  try {
    await insertCSS(tabId, themePath);
    await storage.set({ currentTheme: themeName });
    console.log(`Applied ${themeName} theme to tab ${tabId}`);
  } catch (error) {
    console.error('Theme application failed:', error);
  }
}

async function removeTheme(tabId, themeName) {
  const themePath = `/src/styles/themes/${themeName}.css`;
  try {
    await removeCSS(tabId, themePath);
  } catch (error) {
    console.error('Theme removal failed:', error);
  }
}
```

### Example 2: Message Handling with Response

```javascript
import { API } from '../utils/browser-api.js';

// In background script
API.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabInfo') {
    // Get information about the sender
    sendResponse({
      tabId: sender.tab.id,
      url: sender.tab.url,
      title: sender.tab.title,
    });
  } else if (request.action === 'getData') {
    // Async response
    (async () => {
      const storage = API.storage.sync;
      const data = await storage.get('userData');
      sendResponse(data);
    })();
    // Return true to indicate async response
    return true;
  }
});

// In content script
async function getTabInfo() {
  return new Promise((resolve) => {
    API.runtime.sendMessage(
      { action: 'getTabInfo' },
      (response) => {
        resolve(response);
      }
    );
  });
}
```

### Example 3: Browser Detection for Features

```javascript
import { API } from '../utils/browser-api.js';

async function setupExtension() {
  // Feature that requires sync storage
  if (API.browserType === 'chrome') {
    const storage = API.storage.sync;
    const settings = await storage.get('syncSettings');
    applySettings(settings);
  } else {
    // Firefox: use local storage instead
    const storage = API.storage.local;
    const settings = await storage.get('syncSettings');
    applySettings(settings);
  }
}

function applySettings(settings) {
  console.log('Settings applied:', settings);
}
```

### Example 4: Keyboard Shortcut Handling

```javascript
import { API } from '../utils/browser-api.js';

API.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-extension') {
    // Query active tab
    const tabs = await API.tabs.query({ 
      active: true, 
      currentWindow: true 
    });
    
    if (tabs.length > 0) {
      const tabId = tabs[0].id;
      
      // Toggle feature on active tab
      await API.runtime.sendMessage({
        action: 'toggle',
        tabId: tabId,
      });
    }
  }
});
```

### Example 5: Script Execution with Fallback

```javascript
import { executeScript, insertCSS } from '../utils/browser-api.js';

async function enhancePage(tabId) {
  try {
    // Inject styles
    await insertCSS(tabId, '/src/styles/enhancements.css');
    
    // Execute logic script
    await executeScript(tabId, { 
      filePath: '/src/scripts/page-enhancement.js' 
    });
  } catch (error) {
    console.error('Page enhancement failed:', error);
    // Fallback: try inline code
    try {
      await executeScript(tabId, {
        code: 'console.log("Enhancement fallback");'
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
  }
}
```

---

## Migration Guide

### Adding New Browser APIs

If you need to use a browser API not covered by the shim:

1. **Add to the API object** in `browser-api.js`:
   ```javascript
   export const API = {
     // ... existing APIs
     newApi: browserAPI.newApi,
   };
   ```

2. **Create helpers if needed** for APIs with different signatures:
   ```javascript
   export async function newHelperFunction(params) {
     try {
       if (BROWSER_TYPE === 'firefox') {
         return await browserAPI.newApi.firefoxMethod(params);
       } else {
         return await browserAPI.newApi.chromeMethod(params);
       }
     } catch (error) {
       console.error('Operation failed:', error);
       throw error;
     }
   }
   ```

3. **Export the function**:
   ```javascript
   export default {
     API,
     BROWSER_TYPE,
     newHelperFunction,
     // ... other exports
   };
   ```

4. **Update this documentation** with the new export and examples

### Example: Adding Webdriver API Support

```javascript
// In browser-api.js
export async function connectToWebDriver(options) {
  try {
    if (BROWSER_TYPE === 'firefox') {
      // Firefox API
      return await browserAPI.webDriver.connect(options);
    } else {
      // Chrome API
      return await browserAPI.webDriver.connect(options);
    }
  } catch (error) {
    console.error('WebDriver connection failed:', error);
    throw error;
  }
}

export default {
  API,
  BROWSER_TYPE,
  connectToWebDriver,
  // ... other exports
};
```

---

## Best Practices

### ✓ Do's

- ✓ Use `getStorage('sync')` for user preferences (handles Firefox automatically)
- ✓ Use `insertCSS()` for all CSS injection (cross-browser compatible)
- ✓ Use `API.*` for direct API access when the shim covers your use case
- ✓ Wrap CSS/script execution in try-catch blocks
- ✓ Check `API.browserType` only when necessary for feature differences
- ✓ Use `getRuntime()` for messaging operations
- ✓ Always provide file paths with leading slash: `/src/path.css`

### ✗ Don'ts

- ✗ Don't use `chrome.*` or `browser.*` directly (breaks portability)
- ✗ Don't assume sync storage works on Firefox (use `getStorage('sync')`)
- ✗ Don't hardcode API differences; add to the shim instead
- ✗ Don't ignore errors from CSS/script injection (tab might be closed)
- ✗ Don't use relative paths for CSS/script files (use `/src/...`)
- ✗ Don't catch errors without logging (makes debugging harder)

---

## FAQ

### Q: Can I use the `chrome` or `browser` objects directly?

**A:** No. Always use the shim. Using direct APIs breaks Firefox compatibility or Chrome compatibility depending on which you use. The shim is designed to handle all differences.

### Q: How do I debug which browser the extension is running on?

**A:** Use:
```javascript
import { API, BROWSER_TYPE } from '../utils/browser-api.js';
console.log('Browser:', BROWSER_TYPE);
console.log('Browser (alt):', API.browserType);
```

### Q: Does Firefox support sync storage?

**A:** No. Firefox extensions only support `browser.storage.local`. The `getStorage('sync')` function automatically returns `local` on Firefox.

### Q: Why does CSS injection fail on some tabs?

**A:** Common causes:
- Tab ID is invalid (tab was closed)
- No permission for the tab's URL (e.g., `chrome://` URLs)
- File path doesn't exist or is malformed
- Content script context issues

Always wrap in try-catch and log the error.

### Q: How do I send messages between background and content scripts?

**A:** Use `API.runtime.sendMessage()` and `API.runtime.onMessage.addListener()`. The shim handles browser differences automatically.

### Q: Can I use async/await with storage operations?

**A:** Yes. All storage operations return Promises:
```javascript
const storage = getStorage('sync');
const data = await storage.get('key');
await storage.set({ key: 'value' });
```

### Q: What's the difference between `API` and `BROWSER_TYPE`?

**A:** 
- `API` - Main unified API object for accessing browser APIs
- `BROWSER_TYPE` - String constant ('chrome' or 'firefox') for browser detection

Use `API` for normal operations; use `BROWSER_TYPE` only for browser-specific conditional logic.

---

## Support and Contributions

To extend or modify the shim:

1. Review the current implementation in `src/utils/browser-api.js`
2. Add new exports following the existing patterns
3. Document the new functions with JSDoc comments
4. Update this documentation
5. Test on both Chrome and Firefox

For issues or questions, consult the extension's main README and testing documentation.
