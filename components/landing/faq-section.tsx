"use client";

import { FAQItem, faqsData } from "@/lib/faqs-data";
import { useState } from "react";

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="max-w-3xl">
      {faqsData.map((item: FAQItem) => (
        <div key={item.id} className="rounded-lg overflow-hidden py-2">
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full flex justify-between items-center text-gray-600 text-left hover:text-gray-400 cursor-pointer"
          >
            <h3 className="pr-3 ">{item.question}</h3>
          </button>
          {openItems[item.id] && (
            <div className="py-3 text-sm text-gray-400 max-w-xl">
              {typeof item.answer === "string" ? item.answer : item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
