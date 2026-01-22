"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { FaqItem } from "../services/catalogService";
import OftenQuestionsStructuredData from "../structured-data/OftenQuestionsStructuredData";

type OftenQuestionsProps = {
	faqs?: FaqItem[];
	company?: string;
};

const OftenQuestionsComponent: React.FC<OftenQuestionsProps> = ({
	faqs,
	company,
}) => {
	const t = useTranslations("faq");
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggleQuestion = (index: number) => {
		setOpenIndex((prev) => (prev === index ? null : index));
	};

	return (
		<>
			<h2
				className="px-0 md:px-[20px] text-[20px] md:text-[36px] mt-[30px] md:mt-[50px] font-[700] leading-[100%] text-[#222] mb-[14px] sm:mb-[30px] md:mb-[50px]"
				style={{ fontFamily: "var(--Jakarta)" }}
			>
				{t("title") + (company ? ` ${company}` : "")}
			</h2>
			{faqs && faqs.length > 0 && (
				<>
					<OftenQuestionsStructuredData faqs={faqs} />
					{faqs.map((question, index) => {
						const isOpen = openIndex === index;
						return (
							<div key={index} className="px-0 md:px-[20px]">
								<div className="w-full transition-all duration-200 ease-in-out hover:shadow-lg hover:bg-gray-100 mb-[10px] rounded-lg bg-white shadow-md">
									<div
										className="flex justify-between items-center p-[16px] cursor-pointer"
										onClick={() => toggleQuestion(index)}
									>
										<h3 className="font-bold text-[13px] md:text-[15px] leading-[136%] text-[#222] m-0">
											{question.question}
										</h3>
										{isOpen ? (
											<svg
												width="12"
												height="12"
												viewBox="0 0 12 12"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M1.77586 1.625L6 5.92325M6 5.92325L10.375 10.375M6 5.92325L1.625 10.375M6 5.92325L10.2241 1.62501"
													stroke="#724DEA"
													strokeWidth="2"
													strokeLinecap="round"
												/>
											</svg>
										) : (
											<svg
												width="16"
												height="15"
												viewBox="0 0 16 15"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M1.84886 6.96437L7.8751 7.01677M7.8751 7.01677L14.1166 7.07104M7.8751 7.01677L7.92937 13.2582M7.8751 7.01677L7.8227 0.99054"
													stroke="#724DEA"
													strokeWidth="2"
													strokeLinecap="round"
												/>
											</svg>
										)}
									</div>
									{isOpen && (
										<div className="px-[16px] pb-[16px] text-[13px] md:text-[15px] text-[#444] leading-[1.5]">
											{question.answer}
										</div>
									)}
								</div>
							</div>
						);
					})}
				</>
			)}
		</>
	);
};

export default function OftenQuestions({
	faqs,
	company,
}: {
	faqs?: FaqItem[];
	company?: string;
}) {
	return <OftenQuestionsComponent faqs={faqs} company={company} />;
}
