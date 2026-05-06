import type { DailySaasMetrics } from "@/lib/reporting/daily-saas-metrics";

function formatMoneyCents(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function formatRevenueByCurrency(
  byCurrency: Record<string, number>
): string {
  const entries = Object.entries(byCurrency).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  if (entries.length === 0) return "—";
  return entries.map(([c, cents]) => formatMoneyCents(cents, c)).join(" · ");
}

export function buildDailyReportEmbed(metrics: DailySaasMetrics) {
  const stripeNote = metrics.stripeError
    ? `\n_Stripe: ${metrics.stripeError}_`
    : "";

  return {
    title: "Daily report",
    description: `Automatic summary.` + stripeNote,
    color: 0x5865f2,
    fields: [
      {
        name: "Last 24 hours",
        value: [
          `· New signups: **${metrics.newUsers24h}**`,
          `· New paid subscriptions (DB): **${metrics.newPaidSubscriptionUsers24h}**`,
          `· Renewal invoices (Stripe): **${metrics.renewalStripeInvoices24h}** · mapped users: **${metrics.renewalUsers24h}**`,
          `· **Unique users** (new sub or renewal): **${metrics.distinctUsersSubscribedOrRenewed24h}**`,
        ].join("\n"),
        inline: false,
      },
      {
        name: "Month to date",
        value: [
          `· Signups (month): **${metrics.registrationsMonthArgentina}**`,
          `· Subscription invoice revenue (Stripe, month): ${formatRevenueByCurrency(metrics.subscriptionRevenueMonthCentsByCurrency)}`,
        ].join("\n"),
        inline: false,
      },
      {
        name: "Current state",
        value: [
          `· Active paying subscribers: **${metrics.paidSubscribersNow}**`,
          `· Trialing: **${metrics.trialingSubscribersNow}**`,
          `· Total users (not deleted): **${metrics.totalUsers}**`,
          `· Unread inbox: **${metrics.unopenedInboxEmails}**`,
        ].join("\n"),
        inline: false,
      },
      {
        name: "Health / risk",
        value: [
          `· Subs set to canceled (touched in 24h): **${metrics.canceledSubscriptionsUpdated24h}**`,
          `· Paid subs expiring within ≤7 days: **${metrics.paidSubscriptionsExpiringWithin7Days}**`,
        ].join("\n"),
        inline: false,
      },
    ],
    timestamp: metrics.generatedAtIso,
  };
}

export async function postDailyReportToDiscord(
  webhookUrl: string,
  metrics: DailySaasMetrics
): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [buildDailyReportEmbed(metrics)],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord webhook failed: ${res.status} ${text}`);
  }
}
