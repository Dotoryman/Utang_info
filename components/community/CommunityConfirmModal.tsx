"use client";

import { useEffect, useRef } from "react";

import styles from "./Community.module.css";

type CommunityConfirmModalProps = {
  isOpen: boolean;
  isProcessing?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function CommunityConfirmModal({
  isOpen,
  isProcessing = false,
  onCancel,
  onConfirm,
}: CommunityConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isProcessing) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isProcessing, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.successBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isProcessing) {
          onCancel();
        }
      }}
    >
      <section
        className={styles.confirmModal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="community-confirm-title"
        aria-describedby="community-confirm-description"
      >
        <span className={styles.confirmIcon} aria-hidden="true">
          🍂
        </span>
        <p className={styles.successEyebrow}>WAIT A MOMENT</p>
        <h2 id="community-confirm-title">
          이 이야기를 정말 삭제할까요?
        </h2>
        <p id="community-confirm-description">
          삭제한 이야기는 다시 되돌릴 수 없어요.
        </p>

        <div className={styles.confirmActions}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.confirmCancel}
            onClick={onCancel}
            disabled={isProcessing}
          >
            조금 더 생각하기
          </button>
          <button
            type="button"
            className={styles.confirmDelete}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "삭제하는 중..." : "삭제하기"}
          </button>
        </div>
      </section>
    </div>
  );
}
