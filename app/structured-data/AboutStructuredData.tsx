import { Author } from "@/app/services/authorsService";
import { PageDatesResponse } from "@/app/services/PageDatesService";
import { SettingsGroupResponse } from "@/app/services/settingsService";
import { getDefaultWebPageSchema, knowsAboutByLang } from "./defaults";

type AboutStructuredDataProps = {
	lang: "ru" | "ua";
	authors: Author[];
	dates: PageDatesResponse;
	getAllSettings: SettingsGroupResponse | undefined;
};

export const AboutStructuredData = ({
	lang,
	authors,
	dates,
	getAllSettings,
}: AboutStructuredDataProps) => {
	const webPageSchema = getDefaultWebPageSchema({
		lang,
		title:
			getAllSettings?.settings.about_page_title ||
			(lang === "ua"
				? "Наша команда експертів"
				: "Наша команда экспертов"),
		description:
			getAllSettings?.settings.about_page_description ||
			(lang === "ua"
				? "Команда професіоналів фінансової сфери"
				: "Команда профессионалов финансовой сферы"),
		path: "/about",
		dates,
	});

	const personSchemas = authors.map((author) => ({
		"@context": "https://schema.org",
		"@type": "Person",
		name: author.name,
		jobTitle: author.role || (lang === "ua" ? "Експерт" : "Эксперт"),
		description: `${author.education} | ${author.work_experience}`,
		knowsAbout: knowsAboutByLang[lang],
		hasCredential: {
			"@type": "EducationalOccupationalCredential",
			credentialCategory: "License",
			name:
				author.additional_qualification ||
				(lang === "ua" ? "Ліцензія НБУ" : "Лицензия НБУ"),
		},
		image: author.avatar,
		worksFor: {
			"@type": "Organization",
			name: "MFoxa",
			url: "https://mfoxa.com.ua",
		},
	}));

	const allSchemas = [webPageSchema, ...personSchemas];

	return (
		<>
			{allSchemas.map((schema, index) => (
				<script
					key={index}
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(schema),
					}}
				/>
			))}
		</>
	);
};
