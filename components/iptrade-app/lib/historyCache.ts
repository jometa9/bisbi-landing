import type { CoveredRange } from '@/components/iptrade-app/api';

/** Coalesce a new range into a sorted, disjoint list. */
export function mergeCoveredRange(ranges: CoveredRange[], next: CoveredRange): CoveredRange[] {
  if (next.to_ms < next.from_ms) return ranges.slice();
  const all = ranges.concat(next).sort((a, b) => a.from_ms - b.from_ms);
  const merged: CoveredRange[] = [];
  for (const r of all) {
    const last = merged[merged.length - 1];
    if (last && r.from_ms <= last.to_ms + 1) {
      last.to_ms = Math.max(last.to_ms, r.to_ms);
    } else {
      merged.push({ from_ms: r.from_ms, to_ms: r.to_ms });
    }
  }
  return merged;
}

/**
 * Compute uncovered sub-ranges of [fromMs, toMs] given a list of covered ranges.
 * Returned ranges are non-empty and disjoint.
 */
export function gapsIn(
  ranges: CoveredRange[],
  fromMs: number,
  toMs: number
): CoveredRange[] {
  if (toMs < fromMs) return [];
  const sorted = ranges
    .filter((r) => r.to_ms >= fromMs && r.from_ms <= toMs)
    .slice()
    .sort((a, b) => a.from_ms - b.from_ms);
  const gaps: CoveredRange[] = [];
  let cursor = fromMs;
  for (const r of sorted) {
    if (r.to_ms < cursor) continue;
    if (r.from_ms > cursor) {
      const gapTo = Math.min(r.from_ms - 1, toMs);
      if (gapTo >= cursor) gaps.push({ from_ms: cursor, to_ms: gapTo });
    }
    if (r.to_ms >= cursor) cursor = r.to_ms + 1;
    if (cursor > toMs) break;
  }
  if (cursor <= toMs) gaps.push({ from_ms: cursor, to_ms: toMs });
  return gaps;
}

/** True when [fromMs, toMs] is fully contained in the union of `ranges`. */
export function isRangeFullyCovered(
  ranges: CoveredRange[],
  fromMs: number,
  toMs: number
): boolean {
  return gapsIn(ranges, fromMs, toMs).length === 0;
}

/**
 * Drop any history data that previous versions of the app stored in
 * localStorage. The app now keeps history in-memory and treats the Rust
 * backend (state-file directory) as the single source of truth.
 */
export function clearLegacyHistoryStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;
      if (
        k.startsWith('iptrade.history.deals.') ||
        k.startsWith('iptrade.history.sync.') ||
        k === 'iptrade.history.journal.v1'
      ) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) window.localStorage.removeItem(k);
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}
