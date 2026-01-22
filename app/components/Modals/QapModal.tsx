"use client";
import { createQuestion } from "@/app/services/questionsService";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  mfoId: number;
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

export default function QapModal({ isOpen, onClose, mfoId }: ReviewModalProps) {
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations();

  const handleSubmit = async () => {
    if (!name || !email || !text) {
      toast.error(t("QapCompanyPage.errorFillFields"));
      return;
    }

    if (!agreePolicy) {
      toast.error(t("QapCompanyPage.errorAcceptPolicy"));
      return;
    }

    try {
      setIsSubmitting(true);
      await createQuestion({
        mfo_id: mfoId,
        author_name: name,
        author_email: email,
        question_text: text,
      });
      toast.success(t("QapCompanyPage.successSubmitted"));
      onClose();
      setName("");
      setEmail("");
      setText("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error?.message || t("QapCompanyPage.errorSubmit");
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
        className="bg-white w-[335px] max-h-[calc(100vh-40px)] overflow-y-auto rounded-[8px] border border-[#ebebf9] p-[14px] relative scroll-hidden"
      >
        <div className="flex justify-between items-center mb-[14px]">
          <h2
            className="font-bold text-[20px] text-[#222]"
            style={{ fontFamily: "var(--second-family)" }}
          >
            {t("QapCompanyPage.modalTitle")}
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
          {
            key: "name",
            label: t("QapCompanyPage.formName"),
            value: name,
            onChange: setName,
          },
          {
            key: "email",
            label: t("QapCompanyPage.formEmail"),
            value: email,
            onChange: setEmail,
          },
          {
            key: "question",
            label: t("QapCompanyPage.formQuestion"),
            value: text,
            onChange: setText,
          },
        ].map(({ key, label, value, onChange }, i) => (
          <div key={i} className="mb-[14px]">
            <p
              className="text-[13px] text-[#222]"
              style={{ fontFamily: "var(--third-family)" }}
            >
              {label}
            </p>
            {key === "question" ? (
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
          className="bg-[#00ba9e]  cursor-pointer text-white font-bold text-[14px] rounded-[8px] px-[16px] py-[9.5px] w-full text-center mb-[14px] disabled:opacity-50"
        >
          {isSubmitting
            ? t("QapCompanyPage.submitting")
            : t("QapCompanyPage.submitButton")}
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
