"use client";
import { useEffect, useRef, useState } from "react";
declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: Record<string, unknown>,
      ) => string;
      remove: (id: string) => void;
    };
  }
}
export function SecurityCheck({
  onToken,
  version = 0,
}: {
  onToken: (token: string) => void;
  version?: number;
}) {
  const node = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  const [error, setError] = useState("");
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!key) {
      setError(
        "Security check is not configured. Please email info@eazzime.com.",
      );
      return;
    }
    let id: string | undefined;
    let stopped = false;
    let attempts = 0;
    if (!document.getElementById("eazzime-turnstile")) {
      const script = document.createElement("script");
      script.id = "eazzime-turnstile";
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      document.head.append(script);
    }
    const timer = setInterval(() => {
      if (stopped) return;
      if (window.turnstile && node.current) {
        clearInterval(timer);
        setError("");
        id = window.turnstile.render(node.current, {
          sitekey: key,
          action: "sales",
          theme: "light",
          size: "flexible",
          callback: (token: string) => callback.current(token),
          "expired-callback": () => callback.current(""),
          "error-callback": () => {
            callback.current("");
            setError("Security check failed. Please retry or email our team.");
          },
        });
      } else if (++attempts > 100) {
        clearInterval(timer);
        setError(
          "Security check could not load. Please check your connection or email our team.",
        );
      }
    }, 100);
    return () => {
      stopped = true;
      clearInterval(timer);
      if (id) window.turnstile?.remove(id);
    };
  }, [version]);
  return (
    <div className="sales-security">
      <div ref={node} />
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
