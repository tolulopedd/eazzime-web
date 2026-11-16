export type ChatEvent =
  | "chatbot_open"
  | "chatbot_conversation_started"
  | "chatbot_service_selected"
  | "chatbot_lead_qualified"
  | "chatbot_lead_generated"
  | "chatbot_consultation_booked"
  | "chatbot_human_handoff";
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
const allowed = new Set([
  "custom-software",
  "enterprise-applications",
  "ai-automation",
  "data-engineering",
  "product-design",
  "systems-integration",
  "business-automation",
  "digital-transformation",
  "managed-support",
  "data-analytics",
]);
export function storageGet(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
export function storageSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* privacy mode */
  }
}
export function analyticsConsent(enabled: boolean) {
  storageSet("eazzime-analytics", String(enabled));
  if (!enabled) {
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
    return;
  }
  const id = process.env.NEXT_PUBLIC_GA4_ID;
  if (!window.gtag && id && /^G-[A-Z0-9]+$/.test(id)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer!.push(arguments);
    };
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.gtag("js", new Date());
    window.gtag("config", id, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: location.origin + location.pathname,
      page_referrer: "",
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.append(script);
  }
  window.gtag?.("consent", "update", { analytics_storage: "granted" });
}
export function track(
  event: ChatEvent,
  key: string = event,
  service?: string,
  channel?: "email" | "whatsapp",
) {
  if (
    storageGet("eazzime-analytics") !== "true" ||
    !window.gtag ||
    storageGet(`ea-event:${key}`)
  )
    return;
  const properties: Record<string, string> = {
    page_location: location.origin + location.pathname,
    page_referrer: "",
    page_title: "EazziMe website",
    transport_type: "beacon",
  };
  if (service && allowed.has(service)) properties.service_id = service;
  if (channel) properties.handoff_channel = channel;
  window.gtag("event", event, properties);
  storageSet(`ea-event:${key}`, "1");
}
export function firstAttribution() {
  const stored = storageGet("eazzime-attribution");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      /* reset */
    }
  }
  const query = new URLSearchParams(location.search);
  const data: Record<string, string> = {
    landing_page: location.pathname.slice(0, 250),
    referrer: "",
  };
  try {
    data.referrer = document.referrer
      ? new URL(document.referrer).hostname
      : "";
  } catch {
    /* invalid referrer */
  }
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ])
    data[key] = (query.get(key) || "").slice(0, 250);
  storageSet("eazzime-attribution", JSON.stringify(data));
  return data;
}
