// Seeded mock data for the landing demo. The real screens copied verbatim
// from the IPTRADE app render this through their normal context APIs.

import type {
  HistoryAccount,
  HistoryDeal,
  LivePendingRow,
  LivePositionRow,
} from "@/components/iptrade-app/api";

export const MOCK_ACCOUNTS: HistoryAccount[] = [
  {
    account_id: "2847193",
    platform: "metatrader4",
    server: "FTMO-Demo2",
    nickname: "FTMO 50K",
    connection_type: "MT4",
    role: "master",
  },
  {
    account_id: "4912837",
    platform: "metatrader5",
    server: "FTMO-Server",
    nickname: "FTMO Funded",
    connection_type: "MT5",
    role: "slave",
  },
  {
    account_id: "7382914",
    platform: "ctrader",
    server: "FundedNext-Live",
    nickname: "FundedNext 100K",
    connection_type: "cTrader",
    role: "slave",
  },
  {
    account_id: "2847561",
    platform: "ninjatrader8",
    server: "Tradeify-Live",
    nickname: "Tradeify 50K",
    connection_type: "NinjaTrader",
    role: "slave",
  },
];

const SYMBOLS = [
  "EURUSD",
  "GBPUSD",
  "XAUUSD",
  "USDJPY",
  "NQ",
  "ES",
  "BTCUSD",
] as const;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// Module-level cache so the calendar demo and the statistics demo, which
// each mount their own HistoryProvider, see the *same* dataset instead of
// each generating their own copy from the (stateful) RNG. Quantized to
// the hour — two demos rendered milliseconds apart hash to the same key.
let dealsCache: { key: number; deals: HistoryDeal[] } | null = null;

/**
 * Build closed deals across the last 3 months (90 days). 1/4 of the
 * days are no-trade rest days (≈ 22 days); of the remaining ≈ 68
 * active days, 3/4 are winning and 1/4 are losing — both layers
 * shuffled randomly. Every trade on a winning day is a winner, every
 * trade on a losing day a loser. PnL is sized in thousands (winner
 * mean ≈ $1.5K, loser mean ≈ $720) so winning days clearly outpace
 * losing days — fits the prop firm account sizes ($50K–$100K) on the
 * mock accounts.
 */
export function buildMockDeals(now = Date.now()): HistoryDeal[] {
  const cacheKey = Math.floor(now / 3_600_000) * 3_600_000;
  if (dealsCache && dealsCache.key === cacheKey) return dealsCache.deals;

  // Local RNG so the function is fully deterministic per call — the
  // module-level seed is reset every invocation.
  const r = rng(0xcafebabe);
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(r() * arr.length)];
  const gauss = (mean: number, sd: number): number => {
    // Box–Muller
    const u = Math.max(1e-9, r());
    const v = r();
    const x = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + x * sd;
  };

  // 3 months of history (30 days × 3 = 90). Pick exactly 1/4 of those
  // as no-trade rest days (≈ 22 of 90), randomly distributed. The
  // remaining ≈ 68 days are active trading days.
  const TOTAL_DAYS = 90;
  const noTradeCount = Math.floor(TOTAL_DAYS / 4);
  const dayIndices = Array.from({ length: TOTAL_DAYS }, (_, i) => i);
  for (let i = dayIndices.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [dayIndices[i], dayIndices[j]] = [dayIndices[j], dayIndices[i]];
  }
  const activeDays = dayIndices.slice(noTradeCount).sort((a, b) => a - b);

  // Tag 3/4 of the active days as winning, 1/4 as losing, then shuffle
  // so the green/red days are interleaved randomly across the calendar
  // — no monotone runs.
  const winCount = Math.floor((activeDays.length * 3) / 4);
  const tags: Array<"win" | "loss"> = activeDays.map((_, i) =>
    i < winCount ? "win" : "loss"
  );
  for (let i = tags.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [tags[i], tags[j]] = [tags[j], tags[i]];
  }
  const dayTag = new Map<number, "win" | "loss">();
  activeDays.forEach((d, i) => dayTag.set(d, tags[i]));

  const deals: HistoryDeal[] = [];
  const dayMs = 86_400_000;
  const startMs = cacheKey - TOTAL_DAYS * dayMs;
  let id = 1;

  for (const day of activeDays) {
    const isWinDay = dayTag.get(day) === "win";
    const dayStart = startMs + day * dayMs;
    const tradesToday = 1 + Math.floor(r() * 6);
    for (let t = 0; t < tradesToday; t++) {
      const account = MOCK_ACCOUNTS[Math.floor(r() * MOCK_ACCOUNTS.length)];
      const symbol = pick(SYMBOLS);
      const side = r() > 0.5 ? "buy" : "sell";
      const volume = +(0.5 + r() * 4.5).toFixed(2);
      const openTs = dayStart + Math.floor(r() * 18 * 3600 * 1000);
      const holdMin = 5 + Math.floor(r() * 220);
      const closeTs = openTs + holdMin * 60_000;

      // Basis price per symbol so SL/TP look realistic.
      const basePrice = (() => {
        switch (symbol) {
          case "EURUSD":
            return 1.08 + r() * 0.02;
          case "GBPUSD":
            return 1.26 + r() * 0.02;
          case "USDJPY":
            return 154 + r() * 2;
          case "XAUUSD":
            return 2380 + r() * 60;
          case "NQ":
            return 19400 + r() * 800;
          case "ES":
            return 5380 + r() * 80;
          case "BTCUSD":
            return 64000 + r() * 4000;
          default:
            return 1;
        }
      })();
      const openPrice = +basePrice.toFixed(5);
      const isWin = isWinDay;
      const magnitude = isWin
        ? Math.max(300, gauss(1500, 950))
        : Math.max(180, gauss(720, 480));
      const profit = +(isWin ? magnitude : -magnitude).toFixed(2);
      const closePrice = +(
        side === "buy"
          ? openPrice + (profit > 0 ? 1 : -1) * (Math.abs(profit) / (volume * 100000))
          : openPrice - (profit > 0 ? 1 : -1) * (Math.abs(profit) / (volume * 100000))
      ).toFixed(5);
      const commission = -(0.1 + r() * 1.4) * volume;
      const swap = r() < 0.2 ? -(r() * 2) : 0;
      const netProfit = +(profit + commission + swap).toFixed(2);

      deals.push({
        deal_id: `D${id}`,
        account_id: account.account_id,
        platform: account.platform,
        server: account.server,
        connection_type: account.connection_type,
        symbol,
        side,
        volume,
        open_price: openPrice,
        close_price: closePrice,
        open_time_ms: openTs,
        close_time_ms: closeTs,
        sl: side === "buy" ? +(openPrice - 0.003 * basePrice).toFixed(5) : +(openPrice + 0.003 * basePrice).toFixed(5),
        tp: side === "buy" ? +(openPrice + 0.005 * basePrice).toFixed(5) : +(openPrice - 0.005 * basePrice).toFixed(5),
        commission: +commission.toFixed(2),
        swap: +swap.toFixed(2),
        profit,
        net_profit: netProfit,
        position_id: `P${id}`,
        ticket: 11_000_000 + id,
      });
      id++;
    }
  }

  // Sort by primary timestamp ascending — same convention as the real cache.
  deals.sort(
    (a, b) =>
      (a.close_time_ms || a.open_time_ms) - (b.close_time_ms || b.open_time_ms)
  );
  dealsCache = { key: cacheKey, deals };
  return deals;
}

/* ------------------------------------------------------------------ */
/*  Live positions / pending — used by the Terminal demo               */
/* ------------------------------------------------------------------ */

export const MOCK_POSITIONS: LivePositionRow[] = [
  {
    account_id: "2847193",
    platform: "metatrader4",
    server: "FTMO-Demo2",
    nickname: "FTMO 50K",
    role: "master",
    ticket: 11472831,
    symbol: "EURUSD",
    side: "buy",
    type: "buy",
    volume: 0.5,
    open_price: 1.08245,
    sl: 1.08015,
    tp: 1.08720,
    age_seconds: 1860,
    profit: 87.42,
  },
  {
    account_id: "4912837",
    platform: "metatrader5",
    server: "FTMO-Server",
    nickname: "FTMO Funded",
    role: "slave",
    ticket: 11472832,
    symbol: "EURUSD",
    side: "buy",
    type: "buy",
    volume: 0.5,
    open_price: 1.08251,
    sl: 1.08015,
    tp: 1.08720,
    age_seconds: 1855,
    profit: 84.18,
  },
  {
    account_id: "7382914",
    platform: "ctrader",
    server: "FundedNext-Live",
    nickname: "FundedNext 100K",
    role: "slave",
    ticket: 11472833,
    symbol: "EURUSD",
    side: "buy",
    type: "buy",
    volume: 1.0,
    open_price: 1.08249,
    sl: 1.08015,
    tp: 1.08720,
    age_seconds: 1850,
    profit: 169.55,
  },
  {
    account_id: "2847193",
    platform: "metatrader4",
    server: "FTMO-Demo2",
    nickname: "FTMO 50K",
    role: "master",
    ticket: 11472841,
    symbol: "XAUUSD",
    side: "sell",
    type: "sell",
    volume: 0.2,
    open_price: 2418.45,
    sl: 2425.10,
    tp: 2402.80,
    age_seconds: 4920,
    profit: -23.6,
  },
  {
    account_id: "4912837",
    platform: "metatrader5",
    server: "FTMO-Server",
    nickname: "FTMO Funded",
    role: "slave",
    ticket: 11472842,
    symbol: "XAUUSD",
    side: "sell",
    type: "sell",
    volume: 0.2,
    open_price: 2418.42,
    sl: 2425.10,
    tp: 2402.80,
    age_seconds: 4920,
    profit: -22.4,
  },
  {
    account_id: "2847561",
    platform: "ninjatrader8",
    server: "Tradeify-Live",
    nickname: "Tradeify 50K",
    role: "slave",
    ticket: 11472899,
    symbol: "NQ",
    side: "buy",
    type: "buy",
    volume: 1,
    open_price: 19842.50,
    sl: 19805.00,
    tp: 19920.00,
    age_seconds: 720,
    profit: 215.00,
  },
];

export const MOCK_PENDING: LivePendingRow[] = [
  {
    account_id: "2847193",
    platform: "metatrader4",
    server: "FTMO-Demo2",
    nickname: "FTMO 50K",
    role: "master",
    ticket: 11473001,
    symbol: "GBPUSD",
    side: "buy",
    type: "buy_limit",
    volume: 0.3,
    price: 1.27210,
    sl: 1.27000,
    tp: 1.27600,
    age_seconds: 320,
    magic: 0,
  },
  {
    account_id: "4912837",
    platform: "metatrader5",
    server: "FTMO-Server",
    nickname: "FTMO Funded",
    role: "slave",
    ticket: 11473002,
    symbol: "GBPUSD",
    side: "buy",
    type: "buy_limit",
    volume: 0.3,
    price: 1.27210,
    sl: 1.27000,
    tp: 1.27600,
    age_seconds: 320,
    magic: 0,
  },
];
