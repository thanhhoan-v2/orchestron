interface SearchSuggestion {
	id: string;
	type: "url" | "protocol" | "domain" | "port";
	title: string;
	suggested: string;
	description: string;
	icon: string;
}

export function generateSearchSuggestions(query: string): SearchSuggestion[] {
	const suggestions: SearchSuggestion[] = [];
	const trimmedQuery = query.trim().toLowerCase();

	if (!trimmedQuery) return suggestions;

	// Dynamic localhost with port pattern
	const localhostPortMatch = trimmedQuery.match(/^localhost:(\d+)$/);
	if (localhostPortMatch) {
		const port = localhostPortMatch[1];
		const suggestedUrl = `http://${trimmedQuery}`;

		suggestions.push({
			id: `localhost-port-${port}`,
			type: "url",
			title: suggestedUrl,
			suggested: suggestedUrl,
			description: `Open localhost on port ${port}`,
			icon: "🌐",
		});

		return suggestions.slice(0, 1);
	}

	// Dynamic IP address with port pattern
	const ipPortMatch = trimmedQuery.match(
		/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):(\d+)$/
	);
	if (ipPortMatch) {
		const ip = ipPortMatch[1];
		const port = ipPortMatch[2];
		const protocol = port === "443" ? "https" : "http";
		const suggestedUrl = `${protocol}://${trimmedQuery}`;

		suggestions.push({
			id: `ip-port-${port}`,
			type: "url",
			title: suggestedUrl,
			suggested: suggestedUrl,
			description: `Open ${ip} on port ${port}`,
			icon: protocol === "https" ? "🔒" : "🌐",
		});

		return suggestions.slice(0, 1);
	}

	// Dynamic domain with port pattern
	const domainPortMatch = trimmedQuery.match(/^(.+):(\d+)$/);
	if (domainPortMatch) {
		const host = domainPortMatch[1];
		const port = domainPortMatch[2];
		const protocol = port === "443" ? "https" : "http";
		const suggestedUrl = `${protocol}://${trimmedQuery}`;

		suggestions.push({
			id: `domain-port-${port}`,
			type: "port",
			title: suggestedUrl,
			suggested: suggestedUrl,
			description: `Open ${host} on port ${port}`,
			icon: protocol === "https" ? "🔒" : "🌐",
		});

		return suggestions.slice(0, 1);
	}

	// Domain without protocol
	const domainMatch = trimmedQuery.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/);
	if (domainMatch) {
		suggestions.push({
			id: "domain-https",
			type: "protocol",
			title: `https://${trimmedQuery}`,
			suggested: `https://${trimmedQuery}`,
			description: "Open with HTTPS",
			icon: "🔒",
		});

		return suggestions.slice(0, 1);
	}

	// Common services
	const servicePatterns = [
		{ query: "github", url: "https://github.com", name: "GitHub" },
		{ query: "gmail", url: "https://gmail.com", name: "Gmail" },
		{ query: "youtube", url: "https://youtube.com", name: "YouTube" },
		{ query: "google", url: "https://google.com", name: "Google" },
		{
			query: "stackoverflow",
			url: "https://stackoverflow.com",
			name: "Stack Overflow",
		},
		{ query: "reddit", url: "https://reddit.com", name: "Reddit" },
		{ query: "twitter", url: "https://twitter.com", name: "Twitter" },
		{ query: "linkedin", url: "https://linkedin.com", name: "LinkedIn" },
		{ query: "figma", url: "https://figma.com", name: "Figma" },
		{ query: "notion", url: "https://notion.so", name: "Notion" },
		{ query: "discord", url: "https://discord.com", name: "Discord" },
		{ query: "slack", url: "https://slack.com", name: "Slack" },
		{ query: "vercel", url: "https://vercel.com", name: "Vercel" },
		{ query: "netlify", url: "https://netlify.com", name: "Netlify" },
		{ query: "npm", url: "https://npmjs.com", name: "NPM" },
	];

	for (const service of servicePatterns) {
		if (
			trimmedQuery === service.query ||
			trimmedQuery.includes(service.query)
		) {
			suggestions.push({
				id: `service-${service.query}`,
				type: "domain",
				title: `Go to ${service.name}`,
				suggested: service.url,
				description: `Open ${service.name}`,
				icon: "🔗",
			});
			break; // Only show first match
		}
	}

	return suggestions.slice(0, 1);
}
