import { db } from "@/lib/db/drizzle";
import { inboundEmail, user, userProductSubscription } from "@/lib/db/schema";
import { getStripe } from "@/lib/payments/stripe";
import {
  and,
  count,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";

const monthStartArgentina = sql<Date>`(date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires') AT TIME ZONE 'America/Argentina/Buenos_Aires')`;

const PAID_TIERS = ["pro", "unlimited"] as const;

const ACTIVE_OR_CANCELING_STATUSES = [
  "active",
  "trialing",
  "admin_assigned",
  "canceling",
] as const;

function isStripeConfigured(): boolean {
  const k = process.env.STRIPE_SECRET_KEY;
  return !!k && k.startsWith("sk_");
}

export type DailySaasMetrics = {
  generatedAtIso: string;
  newUsers24h: number;
  newPaidSubscriptionUsers24h: number;
  renewalStripeInvoices24h: number;
  renewalUsers24h: number;
  distinctUsersSubscribedOrRenewed24h: number;
  paidSubscribersNow: number;
  trialingSubscribersNow: number;
  registrationsMonthArgentina: number;
  subscriptionRevenueMonthCentsByCurrency: Record<string, number>;
  unopenedInboxEmails: number;
  totalUsers: number;
  canceledSubscriptionsUpdated24h: number;
  paidSubscriptionsExpiringWithin7Days: number;
  stripeError?: string;
};

async function countNewUsers24h(since: Date): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(user)
    .where(and(isNull(user.deletedAt), gte(user.createdAt, since)));
  return Number(row?.n ?? 0);
}

async function countRegistrationsMonthAr(): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(user)
    .where(
      and(isNull(user.deletedAt), gte(user.createdAt, monthStartArgentina))
    );
  return Number(row?.n ?? 0);
}

async function countTotalUsers(): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(user)
    .where(isNull(user.deletedAt));
  return Number(row?.n ?? 0);
}

function paidSubscriptionActiveClause(now: Date) {
  return and(
    eq(userProductSubscription.productKey, "multi"),
    inArray(userProductSubscription.tier, PAID_TIERS as unknown as string[]),
    or(
      inArray(
        userProductSubscription.status,
        ACTIVE_OR_CANCELING_STATUSES as unknown as string[]
      ),
      and(
        eq(userProductSubscription.status, "canceled"),
        isNotNull(userProductSubscription.expiresAt),
        gt(userProductSubscription.expiresAt, now)
      )
    )
  );
}

async function countPaidSubscribersNow(now: Date): Promise<number> {
  const [row] = await db
    .select({
      n: sql<number>`cast(count(distinct ${userProductSubscription.userId}) as int)`,
    })
    .from(userProductSubscription)
    .where(paidSubscriptionActiveClause(now));
  return Number(row?.n ?? 0);
}

async function countTrialingNow(now: Date): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(userProductSubscription)
    .where(
      and(
        eq(userProductSubscription.productKey, "multi"),
        eq(userProductSubscription.status, "trialing")
      )
    );
  return Number(row?.n ?? 0);
}

async function countNewPaidSubscriptionUsers24h(since: Date): Promise<number> {
  const [row] = await db
    .select({
      n: sql<number>`cast(count(distinct ${userProductSubscription.userId}) as int)`,
    })
    .from(userProductSubscription)
    .where(
      and(
        eq(userProductSubscription.productKey, "multi"),
        inArray(userProductSubscription.tier, PAID_TIERS as unknown as string[]),
        isNotNull(userProductSubscription.stripeSubscriptionId),
        gte(userProductSubscription.createdAt, since)
      )
    );
  return Number(row?.n ?? 0);
}

async function userIdsNewPaidSubs24h(since: Date): Promise<string[]> {
  const rows = await db
    .select({ userId: userProductSubscription.userId })
    .from(userProductSubscription)
    .where(
      and(
        eq(userProductSubscription.productKey, "multi"),
        inArray(userProductSubscription.tier, PAID_TIERS as unknown as string[]),
        isNotNull(userProductSubscription.stripeSubscriptionId),
        gte(userProductSubscription.createdAt, since)
      )
    )
    .groupBy(userProductSubscription.userId);
  return rows.map((r) => r.userId);
}

async function countCanceledSubsUpdated24h(since: Date): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(userProductSubscription)
    .where(
      and(
        eq(userProductSubscription.productKey, "multi"),
        eq(userProductSubscription.status, "canceled"),
        gte(userProductSubscription.updatedAt, since)
      )
    );
  return Number(row?.n ?? 0);
}

async function countPaidExpiringWithin7Days(
  now: Date,
  in7Days: Date
): Promise<number> {
  const [row] = await db
    .select({
      n: sql<number>`cast(count(distinct ${userProductSubscription.userId}) as int)`,
    })
    .from(userProductSubscription)
    .where(
      and(
        eq(userProductSubscription.productKey, "multi"),
        inArray(userProductSubscription.tier, PAID_TIERS as unknown as string[]),
        inArray(
          userProductSubscription.status,
          ACTIVE_OR_CANCELING_STATUSES as unknown as string[]
        ),
        isNotNull(userProductSubscription.expiresAt),
        gte(userProductSubscription.expiresAt, now),
        lte(userProductSubscription.expiresAt, in7Days)
      )
    );
  return Number(row?.n ?? 0);
}

async function countUnopenedInbox(): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(inboundEmail)
    .where(
      and(isNull(inboundEmail.readAt), isNull(inboundEmail.archivedAt))
    );
  return Number(row?.n ?? 0);
}

async function stripeRenewalStats24h(
  sinceUnix: number
): Promise<{
  invoiceCount: number;
  customerIds: string[];
  error?: string;
}> {
  if (!isStripeConfigured()) {
    return { invoiceCount: 0, customerIds: [], error: "Stripe not configured" };
  }
  const stripe = getStripe();
  const customerIds = new Set<string>();
  let invoiceCount = 0;
  let startingAfter: string | undefined;
  try {
    for (;;) {
      const page = await stripe.invoices.list({
        status: "paid",
        created: { gte: sinceUnix },
        limit: 100,
        starting_after: startingAfter,
      });
      for (const inv of page.data) {
        if (inv.billing_reason !== "subscription_cycle") continue;
        if (!inv.subscription) continue;
        const c = inv.customer;
        if (typeof c === "string") {
          customerIds.add(c);
        }
        invoiceCount += 1;
      }
      if (!page.has_more || page.data.length === 0) break;
      startingAfter = page.data[page.data.length - 1].id;
    }
    return { invoiceCount, customerIds: [...customerIds] };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { invoiceCount: 0, customerIds: [], error: msg };
  }
}

async function stripeSubscriptionRevenueMonth(
  monthStartUnix: number,
  nowUnix: number
): Promise<{ byCurrency: Record<string, number>; error?: string }> {
  if (!isStripeConfigured()) {
    return {
      byCurrency: {},
      error: "Stripe not configured",
    };
  }
  const stripe = getStripe();
  const byCurrency: Record<string, number> = {};
  let startingAfter: string | undefined;
  try {
    for (;;) {
      const page = await stripe.invoices.list({
        status: "paid",
        created: { gte: monthStartUnix, lte: nowUnix },
        limit: 100,
        starting_after: startingAfter,
      });
      for (const inv of page.data) {
        if (!inv.subscription) continue;
        const paid = inv.amount_paid ?? 0;
        if (paid <= 0) continue;
        const cur = (inv.currency || "usd").toLowerCase();
        byCurrency[cur] = (byCurrency[cur] || 0) + paid;
      }
      if (!page.has_more || page.data.length === 0) break;
      startingAfter = page.data[page.data.length - 1].id;
    }
    return { byCurrency };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { byCurrency: {}, error: msg };
  }
}

async function mapStripeCustomersToUserIds(
  customerIds: string[]
): Promise<Set<string>> {
  if (customerIds.length === 0) return new Set();
  const rows = await db
    .select({ id: user.id })
    .from(user)
    .where(inArray(user.stripeCustomerId, customerIds));
  return new Set(rows.map((r) => r.id));
}

/** Start of the current calendar month in Argentina as Unix seconds for the Stripe API. */
async function getArgentinaMonthStartUnix(): Promise<number> {
  const [row] = await db.execute<{ epoch: string }>(
    sql`select extract(epoch from (date_trunc('month', current_timestamp at time zone 'America/Argentina/Buenos_Aires') at time zone 'America/Argentina/Buenos_Aires'))::text as epoch`
  );
  const n = Number(row?.epoch);
  return Number.isFinite(n) ? Math.floor(n) : Math.floor(Date.now() / 1000) - 86400 * 31;
}

export async function collectDailySaasMetrics(): Promise<DailySaasMetrics> {
  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const since24hUnix = Math.floor(since24h.getTime() / 1000);
  const nowUnix = Math.floor(now.getTime() / 1000);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const monthStartUnix = await getArgentinaMonthStartUnix();

  const [
    newUsers24h,
    registrationsMonthArgentina,
    totalUsers,
    paidSubscribersNow,
    trialingSubscribersNow,
    newPaidSubscriptionUsers24h,
    canceledSubscriptionsUpdated24h,
    paidSubscriptionsExpiringWithin7Days,
    unopenedInboxEmails,
    renewalStripe,
    revenueMonth,
    newPaidUserIds,
  ] = await Promise.all([
    countNewUsers24h(since24h),
    countRegistrationsMonthAr(),
    countTotalUsers(),
    countPaidSubscribersNow(now),
    countTrialingNow(now),
    countNewPaidSubscriptionUsers24h(since24h),
    countCanceledSubsUpdated24h(since24h),
    countPaidExpiringWithin7Days(now, in7Days),
    countUnopenedInbox(),
    stripeRenewalStats24h(since24hUnix),
    stripeSubscriptionRevenueMonth(monthStartUnix, nowUnix),
    userIdsNewPaidSubs24h(since24h),
  ]);

  const renewalUsersFromStripe = await mapStripeCustomersToUserIds(
    renewalStripe.customerIds
  );

  const distinctUsers = new Set<string>(newPaidUserIds);
  for (const id of renewalUsersFromStripe) {
    distinctUsers.add(id);
  }

  const stripeError = [renewalStripe.error, revenueMonth.error]
    .filter(Boolean)
    .join(" · ");

  return {
    generatedAtIso: now.toISOString(),
    newUsers24h,
    newPaidSubscriptionUsers24h,
    renewalStripeInvoices24h: renewalStripe.invoiceCount,
    renewalUsers24h: renewalUsersFromStripe.size,
    distinctUsersSubscribedOrRenewed24h: distinctUsers.size,
    paidSubscribersNow,
    trialingSubscribersNow,
    registrationsMonthArgentina,
    subscriptionRevenueMonthCentsByCurrency: revenueMonth.byCurrency,
    unopenedInboxEmails,
    totalUsers,
    canceledSubscriptionsUpdated24h,
    paidSubscriptionsExpiringWithin7Days,
    stripeError: stripeError || undefined,
  };
}
