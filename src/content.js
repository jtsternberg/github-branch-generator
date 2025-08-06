// Function to slugify a string
function slugify(text) {
	return text
	.toString()
	.toLowerCase()
	.replace(/\s+/g, '-')           // Replace spaces with -
	.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
	.replace(/\-\-+/g, '-')         // Replace multiple - with single -
	.replace(/^-+/, '')             // Trim - from start of text
	.replace(/-+$/, '');            // Trim - from end of text
}

// Function to get the nickname from local storage or prompt for it
function getNickname() {
	let nickname = localStorage.getItem('nickname');
	if (!nickname) {
		nickname = prompt("Please enter your nickname:");
		if (nickname) {
			localStorage.setItem('nickname', nickname);
		} else {
			alert("Nickname is required to generate the branch name.");
			return null;
		}
	}
	return nickname;
}

// Function to map labels to types
function getTypeFromTypes(types) {
	const labelMapping = {
		'bug': 'bug',
		'feature': 'feature',
		'hotfix': 'hotfix',
		'change': 'change',
		'chore': 'chore',
		'wip': 'wip'
	};
	for (const label of types) {
		if (labelMapping[label.toLowerCase()]) {
			return labelMapping[label.toLowerCase()];
		}
	}

	return types.shift().toLowerCase();
}

function getTypeFromLabels(labels) {
	const labelMapping = {
		'bug': 'bug',
		'feature': 'feature',
		'hotfix': 'hotfix',
		'change': 'change',
		'chore': 'chore',
		'wip': 'wip'
	};
	for (const label of labels) {
		if (labelMapping[label.toLowerCase()]) {
			return labelMapping[label.toLowerCase()];
		}
	}
	return '';
}

// Alternative function to copy text to clipboard
function copyToClipboard(text) {
	const textarea = document.createElement('textarea');
	textarea.value = text;
	document.body.appendChild(textarea);
	textarea.select();
	document.execCommand('copy');
	document.body.removeChild(textarea);
	return true;
}

// Import the Gemini API function
import { generateConciseDescription } from './gemini-api.js';

// Main function to generate the branch name
async function generateBranchName() {
	// Get the nickname
	const nickname = getNickname();
	if (!nickname) return;

	// Get the issue number from the URL
	const issueNumber = window.location.pathname.split('/').pop();

	// Get the issue/PR title - try multiple selectors for different page types
	let issueTitleElement = document.querySelector('[data-testid="issue-title"]') ||
		document.querySelector('.js-issue-title') ||
		document.querySelector('h1[data-testid="pr-title"]') ||
		document.querySelector('.js-issue-title-container .js-issue-title') ||
		document.querySelector('h1.gh-header-title .js-issue-title');

	if (!issueTitleElement) {
		alert('Could not find issue or PR title. Please make sure you\'re on a GitHub issue or pull request page.');
		return null;
	}

	const issueTitle = issueTitleElement.textContent.trim();

	// Determine if this is a PR or Issue, and set appropriate default type
	const isPullRequest = window.location.pathname.includes('/pull/');
	let defaultType = isPullRequest ? 'feature' : 'change';

	let type;
	// Try to get types from issue type containers
	const types = Array.from(document.querySelectorAll('[data-testid="issue-type-container"] a')).map(type => type.textContent);
	if (types.length) {
		type = getTypeFromTypes(types);
	} else {
		// Try to get labels - use more flexible selectors
		const labelSelectors = [
			'[data-testid="issue-labels"] a[href*="/labels/"]',
			'.sidebar-labels a[href*="/labels/"]',
			'.labels a[href*="/labels/"]',
			'[data-testid="issue-labels"] [href*="/labels/"]'
		];

		let labels = [];
		for (const selector of labelSelectors) {
			const elements = document.querySelectorAll(selector);
			if (elements.length > 0) {
				labels = Array.from(elements).map(label => {
					const href = label.href || label.getAttribute('href');
					return href ? href.split('/').pop() : '';
				}).filter(label => label);
				break;
			}
		}

		// Determine the type from the labels
		type = getTypeFromLabels(labels) || defaultType;
	}

	// Generate description - try AI first, fallback to slugify
	let shortDescription;
	try {
		// Get API key from Chrome storage
		const result = await chrome.storage.sync.get(['geminiApiKey']);
		const apiKey = result.geminiApiKey;

		if (apiKey && typeof generateConciseDescription === 'function') {
			// console.log('%cTrying AI description generation...', 'color: blue; font-style: italic;');
			shortDescription = await generateConciseDescription(issueTitle, apiKey);
		}
	} catch (error) {
		console.warn('AI description generation failed:', error);
	}

	// Fallback to original slugify method
	if (!shortDescription) {
		console.log('%cUsing fallback slugify method', 'color: orange; font-style: italic;');
		shortDescription = slugify(issueTitle);
	}

	// Generate the branch name
	const branchName = `${nickname}/${type}/${issueNumber}-${shortDescription}`;
	let msg = `Generated Branch Name: ${branchName}`;
	if(copyToClipboard(branchName)) {
		msg += "\n(Copied to clipboard)";
	}

	// Let's make this message pretty...
	// it should look like an old console - black background, green text and some padding
	console.log(`%c${msg}`, 'background: black; color: green; padding: 10px;font-size: 16px;');

	// Send the branch name back to the popup if running in popup context
	try {
		chrome.runtime.sendMessage({
			type: 'BRANCH_NAME_GENERATED',
			branchName: branchName
		});
	} catch (error) {
		// Ignore if not in extension context
	}

	return branchName;
}

// Run the function to generate the branch name
generateBranchName();