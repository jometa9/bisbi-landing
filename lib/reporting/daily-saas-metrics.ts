import { db } from "@/lib/db";
import { appSettings, inboundEmail, user, userProductSubscription } from "@/lib/db/schema";
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
  type SQL,
  sql,
} from "drizzle-orm";
import type Stripe from "stripe";

const monthStartArgentina = sql<Date>`(date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'America/Argentina/Buenos_Aires') AT TIME ZONE 'America/Argentina/Buenos_Aires')`;

const PRODUCT_KEY = "bisbi" as const;
const PAID_TIERS = ["pro"] as const;

const ACTIVE_OR_CANCELING_STATUSES = [
  "active",
  "trialing",
  "canceling",
] as const;

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

type BisbiStripeIds = {
  priceIds: Set<string>;
  productIds: Set<string>;
  resolveError?: string;
};

async function getBisbiPriceIdsFromSettings(): Promise<string[]> {
  const [row] = await db
    .select({
      monthly: appSettings.bisbiProMonthlyPriceId,
      annual: appSettings.bisbiProAnnualPriceId,
    })
    .from(appSettings)
    .orderBy(appSettings.id)
    .limit(1);
  const ids: string[] = [];
  if (row?.monthly?.trim()) ids.push(row.monthly.trim());
  if (row?.annual?.trim()) ids.push(row.annual.trim());
  return ids;
}

async function resolveBisbiStripeIds(): Promise<BisbiStripeIds> {
  const priceIds = new Set(await getBisbiPriceIdsFromSettings());
  if (priceIds.size === 0) {
    return {
      priceIds,
      productIds: new Set(),
      resolveError: "Bisbi price IDs not configured",
    };
  }

  let stripe: Stripe;
  try {
    stripe = await getStripe();
  } catch (e) {
    return {
      priceIds,
      productIds: new Set(),
      resolveError: e instanceof Error ? e.message : String(e),
    };
  }

  const productIds = new Set<string>();
  const errors: string[] = [];
  for (const priceId of priceIds) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      const product = price.product;
      if (typeof product === "string") {
        productIds.add(product);
      } else if (product && typeof product === "object" && "id" in product) {
        productIds.add(product.id);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`price ${priceId}: ${msg}`);
    }
  }

  return {
    priceIds,
    productIds,
    resolveError: errors.length > 0 ? errors.join(" · ") : undefined,
  };
}

function bisbiProductIdClause(productIds: Set<string>): SQL | undefined {
  if (productIds.size === 0) return undefined;
  return inArray(userProductSubscription.stripeProductId, [...productIds]);
}

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

function paidSubscriptionActiveClause(now: Date, productIds: Set<string>) {
  return and(
    eq(userProductSubscription.productKey, PRODUCT_KEY),
    inArray(userProductSubscription.tier, PAID_TIERS as unknown as string[]),
    isNotNull(userProductSubscription.stripeSubscriptionId),
    bisbiProductIdClause(productIds),
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

async function countPaidSubscribersNow(
  now: Date,
  productIds: Set<string>
): Promise<number> {
  const [row] = await db
    .select({
      n: sql<number>`cast(count(distinct ${userProductSubscription.userId}) as int)`,
    })
    .from(userProductSubscription)
    .where(paidSubscriptionActiveClause(now, productIds));
  return Number(row?.n ?? 0);
}

async function countTrialingNow(productIds: Set<string>): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(userProductSubscription)
    .where(
      and(
        eq(userProductSubscription.productKey, PRODUCT_KEY),
        eq(userProductSubscription.status, "trialing"),
        isNotNull(userProductSubscription.stripeSubscriptionId),
        bisbiProductIdClause(productIds)
      )
    );
  return Number(row?.n ?? 0);
}

async function countNewPaidSubscriptionUsers24h(
  since: Date,
  productIds: Set<string>
): Promise<number> {
  const [row] = await db
    .select({
      n: sql<number>`cast(count(distinct ${userProductSubscription.userId}) as int)`,
    })
    .from(userProductSubscription)
    .where(
      and(
        eq(userProductSubscription.productKey, PRODUCT_KEY),
        inArray(userProductSubscription.tier, PAID_TIERS as unknown as string[]),
        isNotNull(userProductSubscription.stripeSubscriptionId),
        bisbiProductIdClause(productIds),
        gte(userProductSubscription.createdAt, since)
      )
    );
  return Number(row?.n ?? 0);
}

async function userIdsNewPaidSubs24h(
  since: Date,
  productIds: Set<string>
): Promise<string[]> {
  const rows = await db
    .select({ userId: userProductSubscription.userId })
    .from(userProductSubscription)
    .where(
      and(
        eq(userProductSubscription.productKey, PRODUCT_KEY),
        inArray(userProductSubscription.tier, PAID_TIERS as unknown as string[]),
        isNotNull(userProductSubscription.stripeSubscriptionId),
        bisbiProductIdClause(productIds),
        gte(userProductSubscription.createdAt, since)
      )
    )
    .groupBy(userProductSubscription.userId);
  return rows.map((r) => r.userId);
}

async function countCanceledSubsUpdated24h(
  since: Date,
  productIds: Set<string>
): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(userProductSubscription)
    .where(
      and(
        eq(userProductSubscription.productKey, PRODUCT_KEY),
        eq(userProductSubscription.status, "canceled"),
        isNotNull(userProductSubscription.stripeSubscriptionId),
        bisbiProductIdClause(productIds),
        gte(userProductSubscription.updatedAt, since)
      )
    );
  return Number(row?.n ?? 0);
}

async function countPaidExpiringWithin7Days(
  now: Date,
  in7Days: Date,
  productIds: Set<string>
): Promise<number> {
  const [row] = await db
    .select({
      n: sql<number>`cast(count(distinct ${userProductSubscription.userId}) as int)`,
    })
    .from(userProductSubscription)
    .where(
      and(
        eq(userProductSubscription.productKey, PRODUCT_KEY),
        inArray(userProductSubscription.tier, PAID_TIERS as unknown as string[]),
        isNotNull(userProductSubscription.stripeSubscriptionId),
        bisbiProductIdClause(productIds),
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

function invoiceMatchesBisbi(
  inv: {
    lines?: { data?: Array<{ price?: { id?: string | null } | null }> | null } | null;
  },
  bisbiPriceIds: Set<string>
): boolean {
  const lines = inv.lines?.data ?? [];
  for (const line of lines) {
    const id = line?.price?.id;
    if (id && bisbiPriceIds.has(id)) return true;
  }
  return false;
}

async function stripeRenewalStats24h(
  sinceUnix: number,
  bisbiPriceIds: Set<string>
): Promise<{
  invoiceCount: number;
  customerIds: string[];
  error?: string;
}> {
  if (bisbiPriceIds.size === 0) {
    return {
      invoiceCount: 0,
      customerIds: [],
      error: "Bisbi price IDs not configured",
    };
  }
  let stripe: Stripe;
  try {
    stripe = await getStripe();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { invoiceCount: 0, customerIds: [], error: msg };
  }
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
        if (!invoiceMatchesBisbi(inv, bisbiPriceIds)) continue;
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
  nowUnix: number,
  bisbiPriceIds: Set<string>
): Promise<{ byCurrency: Record<string, number>; error?: string }> {
  if (bisbiPriceIds.size === 0) {
    return {
      byCurrency: {},
      error: "Bisbi price IDs not configured",
    };
  }
  let stripe: Stripe;
  try {
    stripe = await getStripe();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { byCurrency: {}, error: msg };
  }
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
        if (!invoiceMatchesBisbi(inv, bisbiPriceIds)) continue;
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

async function getArgentinaMonthStartUnix(): Promise<number> {
  const rows = await db.execute<{ epoch: string }>(
    sql`select extract(epoch from (date_trunc('month', current_timestamp at time zone 'America/Argentina/Buenos_Aires') at time zone 'America/Argentina/Buenos_Aires'))::text as epoch`
  );
  const first = Array.isArray(rows) ? rows[0] : (rows as { rows?: Array<{ epoch: string }> }).rows?.[0];
  const n = Number(first?.epoch);
  return Number.isFinite(n) ? Math.floor(n) : Math.floor(Date.now() / 1000) - 86400 * 31;
}

export async function collectDailySaasMetrics(): Promise<DailySaasMetrics> {
  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const since24hUnix = Math.floor(since24h.getTime() / 1000);
  const nowUnix = Math.floor(now.getTime() / 1000);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const bisbi = await resolveBisbiStripeIds();
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
    countPaidSubscribersNow(now, bisbi.productIds),
    countTrialingNow(bisbi.productIds),
    countNewPaidSubscriptionUsers24h(since24h, bisbi.productIds),
    countCanceledSubsUpdated24h(since24h, bisbi.productIds),
    countPaidExpiringWithin7Days(now, in7Days, bisbi.productIds),
    countUnopenedInbox(),
    stripeRenewalStats24h(since24hUnix, bisbi.priceIds),
    stripeSubscriptionRevenueMonth(monthStartUnix, nowUnix, bisbi.priceIds),
    userIdsNewPaidSubs24h(since24h, bisbi.productIds),
  ]);

  const renewalUsersFromStripe = await mapStripeCustomersToUserIds(
    renewalStripe.customerIds
  );

  const distinctUsers = new Set<string>(newPaidUserIds);
  for (const id of renewalUsersFromStripe) {
    distinctUsers.add(id);
  }

  const stripeError = [
    bisbi.resolveError,
    renewalStripe.error,
    revenueMonth.error,
  ]
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
