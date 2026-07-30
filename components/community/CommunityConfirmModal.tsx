"use client";

import { useEffect, useRef } from "react";

import styles from "./Community.module.css";

type CommunityConfirmModalProps = {
  isOpen: boolean;
  isProcessing?: boolean;
  eyebrow?: string;
  icon?: string;
  title?: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  processingLabel?: string;
  confirmTone?: "danger" | "primary";
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export function CommunityConfirmModal({
  isOpen,
  isProcessing = false,
  eyebrow = "WAIT A MOMENT",
  icon = "🍂",
  title = "이 이야기를 정말 삭제할까요?",
  description = "삭제한 이야기는 다시 되돌릴 수 없어요.",
  cancelLabel = "조금 더 생각하기",
  confirmLabel = "삭제하기",
  processingLabel = "삭제하는 중...",
  confirmTone = "danger",
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
          {icon}
        </span>
        <p className={styles.successEyebrow}>{eyebrow}</p>
        <h2 id="community-confirm-title">
          {title}
        </h2>
        <p id="community-confirm-description">
          {description}
        </p>

        <div className={styles.confirmActions}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.confirmCancel}
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={
              confirmTone === "primary"
                ? styles.confirmPrimary
                : styles.confirmDelete
            }
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? processingLabel : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
