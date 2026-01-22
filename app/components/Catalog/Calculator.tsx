"use client";

import { useState, useMemo, useEffect } from "react";
import CalctTarifButtonsts from "../CalctTarifButtons";
import { useTranslations } from "next-intl";

interface Tariff {
  id: number;
  name: string;
  amount: string; // "100.00"
  rate: string; // "5.00" — ставка %
  term_days: number;
  real_annual_rate: string; // "1.00" — ПКС %
  get_money_url: string;
  min_amount: string;
  max_amount: string;
  min_term_days: number;
  max_term_days: number;
  type?: string;
}

interface CalculatorProps {
  tariffs: Tariff[];
  selectedTariff?: Tariff | null;
}

const Calculator = ({ tariffs, selectedTariff }: CalculatorProps) => {
  const activeTariff =
    selectedTariff || (tariffs.length > 0 ? tariffs[0] : null);
  const t = useTranslations();

  const roundToStep = (value: number, step: number) => {
    return Math.round(value / step) * step;
  };

  const [amount, setAmount] = useState(() =>
    activeTariff ? roundToStep(parseFloat(activeTariff.amount), 1000) : 50000,
  );
  const [days, setDays] = useState(() =>
    activeTariff ? activeTariff.term_days : 31,
  );

  useEffect(() => {
    if (activeTariff) {
      setAmount(roundToStep(parseFloat(activeTariff.amount), 1000));
      setDays(activeTariff.term_days);
    }
  }, [activeTariff]);

  const repay = useMemo(() => {
    if (!activeTariff) return 0;
    const rate = parseFloat(activeTariff.rate);
    return amount + (amount * rate * days) / 100;
  }, [amount, days, activeTariff]);

  return (
    <>
      <div className="mb-[19px] flex gap-[10px] justify-between items-center">
        <div className=" border-[#d6d6f9] border-2 rounded-lg px-4 pt-[13px] pb-[9px] w-[260px] h-[69px] relative">
          <p
            className="font-medium text-[12px] leading-[142%] text-[#222]"
            style={{ fontFamily: "var(--Montserrat)" }}
          >
            {t("common.sum")}
          </p>
          <div className="flex gap-[5px] items-center">
            <p
              className="font-bold text-[20px] leading-[130%] text-[#222]"
              style={{ fontFamily: "var(--Montserrat)" }}
            >
              {amount.toLocaleString("ru-RU")}
            </p>
            <p
              className="font-bold text-[20px] leading-[130%] text-[#67677a]"
              style={{ fontFamily: "var(--Montserrat)" }}
            >
              ₴
            </p>
          </div>
          <input
            type="range"
            min={
              activeTariff
                ? roundToStep(parseFloat(activeTariff.min_amount), 1000)
                : 1000
            }
            max={
              activeTariff
                ? roundToStep(parseFloat(activeTariff.max_amount), 1000)
                : 100000
            }
            step="1000"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="slider absolute bottom-[0px] left-0 w-full"
          />
        </div>

        <div className=" border-[#d6d6f9] border-2 rounded-lg px-4 pt-[13px] pb-[9px] w-[260px] h-[69px] relative">
          <p
            className="font-medium text-[12px] leading-[142%] text-[#222]"
            style={{ fontFamily: "var(--Montserrat)" }}
          >
            {t("common.loanTerms")}
          </p>
          <div className="flex gap-[5px] items-center">
            <p
              className="font-bold text-[20px] leading-[130%] text-[#222]"
              style={{ fontFamily: "var(--Montserrat)" }}
            >
              {days}
            </p>
            <p
              className="font-bold text-[20px] leading-[130%] text-[#67677a]"
              style={{ fontFamily: "var(--Montserrat)" }}
            >
              {days === 1
                ? t("Catalog.calculator.day")
                : t("Catalog.calculator.days")}
            </p>
          </div>
          <input
            type="range"
            min={activeTariff ? activeTariff.min_term_days : 7}
            max={activeTariff ? activeTariff.max_term_days : 180}
            step="1"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="slider absolute bottom-[0px] left-0 w-full"
          />
        </div>
      </div>

      <div className="mb-[19px]">
        <div className="flex justify-between">
          <p className="font-medium mb-[13px] text-[14px] leading-[136%] text-[#67677a]">
            {t("Catalog.calculator.borrow")}
          </p>
          <p className="font-medium text-[14px] leading-[136%] text-right text-[#222]">
            {amount.toLocaleString("ru-RU")}₴
          </p>
        </div>
        <hr className="mb-[16px]" />
        <div className="flex justify-between">
          <p className="font-medium mb-[13px] text-[14px] leading-[136%] text-[#67677a]">
            {t("Catalog.calculator.repay")}
          </p>
          <p className="font-medium text-[14px] leading-[136%] text-right text-[#222]">
            {repay.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}₴
          </p>
        </div>
        <hr className="mb-[16px]" />
        <div className="flex justify-between">
          <p className="font-medium mb-[13px] text-[14px] leading-[136%] text-[#67677a]">
            {t("Catalog.calculator.rate")}
          </p>
          <p className="font-medium text-[14px] leading-[136%] text-right text-[#222]">
            {activeTariff?.rate ?? "-"}%
          </p>
        </div>
        <hr className="mb-[16px]" />
        <div className="flex justify-between">
          <p className="font-medium mb-[13px] text-[14px] leading-[136%] text-[#67677a]">
            {t("Catalog.calculator.pks")}
          </p>
          <p className="font-medium text-[14px] leading-[136%] text-right text-[#222]">
            {activeTariff?.real_annual_rate ?? "-"}%
          </p>
        </div>
        <hr className="mb-[16px]" />
      </div>
    </>
  );
};

// Wrapper component that manages the shared state
interface TariffCalculatorWrapperProps {
  tariffs: Tariff[];
}

export const TariffCalculatorWrapper = ({
  tariffs,
}: TariffCalculatorWrapperProps) => {
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(
    tariffs.length > 0 ? tariffs[0] : null,
  );

  const handleTariffSelect = (tariff: Tariff) => {
    setSelectedTariff(tariff);
  };

  return (
    <>
      <CalctTarifButtonsts
        tariffs={tariffs}
        onSelect={handleTariffSelect}
        selectedTariffId={selectedTariff?.id || null}
      />
      <Calculator tariffs={tariffs} selectedTariff={selectedTariff} />
    </>
  );
};

export default Calculator;
