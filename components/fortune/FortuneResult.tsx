"use client";

import { useEffect, useState } from "react";

import styles from "./Fortune.module.css";
import {
  createFortuneImage,
  downloadFortuneImage,
} from "./fortuneImage";
import type { DailyFortune, Fortune } from "./fortuneTypes";

type FortuneResultProps = {
  dateLabel: string;
  fortune: Fortune;
  result: DailyFortune;
};

export function FortuneResult({
  dateLabel,
  fortune,
  result,
}: FortuneResultProps) {
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [shareStatus, setShareStatus] = useState(
    "공유용 운세 카드를 준비하고 있어요.",
  );

  useEffect(() => {
    let isCurrent = true;

    createFortuneImage(result, fortune, dateLabel)
      .then((blob) => {
        if (isCurrent) {
          setImageBlob(blob);
          setShareStatus("공유용 운세 카드가 준비됐어요.");
        }
      })
      .catch(() => {
        if (isCurrent) {
          setShareStatus("이미지를 준비하지 못했어요. 잠시 후 다시 열어주세요.");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [dateLabel, fortune, result]);

  function saveImage() {
    if (!imageBlob) {
      return;
    }

    downloadFortuneImage(imageBlob, result.date);
    setShareStatus("운세 이미지를 저장했어요.");
  }

  async function shareImage() {
    if (!imageBlob) {
      return;
    }

    const file = new File([imageBlob], `utang-fortune-${result.date}.png`, {
      type: "image/png",
    });

    try {
      if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "우땅점술소 오늘의 운세",
          text: "우땅이가 골라준 오늘의 도토리를 확인해 보세요!",
        });
        setShareStatus("운세 이미지를 공유했어요.");
        return;
      }

      downloadFortuneImage(imageBlob, result.date);
      setShareStatus("이 기기에서는 공유 대신 이미지를 저장했어요.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setShareStatus("공유를 취소했어요.");
        return;
      }

      downloadFortuneImage(imageBlob, result.date);
      setShareStatus("공유 대신 운세 이미지를 저장했어요.");
    }
  }

  return (
    <div className={styles.result} id="fortune-modal-description" aria-live="polite">
      <p className={styles.kicker}>🌰 오늘의 도토리</p>
      <h3>{fortune.title}</h3>
      <p className={styles.message}>{fortune.message}</p>

      <div className={styles.detailGrid}>
        <div>
          <span aria-hidden="true">🎨</span>
          <small>행운의 색</small>
          <strong>{fortune.luckyColor}</strong>
        </div>
        <div>
          <span aria-hidden="true">🍀</span>
          <small>추천 행동</small>
          <strong>{fortune.luckyAction}</strong>
        </div>
        <div>
          <span aria-hidden="true">🌳</span>
          <small>행운의 도토리</small>
          <strong>{fortune.acorn}</strong>
        </div>
      </div>

      <div className={styles.numbers}>
        <div>
          <span>LUCKY NUMBERS</span>
          <strong>우땅이의 행운 번호</strong>
        </div>
        <ol aria-label="1부터 45 사이의 행운 번호 6개">
          {result.luckyNumbers.map((number) => (
            <li key={number}>{number}</li>
          ))}
        </ol>
      </div>

      <blockquote className={styles.quote}>
        <span aria-hidden="true">🐵</span>
        <div>
          <small>우땅 한마디</small>
          <p>&ldquo;{fortune.utangMessage}&rdquo;</p>
        </div>
      </blockquote>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={saveImage}
          disabled={!imageBlob}
        >
          이미지로 저장
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={shareImage}
          disabled={!imageBlob}
        >
          공유하기
        </button>
      </div>

      <p className={styles.shareStatus} aria-live="polite">
        {shareStatus}
      </p>
      <p className={styles.dailyNote}>
        오늘은 다시 열어도 같은 운세가 보여요. 내일 새로운 도토리를 만나러
        오세요!
      </p>
      <p className={styles.disclaimer}>
        행운 번호는 재미로 뽑은 무작위 번호이며 당첨을 보장하지 않아요.
      </p>
    </div>
  );
}
