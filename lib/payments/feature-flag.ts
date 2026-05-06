export const paymentsEnabled = true

/**
 * When false, the app hides NinjaTrader-specific UI (install flow, platform row, etc.).
 * Prop-firm logos tied to that feature are listed in `PROP_FIRM_ALTS_HIDDEN_UNLESS_NINJATRADER`
 * below — update it when you change which brands we show with NinjaTrader.
 */
export const ninjatraderEnabled = false

/** `alt` text of logos in `PropFirmLogosScroll` shown only when `ninjatraderEnabled` is true. */
const PROP_FIRM_ALTS_HIDDEN_UNLESS_NINJATRADER = new Set<string>([
  "Topstep",
  "Apex Trader Funding",
  "My Funded Futures",
  "TradeDay",
  "Alpha Futures",
  "Lucid Trading",
  "Take Profit Trader",
])

export function propFirmAltHiddenUnlessNinjatrader(alt: string): boolean {
  return PROP_FIRM_ALTS_HIDDEN_UNLESS_NINJATRADER.has(alt)
}
