// Gemini API integration for generating concise branch descriptions

async function generateConciseDescription(issueTitle, apiKey) {
	const prompt = `Create a concise, descriptive git branch name suffix from this GitHub issue title.

Rules:
- Prefer 4-5 words, no more than 8 words
- Use kebab-case (lowercase with hyphens)
- Focus on the main action or feature
- Remove redundancy
- Keep the key words that differentiate the issue from other issues
- Remove unnecessary words like "should", "need to", "we", etc.
- Be specific but brief

Issue title: "${issueTitle}"

Return only the branch name suffix, absolutely nothing else.`;

	try {
		const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				contents: [{
					parts: [{
						text: prompt
					}]
				}],
				generationConfig: {
					temperature: 0.3,
					topK: 20,
					topP: 0.8,
					maxOutputTokens: 50
				}
			})
		});

		if (!response.ok) {
			throw new Error(`Gemini API error: ${response.status}`);
		}

		const data = await response.json();

		if (data.candidates && data.candidates[0] && data.candidates[0].content) {
			const generatedText = data.candidates[0].content.parts[0].text.trim();
			// Clean up the response - remove quotes, ensure kebab-case
			return generatedText
				.replace(/['"]/g, '')
				.toLowerCase()
				.replace(/[^a-z0-9-]/g, '-')
				.replace(/-+/g, '-')
				.replace(/^-+|-+$/g, '');
		}

		throw new Error('Invalid response from Gemini API');

	} catch (error) {
		console.error('Gemini API error:', error);
		return null;
	}
}