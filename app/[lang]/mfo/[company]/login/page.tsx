import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import AboutButtons from "@/app/components/AboutButtons";
import Bread from "@/app/components/Bread";
import type { NextPage } from "next";
import { getMfoDetails } from "@/app/services/getMfoDetailsService";
import { MicrodataLogin } from "@/app/structured-data/MicrodataLogin";
import { generateAlternates } from "@/app/lib/metadataUtils";

interface Props {
  params: Promise<{ lang: string; company: string }>;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, company } = await params;
  const slug = decodeURIComponent(company || "sgroshi");

  const { data } = await getMfoDetails(slug, lang === "ua" ? "uk" : "ru");

  const loginPage = data.login_page;

  const alternates = generateAlternates(["mfo", slug, "login"], lang);

  const ogTitle = loginPage?.meta_title || `Личный кабинет ${data.name}`;
  const ogDescription = loginPage?.meta_description || `Информация о входе в личный кабинет ${data.name}`;

  return {
    title: ogTitle,
    description: ogDescription,
    alternates,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: alternates.canonical,
      type: "website",
      siteName: "MFoxa",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
    },
    robots: { index: true, follow: true },
  };
}

const Login: NextPage<Props> = async ({ params }) => {
  const { lang, company } = await params;
  const companySlug = decodeURIComponent(company || "sgroshi");
  const t = await getTranslations({ locale: lang, namespace: "Login" });

  // Получаем имя компании или используем default
  const { data } = await getMfoDetails(
    companySlug,
    lang === "ua" ? "uk" : "ru",
  );

  console.log(data);

  return (
    <>
      <MicrodataLogin
        title={
          data.login_page?.meta_title || t("title", { company: data.name })
        }
        description={
          data.login_page?.meta_description ||
          t("description", { company: data.name })
        }
        companySlug={companySlug}
        locale={lang as "ua" | "ru"}
      />
      <Bread lang={lang as "ru" | "ua"} companyName={data.name} />
      <div className="px-0 md:px-[20px]">
        <h1
          className="text-[20px] sm:text-[28px] md:text-[36px] font-[700] leading-[100%] text-[#222] mb-[14px] sm:mb-[25px] md:mb-[30px]"
          style={{ fontFamily: "var(--Jakarta)" }}
        >
          {data.login_page?.h1_title || t("title", { company })}
        </h1>
      </div>
      <AboutButtons />

      <div className="px-0 md:px-[20px] mt-[30px]">
        <div className="w-full">
          <div
            className="login-content"
            dangerouslySetInnerHTML={{
              __html: data.login_page?.content || "",
            }}
          />
        </div>
      </div>
      {/* <div className="px-0 md:px-[20px]">
        <div className="border border-[#d6d6f9] rounded-lg p-[30px] w-full bg-white">
          <p className="mb-[20px] font-medium text-[13px] leading-[138%] text-[#222]">
            {t("content.title")}
          </p>
          <div className="flex items-center gap-[10px]">
            <div className="rounded-[70px] p-[10px] w-[24px] h-[24px] bg-[#ebebf9] flex items-center justify-center">
              <p className="font-medium text-[12px] leading-[142%] text-[#724dea]">
                1
              </p>
            </div>
            <p className="font-bold text-[13px] leading-[138%] text-[#222]">
              {t("content.section1.title", { company: company })}
            </p>
          </div>
          <p className="ml-[34px] mt-[10px] font-medium text-[13px] leading-[138%] text-[#222]">
            {t("content.section1.password")}
          </p>
          <p className="ml-[34px] mb-[10px] mt-[10px] font-medium text-[13px] leading-[138%] text-[#222]">
            {t("content.section1.sms")}
          </p>
          <div className="flex items-center gap-[10px] mb-[10px]">
            <div className="rounded-[70px] p-[10px] w-[24px] h-[24px] bg-[#ebebf9] flex items-center justify-center">
              <p className="font-medium text-[12px] leading-[142%] text-[#724dea]">
                2
              </p>
            </div>
            <p className="font-bold text-[13px] leading-[138%] text-[#222]">
              {t("content.section2.title")}
            </p>
          </div>
          <div className="flex items-center gap-[10px]">
            <div className="rounded-[70px] p-[10px] w-[24px] h-[24px] bg-[#ebebf9] flex items-center justify-center">
              <p className="font-medium text-[12px] leading-[142%] text-[#724dea]">
                3
              </p>
            </div>
            <p className="font-bold text-[13px] leading-[138%] text-[#222]">
              {t("content.section3.title")}
            </p>
          </div>
          <p className="mb-[10px] mt-[10px] ml-[34px] font-medium text-[13px] leading-[138%] text-[#222]">
            {t("content.section3.forgotPassword")}
          </p>
          <div className="flex items-center gap-[10px] mb-[10px]">
            <div className="rounded-[70px] p-[10px] w-[24px] h-[24px] bg-[#ebebf9] flex items-center justify-center">
              <p className="font-medium text-[12px] leading-[142%] text-[#724dea]">
                4
              </p>
            </div>
            <p className="font-bold text-[13px] leading-[138%] text-[#222]">
              {t("content.section4.title")}
            </p>
          </div>
          <div className="flex items-center gap-[10px] mb-[10px]">
            <div className="rounded-[70px] p-[10px] w-[24px] h-[24px] bg-[#ebebf9] flex items-center justify-center">
              <p className="font-medium text-[12px] leading-[142%] text-[#724dea]">
                5
              </p>
            </div>
            <p className="font-bold text-[13px] leading-[138%] text-[#222]">
              {t("content.section5.title")}
            </p>
          </div>
        </div>
      </div>
      <div className="px-0 md:px-[20px]">
        <div className="border mt-[30px] md:mt-[50px] border-[#d6d6f9] rounded-lg p-[30px] w-full bg-white">
          <h2
            className="text-[20px] sm:text-[28px] md:text-[36px] font-[700] leading-[100%] text-[#222] mb-[14px] sm:mb-[25px] md:mb-[30px]"
            style={{ fontFamily: "var(--Jakarta)" }}
          >
            {t("section1.title", { company: company })}
          </h2>
          <p className="font-medium text-[13px] md:text-[15px] leading-[133%] text-[#222]">
            {t("section1.description1", { company: company })}
          </p>
          <div className="bg-[#00ba9e] whitespace-nowrap mb-[20px] mt-[20px] text-white font-bold text-[14px] rounded-[8px] px-[32px] py-[10px] w-full sm:w-[235px] text-center cursor-pointer">
            {t("section1.button")}
          </div>
          <div className="p-[10px] w-full mb-[20px] bg-[#ebebf9]">
            <p className="font-medium text-[13px] md:text-[15px] leading-[133%] text-[#222]">
              {t("section1.description2", { company: company })}
            </p>
          </div>
          <p className="mb-[20px] font-medium text-[13px] md:text-[15px] leading-[133%] text-[#222]">
            {t("section1.description3", { company: company })}
          </p>
          <p className="mb-[20px] font-medium text-[13px] md:text-[15px] leading-[133%] text-[#222]">
            {t("section1.description4", { company: company })}
          </p>
          <Image
            src="/image 1.png"
            alt={t("section1.image1Alt", { company: company })}
            width={400}
            height={208}
            className="mb-[14px]"
          />
          <p className="mb-[20px] font-medium text-[11px] leading-[145%] text-[#222]">
            {t("section1.image1Caption", { company: company })}
          </p>
          <h3 className="mb-[20px] font-bold text-[16px] sm:text-[24px] md:text-[30px] leading-[100%] text-[#222]">
            {t("section1.passwordTitle")}
          </h3>
          <p className="mb-[20px] font-medium text-[13px] md:text-[15px] leading-[133%] text-[#222]">
            {t("section1.passwordDescription")}
          </p>
          <Image
            src="/image (3).png"
            alt={t("section1.image2Alt", { company: company })}
            width={400}
            height={208}
            className="mb-[14px]"
          />
          <p className="mb-[20px] font-medium text-[11px] leading-[145%] text-[#222]">
            {t("section1.image2Caption", { company: company })}
          </p>
          <div className="p-[10px] w-full mb-[20px] bg-[#d6d6f9]">
            <p className="font-medium text-[13px] md:text-[15px] leading-[133%] text-[#222]">
              {t("section1.bookmarkTip", { company: company })}
            </p>
          </div>
        </div>
      </div>
      <div className="px-0 md:px-[20px]">
        <p className="font-medium text-[13px] mt-[50px] leading-[138%] text-[#67677a]">
          {t("metadata.addedDate")}
        </p>
        <p className="font-medium text-[13px] leading-[138%] text-[#67677a]">
          {t("metadata.updatedDate")}
        </p>
      </div> */}
    </>
  );
};

export default Login;
