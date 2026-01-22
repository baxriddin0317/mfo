import { getDefaultWebPageSchema } from "./defaults";

type MicrodataLoginProps = {
	title: string;
	description: string;
	companySlug: string;
	locale: "ru" | "ua";
};

export const MicrodataLogin = ({
	title,
	description,
	companySlug,
	locale,
}: MicrodataLoginProps) => {
	const webPageSchema = getDefaultWebPageSchema({
		lang: locale,
		dates: {
			date_modified: new Date().toISOString(),
			date_published: new Date().toISOString(),
		},
		title,
		description,
		path: `/mfo/${companySlug}/login`,
	});

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(webPageSchema),
			}}
		/>
	);
};
