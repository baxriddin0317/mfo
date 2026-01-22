// InfoHelpful.tsx
import React from "react";
import { AuthorRandomResponse } from "../services/authorsService";
import InfoHelpfulClient from "./InfoHelpfulClient"; // <--- подключаем клиентский компонент

type InfoHelpfulProps = {
	locale: string;
	randomAuthor: AuthorRandomResponse;
};

export default async function InfoHelpful({
	locale,
	randomAuthor,
}: InfoHelpfulProps) {
	return <InfoHelpfulClient randomAuthor={randomAuthor} locale={locale} />;
}
