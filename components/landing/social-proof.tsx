"use client";

import { Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function SocialProof() {
  const { t } = useI18n();
  const c = t.socialProof;

  return (
    <>
      <div className="proof-grid">
        {[...c.items, ...c.items].map((item, i) => {
          const isClone = i >= c.items.length;
          return (
            <figure
              key={i}
              aria-hidden={isClone || undefined}
              className={`proof-card${i % 2 === 0 ? " proof-card--tint" : ""}${isClone ? " proof-card--clone" : ""}`}
            >
              <Quote
                className="proof-card-mark"
                aria-hidden="true"
                strokeWidth={1.2}
              />
              <blockquote className="proof-card-quote">{item.quote}</blockquote>
              <figcaption className="proof-card-role">— {item.role}</figcaption>
            </figure>
          );
        })}
      </div>
    </>
  );
}
