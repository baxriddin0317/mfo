"use client";
import { useTranslations } from "next-intl";
import React, { useState, useEffect, useCallback } from "react";

type DetailsTextProps = {
  html?: string;
};

const DetailsText: React.FC<DetailsTextProps> = ({ html }) => {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldTruncate, setShouldTruncate] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const fullHtml = html ?? "";
  const previewCharCount = 300;

  const getTextFromHTML = (html: string) => {
    return html.replace(/<[^>]*>?/gm, ""); // Простое удаление тегов
  };

  const truncateHtml = useCallback((htmlString: string, maxLength: number): string => {
    if (typeof document === "undefined") {
      return htmlString;
    }

    const textContent = getTextFromHTML(htmlString);
    if (textContent.length <= maxLength) {
      return htmlString;
    }

    // Create a temporary element to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;

    let textLength = 0;
    let truncated = false;

    const truncateNode = (node: Node): boolean => {
      if (truncated) {
        // Remove this node and all subsequent nodes
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        return false;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (textLength + text.length > maxLength) {
          const remaining = maxLength - textLength;
          node.textContent = text.slice(0, remaining) + "...";
          truncated = true;
          return false;
        }
        textLength += text.length;
        return true;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const children = Array.from(node.childNodes);
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (!truncateNode(child)) {
            // Remove remaining children (iterate backwards to avoid index issues)
            for (let j = children.length - 1; j > i; j--) {
              const nodeToRemove = children[j];
              if (nodeToRemove.parentNode) {
                nodeToRemove.parentNode.removeChild(nodeToRemove);
              }
            }
            break;
          }
        }
        return !truncated;
      }
      return true;
    };

    truncateNode(tempDiv);
    return tempDiv.innerHTML;
  }, []);

  // Calculate displayed content directly without useState to ensure it's always available
  const textContent = getTextFromHTML(fullHtml);
  const needsTruncation = textContent.length > previewCharCount;
  
  const displayedContent = true || !needsTruncation 
    ? fullHtml 
    : truncateHtml(fullHtml, previewCharCount);

  // Update shouldTruncate state for button visibility
  useEffect(() => {
    setShouldTruncate(needsTruncation);
  }, [needsTruncation]);

  return (
    <div className="px-0 md:px-[20px]">
      <div className={`overflow-hidden ${isExpanded ? "h-auto" : "h-16 line-clamp-3"}`}>
        <div
          className="login-content text-[#222] mb-[10px]"
          dangerouslySetInnerHTML={{ __html: displayedContent }}
        />
      </div>

      {shouldTruncate && (
        <p
          className="mb-[30px] w-max md:mb-[50px] text-[13px] md:text-[15px] cursor-pointer underline text-[#724dea] transition-colors duration-200 hover:text-[#9278ea]"
          style={{
            fontFamily: "var(--Montserrat)",
            fontWeight: 500,
            lineHeight: "138%",
            textDecorationSkipInk: "none",
          }}
          onClick={toggleExpanded}
        >
          {isExpanded ? t("common.hide") : t("common.showMore")}
        </p>
      )}
    </div>
  );
};

export default DetailsText;
