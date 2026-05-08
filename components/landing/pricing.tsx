"use client";

import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

function DashIcon() {
  return (
    <span className="pricing-dash" aria-hidden="true">
      —
    </span>
  );
}

export function Pricing() {
  const { t } = useI18n();
  const router = useRouter();
  const p = t.pricing;
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  const proPrice = billing === "monthly" ? p.pro.monthlyPrice : p.pro.annualPrice;
  const proBilling =
    billing === "monthly" ? p.pro.monthlyBilling : p.pro.annualBilling;

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

        <div className="pricing-toggle-wrap">
          <div className="pricing-toggle" role="tablist" aria-label={p.monthly}>
            <button
              type="button"
              role="tab"
              aria-selected={billing === "monthly"}
              className={`pricing-toggle-btn${billing === "monthly" ? " is-active" : ""}`}
              onClick={() => setBilling("monthly")}
            >
              {p.monthly}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={billing === "annual"}
              className={`pricing-toggle-btn${billing === "annual" ? " is-active" : ""}`}
              onClick={() => setBilling("annual")}
            >
              {p.annual}
              <span className="pricing-save">{p.saveBadge}</span>
            </button>
          </div>
        </div>

        <div className="pricing-grid">
          <div className="pricing-card pricing-card--free">
            <div className="pricing-card-head">
              <span className="pricing-card-name">{p.free.name}</span>
              <div className="pricing-card-price-row">
                <span className="pricing-card-price">{p.free.price}</span>
                <span className="pricing-card-period">{p.free.period}</span>
              </div>
              <p className="pricing-card-tagline">{p.free.tagline}</p>
            </div>
            <ul className="pricing-features">
              {p.free.features.map((f, i) => (
                <li key={i}>
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <div className="pricing-card-foot">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="pricing-cta pricing-cta--free"
              >
                {p.free.cta}
              </button>
            </div>
          </div>

          <div className="pricing-card pricing-card--pro">
            <div className="pricing-card-ribbon">{p.pro.ribbon}</div>
            <div className="pricing-card-head">
              <span className="pricing-card-name pricing-card-name--pro">
                {p.pro.name}
              </span>
              <div className="pricing-card-price-row">
                <span className="pricing-card-price">{proPrice}</span>
                <span className="pricing-card-period">/ {p.pro.month}</span>
              </div>
              <p className="pricing-card-tagline pricing-card-tagline--billing">
                {proBilling}
              </p>
            </div>
            <ul className="pricing-features">
              {p.pro.features.map((f, i) => (
                <li key={i}>
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>
            <div className="pricing-card-foot">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="pricing-cta pricing-cta--pro"
              >
                {p.pro.cta}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pricing-compare">
        <div className="pricing-compare-table-wrap">
          <table className="pricing-compare-table">
            <thead>
              <tr>
                <th aria-hidden="true"></th>
                <th className="is-bisbi">
                  <span className="pricing-compare-bisbi-mark">
                    {p.comparison.columns.bisbi}
                  </span>
                </th>
                <th>
                  <img
                    src="/assets/wispr-logo.svg"
                    alt={p.comparison.columns.wispr}
                    className="pricing-compare-logo"
                  />
                </th>
                <th>
                  <img
                    src="/assets/vibetyper-logo.webp"
                    alt={p.comparison.columns.vibetyper}
                    className="pricing-compare-logo pricing-compare-logo--vibetyper"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {p.comparison.rows.map((row, i) => (
                <tr key={i}>
                  <th scope="row">{row.label}</th>
                  <td className="is-bisbi">
                    {row.bisbi === "true" ? <CheckIcon /> : row.bisbi === "false" ? <DashIcon /> : row.bisbi}
                  </td>
                  <td>
                    {row.wispr === "true" ? <CheckIcon /> : row.wispr === "false" ? <DashIcon /> : row.wispr}
                  </td>
                  <td>
                    {row.vibetyper === "true" ? <CheckIcon /> : row.vibetyper === "false" ? <DashIcon /> : row.vibetyper}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
