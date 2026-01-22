import QapClient from "@/app/components/QapClient";
import { getPageDates } from "@/app/services/PageDatesService";
import { getQuestions } from "@/app/services/questionsService";
import { getMfoDetails } from "@/app/services/getMfoDetailsService";
import { MicrodataQAP } from "@/app/structured-data/MicrodataQAP";
import { Metadata } from "next";
import { generateAlternates } from "@/app/lib/metadataUtils";

interface Props {
  params: Promise<{ company: string; lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { company, lang } = await params;
  const slug = decodeURIComponent(company || "sgroshi");
  const messages = (await import(`@/app/messages/${lang}.json`)).default;

  const companyName =
    messages.Metadata.company[slug]?.name ||
    messages.Metadata.company.default.name;

  const titleTemplate =
    messages.Metadata.qap?.title || "Вопросы и ответы о {company}";
  const descriptionTemplate =
    messages.Metadata.qap?.description ||
    "Ответы на часто задаваемые вопросы по {company}.";

  const title = titleTemplate.replace("{company}", companyName);
  const description = descriptionTemplate.replace("{company}", companyName);

  const alternates = generateAlternates(["mfo", slug, "qap"], lang);

  return {
    title,
    description,
    alternates,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: alternates.canonical,
      siteName: "MFoxa",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Qap({ params }: Props) {
  const { company, lang } = await params;
  const slug = decodeURIComponent(company || "sgroshi");

  const dates = slug
    ? await getPageDates({ type: "questions", mfo_slug: slug })
    : null;
  const questions = await getQuestions({
    page: 1,
    per_page: 100,
    mfo_slug: slug,
    sort: "newest",
  });
  const mfoData = await getMfoDetails(slug, lang === "ua" ? "uk" : "ru");

  return (
    <>
      <MicrodataQAP
        questions={questions.data}
        locale={lang as "ua" | "ru"}
        dates={dates}
      />
      <QapClient
        company={company}
        dates={dates}
        locale={lang}
        initialMfoData={mfoData.data}
        initialQuestionsData={questions}
      />
    </>
  );
}
