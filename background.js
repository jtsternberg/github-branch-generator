chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: generateBranchName
  });
});

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
  return 'change';
}

// Main function to generate the branch name
function generateBranchName() {
  // Get the nickname
  const nickname = getNickname();
  if (!nickname) return;

  // Get the issue number from the URL
  const issueNumber = window.location.pathname.split('/').pop();

  // Get the issue title and labels
  const issueTitle = document.querySelector('.js-issue-title').textContent.trim();
  const labels = Array.from(document.querySelectorAll('.labels .label')).map(label => label.textContent.trim());

  // Determine the type from the labels
  const type = getTypeFromLabels(labels);

  // Slugify the issue title
  const shortDescription = slugify(issueTitle);

  // Generate the branch name
  const branchName = `${nickname}/${type}/${issueNumber}-${shortDescription}`;
  console.log(`Generated Branch Name: ${branchName}`);
  alert(`Generated Branch Name: ${branchName}`);
}