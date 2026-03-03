# Site Styling Firefox Plugin

A Firefox browser plugin that applies consistent typography and colors to websites for comfortable reading.

## Features

- Popup interface for quick access
- Options page for configuration
- Background script for handling requests
- Keyboard shortcuts:
  - `Ctrl+Shift+Y` - Global toggle
  - `Ctrl+Shift+U` - Site toggle

## Project Structure

```
firefox-plugin/
├── manifest.json          # Plugin configuration
├── src/
│   ├── popup/            # Popup UI
│   ├── options/          # Options page
│   ├── background/       # Background script
│   ├── content/          # Content scripts
│   ├── styles/           # Shared styles
│   └── utils/            # Utility functions
├── icons/                # Plugin icons
└── README.md             # This file
```

## Installation

1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from the `firefox-plugin` folder

## Development

- Edit files in the `src/` directory
- Use `browser.storage` API for persistent data
- Use `browser.commands` API for keyboard shortcuts
- Icons should be PNG format (16x16, 48x48, 128x128, 256x256)

## Manifest V2 Highlights

- Uses `background.scripts` for background tasks
- `permissions` for content script injection
- Standard WebExtensions APIs for Firefox
