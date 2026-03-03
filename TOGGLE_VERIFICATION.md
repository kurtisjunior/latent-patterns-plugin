# Quick Toggle Verification

Run this test RIGHT NOW to verify if toggle is working.

## Step 1: Open Firefox Browser Console
- Press `F12`
- Click "Console" tab
- Keep it open

## Step 2: Run This Test

Copy and paste this into the console:

```javascript
// Check 1: Is content script running?
const styleElement = document.getElementById('site-styling-css');
console.log('✓ Style element found:', styleElement !== null);

// Check 2: Get current settings
browser.storage.local.get(['siteEnabled', 'enabledGlobal'], (result) => {
    console.log('✓ Storage settings:', result);
});

// Check 3: Test message passing
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.debug) {
        console.log('✓ Message received in page:', request);
        sendResponse({debug: true});
    }
});

console.log('✓ Test setup complete. Now click toggle!');
```

## Step 3: Watch Console While You Click Toggle

**Click ON:**
- You should see: `Content script received: applyCSS`
- You should see: `CSS applied successfully`
- Page colors should change

**Click OFF:**
- You should see: `Content script received: removeCSS`
- You should see: `CSS removed successfully`
- Page colors should disappear

## Step 4: Check Results

### ✅ If you see these messages:
- `Content script received: applyCSS`
- `Content script: applying CSS`
- `CSS applied successfully`

**Then toggle is WORKING!**

### ✅ If you see these messages:
- `Content script received: removeCSS`
- `Content script: removing CSS`
- `CSS removed successfully`

**Then toggle OFF is WORKING!**

### ❌ If you don't see these messages:
- Content script not running
- Need to reload extension
- Toggle is BROKEN

---

## One-Line Quick Check

In console, paste this:

```javascript
console.log('Styling active:', !!document.getElementById('site-styling-css'));
```

- If returns `true` → extension is ON
- If returns `false` → extension is OFF

Toggle the extension and run again - it should flip between true/false.

---

## Expected Console Output

### When you toggle ON:
```
Content script received: applyCSS
Content script: applying CSS
CSS applied successfully
```

### When you toggle OFF:
```
Content script received: removeCSS
Content script: removing CSS
CSS removed successfully
```

### If working properly:
You should see these logs EVERY TIME you toggle, instantly!

---

## Critical Test

**Do this RIGHT NOW:**

1. Reload Firefox extension (about:debugging → refresh)
2. Go to simonwillison.net/guides/agentic-engineering-patterns
3. Open console (F12)
4. Click extension toggle ON
5. **Does text color change to #2a2520 (dark brown)?**
6. **Does background change to #dad7d0 (warm beige)?**
7. **Does font change to JetBrains Mono?**

If YES to all three → **TOGGLE IS WORKING** ✅

If NO → **TOGGLE IS BROKEN** ❌

---

## Report Back With:

1. What you see in console when clicking toggle
2. Whether page colors actually change
3. Whether toggle OFF removes colors
4. Any error messages in console
