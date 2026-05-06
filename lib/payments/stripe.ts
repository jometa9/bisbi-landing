import Stripe from "stripe";

let _client: Stripe | null = null;
let _cachedKey: string | null = null;

export async function getStripe(): Promise<Stripe> {
  const { getAppSettings } = await import("@/lib/db/queries");
  const settings = await getAppSettings();
  const key = settings.stripeSecretKey;

  if (!key) throw new Error("Stripe secret key not configured in app settings");

  if (_client && _cachedKey === key) return _client;

  _client = new Stripe(key);
  _cachedKey = key;
  return _client;
}

export function clearStripeCache() {
  _client = null;
  _cachedKey = null;
}
