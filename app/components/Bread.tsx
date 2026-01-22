"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";

type BreadProps = {
	lang: "ru" | "ua";
	companyName?: string;
};

const translations: Record<string, { ru: string; ua: string }> = {
	loan: { ru: "Займы", ua: "Позики" },
	reviews: { ru: "Отзывы", ua: "Відгуки" },
	contacts: { ru: "Контакты", ua: "Контакти" },
	promotion: { ru: "Акции", ua: "Акції" },
	qap: { ru: "Вопросы", ua: "Питання" },
	catalog: { ru: "Каталог МФО", ua: "Каталог МФО" },
	mfo: { ru: "Рейтинг МФО", ua: "Рейтинг МФО" },
	about: { ru: "О нас", ua: "Про нас" },
};

const Bread = ({ lang, companyName }: BreadProps) => {
	const pathname = usePathname();

	const segments = useMemo(() => {
		if (!pathname) return [];
		const parts = pathname.split("/").filter(Boolean);

		// Убираем язык (первый сегмент: "ru" или "ua")
		if (parts[0] === "ru" || parts[0] === "ua") {
			return parts.slice(1);
		}
		return parts;
	}, [pathname]);
	
	const breadcrumbs = useMemo(() => {
		const langPrefix = lang === "ru" ? "/ru" : "";
		
		return segments.map((segment, index) => {
			const isCompanySlug = index > 0 && 
				segments[index - 1] === "mfo" && 
				!translations[segment]?.[lang];
			
			let href: string;
			
			const prevSegments = segments.slice(0, index + 1);
			
			if (segment === "mfo") {
				href = langPrefix ? `${langPrefix}/mfo` : "/mfo";
			} else if (isCompanySlug) {
				href = langPrefix ? `${langPrefix}/mfo/${segment}` : `/mfo/${segment}`;
			} else {
				const pathParts = prevSegments.join("/");
				href = langPrefix ? `${langPrefix}/${pathParts}` : `/${pathParts}`;
			}
			
			let label: string;
			
			if (segment === "mfo") {
				label = translations["mfo"]?.[lang] || "МФО";
			} else if (isCompanySlug && companyName) {
				label = companyName;
			} else if (translations[segment]?.[lang]) {
				label = translations[segment][lang];
			} else {
				label = decodeURIComponent(segment)
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ");
			}

			return {
				label,
				href: href,
			};
		});
	}, [segments, lang, companyName]);

	return (
		<div
			className="p-[10px] md:pl-[20px] my-[10px] flex gap-[9px] text-[#222] text-[12px] font-medium leading-[142%]"
			style={{ fontFamily: "var(--Montserrat)" }}
		>
			<Link href={lang === "ru" ? "/ru" : "/"}>
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M8.00887 1.5L1 6.59091V15.5H6.35247L6.35235 11.0267H9.64753V15.5H15V6.59091L8.00887 1.5Z"
						stroke="#222222"
					/>
				</svg>
			</Link>

			{breadcrumbs.map((crumb, i) => (
				<div key={i} className="flex items-center gap-[9px]">
					<span>/</span>
					{i === breadcrumbs.length - 1 ? (
						<span>{crumb.label}</span>
					) : (
						<Link href={crumb.href}>{crumb.label}</Link>
					)}
				</div>
			))}
		</div>
	);
};

export default Bread;
