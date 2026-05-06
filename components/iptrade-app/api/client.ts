// Stub client for the demo build. Real network calls are never executed —
// the mock providers in components/iptrade-app/context/* feed seeded data
// directly to the views. We keep this file so the verbatim copies of
// orders.ts and history.ts compile.

export interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  bearerToken?: string | null;
  skipJsonContentType?: boolean;
}

export async function request(_path: string, _opts: RequestOptions = {}): Promise<Response> {
  throw new Error("[iptrade-app demo] api request() must not be called from the landing demo");
}

export async function getBaseUrl(): Promise<string> {
  return "";
}

export interface WsAuthQuery {
  api_key: string;
  api_secret: string;
}

export async function getWsAuthQuery(): Promise<WsAuthQuery | null> {
  return null;
}
