"use client";

import { DownloadButtons } from "@/components/landing/download-buttons";
import { GitHubIcon } from "@/components/icons/github-icon";
import { useI18n } from "@/lib/i18n";
import { SOURCE_REPO_URL } from "@/lib/downloads";

function CheckIcon() {
  return (
    <svg
      className="pricing-check"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8.5l3.2 3.2L13 5" />
    </svg>
  );
}

export function Pricing() {
  const { t } = useI18n();
  const p = t.pricing;

  return (
    <div className="pricing-wrap">
      <div className="pricing-shell">
        <div className="pricing-shell-head">
          <h2 className="pricing-title">
            {p.title1}
            <span className="block">
              <span style={{ color: "#7BA89C" }}>{p.title2}</span>
            </span>
          </h2>
          <p className="pricing-desc">{p.description}</p>
        </div>

        <div className="pricing-card pricing-card--free pricing-card--wide">
          <div className="pricing-card-watermark" aria-hidden="true">
            <GitHubIcon />
          </div>

          <div className="pricing-card-wide-left">
            <div className="pricing-card-head">
              <span className="pricing-card-name">{p.free.name}</span>
              <div className="pricing-card-price-row">
                <span className="pricing-card-price">{p.free.price}</span>
                <span className="pricing-card-period">{p.free.period}</span>
              </div>
              <p className="pricing-card-tagline">{p.free.tagline}</p>
            </div>
            <div className="pricing-card-foot pricing-card-foot--stack">
              <DownloadButtons variant="cta" />
              <a
                href={SOURCE_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="pricing-source-link"
              >
                <GitHubIcon className="pricing-source-icon" />
                {p.free.sourceLink}
              </a>
            </div>
          </div>

          <ul className="pricing-features pricing-card-wide-right">
            {p.free.features.map((f, i) => (
              <li key={i}>
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
