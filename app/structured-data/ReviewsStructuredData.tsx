import { PageDatesResponse } from "@/app/services/PageDatesService";
import { SettingsGroupResponse } from "@/app/services/settingsService";
import { getDefaultWebPageSchema } from "./defaults";

type ReviewsStructuredDataProps = {
	lang: "ru" | "ua";
	dates: PageDatesResponse;
	getAllSettings: SettingsGroupResponse | undefined;
};

export const ReviewsStructuredData = ({
	lang,
	dates,
	getAllSettings,
}: ReviewsStructuredDataProps) => {
	const webPageSchema = getDefaultWebPageSchema({
		lang,
		title:
			getAllSettings?.settings.reviews_page_title ||
			(lang === "ua"
				? "Відгуки про МФО України"
				: "Отзывы об МФО Украины"),
		description:
			getAllSettings?.settings.reviews_page_description ||
			(lang === "ua"
				? "Читайте відгуки клієнтів про мікрофінансові організації України"
				: "Читайте отзывы клиентов о микрофинансовых организациях Украины"),
		path: "/reviews",
		dates,
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
