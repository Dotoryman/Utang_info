import assert from "node:assert/strict";
import test from "node:test";

import {
  getCookieValue,
  isUniqueConstraintError,
  isValidEmail,
  normalizeEmail,
} from "../lib/auth.ts";
import {
  hashPassword,
  verifyPassword,
} from "../lib/password.ts";
import {
  generateSessionToken,
  hashSessionToken,
} from "../lib/session.ts";
import {
  canDeleteResident,
  canViewAdminUsers,
  parseAdminPage,
} from "../lib/admin.ts";
import {
  createAuthRateLimitKey,
  getTurnstileConfiguration,
  isAuthRequestAllowed,
  validateTurnstileToken,
} from "../lib/security.ts";

test("normalizes and validates email addresses", () => {
  assert.equal(normalizeEmail("  USER@Example.COM "), "user@example.com");
  assert.equal(isValidEmail("user@example.com"), true);
  assert.equal(isValidEmail("invalid-email"), false);
});

test("reads encoded cookies and rejects malformed values safely", () => {
  assert.equal(
    getCookieValue("theme=cream; session=hello%20utang", "session"),
    "hello utang",
  );
  assert.equal(getCookieValue("session=%E0%A4%A", "session"), null);
  assert.equal(getCookieValue(null, "session"), null);
});

test("detects database uniqueness errors without matching unrelated errors", () => {
  assert.equal(
    isUniqueConstraintError(
      new Error("UNIQUE constraint failed: users.email"),
    ),
    true,
  );
  assert.equal(isUniqueConstraintError(new Error("network error")), false);
});

test("hashes and verifies passwords without storing the original value", async () => {
  const password = "utang-secret-123";
  const passwordHash = await hashPassword(password);

  assert.equal(passwordHash.includes(password), false);
  assert.equal(await verifyPassword(password, passwordHash), true);
  assert.equal(await verifyPassword("wrong-password", passwordHash), false);
  assert.equal(await verifyPassword(password, "invalid"), false);
});

test("creates random session tokens with deterministic hashes", async () => {
  const firstToken = generateSessionToken();
  const secondToken = generateSessionToken();

  assert.notEqual(firstToken, secondToken);
  assert.match(firstToken, /^[A-Za-z0-9_-]+$/);
  assert.equal(
    await hashSessionToken(firstToken),
    await hashSessionToken(firstToken),
  );
  assert.notEqual(
    await hashSessionToken(firstToken),
    await hashSessionToken(secondToken),
  );
});

test("allows only admins to view the resident directory", () => {
  assert.equal(canViewAdminUsers("admin"), true);
  assert.equal(canViewAdminUsers("user"), false);
  assert.equal(canViewAdminUsers(""), false);
});

test("allows admins to delete residents but protects admin accounts", () => {
  assert.equal(
    canDeleteResident("admin-1", "admin", "user-1", "user"),
    true,
  );
  assert.equal(
    canDeleteResident("user-1", "user", "user-2", "user"),
    false,
  );
  assert.equal(
    canDeleteResident("admin-1", "admin", "admin-2", "admin"),
    false,
  );
  assert.equal(
    canDeleteResident("admin-1", "admin", "admin-1", "admin"),
    false,
  );
});

test("normalizes invalid admin list pages", () => {
  assert.equal(parseAdminPage(null), 1);
  assert.equal(parseAdminPage("0"), 1);
  assert.equal(parseAdminPage("-1"), 1);
  assert.equal(parseAdminPage("invalid"), 1);
  assert.equal(parseAdminPage("3"), 3);
});

test("builds private and stable authentication rate limit keys", async () => {
  const firstKey = await createAuthRateLimitKey(
    "login",
    " USER@example.com ",
  );
  const secondKey = await createAuthRateLimitKey(
    "login",
    "user@example.com",
  );
  const registerKey = await createAuthRateLimitKey(
    "register",
    "user@example.com",
  );

  assert.equal(firstKey, secondKey);
  assert.notEqual(firstKey, registerKey);
  assert.equal(firstKey.includes("user@example.com"), false);
});

test("uses an authentication limiter when one is configured", async () => {
  const calls = [];
  const limiter = {
    async limit(options) {
      calls.push(options.key);
      return { success: false };
    },
  };

  assert.equal(
    await isAuthRequestAllowed(
      limiter,
      "login",
      "user@example.com",
    ),
    false,
  );
  assert.equal(calls.length, 1);
  assert.equal(
    await isAuthRequestAllowed(
      undefined,
      "login",
      "user@example.com",
    ),
    true,
  );
});

test("enables Turnstile only with a complete configuration", () => {
  assert.deepEqual(getTurnstileConfiguration({}), {
    enabled: false,
    complete: true,
    siteKey: null,
    secretKey: null,
    hostnames: [],
  });

  assert.equal(
    getTurnstileConfiguration({
      TURNSTILE_SITE_KEY: "site-key",
    }).complete,
    false,
  );

  assert.deepEqual(
    getTurnstileConfiguration({
      TURNSTILE_SITE_KEY: "site-key",
      TURNSTILE_SECRET: "secret-key",
      TURNSTILE_HOSTNAMES: " utangland.cloud, www.utangland.cloud ",
    }),
    {
      enabled: true,
      complete: true,
      siteKey: "site-key",
      secretKey: "secret-key",
      hostnames: ["utangland.cloud", "www.utangland.cloud"],
    },
  );
});

test("allows disabled Turnstile and rejects incomplete configuration", async () => {
  const request = new Request("https://utangland.cloud/api/login", {
    method: "POST",
  });

  assert.deepEqual(
    await validateTurnstileToken(request, {}, null, "login"),
    {
      ok: true,
      enabled: false,
    },
  );

  assert.deepEqual(
    await validateTurnstileToken(
      request,
      { TURNSTILE_SITE_KEY: "site-key" },
      null,
      "login",
    ),
    {
      ok: false,
      status: 503,
      message: "보안 확인 설정을 점검하고 있어요. 잠시 후 다시 시도해 주세요.",
    },
  );
});

test("accepts only the expected Turnstile action and hostname", async () => {
  const originalFetch = globalThis.fetch;
  const environment = {
    TURNSTILE_SITE_KEY: "site-key",
    TURNSTILE_SECRET: "secret-key",
    TURNSTILE_HOSTNAMES: "utangland.cloud",
  };
  const request = new Request("https://utangland.cloud/api/login", {
    method: "POST",
    headers: {
      "cf-connecting-ip": "203.0.113.10",
    },
  });

  try {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          success: true,
          action: "login",
          hostname: "utangland.cloud",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

    assert.deepEqual(
      await validateTurnstileToken(
        request,
        environment,
        "valid-test-token",
        "login",
      ),
      {
        ok: true,
        enabled: true,
      },
    );

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          success: true,
          action: "register",
          hostname: "untrusted.example",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

    assert.deepEqual(
      await validateTurnstileToken(
        request,
        environment,
        "wrong-scope-token",
        "login",
      ),
      {
        ok: false,
        status: 400,
        message: "보안 확인이 만료되었어요. 다시 확인해 주세요.",
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
