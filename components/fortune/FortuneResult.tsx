"use client";

import { useEffect, useState } from "react";

import styles from "./Fortune.module.css";
import {
  createFortuneImage,
  downloadFortuneImage,
  getFortuneCharacterImage,
} from "./fortuneImage";
import type { DailyFortune, Fortune } from "./fortuneTypes";

type FortuneResultProps = {
  dateLabel: string;
  fortune: Fortune;
  result: DailyFortune;
};

function createFortuneFile(imageBlob: Blob, date: string) {
  return new File([imageBlob], `utang-fortune-${date}.png`, {
    type: "image/png",
  });
}

function canUseNativeImageShare(file: File) {
  return (
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  );
}

function isMobileDevice() {
  return (
    navigator.maxTouchPoints > 0 &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

export function FortuneResult({
  dateLabel,
  fortune,
  result,
}: FortuneResultProps) {
  const characterImage = getFortuneCharacterImage(fortune.id);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [shareStatus, setShareStatus] = useState(
    "공유용 운세 카드를 준비하고 있어요.",
  );
  const [usesMobileShareSheet, setUsesMobileShareSheet] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    createFortuneImage(result, fortune, dateLabel)
      .then((blob) => {
        if (isCurrent) {
          setImageBlob(blob);
          setUsesMobileShareSheet(
            isMobileDevice() && canUseNativeImageShare(createFortuneFile(blob, result.date)),
          );
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

  async function saveImage() {
    if (!imageBlob) {
      return;
    }

    const file = createFortuneFile(imageBlob, result.date);

    if (isMobileDevice() && canUseNativeImageShare(file)) {
      try {
        await navigator.share({ files: [file] });
        setShareStatus("사진 저장 메뉴를 완료했어요.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setShareStatus("사진 저장을 취소했어요.");
          return;
        }
      }
    }

    downloadFortuneImage(imageBlob, result.date);
    setShareStatus("운세 이미지를 저장했어요.");
  }

  async function shareImage() {
    if (!imageBlob) {
      return;
    }

    const file = createFortuneFile(imageBlob, result.date);

    try {
      if (canUseNativeImageShare(file)) {
        await navigator.share({
          files: [file],
          title: "우땅점술소 오늘의 운세",
        });
        setShareStatus("공유를 완료했어요.");
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
      <div className={styles.resultIntro}>
        <img className={styles.resultCharacter} src={characterImage} alt="" />
        <div>
          <p className={styles.kicker}>🌰 오늘의 도토리</p>
          <h3>{fortune.title}</h3>
          <p className={styles.message}>{fortune.message}</p>
        </div>
      </div>

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
        <img
          className={styles.numbersCharacter}
          src="/images/utang-party.png"
          alt=""
        />
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
        <img className={styles.quoteCharacter} src="/images/utang-face.png" alt="" />
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
          {usesMobileShareSheet ? "사진 앱에 저장" : "이미지로 저장"}
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={shareImage}
          disabled={!imageBlob}
        >
          카카오톡 등으로 공유
        </button>
      </div>

      <p className={styles.shareStatus} aria-live="polite">
        {shareStatus}
      </p>
      {usesMobileShareSheet ? (
        <p className={styles.mobileShareHint}>
          기기의 공유 창에서 사진 저장 또는 카카오톡을 선택해 주세요.
        </p>
      ) : null}
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
