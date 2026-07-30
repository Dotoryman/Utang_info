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
  canViewAdminUsers,
  parseAdminPage,
} from "../lib/admin.ts";

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

test("normalizes invalid admin list pages", () => {
  assert.equal(parseAdminPage(null), 1);
  assert.equal(parseAdminPage("0"), 1);
  assert.equal(parseAdminPage("-1"), 1);
  assert.equal(parseAdminPage("invalid"), 1);
  assert.equal(parseAdminPage("3"), 3);
});
