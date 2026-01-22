"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { routesMap } from "../config/routesMap";

/* export const AboutButtonsComponent = () => {
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations("AboutButtons");

	const keys = Object.keys(routesMap); // ['about', 'reviews', ...]
	const [activeKey, setActiveKey] = useState("about");

	const [loadingKey, setLoadingKey] = useState<string | null>(null);

	useEffect(() => {
		const currentPath = pathname;
		const matchedEntry = Object.entries(routesMap).find(
			([, path]) => currentPath.endsWith(path) && path !== ""
		);

		if (matchedEntry) {
			setActiveKey(matchedEntry[0]);
		} else {
			setActiveKey("about"); // если ничего не найдено — считаем "about"
		}
	}, [pathname]);

	const handleButtonClick = (key: string) => {
		if (key === activeKey) return;

		const basePath = pathname.replace(
			/\/(reviews|promotion|qap|login)$/,
			""
		);
		const subPath = routesMap[key] ?? "";
		const targetPath = `${basePath}${subPath}`;

		setLoadingKey(key);
		router.push(targetPath);
	};

	return (
		<div className="px-0 md:px-[20px]">
			<div className="flex gap-[10px] w-full my-[30px] md:my-[50px] overflow-x-auto no-scrollbar">
				{keys.map((key) => {
					const isActive = activeKey === key;
					const isLoading = loadingKey === key;

					return (
						<button
							key={key}
							onClick={() => handleButtonClick(key)}
							className={`cursor-pointer whitespace-nowrap rounded-[35px] p-[8px_10px] sm:p-[10px_12px] md:p-[14px_20px] flex items-center justify-center font-medium text-[15px] leading-[133%] ${
								isActive
									? key === "promotion"
										? "bg-[#e3fffb] text-[#00ba9e]"
										: "bg-[#b6b6de] text-[#724dea]"
									: key === "promotion"
									? "bg-[#fff] text-[#00ba9e]"
									: "bg-[#fff] text-[#000000]"
							}`}
						>
							<span className="flex items-center gap-2">
								{t(key)}
								{isLoading && (
									<svg
										className="animate-spin h-4 w-4 text-current"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
											fill="none"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
										/>
									</svg>
								)}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}; */

export const AboutButtonsComponent = () => {
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations("AboutButtons");

	const keys = Object.keys(routesMap);

	const matchedEntry = Object.entries(routesMap).find(
		([, path]) => pathname.endsWith(path) && path !== ""
	);

	const activeKey = matchedEntry ? matchedEntry[0] : "about";

	const [loadingKey, setLoadingKey] = useState<string | null>(null);

	const handleButtonClick = (key: string) => {
		if (key === activeKey) return;

		const basePath = pathname.replace(
			/\/(reviews|promotion|qap|login)$/,
			""
		);
		const subPath = routesMap[key] ?? "";
		const targetPath = `${basePath}${subPath}`;

		setLoadingKey(key);
		router.push(targetPath);
	};

	return (
		<div className="px-0 md:px-[20px]">
			<div className="flex gap-[10px] w-full my-[30px] md:my-[50px] overflow-x-auto no-scrollbar">
				{keys.map((key) => {
					const isActive = activeKey === key;
					const isLoading = loadingKey === key;

					return (
						<button
							key={key}
							onClick={() => handleButtonClick(key)}
							className={`cursor-pointer whitespace-nowrap rounded-[35px] p-[8px_10px] sm:p-[10px_12px] md:p-[14px_20px] flex items-center justify-center font-medium text-[15px] leading-[133%] ${
								isActive
									? key === "promotion"
										? "bg-[#e3fffb] text-[#00ba9e]"
										: "bg-[#b6b6de] text-[#724dea]"
									: key === "promotion"
									? "bg-[#fff] text-[#00ba9e]"
									: "bg-[#fff] text-[#000000]"
							}`}
						>
							<span className="flex items-center gap-2">
								{t(key)}
								{isLoading && (
									<svg
										className="animate-spin h-4 w-4 text-current"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
											fill="none"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
										/>
									</svg>
								)}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default function AboutButtons() {
	return <AboutButtonsComponent />;
}
