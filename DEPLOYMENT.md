# Firefox Plugin Deployment Guide

## Quick Start

Your Firefox plugin is now fully implemented and ready to test! Follow these steps to load it into Firefox.

### Step 1: Open Firefox Add-ons Debugging
1. Open Mozilla Firefox
2. Type `about:debugging#/runtime/this-firefox` in the address bar and press Enter
3. You'll see the Firefox Add-ons debugging panel

### Step 2: Load the Plugin
1. Click the **"Load Temporary Add-on"** button
2. Navigate to `/Users/kurtis/tinker/firefox-plugin/`
3. Select the **`manifest.json`** file
4. The plugin should now appear in your add-ons list

### Step 3: Verify Installation
- Look for "Site Styling" in your Firefox add-ons
- The icon should appear in your Firefox toolbar
- You should see the popup, options page, and keyboard shortcuts are ready

## What You Can Do Now

### Popup (Click the plugin icon)
- Toggle styling on/off for the current site
- See current plugin status
- Quick access to settings

### Keyboard Shortcuts
- **Ctrl+Shift+Y** (or Cmd+Shift+Y on Mac): Toggle plugin globally
- **Ctrl+Shift+U** (or Cmd+Shift+U on Mac): Toggle styling on current site

### Options Page
1. Right-click the plugin icon
2. Select "Options" to open settings
3. Manage:
   - Global enable/disable
   - Per-site preferences
   - View keyboard shortcuts
   - Reset to defaults

## Color Palette Applied

When styling is enabled, your sites will use these warm earth tones:

| Element | Color |
|---------|-------|
| Background | #dad7d0 (warm beige) |
| Text | #2a2520 (dark brown) |
| Links | #4a3728 (warm brown) |
| Hover Links | #2a1a0e (darker brown) |
| Code Background | #bfb8b0 (light taupe) |
| Secondary Text | #6b6560 (muted brown) |

**Font**: JetBrains Mono, 20px (18px on mobile)

## Protected Sites (Never Styled)

The plugin will never style these sites by default:
- docs.google.com (Google Docs)
- mail.google.com (Gmail)
- github.com (GitHub)
- twitter.com (Twitter/X)
- figma.com (Figma)
- notion.so (Notion)

## Testing Checklist

Follow the comprehensive testing guide in `TESTING.md` to verify:
- ✓ Popup toggle works
- ✓ Keyboard shortcuts work
- ✓ Per-site preferences persist
- ✓ "Never style" list is respected
- ✓ Options page displays correctly
- ✓ Colors and fonts apply correctly

## File Structure

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

## Troubleshooting

### Plugin doesn't appear in toolbar
1. Go to `about:debugging#/runtime/this-firefox`
2. Make sure the plugin is listed and enabled
3. Reload the plugin using the refresh icon

### Popup doesn't open
1. Check browser console: Firefox Menu → More Tools → Developer Tools
2. Go to the Console tab
3. Check for any errors related to the plugin

### Styling not applying
1. Make sure "Global toggle" is enabled in options
2. Verify the current site is enabled (not in "never style" list)
3. Try reloading the page
4. Check if the site is in the built-in "never style" list

### Can't find keyboard shortcuts
1. Go to `about:preferences#content`
2. Look for keyboard shortcut settings
3. Verify Ctrl+Shift+Y and Ctrl+Shift+U are configured in the manifest

## Next Steps

After testing and verifying everything works:

1. **Replace placeholder icons** with actual PNG images (sizes: 16x16, 48x48, 128x128, 256x256)
2. **Update manifest.json** with your plugin name and description
3. **Consider future features** from the specification:
   - Color palette customization
   - Font size adjustment slider
   - Line height adjustment slider
   - Time-based automatic activation
   - User-editable "never style" host list
4. **Sign and package for Firefox Add-ons** when ready for distribution
   - See CROSS_BROWSER.md for detailed Firefox signing instructions
   - Visit https://addons.mozilla.org/developers/ to sign your plugin

## Need Help?

- Check `TESTING.md` for detailed test cases
- Review the original `chrome-extension-spec.md` for full specification
- Check Firefox WebExtensions documentation: https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions

Happy testing!
