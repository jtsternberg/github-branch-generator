# Git Branch Name Generator Extension

A simple Chrome extension that generates a Git branch name based on the current GitHub issue page and copies it to the clipboard. The branch name is generated following a specific format using your nickname, issue type, issue number, and a slugified version of the issue title.

This extension was created with the help of ChatGPT (specifically ChatGPT 4o using the MacOs version of ChatGPT). Checkout [ChatGPT-Prompt.md](ChatGPT-Prompt.md) which documents the prompts used to generate the extension, as a learning resource for developers.

## Features

- Generates a branch name in the format: `<nickname>/<type>/<issue-number>-<short-description>`
- Automatically copies the generated branch name to the clipboard
- Single-click operation by clicking the extension icon

## Installation

1. Clone or download this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click "Load unpacked" and select the directory where you cloned or downloaded this repository.

## Usage

1. Open a GitHub issue page.
2. Click the extension icon.
3. The branch name will be generated and copied to your clipboard.

## Directory Structure

```
github-branch-generator/
    ├── manifest.json
    ├── background.js
    ├── content.js
    └── images/
        ├── icon16.png
        ├── icon48.png
        └── icon128.png
```

## Files

- **manifest.json**: Configuration file for the Chrome extension.
- **background.js**: Background script that listens for the extension icon click and injects the content script.
- **content.js**: Content script that generates the branch name and copies it to the clipboard.
- **images/**: Directory containing the extension icons in various sizes.

## Development

To modify the extension:

1. Make your changes to the code.
2. Reload the extension in `chrome://extensions/`.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).