document.addEventListener('DOMContentLoaded', async () => {
	// Listen for messages from content script
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.type === 'BRANCH_NAME_GENERATED') {
			showResult(message.branchName);
			showStatus('Branch name generated and copied to clipboard!');
		} else if (message.type === 'UPDATE_LOADING_MESSAGE') {
			if (loading.style.display === 'flex') {
				loadingText.textContent = message.message;
			}
		}
	});
	const apiKeyInput = document.getElementById('api-key');
	const saveButton = document.getElementById('save-settings');
	const generateButton = document.getElementById('generate-branch');
	const status = document.getElementById('status');
	const loading = document.getElementById('loading');
	const loadingText = document.getElementById('loading-text');
	const resultSection = document.getElementById('result-section');
	const branchNameDisplay = document.getElementById('branch-name');
	const copyButton = document.getElementById('copy-branch');

	// Generate branch name - shared logic for auto-generation and manual regeneration
	async function generateBranchName() {
		try {
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

			if (!tab.url.includes('github.com')) {
				showStatus('Please navigate to a GitHub issue or pull request page', true);
				return;
			}

			// Check if we have an API key to show appropriate loading message
			const result = await chrome.storage.sync.get(['geminiApiKey']);
			const hasApiKey = result.geminiApiKey && result.geminiApiKey.trim();

			if (hasApiKey) {
				showLoading('Generating branch name with AI...');
			} else {
				showLoading('Generating branch name...');
			}

			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ['dist/content-bundle.iife.js']
			});

			// The success message and result display will be handled by the message listener
		} catch (error) {
			showStatus('Error generating branch name', true);
			console.error('Error executing script:', error);
		}
	}

	// Start auto-generation immediately when popup opens
	generateBranchName();

	// Load existing settings
	const result = await chrome.storage.sync.get(['geminiApiKey']);
	if (result.geminiApiKey) {
		apiKeyInput.value = result.geminiApiKey;
	}

	// Show/hide loading state
	function showLoading(message = 'Generating branch name...') {
		loadingText.textContent = message;
		loading.style.display = 'flex';
		generateButton.disabled = true;
		saveButton.disabled = true;
		status.style.display = 'none';
	}

	function hideLoading() {
		loading.style.display = 'none';
		generateButton.disabled = false;
		saveButton.disabled = false;
	}

	// Show branch name result
	function showResult(branchName) {
		hideLoading();
		branchNameDisplay.textContent = branchName;
		resultSection.style.display = 'block';
	}

	// Show status message
	function showStatus(message, isError = false) {
		hideLoading();
		status.textContent = message;
		status.className = `status ${isError ? 'error' : 'success'}`;
		status.style.display = 'block';
		setTimeout(() => {
			status.style.display = 'none';
		}, 3000);
	}

	// Save settings
	saveButton.addEventListener('click', async () => {
		const apiKey = apiKeyInput.value.trim();

		try {
			await chrome.storage.sync.set({
				geminiApiKey: apiKey
			});
			showStatus('Settings saved successfully!');
		} catch (error) {
			showStatus('Error saving settings', true);
			console.error('Error saving settings:', error);
		}
	});

	// Regenerate button - reuse the same logic
	generateButton.addEventListener('click', generateBranchName);

	// Copy button functionality
	copyButton.addEventListener('click', async () => {
		try {
			await navigator.clipboard.writeText(branchNameDisplay.textContent);
			showStatus('Copied to clipboard!');
		} catch (error) {
			// Fallback for older browsers
			const textarea = document.createElement('textarea');
			textarea.value = branchNameDisplay.textContent;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			showStatus('Copied to clipboard!');
		}
	});
});