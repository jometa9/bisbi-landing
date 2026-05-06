import { createHash } from "crypto";
import { ConversionsAPIResponse, ServerEvent, UserData } from "./types";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || 849744324157395;
const ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN || "";
const API_VERSION = "v21.0";
const CAPI_ENDPOINT = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;

function hashData(data: string | undefined | null): string | undefined {
  if (!data || data.trim() === "") return undefined;

  const normalized = data.toLowerCase().trim();

  return createHash("sha256").update(normalized).digest("hex");
}

export function normalizeUserData(userData: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}): UserData {
  return {
    em: hashData(userData.email),
    ph: hashData(userData.phone),
    fn: hashData(userData.firstName),
    ln: hashData(userData.lastName),
    ct: hashData(userData.city),
    st: hashData(userData.state),
    zp: hashData(userData.zip),
    country: userData.country?.toLowerCase(),
    client_ip_address: userData.clientIpAddress,
    client_user_agent: userData.clientUserAgent,
    fbc: userData.fbc,
    fbp: userData.fbp,
  };
}

export async function sendMetaEvent(
  event: ServerEvent
): Promise<ConversionsAPIResponse | null> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return null;
  }

  if (process.env.NODE_ENV === "development") {
    return {
      events_received: 1,
      messages: ["Development mode - evento no enviado"],
    };
  }

  try {
    const payload = {
      data: [event],
      test_event_code: process.env.META_TEST_EVENT_CODE,
    };

    const response = await fetch(
      `${CAPI_ENDPOINT}?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Meta Conversions API Error:", errorData);
      return null;
    }

    const result: ConversionsAPIResponse = await response.json();
    return result;
  } catch (error) {
    console.error("Meta Conversions API Request Failed:", error);
    return null;
  }
}

interface TrackPurchaseParams {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  value: number;
  currency: string;
  contentName?: string;
  contentIds?: string[];
  numItems?: number;
  productKey?: string;
  eventSourceUrl: string;
  eventId?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}

export async function trackPurchase(params: TrackPurchaseParams) {
  const event: ServerEvent = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.eventId,
    event_source_url: params.eventSourceUrl,
    action_source: "website",
    user_data: normalizeUserData({
      email: params.email,
      phone: params.phone,
      firstName: params.firstName,
      lastName: params.lastName,
      clientIpAddress: params.clientIpAddress,
      clientUserAgent: params.clientUserAgent,
      fbc: params.fbc,
      fbp: params.fbp,
    }),
    custom_data: {
      value: params.value,
      currency: params.currency,
      content_name: params.contentName,
      content_ids: params.contentIds,
      num_items: params.numItems,
      ...(params.productKey && { productKey: params.productKey }),
    },
  };

  return sendMetaEvent(event);
}

interface TrackLeadParams {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  contentName?: string;
  contentCategory?: string;
  eventSourceUrl: string;
  eventId?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}

export async function trackLead(params: TrackLeadParams) {
  const event: ServerEvent = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.eventId,
    event_source_url: params.eventSourceUrl,
    action_source: "website",
    user_data: normalizeUserData({
      email: params.email,
      phone: params.phone,
      firstName: params.firstName,
      lastName: params.lastName,
      clientIpAddress: params.clientIpAddress,
      clientUserAgent: params.clientUserAgent,
      fbc: params.fbc,
      fbp: params.fbp,
    }),
    custom_data: {
      content_name: params.contentName,
      content_category: params.contentCategory,
    },
  };

  return sendMetaEvent(event);
}

interface TrackRegistrationParams {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  eventSourceUrl: string;
  eventId?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}

export async function trackCompleteRegistration(
  params: TrackRegistrationParams
) {
  const event: ServerEvent = {
    event_name: "CompleteRegistration",
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.eventId,
    event_source_url: params.eventSourceUrl,
    action_source: "website",
    user_data: normalizeUserData({
      email: params.email,
      phone: params.phone,
      firstName: params.firstName,
      lastName: params.lastName,
      clientIpAddress: params.clientIpAddress,
      clientUserAgent: params.clientUserAgent,
      fbc: params.fbc,
      fbp: params.fbp,
    }),
    custom_data: {
      status: params.status || "completed",
    },
  };

  return sendMetaEvent(event);
}

interface TrackInitiateCheckoutParams {
  email?: string;
  phone?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  productKey?: string;
  eventSourceUrl: string;
  eventId?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
}

export async function trackInitiateCheckout(
  params: TrackInitiateCheckoutParams
) {
  const event: ServerEvent = {
    event_name: "InitiateCheckout",
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.eventId,
    event_source_url: params.eventSourceUrl,
    action_source: "website",
    user_data: normalizeUserData({
      email: params.email,
      phone: params.phone,
      clientIpAddress: params.clientIpAddress,
      clientUserAgent: params.clientUserAgent,
      fbc: params.fbc,
      fbp: params.fbp,
    }),
    custom_data: {
      value: params.value,
      currency: params.currency,
      content_name: params.contentName,
      content_category: params.contentCategory,
      ...(params.productKey && { productKey: params.productKey }),
    },
  };

  return sendMetaEvent(event);
}

export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function extractFacebookCookies(request: Request): {
  fbc?: string;
  fbp?: string;
} {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return {};

  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    },
    {} as Record<string, string>
  );

  return {
    fbc: cookies._fbc,
    fbp: cookies._fbp,
  };
}

export function extractClientInfo(request: Request): {
  clientIpAddress?: string;
  clientUserAgent?: string;
} {
  return {
    clientIpAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      undefined,
    clientUserAgent: request.headers.get("user-agent") || undefined,
  };
}
