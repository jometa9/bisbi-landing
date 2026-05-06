"use client";

// Demo replacement for the real HistoryContext. Same shape as the source —
// `useHistory()` returns the exact same value type — so the verbatim copies
// of CalendarView / StatisticsView / OrdersView / HistoryFilterHeader render
// unchanged. Data is seeded synchronously, no network, no localStorage.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  HistoryAccount,
  HistoryDeal,
  HistorySyncStatus,
} from "@/components/iptrade-app/api";
import type { Granularity } from "@/components/iptrade-app/history/calendarMath";
import { MOCK_ACCOUNTS, buildMockDeals } from "./mockData";

interface HistoryFilterState {
  selectedAccountIds: string[];
  fromMs: number | null;
  toMs: number | null;
}

interface HistoryContextValue {
  filter: HistoryFilterState;
  setSelectedAccountIds: (ids: string[]) => void;
  setRange: (fromMs: number | null, toMs: number | null) => void;
  resetFilter: () => void;
  ensureRangeCovered: (fromMs: number, toMs: number) => void;
  granularity: Granularity;
  setGranularity: (g: Granularity) => void;
  accounts: HistoryAccount[];
  deals: HistoryDeal[];
  allDeals: HistoryDeal[];
  syncStatus: HistorySyncStatus[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: (options?: { force?: boolean }) => Promise<void>;
  serverNowMs: number;
}

const Ctx = createContext<HistoryContextValue | undefined>(undefined);

const FILTER_DEFAULT_DAYS = 28;

function dealTime(d: HistoryDeal): number {
  return d.close_time_ms > 0 ? d.close_time_ms : d.open_time_ms;
}

interface DemoHistoryProviderProps {
  children: ReactNode;
  /** Override the seeded "now" so screens look identical across reloads. */
  nowMs?: number;
  /** Override the seeded deals (demos may want to bias toward winners, etc.). */
  deals?: HistoryDeal[];
  /** Default visible window in days. */
  defaultDays?: number;
}

export function HistoryProvider({
  children,
  nowMs,
  deals: dealsProp,
  defaultDays = FILTER_DEFAULT_DAYS,
}: DemoHistoryProviderProps) {
  const serverNowMs = useMemo(() => nowMs ?? Date.now(), [nowMs]);
  const allDeals = useMemo<HistoryDeal[]>(
    () => dealsProp ?? buildMockDeals(serverNowMs),
    [dealsProp, serverNowMs]
  );

  const [filter, setFilter] = useState<HistoryFilterState>(() => ({
    selectedAccountIds: [],
    fromMs: serverNowMs - defaultDays * 86_400_000,
    toMs: serverNowMs,
  }));
  const [granularity, setGranularity] = useState<Granularity>("month");
  const lastEnsureRef = useRef<{ from: number; to: number } | null>(null);

  const targetIds = useMemo(() => {
    const eligibleIds = new Set(MOCK_ACCOUNTS.map((a) => a.account_id));
    if (filter.selectedAccountIds.length === 0) return Array.from(eligibleIds);
    return filter.selectedAccountIds.filter((id) => eligibleIds.has(id));
  }, [filter.selectedAccountIds]);

  // Apply per-account filtering on top of the seeded deals.
  const visibleAllDeals = useMemo(() => {
    const ids = new Set(targetIds);
    return allDeals.filter((d) => ids.has(d.account_id));
  }, [allDeals, targetIds]);

  const deals = useMemo(() => {
    const fromMs = filter.fromMs ?? serverNowMs - defaultDays * 86_400_000;
    const toMs = filter.toMs ?? serverNowMs;
    const out: HistoryDeal[] = [];
    for (const d of visibleAllDeals) {
      const t = dealTime(d);
      if (t >= fromMs && t <= toMs) out.push(d);
    }
    return out;
  }, [visibleAllDeals, filter.fromMs, filter.toMs, defaultDays, serverNowMs]);

  // Build a covered-ranges entry that fully covers the seeded window so the
  // CalendarView's `ensureRangeCovered` calls become no-ops.
  const syncStatus = useMemo<HistorySyncStatus[]>(
    () =>
      MOCK_ACCOUNTS.map((a) => ({
        account_id: a.account_id,
        last_synced_ms: serverNowMs,
        oldest_synced_ms: serverNowMs - 365 * 86_400_000,
        deals_count: visibleAllDeals.filter((d) => d.account_id === a.account_id).length,
        covered_ranges: [
          { from_ms: serverNowMs - 365 * 86_400_000, to_ms: serverNowMs },
        ],
      })),
    [serverNowMs, visibleAllDeals]
  );

  const setSelectedAccountIds = useCallback(
    (ids: string[]) => setFilter((f) => ({ ...f, selectedAccountIds: ids })),
    []
  );
  const setRange = useCallback(
    (fromMs: number | null, toMs: number | null) =>
      setFilter((f) => ({ ...f, fromMs, toMs })),
    []
  );
  const resetFilter = useCallback(
    () =>
      setFilter({
        selectedAccountIds: [],
        fromMs: serverNowMs - defaultDays * 86_400_000,
        toMs: serverNowMs,
      }),
    [serverNowMs, defaultDays]
  );
  const ensureRangeCovered = useCallback((fromMs: number, toMs: number) => {
    // Demo data covers everything — just remember the last call so we don't
    // burn re-renders if a view spams it.
    lastEnsureRef.current = { from: fromMs, to: toMs };
  }, []);
  const refresh = useCallback(async () => {
    /* no-op in demo */
  }, []);

  const value = useMemo<HistoryContextValue>(
    () => ({
      filter,
      setSelectedAccountIds,
      setRange,
      resetFilter,
      ensureRangeCovered,
      granularity,
      setGranularity,
      accounts: MOCK_ACCOUNTS,
      deals,
      allDeals: visibleAllDeals,
      syncStatus,
      isLoading: false,
      isRefreshing: false,
      error: null,
      refresh,
      serverNowMs,
    }),
    [
      filter,
      setSelectedAccountIds,
      setRange,
      resetFilter,
      ensureRangeCovered,
      granularity,
      setGranularity,
      deals,
      visibleAllDeals,
      syncStatus,
      refresh,
      serverNowMs,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHistory(): HistoryContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useHistory must be used inside HistoryProvider");
  return v;
}
