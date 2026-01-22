import React from "react";
import clsx from "clsx";
import Link from "next/link";

interface ButtonGreenBorderProps {
  text: string;
  width: string;
  className?: string;
  link?: string;
  onClick?: () => void;
}

const ButtonGreenBorder: React.FC<ButtonGreenBorderProps> = ({
  text,
  link,
  width,
  className,
  onClick,
}) => {
  const commonClasses = clsx(
    "border border-[#00ba9e] text-[#00ba9e] rounded-[8px] flex items-center justify-center mx-auto cursor-pointer  font-medium text-[14px] leading-[136%] text-center",
    "transition-all duration-200 ease-in-out hover:bg-[#00ba9e]/10 ",
    className
  );

  const style = {
    width,
    height: "39px",
    padding: "12px 10px",
  };

  
  return link ? (
    <Link
      scroll={true}
      onClick={onClick}
      href={link}
      className={commonClasses}
      style={style}
    >
      {text}
    </Link>
  ) : (
    <div onClick={onClick} className={commonClasses} style={style}>
      {text}
    </div>
  );
};

export default ButtonGreenBorder;
