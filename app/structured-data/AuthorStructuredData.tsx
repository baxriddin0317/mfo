import React from "react";
import { Author } from "../services/authorsService";

interface AuthorStructuredDataProps {
	author: Author;
	locale: string;
	pageUrl: string;
}

export default function AuthorStructuredData({
	author,
	locale,
	pageUrl,
}: AuthorStructuredDataProps) {
	if (!author) return null;

	const data = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		url: pageUrl,
		inLanguage: locale,
		author: {
			"@type": "Person",
			name: author.name,
			image: author.avatar || undefined,
			jobTitle: author.role || undefined,
			description: [
				author.education,
				author.work_experience,
				author.additional_qualification,
			]
				.filter(Boolean)
				.join(", "),
		},
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}
