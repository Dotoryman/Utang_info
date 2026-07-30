"use client";

import { useEffect, useRef } from "react";

import styles from "./Community.module.css";

type CommunitySuccessModalProps = {
  isOpen: boolean;
  message: string;
  onComplete: () => void;
};

const AUTO_CLOSE_DELAY_MS = 1_500;

export function CommunitySuccessModal({
  isOpen,
  message,
  onComplete,
}: CommunitySuccessModalProps) {
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      onCompleteRef.current();
    }, AUTO_CLOSE_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.successBackdrop}>
      <section
        className={styles.successModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="community-success-title"
        aria-describedby="community-success-description"
      >
        <span className={styles.successAcorn} aria-hidden="true">
          🌰
        </span>
        <p className={styles.successEyebrow}>UTANG SAYS</p>
        <h2 id="community-success-title">{message}</h2>
        <p id="community-success-description">
          잠시 후 우땅 광장으로 이동해요.
        </p>

        <button
          type="button"
          className={styles.successButton}
          onClick={() => onCompleteRef.current()}
        >
          광장으로 가기
          <span aria-hidden="true">→</span>
        </button>

        <span className={styles.successProgress} aria-hidden="true" />
      </section>
    </div>
  );
}
