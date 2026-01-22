"use client";

import { useState } from "react";

type Tariff = {
  id: number;
  name: string;
  amount: string; // будет преобразовано в число
  rate: string; // процент в день
  term_days: number;
  real_annual_rate: string; // ПКС %
  get_money_url: string;
  min_amount: string;
  max_amount: string;
  min_term_days: number;
  max_term_days: number;
  type?: string;
};

type Props = {
  tariffs: Tariff[];
  onSelect?: (tariff: Tariff) => void;
  selectedTariffId?: number | null;
};

const CalctTarifButtonsts = ({
  tariffs,
  onSelect,
  selectedTariffId,
}: Props) => {
  const [activeTariffId, setActiveTariffId] = useState<number | null>(
    selectedTariffId || (tariffs.length > 0 ? tariffs[0].id : null)
  );

  const handleClick = (tariff: Tariff) => {
    setActiveTariffId(tariff.id);
    if (onSelect) onSelect(tariff);
  };

  const currentActiveTariffId =
    selectedTariffId !== undefined ? selectedTariffId : activeTariffId;

  return (
    <div className="p-4 max-w-xl mx-auto text-sm font-sans">
      {/* Кнопки тарифов */}
      <div className="flex mb-[10px] gap-[10px]">
        {tariffs.map((tariff) => (
          <div
            onClick={() => handleClick(tariff)}
            key={tariff.id}
            style={{ fontFamily: "var(--Montserrat)" }}
            className={`px-[10px] py-[8px] rounded-[35px] h-[33px] flex items-center justify-center text-[11px] font-medium leading-[145%] text-center cursor-pointer
              ${
                currentActiveTariffId === tariff.id
                  ? "bg-[#724dea] text-white"
                  : "bg-[#d6d6f9] text-[#9393a3] hover:bg-[#b0a9f7] hover:text-[#724dea] transition-colors duration-200"
              }`}
          >
            <p
              className={`text-[12px] leading-[142%] font-medium ${
                currentActiveTariffId === tariff.id
                  ? "text-white"
                  : "text-[#724dea]"
              }`}
              style={{ fontFamily: "var(--Montserrat)" }}
            >
              {tariff.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalctTarifButtonsts;
