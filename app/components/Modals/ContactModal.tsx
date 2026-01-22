/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ContactsService } from "@/app/services/contactsService";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Checkbox = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <div
    onClick={onChange}
    className="w-[14px] h-[14px] rounded-[2px] border border-[#724DEA] flex items-center justify-center cursor-pointer"
  >
    {checked && (
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6L5 9L10 3"
          stroke="#724DEA"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </div>
);

export default function ContactModal({ isOpen, onClose }: ReviewModalProps) {
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations();

  const handleSubmit = async () => {
    if (!name || !email || !text) {
      toast.error("Пожалуйста, заполните все поля.");
      return;
    }

    if (!agreePolicy) {
      toast.error("Необходимо принять политику конфиденциальности.");
      return;
    }

    try {
      setIsSubmitting(true);
      await ContactsService.sendContactForm({
        name,
        email,
        message: text,
        notifications_enabled: false,
        privacy_accepted: true,
      });
      toast.success("Вопрос успешно отправлен!");
      onClose();
      setName("");
      setEmail("");
      setText("");
    } catch (error: any) {
      const errorMessage = error?.message || "Ошибка при отправке вопроса.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center text-black">
      <div
        style={{ scrollbarWidth: "none" }}
        className="bg-white w-[335px]   max-h-[calc(100vh-40px)] overflow-y-auto rounded-[8px] border border-[#ebebf9] p-[14px] relative scroll-hidden"
      >
        <div className="flex justify-between items-center mb-[14px]">
          <h2
            className="font-bold text-[20px] text-[#222]"
            style={{ fontFamily: "var(--second-family)" }}
          >
            Написать нам
          </h2>
          <button
            onClick={onClose}
            className="text-[#222] cursor-pointer hover:text-[#724DEA] transition"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M1.24 1L8 7.88M8 7.88L15 15M8 7.88L1 15M8 7.88L14.76 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {[
          { label: "Имя", value: name, onChange: setName },
          { label: "E-mail", value: email, onChange: setEmail },
          { label: "Напишите ваш вопрос", value: text, onChange: setText },
        ].map(({ label, value, onChange }, i) => (
          <div key={i} className="mb-[14px]">
            <p
              className="text-[13px] text-[#222]"
              style={{ fontFamily: "var(--third-family)" }}
            >
              {label}
            </p>
            {label === "Напишите ваш вопрос" ? (
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="border border-[#e0e0e0] rounded-[6px] px-3 py-2 w-[307px] h-[119px] bg-white resize-none"
              />
            ) : (
              <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="border border-[#e0e0e0] rounded-[6px] px-3 py-2 w-[307px] h-[40px] bg-white"
              />
            )}
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-[#00ba9e] cursor-pointer text-white font-bold text-[14px] rounded-[8px] px-[16px] py-[9.5px] w-full text-center mb-[14px] disabled:opacity-50"
        >
          {isSubmitting ? "Отправка..." : "Отправить"}
        </button>

        <div
          className="flex items-start gap-[8px] mb-[14px] cursor-pointer"
          onClick={() => setAgreePolicy(!agreePolicy)}
        >
          <Checkbox
            checked={agreePolicy}
            onChange={() => setAgreePolicy(!agreePolicy)}
          />
          <p
            className="flex-1 text-[12px] text-[#222] font-medium leading-[142%]"
            style={{ fontFamily: "var(--font-family)" }}
          >
            {t("common.agreement")}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
