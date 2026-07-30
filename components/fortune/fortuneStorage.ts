import { FORTUNE_IDS, FORTUNES } from "./fortuneData";
import type { DailyFortune } from "./fortuneTypes";
import {
  createDailyFortune,
  getDateKey,
  isDailyFortune,
} from "./fortuneUtils";

const STORAGE_KEY = "utang-daily-fortune-v2";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function getDailyFortune(
  storage: StorageLike,
  date = new Date(),
): DailyFortune {
  const today = getDateKey(date);

  try {
    const storedValue = storage.getItem(STORAGE_KEY);

    if (storedValue) {
      const parsedValue: unknown = JSON.parse(storedValue);

      if (
        isDailyFortune(parsedValue, FORTUNE_IDS) &&
        parsedValue.date === today
      ) {
        return parsedValue;
      }
    }
  } catch {
    // 저장 공간을 사용할 수 없어도 새 운세를 생성한다.
  }

  const result = createDailyFortune(
    FORTUNES.map((fortune) => fortune.id),
    date,
  );

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // 저장 실패는 현재 운세 표시를 막지 않는다.
  }

  return result;
}
