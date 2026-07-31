export type AuthAction = "login" | "register";

export type RateLimiterBinding = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};

export type TurnstileValidationResult =
  | { ok: true; enabled: boolean }
  | { ok: false; status: 400 | 503; message: string };

type TurnstileEnvironment = {
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET?: string;
  TURNSTILE_HOSTNAMES?: string;
};

type TurnstileSiteverifyResponse = {
  success?: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const AUTH_RATE_LIMIT_MESSAGE =
  "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.";

function getOptionalValue(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getTurnstileConfiguration(
  environment: TurnstileEnvironment,
): {
  enabled: boolean;
  complete: boolean;
  siteKey: string | null;
  secretKey: string | null;
  hostnames: string[];
} {
  const siteKey = getOptionalValue(environment.TURNSTILE_SITE_KEY);
  const secretKey = getOptionalValue(environment.TURNSTILE_SECRET);
  const hostnames = getOptionalValue(environment.TURNSTILE_HOSTNAMES)
    .split(",")
    .map((hostname) => hostname.trim().toLowerCase())
    .filter(Boolean);
  const hasAnyValue = Boolean(siteKey || secretKey || hostnames.length > 0);
  const enabled = Boolean(siteKey && secretKey && hostnames.length > 0);

  return {
    enabled,
    complete: enabled || !hasAnyValue,
    siteKey: enabled ? siteKey : null,
    secretKey: enabled ? secretKey : null,
    hostnames: enabled ? hostnames : [],
  };
}

export async function createAuthRateLimitKey(
  action: AuthAction,
  identity: string,
): Promise<string> {
  const normalizedIdentity = identity.trim().toLowerCase().slice(0, 254);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${action}:${normalizedIdentity}`),
  );
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return `${action}:${hash}`;
}

export async function isAuthRequestAllowed(
  limiter: RateLimiterBinding | undefined,
  action: AuthAction,
  identity: string,
): Promise<boolean> {
  if (!limiter) {
    return true;
  }

  try {
    const key = await createAuthRateLimitKey(action, identity);
    const result = await limiter.limit({ key });
    return result.success;
  } catch (error) {
    console.error("Authentication rate limiter failed:", error);
    return true;
  }
}

export async function validateTurnstileToken(
  request: Request,
  environment: TurnstileEnvironment,
  token: unknown,
  expectedAction: AuthAction,
): Promise<TurnstileValidationResult> {
  const configuration = getTurnstileConfiguration(environment);

  if (!configuration.complete) {
    console.error("Turnstile configuration is incomplete.");
    return {
      ok: false,
      status: 503,
      message: "보안 확인 설정을 점검하고 있어요. 잠시 후 다시 시도해 주세요.",
    };
  }

  if (!configuration.enabled || !configuration.secretKey) {
    return { ok: true, enabled: false };
  }

  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 2048
  ) {
    return {
      ok: false,
      status: 400,
      message: "보안 확인을 완료해 주세요.",
    };
  }

  const body = new URLSearchParams({
    secret: configuration.secretKey,
    response: token,
    idempotency_key: crypto.randomUUID(),
  });
  const remoteIp = request.headers.get("cf-connecting-ip");

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      throw new Error(`Turnstile Siteverify returned ${response.status}`);
    }

    const result = (await response.json()) as TurnstileSiteverifyResponse;

    const responseHostname = result.hostname?.trim().toLowerCase() ?? "";

    if (
      !result.success ||
      result.action !== expectedAction ||
      !configuration.hostnames.includes(responseHostname)
    ) {
      console.warn("Turnstile verification rejected:", result["error-codes"]);
      return {
        ok: false,
        status: 400,
        message: "보안 확인이 만료되었어요. 다시 확인해 주세요.",
      };
    }

    return { ok: true, enabled: true };
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return {
      ok: false,
      status: 503,
      message: "보안 확인 서버와 연결할 수 없어요. 잠시 후 다시 시도해 주세요.",
    };
  }
}
