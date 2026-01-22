import { useTranslations } from "next-intl";
import Link from "next/link";
import ButtonGreenBorder from "../ui/ButtonGreenBorder";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="px-0 md:px-[20px] min-h-[60vh] flex items-center justify-center">
      <div className="p-[20px] md:p-[40px] bg-white rounded-lg max-w-2xl w-full text-center">
        <h1 className="text-[48px] md:text-[72px] font-bold text-[#222] mb-[20px]">
          404
        </h1>
        <h2 className="text-[24px] md:text-[32px] font-bold text-[#222] mb-[15px]">
          {t("title")}
        </h2>
        <p className="text-[15px] md:text-[17px] text-[#67677a] mb-[30px] md:mb-[40px]">
          {t("description")}
        </p>

        <div className="flex flex-col md:flex-row gap-[15px] justify-center items-center">
          <Link href="/" className="w-full md:w-auto">
            <ButtonGreenBorder text={t("goHome")} width="100%" />
          </Link>
          <Link href="/mfo" className="w-full md:w-auto">
            <ButtonGreenBorder text={t("goToMfo")} width="100%" />
          </Link>
          <Link href="/loan" className="w-full md:w-auto">
            <ButtonGreenBorder text={t("goToLoans")} width="100%" />
          </Link>
        </div>
      </div>
    </div>
  );
}

