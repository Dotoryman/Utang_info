"use client";

import { useEffect, useRef, useState } from "react";

type Fortune = {
  id: string;
  title: string;
  message: string;
  luckyColor: string;
  luckyAction: string;
  acorn: string;
  utangMessage: string;
};

type DailyFortune = {
  date: string;
  fortuneId: string;
  luckyNumbers: number[];
};

const STORAGE_KEY = "utang-daily-fortune-v1";

const fortunes = [
  {
    id: "tiny-courage",
    title: "작은 용기가 반짝이는 날",
    message:
      "평소 망설였던 일을 아주 조금만 시작해 보세요. 첫걸음 뒤에는 생각보다 즐거운 길이 기다리고 있어요.",
    luckyColor: "햇살 노랑",
    luckyAction: "미뤄둔 일 10분 시작하기",
    acorn: "황금 도토리",
    utangMessage: "도토리도 처음엔 작은 한 알이었어. 오늘은 네가 먼저 한 걸음!",
  },
  {
    id: "slow-and-steady",
    title: "천천히 가도 좋은 날",
    message:
      "서두르지 않아도 괜찮아요. 오늘은 속도보다 방향을 살피면 놓쳤던 좋은 마음을 발견할 수 있어요.",
    luckyColor: "크림 베이지",
    luckyAction: "따뜻한 차 한 잔 마시기",
    acorn: "포근한 도토리",
    utangMessage: "우다다도 좋지만 가끔은 사뿐사뿐이 더 멀리 데려다줘.",
  },
  {
    id: "friendly-hello",
    title: "먼저 건넨 인사가 행운이 되는 날",
    message:
      "짧은 인사와 작은 친절이 예상보다 큰 웃음으로 돌아와요. 반가운 마음을 숨기지 마세요.",
    luckyColor: "살구 주황",
    luckyAction: "먼저 안부 묻기",
    acorn: "다정한 도토리",
    utangMessage: "안녕 한마디면 우리 사이에 작은 숲길이 생겨!",
  },
  {
    id: "fresh-idea",
    title: "엉뚱한 생각이 답이 되는 날",
    message:
      "평범한 방법이 막힌다면 조금 장난스러운 방향으로 바라보세요. 오늘의 기발함은 꽤 쓸모가 있어요.",
    luckyColor: "새싹 연두",
    luckyAction: "떠오른 생각 바로 적기",
    acorn: "엉뚱한 도토리",
    utangMessage: "길이 없으면 데구르르 굴러서 새 길을 만들면 되지!",
  },
  {
    id: "good-news",
    title: "반가운 소식이 가까이 온 날",
    message:
      "기다리던 답이나 뜻밖의 연락이 찾아올 수 있어요. 알림을 확인하기 전에 기분 좋은 기대를 품어보세요.",
    luckyColor: "하늘 파랑",
    luckyAction: "고마운 사람에게 답장하기",
    acorn: "소식 도토리",
    utangMessage: "좋은 소식은 발소리가 작아. 귀를 쫑긋 세워보자!",
  },
  {
    id: "rest-is-luck",
    title: "잘 쉬는 것이 행운인 날",
    message:
      "오늘의 빈틈은 게으름이 아니라 충전 시간이에요. 잠깐 멈추면 마음이 다시 가볍게 달릴 준비를 해요.",
    luckyColor: "구름 흰색",
    luckyAction: "화면을 끄고 15분 쉬기",
    acorn: "낮잠 도토리",
    utangMessage: "나무도 밤에는 쉬어. 오늘의 쉼표를 꼭 챙겨!",
  },
  {
    id: "small-discovery",
    title: "가까운 곳에서 보물을 찾는 날",
    message:
      "멀리 가지 않아도 새로운 즐거움이 숨어 있어요. 익숙한 길을 천천히 둘러보면 작은 보물이 보여요.",
    luckyColor: "숲속 초록",
    luckyAction: "동네 한 바퀴 산책하기",
    acorn: "탐험 도토리",
    utangMessage: "보물은 반짝이기보다 조용히 기다리는 경우가 더 많아!",
  },
  {
    id: "confident-choice",
    title: "내 선택을 믿어도 좋은 날",
    message:
      "여러 목소리 사이에서 가장 오래 마음에 남는 생각을 따라가세요. 오늘의 직감은 꽤 정확한 편이에요.",
    luckyColor: "카라멜 브라운",
    luckyAction: "첫 번째 마음을 존중하기",
    acorn: "용기 도토리",
    utangMessage: "네 마음이 고른 길이라면 우땅이가 신나게 응원할게!",
  },
  {
    id: "happy-accident",
    title: "뜻밖의 일이 웃음이 되는 날",
    message:
      "계획과 조금 다르게 흘러가도 당황하지 마세요. 예상 밖의 장면이 오늘의 가장 재미있는 추억이 될 수 있어요.",
    luckyColor: "복숭아 분홍",
    luckyAction: "계획에 여백 하나 남기기",
    acorn: "우다다 도토리",
    utangMessage: "넘어져도 데구르르 한 바퀴 돌면 멋진 묘기가 되지!",
  },
  {
    id: "finish-line",
    title: "마무리에서 빛나는 날",
    message:
      "새로운 시작보다 손에 쥔 일을 하나 끝내보세요. 마지막 점을 찍는 순간 마음에도 시원한 바람이 불어요.",
    luckyColor: "노을 주황",
    luckyAction: "작은 일 하나 완성하기",
    acorn: "완성 도토리",
    utangMessage: "마지막 도토리 한 알까지 담으면 바구니가 든든해져!",
  },
  {
    id: "share-a-smile",
    title: "웃음을 나눌수록 커지는 날",
    message:
      "재미있는 이야기와 귀여운 사진을 혼자 간직하지 마세요. 오늘은 함께 웃을 때 행운도 두 배가 돼요.",
    luckyColor: "레몬 노랑",
    luckyAction: "재미있는 사진 공유하기",
    acorn: "웃음 도토리",
    utangMessage: "웃음은 나눠도 줄지 않고 더 커진대. 정말 신기하지?",
  },
  {
    id: "gentle-heart",
    title: "나에게 다정해야 하는 날",
    message:
      "잘하지 못한 것보다 애쓴 마음을 먼저 바라봐 주세요. 오늘만큼은 스스로에게 가장 따뜻한 친구가 되어주세요.",
    luckyColor: "라일락 보라",
    luckyAction: "오늘 잘한 일 세 가지 적기",
    acorn: "마음 도토리",
    utangMessage: "오늘도 여기까지 온 너, 이미 아주 잘하고 있어!",
  },
] satisfies readonly Fortune[];

const firstFortune = fortunes[0];

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());
}

function randomIndex(max: number) {
  const randomValue = new Uint32Array(1);
  crypto.getRandomValues(randomValue);

  return randomValue[0] % max;
}

function generateLuckyNumbers() {
  const numberPool = Array.from({ length: 45 }, (_, index) => index + 1);

  for (let index = numberPool.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [numberPool[index], numberPool[swapIndex]] = [
      numberPool[swapIndex],
      numberPool[index],
    ];
  }

  return numberPool.slice(0, 6).sort((left, right) => left - right);
}

function isDailyFortune(value: unknown): value is DailyFortune {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DailyFortune>;
  const numbers = candidate.luckyNumbers;

  return (
    typeof candidate.date === "string" &&
    typeof candidate.fortuneId === "string" &&
    fortunes.some((fortune) => fortune.id === candidate.fortuneId) &&
    Array.isArray(numbers) &&
    numbers.length === 6 &&
    new Set(numbers).size === 6 &&
    numbers.every(
      (number) =>
        Number.isInteger(number) && Number(number) >= 1 && Number(number) <= 45,
    )
  );
}

function createDailyFortune(): DailyFortune {
  return {
    date: getTodayKey(),
    fortuneId: fortunes[randomIndex(fortunes.length)].id,
    luckyNumbers: generateLuckyNumbers(),
  };
}

function getDailyFortune() {
  const today = getTodayKey();

  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (storedValue) {
      const parsedValue: unknown = JSON.parse(storedValue);

      if (isDailyFortune(parsedValue) && parsedValue.date === today) {
        return parsedValue;
      }
    }
  } catch {
    // 브라우저가 저장 공간 접근을 막아도 새 운세는 정상적으로 만든다.
  }

  const dailyFortune = createDailyFortune();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyFortune));
  } catch {
    // 저장 공간을 사용할 수 없어도 현재 운세는 정상적으로 보여준다.
  }

  return dailyFortune;
}

export function FortuneExperience() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(true);
  const [result, setResult] = useState<DailyFortune | null>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawingTimerRef = useRef<number | null>(null);

  const selectedFortune =
    fortunes.find((fortune) => fortune.id === result?.fortuneId) ?? firstFortune;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (drawingTimerRef.current !== null) {
        window.clearTimeout(drawingTimerRef.current);
      }
    };
  }, []);

  function openFortune() {
    const dailyFortune = getDailyFortune();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (drawingTimerRef.current !== null) {
      window.clearTimeout(drawingTimerRef.current);
    }

    setResult(dailyFortune);
    setIsDrawing(true);
    setIsOpen(true);

    drawingTimerRef.current = window.setTimeout(
      () => {
        setIsDrawing(false);
        drawingTimerRef.current = null;
      },
      reduceMotion ? 0 : 1050,
    );
  }

  function closeFortune() {
    if (drawingTimerRef.current !== null) {
      window.clearTimeout(drawingTimerRef.current);
      drawingTimerRef.current = null;
    }

    setIsOpen(false);
    window.requestAnimationFrame(() => openButtonRef.current?.focus());
  }

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        className="fortune-button"
        onClick={openFortune}
        aria-haspopup="dialog"
      >
        <span className="fortune-acorn" aria-hidden="true">
          🌰
        </span>
        <span className="fortune-label">우땅점술소</span>
        <span className="fortune-star" aria-hidden="true">
          ✨
        </span>
      </button>

      {isOpen && (
        <div
          className="fortune-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeFortune();
            }
          }}
        >
          <section
            className="fortune-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fortune-modal-title"
            aria-describedby="fortune-modal-description"
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="fortune-modal-close"
              onClick={closeFortune}
              aria-label="우땅점술소 닫기"
            >
              ×
            </button>

            <div className="fortune-modal-heading">
              <span className="fortune-modal-mascot" aria-hidden="true">
                🐵
              </span>
              <div>
                <p>{getTodayLabel()}</p>
                <h2 id="fortune-modal-title">우땅점술소</h2>
              </div>
            </div>

            {isDrawing ? (
              <div
                className="fortune-drawing"
                id="fortune-modal-description"
                aria-live="polite"
              >
                <div className="fortune-drawing-acorns" aria-hidden="true">
                  <span>🌰</span>
                  <span>🌰</span>
                  <span>🌰</span>
                </div>
                <strong>오늘의 도토리를 고르는 중...</strong>
                <p>우땅이가 행운이 가득한 도토리를 찾고 있어요.</p>
              </div>
            ) : (
              <div
                className="fortune-result"
                id="fortune-modal-description"
                aria-live="polite"
              >
                <p className="fortune-result-kicker">🌰 오늘의 도토리</p>
                <h3>{selectedFortune.title}</h3>
                <p className="fortune-result-message">
                  {selectedFortune.message}
                </p>

                <div className="fortune-detail-grid">
                  <div>
                    <span aria-hidden="true">🎨</span>
                    <small>행운의 색</small>
                    <strong>{selectedFortune.luckyColor}</strong>
                  </div>
                  <div>
                    <span aria-hidden="true">🍀</span>
                    <small>추천 행동</small>
                    <strong>{selectedFortune.luckyAction}</strong>
                  </div>
                  <div>
                    <span aria-hidden="true">🌳</span>
                    <small>행운의 도토리</small>
                    <strong>{selectedFortune.acorn}</strong>
                  </div>
                </div>

                <div className="fortune-lucky-numbers">
                  <div>
                    <span>LUCKY NUMBERS</span>
                    <strong>우땅이의 행운 번호</strong>
                  </div>
                  <ol aria-label="1부터 45 사이의 행운 번호 6개">
                    {result?.luckyNumbers.map((number) => (
                      <li key={number}>{number}</li>
                    ))}
                  </ol>
                </div>

                <blockquote>
                  <span aria-hidden="true">🐵</span>
                  <div>
                    <small>우땅 한마디</small>
                    <p>&ldquo;{selectedFortune.utangMessage}&rdquo;</p>
                  </div>
                </blockquote>

                <p className="fortune-daily-note">
                  오늘은 다시 열어도 같은 운세가 보여요. 내일 새로운 도토리를
                  만나러 오세요!
                </p>
                <p className="fortune-disclaimer">
                  행운 번호는 재미로 뽑은 무작위 번호이며 당첨을 보장하지 않아요.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
