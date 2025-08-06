# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension that generates Git branch names based on GitHub issue pages. It creates branch names following the format: `<nickname>/<type>/<issue-number>-<short-description>`. The extension now supports AI-powered concise descriptions via the Gemini API.

## Architecture

This is a Chrome Manifest V3 extension with the following key files:

- **manifest.json**: Chrome extension configuration with permissions for `storage`, `activeTab`, `scripting`, and host permissions for Gemini API
- **background.js**: Service worker that injects both gemini-api.js and content.js when extension is triggered
- **content.js**: Main functionality that extracts issue data and generates branch names
- **gemini-api.js**: Gemini API integration for generating concise branch descriptions
- **popup.html/popup.js**: Configuration interface for API key management and manual branch generation
- **images/**: Extension icons in 16px, 48px, and 128px sizes

## Key Components

### Branch Name Generation Logic (content.js:76-135)
- Extracts issue number from URL pathname
- Gets issue title from `[data-testid="issue-title"]` selector
- Determines issue type from either:
  - Issue type containers: `[data-testid="issue-type-container"] a`
  - Issue labels: `[data-testid="issue-labels"] [href^="https://github.com/awesomemotive/lindris-site/labels/"]`
- Maps types to: bug, feature, hotfix, change, chore, wip (defaults to 'change')
- Attempts AI-powered description generation via Gemini API if API key is configured
- Falls back to original slugify method if AI generation fails or no API key
- Stores user nickname in localStorage

### AI Description Generation (gemini-api.js)
- Uses Gemini 1.5 Flash model for generating concise branch descriptions
- Prompts AI to create 4-5 word kebab-case descriptions
- Falls back gracefully if API call fails
- Requires API key stored in Chrome extension storage

### Clipboard Integration (content.js:65-73)
Uses legacy `document.execCommand('copy')` method with temporary textarea element for reliable clipboard access in extension context.

### Configuration Interface (popup.html/popup.js)
- Allows users to configure Gemini API key
- Stores API key securely in Chrome's sync storage
- Provides manual branch generation button
- Shows status messages for user feedback

## Development Commands

This extension has no build process - it's vanilla JavaScript that loads directly in Chrome:

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click "Reload" under the extension

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

Test by:
1. Opening any GitHub issue page
2. Clicking the extension icon (direct generation) or using popup interface
3. Verifying branch name is generated and copied to clipboard
4. Checking console for:
   - Blue italic text: "Trying AI description generation..."
   - Orange italic text: "Using fallback slugify method"
   - Green text on black background: Final branch name result

## GitHub Selectors

The extension relies on specific GitHub DOM selectors that may change:
- Issue title: `[data-testid="issue-title"]`
- Issue types: `[data-testid="issue-type-container"] a` 
- Issue labels: `[data-testid="issue-labels"] [href^="https://github.com/awesomemotive/lindris-site/labels/"]`

If GitHub updates their UI, these selectors may need updating.

## API Integration

### Gemini API Endpoint
- Uses `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`
- Configured with low temperature (0.3) for consistent output
- 50 token limit for concise responses
- Includes error handling and fallbacks