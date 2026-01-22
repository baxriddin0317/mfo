// components/Home/FinancialMarketplace.tsx
import Image from "next/image";
import React from "react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { localePrefix } from "@/app/config/routesMap";

type FinancialMarketplaceProps = {
	locale: string;
	settings: Record<string, string> | undefined;
};

const FinancialMarketplace: React.FC<FinancialMarketplaceProps> = async ({
	locale,
	settings,
}) => {
	const t = await getTranslations({
		locale,
		namespace: "FinancialMarketplace",
	});
	const tc = await getTranslations({
		locale,
		namespace: "FinancialMarketplace.categories",
	});

	const categories = [
		{ title: tc("to_card"), image: "/Frame 137.png", link: "/na-kartu" },
		{
			title: tc("zero_percent"),
			image: "/Frame 137 (1).png",
			link: "/pod-null",
		},
		{ title: tc("new_mfo"), image: "/Frame 137 (2).png", link: "/new-mfo" },
		{ title: tc("cash"), image: "/Frame 137 (3).png", link: "/nalichnumi" },
		{
			title: tc("from_18"),
			image: "/Frame 137 (4).png",
			link: "/s-18-let",
		},
		{ title: tc("24_7"), image: "/Frame 137 (5).png", link: "/" },
		{ title: tc("pensioners"), image: "/Frame 137 (6).png", link: "/" },
		{ title: tc("bad_credit"), image: "/Frame 137 (7).png", link: "/" },
		{ title: tc("bank_id"), image: "/Frame 137 (8).png", link: "/" },
	];

	return (
		<section className="w-full mt-[20px] md:mt-[50px] px-[0px] md:px-[20px] mb-[30px] md:mb-[30px]">
			<h1
				className="text-[20px] sm:text-[28px] md:text-[36px] font-[700] leading-[100%] text-[#222] mb-[20px] sm:mb-[25px] md:mb-[30px]"
				style={{ fontFamily: "var(--Jakarta)" }}
			>
				{settings?.main_page_title || t("title")}
			</h1>
			<p
				className="text-[11px] sm:text-[12px] md:text-[13px] font-[500] leading-[138%] text-[#222] mb-[20px] sm:mb-[25px] md:mb-[30px]"
				style={{ fontFamily: "var(--Montserrat)" }}
			>
				{settings?.main_page_description || t("description")}
			</p>

			<div className="grid grid-cols-3 md:grid-cols-5 gap-2">
				{categories.map((item, index) => (
					<Link
						key={index}
						href={`${localePrefix(locale)}${item.link}`}
						className={`bg-white p-2.5 rounded-lg transition-colors duration-200 hover:bg-[#f8f6f6] cursor-pointer ${
							index === 0 ? "md:col-span-2" : ""
						}`}
						style={{
							fontFamily: "var(--Manrope)",
							fontWeight: 700,
							fontSize: "16px",
							lineHeight: "100%",
						}}
					>
						<div>
							{/* Mobile layout */}
							<div className="flex flex-col items-center md:hidden">
								<Image
									src={item.image}
									alt={item.title}
									width={
										item.title === tc("bank_id") ? 80 : 50
									}
									height={50}
									className="mb-[10px] h-[50px]"
								/>
								<p
									className="text-center"
									style={{
										fontFamily: "var(--Montserrat)",
										fontWeight: 500,
										fontSize: "10px",
										lineHeight: "120%",
										color: "#222",
									}}
								>
									{item.title === tc("bad_credit") ? (
										<>
											<span className="block md:hidden">
												{tc("bad_credit_short")}
											</span>
											<span className="hidden md:block">
												{item.title}
											</span>
										</>
									) : (
										item.title
									)}
								</p>
							</div>

							{/* Desktop (md+) layout */}
							<div className="hidden md:flex flex-col h-full justify-between">
								<p className="mb-[10px] text-[#724dea]">
									{item.title}
								</p>
								<div className="flex justify-end">
									<Image
										src={item.image}
										alt={item.title}
										width={
											item.title === tc("bank_id")
												? 100
												: 60
										}
										height={60}
										className="mb-2"
									/>
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
};

export default FinancialMarketplace;
