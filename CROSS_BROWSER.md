# Firefox Plugin Setup & Distribution Guide

This guide provides comprehensive instructions for testing and distributing the Firefox plugin.

---

## 1. Browser Support

| Browser | Support Level | Notes |
|---------|---------------|-------|
| Firefox | ✅ Full Support | Primary platform - Manifest V2 |

This plugin is optimized specifically for Firefox using standard WebExtensions APIs.

---

## 2. Installation Instructions

### For Firefox (Temporary Development Installation)

**Recommended for Development:**

1. Open **about:debugging#/runtime/this-firefox** in your browser
2. Click **"Load Temporary Add-on"**
3. Navigate to the `firefox-plugin` folder and select **manifest.json**
4. The plugin will load and appear in your Firefox toolbar

**Important:** Temporary add-ons are unloaded when you restart Firefox. You'll need to reload them after each browser restart during development.

### For Firefox (Permanent Installation - Signed Extension)

To distribute via Firefox Add-ons or install permanently:

1. Package the plugin: `zip -r site-styling.zip firefox-plugin/`
2. Sign the plugin through [Mozilla's Add-ons Developer Hub](https://addons.mozilla.org/developers/)
3. Download the signed plugin (.xpi file)
4. Install the signed plugin or submit for distribution

See [Firefox Specific Notes](#firefox-specific-notes) for detailed signing instructions.

**For easier development, consider using Firefox Developer Edition**, which has enhanced debugging tools and is optimized for plugin development.

---

## 3. Basic Functionality Testing

### Firefox - Basic Functionality

- [ ] Plugin loads without errors in add-ons page
- [ ] Plugin icon appears in toolbar
- [ ] Clicking plugin icon opens the popup
- [ ] Toggle switch in popup works (on/off)
- [ ] Clicking "Options" button opens settings page
- [ ] Settings page toggles work correctly
- [ ] No console errors (open DevTools with F12)

### Firefox - Keyboard Shortcuts

**Global Toggle (Ctrl+Shift+Y on Windows/Linux, Cmd+Shift+Y on Mac):**
- [ ] Shortcut toggles styling on and off globally
- [ ] Works on any website
- [ ] Works in different tabs simultaneously

**Current Site Toggle (Ctrl+Shift+U on Windows/Linux, Cmd+Shift+U on Mac):**
- [ ] Shortcut toggles styling for current site only
- [ ] Other sites' preferences unaffected
- [ ] Works consistently across tabs

### Firefox - Styling

- [ ] Colors apply correctly:
   - [ ] Background color is #dad7d0 (warm beige)
   - [ ] Text color is #2a2520 (dark brown)
   - [ ] Accent color is #4a3728 (warm brown)
- [ ] Font is **JetBrains Mono** across all text
- [ ] Font size is correct:
   - [ ] Desktop: 20px
   - [ ] Mobile/Responsive: 18px
- [ ] Styling is applied when enabled
- [ ] Styling is removed when disabled

### Firefox - Storage & Persistence

1. **Basic Persistence:**
   - [ ] Enable styling on site A (e.g., example.com)
   - [ ] Reload the page → Styling persists
   - [ ] Close and reopen the tab → Styling persists
   - [ ] Close and reopen Firefox → Styling persists

2. **Site Isolation:**
   - [ ] Visit site B (e.g., test.com) → Styling NOT applied
   - [ ] Enable styling on site B → Styling applies
   - [ ] Return to site A → Styling still applied
   - [ ] Preference for each site is remembered independently

3. **Settings Persistence:**
   - [ ] Enable a setting in the options page
   - [ ] Reload page → Setting persists
   - [ ] Close browser → Setting persists
   - [ ] Open options page again → Setting shows correct state

### Firefox - "Never Style" List

The plugin has a built-in list of sites where styling should never apply.

- [ ] Visit docs.google.com → Styling does NOT apply
- [ ] Visit mail.google.com → Styling does NOT apply
- [ ] Visit github.com → Styling does NOT apply
- [ ] Toggle styling manually on blocked site → Styling does NOT apply (overridden)
- [ ] Visit random website → Styling applies normally
- [ ] Options page allows editing the "Never Style" list
- [ ] New sites added to list are immediately excluded

---

## 4. Troubleshooting

### Firefox Issues

| Issue | Solution |
|-------|----------|
| Plugin disappears after browser restart | Temporary add-ons unload on restart - reload in about:debugging |
| Storage not persisting | Clear browser cache (Ctrl+Shift+Del) and reload plugin |
| CSS not applying to page | Check browser console (F12) for errors |
| Keyboard shortcuts not working | Check about:debugging for loaded status and manifest.json for correct commands |
| Plugin loading fails | Verify manifest.json is valid JSON and all files referenced exist |
| Plugin doesn't appear in toolbar | Go to about:debugging, make sure plugin is enabled, click reload icon |

---

## 5. Firefox Specific Notes

### Development vs. Permanent Installation

**Temporary Installation (Recommended for Development)**

```
Purpose: Quick testing during development
Duration: Until browser restart
Process: Use about:debugging#/runtime/this-firefox
Pros: Instant loading, no signing required
Cons: Must reload after browser restart
```

**Permanent Installation (For Distribution)**

```
Purpose: Long-term use and distribution
Duration: Until manually uninstalled
Process: Sign via Mozilla Add-ons and distribute
Pros: Survives browser restart, official distribution
Cons: Requires signing process (3-5 days)
```

### Signing the Plugin for Firefox

1. **Create Mozilla Developer Account**
   - Visit https://addons.mozilla.org/developers/
   - Create account and verify email

2. **Prepare Plugin Package**
   ```bash
   # Create zip file of plugin folder
   zip -r site-styling.zip firefox-plugin/
   ```

3. **Submit for Review**
   - Go to "Submit a New Add-on" in developer dashboard
   - Upload the zip file
   - Fill out description, screenshots, etc.
   - Wait for automatic review (usually 1-3 days for automated review)

4. **Download Signed Plugin**
   - Once approved, download the signed .xpi file
   - This can be distributed and installed permanently

5. **Install Signed Plugin**
   - Users can drag the .xpi file into Firefox browser window
   - Or use `about:addons` and import the file
   - Or submit to Firefox Add-ons store for official distribution

### Firefox Developer Edition

**Recommended for plugin development:**
- Download from https://www.mozilla.org/firefox/developer/
- Enhanced debugging tools specifically for add-ons
- Remote debugging capabilities
- Can test both temporary and permanent add-ons
- More developer-friendly UI

### Manifest V2 Timeline

- **Current Status:** This plugin uses Manifest V2 (standard WebExtensions format)
- **MV3 Status:** Firefox announced MV3 support coming in 2025
- **Timeline:** Full Manifest V3 support expected by mid-2025
- **Backward Compatibility:** MV2 plugins will continue to work during transition
- **Migration Path:** Plugin will need to migrate to MV3 when Firefox deprecates MV2 (estimated 2026+)

---

## 6. Firefox Add-ons Distribution

### Step-by-Step Firefox Add-ons Distribution

1. **Create Mozilla Developer Account**
   - Visit https://addons.mozilla.org/developers/
   - Sign up and verify your email address

2. **Prepare Your Package**
   ```bash
   zip -r site-styling.zip firefox-plugin/
   ```

3. **Submit for Review**
   - Log in to your Mozilla developer account
   - Click "Submit a New Add-on"
   - Choose "Firefox" as the target platform
   - Upload your site-styling.zip file
   - Fill in the following details:
     - **Name:** Site Styling
     - **Category:** Appearance
     - **Description:** Apply consistent typography and colors to websites for comfortable reading
     - **Summary:** Warm earth-tone styling for every website
     - **Screenshots:** Add 1280x800 screenshots showing the plugin in action

4. **Automatic Review Process**
   - Firefox uses automated review (usually 1-3 days)
   - You'll receive email updates on the status
   - Some add-ons may require manual review (5-10 days)
   - Manual review is typically only needed for certain features

5. **Distribution Options**
   - **Official Firefox Store:** Listed in about:addons and Firefox Add-ons website
   - **Direct Distribution:** Download the signed .xpi file and host on your website
   - **Auto Updates:** Set up update URL in manifest for auto-updates

6. **Distribute to Users**
   - Extension appears on Firefox Add-ons (addons.mozilla.org)
   - Users can install with one click
   - Automatic updates handled by Mozilla

### Manual Distribution (Without Firefox Add-ons)

For distributing outside of official Firefox Add-ons store:

```
1. Sign your plugin through Mozilla developer account
2. Download the signed .xpi file
3. Host on your website
4. Users download and drag into Firefox browser window
5. Or provide a direct download link with installation instructions
```

### Update Strategy

Firefox supports automatic updates through its add-ons system. If distributing manually:

1. Use Mozilla's signing service to get updates signed
2. Provide a manifest.json with update URL
3. Check version numbers in manifest.json
4. Notify users to update when new versions are released

---

## 7. Performance Considerations

- Lazy load settings from storage
- Minimize CSS specificity battles
- Use efficient selectors to avoid layout thrashing
- Avoid long-lived observers; add MutationObserver only if needed for specific sites

---

## 8. File Structure

```
firefox-plugin/
├── manifest.json              ← Plugin configuration
├── src/
│   ├── background/
│   │   └── background.js      ← Plugin logic & CSS injection
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── options/
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.js
│   ├── content/
│   │   └── content.js         ← Content script for page integration
│   ├── styles/
│   │   └── universal-theme.css ← Color palette & typography
│   └── utils/
│       └── storage.js          ← User preferences storage
├── icons/                      ← Plugin icons
├── README.md
├── TESTING.md
└── DEPLOYMENT.md (this file)
```

---

## Additional Resources

- [Firefox WebExtensions Documentation](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions)
- [MDN Web Docs - Browser Extensions](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions)
- [Mozilla Add-ons Developer Hub](https://addons.mozilla.org/developers/)
- [Manifest V2 Specification](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json)

---

**Last Updated:** March 3, 2026

For Firefox-specific development, visit the Mozilla Developer docs at https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions
