"use client";

import React from "react";

import { FaqItem } from "../services/catalogService";

export default function OftenQuestionsStructuredData({
	faqs,
}: {
	faqs?: FaqItem[];
}) {
	if (!faqs || faqs.length === 0) return null;

	const faqSchema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
		/>
	);
}
