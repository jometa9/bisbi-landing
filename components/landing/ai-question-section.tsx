"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AIAssistantAmbientBg } from "@/components/landing/ai-assistant-ambient-bg";

const shortQuestions = [
  "Can I use it on Mac?",
  "Do I need a VPS?",
  "How fast is the trade copying?",
  "Does it support MT5?",
  "Which platforms are supported on Mac?",
];

const allQuestions = [
  "Which platforms are supported on Mac?",
  "How do I connect my MT4 accounts?",
  "How does IPTRADE work with prop firms?",
  "Can I use it on Mac?",
  "Do I need a VPS?",
  "How fast is the trade copying?",
  "Does it support MT5?",
  ...shortQuestions,
];

export function AIQuestionSection() {
  const [displayText, setDisplayText] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const questionIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const questions = isMobile ? shortQuestions : allQuestions;

  useEffect(() => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollLeft =
        textContainerRef.current.scrollWidth;
    }
  }, [displayText]);

  useEffect(() => {
    questionIndex.current = 0;
    charIndex.current = 0;
    isDeleting.current = false;
    setDisplayText("");

    const tick = () => {
      const currentQuestion = questions[questionIndex.current];

      if (!isDeleting.current) {
        if (charIndex.current <= currentQuestion.length) {
          setDisplayText(currentQuestion.slice(0, charIndex.current));
          charIndex.current++;
          timeoutRef.current = setTimeout(tick, 60);
        } else {
          timeoutRef.current = setTimeout(() => {
            isDeleting.current = true;
            tick();
          }, 2000);
        }
      } else {
        if (charIndex.current > 0) {
          charIndex.current--;
          setDisplayText(currentQuestion.slice(0, charIndex.current));
          timeoutRef.current = setTimeout(tick, 35);
        } else {
          isDeleting.current = false;
          questionIndex.current =
            (questionIndex.current + 1) % questions.length;
          timeoutRef.current = setTimeout(tick, 500);
        }
      }
    };

    tick();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [questions]);

  return (
    <section className="max-w-7xl mx-3 xl:mx-auto py-24">
      <Link href="/assistant" className="block">
        <div className="group relative overflow-hidden rounded-lg bg-gray-800 xl:mx-3 p-8 py-20 pb-30 hover:bg-gray-750 transition-colors cursor-pointer">
          <AIAssistantAmbientBg variant="section" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <Sparkles className="w-8 h-8 text-white mb-6" />

            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-3">
              Got questions?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl">
              Our AI assistant knows everything about IPTRADE.
              <br />
              Ask anything and get instant answers.
            </p>

            <div className="group w-full max-w-xl">
              <div className="relative flex items-center p-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300 gap-3">
                <div
                  ref={textContainerRef}
                  className="flex-1 pl-4 text-left overflow-x-auto overflow-y-hidden min-w-0 scrollbar-hide"
                >
                  <div className="text-white text-sm md:text-base whitespace-nowrap inline-block">
                    {displayText}
                    <span className="inline-block w-0.25 h-3 mb-0.75 bg-white/80  animate-pulse align-middle ml-1" />
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-white text-gray-900 rounded-full text-sm font-medium group-hover:bg-gray-200 transition-colors shrink-0">
                  Ask Ugo
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {["Setup", "Differences", "Compatibility", "Prop firms", "Features"].map((chip) => (
                <div
                  key={chip}
                  className="px-3 py-1.5 text-xs text-gray-200/90 border border-white/15 bg-white/5 rounded-full hover:bg-white/12 hover:border-white/25 hover:text-white transition-all"
                >
                  {chip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
