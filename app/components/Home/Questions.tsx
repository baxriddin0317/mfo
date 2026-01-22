"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Category, fetchPageLinks } from "@/app/services/pageLinks";

const Questions: React.FC = () => {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const [questions, setQuestions] = useState<Category[] | null>(null);
	const locale = useLocale();

	const toggleQuestion = (index: number) => {
		setOpenIndex((prev) => (prev === index ? null : index));
	};

	useEffect(() => {
		async function loadLinks() {
			try {
				const data = await fetchPageLinks(
					locale === "ua" ? "uk" : "ru"
				);
				// обработка данных, например, установка в состояние
				setQuestions(data.data);
			} catch (error) {
				console.error("Error fetching page links:", error);
			}
		}

		loadLinks();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="px-0 md:px-[20px]">
			{questions &&
				questions.map((question, index) => {
					const isOpen = openIndex === index;

					return (
						<div
							key={index}
							className="w-full mb-[10px] rounded-lg bg-white shadow-md transition-all duration-200 ease-in-out hover:shadow-lg hover:bg-gray-100"
						>
							<div
								className="flex justify-between items-center p-[16px] cursor-pointer"
								onClick={() => toggleQuestion(index)}
							>
								<h3 className="font-bold text-[14px] leading-[136%] text-[#222]">
									{question.title}
								</h3>
								{isOpen ? (
									<svg
										width="12"
										height="10"
										viewBox="0 0 12 10"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M10.375 7.5L6 3.25684L1.625 7.5"
											stroke="#724DEA"
											strokeWidth="2"
											strokeLinecap="round"
										/>
									</svg>
								) : (
									<svg
										width="10"
										height="11"
										viewBox="0 0 10 11"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M2.87842 9.75342L7.12158 5.37842L2.87842 1.00342"
											stroke="#724DEA"
											strokeWidth="2"
											strokeLinecap="round"
										/>
									</svg>
								)}
							</div>
							{isOpen && (
								<div className="px-[16px] pb-[16px] grid grid-cols-2 gap-[10px] sm:grid-cols-4 sm:gap-[10px]">
									{question.links.map((link, linkIndex) => (
										<Link
											key={linkIndex}
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
											className="truncate"
											style={{
												fontFamily: "var(--Montserrat)",
												fontWeight: 500,
												fontSize: "13px",
												lineHeight: "138%",
												textDecoration: "underline",
												textDecorationSkipInk: "none",
												color: "#00ba9e",
											}}
										>
											{link.title}
										</Link>
									))}
								</div>
							)}
						</div>
					);
				})}
		</div>
	);
};

export default Questions;
