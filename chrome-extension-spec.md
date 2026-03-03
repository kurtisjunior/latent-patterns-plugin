# Firefox Plugin Specification: Universal Site Styling

## Project Overview
A Firefox plugin that applies a consistent typography and color palette to websites so reading feels comfortable and standardized regardless of the original site design.

**What This Plugin Does**: Click a button in the plugin popup, and the current page switches to warm earth-tone typography and colors. Your preference is remembered per site.

**What This Plugin Cannot Do (By Design)**: 
- Silently change every tab without user action
- Read private data by default
- Bypass Firefox security rules

MVP behavior is click-to-apply: the plugin only styles the current tab after a user action (popup toggle or keyboard shortcut). Per-site preferences persist by hostname.

## Design System

### Typography
- **Primary Font**: JetBrains Mono (monospace)
- **Base Font Size**: 20px (18px on mobile)
- **Line Height**: 1.4 (unitless)
- **Character Grid**: 1ch × 1.40rem
- **Maximum Line Width**: 80 characters (future; not applied in MVP)

### Color Palette (Warm Earth Tones)

| Element | Hex | Usage |
|---------|-----|-------|
| Page Background | #dad7d0 | Main background |
| Primary Text | #2a2520 | Body text |
| Muted/Secondary Text | #6b6560 | Secondary content |
| Accent/Links | #4a3728 | Links |
| Link Hover | #2a1a0e | Link hover state |
| Surface/Cards | #c8c2bb | Cards, containers |
| Code Block Background | #bfb8b0 | Code blocks |
| Borders | #b0a89e | Dividers, borders |

### Syntax Highlighting (for code blocks)

| Element | Hex |
|---------|-----|
| Keywords, Storage (bold) | #2a2520 |
| Types, Classes, Variables | #3d2b1f |
| Functions, Entities, Properties | #4a3728 |
| Strings | #5c3317 |
| Numbers, Constants, Attributes | #6b4226 |
| Comments (italic), Operators | #6b6560 |

## Core Features

### 1. Global Style Application
- **Functionality**: Inject a CSS stylesheet into the active tab to override global styles
- **Default Scope (MVP)**: Only the active tab after a user action (click-to-apply)
- **Toggles (MVP)**: Enable/disable globally and enable/disable on the current site
- **Persistence (MVP)**: Remember per-site preferences by exact hostname
- **Auto-Apply (Optional)**: If the user grants host access for a site, automatically re-apply on future visits to that hostname via background script

### 2. Style Rules to Override
The extension should override:
- Background colors
- Text colors
- Link colors and hover states
- Font family and sizing
- Line height and spacing
- Code block styling
- Heading styles (normalize to primary text color)
- Button styles
- Form elements (input, textarea, select)
- Borders and dividers

MVP focuses on typography + page/background/text/link/code defaults first, and keeps form/button overrides conservative to avoid breaking usability.

### 3. Preservation Strategies
- **Images**: Keep original images (only style the backgrounds/containers)
- **Media**: Preserve video and audio content
- **Layout**: Maintain page structure and layout
- **Interactive Elements**: Preserve functionality of buttons, links, and forms

MVP explicitly avoids global styling of `img`, `video`, `audio`, `iframe`, `canvas`, and `svg` (no forced filters; no global fill/stroke overrides).

MVP includes a small built-in "never style" host list for common web apps that don't need styling.

### 4. Extension Settings
- **Global Toggle**: Enable/disable extension entirely
- **Per-Site Settings**: 
   - Enable/disable on specific domain
   - Adjust brightness (future)
   - Adjust contrast (future)
- **Font Size Override**: Allow users to adjust base font size (future)
- **Line Height Adjustment**: Allow fine-tuning of line height (future)

## User Interface

### Popup (Plugin Icon Click)
- Toggle plugin on/off globally (MVP)
- Toggle on/off for current site (MVP)
- Quick access to settings (options page)
- Keyboard shortcut hint

### Options Page
- Enable/disable globally (MVP)
- Explain click-to-apply behavior + how to grant site access for auto-apply (MVP)
- Show keyboard shortcuts (MVP)
- Manage site whitelist/blacklist (future)
- Font size adjustment slider (future)
- Line height adjustment slider (future)
- Color palette customization (future)
- About and keyboard shortcuts

### Keyboard Shortcuts
- `Ctrl+Shift+Y` (or `Cmd+Shift+Y` on Mac): Toggle extension globally
- `Ctrl+Shift+U` (or `Cmd+Shift+U` on Mac): Toggle on current site

## Technical Architecture

### The Three Core Pieces (Beginner Breakdown)

Think of your plugin like a tiny remote control with three parts:

1. **Manifest (manifest.json)** — Says what your plugin is and what it's allowed to do
2. **Popup (popup.html + popup.js)** — The little interface you click (the button)
3. **Background Script (background.js)** — The brain that actually changes the page

### Files Structure
```
firefox-plugin/
├── manifest.json                    ← Describes the plugin
├── src/
│   ├── popup/
│   │   ├── popup.html             ← The button you click
│   │   ├── popup.css
│   │   └── popup.js               ← What happens when you click
│   ├── options/
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.js
│   ├── background/
│   │   └── background.js          ← The brain (handles logic + storage)
│   ├── content/
│   │   └── content.js             ← Runs on page to apply styles
│   ├── styles/
│   │   └── universal-theme.css    ← The actual colors and fonts
│   └── utils/
│       └── storage.js             ← Helpers for remembering settings
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   ├── icon-128.png
│   └── icon-256.png
└── README.md
```

### Key Components

#### manifest.json (The Contract)
**Plain English**: This file tells Firefox what your plugin does and what permissions it needs.

- **Manifest V2 format** (stable WebExtensions standard)
- **Permissions (MVP)**: 
  - `storage` → Remember user settings
  - `tabs` → Access tab information
  - `activeTab` → Access the tab you're viewing
  - `<all_urls>` → Apply content scripts to all sites
- **Host permissions (MVP)**: Configured via `<all_urls>` for click-to-apply security model
- **Commands**: Define keyboard shortcuts (`Ctrl+Shift+Y` and `Ctrl+Shift+U`)

#### CSS Injection (The Page Changer)
**Plain English**: This is how the plugin actually changes colors and fonts on the page.

- Use `browser.tabs.insertCSS` to add the theme to the active tab
- Use `browser.tabs.removeCSS` to remove it
- Triggered by: popup toggles + keyboard shortcuts + content script messaging
- If user grants host access, background script re-applies on future visits

#### Background Script (background.js) (The Brain)
**Plain English**: This runs in the background and handles all the logic.

- Stores and reads settings from Firefox Storage
- Implements toggles (global on/off + per-site on/off)
- Listens for keyboard shortcuts
- Performs CSS insert/remove using `browser.tabs.insertCSS/removeCSS`
- Enforces the "never style" host list
- Listens for popup messages and responds
- Coordinates with content scripts

#### Popup UI (popup.html + popup.js) (The Button)
**Plain English**: This is the little panel that opens when you click the plugin icon.

**Shows**:
- Current plugin status (enabled/disabled)
- Toggle for current site
- Quick link to settings/options

**Actions**:
- Click toggle → Send message to background script
- Background script applies or removes CSS
- Page changes immediately

#### Options Page (options.html + options.js) (The Settings)
**Plain English**: This is where users can customize preferences.

- Enable/disable globally
- View per-site settings
- Save/load user preferences
- Explain how to grant host access for auto-apply
- Show keyboard shortcuts

## How the Pieces Talk to Each Other (Message Flow)

```
User clicks popup toggle
         ↓
popup.js sends message: "toggle current site"
         ↓
background.js receives message
         ↓
background.js checks: Is this site in "never style" list?
         ↓
If NO → background.js runs browser.tabs.insertCSS
If YES → background.js runs browser.tabs.removeCSS
         ↓
CSS is added/removed from the active tab
         ↓
Page colors and fonts change immediately
         ↓
background.js saves preference to Firefox Storage
         ↓
Next time you visit this site, setting is remembered
```

**Keyboard Shortcut Flow** (Same, but triggered by `browser.commands.onCommand` instead of popup click)

## CSS Strategy

### universal-theme.css
- Start with minimal, safe overrides; use `!important` sparingly and only for core typography/colors
- CSS custom properties (variables) for colors and typography
- Media query support for mobile (`@media (max-width: 480px)`)
- Supports dark system theme consideration (optional feature)

MVP explicitly does not enforce an 80ch max line width.

## Storage
- **Firefox Storage API**: Persistent storage of user preferences
- **Data (MVP)**:
  - `enabledGlobal: boolean`
  - `siteEnabled: { [hostname: string]: boolean }` (exact hostname match)
  - `neverStyleHosts: string[]` (built-in defaults; user override/editing is future)
- **Data (Future)**: font size, line height, palette customization, import/export

Precedence (MVP):
1) If hostname is in `neverStyleHosts`, do not style.
2) If `enabledGlobal` is false, do not style.
3) Otherwise, style if `siteEnabled[hostname]` is true.

## Built-in "Never Style" Host List (MVP)

The following hosts should never be styled by default:
- `docs.google.com` (Google Docs)
- `mail.google.com` (Gmail)
- `github.com` (GitHub)
- `twitter.com` (Twitter/X)
- `figma.com` (Figma)
- `notion.so` (Notion)

## Form & Button Override Rules (MVP)

Form and button styling should follow these conservative rules:
- Override text color to primary text color (`#2a2520`)
- Override background color to surface color (`#c8c2bb`)
- Override border color to borders color (`#b0a89e`)
- **Do NOT** override:
  - Padding or margin
  - Border radius or border width
  - Box shadows
  - Opacity or visibility
  - Position or display properties

## Mobile Font Size Breakpoint (MVP)

- **Base Font Size**: 20px for screens wider than 768px
- **Mobile Font Size**: 18px for screens 768px and narrower
- **Media Query**: `@media (max-width: 768px) { /* 18px rules */ }`

## CSS Injection Strategy (MVP)

**Example rules to inject:**

```css
:root {
  --site-bg: #dad7d0;
  --site-text: #2a2520;
  --site-secondary: #6b6560;
  --site-link: #4a3728;
  --site-code-bg: #bfb8b0;
}

body, html {
  background-color: var(--site-bg) !important;
  color: var(--site-text) !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 20px !important;
  line-height: 1.4 !important;
}

a {
  color: var(--site-link) !important;
}

a:hover {
  color: #2a1a0e !important;
}

code, pre {
  background-color: var(--site-code-bg) !important;
  color: var(--site-text) !important;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--site-text) !important;
}
```

**Rollback Strategy**: If a site breaks after styling, users can:
1. Use the popup toggle to disable styling for that site (stored in `siteEnabled`)
2. The hostname is automatically added to a local "disabled sites" list for future sessions

## Future Enhancements
1. Custom color palette creator
2. Multiple theme presets
3. Time-based automatic activation (late night mode)
4. Reading list/saved articles with guaranteed styling
5. Export/import user settings
6. Sync settings across devices
7. Analytics on most-visited sites
8. Accessibility options (increased contrast, larger fonts)
9. Preview mode before committing styling to a site
10. User-editable "never style" host list

## Browser Compatibility
- Chrome/Chromium (primary)
- Edge (should work with same extension)
- Opera (should work with same extension)

## Performance Considerations
- Lazy load settings from storage
- Minimize CSS specificity battles
- Use efficient selectors to avoid layout thrashing
- Avoid long-lived observers in MVP; add MutationObserver only if needed for specific sites

## Implementation Priority (Recommended Order)

If you are new to extension development, build in this order:

1. **Create folder structure and manifest.json**
   - Learn: What permissions mean
   - Test: Can you load the extension in Chrome?

2. **Build the popup (popup.html + popup.js)**
   - Learn: Basic HTML/CSS, how to send messages from popup
   - Test: Does the popup open when you click the icon?

3. **Build the service worker (service-worker.js)**
   - Learn: chrome.storage API, message listeners, chrome.scripting API
   - Test: Can you log messages and toggle the extension?

4. **Create universal-theme.css**
   - Learn: CSS custom properties, !important usage, mobile media queries
   - Test: Does the CSS inject and remove correctly?

5. **Add storage and persistence (storage.js)**
   - Learn: How to save/load hostname preferences
   - Test: Does the setting persist across page reloads?

6. **Add keyboard shortcuts (commands in manifest)**
   - Learn: chrome.commands.onCommand listener
   - Test: Do Ctrl+Shift+Y and Ctrl+Shift+U work?

7. **Build options page (optional for MVP)**
   - Learn: How to explain settings to users
   - Enhance: Global enable/disable, view which sites are enabled

8. **Test against "never style" list**
   - Learn: Hostname extraction and list checking logic
   - Test: Does Gmail, Google Docs, etc. get skipped?

## Key Words (Learning Glossary)

- **Plugin/Add-on**: A mini app that runs inside Firefox
- **Manifest**: A JSON file describing what your plugin is and what it can do
- **Popup**: The small panel that opens when you click the plugin icon
- **Background Script**: Background script that handles plugin logic and storage
- **Content Script**: Scripts that run on the webpage itself
- **Permission**: A rule that says what your plugin is allowed to do (e.g., `activeTab`, `tabs`, `storage`, `<all_urls>`)
- **browser.tabs**: Firefox API for manipulating tabs and injecting CSS/scripts
- **browser.storage**: Firefox API for saving/loading user preferences
- **browser.commands**: Firefox API for handling keyboard shortcuts
- **Message Passing**: How popup and background script communicate

**Note**: You do not need to memorize everything. You will learn these words by using them.
