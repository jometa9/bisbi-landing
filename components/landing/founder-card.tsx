"use client";

import { Linkedin } from "lucide-react";
import { useMemo } from "react";

export function FounderCard() {
  const calculateYearsSince2018 = () => {
    const startDate = new Date(2018, 0, 1);
    const currentDate = new Date();
    const yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
    const monthDiff = currentDate.getMonth() - startDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && currentDate.getDate() < startDate.getDate())
    ) {
      return yearsDiff - 1;
    }
    return yearsDiff;
  };

  const numberToWords = (num: number): string => {
    const words: { [key: number]: string } = {
      1: "one",
      2: "two",
      3: "three",
      4: "four",
      5: "five",
      6: "six",
      7: "seven",
      8: "eight",
      9: "nine",
      10: "ten",
      11: "eleven",
      12: "twelve",
      13: "thirteen",
      14: "fourteen",
      15: "fifteen",
      16: "sixteen",
      17: "seventeen",
      18: "eighteen",
      19: "nineteen",
      20: "twenty",
    };

    if (words[num]) {
      return words[num];
    }

    return num.toString();
  };

  const yearsOfExperience = useMemo(() => calculateYearsSince2018(), []);
  const yearsInWords = useMemo(
    () => numberToWords(yearsOfExperience),
    [yearsOfExperience]
  );
  return (
    <div className="bg-gray-100 rounded-lg p-3 ">
      <img
        src="/assets/founder4.png"
        alt="Founder"
        className="w-1/3 object-cover rounded-lg border border-gray-200"
      />
      <p className="text-gray-600 text-2xl mt-2">Joaquin Metayer</p>
      <p className="text-gray-400 text-sm mt-1">Founder & Software Engineer — IPTRADE</p>
      <p className="text-gray-600 text-sm mt-3 max-w-xs font-medium">
      I trade prop firms myself. Built this because every copy trading tool I found was either too complex, too expensive, or not built for how prop firms actually work.      </p>
      
      <div className="flex items-center gap-3 py-3 mt-2">
        <a
          href="https://www.linkedin.com/in/joaquinmetayer/"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:opacity-70 transition-opacity"
        >
          <Linkedin className="w-4 h-4 text-gray-600" />
        </a>
      </div>
    </div>
  );
}
