"use client";

import React, { createContext, useContext, useMemo } from "react";
import { MOCK_POSITIONS, MOCK_PENDING, MOCK_ACCOUNTS } from "./mockData";

export const FLASH_DURATION_MS = 600;
export const FLASH_TRANSITION_MS = FLASH_DURATION_MS / 2;

export interface OrdersByAccountId {
  balance: number | null;
  pnl: number | null;
  equity: number | null;
  openTrades: number;
  pendingTrades: number;
}

export type OrdersByAccountIdRecord = Record<string, OrdersByAccountId>;

interface AccountOrdersContextType {
  openOrders: number;
  pendingOrders: number;
  openFlash: "up" | "down" | null;
  pendingFlash: "up" | "down" | null;
  flashingAccountIds: Set<string>;
  ordersByAccountId: OrdersByAccountIdRecord;
  ordersUpdateTrigger: number;
}

const AccountOrdersContext = createContext<AccountOrdersContextType | null>(null);

const ACCOUNT_BALANCE: Record<string, number> = {
  "2847193": 50_000,
  "4912837": 51_230,
  "7382914": 100_000,
  "2847561": 50_000,
};

export function AccountOrdersProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<AccountOrdersContextType>(() => {
    const ordersByAccountId: OrdersByAccountIdRecord = {};
    for (const a of MOCK_ACCOUNTS) {
      const accountPositions = MOCK_POSITIONS.filter((p) => p.account_id === a.account_id);
      const accountPending = MOCK_PENDING.filter((p) => p.account_id === a.account_id);
      const balance = ACCOUNT_BALANCE[a.account_id] ?? 50_000;
      const pnl = accountPositions.reduce((s, p) => s + p.profit, 0);
      ordersByAccountId[a.account_id] = {
        balance,
        pnl,
        equity: balance + pnl,
        openTrades: accountPositions.length,
        pendingTrades: accountPending.length,
      };
    }
    return {
      openOrders: MOCK_POSITIONS.length,
      pendingOrders: MOCK_PENDING.length,
      openFlash: null,
      pendingFlash: null,
      flashingAccountIds: new Set<string>(),
      ordersByAccountId,
      ordersUpdateTrigger: 0,
    };
  }, []);

  return (
    <AccountOrdersContext.Provider value={value}>{children}</AccountOrdersContext.Provider>
  );
}

export function useAccountOrders(): AccountOrdersContextType {
  const ctx = useContext(AccountOrdersContext);
  if (!ctx) {
    return {
      openOrders: 0,
      pendingOrders: 0,
      openFlash: null,
      pendingFlash: null,
      flashingAccountIds: new Set(),
      ordersByAccountId: {},
      ordersUpdateTrigger: 0,
    };
  }
  return ctx;
}
