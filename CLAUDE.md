# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension that generates Git branch names based on GitHub issue and pull request pages. It creates branch names following the format: `<nickname>/<type>/<issue-number>-<short-description>`. The extension supports both GitHub Issues and Pull Requests, with AI-powered concise descriptions via the Gemini API and auto-generation when the popup opens.

## Repository Links

- **GitHub Repository**: https://github.com/jtsternberg/github-branch-generator

## Architecture

This is a Chrome Manifest V3 extension built with Vite. File structure:

```
├── src/                    # Source files for development
│   ├── content.js         # Main branch generation logic
│   ├── gemini-api.js      # AI integration (ES6 module)
│   ├── background.js      # Service worker
│   └── popup.js           # Popup interface logic
├── dist/                  # Built files (auto-generated)
│   ├── content-bundle.iife.js  # Bundled content script
│   ├── background.js      # Simple service worker
│   └── popup.js          # Popup script
├── popup.html            # Popup interface
├── manifest.json         # Extension configuration
└── images/              # Extension icons
```

**Key Files:**
- **manifest.json**: Chrome extension configuration with permissions for `storage`, `activeTab`, `scripting`, and host permissions for Gemini API
- **dist/background.js**: Service worker that injects the bundled content script when extension is triggered
- **src/content.js**: Main functionality that extracts issue/PR data and generates branch names
- **src/gemini-api.js**: Gemini API integration for generating concise branch descriptions
- **popup.html/src/popup.js**: Configuration interface with auto-generation and API key management

## Key Components

### Branch Name Generation Logic (src/content.js)
- **Multi-page Support**: Works on both GitHub Issues (`/issues/123`) and Pull Requests (`/pull/456`)
- **Robust Selectors**: Multiple fallback selectors for title extraction to handle different GitHub page layouts
- **Smart Type Detection**:
  - PRs default to `feature`, Issues default to `change`
  - Extracts from issue type containers or labels
  - Maps to: bug, feature, hotfix, change, chore, wip
- **AI Integration**: Attempts Gemini API generation first, falls back to slugify method
- **User Preferences**: Stores nickname in localStorage for reuse
- **Error Handling**: Shows helpful alerts if page elements not found

### AI Description Generation (gemini-api.js)
- Uses Gemini 1.5 Flash model for generating concise branch descriptions
- Prompts AI to create 4-5 word kebab-case descriptions
- Falls back gracefully if API call fails
- Requires API key stored in Chrome extension storage

### Clipboard Integration (content.js:65-73)
Uses legacy `document.execCommand('copy')` method with temporary textarea element for reliable clipboard access in extension context.

### Configuration Interface (popup.html/src/popup.js)
- **Auto-generation**: Automatically generates branch name when popup opens (no button click needed)
- **API Key Management**: Secure storage in Chrome's sync storage with masked input
- **Dark Mode Support**: Respects system dark/light mode preferences
- **Loading States**: Shows spinner and progress messages during AI generation
- **Result Display**: Shows generated branch name with dedicated copy button
- **Manual Regeneration**: "Regenerate" button for trying again with different results

## Development Commands

This extension uses a Vite build system for development:

1. Make changes to files in `src/`
2. Run `npm run build` to build to `dist/`
3. Go to `chrome://extensions/` and click "Reload" under the extension
4. Alternative: `npm run dev` for watch mode during development

## Code Quality Guidelines

### DRY Principle (Don't Repeat Yourself)
Always check for code duplication when adding new features:
- If similar logic exists elsewhere, extract it to a shared function
- Common areas for duplication: API calls, DOM manipulation, validation logic
- Example: The `generateBranchName()` function in popup.js is shared between auto-generation and manual regeneration

### Refactoring Checklist
- Look for duplicate code patterns across files
- Extract common functionality into reusable functions
- Maintain single source of truth for business logic
- Keep functions focused on single responsibilities

## Installation for Development

1. Clone repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select this directory

## Configuration

### Gemini API Setup
1. Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click extension icon to open configuration popup
3. Enter API key and save settings
4. API key is stored in Chrome's sync storage


## Testing

### Basic Functionality
1. **GitHub Issues**: Navigate to any GitHub issue page (`/issues/123`)
2. **GitHub PRs**: Navigate to any GitHub pull request page (`/pull/456`)
3. **Auto-generation**: Click extension icon → should auto-generate immediately
4. **Multi-tab**: Test in multiple tabs simultaneously (should work independently)

### Expected Behavior
- **Immediate generation**: Branch name appears in popup without button clicks
- **Clipboard copy**: Branch name automatically copied to clipboard
- **Result display**: Branch name shown in popup with copy button for manual copying
- **Loading states**: Spinner and progress messages during AI generation

### Console Debugging
Check browser console for:
- Green text on black background: Final branch name result
- Error messages if selectors fail or API issues occur

### API Testing
- **With API key**: Should show "Generating with AI..." and produce concise descriptions
- **Without API key**: Should show "Generating..." and use fallback slugify method

## GitHub Selectors

The extension uses multiple fallback selectors to be resilient to GitHub UI changes:

### Title Selectors (in order of preference)
- `[data-testid="issue-title"]` - Modern GitHub issues
- `.js-issue-title` - Legacy selector
- `h1[data-testid="pr-title"]` - Pull request titles
- `.js-issue-title-container .js-issue-title` - Alternative layout
- `h1.gh-header-title .js-issue-title` - Header variations

### Label Selectors (tried in order)
- `[data-testid="issue-labels"] a[href*="/labels/"]` - Modern labels
- `.sidebar-labels a[href*="/labels/"]` - Sidebar labels
- `.labels a[href*="/labels/"]` - General labels
- `[data-testid="issue-labels"] [href*="/labels/"]` - Fallback

**Maintenance Note**: If GitHub updates their UI and selectors break, add new selectors to the fallback arrays in `src/content.js`.

## API Integration

### Gemini API Configuration
- **Model**: `gemini-1.5-flash-latest` (fastest available)
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`
- **Parameters**:
  - Temperature: 0.1 (very deterministic)
  - MaxTokens: 30 (concise responses)
  - TopK/TopP: Reduced for faster processing
- **Timeout Handling**: Shows progressive status messages at 3s and 8s intervals
- **Error Handling**: Graceful fallback to slugify method on API failures

## Git Best Practices

- Never use `git add .` or `git add -A` - hand-pick files for staging, e.g. `git add file1.js file2.js`