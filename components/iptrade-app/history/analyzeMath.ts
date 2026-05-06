import type { HistoryAccount, HistoryDeal } from '@/components/iptrade-app/api';

const EPS = 0.005;

/* ------------------------------------------------------------------ */
/*  Dimensions                                                          */
/* ------------------------------------------------------------------ */

export type DimensionId =
  | 'none'
  | 'symbol'
  | 'side'
  | 'weekday'
  | 'hour'
  | 'monthOfYear'
  | 'dayOfMonth'
  | 'duration'
  | 'account'
  | 'platform';

export interface DimensionMeta {
  id: DimensionId;
  label: string;
}

export const DIMENSIONS: DimensionMeta[] = [
  { id: 'none', label: 'No breakdown' },
  { id: 'symbol', label: 'Symbol' },
  { id: 'side', label: 'Side (long / short)' },
  { id: 'weekday', label: 'Weekday' },
  { id: 'hour', label: 'Hour of day' },
  { id: 'monthOfYear', label: 'Month of year' },
  { id: 'dayOfMonth', label: 'Day of month' },
  { id: 'duration', label: 'Trade duration' },
  { id: 'account', label: 'Account' },
  { id: 'platform', label: 'Platform' },
];

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DURATION_BUCKETS: { label: string; loMs: number; hiMs: number }[] = [
  { label: '< 1m', loMs: 0, hiMs: 60_000 },
  { label: '1-15m', loMs: 60_000, hiMs: 15 * 60_000 },
  { label: '15-60m', loMs: 15 * 60_000, hiMs: 60 * 60_000 },
  { label: '1-4h', loMs: 60 * 60_000, hiMs: 4 * 60 * 60_000 },
  { label: '4-24h', loMs: 4 * 60 * 60_000, hiMs: 24 * 60 * 60_000 },
  { label: '1-7d', loMs: 24 * 60 * 60_000, hiMs: 7 * 24 * 60 * 60_000 },
  { label: '> 1w', loMs: 7 * 24 * 60 * 60_000, hiMs: Infinity },
];

const DURATION_ORDER = DURATION_BUCKETS.map((b) => b.label);

function durationBucketFor(deal: HistoryDeal): string {
  if (deal.close_time_ms <= 0) return '—';
  const hold = deal.close_time_ms - deal.open_time_ms;
  if (hold < 0) return '—';
  for (const b of DURATION_BUCKETS) {
    if (hold >= b.loMs && hold < b.hiMs) return b.label;
  }
  return DURATION_BUCKETS[DURATION_BUCKETS.length - 1].label;
}

export interface DimensionContext {
  accounts: HistoryAccount[];
}

/**
 * Returns the bucket key(s) the deal belongs to for the given dimension.
 * Most dimensions return a single key; multi-valued dimensions like `tag` /
 * `mistake` return one key per value, so a single deal can contribute to
 * multiple cells (mirrors how TradesViz handles tag pivots).
 *
 * Returns an empty array when the dimension has no value for the deal — in
 * which case we'll synthesize an "—" bucket so the row/column still surfaces.
 */
function dimensionKeysFor(
  deal: HistoryDeal,
  dim: DimensionId,
  ctx: DimensionContext
): string[] {
  switch (dim) {
    case 'none':
      return ['Total'];
    case 'symbol':
      return [deal.symbol || '—'];
    case 'side':
      return [deal.side === 'buy' ? 'Long' : deal.side === 'sell' ? 'Short' : '—'];
    case 'weekday':
      return [WEEKDAY_LABELS[new Date(deal.open_time_ms).getDay()]];
    case 'hour': {
      const h = new Date(deal.open_time_ms).getHours();
      return [`${String(h).padStart(2, '0')}:00`];
    }
    case 'monthOfYear':
      return [MONTH_LABELS[new Date(deal.open_time_ms).getMonth()]];
    case 'dayOfMonth':
      return [String(new Date(deal.open_time_ms).getDate()).padStart(2, '0')];
    case 'duration':
      return [durationBucketFor(deal)];
    case 'account': {
      const acc = ctx.accounts.find((a) => a.account_id === deal.account_id);
      return [acc?.nickname?.trim() || deal.account_id];
    }
    case 'platform':
      return [deal.platform || '—'];
    default:
      return ['—'];
  }
}

/** A natural sort order for keys of a given dimension. */
export function compareDimensionKeys(dim: DimensionId, a: string, b: string): number {
  if (dim === 'weekday') {
    return WEEKDAY_LABELS.indexOf(a) - WEEKDAY_LABELS.indexOf(b);
  }
  if (dim === 'monthOfYear') {
    return MONTH_LABELS.indexOf(a) - MONTH_LABELS.indexOf(b);
  }
  if (dim === 'duration') {
    return DURATION_ORDER.indexOf(a) - DURATION_ORDER.indexOf(b);
  }
  if (dim === 'hour' || dim === 'dayOfMonth') {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/* ------------------------------------------------------------------ */
/*  Metrics                                                             */
/* ------------------------------------------------------------------ */

export type MetricId =
  | 'netPnl'
  | 'tradeCount'
  | 'winRate'
  | 'avgPnl'
  | 'bestTrade'
  | 'worstTrade'
  | 'volume'
  | 'profitFactor'
  | 'expectancy';

export interface MetricMeta {
  id: MetricId;
  label: string;
  /** When true, cell color is signed (green / red) based on value. */
  signed: boolean;
}

export const METRICS: MetricMeta[] = [
  { id: 'netPnl', label: 'Net P&L', signed: true },
  { id: 'tradeCount', label: 'Trade count', signed: false },
  { id: 'winRate', label: 'Win rate %', signed: false },
  { id: 'avgPnl', label: 'Avg P&L per trade', signed: true },
  { id: 'bestTrade', label: 'Best trade', signed: true },
  { id: 'worstTrade', label: 'Worst trade', signed: true },
  { id: 'volume', label: 'Volume', signed: false },
  { id: 'profitFactor', label: 'Profit factor', signed: false },
  { id: 'expectancy', label: 'Expectancy', signed: true },
];

interface CellAccumulator {
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  best: number;
  worst: number;
  volume: number;
  grossWin: number;
  grossLoss: number;
}

function emptyAccumulator(): CellAccumulator {
  return {
    pnl: 0,
    trades: 0,
    wins: 0,
    losses: 0,
    best: -Infinity,
    worst: Infinity,
    volume: 0,
    grossWin: 0,
    grossLoss: 0,
  };
}

function applyDeal(acc: CellAccumulator, d: HistoryDeal): void {
  const net = d.net_profit;
  acc.pnl += net;
  acc.trades += 1;
  acc.volume += d.volume;
  if (net > EPS) {
    acc.wins += 1;
    acc.grossWin += net;
  } else if (net < -EPS) {
    acc.losses += 1;
    acc.grossLoss += Math.abs(net);
  }
  if (net > acc.best) acc.best = net;
  if (net < acc.worst) acc.worst = net;
}

function valueFor(metric: MetricId, acc: CellAccumulator): number | null {
  if (acc.trades === 0) return null;
  switch (metric) {
    case 'netPnl':
      return acc.pnl;
    case 'tradeCount':
      return acc.trades;
    case 'winRate': {
      const decided = acc.wins + acc.losses;
      return decided > 0 ? (acc.wins / decided) * 100 : 0;
    }
    case 'avgPnl':
      return acc.pnl / acc.trades;
    case 'bestTrade':
      return acc.best === -Infinity ? 0 : acc.best;
    case 'worstTrade':
      return acc.worst === Infinity ? 0 : acc.worst;
    case 'volume':
      return acc.volume;
    case 'profitFactor':
      return acc.grossLoss > EPS
        ? acc.grossWin / acc.grossLoss
        : acc.grossWin > 0
          ? Infinity
          : 0;
    case 'expectancy':
      return acc.pnl / acc.trades;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Pivot                                                               */
/* ------------------------------------------------------------------ */

export interface PivotResult {
  rowKeys: string[];
  colKeys: string[];
  /** cells[row][col] = numeric metric value, or null when no trades. */
  cells: Map<string, Map<string, number | null>>;
  rowTotals: Map<string, number | null>;
  colTotals: Map<string, number | null>;
  grandTotal: number | null;
  metric: MetricMeta;
  /** Min/max numeric value across cells (for color scaling). */
  minValue: number;
  maxValue: number;
}

export interface PivotInput {
  deals: HistoryDeal[];
  rowDim: DimensionId;
  colDim: DimensionId;
  metric: MetricId;
  ctx: DimensionContext;
}

export function computePivot({ deals, rowDim, colDim, metric, ctx }: PivotInput): PivotResult {
  const cellAcc = new Map<string, CellAccumulator>();
  const rowAcc = new Map<string, CellAccumulator>();
  const colAcc = new Map<string, CellAccumulator>();
  const grandAcc = emptyAccumulator();

  const rowKeysSet = new Set<string>();
  const colKeysSet = new Set<string>();

  for (const d of deals) {
    const rowKeys = dimensionKeysFor(d, rowDim, ctx);
    const colKeys = dimensionKeysFor(d, colDim, ctx);
    for (const rk of rowKeys) {
      rowKeysSet.add(rk);
      let racc = rowAcc.get(rk);
      if (!racc) {
        racc = emptyAccumulator();
        rowAcc.set(rk, racc);
      }
      applyDeal(racc, d);
      for (const ck of colKeys) {
        colKeysSet.add(ck);
        const cellKey = `${rk} ${ck}`;
        let cacc = cellAcc.get(cellKey);
        if (!cacc) {
          cacc = emptyAccumulator();
          cellAcc.set(cellKey, cacc);
        }
        applyDeal(cacc, d);
      }
    }
    for (const ck of colKeys) {
      colKeysSet.add(ck);
      let cacc = colAcc.get(ck);
      if (!cacc) {
        cacc = emptyAccumulator();
        colAcc.set(ck, cacc);
      }
      applyDeal(cacc, d);
    }
    applyDeal(grandAcc, d);
  }

  const rowKeys = Array.from(rowKeysSet).sort((a, b) => compareDimensionKeys(rowDim, a, b));
  const colKeys = Array.from(colKeysSet).sort((a, b) => compareDimensionKeys(colDim, a, b));

  const meta = METRICS.find((m) => m.id === metric) ?? METRICS[0];

  const cells = new Map<string, Map<string, number | null>>();
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (const rk of rowKeys) {
    const row = new Map<string, number | null>();
    for (const ck of colKeys) {
      const acc = cellAcc.get(`${rk} ${ck}`);
      const v = acc ? valueFor(metric, acc) : null;
      row.set(ck, v);
      if (v != null && Number.isFinite(v)) {
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      }
    }
    cells.set(rk, row);
  }
  if (!Number.isFinite(minVal)) minVal = 0;
  if (!Number.isFinite(maxVal)) maxVal = 0;

  const rowTotals = new Map<string, number | null>();
  for (const rk of rowKeys) {
    const acc = rowAcc.get(rk);
    rowTotals.set(rk, acc ? valueFor(metric, acc) : null);
  }
  const colTotals = new Map<string, number | null>();
  for (const ck of colKeys) {
    const acc = colAcc.get(ck);
    colTotals.set(ck, acc ? valueFor(metric, acc) : null);
  }
  const grandTotal = grandAcc.trades > 0 ? valueFor(metric, grandAcc) : null;

  return {
    rowKeys,
    colKeys,
    cells,
    rowTotals,
    colTotals,
    grandTotal,
    metric: meta,
    minValue: minVal,
    maxValue: maxVal,
  };
}

/* ------------------------------------------------------------------ */
/*  Formatters                                                          */
/* ------------------------------------------------------------------ */

export function formatMetricValue(metric: MetricId, value: number | null): string {
  if (value == null) return '—';
  if (!Number.isFinite(value)) return '∞';
  switch (metric) {
    case 'tradeCount':
      return value.toFixed(0);
    case 'winRate':
      return `${value.toFixed(0)}%`;
    case 'volume':
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toFixed(2);
    case 'profitFactor':
      return value.toFixed(2);
    default: {
      const sign = value > 0 ? '+' : '';
      return `${sign}${value.toFixed(2)}`;
    }
  }
}
