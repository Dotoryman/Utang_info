import type { DailyFortune, RandomIndex } from "./fortuneTypes";

export function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDateLabel(date = new Date()) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

export const secureRandomIndex: RandomIndex = (max) => {
  if (!Number.isInteger(max) || max <= 0) {
    throw new RangeError("max must be a positive integer");
  }

  const randomValue = new Uint32Array(1);
  crypto.getRandomValues(randomValue);

  return randomValue[0] % max;
};

export function generateLuckyNumbers(
  randomIndex: RandomIndex = secureRandomIndex,
) {
  const numberPool = Array.from({ length: 45 }, (_, index) => index + 1);

  for (let index = numberPool.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);

    if (!Number.isInteger(swapIndex) || swapIndex < 0 || swapIndex > index) {
      throw new RangeError("randomIndex returned an out-of-range value");
    }

    [numberPool[index], numberPool[swapIndex]] = [
      numberPool[swapIndex],
      numberPool[index],
    ];
  }

  return numberPool.slice(0, 6).sort((left, right) => left - right);
}

export function createDailyFortune(
  fortuneIds: readonly string[],
  date = new Date(),
  randomIndex: RandomIndex = secureRandomIndex,
): DailyFortune {
  if (fortuneIds.length === 0) {
    throw new Error("At least one fortune is required");
  }

  return {
    version: 2,
    date: getDateKey(date),
    fortuneId: fortuneIds[randomIndex(fortuneIds.length)],
    luckyNumbers: generateLuckyNumbers(randomIndex),
  };
}

export function isDailyFortune(
  value: unknown,
  validFortuneIds: ReadonlySet<string>,
): value is DailyFortune {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DailyFortune>;
  const numbers = candidate.luckyNumbers;

  return (
    candidate.version === 2 &&
    typeof candidate.date === "string" &&
    typeof candidate.fortuneId === "string" &&
    validFortuneIds.has(candidate.fortuneId) &&
    Array.isArray(numbers) &&
    numbers.length === 6 &&
    new Set(numbers).size === 6 &&
    numbers.every(
      (number) =>
        Number.isInteger(number) && Number(number) >= 1 && Number(number) <= 45,
    )
  );
}
