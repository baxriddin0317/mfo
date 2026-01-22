import { CatalogPageFull } from "@/app/services/catalogService";
import { PageDatesResponse } from "@/app/services/PageDatesService";
import { getDefaultWebPageSchema } from "./defaults";

type BezotkazaStructuredDataProps = {
	lang: "ru" | "ua";
	page: CatalogPageFull;
	dates: PageDatesResponse;
};

export const BezotkazaStructuredData = ({
	lang,
	page,
	dates,
}: BezotkazaStructuredDataProps) => {
	const webPageSchema = getDefaultWebPageSchema({
		lang,
		title:
			page.meta_title ||
			(lang === "ua" ? "Безвідмовні позики" : "Безотказные займы"),
		description:
			page.meta_description ||
			(lang === "ua"
				? "Найкращі МФО з високим відсотком схвалення позик"
				: "Лучшие МФО с высоким процентом одобрения займов"),
		path: `/${page.slug}`,
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
