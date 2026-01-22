import { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { NextIntlClientProvider } from "next-intl";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import StructuredData from "../structured-data/StructuredData";
import { LangType } from "../services/HomeService";
import { montserrat, jakarta, inter, jura, golos, manrope, dmSans } from "../lib/fonts";

import "../globals.css";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params; // Асинхронно получаем lang
	try {
		const messages = (await import(`../messages/${lang}.json`)).default;
		return {
			title: messages.Metadata.root.title,
			description: messages.Metadata.root.description,
			robots: "index, follow",
			openGraph: {
				title: messages.Metadata.root.title,
				description: messages.Metadata.root.description,
				url: "https://mfoxa.com.ua",
				siteName: "MFoxa",
				images: [
					{
						url: "https://mfoxa.com.ua/og-image.jpg",
						width: 1200,
						height: 630,
						alt: "MFoxa - Финансовый маркетплейс",
					},
				],
				locale: lang === "ua" ? "uk_UA" : "ru_UA",
				type: "website",
			},
			twitter: {
				card: "summary_large_image",
				title: messages.Metadata.root.title,
				description: messages.Metadata.root.description,
				images: ["https://mfoxa.com.ua/og-image.jpg"],
			},
			// Alternates are set by individual pages - don't set them here
			// to avoid overriding page-specific alternates
		} as Metadata;
	} catch (error) {
		console.error(`Failed to load metadata for lang ${lang}:`, error);
		return {
			title: "404 - Страница не найдена",
			description: "Запрашиваемая страница не существует.",
		} as Metadata;
	}
}

export default async function Layout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;
	let messages;
	try {
		messages = (await import(`../messages/${lang}.json`)).default;
	} catch (error) {
		console.error(`Failed to load messages for lang ${lang}:`, error);
		messages = (await import("../messages/ru.json")).default;
	}
	return (
		<html 
			lang={lang === "ru" ? "ru" : "uk"} 
			suppressHydrationWarning
			className={`${montserrat.variable} ${jakarta.variable} ${inter.variable} ${jura.variable} ${golos.variable} ${manrope.variable} ${dmSans.variable}`}
		>
			<head>
				{/* Preconnect to external domains for faster resource loading */}
				<link rel="preconnect" href="https://api.mfoxa.com.ua" crossOrigin="anonymous" />
				<link rel="dns-prefetch" href="https://api.mfoxa.com.ua" />
			</head>
			<body suppressHydrationWarning>
				<Toaster position="top-right" reverseOrder={false} />

				<NextIntlClientProvider locale={lang} messages={messages}>
					<StructuredData lang={lang as LangType} />
					<Header lang={lang} />
					<div className="px-2.5 min-h-[80vh] max-w-[1440px] mx-auto md:px-[50px] lg:px-[100px] pb-5 md:pb-[40px] lg:pb-[50px] bg-[#ebebf9]">
						{children}
					</div>
					<Footer locale={lang} />{" "}
				</NextIntlClientProvider>
			</body>
		</html>
	);
}

export async function generateStaticParams() {
	return [{ lang: "ru" }, { lang: "ua" }];
}
