"use client";

import { useEffect, useRef } from "react";

import styles from "./AuthStatusModal.module.css";

type AuthStatusModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthStatusModal({
  isOpen,
  onClose,
}: AuthStatusModalProps) {
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
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={styles.modal}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="auth-status-title"
      >
        <span className={styles.icon} aria-hidden="true">
          🙈
        </span>
        <h2 id="auth-status-title">잠시 나가지 못했숭</h2>
        <p>로그아웃 처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.</p>
        <button
          ref={buttonRef}
          type="button"
          className={styles.button}
          onClick={onClose}
        >
          확인했숭
        </button>
      </section>
    </div>
  );
}
