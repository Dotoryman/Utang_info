"use client";

import { useEffect, useRef } from "react";

import styles from "./Admin.module.css";

type AdminDeleteConfirmModalProps = {
  userNickname: string | null;
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

type AdminStatusModalProps = {
  isOpen: boolean;
  icon: string;
  title: string;
  message: string;
  onClose: () => void;
};

export function AdminDeleteConfirmModal({
  userNickname,
  isProcessing,
  onCancel,
  onConfirm,
}: AdminDeleteConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const isOpen = Boolean(userNickname);

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
      className={styles.modalBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isProcessing) {
          onCancel();
        }
      }}
    >
      <section
        className={styles.actionModal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-delete-title"
        aria-describedby="admin-delete-description"
      >
        <span className={styles.modalIcon} aria-hidden="true">
          🍂
        </span>
        <p className={styles.modalEyebrow}>RESIDENT MANAGEMENT</p>
        <h2 id="admin-delete-title">
          {userNickname} 주민을 삭제하겠숭?
        </h2>
        <p id="admin-delete-description">
          작성한 이야기와 댓글, 좋아요, 알림도 함께 삭제되며 되돌릴 수
          없어요.
        </p>

        <div className={styles.modalActions}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.modalCancelButton}
            onClick={onCancel}
            disabled={isProcessing}
          >
            취소하기
          </button>
          <button
            type="button"
            className={styles.modalDeleteButton}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "삭제하는 중..." : "주민 삭제하기"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function AdminStatusModal({
  isOpen,
  icon,
  title,
  message,
  onClose,
}: AdminStatusModalProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    buttonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.modalBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={styles.actionModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-status-title"
      >
        <span className={styles.modalIcon} aria-hidden="true">
          {icon}
        </span>
        <p className={styles.modalEyebrow}>UTANG SAYS</p>
        <h2 id="admin-status-title">{title}</h2>
        <p>{message}</p>
        <button
          ref={buttonRef}
          type="button"
          className={styles.modalConfirmButton}
          onClick={onClose}
        >
          확인했숭
        </button>
      </section>
    </div>
  );
}
