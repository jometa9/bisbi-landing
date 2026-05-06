"use client";

import { useState } from "react";

interface PropFirmFAQ {
  id: string;
  question: string;
  answer: string;
}

const propFirmFaqs: PropFirmFAQ[] = [
  {
    id: "mt5-no-terminal",
    question: "Do I need MetaTrader open to connect my MT5 prop firm account?",
    answer: "No. IPTRADE's MT5 direct connection lets you enter your account credentials (login, server name, and password) and connect without installing or opening MetaTrader. The server name is provided by your prop firm when they create the account. Works with any MT5 prop firm or broker.",
  },
  {
    id: "safe-for-prop-firms",
    question: "Why does IPTRADE help with prop firm IP rules when others don't?",
    answer: "IPTRADE runs locally on your computer with all accounts connecting from the same IP. Other services often use cloud servers, so each account can show a different IP (yours vs the server)—which many prop firms flag. We're designed for single-IP use; other prop firm rules vary by firm—always check their terms.",
  },
  {
    id: "detect-iptrade",
    question: "Can prop firms detect IPTRADE?",
    answer: "From an IP standpoint: everything runs on your machine with one IP for all accounts, so it looks like manual trading from one location. We don't represent that no prop firm can ever detect any aspect of your setup; you should verify each firm's terms.",
  },
  {
    id: "work-with-ftmo",
    question: "Does it work with all prop firms?",
    answer: "IPTRADE is built for single-IP use, which helps meet typical IP restrictions. Other rules (copy trading, EAs, limits) depend on each prop firm. You must read each firm's terms and do your own research before using our tool. See our Terms of Use.",
  },
  {
    id: "how-many-accounts",
    question: "How many challenge accounts can I run at once?",
    answer: "With the Unlimited plan ($50/month), you can run unlimited challenge accounts. Many traders run 5-10 challenges simultaneously.",
  },
  {
    id: "different-brokers",
    question: "Can I copy between different brokers?",
    answer: "Yes! IPTRADE supports MT4, MT5 and cTrader with full symbol translation. You can copy between different brokers and platforms seamlessly.",
  },
];

export function PropFirmFAQSection() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div>
      <p className="text-xl text-gray-600 mb-1">Common questions</p>
      <p className="md:text-3xl text-2xl mb-3 text-gray-900">
        Frequently Asked Questions
      </p>
      
      {propFirmFaqs.map((item: PropFirmFAQ) => (
        <div key={item.id} className="rounded-lg overflow-hidden py-2">
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full text-gray-600 hover:text-gray-400 cursor-pointer text-left"
          >
            <h3 className="pr-3">{item.question}</h3>
          </button>
          {openItems[item.id] && (
            <div className="py-3 text-sm text-gray-400 max-w-xl">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
