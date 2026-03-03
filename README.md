# Latent Patterns

A Firefox WebExtension that applies a consistent, warm typography and color palette to websites for enhanced readability and comfortable reading experiences.

## Overview

Latent Patterns standardizes the visual presentation of web content by injecting a carefully curated design system. The plugin applies warm earth-tone colors and a monospace typeface across compatible websites, reducing visual fatigue and improving content legibility while preserving page functionality and layout integrity.

## Features

- **Per-site Control** - Enable or disable styling on individual sites with persistent preferences
- **Global Toggle** - Quickly disable/enable styling across all websites
- **Keyboard Shortcuts** - Fast access via configurable keyboard commands
- **Protected Sites** - Automatically respects restricted domains (GitHub, Google Docs, Gmail, etc.)
- **Non-destructive** - Preserves images, media, layouts, and interactive elements
- **Lightweight** - Minimal performance impact with efficient CSS injection

## Design System

### Typography
- **Font Family**: JetBrains Mono (monospace)
- **Base Size**: 20px (desktop), 18px (mobile)
- **Line Height**: 1.6

### Color Palette
| Element | Color | Usage |
|---------|-------|-------|
| Background | `#dad7d0` | Page background |
| Text | `#2a2520` | Primary content |
| Accent | `#4a3728` | Links and emphasis |
| Code | `#bfb8b0` | Code block backgrounds |
| Borders | `#b0a89e` | Dividers and separators |

## Installation

### Development Installation (Temporary)

1. Open `about:debugging#/runtime/this-firefox` in Firefox
2. Click **"Load Temporary Add-on"**
3. Navigate to and select `manifest.json` from this directory
4. The plugin will load and appear in your toolbar as "LP"

**Note:** Temporary installations unload on browser restart. Reload via `about:debugging` after restarting Firefox.

### Production Installation

To install a signed version from Mozilla Add-ons:
1. Visit [Latent Patterns on Firefox Add-ons](https://addons.mozilla.org/) (when available)
2. Click "Add to Firefox"
3. Click "Add" to confirm

## Usage

### Popup Interface

Click the **LP** icon in your toolbar to:
- View the current site status
- Toggle styling on/off for the current site
- Access keyboard shortcut information
- Open the settings page

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+Y` (or `Cmd+Shift+Y` on macOS) | Toggle plugin globally |
| `Ctrl+Shift+U` (or `Cmd+Shift+U` on macOS) | Toggle styling on current site |

### Settings

Right-click the LP icon and select **"Options"** to:
- View per-site preferences
- Manage the "never style" list
- Reset to default settings

## Architecture

### Project Structure

```
latent-patterns-plugin/
├── manifest.json              # WebExtension configuration
├── src/
│   ├── background/
│   │   ├── background.js      # Extension logic & message handling
│   │   ├── service-worker.js  # Alternative service worker (legacy)
│   │   └── check-css.js       # CSS validation utilities
│   ├── popup/
│   │   ├── popup.html         # Popup interface
│   │   ├── popup.js           # Popup interaction logic
│   │   └── popup.css          # Popup styles
│   ├── options/
│   │   ├── options.html       # Settings page
│   │   ├── options.js         # Settings logic
│   │   └── options.css        # Settings styles
│   ├── content/
│   │   └── content.js         # Content script for page integration
│   ├── styles/
│   │   └── universal-theme.css # Core theme stylesheet
│   └── utils/
│       ├── storage.js         # Storage abstraction layer
│       └── browser-api.js     # Browser API compatibility (if needed)
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   ├── icon-128.png
│   └── icon-256.png
├── docs/
│   ├── TESTING.md             # Comprehensive testing guide
│   └── DEPLOYMENT.md          # Distribution and signing guide
└── README.md                  # This file
```

### Key Components

**manifest.json** - Declares permissions, content scripts, background scripts, keyboard shortcuts, and plugin metadata.

**src/background/background.js** - Manages state, storage, keyboard commands, and CSS injection/removal via `browser.tabs` API.

**src/content/content.js** - Runs on target pages to coordinate styling and communicate with background script.

**src/popup/** - User-facing interface for quick site-specific toggle and settings access.

**src/options/** - Configuration panel for managing global settings and per-site preferences.

**src/styles/universal-theme.css** - Core stylesheet defining the color palette and typography applied to all styled sites.

## Compatible Sites

The plugin works on most standard websites. It is **intentionally restricted** on:

- `github.com` - Development collaboration
- `docs.google.com` - Document collaboration
- `mail.google.com` - Email and messaging
- `twitter.com` / `x.com` - Social media
- `figma.com` - Design tools
- `notion.so` - Productivity tools

These restrictions exist to preserve the native functionality and security of these platforms.

## Development

### Prerequisites

- Firefox Browser (version 60+)
- Text editor or IDE
- Basic understanding of HTML, CSS, and JavaScript

### Making Changes

1. Edit files in `src/` directory
2. Reload the plugin via `about:debugging`
3. Test changes on various websites
4. Review `docs/TESTING.md` for comprehensive test procedures

### Testing Checklist

- [ ] Popup opens and displays correctly
- [ ] Toggle switches work on styled sites
- [ ] Keyboard shortcuts function properly
- [ ] Settings persist across page reloads
- [ ] Colors render correctly (inspect with DevTools)
- [ ] Protected sites remain unstyled
- [ ] No console errors in Firefox DevTools

For detailed testing procedures, see `docs/TESTING.md`.

## Distribution

### Signing for Firefox Add-ons

To distribute via Mozilla Add-ons:

1. Create a Mozilla Developer account at https://addons.mozilla.org/developers/
2. Package the plugin: `zip -r latent-patterns-plugin.zip src/ manifest.json icons/`
3. Submit for review via the developer dashboard
4. Download the signed `.xpi` file upon approval
5. Users can install from Firefox Add-ons with automatic updates

See `docs/DEPLOYMENT.md` for detailed distribution instructions.

## Technical Specifications

- **Manifest Version**: 2 (WebExtensions standard)
- **Browser Target**: Firefox 60+
- **Permissions**: `storage`, `tabs`, `activeTab`, `<all_urls>`
- **Content Scripts**: Matches `<all_urls>` with document start injection

## Limitations

- Does not work on restricted domains (by design)
- Cannot override browser UI or system elements
- CSS injection respects Firefox's content security policy
- Temporary installations require reload after browser restart

## Performance

- Minimal memory footprint (CSS-only injection, no DOM mutation)
- Fast toggle response (<100ms)
- Efficient storage queries (indexed by hostname)
- No external dependencies

## Contributing

To contribute improvements:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add feature description"`
5. Push and create a pull request

## License

This project is open source. See LICENSE file for details.

## Support

For issues, feature requests, or questions:
- Open an issue on [GitHub Issues](https://github.com/kurtisjunior/latent-patterns-plugin/issues)
- Check existing issues for similar questions
- Review `docs/TESTING.md` for troubleshooting

## Version History

**v1.0.0** - Initial release
- Core functionality: Per-site styling toggle
- Global enable/disable
- Keyboard shortcuts
- Settings persistence
- Never-style list for protected sites
