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
	return '';
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

// Main function to generate the branch name
function generateBranchName() {
	// Get the nickname
	const nickname = getNickname();
	if (!nickname) return;

	// Get the issue number from the URL
	const issueNumber = window.location.pathname.split('/').pop();

	// Get the issue title and labels
	const issueTitle = document.querySelector('[data-testid="issue-title"]').textContent.trim();

	let type;
	// Get types from `/awesomemotive/lindris-site/issues?q=type:&quot;Bug&quot;`
	const types = Array.from(document.querySelectorAll('[data-testid="issue-type-container"] a')).map(type => type.textContent);
	if (types.length) {
		type = getTypeFromTypes(types);
	}

	if (!type) {
		// Get labels from `https://github.com/awesomemotive/lindris-site/labels/component-onboarding`
		const labels = Array.from(document.querySelectorAll('[data-testid="issue-labels"] [href^="https://github.com/awesomemotive/lindris-site/labels/"]')).map(label => label.href.split('/').pop());

		// Determine the type from the labels
		type = getTypeFromLabels(labels);
	}

	type = type || 'change';

	// Slugify the issue title
	const shortDescription = slugify(issueTitle);

	// Generate the branch name
	const branchName = `${nickname}/${type}/${issueNumber}-${shortDescription}`;
	let msg = `Generated Branch Name: ${branchName}`;
	if(copyToClipboard(branchName)) {
		msg += "\n(Copied to clipboard)";
	}

	// Let's make this message pretty...
	// it should look like an old console - black background, green text and some padding
	console.log(`%c${msg}`, 'background: black; color: green; padding: 10px;font-size: 16px;');
}

// Run the function to generate the branch name
generateBranchName();