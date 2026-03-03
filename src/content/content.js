/**
 * Content Script for Firefox
 * Runs on every page and handles CSS injection/removal
 */

// Cross-browser API handle (Firefox uses `browser`, Chrome uses `chrome`)
const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

// Listen for messages from background script
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('🎨 [CONTENT SCRIPT] Received message:', request.action);
    
    if (request.action === 'applyCSS') {
        console.log('🎨 [CONTENT SCRIPT] Applying CSS...');
        applyCSS();
        console.log('🎨 [CONTENT SCRIPT] CSS applied, sending response');
        sendResponse({ success: true });
    } else if (request.action === 'removeCSS') {
        console.log('🎨 [CONTENT SCRIPT] Removing CSS...');
        removeCSS();
        console.log('🎨 [CONTENT SCRIPT] CSS removed, sending response');
        sendResponse({ success: true });
    }
    
    return true;
});

// Log that content script is active
console.log('🎨 [CONTENT SCRIPT] Loaded and ready');

/**
 * Apply CSS by injecting a style element
 */
function applyCSS() {
    console.log('🎨 [APPLY] Starting CSS application');
    
    // Check if already applied
    const existing = document.getElementById('site-styling-css');
    if (existing) {
        console.log('🎨 [APPLY] CSS already applied - skipping');
        return;
    }
    
    console.log('🎨 [APPLY] No existing style found - creating new one');
    
    // Create style element
    const style = document.createElement('style');
    style.id = 'site-styling-css';
    
    // CSS content
    // User expectation: toggling ON should visibly change typography.
    style.textContent = `
    :root {
      --page-bg: #dad7d0;
      --primary-text: #2a2520;
      --muted-text: #6b6560;
      --accent: #4a3728;
      --link-hover: #2a1a0e;
      --code-bg: #bfb8b0;
      --border: #b0a89e;
      --font-family: "JetBrains Mono", "Monaco", monospace;
      --base-font-size: 16px;
      --line-height: 1.6;
    }

    html, body {
      background-color: var(--page-bg) !important;
      color: var(--primary-text) !important;
      font-family: var(--font-family) !important;
      font-size: var(--base-font-size) !important;
      line-height: var(--line-height) !important;
    }

    /*
      Keep styling non-destructive:
      - Don't set fonts on layout containers (avoids changing widths based on ch/em units)
      - Don't change spacing/box styles
      - Apply font + text colors only inside likely reading/content areas
    */

    article,
    [itemprop="articleBody"],
    .entry-content,
    .post-content,
    .markdown-body,
    .prose {
      color: var(--primary-text) !important;
    }

    article p,
    article li,
    article dt,
    article dd,
    article blockquote,
    article figcaption,
    article caption,
    article th,
    article td,
    article a,
    article h1,
    article h2,
    article h3,
    article h4,
    article h5,
    article h6,
    [itemprop="articleBody"] p,
    [itemprop="articleBody"] li,
    [itemprop="articleBody"] dt,
    [itemprop="articleBody"] dd,
    [itemprop="articleBody"] blockquote,
    [itemprop="articleBody"] figcaption,
    [itemprop="articleBody"] caption,
    [itemprop="articleBody"] th,
    [itemprop="articleBody"] td,
    [itemprop="articleBody"] a,
    [itemprop="articleBody"] h1,
    [itemprop="articleBody"] h2,
    [itemprop="articleBody"] h3,
    [itemprop="articleBody"] h4,
    [itemprop="articleBody"] h5,
    [itemprop="articleBody"] h6,
    .entry-content p,
    .entry-content li,
    .entry-content dt,
    .entry-content dd,
    .entry-content blockquote,
    .entry-content figcaption,
    .entry-content caption,
    .entry-content th,
    .entry-content td,
    .entry-content a,
    .entry-content h1,
    .entry-content h2,
    .entry-content h3,
    .entry-content h4,
    .entry-content h5,
    .entry-content h6,
    .post-content p,
    .post-content li,
    .post-content dt,
    .post-content dd,
    .post-content blockquote,
    .post-content figcaption,
    .post-content caption,
    .post-content th,
    .post-content td,
    .post-content a,
    .post-content h1,
    .post-content h2,
    .post-content h3,
    .post-content h4,
    .post-content h5,
    .post-content h6,
    .markdown-body p,
    .markdown-body li,
    .markdown-body dt,
    .markdown-body dd,
    .markdown-body blockquote,
    .markdown-body figcaption,
    .markdown-body caption,
    .markdown-body th,
    .markdown-body td,
    .markdown-body a,
    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3,
    .markdown-body h4,
    .markdown-body h5,
    .markdown-body h6,
    .prose p,
    .prose li,
    .prose dt,
    .prose dd,
    .prose blockquote,
    .prose figcaption,
    .prose caption,
    .prose th,
    .prose td,
    .prose a,
    .prose h1,
    .prose h2,
    .prose h3,
    .prose h4,
    .prose h5,
    .prose h6 {
      font-family: var(--font-family) !important;
    }

    pre {
      background-color: var(--code-bg) !important;
      padding: 12px !important;
      border: 1px solid var(--border) !important;
      border-radius: 4px !important;
      overflow-x: auto !important;
      color: inherit !important;
      font-family: var(--font-family) !important;
    }

    code {
      background-color: rgba(0, 0, 0, 0.05) !important;
      padding: 2px 6px !important;
      border-radius: 2px !important;
      font-family: var(--font-family) !important;
    }

    pre code {
      background-color: transparent !important;
      color: inherit !important;
      padding: 0 !important;
      border-radius: 0 !important;
    }
    `;
    
    try {
        document.head.appendChild(style);
        console.log('🎨 [APPLY] ✅ CSS successfully added to document');
        console.log('🎨 [APPLY] Style element ID:', style.id);
    } catch (error) {
        console.error('🎨 [APPLY] ❌ Error appending style:', error);
    }
}

/**
 * Remove CSS by removing the style element
 */
function removeCSS() {
    console.log('🎨 [REMOVE] Starting CSS removal');
    
    const style = document.getElementById('site-styling-css');
    if (style) {
        try {
            style.remove();
            console.log('🎨 [REMOVE] ✅ CSS successfully removed from document');
        } catch (error) {
            console.error('🎨 [REMOVE] ❌ Error removing style:', error);
        }
    } else {
        console.log('🎨 [REMOVE] ⚠️  CSS element not found - nothing to remove');
    }
}
