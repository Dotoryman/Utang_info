import assert from "node:assert/strict";
import test from "node:test";

import {
  canStoreProfileImage,
  getProfileImageObjectKey,
  hasValidProfileImageSignature,
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_STORAGE_LIMIT_BYTES,
  validateNewPassword,
  validateProfileImageMetadata,
  validateProfileNickname,
} from "../lib/profile.ts";
import { getProfileImageStorageUsage } from "../lib/profileStorage.ts";

test("accepts supported profile image metadata up to 4MB", () => {
  assert.equal(
    validateProfileImageMetadata({
      size: PROFILE_IMAGE_MAX_BYTES,
      type: "image/png",
    }).ok,
    true,
  );
  assert.equal(
    validateProfileImageMetadata({
      size: PROFILE_IMAGE_MAX_BYTES + 1,
      type: "image/png",
    }).ok,
    false,
  );
  assert.equal(
    validateProfileImageMetadata({
      size: 1024,
      type: "image/gif",
    }).ok,
    false,
  );
});

test("checks the actual image signature", () => {
  assert.equal(
    hasValidProfileImageSignature(
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      "image/png",
    ),
    true,
  );
  assert.equal(
    hasValidProfileImageSignature(
      new Uint8Array([0x00, 0x50, 0x4e, 0x47]),
      "image/png",
    ),
    false,
  );
});

test("keeps projected R2 profile image storage within 8GiB", () => {
  assert.equal(
    canStoreProfileImage({
      currentUsageBytes: PROFILE_IMAGE_STORAGE_LIMIT_BYTES - 1024,
      nextImageBytes: 1024,
    }),
    true,
  );
  assert.equal(
    canStoreProfileImage({
      currentUsageBytes: PROFILE_IMAGE_STORAGE_LIMIT_BYTES,
      nextImageBytes: 1,
    }),
    false,
  );
  assert.equal(
    canStoreProfileImage({
      currentUsageBytes: PROFILE_IMAGE_STORAGE_LIMIT_BYTES,
      previousImageBytes: PROFILE_IMAGE_MAX_BYTES,
      nextImageBytes: PROFILE_IMAGE_MAX_BYTES,
    }),
    true,
  );
});

test("summarizes paginated R2 storage usage for the admin bar", async () => {
  const pages = [
    {
      objects: [{ size: 1024 }, { size: 2048 }],
      truncated: true,
      cursor: "next-page",
    },
    {
      objects: [{ size: 4096 }],
      truncated: false,
    },
  ];
  let index = 0;
  const bucket = {
    async list() {
      const page = pages[index];
      index += 1;
      return page;
    },
  };

  const usage = await getProfileImageStorageUsage(bucket);

  assert.equal(usage.usedBytes, 7168);
  assert.equal(usage.objectCount, 3);
  assert.equal(
    usage.remainingBytes,
    PROFILE_IMAGE_STORAGE_LIMIT_BYTES - 7168,
  );
  assert.ok(usage.usagePercent > 0);
  assert.ok(usage.usagePercent < 1);
});

test("extracts only safe profile image object keys", () => {
  assert.equal(
    getProfileImageObjectKey(
      "/api/profile-images/550e8400-e29b-41d4-a716-446655440000.webp",
    ),
    "profile-images/550e8400-e29b-41d4-a716-446655440000.webp",
  );
  assert.equal(
    getProfileImageObjectKey("/api/profile-images/..%2Fsecret.png"),
    null,
  );
  assert.equal(getProfileImageObjectKey("https://example.com/a.png"), null);
});

test("validates profile nickname and password lengths", () => {
  assert.equal(validateProfileNickname("  우땅주민  ").ok, true);
  assert.equal(validateProfileNickname("한").ok, false);
  assert.equal(validateNewPassword("12341234").ok, true);
  assert.equal(validateNewPassword("1234").ok, false);
});
