# Firefox Plugin Testing Guide

This document provides comprehensive testing procedures to verify the plugin works correctly against the "never style" list specification and all core functionality.

---

## 1. Setup Instructions

### 1.1 Open Firefox Developer Tools

- [ ] Open Firefox browser
- [ ] Navigate to `about:debugging#/runtime/this-firefox`
- [ ] Verify the Firefox Extensions debugging page opens
- [ ] Look for "Load Temporary Add-on" button

### 1.2 Load the Plugin

- [ ] In the Firefox Debugging page, click the "Load Temporary Add-on" button
- [ ] Navigate to the `firefox-plugin` directory in the project
- [ ] Select the `manifest.json` file
- [ ] Verify the plugin appears in your add-ons list with an ID
- [ ] Note the plugin ID for future reference
- [ ] Verify the plugin icon appears in the Firefox toolbar

### 1.3 Access Plugin Settings

- [ ] Right-click the plugin icon in the toolbar
- [ ] Select "Manage Extension"
- [ ] Verify the plugin loads without errors
- [ ] Close the settings page

---

## 2. Test Cases for "Never Style" List

These sites should **NOT** be styled by the plugin, even when the plugin is globally enabled.

### 2.1 Test Google Docs - docs.google.com

- [ ] Open a new tab and navigate to https://docs.google.com
- [ ] Verify the page appears with Google Docs' normal styling
- [ ] Verify the page background is NOT #dad7d0 (warm beige)
- [ ] Verify the page text is NOT #2a2520 (dark brown)
- [ ] Check the browser console for no extension-related errors
- [ ] Verify that no style injection message appears for this domain

### 2.2 Test Gmail - mail.google.com

- [ ] Open a new tab and navigate to https://mail.google.com
- [ ] Verify the page appears with Gmail's normal styling
- [ ] Verify colors are not overridden by the extension
- [ ] Check the plugin popup shows the site is on the "never style" list
- [ ] Verify no styling has been applied

### 2.3 Test GitHub - github.com

- [ ] Open a new tab and navigate to https://github.com
- [ ] Verify the page displays GitHub's native styling (dark mode or light mode)
- [ ] Verify the page background is NOT the warm beige color
- [ ] Verify links are NOT the warm brown color (#4a3728)
- [ ] Check the plugin popup to confirm this is a blocked site

### 2.4 Test Twitter - twitter.com

- [ ] Open a new tab and navigate to https://twitter.com (or https://x.com)
- [ ] Verify Twitter's native styling is preserved
- [ ] Verify the warm beige background has not been applied
- [ ] Verify custom colors have not overridden Twitter's palette

### 2.5 Test Figma - figma.com

- [ ] Open a new tab and navigate to https://figma.com
- [ ] Verify Figma's design interface appears with normal styling
- [ ] Verify no background color override is visible
- [ ] Confirm the extension has not modified Figma's UI

### 2.6 Test Notion - notion.so

- [ ] Open a new tab and navigate to https://notion.so
- [ ] Verify Notion's interface displays with native styling
- [ ] Verify the page background is NOT overridden
- [ ] Check that no extension styling has been applied

### 2.7 Test Any Other Website (Control Test) - SHOULD be styled

- [ ] Open a new tab and navigate to any site NOT on the never-style list (e.g., https://example.com, https://wikipedia.org, https://news.google.com)
- [ ] **VERIFY the plugin styling IS applied:**
   - [ ] Page background is #dad7d0 (warm beige)
   - [ ] Text color is #2a2520 (dark brown)
   - [ ] Links are #4a3728 (warm brown)
   - [ ] Font is JetBrains Mono
- [ ] Verify the styling creates a consistent, readable experience
- [ ] Test on at least 3 different non-blocked websites

---

## 3. Test Cases for Core Functionality

### 3.1 Popup Toggle - Enable/Disable Per-Site Styling

- [ ] Navigate to a non-blocked website (e.g., example.com)
- [ ] Verify the plugin is styling the page
- [ ] Click the plugin icon to open the popup
- [ ] Click the toggle button to disable styling on this site
- [ ] **VERIFY:** The styling immediately disappears from the page
- [ ] The page reverts to its native styling
- [ ] Click the toggle again to re-enable styling
- [ ] **VERIFY:** The styling is reapplied immediately
- [ ] Close the popup

### 3.2 Keyboard Shortcut - Ctrl+Shift+Y (Global Toggle)

- [ ] Navigate to a styled website
- [ ] Verify the plugin styling is active
- [ ] Press `Ctrl+Shift+Y` (Cmd+Shift+Y on macOS)
- [ ] **VERIFY:** The plugin styling disappears globally
- [ ] Navigate to different sites - none should be styled
- [ ] Press `Ctrl+Shift+Y` again
- [ ] **VERIFY:** Styling is re-enabled across all sites
- [ ] Test this multiple times to ensure consistency

### 3.3 Keyboard Shortcut - Ctrl+Shift+U (Site Toggle)

- [ ] Navigate to a styled website
- [ ] Verify styling is active
- [ ] Press `Ctrl+Shift+U` (Cmd+Shift+U on macOS)
- [ ] **VERIFY:** Styling is disabled for only this site
- [ ] Navigate to a different site
- [ ] **VERIFY:** That site still has styling applied
- [ ] Return to the first site
- [ ] **VERIFY:** It remains unstyle until you toggle it back on
- [ ] Press `Ctrl+Shift+U` on the first site again
- [ ] **VERIFY:** Styling is re-enabled for that site

### 3.4 Per-Site Toggle Persistence

- [ ] Navigate to a non-blocked website (e.g., example.com)
- [ ] Open the popup and enable/disable styling
- [ ] Note the current state
- [ ] Reload the page (`Ctrl+R`)
- [ ] **VERIFY:** The styling state persists - toggle state should be the same
- [ ] Close the tab
- [ ] Open a new tab and navigate to the same website
- [ ] **VERIFY:** The toggle state has been remembered

### 3.5 Options Page

- [ ] Click the plugin icon in the toolbar
- [ ] Right-click and select "Options"
- [ ] **VERIFY:** The options page loads without errors
- [ ] **VERIFY:** The page displays a list of sites
- [ ] **VERIFY:** Each site has a toggle button
- [ ] **VERIFY:** There is a "Reset to Defaults" button (if applicable)
- [ ] Close the options page

### 3.6 Per-Site Toggles in Options Page

- [ ] Open the Options page (right-click plugin → Options)
- [ ] Locate a website in the list
- [ ] Click the toggle to change its state
- [ ] **VERIFY:** The toggle updates in the options page
- [ ] Navigate to that website in a new tab
- [ ] **VERIFY:** The site's styling reflects the toggle state in the options page
- [ ] Return to Options and toggle it back
- [ ] Return to the website tab and reload (`Ctrl+R`)
- [ ] **VERIFY:** The styling now reflects the new toggle state

---

## 4. Test Cases for Color Palette Verification

When extension styling is active, verify the correct colors are applied.

### 4.1 Page Background Color

- [ ] Navigate to a styled website
- [ ] Open Firefox DevTools (`F12`)
- [ ] Right-click on the page background
- [ ] Select "Inspect" to see the computed styles
- [ ] **VERIFY:** The background color is `#dad7d0` (warm beige)
- [ ] Check multiple areas of the page to ensure consistency
- [ ] Close DevTools

### 4.2 Text Color

- [ ] On the same styled page, open DevTools (`F12`)
- [ ] Right-click on body text or a paragraph
- [ ] Select "Inspect"
- [ ] **VERIFY:** The text color is `#2a2520` (dark brown)
- [ ] Check different text elements (paragraphs, headings, etc.)
- [ ] All should use the dark brown color
- [ ] Close DevTools

### 4.3 Link Color

- [ ] On the styled page, find a hyperlink
- [ ] Open DevTools (`F12`)
- [ ] Right-click the link and select "Inspect"
- [ ] **VERIFY:** The link color is `#4a3728` (warm brown)
- [ ] Test multiple links on different pages
- [ ] Verify hover state is visually distinct but uses the same palette
- [ ] Close DevTools

### 4.4 Code Block Background

- [ ] Navigate to a website with code blocks (e.g., MDN documentation)
- [ ] Find a `<code>` or `<pre>` element
- [ ] Open DevTools (`F12`)
- [ ] Inspect the code block element
- [ ] **VERIFY:** The background color is `#bfb8b0` (lighter neutral tone)
- [ ] Verify the code text is readable against this background
- [ ] Test multiple code blocks
- [ ] Close DevTools

---

## 5. Test Cases for Font Verification

### 5.1 Font Family

- [ ] Navigate to a styled website
- [ ] Open DevTools (`F12`)
- [ ] Select the Elements/Inspector tab
- [ ] Right-click on text content
- [ ] Select "Inspect"
- [ ] In the DevTools Styles panel, look for the computed font-family
- [ ] **VERIFY:** The font family includes "JetBrains Mono"
- [ ] Check multiple elements to ensure consistency
- [ ] Close DevTools

### 5.2 Base Font Size (Desktop)

- [ ] Navigate to a styled website on desktop (window width > 768px)
- [ ] Open DevTools (`F12`)
- [ ] Right-click on body text
- [ ] Select "Inspect"
- [ ] In the Styles panel, verify the computed font size
- [ ] **VERIFY:** The base font size is `20px`
- [ ] Check the body element directly if possible
- [ ] Close DevTools

### 5.3 Font Size (Mobile - < 768px Width)

- [ ] Open DevTools (`F12`)
- [ ] Press `Ctrl+Shift+M` (or click the device toolbar icon) to enable mobile view
- [ ] Resize the viewport to less than 768px width
- [ ] Right-click on body text
- [ ] Select "Inspect"
- [ ] **VERIFY:** The computed font size is `18px`
- [ ] Check multiple text elements
- [ ] Close DevTools

### 5.4 Line Height

- [ ] Navigate to a styled website
- [ ] Open DevTools (`F12`)
- [ ] Right-click on text content
- [ ] Select "Inspect"
- [ ] In the Styles panel, look for the line-height property
- [ ] **VERIFY:** The line-height is `1.4`
- [ ] Verify the text is properly spaced and readable
- [ ] Check multiple sections of content
- [ ] Close DevTools

---

## 6. Edge Cases

### 6.1 Disable Global Toggle in Options Page

- [ ] Open the Options page
- [ ] Locate and click the "Global Toggle" or similar setting
- [ ] Disable the global plugin functionality
- [ ] Navigate to multiple websites
- [ ] **VERIFY:** NO sites are being styled, even those not on the never-style list
- [ ] Return to Options
- [ ] Re-enable the global toggle
- [ ] Navigate to multiple websites
- [ ] **VERIFY:** Styling is applied to all non-blocked sites again

### 6.2 Re-enable Extension After Disabling

- [ ] Disable the global toggle in Options
- [ ] Verify no styling is applied
- [ ] Re-enable the global toggle
- [ ] Reload all open website tabs
- [ ] **VERIFY:** Styling resumes correctly
- [ ] Verify per-site toggles still work

### 6.3 Reset to Defaults

- [ ] Open the Options page
- [ ] Manually toggle several sites on/off to create a custom configuration
- [ ] Click "Reset to Defaults" button
- [ ] Confirm the reset action in the dialog
- [ ] **VERIFY:** All settings return to their original state
- [ ] **VERIFY:** Never-style list sites remain blocked
- [ ] **VERIFY:** All other sites are set to be styled

### 6.4 Test on Various Website Types

Test the extension across different site categories:

- [ ] **News Site** (e.g., news.google.com, bbc.com)
  - [ ] Verify styling applies (unless on never-style list)
  - [ ] Verify readability with extended article text
  
- [ ] **Blog** (e.g., medium.com, any WordPress site)
  - [ ] Verify styling applies
  - [ ] Verify font renders properly for blog text
  
- [ ] **Documentation** (e.g., python.org, developer.mozilla.org)
  - [ ] Verify styling applies
  - [ ] Verify code blocks are visible with background color
  
- [ ] **E-commerce** (e.g., amazon.com, etsy.com)
  - [ ] Verify styling applies (unless blocked)
  - [ ] Verify product images and layouts remain functional

### 6.5 Test on HTTPS Pages

- [ ] Navigate to multiple HTTPS websites (https://example.com, https://wikipedia.org)
- [ ] **VERIFY:** Styling applies correctly
- [ ] Check the browser console for any security warnings
- [ ] Verify mixed-content issues don't prevent styling
- [ ] Test on both secure (green lock) and warning pages

### 6.6 Test on Localhost Development Sites

- [ ] Start a local development server (e.g., `localhost:3000`, `localhost:8000`)
- [ ] Navigate to the localhost site
- [ ] **VERIFY:** The extension styling applies
- [ ] Modify content and reload
- [ ] **VERIFY:** Styling persists on reload
- [ ] Test toggling the site on/off from the popup

---

## 7. Storage Persistence Test

### 7.1 Single Site Persistence

- [ ] Navigate to a non-blocked website (e.g., example.com)
- [ ] Open the plugin popup
- [ ] Note the current toggle state (enabled or disabled)
- [ ] Toggle the state to change it
- [ ] **VERIFY:** The change is applied immediately
- [ ] Close the browser completely (don't just close the tab)
- [ ] Reopen Firefox and navigate to the same website
- [ ] **VERIFY:** The toggle state has been remembered
- [ ] The styling reflects the saved state

### 7.2 Multiple Sites Persistence

- [ ] Navigate to Website A (e.g., wikipedia.org)
- [ ] Open the popup and toggle styling OFF
- [ ] Navigate to Website B (e.g., theverge.com)
- [ ] Open the popup and toggle styling ON
- [ ] Navigate to Website C (e.g., wired.com)
- [ ] Leave the popup toggle as-is (default state)
- [ ] Note the toggle states for all three sites
- [ ] Close the browser completely
- [ ] Reopen Firefox
- [ ] Navigate to Website A
- [ ] **VERIFY:** Styling is OFF
- [ ] Navigate to Website B
- [ ] **VERIFY:** Styling is ON
- [ ] Navigate to Website C
- [ ] **VERIFY:** It reflects the default/last state

### 7.3 Cross-Tab Persistence

- [ ] Open two tabs with different websites
- [ ] Tab 1: Navigate to example.com
- [ ] Tab 2: Navigate to wikipedia.org
- [ ] In Tab 1, open the popup and toggle styling OFF
- [ ] **VERIFY:** Tab 1 styling disappears
- [ ] Switch to Tab 2
- [ ] **VERIFY:** Tab 2 still has styling (unchanged)
- [ ] Open the popup in Tab 2 and toggle styling OFF
- [ ] Switch to Tab 1 and reload
- [ ] **VERIFY:** Tab 1 remains unstyled (persisted from Tab 1's toggle)
- [ ] Switch to Tab 2 and reload
- [ ] **VERIFY:** Tab 2 remains unstyled (persisted from Tab 2's toggle)

---

## Troubleshooting Tips

If any tests fail:

1. **Clear Plugin Storage**
   - Right-click the plugin icon
   - Click "Remove Extension"
   - Reload the plugin using `about:debugging#/runtime/this-firefox`
   - Re-run the failing test

2. **Check Browser Console**
   - Open DevTools (`F12`)
   - Go to the Console tab
   - Look for any errors related to the plugin
   - Note the error messages and context

3. **Check Plugin Errors**
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Find the plugin and check for any errors
   - Look in the plugin details for error messages

4. **Verify Manifest**
   - Ensure `manifest.json` is valid JSON
   - Check that all script paths exist
   - Verify permissions are correctly specified

5. **Reload Plugin**
   - Go to `about:debugging#/runtime/this-firefox`
   - Click the refresh icon next to the plugin
   - Or remove and reload the plugin

---

## Summary Checklist

Before considering testing complete, verify:

- [ ] All "never style" list sites are NOT being styled
- [ ] All other sites ARE being styled with correct colors
- [ ] All fonts are JetBrains Mono with correct sizes (20px desktop, 18px mobile)
- [ ] Popup toggle works correctly
- [ ] Keyboard shortcuts work (Ctrl+Shift+Y and Ctrl+Shift+U)
- [ ] Per-site preferences persist across page reloads
- [ ] Per-site preferences persist across browser sessions
- [ ] Options page functions correctly
- [ ] Reset to defaults works
- [ ] Plugin works on various site types
- [ ] Edge cases are handled properly

If all items are checked, the plugin is ready for release.
