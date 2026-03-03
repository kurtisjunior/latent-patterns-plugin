# Toggle Functionality Test

## Quick Test (2 minutes)

### Prerequisites
- Firefox extension loaded and working
- Visit a website with text content

### Step 1: Open Browser Console
1. Press `F12` to open Developer Tools
2. Click the "Console" tab
3. Keep it open while testing

### Step 2: Initial State Check
1. Look at the website text
2. What font do you see? (monospace or original?)
3. In console, you should see NO "site-styling-css" logs yet

### Step 3: Click Toggle ON
1. Click the extension icon
2. Click the toggle switch to enable
3. **IMMEDIATELY CHECK CONSOLE** - you should see:
   ```
   Content script received: applyCSS
   Content script: applying CSS
   CSS applied successfully
   ```

4. **LOOK AT PAGE** - text should change:
   - Background: warm beige (#dad7d0)
   - Text: dark brown (#2a2520)
   - Font: JetBrains Mono (monospace)

### Step 4: Click Toggle OFF
1. Click extension icon again
2. Click toggle to disable
3. **CHECK CONSOLE** - you should see:
   ```
   Content script received: removeCSS
   Content script: removing CSS
   CSS removed successfully
   ```

4. **LOOK AT PAGE** - should snap back to original:
   - Colors gone
   - Font back to original
   - Text looks completely different

### Step 5: Test Multiple Times
1. Click ON → colors apply
2. Click OFF → colors disappear
3. Click ON → colors apply again
4. Click OFF → colors disappear again

Each time should work instantly and consistently.

---

## Detailed Debug Test

If the quick test shows issues, run this:

### 1. Check Content Script is Loaded
**In console, type:**
```javascript
document.getElementById('site-styling-css')
```

**Expected:**
- If extension is ON: Returns a `<style>` element
- If extension is OFF: Returns `null`

### 2. Check Message Passing
**In console, type:**
```javascript
browser.runtime.sendMessage({action: 'applyCSS'})
```

**Expected:** Console should immediately show:
```
Content script received: applyCSS
Content script: applying CSS
CSS applied successfully
```

### 3. Check Style Element Properties
**If extension is ON, type:**
```javascript
document.getElementById('site-styling-css').textContent.substring(0, 100)
```

**Expected:** Should show CSS starting with:
```
    * {
      font-family: "JetBrains Mono"
```

### 4. Check Storage
**In console, type:**
```javascript
browser.storage.local.get(['siteEnabled'], console.log)
```

**Expected:** Should show your hostname with true/false value:
```
Object { siteEnabled: { "example.com": true } }
```

---

## Expected Behavior

### ✅ CORRECT - Toggle is working:
- ON → colors apply instantly
- OFF → colors completely disappear instantly
- Can toggle multiple times
- Console shows "CSS applied/removed" messages
- Storage updates correctly

### ❌ BROKEN - Toggle NOT working:
- Colors don't change
- Only one direction works (ON but not OFF, or vice versa)
- Console shows errors
- Page doesn't respond to toggle
- Storage doesn't update

---

## Visual Test

### When Extension is ON
You should see:
- [ ] Beige background (#dad7d0)
- [ ] Dark brown text (#2a2520)
- [ ] JetBrains Mono font (monospace)
- [ ] Brown links (#4a3728)
- [ ] All text in monospace

### When Extension is OFF
You should see:
- [ ] Original website background
- [ ] Original website text color
- [ ] Original website font
- [ ] Original website links
- [ ] Completely different appearance from ON state

---

## Testing Different Pages

Test on at least 3 different websites:

### Page 1: simonwillison.net/guides/agentic-engineering-patterns
- [ ] Toggle ON works
- [ ] Toggle OFF works
- [ ] Colors apply
- [ ] Font changes
- [ ] Code blocks visible

### Page 2: (Choose a news site or blog)
- [ ] Toggle ON works
- [ ] Toggle OFF works
- [ ] Text clearly different with/without extension

### Page 3: (Choose a site with code/documentation)
- [ ] Toggle ON works
- [ ] Toggle OFF works
- [ ] Code blocks still readable
- [ ] Syntax highlighting preserved

---

## Keyboard Shortcut Test

### Ctrl+Shift+U (Toggle Current Site)
1. Press `Ctrl+Shift+U` with extension OFF
2. Check: Does styling apply?
3. Press `Ctrl+Shift+U` again
4. Check: Does styling disappear?

### Ctrl+Shift+Y (Toggle Global)
1. Press `Ctrl+Shift+Y` to disable globally
2. Check: Does extension turn OFF everywhere?
3. Press `Ctrl+Shift+Y` again
4. Check: Does it turn back ON?

---

## Common Issues & Solutions

### Issue: Toggle doesn't work at all
**Check:**
- Is content script loaded? (Check console at page load)
- Are there JavaScript errors? (Look for red X in console)
- Try refreshing the page and toggling again

**Solution:**
- Reload extension: about:debugging → refresh
- Try a different website
- Check Firefox console for errors

### Issue: Can only toggle in one direction
**Check:**
- Does console show "CSS applied" but not "CSS removed"?
- Or vice versa?

**Solution:**
- Check if style element exists: `document.getElementById('site-styling-css')`
- Manually remove: `document.getElementById('site-styling-css')?.remove()`

### Issue: Colors don't change but console shows success
**Check:**
- Is the CSS being applied to the right elements?
- Do other styles override the extension?

**Solution:**
- Check inspect element to see style
- Verify colors are actually applied to body element

### Issue: Toggle works once then stops
**Check:**
- Reload the page
- Check if there's a JavaScript error in console

**Solution:**
- Refresh page
- Reload extension

---

## Test Results Template

```
Website: _________________
Date: _________________

Quick Test:
- [ ] Popup appears when clicking icon
- [ ] Toggle ON works (colors apply)
- [ ] Toggle OFF works (colors disappear)
- [ ] Console shows correct messages
- [ ] Can toggle multiple times
- [ ] Font is JetBrains Mono
- [ ] Background color correct

Keyboard Shortcuts:
- [ ] Ctrl+Shift+U works
- [ ] Ctrl+Shift+Y works

Overall: ✅ WORKING / ❌ BROKEN

Issues found:
_________________________________
_________________________________
_________________________________
```

---

## Summary

**The toggle SHOULD work like this:**

```
User clicks toggle ON
    ↓ (instant)
Popup.js sends message to background
    ↓ (instant)
Background.js sends message to content script
    ↓ (instant)
Content.js adds <style> element to page
    ↓ (instant, visible on screen)
Colors and font apply to entire page

User clicks toggle OFF
    ↓ (instant)
Popup.js sends message to background
    ↓ (instant)
Background.js sends message to content script
    ↓ (instant)
Content.js removes <style> element
    ↓ (instant, visible on screen)
Page snaps back to original appearance
```

All steps should be instant - no lag or delay!
