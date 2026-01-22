"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import ContactModal from "./Modals/ContactModal";

type ContactContentProps = {
  settings: Record<string, string> | undefined
}
export default function ContactContent({ settings }: ContactContentProps) {
  const t = useTranslations("Contacts"); // ключ неймспейса, как в JSON
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="px-0 md:px-[20px]">
      <div className="p-[10px] sm:p-[20px] md:p-[20px] mb-[50px] bg-white rounded-lg">
        <div className="flex justify-between flex-col sm:flex-row gap-[20px]">
          <div className="flex flex-col gap-[10px]">
            <p className="font-medium text-[11px] sm:text-[12px] leading-[142%] text-[#67677a]">
              {t("addressLabel") || "Адрес"}
            </p>
            <p className="font-bold text-[14px] sm:text-[16px] md:text-[18px] leading-[133%] text-[#222]">
              {settings?.address || t("address") || "61174, Харьковская обл., город Харьков, ул. Архитекторов 32"}
            </p>
            <hr />
          </div>

          <div className="flex flex-col gap-[10px]">
            <p className="font-medium text-[11px] sm:text-[12px] leading-[142%] text-[#67677a]">
              {t("emailLabel") || "Email"}
            </p>
            <p className="font-bold text-[14px] sm:text-[16px] md:text-[18px] leading-[133%] text-[#222]">
              {settings?.email || t("email") || "admin@mfoxa.com.ua"}
            </p>
            <hr />
          </div>

          <div className="flex flex-col gap-[10px]">
            <p className="font-medium text-[11px] sm:text-[12px] leading-[142%] text-[#67677a]">
              {t("phoneLabel") || "Телефон"}
            </p>
            <p className="font-bold text-[14px] sm:text-[16px] md:text-[18px] leading-[133%] text-[#222]">
              {settings?.phone || t("phone") || "+38 (093) 000-00-00"}
            </p>
            <hr />
          </div>
        </div>

        {/* Кнопка для открытия модалки */}
        <div
          onClick={() => setModalOpen(true)}
          className="bg-[#00ba9e] mt-[10px] sm:mt-[20px] mb-[10px] sm:mb-[20px] md:mb-[20px] text-white font-bold text-[14px] rounded-[8px] px-[32px] py-[10px] w-full sm:w-[235px] text-center cursor-pointer"
        >
          {t("button") || "Написать нам"}
        </div>

        <div className="w-full h-[300px] overflow-hidden rounded-lg">
          <iframe
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
`${settings?.latitude || "50.4504"},${settings?.longitude || "30.5234"}`
            )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Модалка */}
        <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </div>
  );
}
