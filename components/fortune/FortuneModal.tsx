import type { RefObject } from "react";

import styles from "./Fortune.module.css";
import { FortuneResult } from "./FortuneResult";
import type { DailyFortune, Fortune } from "./fortuneTypes";

type FortuneModalProps = {
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  dateLabel: string;
  fortune: Fortune;
  isDrawing: boolean;
  modalRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  result: DailyFortune;
};

export function FortuneModal({
  closeButtonRef,
  dateLabel,
  fortune,
  isDrawing,
  modalRef,
  onClose,
  result,
}: FortuneModalProps) {
  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fortune-modal-title"
        aria-describedby="fortune-modal-description"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="우땅점술소 닫기"
        >
          ×
        </button>

        <div className={styles.modalBody}>
          <div className={styles.heading}>
            <span className={styles.mascot} aria-hidden="true">
              <img src="/images/utang-sun.png" alt="" />
            </span>
            <div>
              <p>{dateLabel}</p>
              <h2 id="fortune-modal-title">우땅점술소</h2>
            </div>
          </div>

          {isDrawing ? (
            <div
              className={styles.drawing}
              id="fortune-modal-description"
              aria-live="polite"
            >
              <img
                className={styles.drawingCharacter}
                src="/images/utang-dance.png"
                alt=""
              />
              <div className={styles.drawingAcorns} aria-hidden="true">
                <span>🌰</span>
                <span>🌰</span>
                <span>🌰</span>
              </div>
              <strong>오늘의 도토리를 고르는 중...</strong>
              <p>우땅이가 행운이 가득한 도토리를 찾고 있어요.</p>
            </div>
          ) : (
            <FortuneResult
              dateLabel={dateLabel}
              fortune={fortune}
              result={result}
            />
          )}
        </div>
      </section>
    </div>
  );
}
