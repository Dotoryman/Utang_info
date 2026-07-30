import assert from "node:assert/strict";
import test from "node:test";

import {
  createDailyFortune,
  generateLuckyNumbers,
  getDateKey,
  isDailyFortune,
} from "../components/fortune/fortuneUtils.ts";

test("formats a local date as a stable storage key", () => {
  assert.equal(getDateKey(new Date(2026, 6, 30)), "2026-07-30");
});

test("generates six sorted and unique numbers from 1 to 45", () => {
  const numbers = generateLuckyNumbers((max) => max - 1);

  assert.equal(numbers.length, 6);
  assert.equal(new Set(numbers).size, 6);
  assert.deepEqual(numbers, [...numbers].sort((left, right) => left - right));
  assert.ok(numbers.every((number) => number >= 1 && number <= 45));
});

test("creates a versioned daily fortune that can be validated", () => {
  const fortuneIds = ["first", "second", "third"];
  const result = createDailyFortune(
    fortuneIds,
    new Date(2026, 6, 30),
    () => 0,
  );

  assert.equal(result.version, 2);
  assert.equal(result.date, "2026-07-30");
  assert.equal(result.fortuneId, "first");
  assert.equal(
    isDailyFortune(result, new Set(fortuneIds)),
    true,
  );
});

test("rejects duplicated or out-of-range lucky numbers", () => {
  const validIds = new Set(["first"]);

  assert.equal(
    isDailyFortune(
      {
        version: 2,
        date: "2026-07-30",
        fortuneId: "first",
        luckyNumbers: [1, 1, 2, 3, 4, 5],
      },
      validIds,
    ),
    false,
  );

  assert.equal(
    isDailyFortune(
      {
        version: 2,
        date: "2026-07-30",
        fortuneId: "first",
        luckyNumbers: [1, 2, 3, 4, 5, 46],
      },
      validIds,
    ),
    false,
  );
});
