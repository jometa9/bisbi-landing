"use client";

interface MetaPixelProps {
  pixelId: string;
}

declare global {
  interface Window {
    fbq?: (
      action: string,
      eventName: string,
      parameters?: Record<string, unknown>
    ) => void;
    _fbq_ids?: Set<string>;
  }
}

export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function MetaPixel({ pixelId }: MetaPixelProps) {
  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}

export function useMetaPixel() {
  const trackEvent = (
    eventName: string,
    parameters?: Record<string, unknown>,
    eventId?: string
  ) => {
    if (typeof window !== "undefined" && window.fbq) {
      const params = {
        ...parameters,
        ...(eventId && { eventID: eventId }),
      };
      window.fbq("track", eventName, params);
    }
  };

  const trackCustomEvent = (
    eventName: string,
    parameters?: Record<string, unknown>,
    eventId?: string
  ) => {
    if (typeof window !== "undefined" && window.fbq) {
      const params = {
        ...parameters,
        ...(eventId && { eventID: eventId }),
      };
      window.fbq("trackCustom", eventName, params);
    }
  };

  const trackViewContent = (
    parameters?: {
      content_name?: string;
      content_category?: string;
      content_ids?: string[];
      value?: number;
      currency?: string;
    },
    eventId?: string
  ) => {
    trackEvent("ViewContent", parameters, eventId);
  };

  const trackCompleteRegistration = (
    parameters?: {
      content_name?: string;
      status?: boolean;
    },
    eventId?: string
  ) => {
    trackEvent("CompleteRegistration", parameters, eventId);
  };

  const trackPurchase = (
    parameters?: {
      content_name?: string;
      content_type?: string;
      content_ids?: string[];
      value?: number;
      currency?: string;
      num_items?: number;
    },
    eventId?: string
  ) => {
    trackEvent("Purchase", parameters, eventId);
  };

  const trackInitiateCheckout = (
    parameters?: {
      content_name?: string;
      content_category?: string;
      value?: number;
      currency?: string;
      num_items?: number;
    },
    eventId?: string
  ) => {
    trackEvent("InitiateCheckout", parameters, eventId);
  };

  const trackLead = (
    parameters?: {
      content_name?: string;
      content_category?: string;
    },
    eventId?: string
  ) => {
    trackEvent("Lead", parameters, eventId);
  };

  const trackSubscriptionCancel = (
    parameters?: {
      content_name?: string;
      content_category?: string;
      value?: number;
      currency?: string;
    },
    eventId?: string
  ) => {
    trackCustomEvent("SubscriptionCancel", parameters, eventId);
  };

  return {
    trackEvent,
    trackCustomEvent,
    trackViewContent,
    trackCompleteRegistration,
    trackPurchase,
    trackInitiateCheckout,
    trackLead,
    trackSubscriptionCancel,
    generateEventId,
  };
}
