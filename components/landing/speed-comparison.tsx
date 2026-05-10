"use client";

import { useI18n } from "@/lib/i18n";

export function SpeedComparison() {
  const { t } = useI18n();
  const c = t.speedComparison;

  const phrases = c.phrases;
  const phraseLoop = [...phrases, ...phrases];

  return (
    <div className="speed-grid">
      <div className="speed-card speed-card--keyboard">
        <div className="speed-card-watermark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M6 13h.01M9 13h.01M12 13h.01M15 13h.01M18 13h.01M8 16h8" />
          </svg>
        </div>
        <div className="speed-card-content">
          <span className="speed-card-label">{c.keyboardLabel}</span>
          <div className="speed-card-value">
            <span className="speed-card-number">40</span>
            <span className="speed-card-unit">{c.unitFull}</span>
          </div>
          <p className="speed-card-hint">{c.keyboardHint}</p>
          <span className="speed-card-footer">{c.keyboardFooter}</span>
        </div>
      </div>

      <div className="speed-card speed-card--bisbi">
        <div className="speed-card-bisbi-bg" aria-hidden="true">
          <div className="speed-marquee speed-marquee--row1">
            {phraseLoop.map((p, i) => (
              <span key={`r1-${i}`} className="speed-marquee-item">
                {p}
              </span>
            ))}
          </div>
          <div className="speed-marquee speed-marquee--row2">
            {phraseLoop.map((p, i) => (
              <span key={`r2-${i}`} className="speed-marquee-item">
                {p}
              </span>
            ))}
          </div>
          <div className="speed-marquee speed-marquee--row3">
            {phraseLoop.map((p, i) => (
              <span key={`r3-${i}`} className="speed-marquee-item">
                {p}
              </span>
            ))}
          </div>
          <div className="speed-marquee speed-marquee--row4">
            {phraseLoop.map((p, i) => (
              <span key={`r4-${i}`} className="speed-marquee-item">
                {p}
              </span>
            ))}
          </div>
          <div className="speed-marquee speed-marquee--row5">
            {phraseLoop.map((p, i) => (
              <span key={`r5-${i}`} className="speed-marquee-item">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="speed-card-content speed-card-content--bisbi">
          <span className="speed-card-label speed-card-label--bisbi">
            {c.bisbiLabel}
          </span>
          <div className="speed-card-value">
            <span className="speed-card-number speed-card-number--bisbi">
              220
            </span>
            <span className="speed-card-unit speed-card-unit--bisbi">
              {c.unitFull}
            </span>
          </div>
          <div className="speed-card-wave" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i} style={{ animationDelay: `${i * 90}ms` }} />
            ))}
          </div>
          <p className="speed-card-hint speed-card-hint--bisbi">{c.bisbiHint}</p>
          <span className="speed-card-footer speed-card-footer--bisbi">
            {c.bisbiFooter}
          </span>
        </div>
      </div>
    </div>
  );
}
