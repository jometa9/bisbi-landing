// Minimal subset of the real endpoints map. Only the keys touched by the
// verbatim files we copied (orders.ts) need to exist.
export const endpoints = {
  orders: {
    open: "/api/orders/open",
    openWs: "/api/orders/open/ws",
  },
  accounts: {
    orders: "/api/accounts/orders",
  },
} as const;
