"use client";

import { useEffect, useRef, useState } from "react";

import type { AuthAction } from "@/lib/security";

import styles from "./TurnstileWidget.module.css";

type TurnstileWidgetProps = {
  action: AuthAction;
  onReadyChange: (ready: boolean) => void;
  onTokenChange: (token: string | null) => void;
};

type TurnstileApi = {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      appearance: "interaction-only";
      size: "flexible";
      theme: "light";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ): string;
  remove(widgetId: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type TurnstileConfigResponse = {
  enabled?: boolean;
  siteKey?: string | null;
};

const TURNSTILE_SCRIPT_ID = "utangland-turnstile-script";
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const existingScript = document.getElementById(
      TURNSTILE_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement("script");

    function handleLoad() {
      if (window.turnstile) {
        resolve(window.turnstile);
      } else {
        reject(new Error("Turnstile API is unavailable."));
      }
    }

    function handleError() {
      scriptPromise = null;
      reject(new Error("Turnstile script failed to load."));
    }

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_URL;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return scriptPromise;
}

export function TurnstileWidget({
  action,
  onReadyChange,
  onTokenChange,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({
    onReadyChange,
    onTokenChange,
  });
  const [status, setStatus] = useState<"loading" | "disabled" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    callbacksRef.current = {
      onReadyChange,
      onTokenChange,
    };
  }, [onReadyChange, onTokenChange]);

  useEffect(() => {
    let isActive = true;
    let widgetId: string | null = null;
    let api: TurnstileApi | null = null;

    callbacksRef.current.onReadyChange(false);
    callbacksRef.current.onTokenChange(null);

    async function initialize() {
      try {
        const response = await fetch("/api/security/turnstile", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Turnstile configuration request failed.");
        }

        const config = (await response.json()) as TurnstileConfigResponse;

        if (!isActive) {
          return;
        }

        if (!config.enabled || !config.siteKey) {
          setStatus("disabled");
          callbacksRef.current.onReadyChange(true);
          return;
        }

        api = await loadTurnstile();

        if (!isActive || !containerRef.current) {
          return;
        }

        widgetId = api.render(containerRef.current, {
          sitekey: config.siteKey,
          action,
          appearance: "interaction-only",
          size: "flexible",
          theme: "light",
          callback: (token) => {
            callbacksRef.current.onTokenChange(token);
            callbacksRef.current.onReadyChange(true);
            setStatus("ready");
          },
          "expired-callback": () => {
            callbacksRef.current.onTokenChange(null);
            callbacksRef.current.onReadyChange(false);
          },
          "error-callback": () => {
            callbacksRef.current.onTokenChange(null);
            callbacksRef.current.onReadyChange(false);
            setStatus("error");
          },
        });
        setStatus("ready");
      } catch {
        if (isActive) {
          setStatus("error");
          callbacksRef.current.onReadyChange(false);
        }
      }
    }

    void initialize();

    return () => {
      isActive = false;
      callbacksRef.current.onTokenChange(null);

      if (api && widgetId) {
        api.remove(widgetId);
      }
    };
  }, [action]);

  if (status === "disabled") {
    return null;
  }

  return (
    <div className={styles.container}>
      <div ref={containerRef} className={styles.widget} />
      {status === "loading" && (
        <p className={styles.status}>안전한 입장을 준비하고 있어요...</p>
      )}
      {status === "error" && (
        <p className={styles.error} role="alert">
          보안 확인을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
