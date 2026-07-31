import assert from "node:assert/strict";
import test from "node:test";

import {
  canDeleteComment,
  canDeletePost,
  canEditComment,
  canEditPost,
  normalizeCommunitySearch,
  parsePage,
  validateCommentInput,
  validatePostInput,
} from "../lib/community.ts";

test("normalizes invalid pages to the first page", () => {
  assert.equal(parsePage(null), 1);
  assert.equal(parsePage("0"), 1);
  assert.equal(parsePage("-2"), 1);
  assert.equal(parsePage("not-a-number"), 1);
  assert.equal(parsePage("3"), 3);
});

test("normalizes community search text and limits its length", () => {
  assert.equal(
    normalizeCommunitySearch("  도토리 이야기  "),
    "도토리 이야기",
  );
  assert.equal(normalizeCommunitySearch(null), "");
  assert.equal(normalizeCommunitySearch("가".repeat(80)).length, 50);
});

test("trims and accepts a valid community post", () => {
  const result = validatePostInput({
    title: "  우땅이의 하루  ",
    content: "  오늘도 우다다!  ",
    isNotice: false,
  });

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.deepEqual(result.value, {
      title: "우땅이의 하루",
      content: "오늘도 우다다!",
      isNotice: false,
    });
  }
});

test("rejects invalid community post lengths", () => {
  assert.equal(
    validatePostInput({
      title: "한",
      content: "내용",
    }).ok,
    false,
  );
  assert.equal(
    validatePostInput({
      title: "정상 제목",
      content: "",
    }).ok,
    false,
  );
  assert.equal(
    validatePostInput({
      title: "정상 제목",
      content: "가".repeat(5_001),
    }).ok,
    false,
  );
});

test("allows only authors to edit and authors or admins to delete", () => {
  assert.equal(canEditPost("user-1", "user-1"), true);
  assert.equal(canEditPost("user-2", "user-1"), false);
  assert.equal(canDeletePost("user-1", "user", "user-1"), true);
  assert.equal(canDeletePost("user-2", "user", "user-1"), false);
  assert.equal(canDeletePost("admin-1", "admin", "user-1"), true);
});

test("trims and validates community comments", () => {
  const result = validateCommentInput({
    content: "  우땅이 너무 귀여워요!  ",
  });

  assert.equal(result.ok, true);

  if (result.ok) {
    assert.deepEqual(result.value, {
      content: "우땅이 너무 귀여워요!",
    });
  }

  assert.equal(validateCommentInput({ content: "" }).ok, false);
  assert.equal(
    validateCommentInput({
      content: "가".repeat(501),
    }).ok,
    false,
  );
});

test("allows comment authors to edit and authors or admins to delete", () => {
  assert.equal(canEditComment("user-1", "user-1"), true);
  assert.equal(canEditComment("user-2", "user-1"), false);
  assert.equal(
    canDeleteComment("user-1", "user", "user-1"),
    true,
  );
  assert.equal(
    canDeleteComment("user-2", "user", "user-1"),
    false,
  );
  assert.equal(
    canDeleteComment("admin-1", "admin", "user-1"),
    true,
  );
});
